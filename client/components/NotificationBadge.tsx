import React from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import { Link } from 'react-router-dom';
import TranslatableText from './TranslatableText';

interface NotificationBadgeProps {
    className?: string;
    showText?: boolean;
    variant?: 'icon' | 'button';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
    className,
    showText = false,
    variant = 'icon'
}) => {
    const { unreadCount, isConnected } = useNotifications();

    const hasUnread = unreadCount > 0;
    const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();

    if (variant === 'button') {
        return (
            <Link to="/notifications">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("relative", className)}
                >
                    {hasUnread ? (
                        <BellRing className="h-5 w-5" />
                    ) : (
                        <Bell className="h-5 w-5" />
                    )}

                    {showText && (
                        <span className="ml-2">
                            <TranslatableText staticKey="nav.notifications">Notifications</TranslatableText>
                        </span>
                    )}

                    {hasUnread && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
                        >
                            {displayCount}
                        </Badge>
                    )}

                    {/* Connection indicator */}
                    <div
                        className={cn(
                            "absolute -bottom-1 -right-1 h-2 w-2 rounded-full",
                            isConnected ? "bg-green-500" : "bg-gray-400"
                        )}
                        title={isConnected ? "متصل" : "غير متصل"}
                    />
                </Button>
            </Link>
        );
    }

    return (
        <Link to="/notifications" className={cn("relative inline-block", className)}>
            {hasUnread ? (
                <BellRing className="h-6 w-6 text-primary" />
            ) : (
                <Bell className="h-6 w-6 text-muted-foreground" />
            )}

            {hasUnread && (
                <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
                >
                    {displayCount}
                </Badge>
            )}

            {/* Connection indicator */}
            <div
                className={cn(
                    "absolute -bottom-1 -right-1 h-2 w-2 rounded-full",
                    isConnected ? "bg-green-500" : "bg-gray-400"
                )}
                title={isConnected ? "متصل" : "غير متصل"}
            />
        </Link>
    );
};
