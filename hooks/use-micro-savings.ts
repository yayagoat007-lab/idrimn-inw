import { useState, useEffect, useCallback } from 'react';
import { RoundUpSettings, MicroChallenge, WalletBalance } from '../types';
import {
  getWalletUserId,
  getRoundUpSettings,
  saveRoundUpSettings,
  getMicroChallenges,
  saveMicroChallenges,
  getWalletBalance,
  saveWalletBalance,
  addWalletMovement
} from '../lib/wallet-mock';
import { OfflineDB } from '../lib/offline-db';

export function useMicroSavings(userId: string = getWalletUserId()) {
  const [settings, setSettings] = useState<RoundUpSettings | null>(null);
  const [challenges, setChallenges] = useState<MicroChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavingsData = useCallback(() => {
    setLoading(true);
    const roundUp = getRoundUpSettings(userId);
    const chals = getMicroChallenges(userId);
    setSettings(roundUp);
    setChallenges(chals);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadSavingsData();
    const handleWalletUpdate = () => {
      loadSavingsData();
    };
    window.addEventListener('floussi_wallet_updated', handleWalletUpdate);
    return () => {
      window.removeEventListener('floussi_wallet_updated', handleWalletUpdate);
    };
  }, [loadSavingsData]);

  const notifyWalletUpdate = () => {
    window.dispatchEvent(new Event('floussi_wallet_updated'));
  };

  const updateRoundUpSettings = async (
    enabled: boolean,
    threshold: 5 | 10 | 20 | 50,
    targetBucketId: string | null
  ) => {
    const updated: RoundUpSettings = {
      userId,
      enabled,
      threshold,
      totalSaved: settings?.totalSaved || 0,
      targetBucketId
    };
    saveRoundUpSettings(userId, updated);
    setSettings(updated);
    notifyWalletUpdate();

    if (enabled) {
      import('../lib/gamification').then(({ unlockGlobalBadge }) => {
        unlockGlobalBadge(userId, 'smart_saver');
      }).catch(err => console.error(err));
    }
  };

  const toggleChallenge = async (challengeId: string) => {
    const list = getMicroChallenges(userId);
    const updated = list.map((c) => {
      if (c.id === challengeId) {
        return { ...c, active: !c.active };
      }
      return c;
    });
    saveMicroChallenges(userId, updated);
    setChallenges(updated);
    notifyWalletUpdate();
  };

  /**
   * Helper to execute a round-up saving event
   */
  const triggerRoundUpSave = async (amount: number) => {
    if (amount <= 0 || !settings?.enabled || !settings.targetBucketId) return;

    const walletBal = getWalletBalance(userId);
    if (walletBal.balance < amount) return; // ignore if wallet is empty

    // Deduct from wallet
    const updatedWallet: WalletBalance = {
      ...walletBal,
      balance: walletBal.balance - amount,
      updatedAt: new Date().toISOString()
    };
    saveWalletBalance(userId, updatedWallet);

    // Save settings total
    const updatedSettings = {
      ...settings,
      totalSaved: settings.totalSaved + amount
    };
    saveRoundUpSettings(userId, updatedSettings);
    setSettings(updatedSettings);

    // Add movement
    addWalletMovement(userId, {
      type: 'round_up',
      amount,
      description: `Épargne automatique : Arrondi transaction`,
      status: 'completed'
    });

    // Add to bucket
    try {
      const buckets = await OfflineDB.get<any[]>('buckets') || [];
      const updatedBuckets = buckets.map((b) => {
        if (b.id === settings.targetBucketId) {
          return { ...b, allocated_amount: (b.allocated_amount || 0) + amount };
        }
        return b;
      });
      await OfflineDB.set('buckets', updatedBuckets);
      localStorage.setItem('floussi_table_buckets', JSON.stringify(updatedBuckets));
      window.dispatchEvent(new Event('floussi_buckets_updated'));
    } catch (e) {
      console.error(e);
    }

    notifyWalletUpdate();
  };

  /**
   * Simulate checking / solving active challenges for today
   */
  const simulateChallengesAudit = async () => {
    const list = getMicroChallenges(userId);
    const walletBal = getWalletBalance(userId);
    
    let totalIncrement = 0;
    const updated = list.map((c) => {
      if (!c.active) return c;

      // Simulate success
      let gain = 0;
      if (c.type === 'no_coffee') {
        gain = 10;
      } else if (c.type === 'no_taxi') {
        gain = 5;
      }

      if (walletBal.balance >= gain) {
        totalIncrement += gain;
        return {
          ...c,
          savedAmount: c.savedAmount + gain,
          streakDays: c.streakDays + 1
        };
      }
      return c;
    });

    if (totalIncrement > 0) {
      // Deduct from wallet
      const updatedWallet: WalletBalance = {
        ...walletBal,
        balance: walletBal.balance - totalIncrement,
        updatedAt: new Date().toISOString()
      };
      saveWalletBalance(userId, updatedWallet);

      saveMicroChallenges(userId, updated);
      setChallenges(updated);

      addWalletMovement(userId, {
        type: 'round_up',
        amount: totalIncrement,
        description: `Défis Micro-Épargne réussis : +${totalIncrement} DH épargnés !`,
        status: 'completed'
      });

      // Transfer to target bucket if any round-up bucket exists
      if (settings?.targetBucketId) {
        try {
          const buckets = await OfflineDB.get<any[]>('buckets') || [];
          const updatedBuckets = buckets.map((b) => {
            if (b.id === settings.targetBucketId) {
              return { ...b, allocated_amount: (b.allocated_amount || 0) + totalIncrement };
            }
            return b;
          });
          await OfflineDB.set('buckets', updatedBuckets);
          localStorage.setItem('floussi_table_buckets', JSON.stringify(updatedBuckets));
          window.dispatchEvent(new Event('floussi_buckets_updated'));
        } catch (e) {
          console.error(e);
        }
      }

      notifyWalletUpdate();
    }
  };

  return {
    settings,
    challenges,
    loading,
    updateRoundUpSettings,
    toggleChallenge,
    triggerRoundUpSave,
    simulateChallengesAudit
  };
}
