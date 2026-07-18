import React from 'react';
import { useAuth } from '../../hooks/use-auth';
import { SidiWelcomeSequence } from '../../components/welcome/SidiWelcomeSequence';

interface WelcomePageProps {
  onComplete: () => void;
}

export default function WelcomePage({ onComplete }: WelcomePageProps) {
  const { profile, updateProfile } = useAuth();
  const initialLanguage = profile?.preferred_language || 'fr';

  const handleLanguageChange = (lang: 'fr' | 'darija') => {
    updateProfile({ preferred_language: lang }).catch(err => {
      console.warn("[WelcomePage] Failed to update preferred language:", err);
    });
  };

  const handleComplete = () => {
    // Set a flag to remember they've seen welcome
    localStorage.setItem('floussi_welcome_seen', 'true');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative Traditional Moroccan pattern backgrounds */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="bg-emerald-600 text-white w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-lg shadow-md">
            F
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">
            Floussi<span className="text-emerald-600">.</span>
          </span>
        </div>

        <SidiWelcomeSequence
          fullName={profile?.full_name || undefined}
          initialLanguage={initialLanguage}
          onLanguageChange={handleLanguageChange}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
