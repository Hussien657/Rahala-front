import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import TranslatableText from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Heart,
  MessageCircle,
  Copy,
  MapPin,
  Calendar,
  Star,
  Clock,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import TourismInfoCard from './TourismInfoCard';

interface Trip {
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
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  // معلومات AI السياحية
  tourismInfo?: {
    description: string;
    recommended_places: string[];
    warnings: string[];
    best_time_to_visit: string;
    local_tips: string[];
    currency: string;
    language: string;
  };
  country?: string;
  city?: string;
}

interface TripCardProps {
  trip: Trip;
}

const TripCard = ({ trip }: TripCardProps) => {
  const [isLiked, setIsLiked] = useState(trip.isLiked);
  const [likesCount, setLikesCount] = useState(trip.likes);
  const [copied, setCopied] = useState(false);
  const { direction, t } = useLanguage();

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    // Here you would typically make an API call to update the like status
    // For now, we'll just show a toast message
    if (!isLiked) {
      toast.success(t('tripCard.likedTrip', 'Trip liked!'));
    } else {
      toast.success(t('tripCard.unlikedTrip', 'Trip unliked!'));
    }
  };

  const handleCopy = async () => {
    try {
      const tripUrl = `${window.location.origin}/trip/${trip.id}`;
      await navigator.clipboard.writeText(tripUrl);
      setCopied(true);
      toast.success(t('tripCard.linkCopied', 'Link copied to clipboard!'));
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('tripCard.copyFailed', 'Failed to copy link'));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(
        direction === 'rtl' ? 'ar-EG' : 'en-US',
        { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }
      );
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300" dir={direction}>
      {/* Trip Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={trip.images[0] || 'https://via.placeholder.com/800x600?text=Trip'}
          alt={trip.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            {trip.category}
          </Badge>
        </div>
        {trip.rating > 0 && (
          <div className="absolute top-4 right-4 flex items-center bg-white/90 rounded-full px-2 py-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-xs font-medium ml-1">{trip.rating}</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Author Info */}
        <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3 mb-3`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={trip.author.avatar} alt={trip.author.name} />
            <AvatarFallback>
              {trip.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Link 
              to={`/profile/${trip.author.id}`}
              className="font-medium text-sm hover:text-primary transition-colors"
            >
              {trip.author.name}
            </Link>
            <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1 text-xs text-gray-500`}>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(trip.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Trip Info */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
            {trip.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
            {trip.description}
          </p>
          
          <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4 text-sm text-gray-500`}>
            <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
              <MapPin className="h-3 w-3" />
              <span>{trip.location.city}, {trip.location.country}</span>
            </div>
            {trip.duration !== '—' && (
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                <Clock className="h-3 w-3" />
                <span>{trip.duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tourism AI Info Card */}
        {trip.tourismInfo && (
          <div className="mb-4">
            <TourismInfoCard 
              tourismInfo={trip.tourismInfo}
              country={trip.country || trip.location.country}
              city={trip.city || trip.location.city}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex items-center justify-between pt-3 border-t border-gray-100`}>
          <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4`}>
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeToggle}
              className={`${direction === 'rtl' ? 'flex-row-reverse' : ''} flex items-center space-x-1 hover:bg-red-50 hover:text-red-600 transition-colors ${
                isLiked ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              <Heart 
                className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} 
              />
              <span className="text-sm font-medium">{likesCount}</span>
            </Button>

            {/* Comments Button */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={`${direction === 'rtl' ? 'flex-row-reverse' : ''} flex items-center space-x-1 hover:bg-blue-50 hover:text-blue-600 transition-colors text-gray-600`}
            >
              <Link to={`/trip/${trip.id}#comments`}>
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{trip.comments}</span>
              </Link>
            </Button>
          </div>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className={`${direction === 'rtl' ? 'flex-row-reverse' : ''} flex items-center space-x-1 hover:bg-green-50 hover:text-green-600 transition-colors text-gray-600`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">
                  <TranslatableText staticKey="tripCard.copied">Copied</TranslatableText>
                </span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="text-sm font-medium">
                  <TranslatableText staticKey="tripCard.copy">Copy</TranslatableText>
                </span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
