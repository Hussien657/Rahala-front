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
  const { direction, t } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(children);

  useEffect(() => {
    // If staticKey is provided, use static translation
    if (staticKey) {
      setTranslatedText(t(staticKey, fallback || children));
    } else {
      // For non-static keys, just use the children as fallback
      setTranslatedText(children);
    }
  }, [children, t, staticKey, fallback]);

  return (
    <Component className={className} dir={direction}>
      {translatedText}
    </Component>
  );
};

export default TranslatableText;
