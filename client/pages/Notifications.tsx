import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, UserPlus, Camera, Bell, BellRing, Filter, MoreHorizontal, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetNotificationsQuery, useFollowUserMutation, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '@/store/interactionsApi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'share' | 'general';
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
  onMarkAsRead?: (id: string) => void;
  onFollowBack?: (userId: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onFollowBack }: NotificationItemProps) => {
  const { direction, t } = useLanguage();
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'share':
        return <Camera className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionLink = () => {
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'share':
        return notification.trip ? `/trip/${notification.trip.id}` : '#';
      case 'follow':
        return notification.user ? `/profile/${notification.user.id}` : '#';
      default:
        return '#';
    }
  };

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Link
      to={getActionLink()}
      onClick={handleClick}
      className={cn(
        "block p-4 hover:bg-gray-50 transition-colors border-b",
        !notification.isRead && "bg-blue-50 border-l-4 border-l-primary"
      )}
    >
      <div className={`flex items-start ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`} dir={direction}>
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
          {notification.type === 'follow' && notification.user && (
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFollowBack && onFollowBack(notification.user!.id); }}>
                <TranslatableText staticKey="notifications.followBack">Follow Back</TranslatableText>
              </Button>
            </div>
          )}
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="flex-shrink-0">
            <Badge variant="default" className="h-2 w-2 p-0 rounded-full">
              <span className="sr-only">
                <TranslatableText staticKey="notifications.unread">Unread</TranslatableText>
              </span>
            </Badge>
          </div>
        )}
      </div>
    </Link>
  );
};

