import { useState, useEffect } from 'react';

export interface UserPreferences {
  language: 'fr' | 'darija';
  currency: 'MAD';
  dateFormat: 'DD/MM/YYYY' | 'Hijri';
  notifications: {
    push: boolean;
    email: boolean;
    emailFrequency: 'daily' | 'weekly' | 'monthly';
    sms: boolean;
    whatsapp: boolean;
  };
}

export interface UserSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'fr',
  currency: 'MAD',
  dateFormat: 'DD/MM/YYYY',
  notifications: {
    push: true,
    email: true,
    emailFrequency: 'weekly',
    sms: false,
    whatsapp: true
  }
};

const DEFAULT_SESSIONS: UserSession[] = [
  { id: 'sess-1', device: 'Safari - iPhone 15 Pro (PWA Standalone)', ip: '196.200.14.92', location: 'Casablanca, Maroc', lastActive: 'A l\'instant', isCurrent: true },
  { id: 'sess-2', device: 'Chrome - Windows Desktop', ip: '105.154.202.10', location: 'Rabat, Maroc', lastActive: 'Il y a 2 heures', isCurrent: false }
];

export function useSettings(userId: string) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [sessions, setSessions] = useState<UserSession[]>(DEFAULT_SESSIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const savedPrefs = localStorage.getItem(`floussi_prefs_${userId}`);
    const savedSess = localStorage.getItem(`floussi_sessions_${userId}`);
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
    if (savedSess) setSessions(JSON.parse(savedSess));
    setLoading(false);
  }, [userId]);

  const savePreferences = (updated: UserPreferences) => {
    setPreferences(updated);
    localStorage.setItem(`floussi_prefs_${userId}`, JSON.stringify(updated));
  };

  const terminateSession = (sessionId: string) => {
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem(`floussi_sessions_${userId}`, JSON.stringify(updated));
  };

  return {
    preferences,
    sessions,
    loading,
    savePreferences,
    terminateSession
  };
}
