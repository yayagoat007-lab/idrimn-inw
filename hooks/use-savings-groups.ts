import { useState, useEffect, useCallback, useMemo } from 'react';
import { SavingsGroup, GroupContribution, WalletBalance } from '../types';
import { SEED_GROUPS } from '../lib/community-seed-data';
import { getWalletUserId, getWalletBalance, saveWalletBalance, addWalletMovement, getDailySpentTotal, canTransact } from '../lib/wallet-mock';
import { useAuth } from './use-auth';
import { getUserAlias } from './use-community-feed';
import { logBudgetTransaction } from '../lib/log-budget-transaction';

export function useSavingsGroups(userId: string = getWalletUserId()) {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<SavingsGroup[]>([]);
  const [contributions, setContributions] = useState<GroupContribution[]>([]);
  const [loading, setLoading] = useState(true);

  // Anonymized user alias for contribution log
  const userAlias = useMemo(() => getUserAlias(
    profile?.full_name || null,
    profile?.email || null,
    profile?.city || null
  ), [profile]);

  // Load groups and contributions
  useEffect(() => {
    const localGroups = localStorage.getItem('floussi_savings_groups');
    const localConts = localStorage.getItem('floussi_savings_group_contributions');

    let initialGroups = SEED_GROUPS;
    if (localGroups) {
      try {
        initialGroups = JSON.parse(localGroups);
      } catch (e) {
        console.error('Error parsing groups', e);
      }
    } else {
      localStorage.setItem('floussi_savings_groups', JSON.stringify(SEED_GROUPS));
    }

    let initialConts: GroupContribution[] = [];
    if (localConts) {
      try {
        initialConts = JSON.parse(localConts);
      } catch (e) {
        console.error('Error parsing group contributions', e);
      }
    } else {
      // Seed some dummy initial contributions to make groups look active
      initialConts = [
        { groupId: 'group-1', userId: 'user-demo-2', amount: 1500, date: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
        { groupId: 'group-1', userId: 'user-demo-3', amount: 1200, date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
        { groupId: 'group-1', userId: 'user-demo-4', amount: 500, date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
        { groupId: 'group-2', userId: 'user-demo-5', amount: 1000, date: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
        { groupId: 'group-2', userId: 'user-demo-6', amount: 800, date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }
      ];
      localStorage.setItem('floussi_savings_group_contributions', JSON.stringify(initialConts));
    }

    setGroups(initialGroups);
    setContributions(initialConts);
    setLoading(false);
  }, [userId]);

  // Save state helpers
  const saveGroups = useCallback((updated: SavingsGroup[]) => {
    setGroups(updated);
    localStorage.setItem('floussi_savings_groups', JSON.stringify(updated));
  }, []);

  const saveContributions = useCallback((updated: GroupContribution[]) => {
    setContributions(updated);
    localStorage.setItem('floussi_savings_group_contributions', JSON.stringify(updated));
  }, []);

  // 1. Create a savings group
  const createGroup = useCallback((name: string, targetAmount: number, deadline: string, invitedMembers: string[] = []) => {
    const newGroup: SavingsGroup = {
      id: `group-${Math.random().toString(36).substring(2, 11)}`,
      name,
      targetAmount,
      currentAmount: 0,
      deadline,
      memberIds: [userId, ...invitedMembers],
      createdBy: userId
    };

    const updated = [...groups, newGroup];
    saveGroups(updated);
    return newGroup;
  }, [groups, userId, saveGroups]);

  // 2. Contribute to a savings group (debiting wallet balance & recording progress)
  const contribute = useCallback(async (groupId: string, amount: number) => {
    if (amount <= 0) throw new Error('Veuillez saisir un montant supérieur à 0 DH');

    // Fetch live wallet balance
    const walletBalanceObj = getWalletBalance(userId);
    if (!walletBalanceObj) throw new Error('Impossible de charger le solde du portefeuille.');

    // Check if enough funds
    if (walletBalanceObj.balance < amount) {
      throw new Error('Solde de portefeuille insuffisant. Veuillez alimenter votre wallet.');
    }

    // Daily limit validation
    const spentToday = getDailySpentTotal(userId);
    const validation = canTransact(amount, spentToday, walletBalanceObj.kycVerified);
    if (!validation.allowed) {
      throw new Error(validation.reason || 'Transaction refusée.');
    }

    // Find the target group
    const targetGroup = groups.find(g => g.id === groupId);
    if (!targetGroup) throw new Error('Groupe introuvable.');

    // Debit user's wallet
    const updatedWalletBalance: WalletBalance = {
      ...walletBalanceObj,
      balance: walletBalanceObj.balance - amount,
      updatedAt: new Date().toISOString()
    };
    saveWalletBalance(userId, updatedWalletBalance);

    // Record wallet movement
    addWalletMovement(userId, {
      type: 'transfer_out',
      amount,
      description: `Cotisation Groupe : ${targetGroup.name}`,
      status: 'completed'
    });

    // Log to budget transactions
    await logBudgetTransaction(userId, {
      amount,
      description: `Contribution groupe d'épargne : ${targetGroup.name}`,
      category: 'epargne',
      tags: ['wallet', 'groupe-epargne', 'contribution'],
      merchant: targetGroup.name
    });

    // Create the contribution record
    const newCont: GroupContribution & { authorAlias?: string } = {
      groupId,
      userId,
      amount,
      date: new Date().toISOString(),
      authorAlias: userAlias // used for admin auditing
    };

    const nextConts = [newCont, ...contributions];
    saveContributions(nextConts);

    // Update group's current amount in local state
    const nextGroups = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          currentAmount: g.currentAmount + amount
        };
      }
      return g;
    });
    saveGroups(nextGroups);

    // Trigger wallet state updates on the page
    window.dispatchEvent(new Event('floussi_wallet_updated'));

    return true;
  }, [groups, contributions, userId, userAlias, saveGroups, saveContributions]);

  // Helper: check if active user is creator of a group
  const isCreator = useCallback((group: SavingsGroup) => {
    return group.createdBy === userId;
  }, [userId]);

  // Helper: get contributions details (with privacy filtering)
  const getGroupContributions = useCallback((groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    const filtered = contributions.filter(c => c.groupId === groupId);

    const isAdmin = group ? isCreator(group) : false;

    return filtered.map(c => {
      // If user is admin/creator of the group, they can see specific details.
      // If not, we mask the contributor and return 'Contributeur Anonyme'
      const isCurrentUser = c.userId === userId;
      return {
        ...c,
        authorName: isCurrentUser 
          ? `Vous` 
          : (isAdmin 
              ? ((c as any).authorAlias || `Membre_${c.userId.substring(0, 5)}`) 
              : `Contributeur Solidaire`)
      };
    });
  }, [groups, contributions, userId, isCreator]);

  return {
    groups,
    contributions,
    loading,
    userAlias,
    createGroup,
    contribute,
    isCreator,
    getGroupContributions
  };
}
export default useSavingsGroups;
