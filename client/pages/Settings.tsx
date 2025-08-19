import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EditProfileDialog from '@/components/EditProfileDialog';
import LanguageSelector from '@/components/LanguageSelector';
import TranslatableText from '@/components/TranslatableText';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  Eye,
  Trash2,
  LogOut,
  User
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useChangePasswordMutation } from '@/store/authApi';
import { validatePassword, validatePasswordMatch, validateRequired } from '@/lib/validation';

const Settings = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { direction, t } = useLanguage();
  const [changePassword, { isLoading: isChanging }] = useChangePasswordMutation();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: false
  });
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showLocation: true,
    showEmail: false
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState<{ current: string | null; next: string | null; confirm: string | null }>({ current: null, next: null, confirm: null });

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteAccount = () => {
    // Implement account deletion logic here
    console.log('Delete account requested');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = {
      current: validateRequired('Current password', passwordForm.current),
      next: validatePassword(passwordForm.next),
      confirm: validatePasswordMatch(passwordForm.next, passwordForm.confirm),
    };
    setPasswordErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast({ title: 'Please correct the highlighted fields' });
      return;
    }
    try {
      await changePassword({ current_password: passwordForm.current, new_password: passwordForm.next }).unwrap();
      toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setPasswordErrors({ current: null, next: null, confirm: null });
    } catch (e) {
      toast({ title: 'Failed to change password', description: 'Please check your current password and try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={direction}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className={`h-8 w-8 ${direction === 'rtl' ? 'ml-3' : 'mr-3'}`} />
            <TranslatableText staticKey="settings.title">Settings</TranslatableText>
          </h1>
          <p className="text-gray-600 mt-2">
            <TranslatableText staticKey="settings.subtitle">Manage your account settings and preferences</TranslatableText>
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="settings.profile">Profile Information</TranslatableText>
              </CardTitle>
              <CardDescription>
                <TranslatableText staticKey="settings.profileDesc">Update your personal information and profile details</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">Member since March 2022</p>
                </div>
                <EditProfileDialog trigger={
                  <Button variant="outline">
                    <SettingsIcon className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    <TranslatableText staticKey="settings.editProfile">Edit Profile</TranslatableText>
                  </Button>
                } />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="settings.notifications">Notifications</TranslatableText>
              </CardTitle>
              <CardDescription>
                <TranslatableText staticKey="settings.notificationsDesc">Choose what notifications you want to receive</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label><TranslatableText staticKey="settings.email">Email Notifications</TranslatableText></Label>
                  <p className="text-sm text-gray-600">
                    <TranslatableText staticKey="settings.emailDesc">Receive notifications via email</TranslatableText>
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(value) => handleNotificationChange('email', value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label><TranslatableText staticKey="settings.push">Push Notifications</TranslatableText></Label>
                  <p className="text-sm text-gray-600">
                    <TranslatableText staticKey="settings.pushDesc">Receive push notifications on your device</TranslatableText>
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(value) => handleNotificationChange('push', value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label><TranslatableText staticKey="settings.sms">SMS Notifications</TranslatableText></Label>
                  <p className="text-sm text-gray-600">
                    <TranslatableText staticKey="settings.smsDesc">Receive notifications via SMS</TranslatableText>
                  </p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(value) => handleNotificationChange('sms', value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label><TranslatableText staticKey="settings.marketing">Marketing Emails</TranslatableText></Label>
                  <p className="text-sm text-gray-600">
                    <TranslatableText staticKey="settings.marketingDesc">Receive promotional emails and updates</TranslatableText>
                  </p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(value) => handleNotificationChange('marketing', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="settings.password">Change Password</TranslatableText>
              </CardTitle>
              <CardDescription>
                <TranslatableText staticKey="settings.passwordDesc">Update your password to keep your account secure</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="current-password">
                    <TranslatableText staticKey="settings.currentPassword">Current password</TranslatableText>
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder={t('settings.currentPasswordPlaceholder', 'Enter your current password')}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                    aria-invalid={!!passwordErrors.current}
                    aria-describedby="current-password-error"
                    required
                    dir={direction}
                  />
                  {passwordErrors.current && (
                    <p id="current-password-error" className="text-sm text-red-600">{passwordErrors.current}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">
                    <TranslatableText staticKey="settings.newPassword">New password</TranslatableText>
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder={t('settings.newPasswordPlaceholder', 'Enter a strong password')}
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, next: e.target.value }))}
                    aria-invalid={!!passwordErrors.next}
                    aria-describedby="new-password-error"
                    required
                    dir={direction}
                  />
                  {passwordErrors.next && (
                    <p id="new-password-error" className="text-sm text-red-600">{passwordErrors.next}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    <TranslatableText staticKey="settings.confirmPassword">Confirm new password</TranslatableText>
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder={t('settings.confirmPasswordPlaceholder', 'Confirm your new password')}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                    aria-invalid={!!passwordErrors.confirm}
                    aria-describedby="confirm-password-error"
                    required
                    dir={direction}
                  />
                  {passwordErrors.confirm && (
                    <p id="confirm-password-error" className="text-sm text-red-600">{passwordErrors.confirm}</p>
                  )}
                </div>
                <div className={`flex ${direction === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                  <Button type="submit" disabled={isChanging}>
                    <TranslatableText staticKey="settings.updatePassword">Update Password</TranslatableText>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="settings.privacy">Privacy & Security</TranslatableText>
              </CardTitle>
              <CardDescription>
                <TranslatableText staticKey="settings.privacyDesc">Control who can see your information</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label><TranslatableText staticKey="settings.publicProfile">Public Profile</TranslatableText></Label>
                  <p className="text-sm text-gray-600">
                    <TranslatableText staticKey="settings.publicProfileDesc">Make your profile visible to everyone</TranslatableText>
                  </p>
                </div>
                <Switch
                  checked={privacy.profilePublic}
                  onCheckedChange={(value) => handlePrivacyChange('profilePublic', value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label><TranslatableText staticKey="settings.showLocation">Show Location</TranslatableText></Label>
                  <p className="text-sm text-gray-600">
                    <TranslatableText staticKey="settings.showLocationDesc">Display your location on your profile</TranslatableText>
                  </p>
                </div>
                <Switch
                  checked={privacy.showLocation}
                  onCheckedChange={(value) => handlePrivacyChange('showLocation', value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label><TranslatableText staticKey="settings.showEmail">Show Email</TranslatableText></Label>
                  <p className="text-sm text-gray-600">
                    <TranslatableText staticKey="settings.showEmailDesc">Make your email visible to other users</TranslatableText>
                  </p>
                </div>
                <Switch
                  checked={privacy.showEmail}
                  onCheckedChange={(value) => handlePrivacyChange('showEmail', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <LanguageSelector />

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Trash2 className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="settings.danger">Danger Zone</TranslatableText>
              </CardTitle>
              <CardDescription>
                <TranslatableText staticKey="settings.dangerDesc">Irreversible and destructive actions</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-semibold text-red-800">
                    <TranslatableText staticKey="settings.deleteAccount">Delete Account</TranslatableText>
                  </h4>
                  <p className="text-sm text-red-600">
                    <TranslatableText staticKey="settings.deleteAccountDesc">Permanently delete your account and all data</TranslatableText>
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      <TranslatableText staticKey="settings.deleteAccount">Delete Account</TranslatableText>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        <TranslatableText staticKey="settings.deleteConfirmTitle">Are you absolutely sure?</TranslatableText>
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        <TranslatableText staticKey="settings.deleteConfirmDesc">This action cannot be undone. This will permanently delete your account and remove your data from our servers.</TranslatableText>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        <TranslatableText staticKey="common.cancel">Cancel</TranslatableText>
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>
                        <TranslatableText staticKey="common.delete">Delete</TranslatableText>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Button variant="outline" onClick={logout} className="w-full max-w-sm">
                  <LogOut className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  <TranslatableText staticKey="settings.signOut">Sign Out</TranslatableText>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
