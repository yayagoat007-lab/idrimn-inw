"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useFamily } from '../../../hooks/use-family';
import { useFamilyMembers } from '../../../hooks/use-family-members';
import { FamilyDashboard } from '../../../components/family/FamilyDashboard';
import { FamilyMemberCard } from '../../../components/family/FamilyMemberCard';
import { FamilyInviteModal } from '../../../components/family/FamilyInviteModal';
import { FamilyPermissionEditor } from '../../../components/family/FamilyPermissionEditor';
import { PlanGate } from '../../../components/shared/PlanGate';
import { Heart, Plus, Users } from 'lucide-react';
import { getTranslation, Language } from '../../../lib/i18n';
import { FamilyRole } from '../../../types';

interface FamilyPageProps {
  language: Language;
}

export default function FamilyPage({ language }: FamilyPageProps) {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";

  const familyGroupId = "family-group-1"; // default group

  const { getConsolidatedStats } = useFamily(familyGroupId);
  const { 
    members, 
    loading: membersLoading, 
    inviteMember, 
    updateMemberRole, 
    removeMember 
  } = useFamilyMembers(familyGroupId);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'permissions'>('dashboard');

  const availableBuckets = ["Alimentation", "Logement", "Éducation", "Transports", "Loisirs"];

  // Prepare fallback data to execute getConsolidatedStats
  const stats = getConsolidatedStats([], [
    {
      id: "b-1",
      user_id: userId,
      name: "Alimentation",
      category: "food",
      allocated_amount: 5000,
      spent_amount: 3200,
      color: "#10b981",
      icon: "shopping-bag",
      is_essential: true,
      auto_allocate_percent: 40,
      order_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "b-2",
      user_id: userId,
      name: "Logement",
      category: "rent",
      allocated_amount: 4000,
      spent_amount: 4000,
      color: "#3b82f6",
      icon: "home",
      is_essential: true,
      auto_allocate_percent: 30,
      order_index: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const handleInviteSubmit = (emailOrPhone: string, role: any, sharedBuckets: string[], budgetLimit?: number) => {
    inviteMember(emailOrPhone, role, sharedBuckets, budgetLimit);
  };

  const handleTogglePermission = (memberId: string, bucketName: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const isShared = member.sharedBuckets.includes(bucketName);
    const updatedBuckets = isShared 
      ? member.sharedBuckets.filter(b => b !== bucketName)
      : [...member.sharedBuckets, bucketName];

    // Simulating updates back by triggering state change if possible
    member.sharedBuckets = updatedBuckets;
  };

  const handleRoleChangeCast = (id: string, role: any) => {
    updateMemberRole(id, role as FamilyRole);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="text-emerald-600" />
            <span>{getTranslation('family', language) || "Dar / Foyer"}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Gestion collaborative des enveloppes du foyer, supervision parentale et éducation financière
          </p>
        </div>

        {activeTab === 'members' && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs py-2 px-4 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Inviter</span>
          </button>
        )}
      </div>

      {/* Subscription Gating (requires "family" tier) */}
      <PlanGate requiredTier="family">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 'dashboard', label: 'Dashboard Foyer' },
            { id: 'members', label: 'Proches & Enfants' },
            { id: 'permissions', label: 'Gérer les Permissions' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-1 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-emerald-600 text-slate-800' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        {activeTab === 'dashboard' && stats && (
          <FamilyDashboard stats={stats} />
        )}

        {activeTab === 'members' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div key={member.id}>
                <FamilyMemberCard
                  member={member}
                  onRoleChange={handleRoleChangeCast}
                  onRemove={removeMember}
                  isAdmin={true}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'permissions' && (
          <FamilyPermissionEditor
            members={members}
            buckets={availableBuckets}
            onTogglePermission={handleTogglePermission}
          />
        )}

        {/* Invite modal */}
        {showInviteModal && (
          <FamilyInviteModal
            onClose={() => setShowInviteModal(false)}
            onInvite={handleInviteSubmit}
            availableBuckets={availableBuckets}
          />
        )}
      </PlanGate>
    </div>
  );
}
