import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TripCard from '@/components/TripCard';
import UserCard from '@/components/UserCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import { useGetPublicUserProfileQuery } from '@/store/userApi';
import {
  MapPin,
  Calendar,
  Camera,
  Users,
  Heart,
  Star,
  Share2,
  Compass,
  Trophy,
  Globe,
  UserPlus,
  UserCheck
} from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { direction, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('trips');
  const [isFollowing, setIsFollowing] = useState(false);

  // Convert userId to number and fetch profile
  const numericUserId = userId ? parseInt(userId, 10) : null;
  const { data: profileUser, isLoading: loading, isError } = useGetPublicUserProfileQuery(
    numericUserId || 0,
    { skip: !numericUserId || isNaN(numericUserId) }
  );
  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={direction}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">
            <TranslatableText staticKey="userProfile.loadingProfile">Loading profile...</TranslatableText>
          </p>
        </div>
      </div>
    );
  }

  // Redirect to own profile if viewing self
  if (isAuthenticated && currentUser && numericUserId === currentUser.id) {
    return <Navigate to="/profile" replace />;
  }

  if (isError || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={direction}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <TranslatableText staticKey="userProfile.userNotFound">User not found</TranslatableText>
          </h2>
          <p className="text-gray-600">
            <TranslatableText staticKey="userProfile.userNotFoundDesc">The user you're looking for doesn't exist.</TranslatableText>
          </p>
        </div>
      </div>
    );
  }

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // Here you would typically make an API call to follow/unfollow
  };

  // Mock user trips
  const userTrips = [
    {
      id: '1',
      title: 'Sunrise at Machu Picchu',
      description: 'An incredible journey to Peru and the ancient citadel of Machu Picchu.',
      images: ['https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop'],
      location: { country: 'Peru', city: 'Cusco' },
      category: 'Adventure',
      rating: 4.9,
      duration: '8 days',
      author: profileUser,
      likes: 456,
      comments: 67,
      isLiked: false,
      createdAt: '2024-01-10'
    }
  ];

  const achievements = [
    {
      icon: Globe,
      title: t('userProfile.worldExplorer', 'World Explorer'),
      description: t('userProfile.worldExplorerDesc', 'Visited 30+ countries'),
      earned: true
    },
    {
      icon: Trophy,
      title: t('userProfile.topContributor', 'Top Contributor'),
      description: t('userProfile.topContributorDesc', 'Most liked trips this month'),
      earned: true
    },
    {
      icon: Camera,
      title: t('userProfile.photographyMaster', 'Photography Master'),
      description: t('userProfile.photographyMasterDesc', 'Amazing photo quality'),
      earned: true
    },
  ];

  return (
    <div className="min-h-screen bg-white" dir={direction}>
      <div className="max-w-6xl mx-auto">

        {/* Cover Photo & Profile Info */}
        <div className="relative bg-white shadow-sm">
          {/* Cover Image */}
          <div className="h-64 md:h-80 bg-gradient-to-r from-primary to-accent overflow-hidden relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6 bg-white">
            <div className={`flex flex-col md:flex-row md:items-end ${direction === 'rtl' ? 'md:space-x-reverse' : ''} md:space-x-6`}>
              {/* Avatar */}
              <div className="relative -mt-16 mb-4 md:mb-0">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profileUser.profile.avatar || undefined} alt={`${profileUser.profile.first_name} ${profileUser.profile.last_name}`} />
                  <AvatarFallback className="text-2xl">
                    {profileUser.profile.first_name?.charAt(0) || profileUser.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-2">
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {profileUser.profile.first_name} {profileUser.profile.last_name}
                  </h1>
                  {profileUser.is_verified && (
                    <Badge className="bg-blue-500">
                      <TranslatableText staticKey="userProfile.verified">Verified</TranslatableText>
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600">@{profileUser.username}</p>
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4 text-sm text-gray-600`}>
                  {profileUser.profile.country && (
                    <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                      <MapPin className="h-4 w-4" />
                      <span>{profileUser.profile.country}</span>
                    </div>
                  )}
                  <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                    <Calendar className="h-4 w-4" />
                    <span>
                      <TranslatableText staticKey="userProfile.joined">Joined</TranslatableText> {new Date(profileUser.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2 mt-4 md:mt-0`}>
                <Button onClick={handleFollowToggle}>
                  {isFollowing ? (
                    <>
                      <UserCheck className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      <TranslatableText staticKey="userProfile.followingStatus">Following</TranslatableText>
                    </>
                  ) : (
                    <>
                      <UserPlus className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      <TranslatableText staticKey="userProfile.follow">Follow</TranslatableText>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Bio */}
            {profileUser.profile.bio && (
              <div className="mt-6">
                <p className="text-gray-700 leading-relaxed max-w-2xl" dir={direction}>
                  {profileUser.profile.bio}
                </p>
              </div>
            )}

            {/* Stats - TODO: Implement real stats API */}
            <div className="grid grid-cols-3 gap-6 mt-6 py-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">
                  <TranslatableText staticKey="userProfile.trips">Trips</TranslatableText>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">
                  <TranslatableText staticKey="userProfile.followers">Followers</TranslatableText>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">
                  <TranslatableText staticKey="userProfile.followingCount">Following</TranslatableText>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white shadow-sm rounded-lg mt-6 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-100 px-6 pt-6">
              <TabsList className="mb-6 bg-gray-50">
                <TabsTrigger value="trips">
                  <TranslatableText staticKey="userProfile.travelStories">Travel Stories</TranslatableText>
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  <TranslatableText staticKey="userProfile.achievements">Achievements</TranslatableText>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Trips */}
            <TabsContent value="trips" className="px-6 pb-6">
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {profileUser.name}'s <TranslatableText staticKey="userProfile.travelStories">Travel Stories</TranslatableText>
                  </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userTrips.map((trip) => (
                    <div> </div> // <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Achievements */}
            <TabsContent value="achievements" className="px-6 pb-6">
              <div className="space-y-6 pt-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  <TranslatableText staticKey="userProfile.travelAchievements">Travel Achievements</TranslatableText>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {achievements.map((achievement, index) => (
                    <Card key={index} className="border-primary bg-primary/5">
                      <CardContent className="p-6">
                        <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4`}>
                          <div className="p-3 rounded-full bg-primary text-white">
                            <achievement.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{achievement.title}</h4>
                            <p className="text-gray-600">{achievement.description}</p>
                            <Badge className="mt-2">
                              <TranslatableText staticKey="userProfile.earned">Earned</TranslatableText>
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
