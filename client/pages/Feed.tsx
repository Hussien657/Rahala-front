import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import TripCard from '@/components/TripCard';
import UserCard from '@/components/UserCard';
import TranslatableText from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  MapPin,
  TrendingUp,
  Users,
  PlusCircle,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetFeedQuery } from '@/store/feedApi';
import { useGetSuggestedTravelersQuery, useFollowUserMutation, useUnfollowUserMutation } from '@/store/interactionsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Feed = () => {
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { data, isLoading, isError, refetch } = useGetFeedQuery();
  const { data: suggestedData, isLoading: isLoadingSuggested, isError: isErrorSuggested } = useGetSuggestedTravelersQuery();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const { direction, t } = useLanguage();

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 1000);
  };

  const handleFollowToggle = async (userId: string, nextState: boolean) => {
    try {
      if (nextState) {
        await followUser({ user_id: parseInt(userId) }).unwrap();
      } else {
        await unfollowUser({ user_id: parseInt(userId) }).unwrap();
      }
    } catch (error) {
      console.error('Follow toggle failed:', error);
      throw error;
    }
  };

  const categories = [
    'Adventure', 'Beach', 'Culture', 'Nature', 'City', 'Food', 'History', 'Photography'
  ];

  const feedTrips = useMemo(() => {
    const items = data?.results || [];
    return items;
  }, [data]);

  const suggestedUsers = suggestedData?.results || [];

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                <TrendingUp className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">
                  <TranslatableText staticKey="feed.title">Travel Feed</TranslatableText>
                </h1>
              </div>
              <div className="relative">
                <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4`} />
                <input
                  type="text"
                  placeholder={t('feed.searchPlaceholder', 'Search trips...')}
                  className={`${direction === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  dir={direction}
                />
              </div>
            </div>
            <div className="space-y-6">
              {isLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <Skeleton className="h-64 w-full" />
                        <div className="p-4 space-y-3">
                          <Skeleton className="h-6 w-2/3" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    <TranslatableText staticKey="feed.failedToLoadFeed">Failed to load feed</TranslatableText>
                  </AlertTitle>
                  <AlertDescription>
                    <TranslatableText staticKey="feed.pleaseRetryMessage">Please try again.</TranslatableText>
                    <Button size="sm" variant="outline" className={`${direction === 'rtl' ? 'mr-3' : 'ml-3'}`} onClick={() => refetch()}>
                      <TranslatableText staticKey="feed.retry">Retry</TranslatableText>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {(() => {
                const filteredTrips = feedTrips.filter(trip => {
                  if (searchQuery && !trip.caption.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !trip.location.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                  }
                  // Note: FeedItem doesn't have category, so we'll skip category filtering for now
                  return true;
                });

                if (filteredTrips.length === 0 && !isLoading && !isError) {
                  return (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">🗺️</div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        <TranslatableText staticKey="feed.noTripsFound">No trips found</TranslatableText>
                      </h3>
                      <p className="text-gray-500 mb-4">
                        <TranslatableText staticKey="feed.noTripsMessage">Try adjusting your search or filters to find more adventures.</TranslatableText>
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('');
                          setActiveCategory('');
                        }}
                      >
                        <TranslatableText staticKey="feed.clearFilters">Clear Filters</TranslatableText>
                      </Button>
                    </div>
                  );
                }

                return filteredTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ));
              })()}
            </div>
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                <TranslatableText staticKey={isLoadingMore ? 'feed.loading' : 'feed.loadMoreAdventures'}>{isLoadingMore ? 'Loading...' : 'Load More Adventures'}</TranslatableText>
              </Button>
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <Users className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'} text-primary`} />
                  <h3 className="font-semibold">
                    <TranslatableText staticKey="feed.suggestedTravelers">Suggested Travelers</TranslatableText>
                  </h3>
                </div>
                <div className="space-y-4">
                  {isLoadingSuggested && (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {isErrorSuggested && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>
                        <TranslatableText staticKey="feed.failedToLoadSuggested">Failed to load suggested travelers</TranslatableText>
                      </AlertTitle>
                      <AlertDescription>
                        <TranslatableText staticKey="feed.pleaseRetryMessage">Please try again.</TranslatableText>
                      </AlertDescription>
                    </Alert>
                  )}
                  {!isLoadingSuggested && !isErrorSuggested && suggestedUsers.length > 0 && (
                    <>
                      {suggestedUsers.slice(0, 4).map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          variant="compact"
                          onToggleFollow={handleFollowToggle}
                        />
                      ))}
                    </>
                  )}
                  {!isLoadingSuggested && !isErrorSuggested && suggestedUsers.length === 0 && (
                    <div className="text-center py-6">
                      <div className="text-gray-400 text-4xl mb-2">👥</div>
                      <p className="text-sm text-gray-500">
                        <TranslatableText staticKey="feed.noSuggestedTravelers">No suggested travelers at the moment</TranslatableText>
                      </p>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/explore">
                    <TranslatableText staticKey="feed.discoverMore">Discover More</TranslatableText>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;