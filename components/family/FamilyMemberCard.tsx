import React from 'react';
import { ExtendedFamilyMember } from '../../hooks/use-family-members';
import { Shield, Eye, User, Settings, Trash2, Clock, Globe } from 'lucide-react';
import { t, Language } from '../../lib/i18n';

interface FamilyMemberCardProps {
  member: ExtendedFamilyMember;
  onRoleChange: (id: string, role: ExtendedFamilyMember['role']) => void;
  onRemove: (id: string) => void;
  isAdmin: boolean;
  language: Language;
}

export function FamilyMemberCard({ member, onRoleChange, onRemove, isAdmin, language }: FamilyMemberCardProps) {
  const isDarija = language === 'darija';
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center gap-1 text-[9px] bg-red-100 text-red-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
            <Shield className="w-2.5 h-2.5" />
            <span>Admin</span>
          </span>
        );
      case 'member':
        return (
          <span className="flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
            <User className="w-2.5 h-2.5" />
            <span>{isDarija ? 'Membru' : 'Membre'}</span>
          </span>
        );
      case 'viewer':
        return (
          <span className="flex items-center gap-1 text-[9px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
            <Eye className="w-2.5 h-2.5" />
            <span>Viewer</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[9px] bg-slate-100 text-slate-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
            <span>{isDarija ? 'Weld / Bent' : 'Enfant'}</span>
          </span>
        );
    }
  };

  return (
    <div className="border border-slate-150 rounded-2xl p-4 bg-white hover:shadow-xs transition-all relative flex flex-col justify-between">
      {/* Upper info with avatar & online status */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <img 
            src={member.avatar} 
            alt={member.name} 
            className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100"
            referrerPolicy="no-referrer"
          />
          <div 
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              member.online ? 'bg-emerald-500' : 'bg-slate-300'
            }`} 
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs font-black text-slate-800 truncate">{member.name}</h4>
            {getRoleBadge(member.role)}
          </div>

          <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 font-semibold">
            <Globe className="w-3 h-3" />
            <span>{member.lastActive}</span>
          </div>
        </div>
      </div>

      {/* Shared sandoqs summary */}
      <div className="my-4 pt-3 border-t border-slate-50">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{t('sharedEnvelopesLabel', language)}</span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {member.sharedBuckets.map((b, idx) => (
            <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
              {b}
            </span>
          ))}
          {member.budgetLimit && (
            <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-extrabold">
              {t('budgetLimitCard', language)}: {member.budgetLimit} DH
            </span>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && member.role !== 'admin' && (
        <div className="flex gap-1.5 pt-3 border-t border-slate-50 mt-auto">
          <select
            value={member.role}
            onChange={(e) => onRoleChange(member.id, e.target.value as any)}
            className="flex-1 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg p-1.5 outline-none cursor-pointer"
          >
            <option value="member">{isDarija ? 'Passer Membre' : 'Passer Membre'}</option>
            <option value="viewer">{isDarija ? 'Passer Viewer' : 'Passer Viewer'}</option>
            <option value="child">{isDarija ? 'Passer Enfant' : 'Passer Enfant'}</option>
          </select>

          <button
            onClick={() => onRemove(member.id)}
            className="p-1.5 border border-red-100 hover:border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title={isDarija ? 'مسح' : 'Retirer'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
export default FamilyMemberCard;
