import { useState, useEffect } from 'react';
import { useFamily } from './use-family';
import { OfflineDB } from '../lib/offline-db';
import { Transaction, Bucket, Tontine } from '../types';

export function useRemoteFamilyOverview(userId: string = "mock-user-id-9999") {
  const { familyGroup, loading: familyLoading, getConsolidatedStats } = useFamily(userId);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTontines, setActiveTontines] = useState<Tontine[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // Load current transactions
      let txs = await OfflineDB.get<Transaction[]>('transactions') || [];
      if (txs.length === 0) {
        const saved = localStorage.getItem('floussi_table_transactions');
        if (saved) {
          try { txs = JSON.parse(saved); } catch (_) {}
        }
      }

      // Load buckets
      let buckets = await OfflineDB.get<Bucket[]>('buckets') || [];
      if (buckets.length === 0) {
        const saved = localStorage.getItem('floussi_table_buckets');
        if (saved) {
          try { buckets = JSON.parse(saved); } catch (_) {}
        }
      }

      // Consolidate stats using useFamily utility
      const consolidated = getConsolidatedStats(txs, buckets);

      // Fetch active family tontines / Jmâa
      let tontines = await OfflineDB.get<Tontine[]>('tontines') || [];
      if (tontines.length === 0) {
        const saved = localStorage.getItem('floussi_table_tontines');
        if (saved) {
          try { tontines = JSON.parse(saved); } catch (_) {}
        }
      }

      // Fallback/Mock family Jmâa if empty, for beautiful UI reading
      if (tontines.length === 0) {
        tontines = [
          {
            id: 't-1',
            name: 'Jmâa El Aila (Famille)',
            creator_id: userId,
            target_amount: 12000,
            amount_per_member: 1000,
            current_round: 4,
            total_members: 12,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any
        ];
      }

      setStats(consolidated);
      setActiveTontines(tontines.filter(t => t.status === 'active'));
      setLoading(false);
    }

    if (!familyLoading) {
      loadData();
    }
  }, [userId, familyLoading, getConsolidatedStats]);

  return {
    familyGroup,
    loading: familyLoading || loading,
    stats,
    activeTontines
  };
}
