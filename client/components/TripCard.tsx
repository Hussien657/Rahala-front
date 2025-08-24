import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MapPin, Star, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { useGetTripStatsQuery, useLikeTripMutation, useUnlikeTripMutation } from '@/store/interactionsApi';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from './TranslatableText';

interface TripCardProps {
  trip: {
    id: string;
    title: string;
    description: string;
    images: string[];
    location: {
      country: string;
      city: string;
    };
    category: string;
    rating: number;
    duration: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
      hasVerifiedBadge?: boolean;
    };
    likes: number;
    comments: number;
    isLiked?: boolean;
    createdAt: string;
  };
  variant?: 'default' | 'compact';
}

const TripCard = ({ trip, variant = 'default' }: TripCardProps) => {
  const isCompact = variant === 'compact';
  const [isLiked, setIsLiked] = useState(trip.isLiked || false);
  const [likesCount, setLikesCount] = useState(trip.likes);
  const [commentsCount, setCommentsCount] = useState(trip.comments);

  const { data: stats } = useGetTripStatsQuery(Number(trip.id) || trip.id);
  const { direction, t } = useLanguage();

  const [likeTrip, { isLoading: likeLoading }] = useLikeTripMutation();
  const [unlikeTrip, { isLoading: unlikeLoading }] = useUnlikeTripMutation();

  const handleLike = async () => {
    const tripNumericId = Number(trip.id);
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (nextLiked) {
        await likeTrip({ trip_id: tripNumericId }).unwrap();
      } else {
        await unlikeTrip({ trip_id: tripNumericId }).unwrap();
      }
    } catch (e) {
      setIsLiked(!nextLiked);
      setLikesCount(prev => !nextLiked ? prev + 1 : Math.max(0, prev - 1));
      console.error('Failed to toggle like', e);
    }
  };

  useEffect(() => {
    if (stats) {
      setIsLiked(stats.is_liked);
      setLikesCount(stats.likes_count);
      setCommentsCount(stats.comments_count);
    }
  }, [stats]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: trip.title,
        text: trip.description,
        url: `/trip/${trip.id}`
      });
    } else {
      navigator.clipboard.writeText(`${t('tripCard.checkOutTrip', 'Check out this amazing trip:')} ${trip.title} - ${window.location.origin}/trip/${trip.id}`);
      toast({
        title: t('tripCard.copied', 'Copied'),
        description: t('tripCard.linkCopied', 'Link copied to clipboard.')
      });
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-lg transition-shadow",
      trip.author.hasVerifiedBadge
        ? 'border-2 border-yellow-500 animate-glow'
        : 'border-gray-200'
    )}>
      <div className={cn("relative overflow-hidden", isCompact ? "h-48" : "h-64")}>
        <img
          src={trip.images[0]}
          alt={trip.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className={`absolute top-3 ${direction === 'rtl' ? 'left-3' : 'right-3'}`}>
          <Badge variant="secondary" className="bg-black/50 text-white border-0">
            {trip.category}
          </Badge>
        </div>
        <div className={`absolute bottom-3 ${direction === 'rtl' ? 'right-3' : 'left-3'} flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1 text-white`}>
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">{trip.location.city}, {trip.location.country}</span>
        </div>
      </div>
      <CardContent className="p-4">
        <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3 mb-3`}>
          <Avatar className={`
            h-8 w-8 border-2
            ${trip.author.hasVerifiedBadge
              ? 'border-yellow-500 animate-glow-avatar'
              : 'border-gray-300'
            }
          `}>
            <AvatarImage src={trip.author.avatar} alt={trip.author.name} />
            <AvatarFallback>{trip.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Link
              to={`/profile/${trip.author.id}`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {trip.author.name}
            </Link>
            <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2 text-xs text-muted-foreground`}>
              <Calendar className="h-3 w-3" />
              <span>{new Date(trip.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Link to={`/trip/${trip.id}`} className="block">
            <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2" dir={direction}>
              {trip.title}
            </h3>
          </Link>
          {!isCompact && (
            <p className="text-muted-foreground text-sm line-clamp-2" dir={direction}>
              {trip.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4`}>
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{trip.rating}</span>
              </div>
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{trip.duration}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t mt-3">
          <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4`}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-0 h-auto font-normal hover:scale-105 transition-transform",
                isLiked ? "text-red-500" : "text-muted-foreground"
              )}
              onClick={handleLike}
              disabled={likeLoading || unlikeLoading}
            >
              <Heart className={cn(`h-4 w-4 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`, isLiked && "fill-current")} />
              {likesCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto font-normal text-muted-foreground hover:text-primary transition-colors"
              asChild
            >
              <Link to={`/trip/${trip.id}`}>
                <MessageCircle className={`h-4 w-4 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                {commentsCount}
              </Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors"
            onClick={handleShare}
          >
            <Share2 className={`h-4 w-4 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
            <TranslatableText staticKey="tripCard.share">Share</TranslatableText>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;