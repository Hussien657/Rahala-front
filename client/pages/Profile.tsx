import { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TripCard from '@/components/TripCard';
import UserCard from '@/components/UserCard';
import EditProfileDialog from '@/components/EditProfileDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import { useGetMyProfileQuery, useGetMyProfileDetailsQuery } from '@/store/userApi';
import { useGetUserFollowersQuery, useGetUserFollowingQuery, useGetUserStatsQuery, useFollowUserMutation, useUnfollowUserMutation } from '@/store/interactionsApi';
import { useGetMyTripsQuery } from '@/store/tripsApi';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  Settings,
  MapPin,
  Calendar,
  Camera,
  Users,
  Heart,
  Star,
  Edit3,
  Compass,
  Trophy,
  Globe,
  LogOut,
  CheckCircle,
} from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { direction, t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trips');
  const { data: mainProfile, isLoading: isLoadingMain, isError: isErrorMain } = useGetMyProfileQuery();
  const { data: detailsProfile, isLoading: isLoadingDetails, isError: isErrorDetails } = useGetMyProfileDetailsQuery();
  const { data: myTrips, isLoading: isLoadingMyTrips, isError: isErrorMyTrips, refetch: refetchMyTrips } = useGetMyTripsQuery();
  const userId = mainProfile?.id;
  const { data: followersData } = useGetUserFollowersQuery(userId ?? (skipToken as any));
  const { data: followingData } = useGetUserFollowingQuery(userId ?? (skipToken as any));
  const { data: userStats } = useGetUserStatsQuery(userId ?? (skipToken as any));
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={direction}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">
            <TranslatableText staticKey="profile.loadingProfile">Loading profile...</TranslatableText>
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoadingMain || isLoadingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={direction}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">
            <TranslatableText staticKey="profile.loadingProfile">Loading profile...</TranslatableText>
          </p>
        </div>
      </div>
    );
  }

  if (isErrorMain || isErrorDetails || !mainProfile || !detailsProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={direction}>
        <div className="text-center">
          <p className="mt-4 text-gray-600">
            <TranslatableText staticKey="profile.failedToLoad">Failed to load profile. Please try again.</TranslatableText>
          </p>
          <Button className="mt-4" onClick={() => navigate(0)}>
            <TranslatableText staticKey="profile.reload">Reload</TranslatableText>
          </Button>
        </div>
      </div>
    );
  }

  const followers = (followersData?.results ?? []).map((rel) => ({
    id: String(rel.follower.id),
    name: rel.follower.username,
    avatar: undefined as string | undefined,
    bio: undefined as string | undefined,
    location: undefined as string | undefined,
    tripsCount: 0,
    followersCount: 0,
    isFollowing: rel.follower.is_verified && (userStats?.is_following ?? false),
    isVerified: rel.follower.is_verified,
  }));

  const following = (followingData?.results ?? []).map((rel) => ({
    id: String(rel.following.id),
    name: rel.following.username,
    avatar: undefined as string | undefined,
    bio: undefined as string | undefined,
    location: undefined as string | undefined,
    tripsCount: 0,
    followersCount: 0,
    isFollowing: true,
    isVerified: rel.following.is_verified,
  }));

  const handleToggleFollow = async (targetUserId: number | string, shouldFollow: boolean) => {
    try {
      const numericId = Number(targetUserId);
      if (shouldFollow) {
        await followUser({ user_id: numericId }).unwrap();
      } else {
        await unfollowUser({ user_id: numericId }).unwrap();
      }
    } catch (e) {
      console.error('Failed to toggle follow', e);
    }
  };

  const firstLast = `${detailsProfile?.first_name ?? ''} ${detailsProfile?.last_name ?? ''}`.trim();
  const displayName = firstLast || mainProfile.username || user.name;

  const avatarUrl = detailsProfile.avatar || user.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face';

  const myTripsMapped = (myTrips ?? [])
    .map((trip: any) => {
      const imageUrls: string[] = Array.isArray(trip.images) && trip.images.length
        ? trip.images.map((img: any) => img.image)
        : ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=800&fit=crop'];

      const country = trip.country || (typeof trip.location === 'string' ? String(trip.location).split(',').map((s: string) => s.trim())[1] || '' : '');
      const city = trip.city || (typeof trip.location === 'string' ? String(trip.location).split(',').map((s: string) => s.trim())[0] || '' : '');

      const category = Array.isArray(trip.tags) && trip.tags.length ? String(trip.tags[0]) : 'Trip';
      const description = (trip.tourism_info && trip.tourism_info.description) || trip.caption || '';

      return {
        id: String(trip.id),
        title: trip.caption || 'Untitled Trip',
        description,
        images: imageUrls,
        location: { country: country || '—', city: city || '—' },
        category,
        rating: 4.8,
        duration: '—',
        author: {
          id: String(mainProfile.id),
          name: displayName,
          avatar: avatarUrl,
          hasVerifiedBadge: !!mainProfile.subscription_status?.has_verified_badge,
        },
        likes: 0,
        comments: 0,
        isLiked: false,
        createdAt: trip.created_at || new Date().toISOString(),
      };
    })
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const currentUser = {
    id: String(mainProfile.id),
    name: displayName,
    username: `@${mainProfile.username}`,
    avatar: avatarUrl,
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    bio: detailsProfile.bio || t('profile.defaultBio', 'Passionate traveler exploring the world one destination at a time. Adventure seeker, culture enthusiast, and photographer.'),
    location: detailsProfile.country || '—',
    website: '',
    joinDate: mainProfile.date_joined,
    isVerified: !!mainProfile.is_verified,
    isSubscribed: !!mainProfile.subscription_status?.is_active,
    hasVerifiedBadge: !!mainProfile.subscription_status?.has_verified_badge,
    stats: {
      trips: userStats?.trips_count ?? (myTripsMapped?.length ?? 0),
      followers: userStats?.followers_count ?? followers.length,
      following: userStats?.following_count ?? following.length,
      countries: new Set(myTripsMapped.map(trip => trip.location.country)).size
    }
  };

  const achievements = [
    {
      icon: Globe,
      title: t('profile.worldExplorer', 'World Explorer'),
      description: t('profile.worldExplorerDesc', 'Visited 30+ countries'),
      earned: true
    },
    {
      icon: Trophy,
      title: t('profile.topContributor', 'Top Contributor'),
      description: t('profile.topContributorDesc', 'Most liked trips this month'),
      earned: true
    },
    {
      icon: Camera,
      title: t('profile.photographyMaster', 'Photography Master'),
      description: t('profile.photographyMasterDesc', 'Amazing photo quality'),
      earned: true
    },
    {
      icon: Star,
      title: t('profile.adventureSeeker', 'Adventure Seeker'),
      description: t('profile.adventureSeekerDesc', 'Completed 10 adventure trips'),
      earned: false
    }
  ];

  return (
    <div className="min-h-screen bg-white" dir={direction}>
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-white shadow-sm">
          <div className="h-64 md:h-80 bg-gradient-to-r from-primary to-accent overflow-hidden">
            <img
              src={currentUser.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <div className="relative px-6 pb-6 bg-white">
            <div className={`flex flex-col md:flex-row md:items-end ${direction === 'rtl' ? 'md:space-x-reverse' : ''} md:space-x-6`}>
              <div className="relative -mt-16 mb-4 md:mb-0">
                <Avatar className={`
                  h-32 w-32 border-4
                  ${currentUser.hasVerifiedBadge
                    ? 'border-yellow-500 ring-2 ring-yellow-500/50 animate-glow-avatar'
                    : 'border-white shadow-xl'
                  }
                `}>
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="text-2xl">{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-2">
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{currentUser.name}</h1>
                  {currentUser.isVerified && (
                    <Badge className="bg-blue-500 text-white">
                      <TranslatableText staticKey="profile.verified">Verified</TranslatableText>
                    </Badge>
                  )}
                  {currentUser.isSubscribed && (
                    <Badge className="bg-yellow-400 text-yellow-900">
                      <CheckCircle className={`h-4 w-4 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                      <TranslatableText staticKey="profile.subscribed">Subscribed</TranslatableText>
                    </Badge>
                  )}
                  {currentUser.hasVerifiedBadge && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900">
                      <CheckCircle className={`h-4 w-4 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                      <TranslatableText staticKey="profile.premium">Premium</TranslatableText>
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600">{currentUser.username}</p>
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4 text-sm text-gray-600`}>
                  <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                    <MapPin className="h-4 w-4" />
                    <span>{currentUser.location}</span>
                  </div>
                  <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                    <Calendar className="h-4 w-4" />
                    <span>
                      <TranslatableText staticKey="profile.joined">Joined</TranslatableText> {new Date(currentUser.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`flex ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2 mt-4 md:mt-0`}>
                <EditProfileDialog />
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  <TranslatableText staticKey="profile.logOut">Log Out</TranslatableText>
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-gray-700 leading-relaxed max-w-2xl" dir={direction}>
                {currentUser.bio}
              </p>
              {currentUser.website && (
                <a href={`https://${currentUser.website}`} className="text-primary hover:underline mt-2 inline-block">
                  {currentUser.website}
                </a>
              )}
            </div>
            <div className="grid grid-cols-5 gap-6 mt-6 py-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{currentUser.stats.trips}</div>
                <div className="text-sm text-gray-600">
                  <TranslatableText staticKey="profile.trips">Trips</TranslatableText>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{currentUser.stats.followers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">
                  <TranslatableText staticKey="profile.followers">Followers</TranslatableText>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{currentUser.stats.following}</div>
                <div className="text-sm text-gray-600">
                  <TranslatableText staticKey="profile.following">Following</TranslatableText>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{currentUser.stats.countries}</div>
                <div className="text-sm text-gray-600">
                  <TranslatableText staticKey="profile.countries">Countries</TranslatableText>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-lg mt-6 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-100 px-6 pt-6">
              <TabsList className="mb-6 bg-gray-50">
                <TabsTrigger value="trips">
                  <TranslatableText staticKey="profile.myTrips">My Trips</TranslatableText>
                </TabsTrigger>
                <TabsTrigger value="followers">
                  <TranslatableText staticKey="profile.followers">Followers</TranslatableText>
                </TabsTrigger>
                <TabsTrigger value="following">
                  <TranslatableText staticKey="profile.following">Following</TranslatableText>
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  <TranslatableText staticKey="profile.achievements">Achievements</TranslatableText>
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="trips" className="px-6 pb-6">
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    <TranslatableText staticKey="profile.myTravelStories">My Travel Stories</TranslatableText>
                  </h3>
                  <Button asChild className="shadow-sm">
                    <Link to="/create-trip">
                      <Camera className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      <TranslatableText staticKey="profile.shareNewTrip">Share New Trip</TranslatableText>
                    </Link>
                  </Button>
                </div>
                {isLoadingMyTrips && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="rounded-lg border p-4">
                        <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md mb-4"></div>
                        <div className="h-4 w-1/2 bg-gray-100 animate-pulse rounded mb-2"></div>
                        <div className="h-3 w-3/4 bg-gray-100 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                )}
                {isErrorMyTrips && !isLoadingMyTrips && (
                  <div className="text-center p-10 bg-gray-50 rounded-lg border">
                    <p className="text-gray-600 mb-4">
                      <TranslatableText staticKey="profile.failedToLoadTrips">Failed to load your trips.</TranslatableText>
                    </p>
                    <Button onClick={() => refetchMyTrips()} className="shadow-sm">
                      <TranslatableText staticKey="profile.retry">Retry</TranslatableText>
                    </Button>
                  </div>
                )}
                {!isLoadingMyTrips && !isErrorMyTrips && myTripsMapped.length === 0 && (
                  <div className="text-center p-10 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      <TranslatableText staticKey="profile.noTripsYet">You have no trips yet</TranslatableText>
                    </h4>
                    <p className="text-gray-600 mb-4">
                      <TranslatableText staticKey="profile.startSharingTrips">Start sharing your travel stories with the community.</TranslatableText>
                    </p>
                    <Button asChild className="shadow-sm">
                      <Link to="/create-trip">
                        <Camera className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <TranslatableText staticKey="profile.createYourFirstTrip">Create your first trip</TranslatableText>
                      </Link>
                    </Button>
                  </div>
                )}
                {!isLoadingMyTrips && !isErrorMyTrips && myTripsMapped.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {myTripsMapped.map((trip) => (
                      <div key={trip.id} className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                        <TripCard trip={trip} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="followers" className="px-6 pb-6">
              <div className="space-y-6 pt-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentUser.stats.followers.toLocaleString()} <TranslatableText staticKey="profile.followers">Followers</TranslatableText>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(followers.length ? followers : []).map((follower) => (
                    <div key={follower.id} className="transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                      <UserCard user={follower} variant="compact" onToggleFollow={(id, next) => handleToggleFollow(id, next)} />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="following" className="px-6 pb-6">
              <div className="space-y-6 pt-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentUser.stats.following} <TranslatableText staticKey="profile.following">Following</TranslatableText>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(following.length ? following : []).map((u) => (
                    <UserCard key={u.id} user={u} variant="compact" onToggleFollow={(id, next) => handleToggleFollow(id, next)} />
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="achievements" className="px-6 pb-6">
              <div className="space-y-6 pt-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  <TranslatableText staticKey="profile.travelAchievements">Travel Achievements</TranslatableText>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {achievements.map((achievement, index) => (
                    <Card key={index} className={`${achievement.earned ? 'border-primary bg-primary/5' : 'border-gray-200 opacity-60'}`}>
                      <CardContent className="p-6">
                        <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4`}>
                          <div className={`p-3 rounded-full ${achievement.earned ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <achievement.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{achievement.title}</h4>
                            <p className="text-gray-600">{achievement.description}</p>
                            {achievement.earned && (
                              <Badge className="mt-2">
                                <TranslatableText staticKey="profile.earned">Earned</TranslatableText>
                              </Badge>
                            )}
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

export default Profile;