const Notifications = () => {
  const { direction, t } = useLanguage();
  const [filter, setFilter] = useState('all');
  type UINotification = NotificationItemProps['notification'];
  const [items, setItems] = useState<UINotification[]>([]);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch, isFetching } = useGetNotificationsQuery({ page });

  const mapToUI = (n: any): UINotification => {
    const sender = n.sender;
    const user = sender
      ? {
        id: String(sender.id),
        name: sender.username ?? sender.email ?? `User ${sender.id}`,
        avatar: undefined,
      }
      : undefined;
    const type = (n.notification_type || 'general') as UINotification['type'];
    const userName = user?.name || t('notifications.someone', 'Someone');
    const titleByType: Record<string, string> = {
      follow: `${userName} ${t('notifications.startedFollowing', 'started following you')}`,
      like: `${userName} ${t('notifications.likedYourTrip', 'liked your trip')}`,
      comment: `${userName} ${t('notifications.commentedOnTrip', 'commented on your trip')}`,
      share: `${userName} ${t('notifications.sharedTrip', 'shared a trip')}`,
      general: t('notifications.notification', 'Notification'),
    };
    return {
      id: String(n.id),
      type: ['like', 'comment', 'follow', 'share'].includes(type as string) ? (type as any) : 'general',
      title: titleByType[type] || t('notifications.notification', 'Notification'),
      message: '',
      user,
      trip: n.trip ? { id: String(n.trip), title: '', image: undefined } : undefined,
      isRead: Boolean(n.is_read),
      createdAt: n.created_at,
    };
  };

  useEffect(() => {
    if (data?.results) {
      setItems(prev => (page === 1 ? data.results.map(mapToUI) : [...prev, ...data.results.map(mapToUI)]));
    }
  }, [data, page]);

  const unreadCount = useMemo(() => items.filter(n => !n.isRead).length, [items]);

  const filteredNotifications = items.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'interactions') return ['like', 'comment'].includes(notification.type);
    if (filter === 'follows') return notification.type === 'follow';
    if (filter === 'trips') return notification.type === 'share';
    return true;
  });

  const [followUser, { isLoading: following }] = useFollowUserMutation();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  const markAsRead = async (id: string) => {
    setItems(prev => prev.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
    try {
      await markNotificationRead({ id: Number(id) }).unwrap();
    } catch (e) {
      // soft-fail: keep UI read state; user can refresh
    }
  };

  const handleFollowBack = async (userId: string) => {
    try {
      await followUser({ user_id: Number(userId) }).unwrap();
      toast({
        title: t('notifications.followed', 'Followed'),
        description: t('notifications.followedDesc', 'You are now following this user.')
      });
    } catch (e) {
      toast({
        title: t('common.error', 'Error'),
        description: t('notifications.followError', 'Failed to follow user. Try again.')
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
              <div className="relative">
                <Bell className="h-8 w-8 text-primary" />
                {unreadCount > 0 && (
                  <Badge className={`absolute -top-2 ${direction === 'rtl' ? '-left-2' : '-right-2'} h-5 w-5 p-0 flex items-center justify-center text-xs`}>
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <TranslatableText staticKey="notifications.title">Notifications</TranslatableText>
                </h1>
                <p className="text-gray-600 mt-1">
                  <TranslatableText staticKey="notifications.subtitle">Stay updated with your travel community</TranslatableText>
                  {unreadCount > 0 && (
                    <span className={`${direction === 'rtl' ? 'mr-2' : 'ml-2'} text-primary font-medium`}>
                      {unreadCount} {unreadCount > 1 ?
                        t('notifications.newNotificationsPlural', 'new notifications') :
                        t('notifications.newNotifications', 'new notification')
                      }
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="w-full grid grid-cols-5">
                <TabsTrigger value="all" className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                  <BellRing className="h-4 w-4" />
                  <span><TranslatableText staticKey="notifications.all">All</TranslatableText></span>
                  <Badge variant="secondary" className={direction === 'rtl' ? 'mr-1' : 'ml-1'}>
                    {items.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  <TranslatableText staticKey="notifications.unread">Unread</TranslatableText>
                  {unreadCount > 0 && (
                    <Badge className={direction === 'rtl' ? 'mr-1' : 'ml-1'}>
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="interactions">
                  <TranslatableText staticKey="notifications.interactions">Interactions</TranslatableText>
                </TabsTrigger>
                <TabsTrigger value="follows">
                  <TranslatableText staticKey="notifications.follows">Follows</TranslatableText>
                </TabsTrigger>
                <TabsTrigger value="trips">
                  <TranslatableText staticKey="notifications.trips">Trips</TranslatableText>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span><TranslatableText staticKey="notifications.recentActivity">Recent Activity</TranslatableText></span>
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} gap-2`}>
                <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
                  <Filter className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  <TranslatableText staticKey="notifications.refresh">Refresh</TranslatableText>
                </Button>
                <Button variant="outline" size="sm" onClick={async () => {
                  // optimistic all-read
                  setItems(prev => prev.map(n => ({ ...n, isRead: true })));
                  try { await markAllNotificationsRead().unwrap(); }
                  catch (e) { toast({ title: t('common.error', 'Error'), description: t('notifications.markAllError', 'Failed to mark all as read.') }); }
                }} disabled={markingAll || unreadCount === 0}>
                  <TranslatableText staticKey="notifications.markAllAsRead">Mark all as read</TranslatableText>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isError && (
              <div className="p-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    <TranslatableText staticKey="notifications.failedToLoad">Failed to load notifications</TranslatableText>
                  </AlertTitle>
                  <AlertDescription>
                    <TranslatableText staticKey="notifications.pleaseRetry">Please try again.</TranslatableText>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            {isLoading ? (
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 bg-gray-100 rounded animate-pulse" />
                <div className="text-center text-sm text-gray-500 mt-4">
                  <TranslatableText staticKey="notifications.loading">Loading...</TranslatableText>
                </div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onFollowBack={handleFollowBack}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  <TranslatableText staticKey="notifications.noNotifications">No notifications</TranslatableText>
                </h3>
                <p className="text-gray-500">
                  {filter === 'unread' ? (
                    <TranslatableText staticKey="notifications.allCaughtUp">You're all caught up! No unread notifications.</TranslatableText>
                  ) : (
                    <TranslatableText staticKey="notifications.whenPeopleInteract">When people interact with your trips, you'll see notifications here.</TranslatableText>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Load More */}
        {Boolean(data?.next) && (
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={isFetching}>
              <MoreHorizontal className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {isFetching ?
                <TranslatableText staticKey="notifications.loading">Loading...</TranslatableText> :
                <TranslatableText staticKey="notifications.loadOlder">Load older notifications</TranslatableText>
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;