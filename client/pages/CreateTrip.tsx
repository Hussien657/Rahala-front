import { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import {
  Camera,
  MapPin,
  Calendar,
  Star,
  Upload,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';
import { useCreateTripMutation } from '@/store/tripsApi';
import { toast } from '@/components/ui/use-toast';
import { validateRequired, focusFirstInvalid } from '@/lib/validation';

const CreateTrip = () => {
  const { user } = useAuth();
  const { direction, t } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: {
      city: '',
      country: ''
    },
    category: '',
    duration: '',
    rating: 5,
    tags: [] as string[],
    images: [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  const [errors, setErrors] = useState<{ title: string | null; description: string | null; city: string | null; country: string | null }>({ title: null, description: null, city: null, country: null });

  const [createTrip, { isLoading: creating }] = useCreateTripMutation();

  const categories = [
    'Adventure', 'Beach', 'Culture', 'Nature', 'City', 'Food', 'History', 'Photography'
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        } as any
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const onSelectImages: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles(prev => [...prev, ...files]);
  };

  const onSelectVideos: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setVideoFiles(prev => [...prev, ...files]);
  };

  useEffect(() => {
    const next = imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => {
      // Revoke previous URLs to avoid memory leaks
      prev.forEach(url => URL.revokeObjectURL(url));
      return next;
    });
    return () => {
      next.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  useEffect(() => {
    const next = videoFiles.map(file => URL.createObjectURL(file));
    setVideoPreviews(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return next;
    });
    return () => {
      next.forEach(url => URL.revokeObjectURL(url));
    };
  }, [videoFiles]);

  const removeSelectedImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const removeSelectedVideo = (idx: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    const atLeastOneOfTitleOrDesc = (formData.title || '').trim() || (formData.description || '').trim();
    const titleOrDescError = t('createTrip.titleOrDescRequired', 'Provide a title or description');
    const cityLabel = t('createTrip.city', 'City');
    const countryLabel = t('createTrip.country', 'Country');

    const nextErrors = {
      title: !atLeastOneOfTitleOrDesc ? titleOrDescError : null,
      description: !atLeastOneOfTitleOrDesc ? titleOrDescError : null,
      city: validateRequired(cityLabel, formData.location.city),
      country: validateRequired(countryLabel, formData.location.country),
    };
    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) {
      focusFirstInvalid(['title', 'description', 'city', 'country'], nextErrors as any);
      toast({ title: t('createTrip.validationError', 'Please correct the highlighted fields') });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      const caption = formData.title || formData.description || '';
      const locationStr = [formData.location.city, formData.location.country].filter(Boolean).join(', ');
      fd.append('caption', caption);
      fd.append('location', locationStr);
      formData.tags.forEach(tag => fd.append('tags', tag));
      imageFiles.forEach((file) => fd.append('images', file, file.name));
      videoFiles.forEach((file) => fd.append('videos', file, file.name));

      await createTrip(fd).unwrap();
      toast({
        title: t('createTrip.successTitle', 'Success'),
        description: t('createTrip.successMessage', 'Your trip has been posted successfully! 🎉')
      });
      navigate('/feed');
    } catch (error) {
      console.error('Failed to create trip:', error);
      toast({
        title: t('createTrip.errorTitle', 'Error'),
        description: t('createTrip.errorMessage', 'An error occurred while posting the trip. Please try again.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/feed">
            <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            <TranslatableText staticKey="createTrip.backToFeed">Back to Feed</TranslatableText>
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
              <Camera className="h-6 w-6" />
              <span><TranslatableText staticKey="createTrip.title">Share Your Trip</TranslatableText></span>
            </CardTitle>
            <p className="text-gray-600">
              <TranslatableText staticKey="createTrip.subtitle">Share your travel experience with the community and inspire others!</TranslatableText>
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  <TranslatableText staticKey="createTrip.tripTitle">Trip Title</TranslatableText> *
                </Label>
                <Input
                  id="title"
                  placeholder={t('createTrip.tripTitlePlaceholder', 'Example: Unforgettable Adventure in the Alps')}
                  value={formData.title}
                  onChange={(e) => {
                    handleInputChange('title', e.target.value);
                    if (errors.title || errors.description) {
                      const filled = (e.target.value || '').trim() || (formData.description || '').trim();
                      const errorMsg = t('createTrip.titleOrDescRequired', 'Provide a title or description');
                      setErrors(prev => ({ ...prev, title: filled ? null : errorMsg, description: filled ? null : errorMsg }));
                    }
                  }}
                  aria-invalid={!!errors.title}
                  aria-describedby="title-error"
                  required
                  dir={direction}
                />
                {errors.title && (
                  <p id="title-error" className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    <TranslatableText staticKey="createTrip.city">City</TranslatableText> *
                  </Label>
                  <Input
                    id="city"
                    placeholder={t('createTrip.cityPlaceholder', 'Example: Interlaken')}
                    value={formData.location.city}
                    onChange={(e) => {
                      handleInputChange('location.city', e.target.value);
                      if (errors.city) {
                        const cityLabel = t('createTrip.city', 'City');
                        setErrors(prev => ({ ...prev, city: validateRequired(cityLabel, e.target.value) }));
                      }
                    }}
                    aria-invalid={!!errors.city}
                    aria-describedby="city-error"
                    required
                    dir={direction}
                  />
                  {errors.city && (
                    <p id="city-error" className="text-sm text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">
                    <TranslatableText staticKey="createTrip.country">Country</TranslatableText> *
                  </Label>
                  <Input
                    id="country"
                    placeholder={t('createTrip.countryPlaceholder', 'Example: Switzerland')}
                    value={formData.location.country}
                    onChange={(e) => {
                      handleInputChange('location.country', e.target.value);
                      if (errors.country) {
                        const countryLabel = t('createTrip.country', 'Country');
                        setErrors(prev => ({ ...prev, country: validateRequired(countryLabel, e.target.value) }));
                      }
                    }}
                    aria-invalid={!!errors.country}
                    aria-describedby="country-error"
                    required
                    dir={direction}
                  />
                  {errors.country && (
                    <p id="country-error" className="text-sm text-red-600 mt-1">{errors.country}</p>
                  )}
                </div>
              </div>

              {/* Category and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    <TranslatableText staticKey="createTrip.category">Category</TranslatableText> *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        type="button"
                        variant={formData.category === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange('category', category)}
                        className="justify-start"
                      >
                        <TranslatableText staticKey={`categories.${category.toLowerCase()}`}>{category}</TranslatableText>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    <TranslatableText staticKey="createTrip.duration">Trip Duration</TranslatableText> *
                  </Label>
                  <Input
                    id="duration"
                    placeholder={t('createTrip.durationPlaceholder', 'Example: 7 days')}
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    required
                    dir={direction}
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label><TranslatableText staticKey="createTrip.rating">Your Trip Rating</TranslatableText></Label>
                <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInputChange('rating', rating)}
                      className="p-0"
                    >
                      <Star
                        className={`h-6 w-6 ${rating <= formData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    </Button>
                  ))}
                  <span className={`${direction === 'rtl' ? 'mr-2' : 'ml-2'} text-sm text-gray-600`}>
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  <TranslatableText staticKey="createTrip.description">Trip Description</TranslatableText> *
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('createTrip.descriptionPlaceholder', 'Write a detailed description about your trip, the places you visited, and the experiences you had...')}
                  value={formData.description}
                  onChange={(e) => {
                    handleInputChange('description', e.target.value);
                    if (errors.title || errors.description) {
                      const filled = (formData.title || '').trim() || (e.target.value || '').trim();
                      const errorMsg = t('createTrip.titleOrDescRequired', 'Provide a title or description');
                      setErrors(prev => ({ ...prev, title: filled ? null : errorMsg, description: filled ? null : errorMsg }));
                    }
                  }}
                  rows={5}
                  aria-invalid={!!errors.description}
                  aria-describedby="description-error"
                  required
                  dir={direction}
                />
                {errors.description && (
                  <p id="description-error" className="text-sm text-red-600 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Media Upload */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} gap-2`}>
                    <Camera className="h-4 w-4" />
                    <TranslatableText staticKey="createTrip.images">Images</TranslatableText>
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <Input type="file" accept="image/*" multiple onChange={onSelectImages} className="cursor-pointer" />
                      <Button type="button" variant="outline" className="shrink-0">
                        <Upload className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <TranslatableText staticKey="createTrip.upload">Upload</TranslatableText>
                      </Button>
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative group">
                            <img src={src} alt={`preview-${idx}`} className="w-full h-32 object-cover rounded-lg" />
                            <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeSelectedImage(idx)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} gap-2`}>
                    <Camera className="h-4 w-4" />
                    <TranslatableText staticKey="createTrip.videos">Videos</TranslatableText>
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <Input type="file" accept="video/*" multiple onChange={onSelectVideos} className="cursor-pointer" />
                      <Button type="button" variant="outline" className="shrink-0">
                        <Upload className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <TranslatableText staticKey="createTrip.upload">Upload</TranslatableText>
                      </Button>
                    </div>
                    {videoPreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {videoPreviews.map((src, idx) => (
                          <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden">
                            <video src={src} className="w-full h-full object-cover" controls />
                            <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeSelectedVideo(idx)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label><TranslatableText staticKey="createTrip.tags">Tags</TranslatableText></Label>
                <div className="space-y-4">
                  <div className={`flex ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                    <Input
                      placeholder={t('createTrip.addTag', 'Add a tag...')}
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      dir={direction}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                          <span>{tag}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto ml-1"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className={`flex ${direction === 'rtl' ? 'justify-start space-x-reverse' : 'justify-end'} space-x-4 pt-6`}>
                <Button type="button" variant="outline" onClick={() => navigate('/feed')}>
                  <TranslatableText staticKey="createTrip.cancel">Cancel</TranslatableText>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || creating || (!formData.title && !formData.description) || (!formData.location.city && !formData.location.country)}
                  className="min-w-[120px]"
                >
                  {isSubmitting || creating ?
                    <TranslatableText staticKey="createTrip.posting">Posting...</TranslatableText> :
                    <TranslatableText staticKey="createTrip.postTrip">Post Trip</TranslatableText>
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTrip;
