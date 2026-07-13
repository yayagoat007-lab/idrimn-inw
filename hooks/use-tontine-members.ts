import { useState, useEffect } from 'react';
import { TontineMember } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';

export function useTontineMembers(tontineId: string) {
  const [members, setMembers] = useState<TontineMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadMembers = async () => {
    if (!tontineId) return;
    setLoading(true);
    let data: TontineMember[] | null = null;
    try {
      const { data: remoteData, error } = await supabase
        .from('tontine_members')
        .select('*')
        .eq('tontine_id', tontineId);
      if (error) throw error;
      data = remoteData;
    } catch (_) {
      const allMembers = await OfflineDB.get<TontineMember[]>('tontine_members') || [];
      data = allMembers.filter(m => m.tontine_id === tontineId);
    }

    if (!data || data.length === 0) {
      // Mock members list
      const fallback: TontineMember[] = [
        {
          id: "tm-1",
          tontine_id: tontineId,
          user_id: "mock-user-id-9999",
          joined_at: new Date().toISOString(),
          total_contributed: 3000,
          total_received: 0,
          position_in_queue: 1,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "tm-2",
          tontine_id: tontineId,
          user_id: "user-fatima",
          joined_at: new Date().toISOString(),
          total_contributed: 3000,
          total_received: 10000,
          position_in_queue: 2,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "tm-3",
          tontine_id: tontineId,
          user_id: "user-hamza",
          joined_at: new Date().toISOString(),
          total_contributed: 3000,
          total_received: 0,
          position_in_queue: 3,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      const allMembers = await OfflineDB.get<TontineMember[]>('tontine_members') || [];
      const merged = [...allMembers.filter(m => m.tontine_id !== tontineId), ...fallback];
      await OfflineDB.set('tontine_members', merged);
      data = fallback;
    }
    
    setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, [tontineId]);

  const addMember = async (name: string, phone: string, position: number) => {
    const newMember: TontineMember = {
      id: generateId(),
      tontine_id: tontineId,
      user_id: `user-${generateId()}`,
      joined_at: new Date().toISOString(),
      total_contributed: 0,
      total_received: 0,
      position_in_queue: position,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [...members, newMember];
    setMembers(updated);

    const allMembers = await OfflineDB.get<TontineMember[]>('tontine_members') || [];
    await OfflineDB.set('tontine_members', [...allMembers, newMember]);

    try {
      await supabase.from('tontine_members').insert(newMember);
    } catch (_) {}
    return newMember;
  };

  const updateMemberQueue = async (memberId: string, position: number) => {
    const updated = members.map(m => m.id === memberId ? { ...m, position_in_queue: position, updated_at: new Date().toISOString() } : m);
    setMembers(updated);

    const allMembers = await OfflineDB.get<TontineMember[]>('tontine_members') || [];
    const rest = allMembers.filter(m => m.id !== memberId);
    const matched = allMembers.find(m => m.id === memberId);
    if (matched) {
      await OfflineDB.set('tontine_members', [...rest, { ...matched, position_in_queue: position }]);
    }

    try {
      await supabase.from('tontine_members').update({ position_in_queue: position }).eq('id', memberId);
    } catch (_) {}
  };

  const removeMember = async (memberId: string) => {
    const updated = members.filter(m => m.id !== memberId);
    setMembers(updated);

    const allMembers = await OfflineDB.get<TontineMember[]>('tontine_members') || [];
    await OfflineDB.set('tontine_members', allMembers.filter(m => m.id !== memberId));

    try {
      await supabase.from('tontine_members').delete().eq('id', memberId);
    } catch (_) {}
  };

  return {
    members,
    loading,
    addMember,
    updateMemberQueue,
    removeMember,
    refresh: loadMembers
  };
}
