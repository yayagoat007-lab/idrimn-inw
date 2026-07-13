import { useState, useEffect } from 'react';
import { TontinePayment } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';

export function useTontinePayments(tontineId: string) {
  const [payments, setPayments] = useState<TontinePayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadPayments = async () => {
    if (!tontineId) return;
    setLoading(true);
    let data: TontinePayment[] | null = null;
    try {
      const { data: remoteData, error } = await supabase
        .from('tontine_payments')
        .select('*')
        .eq('tontine_id', tontineId);
      if (error) throw error;
      data = remoteData;
    } catch (_) {
      const allPayments = await OfflineDB.get<TontinePayment[]>('tontine_payments') || [];
      data = allPayments.filter(p => p.tontine_id === tontineId);
    }

    if (!data || data.length === 0) {
      // Create some initial payments
      const fallback: TontinePayment[] = [
        {
          id: "tp-1",
          tontine_id: tontineId,
          member_id: "tm-1",
          amount: 1000,
          round_number: 1,
          payment_date: "2026-03-25",
          status: "paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "tp-2",
          tontine_id: tontineId,
          member_id: "tm-2",
          amount: 1000,
          round_number: 1,
          payment_date: "2026-03-26",
          status: "paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "tp-3",
          tontine_id: tontineId,
          member_id: "tm-3",
          amount: 1000,
          round_number: 1,
          payment_date: "2026-03-27",
          status: "paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "tp-4",
          tontine_id: tontineId,
          member_id: "tm-1",
          amount: 1000,
          round_number: 2,
          payment_date: "2026-04-25",
          status: "paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      const allPayments = await OfflineDB.get<TontinePayment[]>('tontine_payments') || [];
      const merged = [...allPayments.filter(p => p.tontine_id !== tontineId), ...fallback];
      await OfflineDB.set('tontine_payments', merged);
      data = fallback;
    }

    setPayments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, [tontineId]);

  const recordPayment = async (memberId: string, round: number, amount: number, status: TontinePayment['status']) => {
    const existing = payments.find(p => p.member_id === memberId && p.round_number === round);

    if (existing) {
      const updated = payments.map(p => p.id === existing.id ? { ...p, status, amount, payment_date: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() } : p);
      setPayments(updated);
      
      const allPayments = await OfflineDB.get<TontinePayment[]>('tontine_payments') || [];
      await OfflineDB.set('tontine_payments', allPayments.map(p => p.id === existing.id ? { ...p, status, amount, payment_date: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() } : p));

      try {
        await supabase.from('tontine_payments').update({ status, amount, payment_date: new Date().toISOString().split('T')[0] }).eq('id', existing.id);
      } catch (_) {}
    } else {
      const newPayment: TontinePayment = {
        id: generateId(),
        tontine_id: tontineId,
        member_id: memberId,
        amount,
        round_number: round,
        payment_date: new Date().toISOString().split('T')[0],
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updated = [...payments, newPayment];
      setPayments(updated);

      const allPayments = await OfflineDB.get<TontinePayment[]>('tontine_payments') || [];
      await OfflineDB.set('tontine_payments', [...allPayments, newPayment]);

      try {
        await supabase.from('tontine_payments').insert(newPayment);
      } catch (_) {}
    }
  };

  const getPaymentsByRoundAndMember = () => {
    const grid: Record<string, Record<number, TontinePayment>> = {};
    payments.forEach(p => {
      if (!grid[p.member_id]) grid[p.member_id] = {};
      grid[p.member_id][p.round_number] = p;
    });
    return grid;
  };

  return {
    payments,
    loading,
    recordPayment,
    getPaymentsByRoundAndMember,
    refresh: loadPayments
  };
}
