import { useState, useEffect, useCallback } from 'react';
import { GamificationState, ALL_BADGES, getLevelForXp, updateStreak } from '../lib/gamification';

const DEFAULT_STATE: GamificationState = {
  xp: 140,
  level: 2,
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedBadges: ['first_trans', 'streak_3'],
  streakHistory: []
};

export function useGamification(userId: string) {
  const [state, setState] = useState<GamificationState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const saved = localStorage.getItem(`floussi_gamification_${userId}`);
    if (saved) {
      setState(JSON.parse(saved));
    } else {
      localStorage.setItem(`floussi_gamification_${userId}`, JSON.stringify(DEFAULT_STATE));
    }
    setLoading(false);
  }, [userId]);

  const saveState = useCallback((updated: GamificationState) => {
    setState(updated);
    localStorage.setItem(`floussi_gamification_${userId}`, JSON.stringify(updated));
  }, [userId]);

  const addXp = useCallback((amount: number, reason?: string) => {
    const updatedXp = state.xp + amount;
    const { level } = getLevelForXp(updatedXp);
    
    const updated = {
      ...state,
      xp: updatedXp,
      level
    };

    saveState(updated);
    if (reason) {
      // Trigger a passive alert or feedback
      console.log(`+${amount} XP: ${reason}`);
    }
  }, [state, saveState]);

  const unlockBadge = useCallback((badgeId: string) => {
    if (state.unlockedBadges.includes(badgeId)) return;
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (!badge) return;

    const updated = {
      ...state,
      unlockedBadges: [...state.unlockedBadges, badgeId],
      xp: state.xp + badge.xpValue
    };
    saveState(updated);
  }, [state, saveState]);

  const incrementStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const { streak, shouldReset } = updateStreak(state.lastActiveDate, state.streak);
    
    let history = [...state.streakHistory];
    if (!history.includes(today)) {
      history.push(today);
    }

    const updated = {
      ...state,
      streak,
      lastActiveDate: today,
      streakHistory: history
    };

    saveState(updated);
  }, [state, saveState]);

  return {
    state,
    loading,
    addXp,
    unlockBadge,
    incrementStreak,
    badges: ALL_BADGES.map(b => ({
      ...b,
      unlockedAt: state.unlockedBadges.includes(b.id) ? 'Débloqué' : undefined
    }))
  };
}
