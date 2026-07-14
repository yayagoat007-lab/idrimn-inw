import { useState, useEffect, useCallback } from 'react';
import { MobileRecharge, MobileOperator, WalletBalance } from '../types';
import {
  getWalletUserId,
  getWalletBalance,
  saveWalletBalance,
  getMobileRecharges,
  saveMobileRecharges,
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

export function useMobileRecharge(userId: string = getWalletUserId()) {
  const [recharges, setRecharges] = useState<MobileRecharge[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecharges = useCallback(() => {
    setLoading(true);
    const list = getMobileRecharges(userId);
    setRecharges(list);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadRecharges();
    const handleWalletUpdate = () => {
      loadRecharges();
    };
    window.addEventListener('floussi_wallet_updated', handleWalletUpdate);
    return () => {
      window.removeEventListener('floussi_wallet_updated', handleWalletUpdate);
    };
  }, [loadRecharges]);

  const rechargeMobile = async (
    operator: MobileOperator,
    phoneNumber: string,
    amount: number
  ): Promise<MobileRecharge> => {
    if (!phoneNumber || phoneNumber.length < 9) {
      throw new Error('Veuillez renseigner un numéro de téléphone marocain valide.');
    }
    if (![10, 20, 50, 100, 200].includes(amount)) {
      throw new Error('Le montant de la recharge doit être de 10, 20, 50, 100, ou 200 DH.');
    }

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

    // Save recharge record
    const list = getMobileRecharges(userId);
    const newRecharge: MobileRecharge = {
      id: `recharge-${Math.floor(Math.random() * 1000000)}`,
      userId,
      operator,
      phoneNumber,
      amount,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    list.unshift(newRecharge);
    saveMobileRecharges(userId, list);

    // Add Wallet Movement
    addWalletMovement(userId, {
      type: 'recharge',
      amount,
      description: `Recharge mobile : ${operator} (${phoneNumber})`,
      status: 'completed'
    });

    // Automatically log transaction in budget
    await logBudgetTransaction(userId, {
      amount,
      description: `Recharge télécom ${operator}`,
      category: 'telecom',
      tags: ['wallet', 'recharge', operator.toLowerCase()],
      merchant: `Recharge ${operator}`
    });

    // Notify other hooks
    window.dispatchEvent(new Event('floussi_wallet_updated'));

    return newRecharge;
  };

  return {
    recharges,
    loading,
    rechargeMobile,
    refreshRecharges: loadRecharges
  };
}
