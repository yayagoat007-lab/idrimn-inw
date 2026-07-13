import React from 'react';
import { AdminUser } from '../../hooks/use-admin-users';
import { Trash2, ShieldAlert, Star, ShieldCheck } from 'lucide-react';
import { SubscriptionTier } from '../../types';

interface AdminUserTableProps {
  users: AdminUser[];
  onTierChange: (id: string, tier: SubscriptionTier) => void;
  onStatusChange: (id: string, status: 'active' | 'suspended' | 'banned') => void;
  onDelete: (id: string) => void;
}

export function AdminUserTable({ users, onTierChange, onStatusChange, onDelete }: AdminUserTableProps) {
  const getStatusBadge = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return <span className="bg-emerald-50 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Actif</span>;
      case 'suspended':
        return <span className="bg-amber-50 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Suspendu</span>;
      case 'banned':
        return <span className="bg-rose-50 text-rose-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Banni</span>;
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return 'text-slate-500 font-bold';
      case 'premium': return 'text-amber-600 font-extrabold';
      case 'family': return 'text-emerald-600 font-extrabold';
      case 'analyse': return 'text-blue-600 font-extrabold';
      case 'elite': return 'text-purple-650 font-black';
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Contact & Ville</th>
              <th className="p-4">Plan Actuel</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date d'Inscription</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Aucun utilisateur ne correspond à vos filtres de recherche.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-extrabold text-slate-900">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-700">{user.phone}</p>
                    <p className="text-[10px] text-slate-400">{user.city}</p>
                  </td>
                  <td className="p-4">
                    <select
                      value={user.tier}
                      onChange={(e) => onTierChange(user.id, e.target.value as SubscriptionTier)}
                      className={`bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-extrabold cursor-pointer ${getTierColor(user.tier)}`}
                    >
                      <option value="free">Gratuit</option>
                      <option value="premium">Premium (29 DH)</option>
                      <option value="family">Famille (49 DH)</option>
                      <option value="analyse">Analyse (150 DH)</option>
                      <option value="elite">Elite (200 DH)</option>
                    </select>
                  </td>
                  <td className="p-4">{getStatusBadge(user.status)}</td>
                  <td className="p-4 text-slate-400">{user.createdAt}</td>
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                    {user.status === 'active' ? (
                      <button
                        onClick={() => onStatusChange(user.id, 'suspended')}
                        title="Suspendre l'accès"
                        className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors cursor-pointer inline-flex"
                      >
                        <ShieldAlert size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => onStatusChange(user.id, 'active')}
                        title="Activer l'accès"
                        className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors cursor-pointer inline-flex"
                      >
                        <ShieldCheck size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(user.id)}
                      title="Supprimer l'utilisateur"
                      className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer inline-flex"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminUserTable;
