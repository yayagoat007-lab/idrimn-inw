import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTransactions } from './use-transactions';
import { useBuckets } from './use-buckets';
import { useMoroccanEvents } from './use-moroccan-events';
import { DailyCheckin } from '../types';
import { 
  generateCheckinPrompt, 
  saveCheckin, 
  getCheckinHistory, 
  hasCheckedInToday,
  CheckinPrompt
} from '../lib/daily-checkin';
import { unlockGlobalBadge } from '../lib/gamification';

export function useDailyCheckin(userId: string = "mock-user-id-9999") {
  const cleanUserId = userId || "mock-user-id-9999";

  // State
  const [checkedInToday, setCheckedInToday] = useState<boolean>(false);
  const [checkinStreak, setCheckinStreak] = useState<number>(0);
  const [moodHistory, setMoodHistory] = useState<DailyCheckin[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Sub-hooks to compute context
  const { transactions, loading: txLoading } = useTransactions(cleanUserId);
  const { buckets, loading: bucketsLoading } = useBuckets(cleanUserId);
  const { events, loading: eventsLoading } = useMoroccanEvents(cleanUserId);

  // Load checkin status, streak and history from localStorage
  useEffect(() => {
    const history = getCheckinHistory(cleanUserId, 90);
    setMoodHistory(history);
    
    const checkedIn = hasCheckedInToday(cleanUserId);
    setCheckedInToday(checkedIn);

    const calculatedStreak = calculateStreak(history);
    setCheckinStreak(calculatedStreak);
  }, [cleanUserId, refreshTrigger]);

  // Streak calculator
  function calculateStreak(checkins: DailyCheckin[]): number {
    if (checkins.length === 0) return 0;
    
    // Sort unique dates in descending order
    const dates = Array.from(new Set(checkins.map(c => c.date))).sort().reverse();
    
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // If the latest checkin is older than yesterday, streak is broken
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }
    
    let streak = 0;
    let currentRefDate = new Date(dates[0]);
    
    for (let i = 0; i < dates.length; i++) {
      const checkinDate = new Date(dates[i]);
      const diffTime = currentRefDate.getTime() - checkinDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        streak = 1;
      } else if (diffDays === 1) {
        streak++;
        currentRefDate = checkinDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Generate contextual prompt
  const todayPrompt = useMemo<CheckinPrompt>(() => {
    // 1. Compute yesterday transaction count
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayTxs = transactions.filter(t => t.transaction_date === yesterdayStr);

    // 2. Compute today budget status
    let todayBudgetStatus: 'good' | 'warning' | 'danger' = 'good';
    if (buckets.length > 0) {
      const statuses = buckets.map(b => {
        if (b.allocated_amount <= 0) return 'good';
        const pct = (b.spent_amount / b.allocated_amount) * 100;
        if (pct >= 100) return 'danger';
        if (pct >= 80) return 'warning';
        return 'good';
      });
      if (statuses.includes('danger')) todayBudgetStatus = 'danger';
      else if (statuses.includes('warning')) todayBudgetStatus = 'warning';
    }

    // 3. Compute Moroccan holiday / custom event
    let upcomingEventName: string | undefined = undefined;
    let upcomingEventDays: number | undefined = undefined;
    if (events && events.length > 0) {
      let minDays = Infinity;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      events.forEach(ev => {
        const target = new Date(ev.start_date);
        target.setHours(0, 0, 0, 0);
        const diff = target.getTime() - today.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days >= 0 && days <= 7 && days < minDays) {
          minDays = days;
          upcomingEventName = ev.name;
          upcomingEventDays = days;
        }
      });
    }

    return generateCheckinPrompt({
      yesterdayTransactionCount: yesterdayTxs.length,
      todayBudgetStatus,
      upcomingEventName,
      upcomingEventDays
    });
  }, [transactions, buckets, events]);

  // Submit checkin
  const submitCheckin = useCallback((mood: 'great' | 'okay' | 'stressed' | 'worried', note?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const checkin: DailyCheckin = {
      userId: cleanUserId,
      date: todayStr,
      mood,
      quickNote: note,
      transactionsConfirmed: true,
      streakDay: 1
    };

    // Pre-calculate next streak
    const tempHistory = [checkin, ...moodHistory.filter(h => h.date !== todayStr)];
    const nextStreak = calculateStreak(tempHistory);
    checkin.streakDay = nextStreak;

    // Save
    saveCheckin(checkin);

    // Reward / Gamification
    if (nextStreak >= 30) {
      unlockGlobalBadge(cleanUserId, 'checkin_streak_30');
    }

    // Trigger state reload
    setRefreshTrigger(prev => prev + 1);
  }, [cleanUserId, moodHistory]);

  return {
    todayPrompt,
    hasCheckedInToday: checkedInToday,
    submitCheckin,
    checkinStreak,
    moodHistory,
    loading: txLoading || bucketsLoading || eventsLoading
  };
}
