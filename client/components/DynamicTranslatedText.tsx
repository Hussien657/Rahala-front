import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslateButton from './TranslateButton';

interface DynamicTranslatedTextProps {
  children: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  showTranslateButton?: boolean;
  translateButtonProps?: {
    variant?: 'default' | 'outline' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
  };
}

/**
 * Component that displays text with an optional translate button
 * for dynamic content that's not in the static translation files
 */
const DynamicTranslatedText: React.FC<DynamicTranslatedTextProps> = ({
  children,
  className = '',
  as: Component = 'div',
  showTranslateButton = true,
  translateButtonProps = {}
}) => {
  const { direction } = useLanguage();
  const [displayText, setDisplayText] = useState(children);
  const [isTranslated, setIsTranslated] = useState(false);

  const handleTranslatedTextChange = (translatedText: string, translated: boolean) => {
    setDisplayText(translatedText);
    setIsTranslated(translated);
  };

  return (
    <div className={`${direction === 'rtl' ? 'text-right' : 'text-left'}`} dir={direction}>
      <Component className={className}>
        {displayText}
      </Component>

      {showTranslateButton && (
        <div className={`mt-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
          <TranslateButton
            text={children}
            onTranslatedTextChange={handleTranslatedTextChange}
            variant={translateButtonProps.variant || 'outline'}
            size={translateButtonProps.size || 'sm'}
            className={translateButtonProps.className}
          />
        </div>
      )}
    </div>
  );
};

export default DynamicTranslatedText;