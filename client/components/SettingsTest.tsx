import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsTest: React.FC = () => {
  const { language, direction, setLanguage, t, staticTranslations } = useLanguage();

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir={direction}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Settings Translation Test</h1>
          
          <div className="mb-4 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
            <p><strong>Current Language:</strong> {language}</p>
            <p><strong>Direction:</strong> {direction}</p>
            <p><strong>Static Translations Loaded:</strong> {Object.keys(staticTranslations).length > 0 ? 'Yes' : 'No'}</p>
            <p><strong>Available Keys:</strong> {Object.keys(staticTranslations).join(', ')}</p>
            
            <Button onClick={handleLanguageToggle} className="mt-4">
              Switch to {language === 'en' ? 'Arabic' : 'English'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Test Card 1 */}
          <Card>
            <CardHeader>
              <CardTitle>
                <TranslatableText staticKey="settings.title" fallback="Settings">الإعدادات</TranslatableText>
              </CardTitle>
              <CardDescription>
                <TranslatableText staticKey="settings.subtitle" fallback="Manage your account settings and preferences">إدارة إعدادات حسابك وتفضيلاتك</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Direct t() function test:</p>
              <ul className="list-disc list-inside mt-2">
                <li>settings.title: "{t('settings.title', 'Settings')}"</li>
                <li>settings.profile: "{t('settings.profile', 'Profile Information')}"</li>
                <li>settings.notifications: "{t('settings.notifications', 'Notifications')}"</li>
                <li>settings.changePassword: "{t('settings.changePassword', 'Change Password')}"</li>
              </ul>
            </CardContent>
          </Card>

          {/* Test Card 2 */}
          <Card>
            <CardHeader>
              <CardTitle>
                <TranslatableText staticKey="settings.profile" fallback="Profile Information">معلومات الملف الشخصي</TranslatableText>
              </CardTitle>
              <CardDescription>
                <TranslatableText staticKey="settings.profileDesc" fallback="Update your personal information and profile details">تحديث معلوماتك الشخصية وتفاصيل ملفك الشخصي</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <TranslatableText staticKey="settings.memberSince" fallback="Member since">عضو منذ</TranslatableText> 
                {' '}
                <TranslatableText staticKey="settings.memberSinceDate" fallback="March 2022">مارس 2022</TranslatableText>
              </p>
            </CardContent>
          </Card>

          {/* Test Card 3 */}
          <Card>
            <CardHeader>
              <CardTitle>
                <TranslatableText staticKey="settings.notifications" fallback="Notifications">الإشعارات</TranslatableText>
              </CardTitle>
              <CardDescription>
                <TranslatableText staticKey="settings.notificationsDesc" fallback="Choose which notifications you want to receive">اختر الإشعارات التي تريد تلقيها</TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <TranslatableText staticKey="settings.emailNotifications" fallback="Email Notifications">إشعارات البريد الإلكتروني</TranslatableText>
              </p>
              <p className="text-sm text-gray-600">
                <TranslatableText staticKey="settings.emailNotificationsDesc" fallback="Receive notifications via email">تلقي الإشعارات عبر البريد الإلكتروني</TranslatableText>
              </p>
            </CardContent>
          </Card>

          {/* Raw Translation Data */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Translation Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(staticTranslations, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsTest;
