import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, User } from '@/contexts/AuthContext';
import { Camera, Settings } from 'lucide-react';
import { useGetMyProfileQuery, useGetMyProfileDetailsQuery, useUpdateMyProfileMutation, useUpdateMyProfileDetailsMutation } from '@/store/userApi';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';

interface EditProfileDialogProps {
  trigger?: React.ReactNode;
}

const EditProfileDialog = ({ trigger }: EditProfileDialogProps) => {
  const { user, login } = useAuth();
  const { direction, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Remote data
  const { data: mainProfile } = useGetMyProfileQuery();
  const { data: detailsProfile } = useGetMyProfileDetailsQuery();
  const [updateMain, { isLoading: isSavingMain }] = useUpdateMyProfileMutation();
  const [updateDetails, { isLoading: isSavingDetails }] = useUpdateMyProfileDetailsMutation();

  // Form state
  const [formData, setFormData] = useState({
    username: mainProfile?.username || user?.name || '',
    email: mainProfile?.email || user?.email || '',
    bio: detailsProfile?.bio || '',
    first_name: detailsProfile?.first_name || '',
    last_name: detailsProfile?.last_name || '',
    country: detailsProfile?.country || '',
    gender: detailsProfile?.gender || '',
  });

  // Sync form when queries resolve
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      username: mainProfile?.username ?? prev.username,
      email: mainProfile?.email ?? prev.email,
      bio: detailsProfile?.bio ?? prev.bio,
      first_name: detailsProfile?.first_name ?? prev.first_name,
      last_name: detailsProfile?.last_name ?? prev.last_name,
      country: detailsProfile?.country ?? prev.country,
      gender: detailsProfile?.gender ?? prev.gender,
    }));
  }, [mainProfile, detailsProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Build details payload
      let detailsPromise: ReturnType<typeof updateDetails>;
      if (avatarFile) {
        const fd = new FormData();
        fd.append('first_name', formData.first_name);
        fd.append('last_name', formData.last_name);
        fd.append('bio', formData.bio);
        fd.append('country', formData.country);
        fd.append('gender', formData.gender);
        fd.append('avatar', avatarFile);
        detailsPromise = updateDetails(fd);
      } else {
        // Omit avatar when not a file to avoid 400
        detailsPromise = updateDetails({
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          country: formData.country,
          gender: formData.gender,
        } as any);
      }

      const [updatedMain, updatedDetails] = await Promise.all([
        updateMain({ username: formData.username }).unwrap(),
        detailsPromise.unwrap(),
      ]);

      const updatedUser: User = {
        ...user,
        name: updatedMain.username,
        email: updatedMain.email,
        avatar: (updatedDetails as any).avatar || user.avatar,
        isVerified: updatedMain.is_verified,
        role: user.role,
        id: user.id,
      };

      login(updatedUser);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button>
      <Settings className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
      <TranslatableText staticKey="editProfile.editProfile">Edit Profile</TranslatableText>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir={direction}>
        <DialogHeader>
          <DialogTitle>
            <TranslatableText staticKey="editProfile.title">Edit Profile</TranslatableText>
          </DialogTitle>
          <DialogDescription>
            <TranslatableText staticKey="editProfile.description">Make changes to your profile here. Click save when you're done.</TranslatableText>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4`}>
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarFile ? URL.createObjectURL(avatarFile) : (detailsProfile?.avatar || user?.avatar || '')} alt={formData.username} />
              <AvatarFallback className="text-lg">{(formData.first_name || formData.username || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="avatar">
                <TranslatableText staticKey="editProfile.profilePicture">Profile Picture</TranslatableText>
              </Label>
              <Input id="avatar" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
              <p className="text-xs text-muted-foreground">
                <TranslatableText staticKey="editProfile.uploadNewPicture">Upload a new profile picture (optional)</TranslatableText>
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                <TranslatableText staticKey="editProfile.username">Username</TranslatableText>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder={t('editProfile.usernamePlaceholder', 'your_username')}
                dir={direction}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <TranslatableText staticKey="editProfile.email">Email</TranslatableText>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                placeholder={t('editProfile.emailPlaceholder', 'your@email.com')}
                dir={direction}
                className="bg-muted cursor-not-allowed"
              />
            </div>
          </div>

          {/* Personal Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                <TranslatableText staticKey="editProfile.firstName">First name</TranslatableText>
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder={t('editProfile.firstNamePlaceholder', 'First name')}
                dir={direction}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">
                <TranslatableText staticKey="editProfile.lastName">Last name</TranslatableText>
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder={t('editProfile.lastNamePlaceholder', 'Last name')}
                dir={direction}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">
                <TranslatableText staticKey="editProfile.country">Country</TranslatableText>
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder={t('editProfile.countryPlaceholder', 'Country')}
                dir={direction}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">
                <TranslatableText staticKey="editProfile.gender">Gender</TranslatableText>
              </Label>
              <Input
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                placeholder={t('editProfile.genderPlaceholder', 'Gender')}
                dir={direction}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              <TranslatableText staticKey="editProfile.bio">Bio</TranslatableText>
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder={t('editProfile.bioPlaceholder', 'Tell us about yourself...')}
              rows={3}
              dir={direction}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/160 <TranslatableText staticKey="editProfile.charactersCount">characters</TranslatableText>
            </p>
          </div>
        </div>

        <DialogFooter className={direction === 'rtl' ? 'flex-row-reverse' : ''}>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            <TranslatableText staticKey="editProfile.cancel">Cancel</TranslatableText>
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSavingMain || isSavingDetails}>
            <TranslatableText staticKey={isLoading || isSavingMain || isSavingDetails ? 'editProfile.saving' : 'editProfile.saveChanges'}>
              {isLoading || isSavingMain || isSavingDetails ? 'Saving...' : 'Save Changes'}
            </TranslatableText>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;