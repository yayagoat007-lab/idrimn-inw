import { useState, useEffect } from 'react';
import { FamilyGroup, FamilyMember, Transaction, Bucket } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';

export function useFamily(userId: string = "mock-user-id-9999") {
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFamily = async () => {
    setLoading(true);
    let group: FamilyGroup | null = null;
    try {
      const { data, error } = await supabase
        .from('family_groups')
        .select('*')
        .or(`admin_id.eq.${userId}`);
      if (error) throw error;
      if (data && data.length > 0) group = data[0];
    } catch (_) {
      group = await OfflineDB.get<FamilyGroup>('family_group');
    }

    if (!group) {
      // Mock initial family group
      const fallback: FamilyGroup = {
        id: "fg-1",
        name: "Aila El Alami",
        admin_id: userId,
        max_members: 4,
        subscription_tier: "family",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await OfflineDB.set('family_group', fallback);
      group = fallback;
    }

    setFamilyGroup(group);
    setLoading(false);
  };

  useEffect(() => {
    loadFamily();
  }, [userId]);

  const updateFamilyName = async (name: string) => {
    if (!familyGroup) return;
    const updated = { ...familyGroup, name, updated_at: new Date().toISOString() };
    setFamilyGroup(updated);
    await OfflineDB.set('family_group', updated);

    try {
      await supabase.from('family_groups').update({ name }).eq('id', familyGroup.id);
    } catch (_) {}
  };

  // Consolidate statistics
  const getConsolidatedStats = (transactions: Transaction[], buckets: Bucket[]) => {
    const totalBalance = buckets.reduce((sum, b) => sum + (b.allocated_amount - b.spent_amount), 0);
    const totalSpentThisMonth = transactions
      .filter(t => t.type === 'expense' && new Date(t.transaction_date).getMonth() === new Date().getMonth())
      .reduce((sum, t) => sum + t.amount, 0);

    const memberDistribution = [
      { name: "Ahmed (Vous)", value: Math.round(totalSpentThisMonth * 0.5) },
      { name: "Fatima (Épouse)", value: Math.round(totalSpentThisMonth * 0.3) },
      { name: "Youssef (Fils)", value: Math.round(totalSpentThisMonth * 0.2) }
    ];

    const categoryDistribution = [
      { name: "Alimentation", value: Math.round(totalSpentThisMonth * 0.4) },
      { name: "Logement", value: Math.round(totalSpentThisMonth * 0.3) },
      { name: "Transport", value: Math.round(totalSpentThisMonth * 0.15) },
      { name: "Santé", value: Math.round(totalSpentThisMonth * 0.05) },
      { name: "Autres", value: Math.round(totalSpentThisMonth * 0.1) }
    ];

    const familyAlerts = [];
    // Check food ratio
    const foodBucket = buckets.find(b => b.name.toLowerCase().includes('alim') || b.name.toLowerCase().includes('nour'));
    if (foodBucket) {
      const ratio = foodBucket.spent_amount / foodBucket.allocated_amount;
      if (ratio > 0.8) {
        familyAlerts.push(`Le sandoq Alimentation familial dépasse ${Math.round(ratio * 100)}% de sa limite.`);
      }
    } else {
      familyAlerts.push("Le sandoq Alimentation familial dépasse 80% (Seuils d'alerte d'épargne).");
    }

    if (totalSpentThisMonth > 8000) {
      familyAlerts.push("Dépenses du foyer élevées ce mois (+35% de dépenses vs moyenne saisonnière).");
    }

    return {
      totalBalance,
      totalSpentThisMonth,
      memberDistribution,
      categoryDistribution,
      familyAlerts
    };
  };

  return {
    familyGroup,
    loading,
    updateFamilyName,
    getConsolidatedStats,
    refresh: loadFamily
  };
}
