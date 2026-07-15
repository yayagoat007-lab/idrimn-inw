import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTransactions } from './use-transactions';
import { useGoals } from './use-goals';
import { useBuckets } from './use-buckets';
import { useGamification } from './use-gamification';
import { calculateWrappedStats, WrappedStats } from '../lib/wrapped-stats';
import { generateWrappedStoryImages } from '../lib/wrapped-story-generator';
import { unlockGlobalBadge } from '../lib/gamification';

export function useWrapped(userId: string) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | 'glissant'>(currentYear);

  // Hook dependencies
  const { transactions, loading: txsLoading } = useTransactions(userId || 'mock-user-id-9999');
  const { goals, loading: goalsLoading } = useGoals(userId || 'mock-user-id-9999');
  const { buckets, loading: bucketsLoading } = useBuckets(userId || 'mock-user-id-9999');
  const { state: gamificationState, loading: gamLoading } = useGamification(userId || 'mock-user-id-9999');

  const [hasSeenThisYearWrapped, setHasSeenThisYearWrapped] = useState<boolean>(false);

  // Check if Wrapped season is active (Dec 15 - Jan 5)
  const isWrappedSeasonActive = useMemo(() => {
    const now = new Date();
    const month = now.getMonth(); // 0 = Jan, 11 = Dec
    const day = now.getDate();
    return (month === 11 && day >= 15) || (month === 0 && day <= 5);
  }, []);

  // Sync state with local storage
  useEffect(() => {
    if (!userId) return;
    const key = `floussi_wrapped_seen_${userId}_${currentYear}`;
    const seen = localStorage.getItem(key);
    setHasSeenThisYearWrapped(seen === 'true');
  }, [userId, currentYear]);

  const markAsSeen = useCallback(() => {
    if (!userId) return;
    const key = `floussi_wrapped_seen_${userId}_${currentYear}`;
    localStorage.setItem(key, 'true');
    setHasSeenThisYearWrapped(true);
  }, [userId, currentYear]);

  // Determine date ranges
  const period = useMemo(() => {
    if (selectedYear === 'glissant') {
      const end = new Date();
      const start = new Date();
      start.setFullYear(end.getFullYear() - 1);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        label: '12 Mois Glissants'
      };
    } else {
      return {
        start: `${selectedYear}-01-01`,
        end: `${selectedYear}-12-31`,
        label: `Année ${selectedYear}`
      };
    }
  }, [selectedYear]);

  // Calculate stats
  const stats = useMemo<WrappedStats | null>(() => {
    if (txsLoading || goalsLoading || bucketsLoading || gamLoading) return null;
    return calculateWrappedStats(
      transactions,
      goals,
      buckets,
      gamificationState,
      period.start,
      period.end
    );
  }, [transactions, goals, buckets, gamificationState, txsLoading, goalsLoading, bucketsLoading, gamLoading, period]);

  // Generate Base64 Slides & Unlock Badge
  const generateImages = useCallback(async (themeId: string, language: 'fr' | 'darija'): Promise<string[]> => {
    if (!stats) return [];

    // Unlock 'wrapped_viewer' Badge
    unlockGlobalBadge(userId || 'mock-user-id-9999', 'wrapped_viewer');

    // Trigger canvas generation
    return await generateWrappedStoryImages(stats, themeId, language);
  }, [stats, userId]);

  // List of years available (years in which the user has logged transactions)
  const availableYears = useMemo<number[]>(() => {
    if (transactions.length === 0) return [currentYear];
    const years = transactions.map(t => new Date(t.transaction_date).getFullYear());
    const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a);
    return uniqueYears.length > 0 ? uniqueYears : [currentYear];
  }, [transactions, currentYear]);

  return {
    stats,
    isWrappedSeasonActive,
    hasSeenThisYearWrapped,
    markAsSeen,
    selectedYear,
    setSelectedYear,
    availableYears,
    generateImages,
    loading: txsLoading || goalsLoading || bucketsLoading || gamLoading
  };
}
