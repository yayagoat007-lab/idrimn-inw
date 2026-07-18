import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Account } from '../types';

export const DEFAULT_ACCOUNTS = [
  {
    id: 'acc-cash',
    name: 'Cash (Porte-monnaie)',
    type: 'cash' as const,
    balance: 3250,
    currency: 'MAD',
    is_active: true,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: 'Wallet'
  },
  {
    id: 'acc-checking',
    name: 'Compte Courant (CIH / Attijari)',
    type: 'checking' as const,
    balance: 12500,
    currency: 'MAD',
    is_active: true,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: 'CreditCard'
  },
  {
    id: 'acc-savings',
    name: 'Compte Épargne (Tawfir)',
    type: 'savings' as const,
    balance: 34000,
    currency: 'MAD',
    is_active: true,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: 'Landmark'
  }
];

/**
 * Fetch accounts for a given user from Supabase mock database.
 */
export async function getAccounts(userId: string): Promise<Account[]> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[getAccounts] Error fetching accounts:", err);
    return [];
  }
}

/**
 * Hook to manage user accounts state and total balance.
 */
export function useAccounts(userId: string = "mock-user-id-9999") {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshAccounts = useCallback(async () => {
    setLoading(true);
    const data = await getAccounts(userId);
    setAccounts(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refreshAccounts();

    const handleUpdate = () => {
      getAccounts(userId).then(data => {
        setAccounts(data);
      });
    };

    window.addEventListener('floussi_accounts_updated', handleUpdate);
    return () => {
      window.removeEventListener('floussi_accounts_updated', handleUpdate);
    };
  }, [refreshAccounts, userId]);

  const saveAccounts = async (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('floussi_table_accounts', JSON.stringify(newAccounts));
    window.dispatchEvent(new Event('floussi_accounts_updated'));
  };

  const createAccount = async (accountData: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newAccount: Account = {
      ...accountData,
      id: "acc-" + Math.floor(Math.random() * 1000000),
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const list = [...accounts, newAccount];
    await saveAccounts(list);
    await supabase.from('accounts').insert(newAccount);
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const list = accounts.map(acc => {
      if (acc.id === id) {
        return { ...acc, ...updates, updated_at: new Date().toISOString() };
      }
      return acc;
    });
    await saveAccounts(list);
    await supabase.from('accounts').update(updates).eq('id', id);
  };

  const deleteAccount = async (id: string) => {
    const remaining = accounts.filter(acc => acc.id !== id);
    await saveAccounts(remaining);
    await supabase.from('accounts').delete().eq('id', id);
  };

  const seedDefaultAccounts = async () => {
    const defaults = DEFAULT_ACCOUNTS.map(acc => ({
      ...acc,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    await saveAccounts(defaults);
    await supabase.from('accounts').insert(defaults);
  };

  // Compute totalBalance as the sum of balance of all active (is_active === true) accounts.
  // Conserves 4320 DH as fallback only when no accounts exist.
  const activeAccounts = accounts.filter(acc => acc.is_active === true);
  const totalBalance = accounts.length > 0
    ? activeAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
    : 4320;

  return {
    accounts,
    totalBalance,
    loading,
    refreshAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    seedDefaultAccounts
  };
}
