import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { useTransactions } from './use-transactions';
import { useBuckets } from './use-buckets';
import { useMoroccanEvents } from './use-moroccan-events';
import { useTontines } from './use-tontines';
import { evaluateProactiveTriggers, ProactiveMessage } from '../lib/sidi-proactive-rules';

export function useSidiProactive() {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";

  const { transactions, loading: txLoading } = useTransactions(userId);
  const { buckets, loading: buckLoading } = useBuckets(userId);
  const { events, loading: evLoading } = useMoroccanEvents(userId);
  const { tontines, loading: tonLoading } = useTontines(userId);

  const [pendingMessages, setPendingMessages] = useState<ProactiveMessage[]>([]);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const storageKeyPending = `floussi_sidi_pending_proactive_${userId}`;

  // 1. Load pending messages from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKeyPending);
      if (raw) {
        setPendingMessages(JSON.parse(raw));
      }
    } catch (_) {}
  }, [userId, storageKeyPending]);

  // 2. Main function to evaluate triggers and update states
  const runEvaluation = useCallback(() => {
    if (txLoading || buckLoading || evLoading || tonLoading) return;

    const newAlerts = evaluateProactiveTriggers({
      userId,
      transactions,
      buckets,
      events,
      tontines
    });

    if (newAlerts.length > 0) {
      setPendingMessages(prev => {
        // Avoid duplicate alerts in memory
        const existingIds = new Set(prev.map(p => p.ruleName));
        const filteredNew = newAlerts.filter(a => !existingIds.has(a.ruleName));
        
        if (filteredNew.length > 0) {
          const event = new CustomEvent('floussi_sidi_proactive_added', { detail: { messages: filteredNew } });
          window.dispatchEvent(event);
        }

        const combined = [...prev, ...filteredNew];
        
        try {
          localStorage.setItem(storageKeyPending, JSON.stringify(combined));
        } catch (_) {}
        
        return combined;
      });
    }
  }, [userId, txLoading, buckLoading, evLoading, tonLoading, transactions, buckets, events, tontines, storageKeyPending]);

  // Run evaluation when data changes (and is fully loaded)
  useEffect(() => {
    runEvaluation();
  }, [runEvaluation]);

  // 3. Set periodic checks every 5 minutes
  useEffect(() => {
    checkIntervalRef.current = setInterval(() => {
      runEvaluation();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [runEvaluation]);

  // Dismiss message handler
  const dismissProactiveMessage = useCallback((id: string) => {
    setPendingMessages(prev => {
      const filtered = prev.filter(m => m.id !== id);
      try {
        localStorage.setItem(storageKeyPending, JSON.stringify(filtered));
      } catch (_) {}
      return filtered;
    });
  }, [storageKeyPending]);

  return {
    pendingProactiveMessages: pendingMessages,
    dismissProactiveMessage,
    triggerCheck: runEvaluation
  };
}
