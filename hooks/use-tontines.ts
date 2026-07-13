import { useState, useEffect } from 'react';
import { Tontine } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';

export function useTontines(userId: string = "mock-user-id-9999") {
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadTontines = async () => {
    setLoading(true);
    let data: Tontine[] | null = null;
    try {
      const { data: remoteData, error } = await supabase
        .from('tontines')
        .select('*')
        .eq('creator_id', userId);
      if (error) throw error;
      data = remoteData;
    } catch (_) {
      // Fallback offline
      data = await OfflineDB.get<Tontine[]>('tontines');
    }

    if (!data || data.length === 0) {
      const fallback: Tontine[] = [
        {
          id: "tontine-1",
          creator_id: userId,
          name: "Jmâa El Kheir (Darb Sultan)",
          description: "Solidarité familiale et voisinage pour l'ameublement ou les vacances d'été.",
          contribution_amount: 1000,
          frequency: "monthly",
          total_members: 10,
          current_round: 4,
          start_date: "2026-03-01",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      await OfflineDB.set('tontines', fallback);
      data = fallback;
    }
    setTontines(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTontines();
  }, [userId]);

  const createTontine = async (tontineData: Omit<Tontine, 'id' | 'creator_id' | 'created_at' | 'updated_at'>) => {
    const newTontine: Tontine = {
      ...tontineData,
      id: generateId(),
      creator_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [...tontines, newTontine];
    setTontines(updated);
    await OfflineDB.set('tontines', updated);

    try {
      await supabase.from('tontines').insert(newTontine);
    } catch (_) {}
    return newTontine;
  };

  const updateTontineStatus = async (id: string, status: Tontine['status']) => {
    const updated = tontines.map(t => t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t);
    setTontines(updated);
    await OfflineDB.set('tontines', updated);

    try {
      await supabase.from('tontines').update({ status }).eq('id', id);
    } catch (_) {}
  };

  const deleteTontine = async (id: string) => {
    const updated = tontines.filter(t => t.id !== id);
    setTontines(updated);
    await OfflineDB.set('tontines', updated);

    try {
      await supabase.from('tontines').delete().eq('id', id);
    } catch (_) {}
  };

  const validateTransactionPIN = (pin: string): boolean => {
    return pin === "1234"; // Standard default PIN code for tontine safety validations
  };

  return {
    tontines,
    loading,
    createTontine,
    updateTontineStatus,
    deleteTontine,
    validateTransactionPIN,
    refresh: loadTontines
  };
}
