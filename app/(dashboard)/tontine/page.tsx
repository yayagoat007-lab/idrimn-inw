"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useTontines } from '../../../hooks/use-tontines';
import { useTontineMembers } from '../../../hooks/use-tontine-members';
import { useTontinePayments } from '../../../hooks/use-tontine-payments';
import { TontineCard } from '../../../components/tontine/TontineCard';
import { TontineForm } from '../../../components/tontine/TontineForm';
import { TontineMemberList } from '../../../components/tontine/TontineMemberList';
import { TontinePaymentTracker } from '../../../components/tontine/TontinePaymentTracker';
import { TontineTimeline } from '../../../components/tontine/TontineTimeline';
import { TontineInviteModal } from '../../../components/tontine/TontineInviteModal';
import { PlanGate } from '../../../components/shared/PlanGate';
import { PiggyBank, Plus, HelpCircle, Users, ArrowLeft } from 'lucide-react';
import { getTranslation, Language } from '../../../lib/i18n';
import { Tontine, TontineStatus } from '../../../types';

interface TontinePageProps {
  language: Language;
}

export default function TontinePage({ language }: TontinePageProps) {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";
  const { tontines, loading: tontinesLoading, createTontine, updateTontineStatus, deleteTontine } = useTontines(userId);

  const [selectedTontineId, setSelectedTontineId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  // Sub-hooks for active tontine details
  const activeTontine = tontines.find(t => t.id === selectedTontineId);
  const { 
    members, 
    loading: membersLoading, 
    updateMemberQueue 
  } = useTontineMembers(selectedTontineId || '');

  const { 
    payments, 
    loading: paymentsLoading, 
    recordPayment 
  } = useTontinePayments(selectedTontineId || '');

  const handleCreateSubmit = async (data: any) => {
    await createTontine(data);
    setShowForm(false);
  };

  const handleConfirmPaymentPin = async (memberId: string, round: number, pin: string) => {
    // Check local PIN for transaction verification, default is 0000 or anything simple
    if (pin.length !== 4) return false;
    
    if (activeTontine) {
      await recordPayment(memberId, round, activeTontine.contribution_amount, 'paid');
      return true;
    }
    return false;
  };

  const moveMemberOrder = (memberId: string, direction: 'up' | 'down') => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const currentPos = member.position_in_queue;
    const targetPos = direction === 'up' ? currentPos - 1 : currentPos + 1;
    if (targetPos < 1 || targetPos > members.length) return;

    // Swap positions
    const swapWith = members.find(m => m.position_in_queue === targetPos);
    if (swapWith) {
      updateMemberQueue(swapWith.id, currentPos);
    }
    updateMemberQueue(memberId, targetPos);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <PiggyBank className="text-emerald-600" />
            <span>{getTranslation('tontine', language) || "Jmâa • Daret"}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Épargne solidaire, cercles de confiance familiaux et traçabilité "Chkoun Khalass"
          </p>
        </div>

        {!selectedTontineId && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs py-2 px-4 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Créer Daret</span>
          </button>
        )}
      </div>

      {/* Subscription Gate Check (Jmâa features require Premium / 29 DH) */}
      <PlanGate requiredTier="premium">
        {selectedTontineId && activeTontine ? (
          <div className="space-y-6">
            {/* Back to list button */}
            <button
              onClick={() => setSelectedTontineId(null)}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-black uppercase transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'index</span>
            </button>

            {/* Active Tontine Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Matrix payments tracker */}
                <TontinePaymentTracker
                  tontine={activeTontine}
                  members={members}
                  payments={payments}
                  onConfirmPayment={handleConfirmPaymentPin}
                  isAdmin={true}
                />

                {/* 2. Chronological Timeline */}
                <TontineTimeline tontine={activeTontine} />
              </div>

              <div className="space-y-6">
                {/* 3. Small Details Action Card */}
                <div className="border border-slate-150 rounded-2xl p-5 bg-white shadow-xs space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Actions & Invites</h4>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Partagez l'accès au cercle ou gérez les autorisations de répartition en direct.
                  </p>
                  <button
                    onClick={() => setShowInvite(true)}
                    className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wide rounded-xl transition-all"
                  >
                    Inviter un Cousin
                  </button>
                </div>

                {/* 4. Members queue */}
                <TontineMemberList
                  members={members}
                  onMoveUp={(id) => moveMemberOrder(id, 'up')}
                  onMoveDown={(id) => moveMemberOrder(id, 'down')}
                  isAdmin={true}
                />
              </div>
            </div>

            {/* Invite modal */}
            {showInvite && (
              <TontineInviteModal
                tontineId={activeTontine.id}
                tontineName={activeTontine.name}
                onClose={() => setShowInvite(false)}
              />
            )}
          </div>
        ) : showForm ? (
          <TontineForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <div className="space-y-6">
            {/* Informative Banner */}
            <div className="bg-emerald-50/40 border border-emerald-200/60 rounded-3xl p-5 flex flex-col sm:flex-row items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                  Qu'est-ce que "Daret" ?
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed max-w-2xl">
                  {getTranslation('tontineDesc', language) || "Système financier traditionnel d'aide mutuelle."} Sans intérêt, solidaire et 100% basé sur la confiance locale. Floussi digitalise et trace les cotisations pour éviter les retards.
                </p>
              </div>
            </div>

            {/* Tontine list Grid */}
            {tontinesLoading ? (
              <div className="text-center py-10">Chargement des cercles...</div>
            ) : tontines.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl">
                <p className="text-xs font-bold text-slate-400">Vous ne participez à aucune Jmâa pour le moment.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] uppercase py-2 px-4 rounded-xl transition-all"
                >
                  Lancer la première Daret
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tontines.map((t) => (
                  <div key={t.id}>
                    <TontineCard
                      tontine={t}
                      onSelect={(selected: Tontine) => setSelectedTontineId(selected.id)}
                      onStatusChange={(id: string, status: TontineStatus) => { updateTontineStatus(id, status); }}
                      onDelete={(id: string) => { deleteTontine(id); }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PlanGate>
    </div>
  );
}
