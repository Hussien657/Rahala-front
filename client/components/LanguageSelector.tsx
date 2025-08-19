import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Globe, Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/translation';
import { toast } from './ui/use-toast';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t, direction } = useLanguage();
  const [pendingLanguageChange, setPendingLanguageChange] = useState<Language | null>(null);

  // Show toast after language change is complete
  useEffect(() => {
    if (pendingLanguageChange && pendingLanguageChange === language) {
      toast({
        title: t('common.success', 'Success'),
        description: t('settings.languageChanged', 'Language changed successfully'),
      });
      setPendingLanguageChange(null);
    }
  }, [language, pendingLanguageChange, t]);

  const handleLanguageChange = (newLanguage: Language) => {
    setPendingLanguageChange(newLanguage);
    setLanguage(newLanguage);
  };

  const languages = [
    { value: 'en' as Language, label: 'English', nativeLabel: 'English' },
    { value: 'ar' as Language, label: 'Arabic', nativeLabel: 'العربية' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className={`h-5 w-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
          {t('settings.language')}
        </CardTitle>
        <CardDescription>
          {t('settings.languageDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('settings.currentLanguage')}</Label>
            <p className="text-sm text-gray-600">
              {language === 'en' ? 'English' : 'العربية'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language-select">{t('settings.selectLanguage')}</Label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger id="language-select" className="w-full" dir={direction}>
              <SelectValue placeholder={t('settings.selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                    <Languages className="h-4 w-4" />
                    <span>{lang.nativeLabel}</span>
                    {lang.value !== lang.nativeLabel.toLowerCase().slice(0, 2) && (
                      <span className="text-gray-500">({lang.label})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
