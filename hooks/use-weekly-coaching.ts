import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './use-auth';
import { 
  WeeklyReport, 
  generateWeeklyReport, 
  getSavedWeeklyReports, 
  saveWeeklyReport 
} from '../lib/weekly-coaching-report';

/**
 * Calculates the Monday (YYYY-MM-DD) of the last fully completed calendar week.
 */
export function getLastCompletedWeekMonday(): string {
  const now = new Date();
  let dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  if (dayOfWeek === 0) dayOfWeek = 7; // Treat Sunday as day 7
  
  // Find Monday of the current week, then subtract 7 days
  const currentWeekMonday = new Date(now.getTime() - (dayOfWeek - 1) * 24 * 60 * 60 * 1000);
  const lastCompletedWeekMonday = new Date(currentWeekMonday.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const yyyy = lastCompletedWeekMonday.getFullYear();
  const mm = String(lastCompletedWeekMonday.getMonth() + 1).padStart(2, '0');
  const dd = String(lastCompletedWeekMonday.getDate()).padStart(2, '0');
  
  return `${yyyy}-${mm}-${dd}`;
}

export function useWeeklyCoaching(userId?: string) {
  const { profile } = useAuth();
  const activeUserId = userId || profile?.id || "mock-user-id-9999";
  const lang = profile?.preferred_language || "fr";
  const subscriptionTier = profile?.subscription_tier || "free";

  const [currentReport, setCurrentReport] = useState<WeeklyReport | null>(null);
  const [previousReports, setPreviousReports] = useState<WeeklyReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Analyse+ or Elite required
  const isEligible = useMemo(() => {
    return subscriptionTier === 'analyse' || subscriptionTier === 'elite';
  }, [subscriptionTier]);

  // Load saved reports
  const loadReports = useCallback(() => {
    if (!activeUserId) return;
    const allReports = getSavedWeeklyReports(activeUserId);
    if (allReports.length > 0) {
      setCurrentReport(allReports[0]);
      setPreviousReports(allReports.slice(1));
    } else {
      setCurrentReport(null);
      setPreviousReports([]);
    }
  }, [activeUserId]);

  // Trigger a notification in the notification center
  const triggerNotification = useCallback((weekStartDate: string) => {
    try {
      const notifsKey = `notifs_${activeUserId}`;
      const savedNotifsRaw = localStorage.getItem(notifsKey);
      let notifs = [];
      if (savedNotifsRaw) {
        notifs = JSON.parse(savedNotifsRaw);
      }
      
      const notifId = `weekly-coaching-${weekStartDate}`;
      
      // Prevent duplicates
      if (notifs.some((n: any) => n.id === notifId)) {
        return;
      }

      const notifTitle = lang === 'darija' 
        ? "Rapport hebdomadaire jdid!" 
        : "Nouveau rapport hebdo !";
      const notifMsg = lang === 'darija'
        ? "Rapport coaching dyalek d l'osimana rah msta3ed! Aji choufo m3a sidi floussi."
        : "Votre rapport hebdomadaire personnalisé de coaching est prêt ! Venez analyser votre semaine.";

      const newNotif = {
        id: notifId,
        title: notifTitle,
        message: notifMsg,
        time: "À l'instant",
        isRead: false,
        priority: 'important',
        timestamp: new Date().toISOString(),
        category: 'sidi'
      };

      notifs.unshift(newNotif);
      localStorage.setItem(notifsKey, JSON.stringify(notifs));
    } catch (_) {}
  }, [activeUserId, lang]);

  // Generate a report right now
  const generateNow = useCallback(async (weekStartDateStr: string) => {
    setIsLoading(true);
    try {
      const report = await generateWeeklyReport(activeUserId, weekStartDateStr, lang as 'fr' | 'darija');
      saveWeeklyReport(activeUserId, report);
      loadReports();
      triggerNotification(weekStartDateStr);
      return report;
    } catch (err) {
      console.error("Failed to generate report manually", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId, lang, loadReports, triggerNotification]);

  // Handle automatic generation
  useEffect(() => {
    if (!activeUserId) return;
    
    // If not eligible, still load whatever they might have, but don't auto-generate
    loadReports();
    
    if (!isEligible) {
      setIsLoading(false);
      return;
    }

    const autoGenerateIfDue = async () => {
      setIsLoading(true);
      const targetMonday = getLastCompletedWeekMonday();
      const allSaved = getSavedWeeklyReports(activeUserId);
      
      const exists = allSaved.some(r => r.weekStartDate === targetMonday);
      if (!exists) {
        console.log(`[Coaching Hub] Auto-generating report for due week: ${targetMonday}`);
        await generateNow(targetMonday);
      } else {
        // Just reload to make sure state matches
        loadReports();
      }
      setIsLoading(false);
    };

    autoGenerateIfDue();
  }, [activeUserId, isEligible, generateNow, loadReports]);

  return {
    currentReport,
    previousReports,
    isEligible,
    isLoading,
    generateNow,
    refresh: loadReports
  };
}
