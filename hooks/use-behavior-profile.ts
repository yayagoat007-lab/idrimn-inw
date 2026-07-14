import { useMemo, useEffect, useState } from 'react';
import { useTransactions } from './use-transactions';
import { useAuth } from './use-auth';
import { 
  calculateBehavioralMetrics, 
  classifyBehaviorProfile, 
  getAdviceForProfile, 
  BehaviorProfile, 
  ProfileDetails,
  BehavioralMetrics
} from '../lib/behavior-clustering';

export interface ProfileHistoryItem {
  month: string; // e.g., "2026-06"
  profileId: BehaviorProfile;
}

export function useBehaviorProfile() {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";
  const { transactions, loading } = useTransactions(userId);
  const [history, setHistory] = useState<ProfileHistoryItem[]>([]);

  const storageKey = `floussi_behavior_history_${userId}`;

  // 1. Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setHistory(JSON.parse(raw));
      } else {
        // Initialize with a mock history for demo purposes so they can see evolution
        const initialHistory: ProfileHistoryItem[] = [
          { month: "2026-04", profileId: 'impulsif_chronique' },
          { month: "2026-05", profileId: 'depensier_occasionnel' }
        ];
        setHistory(initialHistory);
        localStorage.setItem(storageKey, JSON.stringify(initialHistory));
      }
    } catch (_) {}
  }, [userId, storageKey]);

  // 2. Compute current metrics & profile
  const { metrics, currentProfileId, currentProfileDetails } = useMemo(() => {
    if (loading || transactions.length === 0) {
      const defaultMetrics: BehavioralMetrics = {
        savingsRate: 0.15,
        frequencyPerDay: 0.2,
        expenseStdDev: 250,
        weekendRatio: 0.4
      };
      const defaultProfile: BehaviorProfile = 'depensier_occasionnel';
      return {
        metrics: defaultMetrics,
        currentProfileId: defaultProfile,
        currentProfileDetails: getAdviceForProfile(defaultProfile)
      };
    }

    const computedMetrics = calculateBehavioralMetrics(transactions, 90);
    const computedProfileId = classifyBehaviorProfile(computedMetrics, transactions);
    const details = getAdviceForProfile(computedProfileId);

    return {
      metrics: computedMetrics,
      currentProfileId: computedProfileId,
      currentProfileDetails: details
    };
  }, [transactions, loading]);

  // 3. Save current profile to history if the month changes
  useEffect(() => {
    if (loading || transactions.length === 0) return;

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    setHistory(prev => {
      const alreadyHasThisMonth = prev.some(h => h.month === currentMonthKey);
      
      // If we already recorded this month, check if the profile has updated
      if (alreadyHasThisMonth) {
        const updated = prev.map(h => 
          h.month === currentMonthKey ? { ...h, profileId: currentProfileId } : h
        );
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      } else {
        // Add new month entry
        const updated = [...prev, { month: currentMonthKey, profileId: currentProfileId }].sort((a, b) => a.month.localeCompare(b.month));
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      }
    });
  }, [currentProfileId, loading, transactions.length, storageKey]);

  return {
    metrics,
    currentProfileId,
    currentProfileDetails,
    history,
    loading
  };
}
