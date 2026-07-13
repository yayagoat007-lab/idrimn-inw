import { useState, useEffect } from 'react';
import { NetWorthItem } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';

export interface NetWorthItemExtended extends NetWorthItem {
  acquisition_date?: string;
  monthly_payment?: number;
  notes?: string;
  documents?: string[];
  estimated_end_date?: string;
  repayment_amount?: number; // for simulator
  repayment_frequency?: 'monthly' | 'one_time';
}

const DEFAULT_ITEMS: NetWorthItemExtended[] = [
  {
    id: "networth-1",
    user_id: "mock-user-id-9999",
    name: "Appartement Sidi Maarouf",
    type: "asset",
    category: "Immobilier",
    current_value: 850000,
    original_value: 750000,
    interest_rate: null,
    institution: "Al Barid Bank",
    acquisition_date: "2022-01-15",
    notes: "Résidence principale, titre de propriété disponible.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "networth-2",
    user_id: "mock-user-id-9999",
    name: "Dacia Sandero Stepway",
    type: "asset",
    category: "Véhicule",
    current_value: 110000,
    original_value: 155000,
    interest_rate: null,
    institution: "Wafa LLD",
    acquisition_date: "2023-06-20",
    notes: "Voiture familiale, révisions régulières.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "networth-3",
    user_id: "mock-user-id-9999",
    name: "Bijoux en Or 18k de l'Adoul",
    type: "asset",
    category: "Or / Bijoux",
    current_value: 35000,
    original_value: 28000,
    interest_rate: null,
    institution: null,
    acquisition_date: "2021-12-05",
    notes: "Valeur refuge or physique.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "networth-4",
    user_id: "mock-user-id-9999",
    name: "Crédit Immobilier Banque Populaire",
    type: "liability",
    category: "Crédit immobilier",
    current_value: 480000,
    original_value: 600000,
    interest_rate: 4.25,
    institution: "Banque Populaire",
    acquisition_date: "2022-01-15",
    monthly_payment: 4500,
    notes: "Crédit immobilier logement principal, durée 15 ans.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function useNetWorth(userId: string = "mock-user-id-9999") {
  const [items, setItems] = useState<NetWorthItemExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      let localItems = await OfflineDB.get<NetWorthItemExtended[]>('net_worth_items');
      
      if (!localItems || localItems.length === 0) {
        localItems = DEFAULT_ITEMS.map(i => ({ ...i, user_id: userId }));
        await OfflineDB.set('net_worth_items', localItems);
        localStorage.setItem('floussi_table_net_worth_items', JSON.stringify(localItems));
      }
      
      setItems(localItems);
      setLoading(false);
    }
    loadItems();
  }, [userId]);

  const saveItems = async (updatedItems: NetWorthItemExtended[]) => {
    setItems(updatedItems);
    await OfflineDB.set('net_worth_items', updatedItems);
    localStorage.setItem('floussi_table_net_worth_items', JSON.stringify(updatedItems));
  };

  const addItem = async (item: Omit<NetWorthItemExtended, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newItem: NetWorthItemExtended = {
      ...item,
      id: `nw-${generateId()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [...items, newItem];
    await saveItems(updated);
    
    try {
      await supabase.from('net_worth_items').insert([newItem]);
    } catch (_) {}
    return newItem;
  };

  const updateItem = async (id: string, updates: Partial<NetWorthItemExtended>) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updates,
          updated_at: new Date().toISOString()
        };
      }
      return item;
    });
    await saveItems(updated);

    try {
      await supabase.from('net_worth_items').update(updates).eq('id', id);
    } catch (_) {}
  };

  const deleteItem = async (id: string) => {
    const updated = items.filter(item => item.id !== id);
    await saveItems(updated);

    try {
      await supabase.from('net_worth_items').delete().eq('id', id);
    } catch (_) {}
  };

  // Math helper calculations
  const totalAssets = items.filter(i => i.type === 'asset').reduce((sum, i) => sum + i.current_value, 0);
  const totalLiabilities = items.filter(i => i.type === 'liability').reduce((sum, i) => sum + i.current_value, 0);
  const netWorth = totalAssets - totalLiabilities;
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  // Simple static 12 month history for charts
  const getHistoricalData = (monthsCount: number = 12) => {
    const data = [];
    const now = new Date();
    
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('fr', { month: 'short', year: '2-digit' });
      
      // Add slight progressive growth or decrease to simulate history
      const monthIndex = monthsCount - 1 - i;
      const simulatedAssetVal = totalAssets * (0.95 + (monthIndex * 0.005));
      const simulatedDebtVal = totalLiabilities * (1.02 - (monthIndex * 0.007));
      
      data.push({
        month: monthLabel,
        assets: Math.round(simulatedAssetVal),
        debts: Math.round(simulatedDebtVal),
        netWorth: Math.round(simulatedAssetVal - simulatedDebtVal),
        keyEvent: i === 6 ? "Achat Voiture" : undefined
      });
    }
    return data;
  };

  // 12-month future projections
  const getProjections = () => {
    const data = [];
    const now = new Date();
    
    // Projections starting from current month
    for (let i = 0; i <= 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = d.toLocaleString('fr', { month: 'short', year: '2-digit' }) + ' (Proj)';
      
      // Simulating a trend line where assets grow by 0.5% and debt decreases by monthly_payment or 0.8%
      const simulatedAssetVal = totalAssets * Math.pow(1.006, i);
      const simulatedDebtVal = Math.max(0, totalLiabilities * Math.pow(0.991, i));
      
      data.push({
        month: monthLabel,
        assets: Math.round(simulatedAssetVal),
        debts: Math.round(simulatedDebtVal),
        netWorth: Math.round(simulatedAssetVal - simulatedDebtVal)
      });
    }
    return data;
  };

  return {
    items,
    loading,
    totalAssets,
    totalLiabilities,
    netWorth,
    debtToAssetRatio,
    addItem,
    updateItem,
    deleteItem,
    getHistoricalData,
    getProjections
  };
}
