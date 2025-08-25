import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { MapPin, Camera, Users, UserPlus, UserCheck, Shield, Star, Heart } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (isLoading) return;

    const next = !isFollowing;
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompact) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
        <CardContent className="p-4">
          <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2 mb-1`}>
                <Link
                  to={`/profile/${user.id}`}
                  className="font-semibold hover:text-primary transition-colors truncate text-gray-900"
                >
                  {user.name}
                </Link>
                {user.subscription_status?.is_active && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs bg-primary/10 text-primary border-primary/20">
                    <Shield className="h-3 w-3 mr-1" />
                    <TranslatableText staticKey="userCard.premium" fallback="Premium">Premium</TranslatableText>
                  </Badge>
                )}
              </div>
              {user.location && (
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1 text-sm text-muted-foreground mb-1`}>
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{user.location}</span>
                </div>
              )}
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4 text-xs text-muted-foreground`}>
                <div className="flex items-center space-x-1">
                  <Camera className="h-3 w-3" />
                  <span className="font-medium">{user.tripsCount}</span>
                  <TranslatableText staticKey="userCard.trips">trips</TranslatableText>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span className="font-medium">{followersCount}</span>
                  <TranslatableText staticKey="userCard.followers">followers</TranslatableText>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
              disabled={isLoading}
              className={`transition-all duration-300 ${isFollowing ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg'} min-w-[80px]`}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-1" />
                  <TranslatableText staticKey="userCard.following">Following</TranslatableText>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  <TranslatableText staticKey="userCard.follow">Follow</TranslatableText>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group bg-gradient-to-br from-white to-gray-50/50">
      {/* Cover Image or Gradient Background */}
      <div className="h-28 relative overflow-hidden">
        {user.coverImage ? (
          <img
            src={user.coverImage}
            alt={`${user.name}'s cover`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary via-accent to-primary/80 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10" />
            <div className="absolute top-2 right-2">
              <Star className="h-4 w-4 text-white/70" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <CardContent className="p-6 relative">
        {/* Avatar */}
        <div className="flex flex-col items-center -mt-12 mb-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-white shadow-xl ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="text-center space-y-3">
          <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
            <Link
              to={`/profile/${user.id}`}
              className="font-bold text-xl hover:text-primary transition-colors text-gray-900"
            >
              {user.name}
            </Link>
            {user.subscription_status?.is_active && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white" className="bg-primary/10 text-primary border-primary/20">
                <Shield className="h-3 w-3 mr-1" />
                <TranslatableText staticKey="userCard.premium" fallback="Premium">Premium</TranslatableText>
              </Badge>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 px-2" dir={direction}>
              {user.bio}
            </p>
          )}

          {user.location && (
            <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1 text-sm text-muted-foreground`}>
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">{user.location}</span>
            </div>
          )}

          {/* Stats */}
          <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-8 py-3`}>
            <div className="text-center group/stat cursor-pointer">
              <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1 mb-1`}>
                <div className="p-2 rounded-full bg-primary/10 group-hover/stat:bg-primary/20 transition-colors">
                  <Camera className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="font-bold text-lg text-gray-900">{user.tripsCount}</div>
              <span className="text-xs text-muted-foreground font-medium">
                <TranslatableText staticKey="userCard.trips">Trips</TranslatableText>
              </span>
            </div>
            <div className="text-center group/stat cursor-pointer">
              <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1 mb-1`}>
                <div className="p-2 rounded-full bg-accent/10 group-hover/stat:bg-accent/20 transition-colors">
                  <Users className="h-4 w-4 text-accent" />
                </div>
              </div>
              <div className="font-bold text-lg text-gray-900">{followersCount}</div>
              <span className="text-xs text-muted-foreground font-medium">
                <TranslatableText staticKey="userCard.followers">Followers</TranslatableText>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3 pt-2`}>
            <Button
              className={`flex-1 transition-all duration-300 ${isFollowing
                ? 'bg-white border-2 border-primary text-primary hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg text-white'
                }`}
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  <TranslatableText staticKey="userCard.following">Following</TranslatableText>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  <TranslatableText staticKey="userCard.follow">Follow</TranslatableText>
                </>
              )}
            </Button>
            <Button variant="outline" asChild className="border-2 hover:bg-primary/5 hover:border-primary transition-all duration-300">
              <Link to={`/profile/${user.id}`}>
                <Heart className="h-4 w-4 mr-2" />
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
