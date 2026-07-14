import { useState, useEffect, useCallback } from 'react';
import { BillPayment, BillProvider, WalletBalance } from '../types';
import {
  getWalletUserId,
  getWalletBalance,
  saveWalletBalance,
  getBillPayments,
  saveBillPayments,
  getDailySpentTotal,
  canTransact,
  addWalletMovement
} from '../lib/wallet-mock';
import { OfflineDB } from '../lib/offline-db';

async function logBudgetTransaction(userId: string, tx: {
  amount: number;
  description: string;
  category: string;
  tags: string[];
  merchant: string;
}) {
  try {
    const list = await OfflineDB.get<any[]>('transactions') || [];
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
      updated_at: new Date().toISOString()
    };
    const updatedList = [newTx, ...list];
    await OfflineDB.set('transactions', updatedList);
    localStorage.setItem('floussi_table_transactions', JSON.stringify(updatedList));

    // recalculate buckets
    const buckets = await OfflineDB.get<any[]>('buckets') || [];
    const recomputedBuckets = buckets.map(b => {
      const totalSpent = updatedList
        .filter(t => t.bucket_id === b.id && t.type === 'expense')
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

export function useBillPayment(userId: string = getWalletUserId()) {
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(() => {
    setLoading(true);
    const list = getBillPayments(userId);
    setPayments(list);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadPayments();
    const handleWalletUpdate = () => {
      loadPayments();
    };
    window.addEventListener('floussi_wallet_updated', handleWalletUpdate);
    return () => {
      window.removeEventListener('floussi_wallet_updated', handleWalletUpdate);
    };
  }, [loadPayments]);

  const payBill = async (
    provider: BillProvider,
    accountReference: string,
    amount: number
  ): Promise<BillPayment> => {
    if (!accountReference) throw new Error('Veuillez renseigner votre référence de contrat/compte.');
    if (amount <= 0) throw new Error('Le montant de la facture doit être supérieur à 0 DH.');

    const walletBal = getWalletBalance(userId);
    if (walletBal.balance < amount) {
      throw new Error(`Solde insuffisant. Votre solde est de ${walletBal.balance} DH.`);
    }

    const dailyTotal = getDailySpentTotal(userId);
    const authCheck = canTransact(amount, dailyTotal, walletBal.kycVerified);
    if (!authCheck.allowed) {
      throw new Error(authCheck.reason || 'Transaction non autorisée.');
    }

    // Deduct balance
    const updatedBal: WalletBalance = {
      ...walletBal,
      balance: walletBal.balance - amount,
      updatedAt: new Date().toISOString()
    };
    saveWalletBalance(userId, updatedBal);

    // Save payment record
    const list = getBillPayments(userId);
    const newPayment: BillPayment = {
      id: `bill-${Math.floor(Math.random() * 1000000)}`,
      userId,
      provider,
      accountReference,
      amount,
      status: 'completed',
      paidAt: new Date().toISOString()
    };

    list.unshift(newPayment);
    saveBillPayments(userId, list);

    // Add Wallet Movement
    addWalletMovement(userId, {
      type: 'bill_payment',
      amount,
      description: `Facture payée : ${provider} (Réf: ${accountReference})`,
      status: 'completed'
    });

    // Determine category based on provider
    let category = 'utilities';
    if (['IAM', 'INWI', 'Orange'].includes(provider)) {
      category = 'telecom'; // or entertainment/internet depending on app setup
    }

    // Automatically log transaction in budget
    await logBudgetTransaction(userId, {
      amount,
      description: `Paiement facture ${provider}`,
      category,
      tags: ['wallet', 'facture', provider.toLowerCase()],
      merchant: provider
    });

    // Notify other hooks
    window.dispatchEvent(new Event('floussi_wallet_updated'));

    return newPayment;
  };

  return {
    payments,
    loading,
    payBill,
    refreshPayments: loadPayments
  };
}
