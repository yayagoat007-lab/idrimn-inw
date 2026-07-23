import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './use-auth';
import { useTranslation } from './use-translation';
import { 
  MonthlyReview, 
  generateMonthlyReview, 
  getSavedMonthlyReviews, 
  saveMonthlyReview 
} from '../lib/monthly-review';

/**
 * Helper to get the target review month (previous month as YYYY-MM)
 */
export function getPreviousMonthString(): string {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed, so current month is month index. Previous month is now.getMonth()
  
  if (month === 0) {
    // If January, previous month is December of last year
    month = 12;
    year -= 1;
  }
  
  const mm = String(month).padStart(2, '0');
  return `${year}-${mm}`;
}

export function useMonthlyReview(userId?: string) {
  const { profile } = useAuth();
  const activeUserId = userId || profile?.id || "mock-user-id-9999";
  const { lang } = useTranslation();
  const subscriptionTier = profile?.subscription_tier || "free";

  const [currentMonthReview, setCurrentMonthReview] = useState<MonthlyReview | null>(null);
  const [allSavedReviews, setAllSavedReviews] = useState<MonthlyReview[]>([]);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Premium Analyse+ or Elite required
  const isEligible = useMemo(() => {
    return subscriptionTier === 'analyse' || subscriptionTier === 'elite';
  }, [subscriptionTier]);

  // Review is ready if we are on or after the 1st day of the month for the previous month
  const isReviewReady = useMemo(() => {
    // Usually ready at any time for the previous month, but let's make it true
    return true;
  }, []);

  const loadReviews = useCallback(() => {
    if (!activeUserId) return;
    const list = getSavedMonthlyReviews(activeUserId);
    setAllSavedReviews(list);
    
    // Default to the previous month's review if it exists, or the most recent saved
    const targetMonth = getPreviousMonthString();
    const targetReview = list.find(r => r.month === targetMonth) || list[0] || null;
    setCurrentMonthReview(targetReview);
  }, [activeUserId]);

  // Generate review for a specific month
  const triggerGeneration = useCallback(async (monthStr: string) => {
    setIsLoading(true);
    try {
      const review = await generateMonthlyReview(activeUserId, monthStr, lang as 'fr' | 'darija');
      saveMonthlyReview(activeUserId, review);
      loadReviews();
      
      // Also trigger a Sidi proactive notification
      try {
        const notifsKey = `notifs_${activeUserId}`;
        const savedNotifsRaw = localStorage.getItem(notifsKey);
        let notifs = [];
        if (savedNotifsRaw) notifs = JSON.parse(savedNotifsRaw);
        
        const notifId = `monthly-review-${monthStr}`;
        if (!notifs.some((n: any) => n.id === notifId)) {
          const title = lang === 'darija' ? "Bilan Mensuel jdid! 📊" : "Bilan Mensuel de Sidi Floussi ! 📊";
          const msg = lang === 'darija' 
            ? `Bilan dyal chhar l-fat rah jadd! Aji n-choufo t-tatawor dyalek m3a Sidi.`
            : `Votre bilan financier mensuel est prêt ! Prenez 5 minutes avec Sidi Floussi pour le parcourir ensemble.`;
          
          notifs.unshift({
            id: notifId,
            title,
            message: msg,
            time: "À l'instant",
            isRead: false,
            priority: 'important',
            timestamp: new Date().toISOString(),
            category: 'sidi'
          });
          localStorage.setItem(notifsKey, JSON.stringify(notifs));
        }
      } catch (_) {}

      return review;
    } catch (err) {
      console.error("Failed to generate monthly review", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId, lang, loadReviews]);

  // Start guided review session
  const startGuidedReview = useCallback(() => {
    setIsReviewing(true);
    setCurrentChapterIndex(0);
  }, []);

  // Stop guided review session
  const stopGuidedReview = useCallback(() => {
    setIsReviewing(false);
  }, []);

  const nextChapter = useCallback(() => {
    setCurrentChapterIndex(prev => Math.min(prev + 1, 4)); // 5 chapters total (0, 1, 2, 3, 4)
  }, []);

  const previousChapter = useCallback(() => {
    setCurrentChapterIndex(prev => Math.max(prev - 1, 0));
  }, []);

  // Submit feedback/priority selection at the end
  const submitFeedback = useCallback((choice: string) => {
    if (!currentMonthReview || !activeUserId) return;
    
    const updatedReview: MonthlyReview = {
      ...currentMonthReview,
      feedbackResponse: choice
    };
    
    saveMonthlyReview(activeUserId, updatedReview);
    
    // Add custom message to Sidi Chat history so Sidi acknowledges this priority
    try {
      const historyKey = `floussi_sidi_history_${activeUserId}`;
      const raw = localStorage.getItem(historyKey);
      let history = [];
      if (raw) history = JSON.parse(raw);
      
      const acknowledgmentText = lang === 'darija'
        ? `Mzyan bzzaf! Sjjelt l-hadaf dyalek d l-chhar l-majya: "${choice}". Ghadi n-rekkzo 3lih fl'osimana l-jayat bach tawsal lih!`
        : `Excellent choix ! J'ai bien noté ton objectif pour le mois prochain : "${choice}". Nous allons concentrer nos conseils hebdomadaires là-dessus !`;
        
      history.push({
        id: `feedback-user-${Date.now()}`,
        sender: 'user',
        text: `Pour le mois prochain, je veux prioriser : ${choice}`,
        timestamp: new Date().toISOString()
      });
      
      history.push({
        id: `feedback-sidi-${Date.now()}`,
        sender: 'sidi',
        text: acknowledgmentText,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem(historyKey, JSON.stringify(history));
      window.dispatchEvent(new Event('floussi_sidi_history_updated'));
    } catch (_) {}

    loadReviews();
  }, [currentMonthReview, activeUserId, lang, loadReviews]);

  // Load reviews on mount & auto-generate if due
  useEffect(() => {
    if (!activeUserId) return;
    
    loadReviews();
    
    if (!isEligible) {
      setIsLoading(false);
      return;
    }

    const autoGenerateIfDue = async () => {
      setIsLoading(true);
      const targetMonth = getPreviousMonthString();
      const list = getSavedMonthlyReviews(activeUserId);
      
      const exists = list.some(r => r.month === targetMonth);
      if (!exists) {
        console.log(`[Coaching Hub] Auto-generating monthly review for: ${targetMonth}`);
        await triggerGeneration(targetMonth);
      } else {
        loadReviews();
      }
      setIsLoading(false);
    };

    autoGenerateIfDue();
  }, [activeUserId, isEligible, triggerGeneration, loadReviews]);

  return {
    currentMonthReview,
    allSavedReviews,
    isReviewReady,
    isReviewing,
    currentChapterIndex,
    isLoading,
    isEligible,
    startGuidedReview,
    stopGuidedReview,
    nextChapter,
    previousChapter,
    triggerGeneration,
    submitFeedback,
    refresh: loadReviews
  };
}
