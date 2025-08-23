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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Feed = () => {
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useGetFeedQuery({ page });
  const { direction, t } = useLanguage();

  // جمع جميع الرحلات من الصفحات المختلفة
  const allTrips = useMemo(() => {
    if (!data) return [];
    
    // إذا كان لدينا بيانات من صفحات متعددة، نقوم بدمجها
    return data.results || [];
  }, [data]);

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const categories = [
    'Adventure', 'Beach', 'Culture', 'Nature', 'City', 'Food', 'History', 'Photography'
  ];

  const feedTrips = useMemo(() => {
    return allTrips.map((it) => ({
      id: String(it.id),
      title: it.caption,
      description: it.caption,
      images: it.images?.length ? [it.images[0].image!] : ['https://via.placeholder.com/800x600?text=Trip'],
      location: { 
        country: it.country || it.location, 
        city: it.city || it.location 
      },
      category: it.tags?.[0]?.tripTag || 'Trip',
      rating: 5,
      duration: '—',
      author: {
        id: String(it.id),
        name: it.user,
        avatar: undefined,
      },
      likes: 0,
      comments: 0,
      isLiked: false,
      createdAt: it.created_at,
      // إضافة معلومات AI السياحية
      tourismInfo: it.tourism_info,
      country: it.country,
      city: it.city,
    }));
  }, [allTrips]);

  // Mock suggested users
  const suggestedUsers = [
    {
      id: 'suggested1',
      name: 'Sarah Johnson',
      location: 'Paris, France',
      tripsCount: 45,
      followersCount: 3200,
      isFollowing: false
    },
    {
      id: 'suggested2',
      name: 'Alex Chen',
      location: 'Tokyo, Japan',
      tripsCount: 38,
      followersCount: 2800,
      isFollowing: false
    },
    {
      id: 'suggested3',
      name: 'Maria Costa',
      location: 'Barcelona, Spain',
      tripsCount: 52,
      followersCount: 4100,
      isFollowing: false
    }
  ];

  // التحقق مما إذا كان هناك المزيد من الصفحات للتحميل
  const hasMorePages = data?.next !== null;

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Create Post Button */}
          <div className="lg:col-span-1 space-y-6">
            {/* Create Post Button */}
            <Card>
              <CardContent className="p-4">
                <Button className="w-full" asChild>
                  <Link to="/create-trip">
                    <PlusCircle className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    <TranslatableText staticKey="feed.shareYourTrip">Share Your Trip</TranslatableText>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feed Header */}
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

            {/* Trip Posts */}
            <div className="space-y-6">
              {isLoading && page === 1 && (
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
                  // Filter by search query
                  if (searchQuery && !trip.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !trip.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !trip.location.city.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !trip.location.country.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                  }
                  // Filter by category
                  if (activeCategory && trip.category !== activeCategory) {
                    return false;
                  }
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

                return (
                  <>
                    {filteredTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                    
                    {/* عرض مؤشر التحميل عند تحميل الصفحات الإضافية */}
                    {isLoading && page > 1 && (
                      <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <Card key={`skeleton-${i}`}>
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
                  </>
                );
              })()}
            </div>

            {/* Load More Button - يظهر فقط إذا كان هناك المزيد من الصفحات */}
            {hasMorePages && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="min-w-[200px]"
                >
                  {isLoading ? (
                    <TranslatableText staticKey="feed.loading">Loading...</TranslatableText>
                  ) : (
                    <TranslatableText staticKey="feed.loadMoreAdventures">Load More Adventures</TranslatableText>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar - Suggested Users & Trending */}
          <div className="lg:col-span-1 space-y-6">
            {/* Suggested Travelers */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <Users className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'} text-primary`} />
                  <h3 className="font-semibold">
                    <TranslatableText staticKey="feed.suggestedTravelers">Suggested Travelers</TranslatableText>
                  </h3>
                </div>
                <div className="space-y-4">
                  {suggestedUsers.map((user) => (
                    <UserCard key={user.id} user={user} variant="compact" />
                  ))}
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