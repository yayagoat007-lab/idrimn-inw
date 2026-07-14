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
import { logBudgetTransaction } from '../lib/log-budget-transaction';

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
    let category = 'factures';
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
