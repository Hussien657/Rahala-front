import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { notificationManager } from '@/services/NotificationManager';
import type { NotificationItem } from '@/store/interactionsApi';

interface NotificationContextType {
    unreadCount: number;
    isConnected: boolean;
    recentNotifications: NotificationItem[];
    connectWebSocket: () => Promise<void>;
    disconnectWebSocket: () => void;
    markAsRead: (notificationId: number) => void;
    markAllAsRead: () => void;
    refreshUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
    
    // Get auth state from Redux
    const { accessToken, user } = useSelector((state: RootState) => state.auth);

    const connectWebSocket = useCallback(async () => {
        if (!accessToken || !user) {
            console.log('No auth token or user, skipping WebSocket connection');
            return;
        }

        try {
            await notificationManager.connect();
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
        }
    }, [accessToken, user]);

    const disconnectWebSocket = useCallback(() => {
        notificationManager.disconnect();
    }, []);

    const markAsRead = useCallback((notificationId: number) => {
        notificationManager.markAsRead(notificationId);
        
        // Optimistically update local state
        setRecentNotifications(prev => 
            prev.map(notif => 
                notif.id === notificationId 
                    ? { ...notif, is_read: true }
                    : notif
            )
        );
        
        // Update unread count optimistically
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(() => {
        notificationManager.markAllAsRead();
        
        // Optimistically update local state
        setRecentNotifications(prev => 
            prev.map(notif => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
    }, []);

    const refreshUnreadCount = useCallback(() => {
        notificationManager.getUnreadCount();
    }, []);

    useEffect(() => {
        // Set up WebSocket event listeners
        notificationManager.setListeners({
            onInitialNotifications: (notifications, count) => {
                setRecentNotifications(notifications);
                setUnreadCount(count);
            },
            onNewNotification: (notification) => {
                setRecentNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep only 20 recent
                if (!notification.is_read) {
                    setUnreadCount(prev => prev + 1);
                }
            },
            onUnreadCountUpdate: (count) => {
                setUnreadCount(count);
            },
            onConnectionChange: (connected) => {
                setIsConnected(connected);
            }
        });

        // Auto-connect if user is authenticated
        if (accessToken && user) {
            connectWebSocket();
        }

        // Cleanup on unmount
        return () => {
            disconnectWebSocket();
        };
    }, [accessToken, user, connectWebSocket, disconnectWebSocket]);

    // Reconnect when auth state changes
    useEffect(() => {
        if (accessToken && user && !isConnected) {
            connectWebSocket();
        } else if (!accessToken && isConnected) {
            disconnectWebSocket();
        }
    }, [accessToken, user, isConnected, connectWebSocket, disconnectWebSocket]);

    const value: NotificationContextType = {
        unreadCount,
        isConnected,
        recentNotifications,
        connectWebSocket,
        disconnectWebSocket,
        markAsRead,
        markAllAsRead,
        refreshUnreadCount,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
