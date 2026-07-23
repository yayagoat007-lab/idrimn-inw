import { useAuth } from './use-auth';
import { t as translate, Language } from '../lib/i18n';
import { useEffect, useState } from 'react';

export function useTranslation() {
  const { profile, setLanguage: setAuthLanguage } = useAuth();
  const [localLang, setLocalLang] = useState<Language>('fr');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferred_language') as Language;
      if (stored === 'fr' || stored === 'darija') {
        setLocalLang(stored);
      }
    }
  }, []);

  // Listen to storage event for real-time synchronization
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('preferred_language') as Language;
      if (stored === 'fr' || stored === 'darija') {
        setLocalLang(stored);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const lang: Language = profile?.preferred_language || localLang;

  const changeLanguage = (newLang: Language) => {
    if (profile) {
      setAuthLanguage(newLang);
    } else {
      localStorage.setItem('preferred_language', newLang);
      setLocalLang(newLang);
    }
    // Fire a local storage change event on the same window
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  };

  const t = (key: string): string => {
    return translate(key, lang);
  };

  return { t, lang, changeLanguage };
}

