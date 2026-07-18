import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './use-auth';
import { useAccounts } from './use-accounts';
import { useGoals } from './use-goals';
import { useTransactions } from './use-transactions';
import { useBuckets } from './use-buckets';
import { SETUP_CHECKLIST_ITEMS, calculateChecklistProgress, shouldShowChecklist, SetupChecklistData, ChecklistItem } from '../lib/setup-checklist';
import { awardGlobalXp } from '../lib/gamification';
import { getWalletMovements } from '../lib/wallet-mock';

export function useSetupChecklist(userId: string = "mock-user-id-9999") {
  const { profile } = useAuth();
  const { accounts, refreshAccounts } = useAccounts(userId);
  const { goals } = useGoals(userId);
  const { transactions } = useTransactions(userId);
  const { buckets } = useBuckets(userId);

  const [sidiMessages, setSidiMessages] = useState<any[]>([]);
  const [walletMovements, setWalletMovements] = useState<any[]>([]);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const dismissKey = `floussi_setup_checklist_dismissed_${userId}`;
  const rewardKey = `floussi_checklist_rewarded_${userId}`;

  // 1. Load Sidi messages
  const loadSidiMessages = useCallback(() => {
    const historyKey = `floussi_sidi_history_${userId}`;
    const raw = localStorage.getItem(historyKey);
    if (raw) {
      try {
        setSidiMessages(JSON.parse(raw));
      } catch (_) {}
    }
  }, [userId]);

  // 2. Load Wallet movements
  const loadWalletMovements = useCallback(() => {
    const movements = getWalletMovements(userId);
    setWalletMovements(movements);
  }, [userId]);

  // 3. Load dismissed status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(dismissKey) === 'true';
      setIsDismissed(dismissed);
    }
  }, [dismissKey]);

  useEffect(() => {
    loadSidiMessages();
    loadWalletMovements();

    // Set intervals to verify changes
    const interval = setInterval(() => {
      loadSidiMessages();
      loadWalletMovements();
    }, 3000);

    const handleWalletUpdate = () => {
      loadWalletMovements();
    };

    window.addEventListener('floussi_wallet_updated', handleWalletUpdate);
    window.addEventListener('floussi_wallet_discovered_updated', handleWalletUpdate);
    window.addEventListener('floussi_sidi_history_updated', loadSidiMessages);

    return () => {
      clearInterval(interval);
      window.removeEventListener('floussi_wallet_updated', handleWalletUpdate);
      window.removeEventListener('floussi_wallet_discovered_updated', handleWalletUpdate);
      window.removeEventListener('floussi_sidi_history_updated', loadSidiMessages);
    };
  }, [loadSidiMessages, loadWalletMovements]);

  // Combine user data object
  const userData = useMemo<SetupChecklistData>(() => ({
    accounts,
    goals,
    transactions,
    sidiMessages,
    buckets,
    walletMovements
  }), [accounts, goals, transactions, sidiMessages, buckets, walletMovements]);

  // Calculate items with their live completed status
  const items = useMemo(() => {
    return SETUP_CHECKLIST_ITEMS.map(item => ({
      ...item,
      isCompleted: item.isCompleted(userData)
    }));
  }, [userData]);

  // Calculate progress percent
  const progress = useMemo(() => {
    return calculateChecklistProgress(SETUP_CHECKLIST_ITEMS, userData);
  }, [userData]);

  // Auto-award XP on completing items
  useEffect(() => {
    if (!userId) return;
    try {
      const rewardedListRaw = localStorage.getItem(rewardKey);
      const rewardedList: string[] = rewardedListRaw ? JSON.parse(rewardedListRaw) : [];
      let updated = false;
      const nextRewarded = [...rewardedList];

      SETUP_CHECKLIST_ITEMS.forEach(item => {
        if (item.isCompleted(userData) && !nextRewarded.includes(item.id)) {
          nextRewarded.push(item.id);
          awardGlobalXp(userId, item.xpReward);
          updated = true;
        }
      });

      if (updated) {
        localStorage.setItem(rewardKey, JSON.stringify(nextRewarded));
      }
    } catch (e) {
      console.error("Error auto-awarding checklist item XP", e);
    }
  }, [userData, userId, rewardKey]);

  // Calculate visibility based on timing, completed status, and explicit dismiss
  const isVisible = useMemo(() => {
    if (isDismissed) return false;
    return shouldShowChecklist(profile?.created_at, progress.percentComplete);
  }, [isDismissed, profile?.created_at, progress.percentComplete]);

  // Explicit manual close action
  const dismissChecklist = useCallback(() => {
    localStorage.setItem(dismissKey, 'true');
    setIsDismissed(true);
  }, [dismissKey]);

  return {
    items,
    progress,
    isVisible,
    dismissChecklist,
    refreshData: () => {
      refreshAccounts();
      loadSidiMessages();
      loadWalletMovements();
    }
  };
}
