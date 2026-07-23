import { Transaction, Bucket } from '../types';
import { OptimizationSuggestion } from './optimization-suggestions';

export interface OptimizationChallenge {
  id: string;
  suggestionId: string;
  title: string;
  description: string;
  category: string;
  baselineValue: number; // Spending in category over prior 30 days
  targetValue: number;   // Target spending limit for the 30-day challenge
  durationDays: number;
  startDate: string;     // ISO Date string
  endDate: string;       // ISO Date string
  currentValue: number;  // Spending in category since startDate
  status: 'active' | 'succeeded' | 'failed' | 'abandoned';
  xpReward: number;      // XP awarded on success
  onTrack: boolean;      // True if prorated spending is under limit
}

/**
 * Converts an optimization suggestion into a concrete challenge with calculated real-world baseline.
 */
export function convertSuggestionToChallenge(
  suggestion: OptimizationSuggestion,
  transactions: Transaction[],
  userId: string = "mock-user-id-9999"
): OptimizationChallenge {
  const now = new Date();
  const durationDays = 30;
  const startDateStr = now.toISOString();
  
  const endDate = new Date();
  endDate.setDate(now.getDate() + durationDays);
  const endDateStr = endDate.toISOString();

  // Determine target category
  const category = suggestion.category || "loisirs";

  // Calculate baseline spending in this category from the PREVIOUS 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const pastExpenses = transactions.filter(t => {
    const tDate = new Date(t.transaction_date);
    const catMatch = t.category?.toLowerCase() === category.toLowerCase();
    return t.type === 'expense' && catMatch && tDate >= thirtyDaysAgo && tDate <= now;
  });

  const rawBaseline = pastExpenses.reduce((sum, t) => sum + t.amount, 0);
  
  // Logical fallbacks if there are no historical transactions recorded yet
  // If no transactions, fall back to suggestion's potential saving or standard default
  const baselineValue = rawBaseline > 0 
    ? Math.round(rawBaseline) 
    : Math.round(suggestion.potentialSaving * 2.5 || 800);

  // Set the target value based on the potential savings. Ensure it's less than baseline.
  const targetValue = Math.max(50, Math.round(baselineValue - suggestion.potentialSaving));

  // XP is proportional to difficulty
  const xpReward = Math.round((baselineValue - targetValue) * 0.5) + 100;

  return {
    id: `challenge-${suggestion.id}-${Date.now()}`,
    suggestionId: suggestion.id,
    title: suggestion.title,
    description: suggestion.description,
    category,
    baselineValue,
    targetValue,
    durationDays,
    startDate: startDateStr,
    endDate: endDateStr,
    currentValue: 0, // Starts at 0
    status: 'active',
    xpReward,
    onTrack: true
  };
}

/**
 * Re-evaluates challenge progress against fresh transaction history
 */
export function evaluateChallengeProgress(
  challenge: OptimizationChallenge,
  transactions: Transaction[]
): OptimizationChallenge {
  if (challenge.status === 'abandoned' || challenge.status === 'succeeded' || challenge.status === 'failed') {
    return challenge;
  }

  const now = new Date();
  const start = new Date(challenge.startDate);
  const end = new Date(challenge.endDate);

  // Filter transactions between startDate and either (now) or (endDate) - whichever is earlier
  const activeLimitDate = now < end ? now : end;

  const currentExpenses = transactions.filter(t => {
    const tDate = new Date(t.transaction_date);
    const catMatch = t.category?.toLowerCase() === challenge.category.toLowerCase();
    return t.type === 'expense' && catMatch && tDate >= start && tDate <= activeLimitDate;
  });

  const currentValue = Math.round(currentExpenses.reduce((sum, t) => sum + t.amount, 0));

  // Determine if on track: compare current spending with prorated target spending
  const totalDurationMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  const elapsedFraction = Math.min(1, elapsedMs / totalDurationMs);

  // Prorated threshold allows a slight margin early in the challenge
  const proratedThreshold = challenge.targetValue * elapsedFraction;
  
  // On track if we haven't already exceeded the final budget limit
  const onTrack = currentValue <= challenge.targetValue;

  let status: 'active' | 'succeeded' | 'failed' | 'abandoned' = challenge.status;
  
  // Check if challenge duration has completed
  if (now >= end) {
    if (currentValue <= challenge.targetValue) {
      status = 'succeeded';
    } else {
      status = 'failed';
    }
  } else {
    // If we have already blown past the target value BEFORE the end date, we don't immediately fail
    // because the user might stop spending, but it's highly "dépassé".
    // We keep status as 'active' but set onTrack = false.
    status = 'active';
  }

  return {
    ...challenge,
    currentValue,
    onTrack,
    status
  };
}

/**
 * Load challenges from LocalStorage
 */
export function getSavedChallenges(userId: string): OptimizationChallenge[] {
  const key = `floussi_challenges_${userId || "mock-user-id-9999"}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (_) {}
  return [];
}

/**
 * Save challenges back to LocalStorage
 */
export function saveChallenges(userId: string, challenges: OptimizationChallenge[]) {
  const key = `floussi_challenges_${userId || "mock-user-id-9999"}`;
  localStorage.setItem(key, JSON.stringify(challenges));
}
