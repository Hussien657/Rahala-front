export type Language = 'en' | 'ar';

// Translation cache interface
interface TranslationCache {
  [key: string]: string;
}

// Cache for dynamic translations
const dynamicTranslationCache: TranslationCache = {};

// Cache for static translations
const staticTranslationCache: { [lang: string]: any } = {};

/**
 * LibreTranslate API service
 * Free and open-source translation API
 */
class LibreTranslateService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    // You can use a public LibreTranslate instance or host your own
    // Public instances: https://libretranslate.com/, https://translate.argosopentech.com/
    this.baseUrl = 'https://libretranslate.com/translate';
    // API key is optional for public instances but recommended for production
    this.apiKey = undefined; // Set your API key here if needed
  }

  /**
   * Translate text using LibreTranslate API
   */
  async translateText(text: string, sourceLang: Language, targetLang: Language): Promise<string> {
    if (!text || text.trim() === '') {
      return text;
    }

    // Create cache key
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;

    // Check cache first
    if (dynamicTranslationCache[cacheKey]) {
      return dynamicTranslationCache[cacheKey];
    }

    try {
      const requestBody: any = {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      };

      // Add API key if available
      if (this.apiKey) {
        requestBody.api_key = this.apiKey;
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.translatedText) {
        // Cache the translation
        dynamicTranslationCache[cacheKey] = data.translatedText;

        // Save to localStorage for persistence
        this.saveCacheToStorage();

        return data.translatedText;
      }

      throw new Error('No translation received');
    } catch (error) {
      console.warn('LibreTranslate API failed:', error);

      // Fallback: try alternative service or return original text
      return this.fallbackTranslation(text, sourceLang, targetLang);
    }
  }

  /**
   * Fallback translation method
   */
  private async fallbackTranslation(text: string, sourceLang: Language, targetLang: Language): Promise<string> {
    // You can implement a fallback service here
    // For now, return original text
    console.warn('Using fallback: returning original text');
    return text;
  }

  /**
   * Load translation cache from localStorage
   */
  loadCacheFromStorage(): void {
    try {
      const cached = localStorage.getItem('translation_cache');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        Object.assign(dynamicTranslationCache, parsedCache);
      }
    } catch (error) {
      console.warn('Failed to load translation cache:', error);
    }
  }

  /**
   * Save translation cache to localStorage
   */
  private saveCacheToStorage(): void {
    try {
      // Only save recent translations to avoid localStorage bloat
      const recentCache: TranslationCache = {};
      const entries = Object.entries(dynamicTranslationCache);

      // Keep only the last 100 translations
      const recentEntries = entries.slice(-100);
      recentEntries.forEach(([key, value]) => {
        recentCache[key] = value;
      });

      localStorage.setItem('translation_cache', JSON.stringify(recentCache));
    } catch (error) {
      console.warn('Failed to save translation cache:', error);
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    Object.keys(dynamicTranslationCache).forEach(key => {
      delete dynamicTranslationCache[key];
    });
    localStorage.removeItem('translation_cache');
  }
}

// Create singleton instance
export const translationService = new LibreTranslateService();

/**
 * Load static translations from JSON files
 */
export async function loadStaticTranslations(language: Language): Promise<any> {
  if (staticTranslationCache[language]) {
    return staticTranslationCache[language];
  }

  try {
    const response = await fetch(`/locales/${language}/common.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${language}`);
    }

    const translations = await response.json();
    staticTranslationCache[language] = translations;
    return translations;
  } catch (error) {
    console.error('Failed to load static translations:', error);
    return {};
  }
}

/**
 * Get nested translation value using dot notation
 */
export function getNestedTranslation(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Detect if text contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

/**
 * Detect if text contains English characters
 */
export function containsEnglish(text: string): boolean {
  const englishRegex = /[a-zA-Z]/;
  return englishRegex.test(text);
}

/**
 * Auto-detect source language
 */
export function detectLanguage(text: string): Language {
  if (containsArabic(text)) {
    return 'ar';
  }
  return 'en'; // Default to English
}

// Initialize cache on module load
translationService.loadCacheFromStorage();