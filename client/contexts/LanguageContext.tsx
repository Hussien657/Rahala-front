import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  translationService,
  loadStaticTranslations,
  getNestedTranslation,
  detectLanguage,
  type Language
} from '@/lib/translation';

export type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  isTranslating: boolean;
  staticTranslations: any;
  setLanguage: (lang: Language) => void;
  translateText: (text: string, sourceLang?: Language, targetLang?: Language) => Promise<string>;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);



interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const [staticTranslations, setStaticTranslations] = useState<any>({});

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  // Load static translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await loadStaticTranslations(language);
        setStaticTranslations(translations);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    loadTranslations();
  }, [language]);

  // Update document direction and language when language changes
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const translateText = async (
    text: string,
    sourceLang?: Language,
    targetLang?: Language
  ): Promise<string> => {
    if (!text.trim()) return text;

    // Auto-detect source language if not provided
    const detectedSourceLang = sourceLang || detectLanguage(text);
    const finalTargetLang = targetLang || language;

    // If source and target are the same, return original text
    if (detectedSourceLang === finalTargetLang) {
      return text;
    }

    setIsTranslating(true);
    try {
      const translated = await translationService.translateText(text, detectedSourceLang, finalTargetLang);
      return translated;
    } finally {
      setIsTranslating(false);
    }
  };

  // Translation function for static keys
  const t = (key: string, fallback?: string): string => {
    const translation = getNestedTranslation(staticTranslations, key);
    return translation || fallback || key;
  };

  const value: LanguageContextType = {
    language,
    direction,
    isTranslating,
    staticTranslations,
    setLanguage,
    translateText,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
