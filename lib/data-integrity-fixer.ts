import { OfflineDB } from './offline-db';
import { IntegrityIssue } from './data-integrity-checker';
import { Transaction, Bucket, Goal, TontineMember, TontinePayment } from '../types';

/**
 * Applies a specific correction action for an IntegrityIssue.
 * Does NOT perform destructive actions on actual transaction or budget amounts.
 */
export async function applyFix(
  issue: IntegrityIssue, 
  choice?: string // optional choice like a new bucket_id or fallback
): Promise<{ success: boolean; error?: string }> {
  try {
    const { affectedEntityType, affectedEntityId, suggestedFix } = issue;

    if (suggestedFix === 'remove_reference') {
      if (affectedEntityType === 'transaction') {
        const transactions = await OfflineDB.get<Transaction[]>('transactions') || [];
        const index = transactions.findIndex(t => t.id === affectedEntityId);
        if (index !== -1) {
          transactions[index] = { 
            ...transactions[index], 
            bucket_id: null,
            updated_at: new Date().toISOString()
          };
          await OfflineDB.set('transactions', transactions);
          localStorage.setItem('floussi_table_transactions', JSON.stringify(transactions));
          window.dispatchEvent(new Event('floussi_transactions_updated'));
          return { success: true };
        }
      }

      if (affectedEntityType === 'goal') {
        const goals = await OfflineDB.get<Goal[]>('goals') || [];
        const index = goals.findIndex(g => g.id === affectedEntityId);
        if (index !== -1) {
          goals[index] = { 
            ...goals[index], 
            bucket_id: null,
            updated_at: new Date().toISOString()
          };
          await OfflineDB.set('goals', goals);
          localStorage.setItem('floussi_table_goals', JSON.stringify(goals));
          window.dispatchEvent(new Event('floussi_goals_updated'));
          return { success: true };
        }
      }
    }

    if (suggestedFix === 'reassign' && choice) {
      if (affectedEntityType === 'transaction') {
        const transactions = await OfflineDB.get<Transaction[]>('transactions') || [];
        const index = transactions.findIndex(t => t.id === affectedEntityId);
        if (index !== -1) {
          transactions[index] = { 
            ...transactions[index], 
            bucket_id: choice,
            updated_at: new Date().toISOString()
          };
          await OfflineDB.set('transactions', transactions);
          localStorage.setItem('floussi_table_transactions', JSON.stringify(transactions));
          window.dispatchEvent(new Event('floussi_transactions_updated'));
          return { success: true };
        }
      }

      if (affectedEntityType === 'goal') {
        const goals = await OfflineDB.get<Goal[]>('goals') || [];
        const index = goals.findIndex(g => g.id === affectedEntityId);
        if (index !== -1) {
          goals[index] = { 
            ...goals[index], 
            bucket_id: choice,
            updated_at: new Date().toISOString()
          };
          await OfflineDB.set('goals', goals);
          localStorage.setItem('floussi_table_goals', JSON.stringify(goals));
          window.dispatchEvent(new Event('floussi_goals_updated'));
          return { success: true };
        }
      }
    }

    if (suggestedFix === 'delete_orphan') {
      if (affectedEntityType === 'tontine_member') {
        const members = await OfflineDB.get<TontineMember[]>('tontine_members') || [];
        const filtered = members.filter(m => m.id !== affectedEntityId);
        await OfflineDB.set('tontine_members', filtered);
        localStorage.setItem('floussi_table_tontine_members', JSON.stringify(filtered));
        window.dispatchEvent(new Event('floussi_tontines_updated'));
        return { success: true };
      }

      if (affectedEntityType === 'tontine_payment') {
        const payments = await OfflineDB.get<TontinePayment[]>('tontine_payments') || [];
        const filtered = payments.filter(p => p.id !== affectedEntityId);
        await OfflineDB.set('tontine_payments', filtered);
        localStorage.setItem('floussi_table_tontine_payments', JSON.stringify(filtered));
        window.dispatchEvent(new Event('floussi_tontines_updated'));
        return { success: true };
      }
    }

    if (suggestedFix === 'recalculate_spent') {
      if (affectedEntityType === 'bucket') {
        const buckets = await OfflineDB.get<Bucket[]>('buckets') || [];
        const transactions = await OfflineDB.get<Transaction[]>('transactions') || [];
        
        const bIndex = buckets.findIndex(b => b.id === affectedEntityId);
        if (bIndex !== -1) {
          const targetBucket = buckets[bIndex];
          // Recalculate real sum from transactions for this user & bucket
          const realSpent = transactions
            .filter(t => t.bucket_id === targetBucket.id && t.type === 'expense' && t.user_id === targetBucket.user_id)
            .reduce((sum, t) => sum + t.amount, 0);
          
          buckets[bIndex] = {
            ...targetBucket,
            allocated_amount: Math.max(0, targetBucket.allocated_amount), // ensure non-negative
            spent_amount: Math.max(0, Math.round(realSpent * 100) / 100),
            updated_at: new Date().toISOString()
          };
          
          await OfflineDB.set('buckets', buckets);
          localStorage.setItem('floussi_table_buckets', JSON.stringify(buckets));
          window.dispatchEvent(new Event('floussi_buckets_updated'));
          return { success: true };
        }
      }
    }

    return { success: false, error: 'Type de problème ou de correction non supporté.' };
  } catch (error: any) {
    console.error('[Integrity Fixer] Failed to apply fix for issue:', issue, error);
    return { success: false, error: error?.message || String(error) };
  }
}
