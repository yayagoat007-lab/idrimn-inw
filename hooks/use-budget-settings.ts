import { useState, useEffect, useCallback } from 'react';
import { MonthlyIncome, FrequencyType } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';

const DEFAULT_INCOMES: MonthlyIncome[] = [
  {
    id: "income-1",
    user_id: "mock-user-id-9999",
    source: "Salaire Mensuel",
    amount: 10000,
    frequency: "monthly",
    pay_day: 28,
    auto_allocate_rules: {
      "bucket-food": 30,      // 3000 DH
      "bucket-housing": 50,   // 5000 DH
      "bucket-tontine": 10,   // 1000 DH
    },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export interface AlertSettings {
  globalThreshold: number; // e.g. 80
  bucketThresholds: Record<string, number>; // bucketId -> threshold percentage
  enablePush: boolean;
  enableEmail: boolean;
  enableSms: boolean;
}

const DEFAULT_ALERTS: AlertSettings = {
  globalThreshold: 80,
  bucketThresholds: {},
  enablePush: true,
  enableEmail: false,
  enableSms: false
};

export function useBudgetSettings(userId: string = "mock-user-id-9999") {
  const [incomes, setIncomes] = useState<MonthlyIncome[]>([]);
  const [alerts, setAlerts] = useState<AlertSettings>(DEFAULT_ALERTS);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSettingsData = useCallback(async () => {
    setLoading(true);
    // Load recurring incomes
    let localIncomes = await OfflineDB.get<MonthlyIncome[]>('monthly_incomes');
    if (!localIncomes || localIncomes.length === 0) {
      localIncomes = DEFAULT_INCOMES.map(inc => ({ ...inc, user_id: userId }));
      await OfflineDB.set('monthly_incomes', localIncomes);
    }
    setIncomes(localIncomes || []);

    // Load Alert Settings
    let localAlerts = await OfflineDB.get<AlertSettings>('alert_settings');
    if (!localAlerts) {
      localAlerts = DEFAULT_ALERTS;
      await OfflineDB.set('alert_settings', localAlerts);
    }
    setAlerts(localAlerts);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  const saveIncomes = async (newIncomes: MonthlyIncome[]) => {
    setIncomes(newIncomes);
    await OfflineDB.set('monthly_incomes', newIncomes);
    localStorage.setItem('floussi_table_monthly_incomes', JSON.stringify(newIncomes));
  };

  const createIncome = async (data: Omit<MonthlyIncome, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newInc: MonthlyIncome = {
      ...data,
      id: generateId(),
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const list = [...incomes, newInc];
    await saveIncomes(list);

    try {
      await supabase.from('monthly_incomes').insert(newInc);
    } catch (_) {
      await OfflineDB.addToSyncQueue({
        table: 'monthly_incomes',
        action: 'insert',
        data: newInc
      });
    }
  };

  const updateIncome = async (id: string, updates: Partial<MonthlyIncome>) => {
    const list = incomes.map(inc => {
      if (inc.id === id) {
        return { ...inc, ...updates, updated_at: new Date().toISOString() };
      }
      return inc;
    });
    await saveIncomes(list);

    const target = list.find(inc => inc.id === id);
    if (target) {
      try {
        await supabase.from('monthly_incomes').update(target).eq('id', id);
      } catch (_) {
        await OfflineDB.addToSyncQueue({
          table: 'monthly_incomes',
          action: 'update',
          data: target
        });
      }
    }
  };

  const deleteIncome = async (id: string) => {
    const remaining = incomes.filter(inc => inc.id !== id);
    await saveIncomes(remaining);

    try {
      await supabase.from('monthly_incomes').delete().eq('id', id);
    } catch (_) {
      await OfflineDB.addToSyncQueue({
        table: 'monthly_incomes',
        action: 'delete',
        data: { id }
      });
    }
  };

  const updateAllocationRules = async (incomeId: string, rules: Record<string, number>) => {
    await updateIncome(incomeId, { auto_allocate_rules: rules });
  };

  const applyTemplateRules = async (incomeId: string, template: '503020' | '602020' | 'custom', bucketsList: any[]) => {
    const rules: Record<string, number> = {};
    if (bucketsList.length === 0) return;

    if (template === '503020') {
      // 50% Essentials, 30% Non-Essentials, 20% Savings
      const essentials = bucketsList.filter(b => b.is_essential);
      const optionals = bucketsList.filter(b => !b.is_essential && b.category !== 'savings');
      const savings = bucketsList.filter(b => b.category === 'savings' || b.category === 'tontine');

      // Distribute 50% among essentials evenly
      if (essentials.length > 0) {
        const each = Math.floor(50 / essentials.length);
        essentials.forEach(b => { rules[b.id] = each; });
      }
      // Distribute 30% among optionals
      if (optionals.length > 0) {
        const each = Math.floor(30 / optionals.length);
        optionals.forEach(b => { rules[b.id] = each; });
      }
      // Distribute 20% among savings
      if (savings.length > 0) {
        const each = Math.floor(20 / savings.length);
        savings.forEach(b => { rules[b.id] = each; });
      }
    } else if (template === '602020') {
      // 60% Essentials, 20% Non-Essentials, 20% Savings
      const essentials = bucketsList.filter(b => b.is_essential);
      const optionals = bucketsList.filter(b => !b.is_essential && b.category !== 'savings');
      const savings = bucketsList.filter(b => b.category === 'savings' || b.category === 'tontine');

      if (essentials.length > 0) {
        const each = Math.floor(60 / essentials.length);
        essentials.forEach(b => { rules[b.id] = each; });
      }
      if (optionals.length > 0) {
        const each = Math.floor(20 / optionals.length);
        optionals.forEach(b => { rules[b.id] = each; });
      }
      if (savings.length > 0) {
        const each = Math.floor(20 / savings.length);
        savings.forEach(b => { rules[b.id] = each; });
      }
    }

    // Standardize total to exact 100% (or closest value) if some decimal offsets exist
    const sum = Object.values(rules).reduce((a, b) => a + b, 0);
    if (sum > 0 && sum !== 100 && bucketsList.length > 0) {
      // Add or remove difference from the first rule
      const diff = 100 - sum;
      const firstKey = Object.keys(rules)[0];
      if (firstKey) rules[firstKey] += diff;
    }

    await updateIncome(incomeId, { auto_allocate_rules: rules });
  };

  const saveAlerts = async (newAlerts: AlertSettings) => {
    setAlerts(newAlerts);
    await OfflineDB.set('alert_settings', newAlerts);
  };

  const updateAlertSettings = async (updates: Partial<AlertSettings>) => {
    const nextAlerts = { ...alerts, ...updates };
    await saveAlerts(nextAlerts);
  };

  const updateBucketAlertThreshold = async (bucketId: string, threshold: number) => {
    const nextBucketThresholds = { ...alerts.bucketThresholds, [bucketId]: threshold };
    await saveAlerts({ ...alerts, bucketThresholds: nextBucketThresholds });
  };

  const totalMonthlyIncome = incomes
    .filter(inc => inc.is_active)
    .reduce((sum, inc) => sum + inc.amount, 0);

  return {
    incomes,
    alerts,
    loading,
    totalMonthlyIncome,
    createIncome,
    updateIncome,
    deleteIncome,
    updateAllocationRules,
    applyTemplateRules,
    updateAlertSettings,
    updateBucketAlertThreshold
  };
}
