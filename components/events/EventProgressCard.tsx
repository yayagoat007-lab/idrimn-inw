import React from 'react';
import { MoroccanEvent } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { HijriDateDisplay } from '../shared/HijriDateDisplay';
import { CountdownBadge } from '../shared/CountdownBadge';
import { 
  PiggyBank, Trash2, Edit3, Copy, Landmark, 
  TrendingUp, HelpCircle, CheckCircle 
} from 'lucide-react';

interface EventProgressCardProps {
  event: MoroccanEvent;
  getDaysRemaining: (date: string) => number;
  onContribute: (event: MoroccanEvent) => void;
  onDuplicate: (id: string) => void;
  onEdit: (event: MoroccanEvent) => void;
  onDelete: (id: string) => void;
}

export function EventProgressCard({
  event,
  getDaysRemaining,
  onContribute,
  onDuplicate,
  onEdit,
  onDelete
}: EventProgressCardProps) {
  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  const allocated = event.budget_allocated;
  const spent = event.budget_spent;
  const remaining = Math.max(0, allocated - spent);
  const ratio = allocated > 0 ? (spent / allocated) * 100 : 0;
  const daysLeft = getDaysRemaining(event.start_date);

  let progressBarColor = "bg-emerald-500 shadow-emerald-500/10";
  if (ratio > 95) progressBarColor = "bg-rose-500 shadow-rose-500/10";
  else if (ratio > 75) progressBarColor = "bg-amber-500 shadow-amber-500/10";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {event.type}
          </span>
          <h3 className="text-sm font-black text-slate-800 tracking-tight mt-1">{event.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold">
            Période : {new Date(event.start_date).toLocaleDateString('fr-FR')} - {new Date(event.end_date).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <CountdownBadge daysRemaining={daysLeft} />
      </div>

      {/* Hijri equivalents display box */}
      <HijriDateDisplay date={event.start_date} />

      {/* Financial details math & progress bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-end text-xs font-bold">
          <div className="space-y-0.5">
            <span className="block text-[9px] text-slate-400 uppercase font-bold">Masrouf dépensé</span>
            <span className="text-slate-800 font-mono font-black">{formatMAD(spent)}</span>
          </div>
          <div className="text-right space-y-0.5">
            <span className="block text-[9px] text-slate-400 uppercase font-bold">Cagnotte allouée</span>
            <span className="text-slate-700 font-mono font-black">{formatMAD(allocated)}</span>
          </div>
        </div>

        {/* Progress gauge */}
        <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
          <div 
            style={{ width: `${Math.min(100, ratio)}%` }}
            className={`absolute top-0 left-0 bottom-0 rounded-full transition-all duration-500 ${progressBarColor}`}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-slate-400">Reste : {formatMAD(remaining)}</span>
          <span className={ratio > 100 ? "text-rose-500" : "text-emerald-600"}>{ratio.toFixed(0)}% consommé</span>
        </div>
      </div>

      {event.notes && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
          <span className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Détails d'organisation</span>
          <p className="text-slate-600 font-semibold leading-relaxed">{event.notes}</p>
        </div>
      )}

      {/* Action panel triggers */}
      <div className="flex flex-wrap gap-2 justify-between pt-3 border-t border-slate-100">
        {/* Contribuer button */}
        <button
          onClick={() => onContribute(event)}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl py-2 px-3 text-xs font-black tracking-wide shadow-md shadow-emerald-500/10 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
        >
          <PiggyBank className="w-4 h-4" />
          <span>Alimenter la cagnotte</span>
        </button>

        {/* secondary actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onDuplicate(event.id)}
            title="Dupliquer pour l'année prochaine"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(event)}
            title="Modifier l'événement"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            title="Supprimer l'événement"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
