import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import { Button } from '@/components/ui/button';

const SimpleTranslationTest: React.FC = () => {
  const { language, direction, setLanguage } = useLanguage();

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="p-8" dir={direction}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Simple Translation Test</h1>
        
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p><strong>Current Language:</strong> {language}</p>
          <p><strong>Direction:</strong> {direction}</p>
          <Button onClick={handleLanguageToggle} className="mt-2">
            Switch to {language === 'en' ? 'Arabic' : 'English'}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">
              <TranslatableText staticKey="settings.title" fallback="Settings">الإعدادات</TranslatableText>
            </h2>
            <p>
              <TranslatableText staticKey="settings.subtitle" fallback="Manage your account settings and preferences">إدارة إعدادات حسابك وتفضيلاتك</TranslatableText>
            </p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">
              <TranslatableText staticKey="settings.profile" fallback="Profile Information">معلومات الملف الشخصي</TranslatableText>
            </h3>
            <p>
              <TranslatableText staticKey="settings.profileDesc" fallback="Update your personal information and profile details">تحديث معلوماتك الشخصية وتفاصيل ملفك الشخصي</TranslatableText>
            </p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">
              <TranslatableText staticKey="settings.notifications" fallback="Notifications">الإشعارات</TranslatableText>
            </h3>
            <p>
              <TranslatableText staticKey="settings.notificationsDesc" fallback="Choose which notifications you want to receive">اختر الإشعارات التي تريد تلقيها</TranslatableText>
            </p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">
              <TranslatableText staticKey="settings.changePassword" fallback="Change Password">تغيير كلمة المرور</TranslatableText>
            </h3>
            <p>
              <TranslatableText staticKey="settings.changePasswordDesc" fallback="Update your password to keep your account secure">قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك</TranslatableText>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleTranslationTest;
