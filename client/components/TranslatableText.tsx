import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslatableTextProps {
  children: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  fallback?: string;
  staticKey?: string; // For static translations
}

/**
 * Component for translating static text using translation keys
 * For dynamic content, use DynamicTranslatedText instead
 */
const TranslatableText: React.FC<TranslatableTextProps> = ({
  children,
  className = '',
  as: Component = 'span',
  fallback,
  staticKey
}) => {
  const { direction, t, language, staticTranslations } = useLanguage();

  // Calculate the text to display directly without useState
  const getDisplayText = (): string => {
    if (staticKey) {
      const translation = t(staticKey);

      // If translation is found and different from the key, use it
      if (translation && translation !== staticKey) {
        return translation;
      } else if (fallback) {
        return fallback;
      } else {
        return children;
      }
    } else {
      return children;
    }
  };

  const displayText = getDisplayText();

  return (
    <Component className={className} dir={direction}>
      {displayText}
    </Component>
  );
};

export default TranslatableText;
