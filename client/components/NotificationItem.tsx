import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, MessageCircle, UserPlus, Camera, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'trip_share' | 'general';
    title: string;
    message: string;
    user?: {
      id: string;
      name: string;
      avatar?: string;
    };
    trip?: {
      id: string;
      title: string;
      image?: string;
    };
    isRead: boolean;
    createdAt: string;
  };
}

const NotificationItem = ({ notification }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'trip_share':
        return <Camera className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionLink = () => {
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'trip_share':
        return notification.trip ? `/trip/${notification.trip.id}` : '#';
      case 'follow':
        return notification.user ? `/profile/${notification.user.id}` : '#';
      default:
        return '#';
    }
  };

  return (
    <Link 
      to={getActionLink()}
      className={cn(
        "block p-4 hover:bg-gray-50 transition-colors border-b",
        !notification.isRead && "bg-blue-50 border-l-4 border-l-primary"
      )}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 p-2 bg-gray-100 rounded-full">
          {getIcon()}
        </div>

        {/* User Avatar (if applicable) */}
        {notification.user && (
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
            <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={cn(
                "text-sm",
                !notification.isRead ? "font-medium" : "font-normal"
              )}>
                <span className="font-medium">{notification.title}</span>
                {notification.message && (
                  <span className="text-muted-foreground ml-1">
                    {notification.message}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Trip thumbnail (if applicable) */}
            {notification.trip?.image && (
              <div className="ml-3 flex-shrink-0">
                <img
                  src={notification.trip.image}
                  alt={notification.trip.title}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {notification.type === 'follow' && (
            <div className="mt-2">
              <Button size="sm" variant="outline">
                Follow Back
              </Button>
            </div>
          )}
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="flex-shrink-0">
            <Badge variant="default" className="h-2 w-2 p-0 rounded-full">
              <span className="sr-only">Unread</span>
            </Badge>
          </div>
        )}
      </div>
    </Link>
  );
};

export default NotificationItem;
