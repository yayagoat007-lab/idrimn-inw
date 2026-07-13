import React, { useState } from 'react';
import { Referral } from '../../lib/referral';
import { Gift, Share2, Clipboard, Users } from 'lucide-react';

interface ReferralDashboardProps {
  referrals: Referral[];
  referralCode: string;
  onInvite: (name: string, contact: string) => void;
}

export function ReferralDashboard({ referrals, referralCode, onInvite }: ReferralDashboardProps) {
  const [friendName, setFriendName] = useState('');
  const [contact, setContact] = useState('');

  const completedRefs = referrals.filter(r => r.status === 'completed');
  const totalRewardDays = completedRefs.reduce((acc, r) => acc + r.rewardDays, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName || !contact) return;
    onInvite(friendName, contact);
    setFriendName('');
    setContact('');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    alert('Code parrainage copié dans le presse-papiers !');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Invite panel */}
      <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-50 pb-4">
          <h3 className="font-extrabold text-sm text-slate-900 leading-none flex items-center gap-1.5">
            <Gift className="text-emerald-600" size={18} />
            <span>Offrez 1 mois Premium, gagnez 1 mois !</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Invitez vos proches à piloter leur argent sur Floussi</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nom de votre ami(e)</label>
            <input
              type="text"
              required
              placeholder="e.g. Hamid"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">N° de téléphone ou Email</label>
            <input
              type="text"
              required
              placeholder="e.g. hamid@gmail.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="sm:col-span-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Envoyer l'invitation
          </button>
        </form>

        {/* Referrals table list */}
        <div className="space-y-3 pt-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Users size={12} />
            <span>Historique de vos parrainages</span>
          </p>

          <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[9px] text-slate-400 uppercase font-black tracking-wider border-b border-slate-100">
                  <th className="p-3">Ami(e)</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Récompense</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50/40">
                    <td className="p-3">
                      <p className="font-extrabold text-slate-800">{ref.friendName}</p>
                      <p className="text-[9px] text-slate-400">{ref.emailOrPhone}</p>
                    </td>
                    <td className="p-3 text-slate-400">{ref.date}</td>
                    <td className="p-3">
                      {ref.status === 'completed' ? (
                        <span className="bg-emerald-50 text-emerald-800 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase">Validé</span>
                      ) : (
                        <span className="bg-amber-50 text-amber-800 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase">En attente</span>
                      )}
                    </td>
                    <td className="p-3 text-right text-emerald-600 font-extrabold">
                      +{ref.rewardDays} Jours Premium
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rewards stats card & Referral sharing */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Vos Récompenses</span>
          
          <div className="pt-4 space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Économies cumulées :</p>
            <p className="text-3xl font-black text-emerald-400">{totalRewardDays} Jours</p>
            <p className="text-xs text-slate-400 font-medium">de service Premium offerts gratuitement !</p>
          </div>
        </div>

        {/* Code copying */}
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Votre Code de Parrainage Unique</p>
          
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs font-black tracking-wider text-center text-emerald-400 select-all">
              {referralCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700 cursor-pointer"
              title="Copier le code"
            >
              <Clipboard size={16} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
export default ReferralDashboard;
