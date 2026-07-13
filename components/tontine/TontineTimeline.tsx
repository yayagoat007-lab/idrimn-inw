import React from 'react';
import { Tontine } from '../../types';
import { Calendar, CheckCircle, Clock, Gift, Landmark } from 'lucide-react';

interface TontineTimelineProps {
  tontine: Tontine;
}

export function TontineTimeline({ tontine }: TontineTimelineProps) {
  // Generate a chronological timeline based on start_date
  const startDate = new Date(tontine.start_date);
  const events = Array.from({ length: tontine.total_members }, (_, i) => {
    const roundDate = new Date(startDate);
    if (tontine.frequency === 'monthly') {
      roundDate.setMonth(startDate.getMonth() + i);
    } else {
      roundDate.setDate(startDate.getDate() + (i * 7));
    }

    const isCompleted = i + 1 < tontine.current_round;
    const isCurrent = i + 1 === tontine.current_round;

    return {
      round: i + 1,
      date: roundDate.toLocaleDateString('fr-MA', { year: 'numeric', month: 'short', day: 'numeric' }),
      isCompleted,
      isCurrent,
      beneficiary: i === 0 ? "Ahmed El Alami" : i === 1 ? "Fatima" : `Cousin ${i + 1}`
    };
  });

  return (
    <div className="border border-slate-150 rounded-2xl bg-white p-5 shadow-xs">
      <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider">
        Échéancier & Historique de Rotation
      </h4>

      <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {events.map((e, idx) => {
          let dotStyle = "border-slate-200 bg-white text-slate-400";
          if (e.isCompleted) dotStyle = "border-emerald-500 bg-emerald-50 text-emerald-600";
          if (e.isCurrent) dotStyle = "border-blue-500 bg-blue-50 text-blue-600 animate-pulse";

          return (
            <div key={idx} className="flex gap-4 relative">
              {/* Dot Icon */}
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all ${dotStyle}`}>
                {e.isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : e.isCurrent ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Gift className="w-4 h-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black text-slate-800">
                    Rond {e.round} • Tirage {e.beneficiary}
                  </span>
                  {e.isCurrent && (
                    <span className="text-[8px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                      Actif
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>{e.date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default TontineTimeline;
