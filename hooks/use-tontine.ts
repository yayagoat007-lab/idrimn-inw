import { useState, useEffect } from 'react';
import { Tontine, TontineMember, TontinePayment } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';

const DEFAULT_TONTINES: Tontine[] = [
  {
    id: "tontine-1",
    creator_id: "mock-user-id-9999",
    name: "Daret El Kheir (Darb Sultan)",
    description: "Tontine solidaire entre voisins et amis de l'ancienne médina pour épargne mutuelle.",
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

const DEFAULT_MEMBERS: TontineMember[] = [
  {
    id: "tm-1",
    tontine_id: "tontine-1",
    user_id: "mock-user-id-9999",
    joined_at: "2026-03-01",
    total_contributed: 3000,
    total_received: 0,
    position_in_queue: 5,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "tm-2",
    tontine_id: "tontine-1",
    user_id: "user-fatima",
    joined_at: "2026-03-01",
    total_contributed: 3000,
    total_received: 10000,
    position_in_queue: 1,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "tm-3",
    tontine_id: "tontine-1",
    user_id: "user-hamza",
    joined_at: "2026-03-01",
    total_contributed: 3000,
    total_received: 0,
    position_in_queue: 2,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "tm-4",
    tontine_id: "tontine-1",
    user_id: "user-youssef",
    joined_at: "2026-03-01",
    total_contributed: 3000,
    total_received: 0,
    position_in_queue: 3,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_PAYMENTS: TontinePayment[] = [
  {
    id: "tp-1",
    tontine_id: "tontine-1",
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
    tontine_id: "tontine-1",
    member_id: "tm-1",
    amount: 1000,
    round_number: 2,
    payment_date: "2026-04-25",
    status: "paid",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "tp-3",
    tontine_id: "tontine-1",
    member_id: "tm-1",
    amount: 1000,
    round_number: 3,
    payment_date: "2026-05-25",
    status: "paid",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "tp-4",
    tontine_id: "tontine-1",
    member_id: "tm-1",
    amount: 1000,
    round_number: 4,
    payment_date: "2026-06-25",
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function useTontine(userId: string = "mock-user-id-9999") {
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [members, setMembers] = useState<TontineMember[]>([]);
  const [payments, setPayments] = useState<TontinePayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTontineData() {
      setLoading(true);
      
      let localTontines = await OfflineDB.get<Tontine[]>('tontines');
      let localMembers = await OfflineDB.get<TontineMember[]>('tontine_members');
      let localPayments = await OfflineDB.get<TontinePayment[]>('tontine_payments');

      if (!localTontines || localTontines.length === 0) {
        localTontines = DEFAULT_TONTINES.map(t => ({ ...t, creator_id: userId }));
        localMembers = DEFAULT_MEMBERS;
        localPayments = DEFAULT_PAYMENTS;

        await OfflineDB.set('tontines', localTontines);
        await OfflineDB.set('tontine_members', localMembers);
        await OfflineDB.set('tontine_payments', localPayments);
        
        localStorage.setItem('floussi_table_tontines', JSON.stringify(localTontines));
        localStorage.setItem('floussi_table_tontine_members', JSON.stringify(localMembers));
        localStorage.setItem('floussi_table_tontine_payments', JSON.stringify(localPayments));
      }

      setTontines(localTontines);
      setMembers(localMembers || []);
      setPayments(localPayments || []);
      setLoading(false);
    }

    loadTontineData();
  }, [userId]);

  const saveTontineData = async (newTontines: Tontine[], newMembers: TontineMember[], newPayments: TontinePayment[]) => {
    setTontines(newTontines);
    setMembers(newMembers);
    setPayments(newPayments);
    
    await OfflineDB.set('tontines', newTontines);
    await OfflineDB.set('tontine_members', newMembers);
    await OfflineDB.set('tontine_payments', newPayments);

    localStorage.setItem('floussi_table_tontines', JSON.stringify(newTontines));
    localStorage.setItem('floussi_table_tontine_members', JSON.stringify(newMembers));
    localStorage.setItem('floussi_table_tontine_payments', JSON.stringify(newPayments));
  };

  const getNextCollection = () => {
    if (tontines.length === 0) return null;
    const activeTontine = tontines[0];
    const userMember = members.find(m => m.tontine_id === activeTontine.id && m.user_id === userId);
    
    if (!userMember) return null;
    
    // Prochaine collecte is scheduled for pay day or around end of month
    const nextCollectDate = "25 juillet 2026";
    const amount = activeTontine.contribution_amount * activeTontine.total_members;
    
    return {
      tontineName: activeTontine.name,
      amount,
      date: nextCollectDate,
      userPosition: userMember.position_in_queue,
      currentRound: activeTontine.current_round,
      totalRounds: activeTontine.total_members,
      nextWinnerName: "Youssef El Alami"
    };
  };

  const payContribution = async (tontineId: string, amount: number) => {
    const activeTontine = tontines.find(t => t.id === tontineId);
    if (!activeTontine) return;

    const userMember = members.find(m => m.tontine_id === tontineId && m.user_id === userId);
    if (!userMember) return;

    // Create a new paid payment or update a pending one
    const pendingPayment = payments.find(p => p.tontine_id === tontineId && p.member_id === userMember.id && p.status === 'pending');
    
    let updatedPayments: TontinePayment[];
    if (pendingPayment) {
      updatedPayments = payments.map(p => p.id === pendingPayment.id ? { ...p, status: 'paid', payment_date: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() } : p);
    } else {
      const newPayment: TontinePayment = {
        id: generateId(),
        tontine_id: tontineId,
        member_id: userMember.id,
        amount,
        round_number: activeTontine.current_round + 1,
        payment_date: new Date().toISOString().split('T')[0],
        status: 'paid',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      updatedPayments = [...payments, newPayment];
    }

    // Update member contributions
    const updatedMembers = members.map(m => m.id === userMember.id ? { ...m, total_contributed: m.total_contributed + amount, updated_at: new Date().toISOString() } : m);

    await saveTontineData(tontines, updatedMembers, updatedPayments);

    try {
      if (pendingPayment) {
        await supabase.from('tontine_payments').update({ status: 'paid', payment_date: new Date().toISOString().split('T')[0] }).eq('id', pendingPayment.id);
      } else {
        const payload = updatedPayments[updatedPayments.length - 1];
        await supabase.from('tontine_payments').insert(payload);
      }
    } catch (_) {
      // Offline fallback queue
    }
  };

  return {
    tontines,
    members,
    payments,
    loading,
    getNextCollection,
    payContribution
  };
}
