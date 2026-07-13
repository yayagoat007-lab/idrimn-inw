import { useState, useEffect, useCallback } from 'react';
import { Goal, Transaction } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';

const DEFAULT_GOALS: Goal[] = [
  {
    id: "goal-1",
    user_id: "mock-user-id-9999",
    name: "Achat d'Or (Lgbeba d'Dhab)",
    target_amount: 15000,
    current_amount: 4500,
    deadline: "2026-12-31",
    bucket_id: null,
    color: "#D97706", // Amber / Gold
    icon: "Coins",
    auto_contribute_amount: 500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "goal-2",
    user_id: "mock-user-id-9999",
    name: "Omra / Hajj (Safar Al-Haram)",
    target_amount: 30000,
    current_amount: 8000,
    deadline: "2027-05-15",
    bucket_id: null,
    color: "#059669", // Emerald
    icon: "Moon",
    auto_contribute_amount: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export interface GoalContributionLog {
  id: string;
  goal_id: string;
  amount: number;
  date: string;
  note: string;
}

export function useGoals(userId: string = "mock-user-id-9999") {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [contributions, setContributions] = useState<GoalContributionLog[]>([]);

  const loadGoalsData = useCallback(async () => {
    setLoading(true);
    let localGoals = await OfflineDB.get<Goal[]>('goals');

    if (!localGoals || localGoals.length === 0) {
      localGoals = DEFAULT_GOALS.map(g => ({ ...g, user_id: userId }));
      await OfflineDB.set('goals', localGoals);
      localStorage.setItem('floussi_table_goals', JSON.stringify(localGoals));
    }

    setGoals(localGoals || []);

    // Load contribution logs from IndexedDB (fallback to storage)
    let logs = await OfflineDB.get<GoalContributionLog[]>('goal_contributions');
    if (!logs) {
      logs = [
        {
          id: "log-seed-1",
          goal_id: "goal-1",
          amount: 2500,
          date: "2026-06-01",
          note: "Apport initial"
        },
        {
          id: "log-seed-2",
          goal_id: "goal-1",
          amount: 2000,
          date: "2026-07-01",
          note: "Épargne mensuelle"
        },
        {
          id: "log-seed-3",
          goal_id: "goal-2",
          amount: 8000,
          date: "2026-06-15",
          note: "Versement de départ d'Omra"
        }
      ];
      await OfflineDB.set('goal_contributions', logs);
    }
    setContributions(logs);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadGoalsData();
  }, [loadGoalsData]);

  const saveGoals = async (newGoals: Goal[]) => {
    setGoals(newGoals);
    await OfflineDB.set('goals', newGoals);
    localStorage.setItem('floussi_table_goals', JSON.stringify(newGoals));
  };

  const createGoal = async (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: generateId(),
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const list = [...goals, newGoal];
    await saveGoals(list);

    try {
      await supabase.from('goals').insert(newGoal);
    } catch (_) {
      await OfflineDB.addToSyncQueue({
        table: 'goals',
        action: 'insert',
        data: newGoal
      });
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const list = goals.map(g => {
      if (g.id === id) {
        return { ...g, ...updates, updated_at: new Date().toISOString() };
      }
      return g;
    });

    await saveGoals(list);

    const target = list.find(g => g.id === id);
    if (target) {
      try {
        await supabase.from('goals').update(target).eq('id', id);
      } catch (_) {
        await OfflineDB.addToSyncQueue({
          table: 'goals',
          action: 'update',
          data: target
        });
      }
    }
  };

  const deleteGoal = async (id: string) => {
    const remaining = goals.filter(g => g.id !== id);
    await saveGoals(remaining);

    try {
      await supabase.from('goals').delete().eq('id', id);
    } catch (_) {
      await OfflineDB.addToSyncQueue({
        table: 'goals',
        action: 'delete',
        data: { id }
      });
    }

    // Clean contributions for this goal too
    const filteredLogs = contributions.filter(c => c.goal_id !== id);
    setContributions(filteredLogs);
    await OfflineDB.set('goal_contributions', filteredLogs);
  };

  /**
   * Contribute money to a goal
   */
  const contributeToGoal = async (id: string, amount: number, note: string = "Contribution épargne") => {
    const list = goals.map(g => {
      if (g.id === id) {
        const nextAmount = Math.min(g.target_amount, g.current_amount + amount);
        return {
          ...g,
          current_amount: nextAmount,
          updated_at: new Date().toISOString()
        };
      }
      return g;
    });

    await saveGoals(list);

    // Save contribution log
    const newLog: GoalContributionLog = {
      id: generateId(),
      goal_id: id,
      amount,
      date: new Date().toISOString().split('T')[0],
      note
    };
    const updatedLogs = [newLog, ...contributions];
    setContributions(updatedLogs);
    await OfflineDB.set('goal_contributions', updatedLogs);

    // Update DB
    const target = list.find(g => g.id === id);
    if (target) {
      try {
        await supabase.from('goals').update({ current_amount: target.current_amount }).eq('id', id);
      } catch (_) {
        await OfflineDB.addToSyncQueue({
          table: 'goals',
          action: 'update',
          data: { id, current_amount: target.current_amount }
        });
      }

      // Also create a transaction in history reflecting this savings action
      const newTx: Transaction = {
        id: generateId(),
        user_id: userId,
        account_id: "acc-checking",
        bucket_id: target.bucket_id || null,
        type: "expense", // counts as a contribution outgoing from checking to savings
        amount: amount,
        description: `Épargne Objectif : ${target.name}`,
        merchant: "Floussi Iddikhar",
        category: "savings",
        tags: ["épargne", "objectifs"],
        receipt_url: null,
        is_recurring: false,
        recurring_frequency: null,
        transaction_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const currentTxs = await OfflineDB.get<Transaction[]>('transactions') || [];
      const nextTxs = [newTx, ...currentTxs];
      await OfflineDB.set('transactions', nextTxs);
      localStorage.setItem('floussi_table_transactions', JSON.stringify(nextTxs));

      try {
        await supabase.from('transactions').insert(newTx);
      } catch (_) {
        await OfflineDB.addToSyncQueue({
          table: 'transactions',
          action: 'insert',
          data: newTx
        });
      }
    }
  };

  /**
   * Suggested monthly rate calculation helper
   */
  const getSuggestedMonthlyContribution = (goal: Goal) => {
    if (!goal.deadline) return 0;
    const deadlineDate = new Date(goal.deadline);
    const today = new Date();
    
    // Calculate months left
    const yearDiff = deadlineDate.getFullYear() - today.getFullYear();
    const monthDiff = deadlineDate.getMonth() - today.getMonth();
    const months = yearDiff * 12 + monthDiff;
    
    const needed = Math.max(0, goal.target_amount - goal.current_amount);
    if (months <= 0) return needed;
    return Math.round(needed / months);
  };

  return {
    goals,
    contributions,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    getSuggestedMonthlyContribution
  };
}
