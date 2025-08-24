import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { MapPin, Camera, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from './TranslatableText';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    location?: string;
    tripsCount: number;
    followersCount: number;
    isFollowing?: boolean;
    isVerified?: boolean;
    coverImage?: string;
    subscription_status?: {
      is_active: boolean;
      has_verified_badge: boolean;
      plan?: string;
    };
  };
  variant?: 'default' | 'compact';
  onToggleFollow?: (userId: string, nextState: boolean) => Promise<void> | void;
}

const UserCard = ({ user, variant = 'default', onToggleFollow }: UserCardProps) => {
  const { direction } = useLanguage();
  const isCompact = variant === 'compact';
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(user.followersCount);

  const handleFollow = async () => {
    const next = !isFollowing;
    // optimistic update
    setIsFollowing(next);
    setFollowersCount(prev => next ? prev + 1 : Math.max(0, prev - 1));
    try {
      if (onToggleFollow) {
        await onToggleFollow(user.id, next);
      }
    } catch (e) {
      // revert on failure
      setIsFollowing(!next);
      setFollowersCount(prev => next ? Math.max(0, prev - 1) : prev + 1);
      console.error('Follow toggle failed', e);
    }
  };

  if (isCompact) {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                <Link
                  to={`/profile/${user.id}`}
                  className="font-medium hover:text-primary transition-colors truncate"
                >
                  {user.name}
                </Link>
                {user.subscription_status?.is_active && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                    <TranslatableText staticKey="userCard.premium" fallback="Premium">Premium</TranslatableText>
                  </Badge>
                )}
              </div>
              {user.location && (
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1 text-sm text-muted-foreground`}>
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{user.location}</span>
                </div>
              )}
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3 text-xs text-muted-foreground mt-1`}>
                <span>{user.tripsCount} <TranslatableText staticKey="userCard.trips">trips</TranslatableText></span>
                <span>{followersCount} <TranslatableText staticKey="userCard.followers">followers</TranslatableText></span>
              </div>
            </div>
            <Button
              size="sm"
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
            >
              <TranslatableText staticKey={isFollowing ? "userCard.following" : "userCard.follow"}>
                {isFollowing ? "Following" : "Follow"}
              </TranslatableText>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      {user.coverImage && (
        <div className="h-24 bg-gradient-to-r from-primary to-accent relative overflow-hidden">
          <img
            src={user.coverImage}
            alt={`${user.name}'s cover`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardContent className="p-4 relative">
        {/* Avatar */}
        <div className="flex flex-col items-center -mt-8 mb-4">
          <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        {/* User Info */}
        <div className="text-center space-y-2">
          <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
            <Link
              to={`/profile/${user.id}`}
              className="font-semibold text-lg hover:text-primary transition-colors"
            >
              {user.name}
            </Link>
            {user.subscription_status?.is_active && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <TranslatableText staticKey="userCard.premium" fallback="Premium">Premium</TranslatableText>
              </Badge>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2" dir={direction}>
              {user.bio}
            </p>
          )}

          {user.location && (
            <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1 text-sm text-muted-foreground`}>
              <MapPin className="h-4 w-4" />
              <span>{user.location}</span>
            </div>
          )}

          {/* Stats */}
          <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-6 py-2`}>
            <div className="text-center">
              <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{user.tripsCount}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                <TranslatableText staticKey="userCard.trips">Trips</TranslatableText>
              </span>
            </div>
            <div className="text-center">
              <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{followersCount}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                <TranslatableText staticKey="userCard.followers">Followers</TranslatableText>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2 pt-2`}>
            <Button
              className="flex-1"
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
            >
              <TranslatableText staticKey={isFollowing ? "userCard.following" : "userCard.follow"}>
                {isFollowing ? "Following" : "Follow"}
              </TranslatableText>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/profile/${user.id}`}>
                <TranslatableText staticKey="userCard.viewProfile">View Profile</TranslatableText>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
