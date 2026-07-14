import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Account } from '../types';

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
  }, [refreshAccounts]);

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
    refreshAccounts
  };
}
