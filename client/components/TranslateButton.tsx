import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages, RotateCcw, Loader2 } from 'lucide-react';
import { detectLanguage, containsArabic, containsEnglish } from '@/lib/translation';

interface TranslateButtonProps {
  text: string;
  onTranslatedTextChange?: (translatedText: string, isTranslated: boolean) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
}

const TranslateButton: React.FC<TranslateButtonProps> = ({
  text,
  onTranslatedTextChange,
  className = '',
  variant = 'outline',
  size = 'sm',
  showIcon = true
}) => {
  const { language, direction, translateText, t, isTranslating } = useLanguage();
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Determine if translation is needed and possible
  const canTranslate = () => {
    if (!text || text.trim() === '') return false;

    // Check if text contains translatable content
    const hasArabic = containsArabic(text);
    const hasEnglish = containsEnglish(text);

    if (language === 'ar') {
      // If current language is Arabic, can translate English text to Arabic
      return hasEnglish && !hasArabic;
    } else {
      // If current language is English, can translate Arabic text to English
      return hasArabic && !hasEnglish;
    }
  };

  const handleTranslate = async () => {
    if (!canTranslate()) return;

    setIsLoading(true);
    try {
      if (isTranslated) {
        // Show original text
        setIsTranslated(false);
        setTranslatedText('');
        onTranslatedTextChange?.(text, false);
      } else {
        // Translate text
        const sourceLang = detectLanguage(text);
        const targetLang = language;

        const translated = await translateText(text, sourceLang, targetLang);
        setTranslatedText(translated);
        setIsTranslated(true);
        onTranslatedTextChange?.(translated, true);
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if translation is not possible
  if (!canTranslate()) {
    return null;
  }

  const buttonText = isTranslated
    ? t('trip.showOriginal', 'Show Original')
    : t('trip.translate', 'Translate');

  const isButtonLoading = isLoading || isTranslating;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleTranslate}
      disabled={isButtonLoading}
      className={`${className} ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}
      dir={direction}
    >
      {isButtonLoading ? (
        <>
          <Loader2 className={`h-4 w-4 animate-spin ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
          {t('trip.translating', 'Translating...')}
        </>
      ) : (
        <>
          {showIcon && (
            isTranslated ? (
              <RotateCcw className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            ) : (
              <Languages className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            )
          )}
          {buttonText}
        </>
      )}
    </Button>
  );
};

export default TranslateButton;