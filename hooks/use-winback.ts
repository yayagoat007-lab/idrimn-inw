import { useState, useEffect, useMemo } from 'react';
import { useGoals } from './use-goals';
import { useTontines } from './use-tontines';
import { useMoroccanEvents } from './use-moroccan-events';
import { useBuckets } from './use-buckets';
import { 
  getInactivityTier, 
  shouldTriggerWinBack, 
  InactivityTier 
} from '../lib/inactivity-detector';
import { 
  generateWinBackMessage, 
  WinBackMessage, 
  WinBackContext 
} from '../lib/winback-messages';

export function useWinBack(userId: string = "mock-user-id-9999") {
  const { goals, loading: loadingGoals } = useGoals(userId);
  const { tontines, loading: loadingTontines } = useTontines(userId);
  const { events, loading: loadingEvents } = useMoroccanEvents(userId);
  const { buckets, loading: loadingBuckets } = useBuckets(userId);

  const [dismissed, setDismissed] = useState<boolean>(false);
  const [currentTier, setCurrentTier] = useState<InactivityTier>('active');
  const [lastShownTier, setLastShownTier] = useState<string | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    if (!userId) return;
    try {
      const tier = getInactivityTier(userId);
      setCurrentTier(tier);

      const shown = localStorage.getItem(`floussi_last_winback_shown_${userId}`);
      setLastShownTier(shown);
    } catch (e) {
      console.error("Error loading winback state", e);
    }
  }, [userId]);

  // Construct contextual parameters based on real-time application state
  const context = useMemo<WinBackContext>(() => {
    const ctx: WinBackContext = {};

    // 1. Check for active goal with progress > 0% and < 100%
    if (goals && goals.length > 0) {
      const activeGoal = goals.find(g => {
        const progress = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
        return progress > 0 && progress < 100;
      });

      if (activeGoal) {
        ctx.lastActiveGoalName = activeGoal.name;
        ctx.lastActiveGoalProgress = (activeGoal.current_amount / activeGoal.target_amount) * 100;
        ctx.lastActiveGoalRemaining = activeGoal.target_amount - activeGoal.current_amount;
      }
    }

    // 2. Check for tontines (Jmâas) with potential pending payment
    if (tontines && tontines.length > 0) {
      const activeTontine = tontines.find(t => t.status === 'active');
      if (activeTontine) {
        ctx.pendingTontineReminder = true;
        ctx.tontineName = activeTontine.name;
      }
    }

    // 3. Check for upcoming Moroccan events (within 15 days)
    if (events && events.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingEvent = events
        .map(ev => {
          const target = new Date(ev.start_date);
          const diffTime = target.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return { ev, daysUntil: diffDays };
        })
        .find(item => item.daysUntil >= 0 && item.daysUntil <= 15);

      if (upcomingEvent) {
        ctx.upcomingMoroccanEvent = {
          name: upcomingEvent.ev.name,
          daysUntil: upcomingEvent.daysUntil
        };
      }
    }

    // 4. Check for budget buckets nearing limits (>= 85% spent, but not completely overspent)
    if (buckets && buckets.length > 0) {
      const nearingLimitBucket = buckets.find(b => {
        if (b.allocated_amount <= 0) return false;
        const ratio = b.spent_amount / b.allocated_amount;
        return ratio >= 0.85 && ratio < 1.1; // almost exhausted but within safe warning zone
      });

      if (nearingLimitBucket) {
        ctx.activeBucketNearLimit = nearingLimitBucket.name;
      }
    }

    return ctx;
  }, [goals, tontines, events, buckets]);

  // Determine if we should show the winback modal
  const shouldShow = useMemo(() => {
    if (dismissed) return false;
    
    // Do not show while underlying metadata is still loading
    if (loadingGoals || loadingTontines || loadingEvents || loadingBuckets) {
      return false;
    }

    return shouldTriggerWinBack(userId, lastShownTier);
  }, [dismissed, loadingGoals, loadingTontines, loadingEvents, loadingBuckets, userId, lastShownTier]);

  // Generate the actual winback message
  const winBackMessage = useMemo<WinBackMessage | null>(() => {
    if (!shouldShow) return null;
    return generateWinBackMessage(currentTier, context);
  }, [shouldShow, currentTier, context]);

  /**
   * Action to dismiss the winback message. Saves the current tier in localStorage
   * so it doesn't trigger again for this specific inactivity tier.
   */
  const dismissWinBack = () => {
    try {
      localStorage.setItem(`floussi_last_winback_shown_${userId}`, currentTier);
      setLastShownTier(currentTier);
      setDismissed(true);
    } catch (e) {
      console.error("Failed to dismiss winback modal", e);
    }
  };

  const hasBeenShownThisTier = lastShownTier === currentTier;

  return {
    winBackMessage,
    dismissWinBack,
    hasBeenShownThisTier,
    currentTier,
    isLoading: loadingGoals || loadingTontines || loadingEvents || loadingBuckets
  };
}
