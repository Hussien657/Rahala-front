import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import { Button } from '@/components/ui/button';

const LanguageTest: React.FC = () => {
  const { language, direction, setLanguage, staticTranslations } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    console.log(`Switching from ${language} to ${newLang}`);
    setLanguage(newLang);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50" dir={direction}>
      <div className="max-w-4xl mx-auto">
        {/* Debug Info */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Language System Test</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Current Language:</strong> {language}
            </div>
            <div>
              <strong>Direction:</strong> {direction}
            </div>
            <div>
              <strong>Document Dir:</strong> {document.documentElement.dir}
            </div>
            <div>
              <strong>Document Lang:</strong> {document.documentElement.lang}
            </div>
            <div>
              <strong>Translations Loaded:</strong> {Object.keys(staticTranslations).length > 0 ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Settings Section:</strong> {staticTranslations.settings ? 'Yes' : 'No'}
            </div>
          </div>
          
          <Button onClick={toggleLanguage} className="mt-4">
            Switch to {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        {/* Translation Tests */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              <TranslatableText staticKey="settings.title" fallback="Settings">الإعدادات</TranslatableText>
            </h2>
            <p className="text-gray-600 mb-4">
              <TranslatableText staticKey="settings.subtitle" fallback="Manage your account settings and preferences">إدارة إعدادات حسابك وتفضيلاتك</TranslatableText>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-2">
                  <TranslatableText staticKey="settings.profile" fallback="Profile Information">معلومات الملف الشخصي</TranslatableText>
                </h3>
                <p className="text-sm text-gray-600">
                  <TranslatableText staticKey="settings.profileDesc" fallback="Update your personal information and profile details">تحديث معلوماتك الشخصية وتفاصيل ملفك الشخصي</TranslatableText>
                </p>
              </div>
              
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-2">
                  <TranslatableText staticKey="settings.notifications" fallback="Notifications">الإشعارات</TranslatableText>
                </h3>
                <p className="text-sm text-gray-600">
                  <TranslatableText staticKey="settings.notificationsDesc" fallback="Choose which notifications you want to receive">اختر الإشعارات التي تريد تلقيها</TranslatableText>
                </p>
              </div>
              
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-2">
                  <TranslatableText staticKey="settings.changePassword" fallback="Change Password">تغيير كلمة المرور</TranslatableText>
                </h3>
                <p className="text-sm text-gray-600">
                  <TranslatableText staticKey="settings.changePasswordDesc" fallback="Update your password to keep your account secure">قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك</TranslatableText>
                </p>
              </div>
              
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-2">
                  <TranslatableText staticKey="settings.danger" fallback="Danger Zone">منطقة الخطر</TranslatableText>
                </h3>
                <p className="text-sm text-gray-600">
                  <TranslatableText staticKey="settings.dangerDesc" fallback="Irreversible and destructive actions">إجراءات لا رجعة فيها وتدميرية</TranslatableText>
                </p>
              </div>
            </div>
          </div>

          {/* Raw Data Display */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Raw Translation Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(staticTranslations.settings || {}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageTest;
