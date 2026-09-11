import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enTranslations from '../i18n/locales/en.json';
import hiTranslations from '../i18n/locales/hi.json';
import mrTranslations from '../i18n/locales/mr.json';
import { useAuth } from './AuthContext';
import { authApi } from '../services/authApi';

export type LanguageCode = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  native: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' }
];

const translations: Record<LanguageCode, any> = {
  en: enTranslations,
  hi: hiTranslations,
  mr: mrTranslations
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (keyPath: string, defaultText?: string) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('agrivision_language');
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
      return saved as LanguageCode;
    }
    return 'en';
  });

  // Synchronize when authenticated user logs in with saved preferred_language
  useEffect(() => {
    if (user?.preferred_language && (user.preferred_language === 'en' || user.preferred_language === 'hi' || user.preferred_language === 'mr')) {
      const userLang = user.preferred_language as LanguageCode;
      if (userLang !== language) {
        setLanguageState(userLang);
        localStorage.setItem('agrivision_language', userLang);
      }
    }
  }, [user]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('agrivision_language', lang);

    // Optionally sync with backend user profile if authenticated
    if (user) {
      authApi.updateProfile({ preferred_language: lang } as any).catch((err) => {
        console.warn('Language preference profile sync note:', err);
      });
    }
  };

  // Nested translation helper
  const t = (keyPath: string, defaultText?: string): string => {
    const keys = keyPath.split('.');
    
    // 1. Try current language
    let current: any = translations[language];
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }

    if (typeof current === 'string') return current;

    // 2. Fallback to English
    let enFallback: any = translations.en;
    for (const k of keys) {
      if (enFallback && typeof enFallback === 'object' && k in enFallback) {
        enFallback = enFallback[k];
      } else {
        enFallback = undefined;
        break;
      }
    }

    if (typeof enFallback === 'string') return enFallback;

    // 3. Fallback to provided default or keyPath
    return defaultText || keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
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
