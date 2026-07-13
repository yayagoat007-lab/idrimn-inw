import { useState, useEffect } from 'react';
import { FamilyMember } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';

export interface ExtendedFamilyMember extends FamilyMember {
  name: string;
  avatar: string;
  online: boolean;
  lastActive: string;
  sharedBuckets: string[];
  budgetLimit?: number;
}

export function useFamilyMembers(familyGroupId: string) {
  const [members, setMembers] = useState<ExtendedFamilyMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadMembers = async () => {
    if (!familyGroupId) return;
    setLoading(true);
    let data: FamilyMember[] | null = null;
    try {
      const { data: remoteData, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_group_id', familyGroupId);
      if (error) throw error;
      data = remoteData;
    } catch (_) {
      const allMembers = await OfflineDB.get<FamilyMember[]>('family_members') || [];
      data = allMembers.filter(m => m.family_group_id === familyGroupId);
    }

    if (!data || data.length === 0) {
      // Mock family members
      const fallback: ExtendedFamilyMember[] = [
        {
          id: "fm-1",
          family_group_id: familyGroupId,
          user_id: "mock-user-id-9999",
          role: "admin",
          name: "Ahmed El Alami",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
          online: true,
          lastActive: "En ligne",
          sharedBuckets: ["Alimentation", "Logement", "Éducation", "Transports"],
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "fm-2",
          family_group_id: familyGroupId,
          user_id: "user-fatima",
          role: "member",
          name: "Fatima El Alami",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fatima",
          online: false,
          lastActive: "Il y a 10 min",
          sharedBuckets: ["Alimentation", "Éducation"],
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "fm-3",
          family_group_id: familyGroupId,
          user_id: "user-youssef",
          role: "member",
          name: "Youssef El Alami (Enfant)",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=youssef",
          online: true,
          lastActive: "En ligne",
          sharedBuckets: ["Transports"],
          budgetLimit: 500,
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const allMembers = await OfflineDB.get<FamilyMember[]>('family_members') || [];
      const merged = [...allMembers.filter(m => m.family_group_id !== familyGroupId), ...fallback];
      await OfflineDB.set('family_members', merged);
      setMembers(fallback);
    } else {
      // Enhance flat members with details
      const extended: ExtendedFamilyMember[] = data.map((m, idx) => ({
        ...m,
        name: idx === 0 ? "Ahmed El Alami" : idx === 1 ? "Fatima El Alami" : "Youssef El Alami",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${idx === 0 ? 'ahmed' : idx === 1 ? 'fatima' : 'youssef'}`,
        online: idx % 2 === 0,
        lastActive: idx % 2 === 0 ? "En ligne" : "Il y a 10 min",
        sharedBuckets: idx === 0 ? ["Alimentation", "Logement", "Éducation"] : ["Alimentation"],
        budgetLimit: idx === 2 ? 500 : undefined
      }));
      setMembers(extended);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, [familyGroupId]);

  const inviteMember = async (emailOrPhone: string, role: FamilyMember['role'], sharedBuckets: string[], budgetLimit?: number) => {
    const newMember: ExtendedFamilyMember = {
      id: generateId(),
      family_group_id: familyGroupId,
      user_id: `user-${generateId()}`,
      role,
      name: emailOrPhone.split('@')[0] || "Invité Floussi",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${generateId()}`,
      online: false,
      lastActive: "Jamais connecté",
      sharedBuckets,
      budgetLimit,
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [...members, newMember];
    setMembers(updated);

    const allMembers = await OfflineDB.get<FamilyMember[]>('family_members') || [];
    await OfflineDB.set('family_members', [...allMembers, newMember]);

    try {
      await supabase.from('family_members').insert(newMember);
    } catch (_) {}
    return newMember;
  };

  const updateMemberRole = async (memberId: string, role: FamilyMember['role']) => {
    const updated = members.map(m => m.id === memberId ? { ...m, role, updated_at: new Date().toISOString() } : m);
    setMembers(updated);

    const allMembers = await OfflineDB.get<FamilyMember[]>('family_members') || [];
    await OfflineDB.set('family_members', allMembers.map(m => m.id === memberId ? { ...m, role, updated_at: new Date().toISOString() } : m));

    try {
      await supabase.from('family_members').update({ role }).eq('id', memberId);
    } catch (_) {}
  };

  const removeMember = async (memberId: string) => {
    const updated = members.filter(m => m.id !== memberId);
    setMembers(updated);

    const allMembers = await OfflineDB.get<FamilyMember[]>('family_members') || [];
    await OfflineDB.set('family_members', allMembers.filter(m => m.id !== memberId));

    try {
      await supabase.from('family_members').delete().eq('id', memberId);
    } catch (_) {}
  };

  return {
    members,
    loading,
    inviteMember,
    updateMemberRole,
    removeMember,
    refresh: loadMembers
  };
}
