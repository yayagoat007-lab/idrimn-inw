import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    user_id: "mock-user-id-9999",
    account_id: "acc-cash", // Cash wallet
    bucket_id: "bucket-food",
    type: "expense",
    amount: 120,
    description: "Lkhoudra o lghasb (Marché central)",
    merchant: "Hanout Souq",
    category: "food",
    tags: ["cash", "souq"],
    receipt_url: null,
    is_recurring: false,
    recurring_frequency: null,
    transaction_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "tx-2",
    user_id: "mock-user-id-9999",
    account_id: "acc-checking", // CIH bank card
    bucket_id: "bucket-food",
    type: "expense",
    amount: 200,
    description: "Courses hebdomadaires Marjane",
    merchant: "Marjane",
    category: "food",
    tags: ["carte", "marjane"],
    receipt_url: null,
    is_recurring: false,
    recurring_frequency: null,
    transaction_date: new Date(Date.now() - 24*3600*1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "tx-3",
    user_id: "mock-user-id-9999",
    account_id: "acc-cash",
    bucket_id: null,
    type: "expense",
    amount: 15,
    description: "Petit taxi rouge",
    merchant: "Taxi Casablanca",
    category: "transport",
    tags: ["cash", "taxi"],
    receipt_url: null,
    is_recurring: false,
    recurring_frequency: null,
    transaction_date: new Date(Date.now() - 2*24*3600*1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "tx-4",
    user_id: "mock-user-id-9999",
    account_id: "acc-checking",
    bucket_id: "bucket-housing",
    type: "expense",
    amount: 2500,
    description: "Kraya dyal dar (Loyer)",
    merchant: "Moul l'Dar",
    category: "housing",
    tags: ["virement", "housing"],
    receipt_url: null,
    is_recurring: true,
    recurring_frequency: "monthly",
    transaction_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * Custom hook to manage transactions.
 * Includes tracking of cash-to-card ratios, auto bucket updates, and offline sync queuing.
 */
export function useTransactions(userId: string = "mock-user-id-9999", onBucketUpdate?: () => void) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTransactions() {
      setLoading(true);
      let localTxs = await OfflineDB.get<Transaction[]>('transactions');
      
      if (!localTxs || localTxs.length === 0) {
        localTxs = SEED_TRANSACTIONS.map(tx => ({ ...tx, user_id: userId }));
        await OfflineDB.set('transactions', localTxs);
        localStorage.setItem('floussi_table_transactions', JSON.stringify(localTxs));
      }

      setTransactions(localTxs);
      setLoading(false);
    }
    
    loadTransactions();
  }, [userId]);

  const saveTransactions = async (newTxs: Transaction[]) => {
    setTransactions(newTxs);
    await OfflineDB.set('transactions', newTxs);
    localStorage.setItem('floussi_table_transactions', JSON.stringify(newTxs));
  };

  /**
   * Recalculates spent amounts inside buckets after transaction updates
   */
  const triggerLocalBucketRecalculation = async (updatedTxs: Transaction[]) => {
    const buckets = await OfflineDB.get<any[]>('buckets') || [];
    const recomputedBuckets = buckets.map(b => {
      const totalSpent = updatedTxs
        .filter(t => t.bucket_id === b.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, spent_amount: totalSpent };
    });
    await OfflineDB.set('buckets', recomputedBuckets);
    localStorage.setItem('floussi_table_buckets', JSON.stringify(recomputedBuckets));
    
    if (onBucketUpdate) {
      onBucketUpdate();
    }
  };

  /**
   * Create transaction
   */
  const createTransaction = async (txData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newTx: Transaction = {
      ...txData,
      id: generateId(),
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const list = [newTx, ...transactions];
    await saveTransactions(list);
    await triggerLocalBucketRecalculation(list);

    // Sync to Supabase
    try {
      await supabase.from('transactions').insert(newTx);
    } catch (_) {
      await OfflineDB.addToSyncQueue({
        table: 'transactions',
        action: 'insert',
        data: newTx
      });
    }
  };

  /**
   * Delete transaction
   */
  const deleteTransaction = async (id: string) => {
    const remaining = transactions.filter(t => t.id !== id);
    await saveTransactions(remaining);
    await triggerLocalBucketRecalculation(remaining);

    try {
      await supabase.from('transactions').delete().eq('id', id);
    } catch (_) {
      await OfflineDB.addToSyncQueue({
        table: 'transactions',
        action: 'delete',
        data: { id }
      });
    }
  };

  /**
   * Analytics helpers
   */
  const getCashRatio = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return 0;
    
    const cashExpenses = expenses.filter(t => t.tags.includes('cash') || t.account_id === 'acc-cash');
    const totalCashAmount = cashExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalAmount = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    return Math.round((totalCashAmount / totalAmount) * 100);
  };

  return {
    transactions,
    loading,
    createTransaction,
    deleteTransaction,
    getCashRatio
  };
}
