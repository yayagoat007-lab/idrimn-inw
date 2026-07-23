import { useState, useEffect, useMemo } from 'react';
import { 
  calculateFloussiScore, 
  getScoreHistory, 
  getNextTierRequirement, 
  FloussiScoreResult, 
  ScoreHistoryEntry, 
  NextTierRequirement 
} from '../lib/floussi-score';
import { unlockGlobalBadge } from '../lib/gamification';

const DEFAULT_SCORE: FloussiScoreResult = {
  totalScore: 350,
  tier: 'Discipliné',
  components: {
    financialHealth: 50,
    gamificationProgress: 25,
    consistency: 40,
    engagement: 30
  },
  trend: 'stable'
};

const DEFAULT_TIP: NextTierRequirement = {
  pointsNeeded: 150,
  tip: "Complétez un module dans l'Académie Floussi ou discutez avec Sidi Floussi pour faire grimper votre score."
};

/**
 * Custom React Hook for reactive and optimized retrieval of the unified Floussi Score.
 * Updates in real-time by listening to key transactional, behavioral, and engagement events.
 */
export function useFloussiScore(
  userId: string = "mock-user-id-9999",
  language: 'fr' | 'darija' = 'fr'
) {
  const [score, setScore] = useState<FloussiScoreResult | null>(null);
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [trigger, setTrigger] = useState<number>(0);

  useEffect(() => {
    let active = true;

    async function loadScore() {
      setIsLoading(true);
      try {
        const calculated = await calculateFloussiScore(userId);
        const hist = getScoreHistory(userId);
        
        // Unlocking corresponding Floussi tier badges if qualifying
        if (calculated.totalScore >= 850) {
          unlockGlobalBadge(userId, 'score_legend');
        } else if (calculated.totalScore >= 700) {
          unlockGlobalBadge(userId, 'score_master');
        } else if (calculated.totalScore >= 500) {
          unlockGlobalBadge(userId, 'score_strategist');
        } else if (calculated.totalScore >= 300) {
          unlockGlobalBadge(userId, 'score_disciplined');
        }

        if (active) {
          setScore(calculated);
          setHistory(hist);
        }
      } catch (err) {
        console.error("Error loading Floussi Score:", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadScore();

    return () => {
      active = false;
    };
  }, [userId, trigger]);

  // Recalculate next tier tips when score or language changes
  const nextTierTip = useMemo<NextTierRequirement>(() => {
    if (!score) return DEFAULT_TIP;
    return getNextTierRequirement(score.totalScore, score.components, language);
  }, [score, language]);

  // Real-time synchronization: listen to key user event triggers and force score recalculation
  useEffect(() => {
    const handleUpdate = () => {
      setTrigger(prev => prev + 1);
    };

    window.addEventListener('floussi_transactions_updated', handleUpdate);
    window.addEventListener('floussi_buckets_updated', handleUpdate);
    window.addEventListener('floussi_wallet_updated', handleUpdate);
    window.addEventListener('floussi_sidi_history_updated', handleUpdate);
    window.addEventListener('floussi_badge_unlocked', handleUpdate);
    window.addEventListener('floussi_goals_updated', handleUpdate);
    window.addEventListener('floussi_tontines_updated', handleUpdate);

    return () => {
      window.removeEventListener('floussi_transactions_updated', handleUpdate);
      window.removeEventListener('floussi_buckets_updated', handleUpdate);
      window.removeEventListener('floussi_wallet_updated', handleUpdate);
      window.removeEventListener('floussi_sidi_history_updated', handleUpdate);
      window.removeEventListener('floussi_badge_unlocked', handleUpdate);
      window.removeEventListener('floussi_goals_updated', handleUpdate);
      window.removeEventListener('floussi_tontines_updated', handleUpdate);
    };
  }, []);

  return {
    score: score || DEFAULT_SCORE,
    history,
    nextTierTip,
    isLoading
  };
}
