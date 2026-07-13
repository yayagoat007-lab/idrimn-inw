import React, { useState } from 'react';
import { MoroccanEvent } from '../../types';
import { convertGregorianToHijri } from '../../lib/hijri';
import { CountdownBadge } from '../shared/CountdownBadge';
import { HijriDateDisplay } from '../shared/HijriDateDisplay';
import { Calendar, Filter, Sparkles, Plus, Layers, ArrowRight } from 'lucide-react';

interface EventsCalendarProps {
  events: MoroccanEvent[];
  getDaysRemaining: (date: string) => number;
  getEventStatus: (event: MoroccanEvent) => 'active' | 'upcoming' | 'past';
  onCreateNew: () => void;
  onSelectEvent: (event: MoroccanEvent) => void;
}

export function EventsCalendar({
  events,
  getDaysRemaining,
  getEventStatus,
  onCreateNew,
  onSelectEvent
}: EventsCalendarProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = events.filter(e => {
    if (filterType === 'all') return true;
    if (filterType === 'religious') return ['ramadan', 'aid_al_fitr', 'aid_al_adha', 'mawlid', 'hijri_new_year'].includes(e.type);
    return e.type === filterType;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Calendrier des Célébrations & Saisons</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold">
            Suivi des grands événements religieux et fêtes traditionnelles marocaines.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="bg-slate-100 p-0.5 rounded-xl flex">
            <button
              onClick={() => setFilterType('all')}
              className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg transition-all ${filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterType('religious')}
              className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg transition-all ${filterType === 'religious' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Religieux
            </button>
            <button
              onClick={() => setFilterType('custom')}
              className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg transition-all ${filterType === 'custom' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Familiaux / Perso
            </button>
          </div>

          <button
            onClick={onCreateNew}
            className="bg-slate-800 hover:bg-slate-900 text-white rounded-lg py-1.5 px-2.5 text-[9px] font-black flex items-center gap-1 transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>Créer</span>
          </button>
        </div>
      </div>

      {/* Events Grid timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.length === 0 ? (
          <div className="md:col-span-2 text-center py-10 text-slate-400 border border-dashed border-slate-100 rounded-2xl">
            <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold">Aucun événement ne correspond à ce filtre.</p>
          </div>
        ) : (
          filteredEvents.map(ev => {
            const daysLeft = getDaysRemaining(ev.start_date);
            const status = getEventStatus(ev);
            const hijri = convertGregorianToHijri(ev.start_date);

            let statusColor = "";
            if (status === 'active') statusColor = "bg-emerald-500";
            else if (status === 'upcoming') statusColor = "bg-amber-400";
            else statusColor = "bg-slate-300";

            return (
              <div 
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className="group border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold uppercase">
                        {ev.type}
                      </span>
                    </div>
                    <CountdownBadge daysRemaining={daysLeft} />
                  </div>

                  <h4 className="text-sm font-black text-slate-800 group-hover:text-emerald-600 transition-all">
                    {ev.name}
                  </h4>

                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    Du {new Date(ev.start_date).toLocaleDateString('fr-FR')} au {new Date(ev.end_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="block text-[8px] uppercase font-bold text-slate-400">Date Hijri</span>
                    <span className="text-[10px] font-extrabold text-emerald-800 font-mono">
                      {hijri.formattedFr}
                    </span>
                  </div>

                  <div className="text-right flex items-center gap-1 text-[10px] font-black text-slate-500 group-hover:text-emerald-600 transition-all">
                    <span>Voir Détails</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
