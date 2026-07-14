import { useState, useEffect, useCallback } from 'react';
import { P2PTransfer, WalletBalance } from '../types';
import {
  getWalletUserId,
  getWalletBalance,
  saveWalletBalance,
  getP2PTransfers,
  saveP2PTransfers,
  getDailySpentTotal,
  canTransact,
  addWalletMovement
} from '../lib/wallet-mock';
import { OfflineDB } from '../lib/offline-db';

// Helper to log budget transaction
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

export function useP2PTransfer(userId: string = getWalletUserId()) {
  const [transfers, setTransfers] = useState<P2PTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransfers = useCallback(() => {
    setLoading(true);
    const list = getP2PTransfers(userId);
    setTransfers(list);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadTransfers();
    const handleWalletUpdate = () => {
      loadTransfers();
    };
    window.addEventListener('floussi_wallet_updated', handleWalletUpdate);
    return () => {
      window.removeEventListener('floussi_wallet_updated', handleWalletUpdate);
    };
  }, [loadTransfers]);

  const sendTransfer = async (toPhone: string, amount: number, note: string = ''): Promise<P2PTransfer> => {
    if (!toPhone) throw new Error('Veuillez saisir un numéro de téléphone.');
    if (amount <= 0) throw new Error('Le montant doit être supérieur à 0 DH.');

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

    // Create transfer record
    const list = getP2PTransfers(userId);
    const newTransfer: P2PTransfer = {
      id: `p2p-${Math.floor(Math.random() * 1000000)}`,
      fromUserId: userId,
      toPhone,
      amount,
      note,
      status: 'completed', // Simulated immediate success
      createdAt: new Date().toISOString()
    };

    list.unshift(newTransfer);
    saveP2PTransfers(userId, list);

    // Add Wallet Movement
    addWalletMovement(userId, {
      type: 'transfer_out',
      amount,
      description: `Transfert envoyé à ${toPhone} ${note ? `(${note})` : ''}`,
      status: 'completed'
    });

    // Automatically log a transaction in the budget
    await logBudgetTransaction(userId, {
      amount,
      description: `P2P : Transfert à ${toPhone}`,
      category: 'other',
      tags: ['wallet', 'p2p', 'transfert'],
      merchant: `Transfert ${toPhone}`
    });

    // Notify other hooks to refresh
    window.dispatchEvent(new Event('floussi_wallet_updated'));

    return newTransfer;
  };

  // SVG QR Code generator side helper
  const generateQRCodeSvg = (data: string) => {
    // Return a simple mock QR SVG that has a visual placeholder with QR blocks
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" shape-rendering="crispEdges">
        <rect width="100" height="100" fill="#f8fafc" />
        <!-- Corner anchors -->
        <rect x="10" y="10" width="20" height="20" fill="#0f172a" />
        <rect x="13" y="13" width="14" height="14" fill="#ffffff" />
        <rect x="16" y="16" width="8" height="8" fill="#10b981" />

        <rect x="70" y="10" width="20" height="20" fill="#0f172a" />
        <rect x="73" y="13" width="14" height="14" fill="#ffffff" />
        <rect x="76" y="16" width="8" height="8" fill="#10b981" />

        <rect x="10" y="70" width="20" height="20" fill="#0f172a" />
        <rect x="13" y="73" width="14" height="14" fill="#ffffff" />
        <rect x="16" y="76" width="8" height="8" fill="#10b981" />

        <!-- Random dots for simulation representation -->
        <rect x="40" y="15" width="5" height="5" fill="#0f172a" />
        <rect x="50" y="20" width="10" height="5" fill="#10b981" />
        <rect x="45" y="30" width="5" height="10" fill="#0f172a" />
        <rect x="35" y="45" width="15" height="5" fill="#0f172a" />
        <rect x="55" y="40" width="5" height="5" fill="#0f172a" />
        <rect x="70" y="45" width="10" height="10" fill="#10b981" />

        <rect x="40" y="60" width="5" height="15" fill="#0f172a" />
        <rect x="50" y="70" width="15" height="5" fill="#0f172a" />
        <rect x="70" y="75" width="15" height="10" fill="#0f172a" />
        <rect x="80" y="65" width="5" height="5" fill="#10b981" />
        
        <!-- Core logo overlay -->
        <rect x="42" y="42" width="16" height="16" rx="4" fill="#10b981" />
        <text x="50" y="52" font-family="sans-serif" font-size="8" font-weight="900" fill="#ffffff" text-anchor="middle">F</text>
      </svg>
    `;
  };

  return {
    transfers,
    loading,
    sendTransfer,
    generateQRCodeSvg,
    refreshTransfers: loadTransfers
  };
}
