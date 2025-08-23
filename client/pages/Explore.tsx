import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TripCard from '@/components/TripCard';
import UserCard from '@/components/UserCard';
import AdvancedSearch from '@/components/AdvancedSearch';
import SearchStats from '@/components/SearchStats';
import { useGetExploreQuery } from '@/store/feedApi';
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
  const { data: exploreData, isLoading, isFetching, isError, refetch } = useGetExploreQuery({ page });
  const [exploreItems, setExploreItems] = useState<any[]>([]);

  const categories = [
    { id: 'all', label: t('explore.all', 'All'), icon: Globe, count: 2340 },
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

  // Accumulate paginated explore data
  useEffect(() => {
    if (exploreData?.results) {
      setExploreItems(prev => (page === 1 ? exploreData.results : [...prev, ...exploreData.results]));
    }
  }, [exploreData, page]);

  // Map API FeedItem -> TripCard shape
  const mappedTrips = useMemo(() => {
    return exploreItems.map((item) => {
      const firstImage = item.images?.[0]?.image || item.videos?.[0]?.video || 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&h=600&fit=crop';
      const [city, country] = (item.location || '').split(',').map((s: string) => s.trim());
      const tagCategory = item.tags?.[0]?.tripTag || 'Travel';
      return {
        id: String(item.id),
        title: item.caption || 'Trip',
        description: item.caption || '',
        images: [firstImage],
        location: { country: country || (city || 'Unknown'), city: city || (country || 'Unknown') },
        category: tagCategory,
        rating: 4.8,
        duration: '—',
        author: { id: String(item.user || '0'), name: String(item.user || 'Traveler'), avatar: undefined },
        likes: 0,
        comments: 0,
        isLiked: false,
        createdAt: item.created_at,
      };
    });
  }, [exploreItems]);

  const topTravelers = [
    {
      id: 'user1',
      name: 'Emma Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      bio: 'Temple enthusiast and cultural explorer',
      location: 'Singapore',
      tripsCount: 45,
      followersCount: 3200,
      isFollowing: false,
      isVerified: true
    },
    {
      id: 'user2',
      name: 'Marcus Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Adventure photographer and mountain climber',
      location: 'Denver, USA',
      tripsCount: 67,
      followersCount: 5400,
      isFollowing: false,
      isVerified: true
    }
  ];

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || dest.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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

        {/* Advanced Search */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <AdvancedSearch
                  placeholder={t('explore.searchPlaceholder', 'البحث عن وجهات، مستخدمين، أو تجارب...')}
                  className="w-full"
                  maxResults={8}
                  showHistory={true}
                  showSuggestions={true}
                  showPopular={true}
                  enableRateLimitHandling={true}
                />
                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="my-8">
                    {/* <TabsTrigger value="destinations">
                      <TranslatableText staticKey="explore.destinations">Destinations</TranslatableText>
                    </TabsTrigger> */}
                    <TabsTrigger value="trips">
                      <TranslatableText staticKey="explore.featuredTrips">Featured Trips</TranslatableText>
                    </TabsTrigger>
                    <TabsTrigger value="travelers">
                      <TranslatableText staticKey="explore.topTravelers">Top Travelers</TranslatableText>
                    </TabsTrigger>
                  </TabsList>

                  {/* Destinations Tab */}
                  <TabsContent value="destinations">
                    {/* Categories */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">
                        <TranslatableText staticKey="explore.browseByCategory">Browse by Category</TranslatableText>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((category) => (
                          <Card
                            key={category.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${activeCategory === category.id ? 'ring-2 ring-primary' : ''
                              }`}
                            onClick={() => setActiveCategory(category.id)}
                          >
                            <CardContent className="p-4 text-center">
                              <div className="flex justify-center mb-2">
                                <div className={`p-2 rounded-full ${activeCategory === category.id ? 'bg-primary text-white' : 'bg-gray-100'
                                  }`}>
                                  <category.icon className="h-5 w-5" />
                                </div>
                              </div>
                              <h4 className="font-medium text-sm mb-1">{category.label}</h4>
                              <p className="text-xs text-gray-500">
                                {category.count} <TranslatableText staticKey="explore.trips">trips</TranslatableText>
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Destinations Grid */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">
                          {activeCategory === 'all' ?
                            <TranslatableText staticKey="explore.popularDestinations">Popular Destinations</TranslatableText> :
                            `${categories.find(c => c.id === activeCategory)?.label} ${t('explore.destinations', 'Destinations')}`
                          }
                        </h3>
                        <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2 text-sm text-gray-600`}>
                          <span>
                            {filteredDestinations.length} <TranslatableText staticKey="explore.destinationsFound">destinations found</TranslatableText>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDestinations.map((destination) => (
                          <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="relative h-48">
                              <img
                                src={destination.image}
                                alt={destination.name}
                                className="w-full h-full object-cover"
                              />
                              {destination.trending && (
                                <Badge className={`absolute top-3 ${direction === 'rtl' ? 'left-3' : 'right-3'} bg-red-500`}>
                                  <TrendingUp className={`h-3 w-3 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                                  <TranslatableText staticKey="explore.trending">Trending</TranslatableText>
                                </Badge>
                              )}
                              <div className="absolute bottom-3 left-3 right-3">
                                <div className="bg-black/50 rounded-lg p-2 text-white">
                                  <h4 className="font-semibold text-lg">{destination.name}</h4>
                                  <p className="text-sm opacity-90">{destination.description}</p>
                                </div>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4`}>
                                  <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{destination.rating}</span>
                                  </div>
                                  <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                                    <Camera className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                      {destination.tripsCount} <TranslatableText staticKey="explore.trips">trips</TranslatableText>
                                    </span>
                                  </div>
                                </div>
                                <Button size="sm">
                                  <MapPin className={`h-4 w-4 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                                  <TranslatableText staticKey="explore.explore">Explore</TranslatableText>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Featured Trips Tab */}
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

                  {/* Top Travelers Tab */}
                  <TabsContent value="travelers">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">
                        <TranslatableText staticKey="explore.topTravelers">Top Travelers</TranslatableText>
                      </h3>
                      <p className="text-gray-600">
                        <TranslatableText staticKey="explore.topTravelersDesc">Follow inspiring travelers and get exclusive insights</TranslatableText>
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {topTravelers.map((traveler) => (
                        <UserCard key={traveler.id} user={traveler} />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <SearchStats className="sticky top-24" />
          </div>
        </div>


      </div>
    </div>
  );
};

export default Explore;
