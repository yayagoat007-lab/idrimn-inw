import React from 'react';
import { Flame, CheckCircle, AlertTriangle } from 'lucide-react';

interface StreakCalendarProps {
  streak: number;
  history: string[]; // List of active dates like ['2026-07-13', '2026-07-12']
}

export function StreakCalendar({ streak, history }: StreakCalendarProps) {
  // Generate mock month dates (e.g., July 2026)
  // Let's assume July 2026 starts on Wednesday, 31 days
  const startDayOffset = 2; // Wed
  const daysInMonth = 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const hasLoggedToday = history.includes(todayStr);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 animate-pulse">
            <Flame size={24} fill="currentColor" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-none">Streak Actif : {streak} Jours</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Saisissez vos dépenses chaque jour pour garder la flamme</p>
          </div>
        </div>
      </div>

      {/* Grid calendar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Juillet 2026</span>
          <span className={hasLoggedToday ? 'text-emerald-600' : 'text-amber-500'}>
            {hasLoggedToday ? '✓ Saisie validée aujourd\'hui' : '⚠️ Saisie manquante aujourd\'hui'}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px]">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
            <span key={d} className="text-slate-400 uppercase">{d}</span>
          ))}

          {/* Empty cells before start day */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <span key={`empty-${i}`} className="p-2"></span>
          ))}

          {days.map((day) => {
            const dateStr = `2026-07-${day.toString().padStart(2, '0')}`;
            const isChecked = history.includes(dateStr) || day === 12 || day === 11 || day === 13; // mock past days for visual appeal
            const isToday = day === 13;

            return (
              <div
                key={day}
                className={`p-1.5 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                  isToday 
                    ? 'ring-2 ring-emerald-600 font-extrabold text-slate-900' 
                    : isChecked
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-400 hover:bg-slate-50/50'
                }`}
              >
                <span>{day}</span>
                {isChecked && (
                  <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5 absolute bottom-1"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!hasLoggedToday && (
        <div className="bg-amber-50 border border-amber-100 text-amber-900 rounded-2xl p-4 text-[11px] font-semibold flex gap-2.5 items-start">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold">Gardez votre streak !</p>
            <p className="text-amber-700 font-medium mt-1">Vous n'avez pas encore saisi de dépense ou de revenu aujourd'hui. Ajoutez une opération ou scannez un reçu pour obtenir vos bonus d'XP !</p>
          </div>
        </div>
      )}
    </div>
  );
}
export default StreakCalendar;
