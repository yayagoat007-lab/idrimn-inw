import { useState, useEffect, useCallback } from 'react';
import { RemittanceRecord, Transaction } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { generateId } from '../lib/utils';

const STORAGE_KEY_REMITTANCES = 'floussi_remittances';

export function useRemittances(userId: string = "mock-user-id-9999") {
  const [remittances, setRemittances] = useState<RemittanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRemittances = useCallback(async () => {
    setLoading(true);
    let list = await OfflineDB.get<RemittanceRecord[]>('remittances');
    if (!list) {
      // Look in localStorage
      const saved = localStorage.getItem(STORAGE_KEY_REMITTANCES);
      if (saved) {
        try {
          list = JSON.parse(saved);
        } catch (_) {}
      }
    }
    if (!list) {
      list = [];
    }
    setRemittances(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRemittances();
  }, [loadRemittances]);

  const saveRemittancesList = async (list: RemittanceRecord[]) => {
    setRemittances(list);
    await OfflineDB.set('remittances', list);
    localStorage.setItem(STORAGE_KEY_REMITTANCES, JSON.stringify(list));
  };

  const createRemittance = async (data: Omit<RemittanceRecord, 'id' | 'userId' | 'date'>) => {
    const newRecord: RemittanceRecord = {
      ...data,
      id: 'rem-' + generateId(),
      userId,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedList = [newRecord, ...remittances];
    await saveRemittancesList(updatedList);

    // Also create corresponding transaction in normal transactions
    const amountMAD = newRecord.amountMAD;
    const newTx: Transaction = {
      id: 'tx-' + generateId(),
      user_id: userId,
      account_id: 'acc-checking', // Default bank account
      bucket_id: null,
      type: 'expense',
      amount: amountMAD,
      description: `Remise d'argent - ${newRecord.recipientName} (${newRecord.amountForeign} ${newRecord.foreignCurrency})`,
      merchant: newRecord.method === 'virement' ? 'Virement Bancaire' : newRecord.method.toUpperCase(),
      category: 'transferts',
      tags: ['mre', 'remittance', newRecord.recipientRelation],
      receipt_url: null,
      is_recurring: newRecord.isRecurring,
      recurring_frequency: newRecord.recurringFrequency || null,
      transaction_date: newRecord.date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Append to transactions
    let transactions = await OfflineDB.get<Transaction[]>('transactions') || [];
    if (transactions.length === 0) {
      const saved = localStorage.getItem('floussi_table_transactions');
      if (saved) {
        try { transactions = JSON.parse(saved); } catch (_) {}
      }
    }
    const updatedTxs = [newTx, ...transactions];
    await OfflineDB.set('transactions', updatedTxs);
    localStorage.setItem('floussi_table_transactions', JSON.stringify(updatedTxs));

    // Recalculate buckets if needed
    const buckets = await OfflineDB.get<any[]>('buckets') || [];
    const recomputedBuckets = buckets.map(b => {
      const totalSpent = updatedTxs
        .filter(t => t.bucket_id === b.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, spent_amount: Math.round(totalSpent * 100) / 100 };
    });
    await OfflineDB.set('buckets', recomputedBuckets);
    localStorage.setItem('floussi_table_buckets', JSON.stringify(recomputedBuckets));

    return newRecord;
  };

  const deleteRemittance = async (id: string) => {
    const updatedList = remittances.filter(r => r.id !== id);
    await saveRemittancesList(updatedList);
  };

  const getRemittanceStats = () => {
    const totalSent = remittances.reduce((sum, r) => sum + r.amountMAD, 0);
    const months = new Set(remittances.map(r => r.date.substring(0, 7)));
    const countMonths = Math.max(1, months.size);
    const averageMonthly = remittances.length > 0 ? totalSent / countMonths : 0;
    return {
      totalSent,
      averageMonthly,
      count: remittances.length
    };
  };

  const getRemittanceTrend = (monthsCount: number = 6) => {
    const trendData: { month: string; amount: number; count: number }[] = [];
    const now = new Date();
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
      const yearMonth = d.toISOString().substring(0, 7); // "YYYY-MM"
      
      const filtered = remittances.filter(r => r.date.startsWith(yearMonth));
      const amount = filtered.reduce((sum, r) => sum + r.amountMAD, 0);
      trendData.push({
        month: monthLabel,
        amount,
        count: filtered.length
      });
    }
    return trendData;
  };

  return {
    remittances,
    loading,
    createRemittance,
    deleteRemittance,
    getRemittanceStats,
    getRemittanceTrend,
    refresh: loadRemittances
  };
}
