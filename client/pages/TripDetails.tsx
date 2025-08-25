import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CommentSection from '@/components/CommentSection';
import TranslatableText from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  Star,
  ArrowLeft,
  Trash2,
  ImagePlus,
  Film,
  Tag,
  Users,
  UserPlus,
  UserMinus,
  Sparkles,
  CalendarDays,
  AlertTriangle,
  Lightbulb,
  Languages,
  CircleDollarSign,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetTripStatsQuery, useLikeTripMutation, useUnlikeTripMutation, useSaveTripMutation, useUnsaveTripMutation, useGetTripLikesQuery, useFollowUserMutation, useUnfollowUserMutation } from '@/store/interactionsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Bookmark } from 'lucide-react';
import { useGetTripByIdQuery, useAddTripImagesMutation, useAddTripVideosMutation, useDeleteTripImageMutation, useDeleteTripVideoMutation, useAddTripTagsMutation, useDeleteTripTagMutation, useDeleteTripMutation, useGenerateTourismInfoMutation } from '@/store/tripsApi';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { direction, t, language } = useLanguage();
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch } = useGetTripStatsQuery(tripId || '');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const { data: trip, isLoading: tripLoading, isError: tripError, refetch: refetchTrip } = useGetTripByIdQuery(tripId || '');
  const [likeTrip, { isLoading: liking }] = useLikeTripMutation();
  const [unlikeTrip, { isLoading: unliking }] = useUnlikeTripMutation();
  const [saveTrip, { isLoading: saving }] = useSaveTripMutation();
  const [unsaveTrip, { isLoading: unsaving }] = useUnsaveTripMutation();
  const [addImages, { isLoading: addingImages }] = useAddTripImagesMutation();
  const [addVideos, { isLoading: addingVideos }] = useAddTripVideosMutation();
  const [deleteImage] = useDeleteTripImageMutation();
  const [deleteVideo] = useDeleteTripVideoMutation();
  const [addTags, { isLoading: addingTags }] = useAddTripTagsMutation();
  const [deleteTag] = useDeleteTripTagMutation();
  const [deleteTrip, { isLoading: deletingTrip }] = useDeleteTripMutation();
  const [generateTourismInfo, { isLoading: generatingInfo }] = useGenerateTourismInfoMutation();

  const [newTagsInput, setNewTagsInput] = useState('');
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [selectedVideoFiles, setSelectedVideoFiles] = useState<File[]>([]);
  const [isAddImagesModalOpen, setIsAddImagesModalOpen] = useState(false);
  const [isAddVideosModalOpen, setIsAddVideosModalOpen] = useState(false);
  const [isAddTagsModalOpen, setIsAddTagsModalOpen] = useState(false);

  // Sync local like state with server stats when loaded
  useMemo(() => {
    if (stats) {
      setIsLiked(stats.is_liked);
      setLikesCount(stats.likes_count);
      setIsSaved(stats.is_saved);
    }
    return true;
  }, [stats]);

  const primaryImage = trip?.images?.[0]?.image || '';
  const otherImages = (trip?.images || []).slice(1);
  const hasVideo = (trip?.videos?.length || 0) > 0;
  const isOwner = useMemo(() => {
    const current = (user?.name || '').toString().toLowerCase();
    const owner = (trip?.user || '').toString().toLowerCase();
    return !!current && !!owner && current === owner;
  }, [user, trip]);
  const [likesOpen, setLikesOpen] = useState(false);
  const { data: likesData, isLoading: likesLoading, isError: likesError, refetch: refetchLikes } = useGetTripLikesQuery(tripId || '', { skip: !likesOpen });
  const [followUser, { isLoading: following }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation();

  const handleLike = async () => {
    if (!tripId) return;
    const numericId = Number(tripId);
    const prevLiked = isLiked;
    const prevCount = likesCount;
    // optimistic update
    setIsLiked(!prevLiked);
    setLikesCount(prev => prevLiked ? prev - 1 : prev + 1);
    try {
      if (prevLiked) {
        await unlikeTrip({ trip_id: numericId }).unwrap();
      } else {
        await likeTrip({ trip_id: numericId }).unwrap();
      }
    } catch (e) {
      // revert on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast({
        title: t('tripDetails.error', 'Error'),
        description: t('tripDetails.failedToPerformAction', 'Failed to perform action. Please try again.')
      });
    }
  };

  const handleSave = async () => {
    if (!tripId) return;
    const numericId = Number(tripId);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);
    try {
      if (prevSaved) {
        await unsaveTrip({ trip_id: numericId }).unwrap();
      } else {
        await saveTrip({ trip_id: numericId }).unwrap();
      }
    } catch (e) {
      setIsSaved(prevSaved);
      toast({
        title: t('tripDetails.error', 'Error'),
        description: t('tripDetails.failedToUpdateSave', 'Failed to update save status. Please try again.')
      });
    }
  };

  const handleShare = () => {
    const shareTitle = trip?.caption || t('tripDetails.tripDetails', 'Trip Details');
    const shareText = trip?.location ? `${shareTitle} - ${trip.location}` : shareTitle;
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('tripDetails.copied', 'Copied'),
        description: t('tripDetails.linkCopied', 'Trip link copied to clipboard.')
      });
    }
  };

  const onSelectImages: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedImageFiles(files);
  };

  const onSelectVideos: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedVideoFiles(files);
  };

  const handleAddImages = async () => {
    if (!tripId || selectedImageFiles.length === 0) return;
    const fd = new FormData();
    selectedImageFiles.forEach(f => fd.append('images', f, f.name));
    try {
      await addImages({ tripId, formData: fd }).unwrap();
      setSelectedImageFiles([]);
      setIsAddImagesModalOpen(false);
      await refetchTrip();
      toast({
        title: t('tripDetails.success', 'Success'),
        description: t('tripDetails.imagesAdded', 'Images added successfully.')
      });
    } catch (e) {
      toast({
        title: t('tripDetails.error', 'Error'),
        description: t('tripDetails.failedToAddImages', 'Failed to add images.')
      });
    }
  };

  const handleAddVideos = async () => {
    if (!tripId || selectedVideoFiles.length === 0) return;
    const fd = new FormData();
    selectedVideoFiles.forEach(f => fd.append('videos', f, f.name));
    try {
      await addVideos({ tripId, formData: fd }).unwrap();
      setSelectedVideoFiles([]);
      setIsAddVideosModalOpen(false);
      await refetchTrip();
      toast({
        title: t('tripDetails.success', 'Success'),
        description: t('tripDetails.videosAdded', 'Videos added successfully.')
      });
    } catch (e) {
      toast({
        title: t('tripDetails.error', 'Error'),
        description: t('tripDetails.failedToAddVideos', 'Failed to add videos.')
      });
    }
  };

  const handleAddTags = async () => {
    if (!tripId || !newTagsInput.trim()) return;
    const tags = newTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    if (!tags.length) return;
    try {
      await addTags({ tripId, tags }).unwrap();
      setNewTagsInput('');
      setIsAddTagsModalOpen(false);
      await refetchTrip();
      toast({
        title: t('tripDetails.success', 'Success'),
        description: t('tripDetails.tagsAdded', 'Tags added successfully.')
      });
    } catch (e) {
      toast({
        title: t('tripDetails.error', 'Error'),
        description: t('tripDetails.failedToAddTags', 'Failed to add tags.')
      });
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await deleteImage({ imageId }).unwrap();
      await refetchTrip();
    } catch (e) {
      toast({
        title: t('tripDetails.error', 'Error'),
        description: t('tripDetails.failedToDeleteImage', 'Failed to delete image.')
      });
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    try {
      await deleteVideo({ videoId }).unwrap();
      await refetchTrip();
    } catch (e) {
      toast({
        title: t('tripDetails.error', 'Error'),
        description: t('tripDetails.failedToDeleteVideo', 'Failed to delete video.')
      });
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (!tripId) return;
    try {
      await deleteTag({ tripId, tagId }).unwrap();
      await refetchTrip();
    } catch (e) {
      toast({
        title: t('tripDetails.error', 'Error'),
        description: t('tripDetails.failedToDeleteTag', 'Failed to delete tag.')
      });
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripId) return;
    try {
      await deleteTrip(tripId).unwrap();
      toast({
        title: t('tripDetails.success', 'Success'),
        description: t('tripDetails.tripDeleted', 'Trip deleted successfully.')
      });
      navigate('/feed');
    } catch (e) {
      toast({
        title: t('tripDetails.error', 'Error'),
        description: t('tripDetails.failedToDeleteTrip', 'Failed to delete trip.')
      });
    }
  };

  const handleGenerateTourismInfo = async (force = false) => {
    if (!tripId) return;
    try {
      await generateTourismInfo({ tripId, force, language }).unwrap();
      await refetchTrip();
      toast({
        title: t('tripDetails.success', 'Success'),
        description: t('tripDetails.aiInsightsUpdated', 'AI travel insights updated.')
      });
    } catch (e) {
      toast({
        title: t('tripDetails.error', 'Error'),
        description: t('tripDetails.failedToGenerateInsights', 'Failed to generate AI insights.')
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/feed">
            <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            <TranslatableText staticKey="tripDetails.backToFeed">Back to Feed</TranslatableText>
          </Link>
        </Button>

        {/* Main Trip Card */}
        <Card className="overflow-hidden">
          {/* Hero Media */}
          <div className="relative h-80 sm:h-96 overflow-hidden">
            {tripLoading ? (
              <Skeleton className="w-full h-full" />
            ) : primaryImage ? (
              <img
                src={primaryImage}
                alt={trip?.caption || t('tripDetails.tripDetails', 'Trip Details')}
                className="w-full h-full object-cover"
              />
            ) : hasVideo ? (
              <video
                src={trip?.videos?.[0]?.video}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                <TranslatableText staticKey="tripDetails.noMedia">No media</TranslatableText>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {trip?.location && (
                  <Badge variant="secondary" className="bg-black/50 text-white border-0">{trip.location}</Badge>
                )}
                {trip?.tags?.slice(0, 3).map((t) => (
                  <Badge key={t.id} variant="secondary" className="bg-black/40 text-white border-0">#{t.tripTag}</Badge>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">
                {trip?.caption || t('tripDetails.tripDetails', 'Trip Details')}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm opacity-90">
                {trip?.location && (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{trip.location}</span>
                )}
                {trip?.created_at && (
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(trip.created_at).toLocaleDateString()}</span>
                )}
                {typeof stats?.likes_count === 'number' && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {stats.likes_count} <TranslatableText staticKey="tripDetails.likes">Likes</TranslatableText>
                  </span>
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Author & Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={trip?.user || 'user'} />
                  <AvatarFallback>{(trip?.user || '?').toString().charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      <TranslatableText>{trip?.user || 'User'}</TranslatableText>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>{trip?.created_at ? new Date(trip.created_at).toLocaleString() : ''}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'flex items-center space-x-2 rtl:space-x-reverse',
                    isLiked && 'text-red-500 border-red-500'
                  )}
                  onClick={handleLike}
                  disabled={statsLoading || tripLoading || liking || unliking}
                >
                  <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
                  <span>{likesCount}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} disabled={statsLoading || tripLoading}>
                  <Share2 className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  <TranslatableText staticKey="tripDetails.share">Share</TranslatableText>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLikesOpen(true)} disabled={statsLoading || tripLoading}>
                  <Users className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  <TranslatableText staticKey="tripDetails.likes">Likes</TranslatableText>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={statsLoading || tripLoading || saving || unsaving}
                  className={cn(isSaved && 'bg-primary/10 border-primary text-primary')}
                >
                  <Bookmark className={cn(`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`, isSaved && 'fill-current')} />
                  <TranslatableText staticKey={isSaved ? 'tripDetails.saved' : 'tripDetails.save'}>{isSaved ? 'Saved' : 'Save'}</TranslatableText>
                </Button>
                {isOwner && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'} className="w-48">
                        <DropdownMenuItem onClick={() => setIsAddImagesModalOpen(true)}>
                          <ImagePlus className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                          <TranslatableText staticKey="tripDetails.addImages">Add Images</TranslatableText>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsAddVideosModalOpen(true)}>
                          <Film className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                          <TranslatableText staticKey="tripDetails.addVideos">Add Videos</TranslatableText>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsAddTagsModalOpen(true)}>
                          <Tag className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                          <TranslatableText staticKey="tripDetails.addTags">Add Tags</TranslatableText>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingTrip}
                        >
                          <Trash2 className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                          <TranslatableText staticKey="tripDetails.delete">Delete</TranslatableText>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            <TranslatableText staticKey="tripDetails.confirmDelete">Confirm Delete</TranslatableText>
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            <TranslatableText staticKey="tripDetails.confirmDeleteDesc">Are you sure you want to delete this trip? This action cannot be undone.</TranslatableText>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            <TranslatableText staticKey="tripDetails.cancel">Cancel</TranslatableText>
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteTrip}>
                            <TranslatableText staticKey="tripDetails.delete">Delete</TranslatableText>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>

            {/* Owner Management Modals */}
            {isOwner && (
              <>
                {/* Add Images Modal */}
                <Dialog open={isAddImagesModalOpen} onOpenChange={setIsAddImagesModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        <TranslatableText staticKey="tripDetails.addImages">Add Images</TranslatableText>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input type="file" accept="image/*" multiple onChange={onSelectImages} />
                      <Button onClick={handleAddImages} disabled={addingImages || selectedImageFiles.length === 0} className="w-full">
                        <ImagePlus className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <TranslatableText staticKey="tripDetails.uploadImages">Upload Images</TranslatableText>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Add Videos Modal */}
                <Dialog open={isAddVideosModalOpen} onOpenChange={setIsAddVideosModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        <TranslatableText staticKey="tripDetails.addVideos">Add Videos</TranslatableText>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input type="file" accept="video/*" multiple onChange={onSelectVideos} />
                      <Button onClick={handleAddVideos} disabled={addingVideos || selectedVideoFiles.length === 0} className="w-full">
                        <Film className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <TranslatableText staticKey="tripDetails.uploadVideos">Upload Videos</TranslatableText>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Add Tags Modal */}
                <Dialog open={isAddTagsModalOpen} onOpenChange={setIsAddTagsModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        <TranslatableText staticKey="tripDetails.addTags">Add Tags</TranslatableText>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder={t('tripDetails.tagsPlaceholder', 'Example: beach, sunset')}
                        value={newTagsInput}
                        onChange={(e) => setNewTagsInput(e.target.value)}
                        dir={direction}
                      />
                      <Button onClick={handleAddTags} disabled={addingTags || !newTagsInput.trim()} className="w-full">
                        <Tag className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <TranslatableText staticKey="tripDetails.add">Add</TranslatableText>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* Loading/Error States */}
            {tripLoading && (
              <div className="mb-6 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}
            {tripError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  <TranslatableText staticKey="tripDetails.unableToLoadTrip">Unable to load trip details</TranslatableText>
                </AlertTitle>
                <AlertDescription>
                  <TranslatableText staticKey="tripDetails.pleaseRetry">Please try again.</TranslatableText>
                  <Button size="sm" variant="outline" className={`${direction === 'rtl' ? 'mr-3' : 'ml-3'}`} onClick={() => refetchTrip()}>
                    <TranslatableText staticKey="tripDetails.retry">Retry</TranslatableText>
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Stats status */}
            {statsLoading && (
              <div className="mb-6">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            )}
            {statsError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  <TranslatableText staticKey="tripDetails.unableToLoadStats">Unable to load stats</TranslatableText>
                </AlertTitle>
                <AlertDescription>
                  <TranslatableText staticKey="tripDetails.pleaseRetry">Please try again.</TranslatableText>
                  <Button size="sm" variant="outline" className={`${direction === 'rtl' ? 'mr-3' : 'ml-3'}`} onClick={() => refetch()}>
                    <TranslatableText staticKey="tripDetails.retry">Retry</TranslatableText>
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Description */}
            {trip?.caption && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">
                  <TranslatableText staticKey="tripDetails.aboutThisTrip">About This Trip</TranslatableText>
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {trip.caption}
                </p>
              </div>
            )}

            {/* AI Travel Insights */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <TranslatableText staticKey="tripDetails.aiTravelInsights">AI Travel Insights</TranslatableText>
                </h2>
                <div className="flex items-center gap-2">
                  {trip?.tourism_info ? (
                    <></>
                  ) : (
                    <Button size="sm" onClick={() => handleGenerateTourismInfo()} disabled={generatingInfo || tripLoading}>
                      <Sparkles className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      <TranslatableText staticKey="tripDetails.generateInsights">Generate Insights</TranslatableText>
                    </Button>
                  )}
                </div>
              </div>
              {generatingInfo && (
                <div className="space-y-2 mb-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-20 w-full" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              )}
              {trip?.tourism_info ? (
                <div className="space-y-4">
                  {trip.tourism_info?.description && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                          <p className="text-gray-700 leading-relaxed">
                            <TranslatableText staticKey="tripDetails.tourismInfoDescription">
                              {trip.tourism_info.description}
                            </TranslatableText>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trip.tourism_info?.recommended_places?.length ? (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4" />
                            <h3 className="font-medium text-gray-900">
                              <TranslatableText staticKey="tripDetails.recommendedPlaces">Recommended Places</TranslatableText>
                            </h3>
                          </div>
                          <ul className="list-disc pl-5 space-y-1 text-gray-700" dir={direction}>
                            {trip.tourism_info.recommended_places.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ) : null}
                    {trip.tourism_info?.warnings?.length ? (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <h3 className="font-medium text-gray-900">
                              <TranslatableText staticKey="tripDetails.warnings">Warnings</TranslatableText>
                            </h3>
                          </div>
                          <ul className="list-disc pl-5 space-y-1 text-gray-700" dir={direction}>
                            {trip.tourism_info.warnings.map((w, i) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {trip.tourism_info?.best_time_to_visit ? (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-gray-800">
                            <CalendarDays className="h-4 w-4" />
                            <span className="font-medium">
                              <TranslatableText staticKey="tripDetails.bestTimeToVisit">Best Time to Visit</TranslatableText>:
                            </span>
                            <span className="text-gray-700">{trip.tourism_info.best_time_to_visit}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null}
                    {trip.tourism_info?.currency ? (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-gray-800">
                            <CircleDollarSign className="h-4 w-4" />
                            <span className="font-medium">
                              <TranslatableText staticKey="tripDetails.currency">Currency</TranslatableText>:
                            </span>
                            <span className="text-gray-700">{trip.tourism_info.currency}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null}
                    {trip.tourism_info?.language ? (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-gray-800">
                            <Languages className="h-4 w-4" />
                            <span className="font-medium">
                              <TranslatableText staticKey="tripDetails.language">Language</TranslatableText>:
                            </span>
                            <span className="text-gray-700">{trip.tourism_info.language}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>
                  {trip.tourism_info?.local_tips?.length ? (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <h3 className="font-medium text-gray-900">
                            <TranslatableText staticKey="tripDetails.localTips">Local Tips</TranslatableText>
                          </h3>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700" dir={direction}>
                          {trip.tourism_info.local_tips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              ) : (
                !generatingInfo && (
                  <div className="text-gray-600 text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <TranslatableText staticKey="tripDetails.noInsightsYet">No insights yet. Generate AI travel insights for this location.</TranslatableText>
                  </div>
                )
              )}
            </div>

            {/* Tags */}
            {trip?.tags?.length ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  <TranslatableText staticKey="tripDetails.tags">Tags</TranslatableText>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trip.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.tripTag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Additional Media */}
            {(otherImages.length > 0 || hasVideo) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  <TranslatableText staticKey="tripDetails.additionalMedia">Additional Media</TranslatableText>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {otherImages.map((img, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                      <img
                        src={img.image}
                        alt={`image-${index + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {isOwner && (
                        <button
                          className={`absolute top-2 ${direction === 'rtl' ? 'left-2' : 'right-2'} bg-white/80 hover:bg-white text-red-600 rounded p-1 opacity-0 group-hover:opacity-100 transition`}
                          onClick={() => handleDeleteImage(img.id)}
                          title={t('tripDetails.delete', 'Delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {trip?.videos?.map((v) => (
                    <div key={v.id} className="relative aspect-video rounded-lg overflow-hidden group">
                      <video src={v.video} className="w-full h-full object-cover" controls />
                      {isOwner && (
                        <button
                          className={`absolute top-2 ${direction === 'rtl' ? 'left-2' : 'right-2'} bg-white/80 hover:bg-white text-red-600 rounded p-1 opacity-0 group-hover:opacity-100 transition`}
                          onClick={() => handleDeleteVideo(v.id)}
                          title={t('tripDetails.delete', 'Delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manage Tags (with delete) */}
            {isOwner && trip?.tags?.length ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  <TranslatableText staticKey="tripDetails.manageTags">Manage Tags</TranslatableText>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trip.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="flex items-center gap-2">
                      {tag.tripTag}
                      <button className="text-red-600" title="Delete" onClick={() => handleDeleteTag(tag.id)}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <CommentSection tripId={tripId!} />

        {/* Likes Modal */}
        <Dialog open={likesOpen} onOpenChange={setLikesOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                <TranslatableText staticKey="tripDetails.tripLikes">Trip Likes</TranslatableText>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {likesLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}
              {likesError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    <TranslatableText staticKey="tripDetails.unableToLoadLikes">Unable to load likes</TranslatableText>
                  </AlertTitle>
                  <AlertDescription>
                    <TranslatableText staticKey="tripDetails.errorLoadingLikes">An error occurred while loading. Please try again.</TranslatableText>
                    <Button size="sm" variant="outline" className={`${direction === 'rtl' ? 'mr-2' : 'ml-2'}`} onClick={() => refetchLikes()}>
                      <TranslatableText staticKey="tripDetails.retry">Retry</TranslatableText>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {!likesLoading && !likesError && (
                <div className="divide-y">
                  {(likesData?.results || []).map((like) => {
                    const isFollowing = like.is_following;
                    const canFollow = user && String(user.id) !== String(like.user.id);
                    const toggleFollow = async () => {
                      try {
                        if (isFollowing) {
                          await unfollowUser({ user_id: like.user.id }).unwrap();
                        } else {
                          await followUser({ user_id: like.user.id }).unwrap();
                        }
                        refetchLikes();
                      } catch (e) {
                        toast({
                          title: t('tripDetails.error', 'Error'),
                          description: t('tripDetails.failedToUpdateFollow', 'Failed to update follow status.')
                        });
                      }
                    };
                    return (
                      <div key={like.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={''} alt={like.user.username} />
                            <AvatarFallback>{like.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{like.user.username}</span>
                              {like.user.is_verified && (
                                <Badge variant="secondary" className="text-[10px]">
                                  <TranslatableText staticKey="tripDetails.verified">Verified</TranslatableText>
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              <TranslatableText staticKey="tripDetails.since">Since</TranslatableText> {new Date(like.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {canFollow && (
                          <Button size="sm" variant={isFollowing ? 'outline' : 'default'} onClick={toggleFollow} disabled={following || unfollowing}>
                            {isFollowing ? (
                              <>
                                <UserMinus className={`h-4 w-4 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                                <TranslatableText staticKey="tripDetails.unfollow">Unfollow</TranslatableText>
                              </>
                            ) : (
                              <>
                                <UserPlus className={`h-4 w-4 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                                <TranslatableText staticKey="tripDetails.follow">Follow</TranslatableText>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {likesData && likesData.results.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <TranslatableText staticKey="tripDetails.noLikesYet">No likes yet</TranslatableText>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TripDetails;