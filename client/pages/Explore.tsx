import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TripCard from '@/components/TripCard';
import UserCard from '@/components/UserCard';
import AdvancedSearch from '@/components/AdvancedSearch';
import SearchStats from '@/components/SearchStats';
import { useGetExploreQuery } from '@/store/feedApi';
import { useGetTopTravelersQuery, useFollowUserMutation, useUnfollowUserMutation } from '@/store/interactionsApi';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import {
  Search,
  MapPin,
  Filter,
  TrendingUp,
  Globe,
  Star,
  Users,
  Camera,
  Mountain,
  Waves,
  Building,
  Utensils,
  Calendar
} from 'lucide-react';

const Explore = () => {
  const { direction, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('trips');
  const [page, setPage] = useState(1);
  const [travelersPage, setTravelersPage] = useState(1);
  const { data: exploreData, isLoading, isFetching, isError, refetch } = useGetExploreQuery({ page });
  const { data: topTravelersData, isLoading: isTravelersLoading, isFetching: isTravelersFetching, isError: isTravelersError, refetch: refetchTravelers } = useGetTopTravelersQuery({ page: travelersPage });
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const [exploreItems, setExploreItems] = useState<any[]>([]);
  const [topTravelers, setTopTravelers] = useState<any[]>([]);

  const categories = [
    { id: 'all', label: t('categories.all', 'All'), icon: Globe, count: 2340 },
    { id: 'adventure', label: t('categories.adventure', 'Adventure'), icon: Mountain, count: 456 },
    { id: 'beach', label: t('categories.beach', 'Beach'), icon: Waves, count: 342 },
    { id: 'city', label: t('categories.city', 'City'), icon: Building, count: 567 },
    { id: 'food', label: t('categories.food', 'Food'), icon: Utensils, count: 234 },
    { id: 'culture', label: t('categories.culture', 'Culture'), icon: Calendar, count: 298 }
  ];

  const destinations = [
    {
      id: '1',
      name: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
      tripsCount: 234,
      rating: 4.8,
      description: 'Tropical paradise with stunning temples and rice terraces',
      category: 'beach',
      trending: true
    },
    {
      id: '2',
      name: 'Santorini, Greece',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop',
      tripsCount: 189,
      rating: 4.9,
      description: 'Iconic white-washed buildings and breathtaking sunsets',
      category: 'culture',
      trending: true
    },
    {
      id: '3',
      name: 'Kyoto, Japan',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
      tripsCount: 156,
      rating: 4.7,
      description: 'Ancient temples and traditional Japanese culture',
      category: 'culture',
      trending: false
    },
    {
      id: '4',
      name: 'Banff, Canada',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      tripsCount: 132,
      rating: 4.8,
      description: 'Majestic mountains and pristine alpine lakes',
      category: 'adventure',
      trending: false
    },
    {
      id: '5',
      name: 'Machu Picchu, Peru',
      image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop',
      tripsCount: 145,
      rating: 4.9,
      description: 'Ancient Incan citadel in the Andes Mountains',
      category: 'adventure',
      trending: true
    },
    {
      id: '6',
      name: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
      tripsCount: 198,
      rating: 4.6,
      description: 'Modern city with luxury shopping and architecture',
      category: 'city',
      trending: false
    }
  ];

  useEffect(() => {
    if (exploreData?.results) {
      setExploreItems(prev => (page === 1 ? exploreData.results : [...prev, ...exploreData.results]));
    }
  }, [exploreData, page]);

  useEffect(() => {
    if (topTravelersData?.results) {
      setTopTravelers(prev => (travelersPage === 1 ? topTravelersData.results : [...prev, ...topTravelersData.results]));
    }
  }, [topTravelersData, travelersPage]);

  const handleToggleFollow = async (userId: string, nextState: boolean) => {
    try {
      if (nextState) {
        await followUser({ user_id: parseInt(userId) }).unwrap();
      } else {
        await unfollowUser({ user_id: parseInt(userId) }).unwrap();
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      throw error; // Re-throw to allow UserCard to handle optimistic update rollback
    }
  };

  const mappedTrips = useMemo(() => {
    return exploreItems;
  }, [exploreItems]);

  const filteredTopTravelers = topTravelers.filter(traveler =>
    traveler.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (traveler.bio && traveler.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (traveler.location && traveler.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || dest.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse' : ''} mb-4`}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fac285223133d4c4690a07a25427a1573%2F7ae77806540645af89506e260a82309c?format=webp&width=800"
              alt="RAHALA"
              className={`h-12 w-12 rounded-full object-cover ${direction === 'rtl' ? 'ml-4' : 'mr-4'}`}
            />
            <h1 className="text-4xl font-bold text-gray-900">
              <TranslatableText staticKey="explore.title">Explore the World</TranslatableText>
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <TranslatableText staticKey="explore.subtitle">Discover amazing destinations, get inspired by fellow travelers, and plan your next adventure</TranslatableText>
          </p>
        </div>
        <div className="mb-8 grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card>
              <CardContent className="p-6">
                <AdvancedSearch
                  placeholder={t('explore.searchPlaceholder', 'Search for destinations, users, or experiences...')}
                  className="w-full"
                  maxResults={8}
                  showHistory={true}
                  showSuggestions={true}
                  showPopular={true}
                  enableRateLimitHandling={true}
                />
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="my-8">
                    <TabsTrigger value="trips">
                      <TranslatableText staticKey="explore.featuredTrips">Featured Trips</TranslatableText>
                    </TabsTrigger>
                    <TabsTrigger value="travelers">
                      <TranslatableText staticKey="explore.topTravelers">Top Travelers</TranslatableText>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="trips">
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            <TranslatableText staticKey="explore.exploreTrips">Explore Trips</TranslatableText>
                          </h3>
                          <p className="text-gray-600">
                            <TranslatableText staticKey="explore.exploreTripsDesc">Discover amazing trips shared by our community</TranslatableText>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setPage(1); setExploreItems([]); refetch(); }} disabled={isFetching}>
                            <Filter className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                            <TranslatableText staticKey="explore.refresh">Refresh</TranslatableText>
                          </Button>
                        </div>
                      </div>
                    </div>
                    {isError && (
                      <Card className="mb-6">
                        <CardContent className="p-4 text-red-600">
                          <TranslatableText staticKey="explore.failedToLoadTrips">Failed to load trips. Please try again.</TranslatableText>
                        </CardContent>
                      </Card>
                    )}
                    {isLoading && page === 1 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Card key={i} className="overflow-hidden">
                            <div className="h-64 bg-gray-100 animate-pulse" />
                            <CardContent className="p-4">
                              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2 animate-pulse" />
                              <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                            </CardContent>
                          </Card>
                        ))}
                        <div className="col-span-full text-center text-sm text-gray-500 mt-4">
                          <TranslatableText staticKey="explore.loading">Loading…</TranslatableText>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {mappedTrips
                            .filter((t) =>
                              t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              t.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              t.location.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              t.category.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .filter((t) => (activeCategory === 'all' ? true : t.category.toLowerCase() === activeCategory.toLowerCase()))
                            .map((trip) => (
                              <TripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                        {Boolean(exploreData?.next) && (
                          <div className="text-center mt-6">
                            <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={isFetching}>
                              {isFetching ?
                                <TranslatableText staticKey="explore.loading">Loading…</TranslatableText> :
                                <TranslatableText staticKey="explore.loadMore">Load more</TranslatableText>
                              }
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                  <TabsContent value="travelers">
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            <TranslatableText staticKey="explore.topTravelers">Top Travelers</TranslatableText>
                          </h3>
                          <p className="text-gray-600">
                            <TranslatableText staticKey="explore.topTravelersDesc">Follow inspiring travelers and get exclusive insights</TranslatableText>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setTravelersPage(1); setTopTravelers([]); refetchTravelers(); }} disabled={isTravelersFetching}>
                            <Filter className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                            <TranslatableText staticKey="explore.refresh">Refresh</TranslatableText>
                          </Button>
                        </div>
                      </div>
                    </div>
                    {isTravelersError && (
                      <Card className="mb-6">
                        <CardContent className="p-4 text-red-600">
                          <TranslatableText staticKey="explore.failedToLoadTravelers">Failed to load travelers. Please try again.</TranslatableText>
                        </CardContent>
                      </Card>
                    )}
                    {isTravelersLoading && travelersPage === 1 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Card key={i} className="overflow-hidden">
                            <div className="h-32 bg-gray-100 animate-pulse" />
                            <CardContent className="p-4">
                              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2 animate-pulse" />
                              <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                            </CardContent>
                          </Card>
                        ))}
                        <div className="col-span-full text-center text-sm text-gray-500 mt-4">
                          <TranslatableText staticKey="explore.loading">Loading…</TranslatableText>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6">
                          {filteredTopTravelers.map((traveler) => (
                            <UserCard
                              key={traveler.id}
                              user={traveler}
                              onToggleFollow={handleToggleFollow}
                            />
                          ))}
                        </div>
                        {filteredTopTravelers.length === 0 && !isTravelersLoading && (
                          <Card className="p-8 text-center">
                            <CardContent>
                              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                <TranslatableText staticKey="explore.noTravelersFound">No travelers found</TranslatableText>
                              </h3>
                              <p className="text-gray-600">
                                <TranslatableText staticKey="explore.noTravelersDesc">Try adjusting your search or check back later for new travelers.</TranslatableText>
                              </p>
                            </CardContent>
                          </Card>
                        )}
                        {Boolean(topTravelersData?.next) && (
                          <div className="text-center mt-6">
                            <Button variant="outline" onClick={() => setTravelersPage((p) => p + 1)} disabled={isTravelersFetching}>
                              {isTravelersFetching ?
                                <TranslatableText staticKey="explore.loading">Loading…</TranslatableText> :
                                <TranslatableText staticKey="explore.loadMore">Load more</TranslatableText>
                              }
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <div className="xl:col-span-1">
            <SearchStats className="sticky top-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;