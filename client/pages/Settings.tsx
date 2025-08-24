import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
  const { direction, t, language } = useLanguage();
  const [changePassword, { isLoading: isChanging }] = useChangePasswordMutation();
  const [notifications, setNotifications] = useState({
    email: true
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState<{ current: string | null; next: string | null; confirm: string | null }>({ current: null, next: null, confirm: null });

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={direction}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">
            <TranslatableText staticKey="settings.loading" fallback="Loading settings...">جاري تحميل الإعدادات...</TranslatableText>
          </p>
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
      toast({ title: t('settings.correctFields', 'يرجى تصحيح الحقول المميزة') });
      return;
    }
    try {
      await changePassword({ current_password: passwordForm.current, new_password: passwordForm.next }).unwrap();
      toast({ 
        title: t('settings.passwordUpdated', 'تم تحديث كلمة المرور'), 
        description: t('settings.passwordUpdatedDesc', 'تم تغيير كلمة المرور بنجاح') 
      });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setPasswordErrors({ current: null, next: null, confirm: null });
    } catch (e) {
      toast({ 
        title: t('settings.passwordFailed', 'فشل تغيير كلمة المرور'), 
        description: t('settings.passwordFailedDesc', 'يرجى التحقق من كلمة المرور الحالية والمحاولة مرة أخرى') 
      });
    }
  };

  // مكون التبديل المخصص للغة العربية
  const RtlSwitch = ({ checked, onCheckedChange, id }: { checked: boolean; onCheckedChange: (checked: boolean) => void; id?: string }) => {
    return (
      <div className="relative inline-flex items-center">
        <button
          id={id}
          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            checked ? 'bg-primary' : 'bg-input'
          }`}
          onClick={() => onCheckedChange(!checked)}
          type="button"
          role="switch"
          aria-checked={checked}
        >
          <span
            className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
              checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={direction} key={`settings-${language}`}>
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
        <div className={`mb-8 text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
          <h1 className={`text-3xl font-bold text-gray-900 flex items-center justify-center ${direction === 'rtl' ? 'md:justify-end' : 'md:justify-start'}`}>
            <SettingsIcon className={`h-8 w-8 ${direction === 'rtl' ? 'ml-3' : 'mr-3'}`} />
            <TranslatableText staticKey="settings.title" fallback="Settings">الإعدادات</TranslatableText>
          </h1>
          <p className="text-gray-600 mt-2">
            <TranslatableText staticKey="settings.subtitle" fallback="Manage your account settings and preferences">إدارة إعدادات حسابك وتفضيلاتك</TranslatableText>
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className={`text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-center ${direction === 'rtl' ? 'md:justify-end' : 'md:justify-start'}`}>
                <User className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="settings.profile" fallback="Profile Information">معلومات الملف الشخصي</TranslatableText>
              </CardTitle>
              <CardDescription className={`text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
                <TranslatableText staticKey="settings.profileDesc" fallback="Update your personal information and profile details">تحديث معلوماتك الشخصية وتفاصيل ملفك الشخصي</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex flex-col md:flex-row items-center space-y-4 md:space-y-0 ${direction === 'rtl' ? 'md:space-x-reverse md:space-x-4' : 'md:space-x-4'}`}>
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={`flex-1 text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    <TranslatableText staticKey="settings.memberSince" fallback="Member since">عضو منذ</TranslatableText> <TranslatableText staticKey="settings.memberSinceDate" fallback="March 2022">مارس 2022</TranslatableText>
                  </p>
                </div>
                <EditProfileDialog trigger={
                  <Button variant="outline" className="mt-4 md:mt-0">
                    <SettingsIcon className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    <TranslatableText staticKey="settings.editProfile" fallback="Edit Profile">تعديل الملف</TranslatableText>
                  </Button>
                } />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center justify-center ${direction === 'rtl' ? 'md:justify-end' : 'md:justify-start'}`}>
                <Bell className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="settings.notifications" fallback="Notifications">الإشعارات</TranslatableText>
              </CardTitle>
              <CardDescription className={`text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
                <TranslatableText staticKey="settings.notificationsDesc" fallback="Choose which notifications you want to receive">اختر الإشعارات التي تريد تلقيها</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 ${direction === 'rtl' ? 'md:flex-row-reverse' : ''}`}>
                <div className={`space-y-0.5 text-center ${direction === 'rtl' ? 'md:text-right md:order-1' : 'md:text-left md:order-1'} order-2`}>
                  <Label><TranslatableText staticKey="settings.emailNotifications" fallback="Email Notifications">إشعارات البريد الإلكتروني</TranslatableText></Label>
                  <p className="text-sm text-gray-600">
                    <TranslatableText staticKey="settings.emailNotificationsDesc" fallback="Receive notifications via email">تلقي الإشعارات عبر البريد الإلكتروني</TranslatableText>
                  </p>
                </div>
                <div className={`${direction === 'rtl' ? 'md:order-2' : 'md:order-2'} order-1`}>
                  <RtlSwitch
                    checked={notifications.email}
                    onCheckedChange={(value) => handleNotificationChange('email', value)}
                    id="email-notifications"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center justify-center ${direction === 'rtl' ? 'md:justify-end' : 'md:justify-start'}`}>
                <Lock className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="settings.changePassword" fallback="Change Password">تغيير كلمة المرور</TranslatableText>
              </CardTitle>
              <CardDescription className={`text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
                <TranslatableText staticKey="settings.changePasswordDesc" fallback="Update your password to keep your account secure">قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4 max-w-lg mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className={`w-full block ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <TranslatableText staticKey="settings.currentPassword" fallback="Current Password">كلمة المرور الحالية</TranslatableText>
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
                    className={direction === 'rtl' ? 'text-right' : 'text-left'}
                  />
                  {passwordErrors.current && (
                    <p id="current-password-error" className={`text-sm text-red-600 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{passwordErrors.current}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className={`w-full block ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <TranslatableText staticKey="settings.newPassword" fallback="New Password">كلمة المرور الجديدة</TranslatableText>
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
                    className={direction === 'rtl' ? 'text-right' : 'text-left'}
                  />
                  {passwordErrors.next && (
                    <p id="new-password-error" className={`text-sm text-red-600 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{passwordErrors.next}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className={`w-full block ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <TranslatableText staticKey="settings.confirmPassword" fallback="Confirm New Password">تأكيد كلمة المرور الجديدة</TranslatableText>
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
                    className={direction === 'rtl' ? 'text-right' : 'text-left'}
                  />
                  {passwordErrors.confirm && (
                    <p id="confirm-password-error" className={`text-sm text-red-600 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{passwordErrors.confirm}</p>
                  )}
                </div>
                <div className={`flex justify-center ${direction === 'rtl' ? 'md:justify-start' : 'md:justify-end'}`}>
                  <Button type="submit" disabled={isChanging}>
                    <TranslatableText staticKey="settings.updatePassword" fallback="Update Password">تحديث كلمة المرور</TranslatableText>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <LanguageSelector />

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center text-red-600 justify-center ${direction === 'rtl' ? 'md:justify-end' : 'md:justify-start'}`}>
                <Trash2 className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <TranslatableText staticKey="settings.danger" fallback="Danger Zone">منطقة الخطر</TranslatableText>
              </CardTitle>
              <CardDescription className={`text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'}`}>
                <TranslatableText staticKey="settings.dangerDesc" fallback="Irreversible and destructive actions">إجراءات لا رجعة فيها وتدميرية</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex flex-col md:flex-row items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 ${direction === 'rtl' ? 'md:flex-row-reverse' : ''}`}>
                <div className={`text-center ${direction === 'rtl' ? 'md:text-right' : 'md:text-left'} mb-4 md:mb-0`}>
                  <h4 className="font-semibold text-red-800">
                    <TranslatableText staticKey="settings.deleteAccount" fallback="Delete Account">حذف الحساب</TranslatableText>
                  </h4>
                  <p className="text-sm text-red-600">
                    <TranslatableText staticKey="settings.deleteAccountDesc" fallback="Permanently delete your account and all data">احذف حسابك وبياناتك بشكل دائم</TranslatableText>
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      <TranslatableText staticKey="settings.deleteAccount" fallback="Delete Account">حذف الحساب</TranslatableText>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir={direction}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        <TranslatableText staticKey="settings.deleteConfirmTitle" fallback="Are you absolutely sure?">هل أنت متأكد تمامًا؟</TranslatableText>
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        <TranslatableText staticKey="settings.deleteConfirmDesc" fallback="This action cannot be undone. This will permanently delete your account and remove your data from our servers.">لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف حسابك بشكل دائم وإزالة بياناتك من خوادمنا.</TranslatableText>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className={direction === 'rtl' ? 'flex-row-reverse' : ''}>
                      <AlertDialogCancel>
                        <TranslatableText staticKey="common.cancel" fallback="Cancel">إلغاء</TranslatableText>
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>
                        <TranslatableText staticKey="common.delete" fallback="Delete">حذف</TranslatableText>
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
                  <TranslatableText staticKey="settings.signOut" fallback="Sign Out">تسجيل الخروج</TranslatableText>
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