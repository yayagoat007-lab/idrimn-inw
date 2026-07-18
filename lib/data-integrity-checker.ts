import { OfflineDB } from './offline-db';
import { 
  Transaction, 
  Bucket, 
  Goal, 
  Tontine, 
  TontineMember, 
  TontinePayment, 
  MonthlyIncome 
} from '../types';

export interface IntegrityIssue {
  id: string;
  severity: 'info' | 'warning' | 'error';
  category: string;
  description: {
    fr: string;
    darija: string;
  };
  affectedEntityType: 'transaction' | 'goal' | 'tontine_member' | 'tontine_payment' | 'bucket' | 'budget';
  affectedEntityId: string;
  suggestedFix: 'reassign' | 'remove_reference' | 'delete_orphan' | 'recalculate_spent' | 'manual_review';
  autoFixable: boolean;
  metadata?: any;
}

/**
 * Runs a complete diagnostic of Floussi's local database structures
 * for the specified user and returns a list of issues found.
 */
export async function runIntegrityCheck(userId: string): Promise<IntegrityIssue[]> {
  const issues: IntegrityIssue[] = [];

  // 1. Fetch all data from OfflineDB
  const transactions = await OfflineDB.get<Transaction[]>('transactions') || [];
  const buckets = await OfflineDB.get<Bucket[]>('buckets') || [];
  const goals = await OfflineDB.get<Goal[]>('goals') || [];
  const tontines = await OfflineDB.get<Tontine[]>('tontines') || [];
  const tontineMembers = await OfflineDB.get<TontineMember[]>('tontine_members') || [];
  const tontinePayments = await OfflineDB.get<TontinePayment[]>('tontine_payments') || [];
  const incomes = await OfflineDB.get<MonthlyIncome[]>('monthly_incomes') || [];

  // Filter lists for the current user where applicable
  const userTransactions = transactions.filter(t => t.user_id === userId);
  const userBuckets = buckets.filter(b => b.user_id === userId);
  const userGoals = goals.filter(g => g.user_id === userId);
  
  // Note: Tontines might be shared or creator-specific. We check members of active tontines
  const activeBucketIds = new Set(userBuckets.map(b => b.id));
  const activeTontineIds = new Set(tontines.map(t => t.id));
  const activeMemberIds = new Set(tontineMembers.map(m => m.id));

  // --- CHECK A: TRANSACTION REFERENTIAL INTEGRITY ---
  for (const tx of userTransactions) {
    if (tx.bucket_id && !activeBucketIds.has(tx.bucket_id)) {
      issues.push({
        id: `tx-orphan-bucket-${tx.id}`,
        severity: 'warning',
        category: 'referential_integrity',
        description: {
          fr: `La transaction "${tx.description || 'Sans description'}" (${tx.amount} MAD) fait référence à une catégorie/bucket supprimé ou inexistant.`,
          darija: `L-mu3amala "${tx.description || 'Bla smya'}" (${tx.amount} MAD) tat-chira l chi bucket li mmsouh wla ma kaynch.`
        },
        affectedEntityType: 'transaction',
        affectedEntityId: tx.id,
        suggestedFix: 'remove_reference',
        autoFixable: true,
        metadata: { orphanBucketId: tx.bucket_id }
      });
    }
  }

  // --- CHECK B: GOAL REFERENTIAL INTEGRITY ---
  for (const goal of userGoals) {
    if (goal.bucket_id && !activeBucketIds.has(goal.bucket_id)) {
      issues.push({
        id: `goal-orphan-bucket-${goal.id}`,
        severity: 'info',
        category: 'referential_integrity',
        description: {
          fr: `L'objectif d'épargne "${goal.name}" fait référence à un bucket supprimé ou inexistant.`,
          darija: `L-hadaf dyal l-tikhâre "${goal.name}" kay-chira l-chi bucket mmsouh wla ma kaynch.`
        },
        affectedEntityType: 'goal',
        affectedEntityId: goal.id,
        suggestedFix: 'remove_reference',
        autoFixable: true,
        metadata: { orphanBucketId: goal.bucket_id }
      });
    }
  }

  // --- CHECK C: TONTINE MEMBERS INTEGRITY ---
  // If a tontine member record exists, but the associated tontine was deleted
  for (const member of tontineMembers) {
    if (member.user_id === userId && !activeTontineIds.has(member.tontine_id)) {
      issues.push({
        id: `member-orphan-tontine-${member.id}`,
        severity: 'warning',
        category: 'referential_integrity',
        description: {
          fr: `Votre inscription en tant que membre fait référence à une Tontine (Daret) qui n'existe plus.`,
          darija: `L-moucharaka dyalk f d-daret kat-chira l-chi Tontine li ma bqatch kayna.`
        },
        affectedEntityType: 'tontine_member',
        affectedEntityId: member.id,
        suggestedFix: 'delete_orphan',
        autoFixable: true,
        metadata: { orphanTontineId: member.tontine_id }
      });
    }
  }

  // --- CHECK D: TONTINE PAYMENTS INTEGRITY ---
  for (const p of tontinePayments) {
    if (!activeTontineIds.has(p.tontine_id)) {
      issues.push({
        id: `payment-orphan-tontine-${p.id}`,
        severity: 'info',
        category: 'referential_integrity',
        description: {
          fr: `Un versement de Tontine (${p.amount} MAD) fait référence à une Tontine inexistante.`,
          darija: `Wahd l-khlass dyal d-daret (${p.amount} MAD) kay-chira l-chi Tontine ma kayna2.`
        },
        affectedEntityType: 'tontine_payment',
        affectedEntityId: p.id,
        suggestedFix: 'delete_orphan',
        autoFixable: true,
        metadata: { orphanTontineId: p.tontine_id }
      });
    } else if (!activeMemberIds.has(p.member_id)) {
      issues.push({
        id: `payment-orphan-member-${p.id}`,
        severity: 'info',
        category: 'referential_integrity',
        description: {
          fr: `Un versement de Tontine (${p.amount} MAD) fait référence à un membre qui a quitté ou a été retiré.`,
          darija: `Wahd l-khlass dyal d-daret (${p.amount} MAD) kay-chira l-chi member li khrej wla t-hyed.`
        },
        affectedEntityType: 'tontine_payment',
        affectedEntityId: p.id,
        suggestedFix: 'delete_orphan',
        autoFixable: true,
        metadata: { orphanMemberId: p.member_id }
      });
    }
  }

  // --- CHECK E: BUCKET CALCULATIONS ---
  for (const b of userBuckets) {
    // 1. Negative amounts
    if (b.allocated_amount < 0 || b.spent_amount < 0) {
      issues.push({
        id: `bucket-negative-${b.id}`,
        severity: 'error',
        category: 'calculation_integrity',
        description: {
          fr: `Le bucket "${b.name}" contient des montants incohérents ou négatifs (alloué: ${b.allocated_amount} MAD, dépensé: ${b.spent_amount} MAD).`,
          darija: `L-bucket "${b.name}" fih m3loumat dyal l-flouss ghrib wla naqis (alloué: ${b.allocated_amount} MAD, dépensé: ${b.spent_amount} MAD).`
        },
        affectedEntityType: 'bucket',
        affectedEntityId: b.id,
        suggestedFix: 'recalculate_spent',
        autoFixable: true,
        metadata: { allocated: b.allocated_amount, spent: b.spent_amount }
      });
      continue;
    }

    // 2. Mismatch with actual transactions (spent_amount recalculation)
    const realSpent = userTransactions
      .filter(t => t.bucket_id === b.id && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const roundedSpent = Math.round(realSpent * 100) / 100;

    if (Math.abs(b.spent_amount - roundedSpent) > 0.05) {
      issues.push({
        id: `bucket-spent-mismatch-${b.id}`,
        severity: 'warning',
        category: 'calculation_integrity',
        description: {
          fr: `Le montant dépensé affiché pour "${b.name}" (${b.spent_amount} MAD) ne correspond pas à la somme de ses dépenses réelles (${roundedSpent} MAD).`,
          darija: `L-mablagh l-makhraj dyal "${b.name}" (${b.spent_amount} MAD) machi hwa l-majmo3 l-haqiqi dyal makharij (${roundedSpent} MAD).`
        },
        affectedEntityType: 'bucket',
        affectedEntityId: b.id,
        suggestedFix: 'recalculate_spent',
        autoFixable: true,
        metadata: { displayedSpent: b.spent_amount, actualSpent: roundedSpent }
      });
    }
  }

  // --- CHECK F: OVER-ALLOCATION OF INCOME ---
  const activeIncomes = incomes.filter(inc => inc.user_id === userId && inc.is_active);
  const totalMonthlyIncome = activeIncomes.reduce((sum, inc) => {
    // Standardize to monthly amount
    if (inc.frequency === 'weekly') return sum + inc.amount * 4;
    if (inc.frequency === 'biweekly') return sum + inc.amount * 2;
    return sum + inc.amount;
  }, 0);

  const totalAllocatedBuckets = userBuckets
    .filter(b => !b.is_archived)
    .reduce((sum, b) => sum + b.allocated_amount, 0);

  // If allocations exceed income by a significant margin (e.g. more than 10%)
  if (totalMonthlyIncome > 0 && totalAllocatedBuckets > totalMonthlyIncome * 1.1) {
    const overflowAmount = Math.round(totalAllocatedBuckets - totalMonthlyIncome);
    issues.push({
      id: `budget-over-allocation-${userId}`,
      severity: 'warning',
      category: 'budget_integrity',
      description: {
        fr: `La somme de vos enveloppes de budget (${totalAllocatedBuckets} MAD) dépasse de ${overflowAmount} MAD votre revenu mensuel total (${totalMonthlyIncome} MAD).`,
        darija: `Majmo3 dyal l-enveloppes dyal l-budget (${totalAllocatedBuckets} MAD) fayt d-dakhl dyalk b ${overflowAmount} MAD (Revenu: ${totalMonthlyIncome} MAD).`
      },
      affectedEntityType: 'budget',
      affectedEntityId: userId,
      suggestedFix: 'manual_review',
      autoFixable: false,
      metadata: { totalIncome: totalMonthlyIncome, totalAllocated: totalAllocatedBuckets, overflow: overflowAmount }
    });
  }

  return issues;
}
