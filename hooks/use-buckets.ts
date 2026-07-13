import { useState, useEffect, useCallback } from 'react';
import { Bucket, Transaction } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';

const DEFAULT_BUCKETS: Bucket[] = [
  {
    id: "bucket-food",
    user_id: "mock-user-id-9999",
    name: "Alimentation (Khobz & Lmarqa)",
    category: "food",
    allocated_amount: 1500,
    spent_amount: 320,
    color: "#10B981", // Green
    icon: "Utensils",
    is_essential: true,
    auto_allocate_percent: 40,
    order_index: 0,
    parent_id: null,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "bucket-housing",
    user_id: "mock-user-id-9999",
    name: "Logement & Factures (Dar & Kahraba)",
    category: "housing",
    allocated_amount: 2500,
    spent_amount: 2500,
    color: "#3B82F6", // Blue
    icon: "Home",
    is_essential: true,
    auto_allocate_percent: 50,
    order_index: 1,
    parent_id: null,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "bucket-tontine",
    user_id: "mock-user-id-9999",
    name: "Drahem d'Tontine (Daret)",
    category: "tontine",
    allocated_amount: 500,
    spent_amount: 500,
    color: "#8B5CF6", // Purple
    icon: "Users",
    is_essential: false,
    auto_allocate_percent: 10,
    order_index: 2,
    parent_id: null,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function useBuckets(userId: string = "mock-user-id-9999") {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadBuckets = useCallback(async () => {
    setLoading(true);
    let localBuckets = await OfflineDB.get<Bucket[]>('buckets');
    
    if (!localBuckets || localBuckets.length === 0) {
      localBuckets = DEFAULT_BUCKETS.map(b => ({ ...b, user_id: userId }));
      await OfflineDB.set('buckets', localBuckets);
      localStorage.setItem('floussi_table_buckets', JSON.stringify(localBuckets));
    }
    
    // Filter out archived ones for the active view, but we keep them available if needed
    setBuckets(localBuckets || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadBuckets();
  }, [loadBuckets]);

  const saveBuckets = async (newBuckets: Bucket[]) => {
    setBuckets(newBuckets);
    await OfflineDB.set('buckets', newBuckets);
    localStorage.setItem('floussi_table_buckets', JSON.stringify(newBuckets));
  };

  /**
   * Helper to recalculate spent amount from local transactions list
   */
  const recalculateSpent = useCallback(async () => {
    const transactions = await OfflineDB.get<Transaction[]>('transactions') || [];
    const activeBuckets = await OfflineDB.get<Bucket[]>('buckets') || [];
    
    const recomputed = activeBuckets.map(b => {
      const totalSpent = transactions
        .filter(t => t.bucket_id === b.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, spent_amount: totalSpent };
    });
    
    await saveBuckets(recomputed);
  }, []);

  /**
   * Create a new bucket
   */
  const createBucket = async (bucketData: Omit<Bucket, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newBucket: Bucket = {
      ...bucketData,
      id: generateId(),
      user_id: userId,
      parent_id: bucketData.parent_id || null,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const list = [...buckets, newBucket];
    await saveBuckets(list);

    try {
      await supabase.from('buckets').insert(newBucket);
    } catch (_) {
      await OfflineDB.addToSyncQueue({
        table: 'buckets',
        action: 'insert',
        data: newBucket
      });
    }
    await recalculateSpent();
  };

  /**
   * Update an existing bucket
   */
  const updateBucket = async (id: string, updates: Partial<Bucket>) => {
    const list = buckets.map(b => {
      if (b.id === id) {
        return { ...b, ...updates, updated_at: new Date().toISOString() };
      }
      return b;
    });
    
    await saveBuckets(list);
    const updated = list.find(b => b.id === id);

    if (updated) {
      try {
        await supabase.from('buckets').update(updated).eq('id', id);
      } catch (_) {
        await OfflineDB.addToSyncQueue({
          table: 'buckets',
          action: 'update',
          data: updated
        });
      }
    }
  };

  /**
   * Delete a bucket
   */
  const deleteBucket = async (id: string) => {
    const remaining = buckets.filter(b => b.id !== id);
    await saveBuckets(remaining);

    try {
      await supabase.from('buckets').delete().eq('id', id);
    } catch (_) {
      await OfflineDB.addToSyncQueue({
        table: 'buckets',
        action: 'delete',
        data: { id }
      });
    }
  };

  /**
   * Reorder buckets list (drag & drop mutation)
   */
  const reorderBuckets = async (reorderedList: Bucket[]) => {
    const listWithIndexes = reorderedList.map((b, idx) => ({
      ...b,
      order_index: idx,
      updated_at: new Date().toISOString()
    }));
    await saveBuckets(listWithIndexes);

    for (const b of listWithIndexes) {
      try {
        await supabase.from('buckets').update({ order_index: b.order_index }).eq('id', b.id);
      } catch (_) {
        await OfflineDB.addToSyncQueue({
          table: 'buckets',
          action: 'update',
          data: b
        });
      }
    }
  };

  /**
   * Transfer funds from one bucket to another
   */
  const transferBetweenBuckets = async (fromId: string, toId: string, amount: number, note?: string) => {
    const sourceBucket = buckets.find(b => b.id === fromId);
    const targetBucket = buckets.find(b => b.id === toId);
    if (!sourceBucket || !targetBucket) return;

    // Deduct from source allocation, add to target allocation
    const updatedSourceAlloc = Math.max(0, sourceBucket.allocated_amount - amount);
    const updatedTargetAlloc = targetBucket.allocated_amount + amount;

    await updateBucket(fromId, { allocated_amount: updatedSourceAlloc });
    await updateBucket(toId, { allocated_amount: updatedTargetAlloc });

    // Store a transaction entry of type 'transfer' for transparency
    const newTx: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      account_id: "acc-checking", // default account
      bucket_id: fromId,
      type: "transfer",
      amount: amount,
      description: note || `Transfert de funds: ${sourceBucket.name} -> ${targetBucket.name}`,
      merchant: targetBucket.name,
      category: "transfer",
      tags: ["transfer", "sanadiq"],
      receipt_url: null,
      is_recurring: false,
      recurring_frequency: null,
      transaction_date: new Date().toISOString().split('T')[0]
    };

    // Save transaction directly to db to log it
    const createdTx: Transaction = {
      ...newTx,
      id: generateId(),
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const currentTxs = await OfflineDB.get<Transaction[]>('transactions') || [];
    const nextTxs = [createdTx, ...currentTxs];
    await OfflineDB.set('transactions', nextTxs);
    localStorage.setItem('floussi_table_transactions', JSON.stringify(nextTxs));

    try {
      await supabase.from('transactions').insert(createdTx);
    } catch (_) {
      await OfflineDB.addToSyncQueue({
        table: 'transactions',
        action: 'insert',
        data: createdTx
      });
    }

    await recalculateSpent();
  };

  /**
   * Quick Add Expense to a specific bucket
   */
  const quickAddExpense = async (bucketId: string, amount: number, description: string, merchant: string = "Moul Hanout") => {
    const bucket = buckets.find(b => b.id === bucketId);
    if (!bucket) return;

    const newTx: Transaction = {
      id: generateId(),
      user_id: userId,
      account_id: "acc-cash", // default to Cash for quick Moroccan expense
      bucket_id: bucketId,
      type: "expense",
      amount: amount,
      description: description,
      merchant: merchant,
      category: bucket.category || "other",
      tags: ["cash", "quick-add"],
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

    // Refresh buckets spent amount
    await recalculateSpent();
  };

  /**
   * Reallocate automated budgets based on monthly income rules
   */
  const autoAllocate = async (incomeAmount: number) => {
    const updatedBuckets = buckets.map(b => {
      if (b.auto_allocate_percent > 0) {
        const allocated = Math.round((incomeAmount * b.auto_allocate_percent) / 100);
        return {
          ...b,
          allocated_amount: allocated,
          updated_at: new Date().toISOString()
        };
      }
      return b;
    });

    await saveBuckets(updatedBuckets);

    for (const b of updatedBuckets) {
      try {
        await supabase.from('buckets').update(b).eq('id', b.id);
      } catch (_) {
        await OfflineDB.addToSyncQueue({
          table: 'buckets',
          action: 'update',
          data: b
        });
      }
    }
  };

  // Compute calculated values per bucket
  const enrichedBuckets = buckets.map(b => {
    const spent = b.spent_amount || 0;
    const allocated = b.allocated_amount || 0;
    const remaining = Math.max(0, allocated - spent);
    const percent = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
    
    // Calculate status color
    let statusColor: 'green' | 'yellow' | 'red' | 'grey' | 'blue' = 'green';
    if (b.category === 'savings' || b.category === 'tontine') {
      statusColor = 'blue';
    } else if (percent >= 100) {
      statusColor = 'grey';
    } else if (percent >= 90) {
      statusColor = 'red';
    } else if (percent >= 70) {
      statusColor = 'yellow';
    }

    return {
      ...b,
      remaining,
      percent,
      statusColor
    };
  });

  return {
    buckets: enrichedBuckets,
    loading,
    createBucket,
    updateBucket,
    deleteBucket,
    reorderBuckets,
    transferBetweenBuckets,
    quickAddExpense,
    autoAllocate,
    refreshBuckets: recalculateSpent
  };
}
