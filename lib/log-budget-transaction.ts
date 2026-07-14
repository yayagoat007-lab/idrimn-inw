import { OfflineDB } from './offline-db';

/**
 * Shared helper to log a wallet transaction into the offline budget database.
 */
export async function logBudgetTransaction(
  userId: string,
  tx: {
    amount: number;
    description: string;
    category: string;
    tags: string[];
    merchant: string;
  }
) {
  try {
    const list = (await OfflineDB.get<any[]>('transactions')) || [];
    const newTx = {
      ...tx,
      id: `tx-${Math.floor(Math.random() * 1000000)}`,
      user_id: userId,
      account_id: 'acc-cash', // cash wallet
      bucket_id: null,
      type: 'expense',
      receipt_url: null,
      is_recurring: false,
      recurring_frequency: null,
      transaction_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedList = [newTx, ...list];
    await OfflineDB.set('transactions', updatedList);
    localStorage.setItem('floussi_table_transactions', JSON.stringify(updatedList));

    // recalculate buckets
    const buckets = (await OfflineDB.get<any[]>('buckets')) || [];
    const recomputedBuckets = buckets.map((b) => {
      const totalSpent = updatedList
        .filter((t) => t.bucket_id === b.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, spent_amount: totalSpent };
    });
    await OfflineDB.set('buckets', recomputedBuckets);
    localStorage.setItem('floussi_table_buckets', JSON.stringify(recomputedBuckets));
    window.dispatchEvent(new Event('floussi_transactions_updated'));
  } catch (err) {
    console.error('Error logging budget transaction', err);
  }
}
