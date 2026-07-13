import React, { useState } from 'react';
import { Calendar, Moon } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  language: 'fr' | 'darija';
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  language
}: DateRangePickerProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const getPresetDates = (preset: 'month' | 'quarter' | 'year' | 'all') => {
    const now = new Date();
    let start = new Date();
    const end = now.toISOString().split('T')[0];

    if (preset === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === 'quarter') {
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    } else if (preset === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (preset === 'all') {
      start = new Date(2025, 0, 1);
    }

    onChange(start.toISOString().split('T')[0], end);
    setShowDropdown(false);
  };

  return (
    <div className="relative font-sans">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-4 py-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-2xl text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
      >
        <Calendar size={14} className="text-emerald-600" />
        <span>{startDate} au {endDate}</span>
      </button>

      {showDropdown && (
        <div className="absolute top-11 left-0 bg-white border border-slate-100 p-4 rounded-3xl shadow-xl w-64 z-40 space-y-3">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Période rapide</div>
          
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => getPresetDates('month')}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-xl text-[10px] text-center transition-colors cursor-pointer"
            >
              Ce Mois
            </button>
            <button
              onClick={() => getPresetDates('quarter')}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-xl text-[10px] text-center transition-colors cursor-pointer"
            >
              Ce Trimestre
            </button>
            <button
              onClick={() => getPresetDates('year')}
              className="col-span-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-xl text-[10px] text-center transition-colors cursor-pointer"
            >
              Cette Année (2026)
            </button>
          </div>

          <div className="border-t border-slate-50 pt-2 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Date Personnalisée</span>
              <span className="text-emerald-600 text-[8px] flex items-center gap-0.5 font-bold">
                <Moon size={9} /> Hijri dispos.
              </span>
            </div>

            <div className="space-y-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onChange(e.target.value, endDate)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-hidden"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => onChange(startDate, e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
