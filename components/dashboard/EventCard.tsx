import React from 'react';
import { MoroccanEvent } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Calendar, Moon, Sparkles, Heart, Landmark, HelpCircle, ArrowUpRight } from 'lucide-react';

interface EventCardProps {
  key?: any;
  event: MoroccanEvent;
  daysRemaining: number;
  status: 'active' | 'upcoming' | 'past';
  onContribute: (id: string, amount: number) => void;
  language: 'fr' | 'darija';
}

export function EventCard({
  event,
  daysRemaining,
  status,
  onContribute,
  language
}: EventCardProps) {
  
  const getEventIcon = () => {
    switch (event.type) {
      case 'ramadan':
        return <Moon className="text-emerald-600" size={20} />;
      case 'aid_al_fitr':
      case 'aid_al_adha':
        return <Landmark className="text-amber-600" size={20} />;
      case 'wedding':
        return <Heart className="text-rose-600" size={20} />;
      case 'birth':
        return <Sparkles className="text-purple-600" size={20} />;
      default:
        return <Calendar className="text-blue-600" size={20} />;
    }
  };

  const statusBadges = {
    active: (
      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
        Actif
      </span>
    ),
    upcoming: (
      <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-800 rounded-full text-[9px] font-black uppercase tracking-wider">
        À venir
      </span>
    ),
    past: (
      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-wider">
        Passé
      </span>
    )
  };

  const rawPercent = event.budget_allocated > 0 ? (event.budget_spent / event.budget_allocated) * 100 : 0;
  const percent = Math.min(100, Math.round(rawPercent));

  return (
    <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-4 hover:shadow-md transition-all relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
            {getEventIcon()}
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">
              {event.name}
            </h4>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {event.start_date} au {event.end_date}
            </p>
          </div>
        </div>
        {statusBadges[status]}
      </div>

      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl text-center">
        <div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Budget Alloué</p>
          <p className="font-black text-xs text-slate-800">{formatCurrency(event.budget_allocated)}</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Dépensé</p>
          <p className="font-black text-xs text-slate-800">{formatCurrency(event.budget_spent)}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-slate-600">
          <span>{percent}% utilisé</span>
          <span className="text-slate-400">
            {status === 'upcoming' 
              ? `Dans ${daysRemaining} jours` 
              : status === 'active' 
                ? 'Événement en cours' 
                : 'Terminé'}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {status !== 'past' && (
        <button
          onClick={() => onContribute(event.id, 500)}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <ArrowUpRight size={13} />
          <span>Allouer 500 DH</span>
        </button>
      )}
    </div>
  );
}
