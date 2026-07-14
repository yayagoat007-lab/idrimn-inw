import { useState, useEffect, useCallback } from 'react';
import { WalletBalance, WalletMovement } from '../types';
import {
  getWalletUserId,
  getWalletBalance,
  saveWalletBalance,
  getWalletMovements,
  addWalletMovement,
  getDailySpentTotal
} from '../lib/wallet-mock';

export function useWallet(userId: string = getWalletUserId()) {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [movements, setMovements] = useState<WalletMovement[]>([]);
  const [dailySpent, setDailySpent] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadWalletData = useCallback(() => {
    setLoading(true);
    const balObj = getWalletBalance(userId);
    const movs = getWalletMovements(userId);
    const spentToday = getDailySpentTotal(userId);

    setBalance(balObj);
    setMovements(movs);
    setDailySpent(spentToday);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadWalletData();
    // Simple custom event listener to sync across hooks
    const handleWalletUpdate = () => {
      loadWalletData();
    };
    window.addEventListener('floussi_wallet_updated', handleWalletUpdate);
    return () => {
      window.removeEventListener('floussi_wallet_updated', handleWalletUpdate);
    };
  }, [loadWalletData]);

  const notifyWalletUpdate = () => {
    window.dispatchEvent(new Event('floussi_wallet_updated'));
  };

  const addFunds = async (amount: number, method: string = 'Carte Bancaire') => {
    if (amount <= 0) throw new Error('Le montant doit être supérieur à 0 DH');
    
    const currentBal = getWalletBalance(userId);
    const updatedBal: WalletBalance = {
      ...currentBal,
      balance: currentBal.balance + amount,
      updatedAt: new Date().toISOString()
    };

    saveWalletBalance(userId, updatedBal);
    
    addWalletMovement(userId, {
      type: 'add_funds',
      amount,
      description: `Alimentation par ${method}`,
      status: 'completed'
    });

    notifyWalletUpdate();
  };

  const toggleKyc = async () => {
    const currentBal = getWalletBalance(userId);
    const updatedBal: WalletBalance = {
      ...currentBal,
      kycVerified: !currentBal.kycVerified,
      dailyLimit: !currentBal.kycVerified ? 5000 : 500,
      updatedAt: new Date().toISOString()
    };

    saveWalletBalance(userId, updatedBal);
    notifyWalletUpdate();
    return updatedBal.kycVerified;
  };

  const getTransactionHistory = () => {
    return movements;
  };

  return {
    balance,
    movements,
    dailySpent,
    loading,
    addFunds,
    toggleKyc,
    getTransactionHistory,
    refreshWallet: loadWalletData
  };
}
