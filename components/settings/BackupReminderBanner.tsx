import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowRight, X } from 'lucide-react';

interface BackupReminderBannerProps {
  userId: string;
  language: 'fr' | 'darija';
  onNavigateToSettings: () => void;
}

export default function BackupReminderBanner({
  userId,
  language,
  onNavigateToSettings
}: BackupReminderBannerProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;

    // Check if user dismissed the banner recently
    const dismissedUntil = localStorage.getItem(`floussi_backup_reminder_dismissed_${userId}`);
    if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
      setShowBanner(false);
      return;
    }

    const lastBackupStr = localStorage.getItem(`floussi_last_backup_date_${userId}`);
    const firstActiveKey = `floussi_first_active_${userId}`;
    let firstActiveStr = localStorage.getItem(firstActiveKey);

    if (!firstActiveStr) {
      firstActiveStr = new Date().toISOString();
      localStorage.setItem(firstActiveKey, firstActiveStr);
    }

    const now = Date.now();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

    if (lastBackupStr) {
      const lastBackupTime = new Date(lastBackupStr).getTime();
      if (now - lastBackupTime > fourteenDaysMs) {
        // Last backup was more than 14 days ago
        setShowBanner(true);
      } else {
        setShowBanner(false);
      }
    } else {
      // No backup ever created, check if user is active for at least 14 days
      const firstActiveTime = new Date(firstActiveStr).getTime();
      if (now - firstActiveTime > fourteenDaysMs) {
        setShowBanner(true);
      } else {
        setShowBanner(false);
      }
    }
  }, [userId]);

  const handleDismiss = () => {
    if (typeof window === 'undefined') return;
    // Dismiss for 7 days
    const dismissUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(`floussi_backup_reminder_dismissed_${userId}`, dismissUntil);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  const t = {
    title: language === 'darija' ? "Hamm l-M3loumat dyalk ! 🛡️" : "Sécurisez vos données ! 🛡️",
    desc: language === 'darija' 
      ? "Ma dertich backup l m3loumat dyalk hadi 14 l-youm. Dir backup daba f s-Settings."
      : "Vous n'avez pas sauvegardé vos transactions et objectifs depuis plus de 14 jours. Créez une sauvegarde chiffrée.",
    cta: language === 'darija' ? "Hafed l-M3loumat" : "Sauvegarder maintenant",
  };

  return (
    <div className="bg-amber-50 border border-amber-100/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-slideDown">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldAlert size={18} className="animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-black text-amber-900 leading-none">{t.title}</h4>
          <p className="text-[11px] font-medium text-amber-800 leading-normal max-w-2xl">{t.desc}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          onClick={handleDismiss}
          className="p-1.5 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors cursor-pointer"
          title={language === 'darija' ? "Sedd" : "Fermer"}
        >
          <X size={14} />
        </button>
        <button
          onClick={onNavigateToSettings}
          className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>{t.cta}</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
