import React from 'react';
import { Tontine } from '../../types';
import { Users, Calendar, Coins, ArrowRightLeft, MoreVertical, Play, Pause, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { t, Language } from '../../lib/i18n';

interface TontineCardProps {
  tontine: Tontine;
  onSelect: (tontine: Tontine) => void;
  onStatusChange: (id: string, status: Tontine['status']) => void;
  onDelete: (id: string) => void;
  language: Language;
}

export function TontineCard({ tontine, onSelect, onStatusChange, onDelete, language }: TontineCardProps) {
  const isDarija = language === 'darija';
  const [showMenu, setShowMenu] = React.useState(false);

  const progress = Math.round((tontine.current_round / tontine.total_members) * 100);

  const getStatusColor = (status: Tontine['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'paused': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="border border-slate-150 rounded-2xl bg-white p-5 shadow-xs relative hover:shadow-xs transition-all">
      {/* Upper header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getStatusColor(tontine.status)}`}>
            {isDarija ? (tontine.status === 'active' ? 'khdama' : tontine.status === 'paused' ? 'waqfa' : 'msalya') : tontine.status}
          </span>
          <h4 className="text-xs font-black text-slate-800 mt-1.5">{tontine.name}</h4>
        </div>

        {/* Triple dots option menu */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-slate-150 rounded-xl shadow-lg p-1.5 z-20 min-w-[140px] text-[10px] font-bold text-slate-600 space-y-1">
              {tontine.status === 'active' ? (
                <button 
                  onClick={() => { onStatusChange(tontine.id, 'paused'); setShowMenu(false); }}
                  className="w-full text-left p-1.5 hover:bg-amber-50 hover:text-amber-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  {isDarija ? "Habess daret" : "Mettre en pause"}
                </button>
              ) : (
                <button 
                  onClick={() => { onStatusChange(tontine.id, 'active'); setShowMenu(false); }}
                  className="w-full text-left p-1.5 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isDarija ? "Kmmel daret" : "Reprendre Daret"}
                </button>
              )}
              <button 
                onClick={() => { onDelete(tontine.id); setShowMenu(false); }}
                className="w-full text-left p-1.5 hover:bg-red-50 hover:text-red-700 rounded-lg flex items-center gap-1.5 text-red-500 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('delete', language)}
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mb-4">
        {tontine.description || (isDarija ? "Hta chi wasf maktoub f had jmâa." : "Aucune description fournie pour cette Jmâa.")}
      </p>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-500 border-t border-slate-50 pt-3">
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="block text-[8px] text-slate-400 font-semibold uppercase">{isDarija ? "Mousahama" : "Cotisation"}</span>
            <span>{formatCurrency(tontine.contribution_amount)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-600" />
          <div>
            <span className="block text-[8px] text-slate-400 font-semibold uppercase">{isDarija ? "A3da'" : "Membres"}</span>
            <span>{tontine.total_members} / {tontine.total_members}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ArrowRightLeft className="w-4 h-4 text-purple-600" />
          <div>
            <span className="block text-[8px] text-slate-400 font-semibold uppercase">{isDarija ? "Doora dyal daba" : "Tour Actuel"}</span>
            <span>{isDarija ? `Doora ${tontine.current_round} / ${tontine.total_members}` : `Tour ${tontine.current_round} / ${tontine.total_members}`}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-amber-600" />
          <div>
            <span className="block text-[8px] text-slate-400 font-semibold uppercase">{isDarija ? "Doora (Période)" : "Période"}</span>
            <span className="capitalize">{tontine.frequency === 'monthly' ? (isDarija ? 'Chhriya' : 'Mensuel') : (isDarija ? 'Simana' : 'Hebdo')}</span>
          </div>
        </div>
      </div>

      {/* Progress slider bar */}
      <div className="mt-4 pt-3 border-t border-slate-50">
        <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
          <span>{isDarija ? "Taqaddom dyal daret" : "Progression globale"}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* Prochaine collecte summary */}
      <div className="mt-4 bg-slate-50 rounded-xl p-2.5 flex justify-between items-center text-[10px] font-bold text-slate-600">
        <div>
          <span className="block text-[8px] text-slate-400 font-semibold uppercase">{isDarija ? "Bénéficiaire lli jay" : "Prochain bénéficiaire"}</span>
          <span className="text-slate-800">Youssef El Alami</span>
        </div>
        <button 
          onClick={() => onSelect(tontine)}
          className="text-emerald-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>{isDarija ? "Choof" : "Consulter"}</span>
        </button>
      </div>
    </div>
  );
}
export default TontineCard;
