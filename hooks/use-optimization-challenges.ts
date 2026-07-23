import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './use-auth';
import { useTranslation } from './use-translation';
import { Transaction, Bucket, Goal } from '../types';
import { 
  OptimizationChallenge, 
  convertSuggestionToChallenge, 
  evaluateChallengeProgress, 
  getSavedChallenges, 
  saveChallenges 
} from '../lib/optimization-challenges';
import { 
  generateOptimizationSuggestions, 
  OptimizationSuggestion 
} from '../lib/optimization-suggestions';
import { awardGlobalXp, unlockGlobalBadge } from '../lib/gamification';

export function useOptimizationChallenges(userId?: string) {
  const { profile } = useAuth();
  const activeUserId = userId || profile?.id || "mock-user-id-9999";
  const { lang } = useTranslation();
  
  const [activeChallenges, setActiveChallenges] = useState<OptimizationChallenge[]>([]);
  const [challengeHistory, setChallengeHistory] = useState<OptimizationChallenge[]>([]);
  const [availableSuggestions, setAvailableSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [justSucceededChallenge, setJustSucceededChallenge] = useState<OptimizationChallenge | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all variables and build/evaluate challenges
  const refreshChallenges = useCallback(() => {
    if (!activeUserId) return;
    setIsLoading(true);

    // 1. Load real data from LocalStorage
    let txs: Transaction[] = [];
    let buckets: Bucket[] = [];
    let goals: Goal[] = [];
    let monthlyIncome = 12000;
    let city = "Casablanca";
    let incomeRange = "5000-10000 DH";

    try {
      const rawTxs = localStorage.getItem('floussi_table_transactions');
      if (rawTxs) txs = JSON.parse(rawTxs);
    } catch (_) {}

    try {
      const rawBuckets = localStorage.getItem('floussi_table_buckets');
      if (rawBuckets) buckets = JSON.parse(rawBuckets);
    } catch (_) {}

    try {
      const rawGoals = localStorage.getItem('floussi_table_goals');
      if (rawGoals) goals = JSON.parse(rawGoals);
    } catch (_) {}

    try {
      const rawProfile = localStorage.getItem('user_profile') || localStorage.getItem('floussi_table_profiles');
      if (rawProfile) {
        const p = JSON.parse(rawProfile);
        if (p.monthly_income) monthlyIncome = Number(p.monthly_income);
        if (p.city) city = p.city;
        if (p.income_range) incomeRange = p.income_range;
      }
    } catch (_) {}

    // 2. Load and evaluate active/historical challenges
    const saved = getSavedChallenges(activeUserId);
    
    let updatedCelebration: OptimizationChallenge | null = null;
    const evaluated = saved.map(c => {
      if (c.status === 'active') {
        const updated = evaluateChallengeProgress(c, txs);
        // If status transitioned to succeeded, trigger celebration!
        if (updated.status === 'succeeded') {
          updatedCelebration = updated;
          awardGlobalXp(activeUserId, updated.xpReward);
          unlockGlobalBadge(activeUserId, 'challenge_solved');
        }
        return updated;
      }
      return c;
    });

    // Save evaluated challenges back
    if (JSON.stringify(saved) !== JSON.stringify(evaluated)) {
      saveChallenges(activeUserId, evaluated);
    }

    if (updatedCelebration) {
      setJustSucceededChallenge(updatedCelebration);
    }

    // Filter into active and history lists
    const active = evaluated.filter(c => c.status === 'active');
    const history = evaluated.filter(c => c.status !== 'active');

    setActiveChallenges(active);
    setChallengeHistory(history);

    // 3. Generate raw suggestions and filter out those that already have active challenges
    const allSuggestions = generateOptimizationSuggestions(buckets, goals, txs, monthlyIncome, city as any, incomeRange as any);
    const filteredSuggestions = allSuggestions.filter(s => {
      // Ignore if there's an active challenge with the same suggestion ID
      return !active.some(ac => ac.suggestionId === s.id);
    });

    setAvailableSuggestions(filteredSuggestions);
    setIsLoading(false);
  }, [activeUserId]);

  // Accept a suggestion and turn it into an active challenge
  const acceptChallenge = useCallback((suggestion: OptimizationSuggestion) => {
    if (!activeUserId) return null;

    let txs: Transaction[] = [];
    try {
      const rawTxs = localStorage.getItem('floussi_table_transactions');
      if (rawTxs) txs = JSON.parse(rawTxs);
    } catch (_) {}

    const newChallenge = convertSuggestionToChallenge(suggestion, txs, activeUserId);
    const saved = getSavedChallenges(activeUserId);
    
    saved.push(newChallenge);
    saveChallenges(activeUserId, saved);
    
    refreshChallenges();

    // Trigger score update event
    window.dispatchEvent(new Event('floussi_score_history_updated'));
    window.dispatchEvent(new Event('floussi_buckets_updated'));

    return newChallenge;
  }, [activeUserId, refreshChallenges]);

  // Abandon an active challenge
  const abandonChallenge = useCallback((challengeId: string) => {
    if (!activeUserId) return;

    const saved = getSavedChallenges(activeUserId);
    const updated = saved.map(c => {
      if (c.id === challengeId) {
        return { ...c, status: 'abandoned' as const };
      }
      return c;
    });

    saveChallenges(activeUserId, updated);
    refreshChallenges();

    window.dispatchEvent(new Event('floussi_score_history_updated'));
    window.dispatchEvent(new Event('floussi_buckets_updated'));
  }, [activeUserId, refreshChallenges]);

  const clearCelebration = useCallback(() => {
    setJustSucceededChallenge(null);
  }, []);

  // Sync on mount
  useEffect(() => {
    refreshChallenges();
  }, [activeUserId, refreshChallenges]);

  // Listen for transaction edits/additions to dynamically re-evaluate challenges
  useEffect(() => {
    const handleUpdate = () => {
      refreshChallenges();
    };
    window.addEventListener('floussi_transactions_updated', handleUpdate);
    return () => {
      window.removeEventListener('floussi_transactions_updated', handleUpdate);
    };
  }, [refreshChallenges]);

  return {
    availableSuggestions,
    activeChallenges,
    challengeHistory,
    justSucceededChallenge,
    isLoading,
    acceptChallenge,
    abandonChallenge,
    clearCelebration,
    refresh: refreshChallenges
  };
}
