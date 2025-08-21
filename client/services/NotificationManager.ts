import { store } from '@/store/store';
import { toast } from '@/components/ui/use-toast';
import type { NotificationItem } from '@/store/interactionsApi';

export interface WebSocketNotificationMessage {
    type: 'initial_notifications' | 'new_notification' | 'unread_count_update' | 'unread_count';
    notifications?: NotificationItem[];
    notification?: NotificationItem;
    unread_count?: number;
}

export interface NotificationToastData {
    id: number;
    sender: {
        id: number;
        username: string;
        profile_picture?: string;
    };
    notification_type: 'like' | 'comment' | 'follow' | 'share';
    trip_title?: string;
    comment_content?: string;
    notification_message: string;
    time_ago: string;
    is_read: boolean;
    created_at: string;
}

class NotificationManager {
    private ws: WebSocket | null = null;
    private token: string | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isConnecting = false;
    private listeners: {
        onInitialNotifications?: (notifications: NotificationItem[], unreadCount: number) => void;
        onNewNotification?: (notification: NotificationItem) => void;
        onUnreadCountUpdate?: (count: number) => void;
        onConnectionChange?: (connected: boolean) => void;
    } = {};

    constructor() {
        // Get token from Redux store or localStorage
        this.updateToken();
    }

    private updateToken() {
        const state = store.getState();
        this.token = state.auth.accessToken || localStorage.getItem('accessToken');
    }

    setListeners(listeners: typeof this.listeners) {
        this.listeners = { ...this.listeners, ...listeners };
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
                return;
            }

            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            this.updateToken();
            if (!this.token) {
                reject(new Error('No authentication token available'));
                return;
            }

            this.isConnecting = true;
            const wsUrl = `ws://127.0.0.1:8000/ws/notifications/?token=${this.token}`;
            
            try {
                this.ws = new WebSocket(wsUrl);
                
                this.ws.onopen = () => {
                    console.log('Connected to notifications WebSocket');
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    this.listeners.onConnectionChange?.(true);
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data: WebSocketNotificationMessage = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                this.ws.onclose = (event) => {
                    console.log('Disconnected from notifications WebSocket', event.code, event.reason);
                    this.isConnecting = false;
                    this.listeners.onConnectionChange?.(false);
                    
                    // Only reconnect if it wasn't a manual close
                    if (event.code !== 1000) {
                        this.scheduleReconnect();
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.isConnecting = false;
                    reject(error);
                };

            } catch (error) {
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    private handleMessage(data: WebSocketNotificationMessage) {
        switch (data.type) {
            case 'initial_notifications':
                if (data.notifications && typeof data.unread_count === 'number') {
                    this.listeners.onInitialNotifications?.(data.notifications, data.unread_count);
                }
                break;
            
            case 'new_notification':
                if (data.notification) {
                    this.listeners.onNewNotification?.(data.notification);
                    this.showNotificationToast(data.notification);
                }
                break;
            
            case 'unread_count_update':
            case 'unread_count':
                if (typeof data.unread_count === 'number') {
                    this.listeners.onUnreadCountUpdate?.(data.unread_count);
                }
                break;
        }
    }

    private showNotificationToast(notification: NotificationItem) {
        const getNotificationMessage = (notif: NotificationItem) => {
            const senderName = notif.sender?.username || 'مستخدم';
            const messages = {
                'like': `${senderName} أعجب برحلتك`,
                'comment': `${senderName} علق على رحلتك`,
                'follow': `${senderName} بدأ متابعتك`,
                'share': `${senderName} شارك رحلتك`
            };
            return messages[notif.notification_type] || 'إشعار جديد';
        };

        toast({
            title: "إشعار جديد",
            description: getNotificationMessage(notification),
            duration: 5000,
        });
    }

    markAsRead(notificationId: number) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'mark_as_read',
                notification_id: notificationId
            }));
        }
    }

    markAllAsRead() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'mark_all_as_read'
            }));
        }
    }

    getUnreadCount() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'get_unread_count'
            }));
        }
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            return;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
        
        console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
        
        this.reconnectTimeout = setTimeout(() => {
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            this.connect().catch(error => {
                console.error('Reconnection failed:', error);
            });
        }, delay);
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.close(1000, 'Manual disconnect');
            this.ws = null;
        }
        
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.listeners.onConnectionChange?.(false);
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// Singleton instance
export const notificationManager = new NotificationManager();
