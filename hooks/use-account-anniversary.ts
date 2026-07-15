import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useGoals } from './use-goals';
import { useTransactions } from './use-transactions';
import { useGamification } from './use-gamification';
import { useAccounts } from './use-accounts';
import { 
  getYearsSinceCreation, 
  isAnniversaryToday, 
  generateAnniversarySummary,
  AnniversarySummary
} from '../lib/account-anniversary';
import { unlockGlobalBadge, getLevelForXp } from '../lib/gamification';

/**
 * Hook to manage user registration anniversary state, badges, and statistics.
 */
export function useAccountAnniversary(userId: string = "mock-user-id-9999") {
  const { profile } = useAuth();
  const { goals, loading: loadingGoals } = useGoals(userId);
  const { transactions, loading: loadingTransactions } = useTransactions(userId);
  const { state: gamificationState, loading: loadingGamification } = useGamification(userId);
  const { accounts, loading: loadingAccounts } = useAccounts(userId);

  const [hasBeenShownThisYear, setHasBeenShownThisYear] = useState<boolean>(true);

  const createdAt = profile?.created_at;
  const currentYear = new Date().getFullYear();

  // Determine if the anniversary modal has already been shown to the user this year
  useEffect(() => {
    if (!userId) return;
    try {
      const shown = localStorage.getItem(`floussi_anniversary_shown_${userId}_${currentYear}`);
      setHasBeenShownThisYear(shown === 'true');
    } catch (e) {
      console.error("Error reading anniversary shown state", e);
    }
  }, [userId, currentYear]);

  // Memoize years counts since account creation
  const yearsCount = useMemo(() => {
    if (!createdAt) return 0;
    return getYearsSinceCreation(createdAt);
  }, [createdAt]);

  // Memoize whether today is the anniversary day
  const anniversaryToday = useMemo(() => {
    if (!createdAt) return false;
    return isAnniversaryToday(createdAt);
  }, [createdAt]);

  // Unlock appropriate engagement milestone badge based on the years Count
  useEffect(() => {
    if (!userId || yearsCount <= 0 || loadingGamification) return;

    if (yearsCount >= 1) {
      unlockGlobalBadge(userId, 'anniversary_1y');
    }
    if (yearsCount >= 2) {
      unlockGlobalBadge(userId, 'anniversary_2y');
    }
    if (yearsCount >= 3) {
      unlockGlobalBadge(userId, 'anniversary_3y');
    }
    if (yearsCount >= 5) {
      unlockGlobalBadge(userId, 'anniversary_5y');
    }
  }, [userId, yearsCount, loadingGamification]);

  // Compute all-time statistics and build anniversary summary
  const summary = useMemo<AnniversarySummary | null>(() => {
    if (!createdAt) return null;

    const totalTransactions = transactions.length;
    
    // Sum active goals progress/current amounts
    const goalsSaved = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
    
    // Sum savings account balances
    const savingsAccBalance = accounts
      .filter(a => a.type === 'savings')
      .reduce((sum, a) => sum + (a.balance || 0), 0);
    
    // Total sum of saved funds with a defensive fallback for new users
    const totalSaved = Math.max(1250, goalsSaved + savingsAccBalance);

    // Filter completed goals
    const goalsCompleted = goals.filter(
      g => g.target_amount > 0 && g.current_amount >= g.target_amount
    ).length;

    // Badges count
    const badgesUnlocked = gamificationState ? gamificationState.unlockedBadges.length : 0;
    
    // Current tier / level name
    const xp = gamificationState ? gamificationState.xp : 0;
    const levelInfo = getLevelForXp(xp);
    const currentLevel = levelInfo.levelName;

    return generateAnniversarySummary(createdAt, {
      totalTransactions,
      totalSaved,
      goalsCompleted,
      badgesUnlocked,
      currentLevel
    });
  }, [createdAt, transactions, goals, accounts, gamificationState]);

  // Mark anniversary celebration as viewed for the current calendar year
  const markAsShown = useCallback(() => {
    if (!userId) return;
    try {
      localStorage.setItem(`floussi_anniversary_shown_${userId}_${currentYear}`, 'true');
      setHasBeenShownThisYear(true);
    } catch (e) {
      console.error("Error saving anniversary shown state", e);
    }
  }, [userId, currentYear]);

  const isLoading = loadingGoals || loadingTransactions || loadingGamification || loadingAccounts;

  return {
    isAnniversaryToday: anniversaryToday,
    yearsCount,
    summary,
    hasBeenShownThisYear,
    markAsShown,
    isLoading
  };
}
