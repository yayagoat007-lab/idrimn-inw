import React from 'react';
import { CalendarDays } from 'lucide-react';
import { convertGregorianToHijri } from '../../lib/hijri';

interface HijriDateDisplayProps {
  date: string | Date;
  className?: string;
}

export function HijriDateDisplay({ date, className = "" }: HijriDateDisplayProps) {
  const hijri = convertGregorianToHijri(date);

  return (
    <div className={`flex flex-col gap-0.5 bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5 text-xs text-emerald-800 ${className}`}>
      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-[10px] text-emerald-600">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>Date Hijri estimée</span>
      </div>
      <div className="flex justify-between items-center gap-3 mt-1">
        <span className="font-extrabold text-emerald-900">{hijri.formattedFr}</span>
        <span className="font-semibold text-[11px] text-emerald-700 font-mono text-right dir-rtl">{hijri.formattedDarija}</span>
      </div>
    </div>
  );
}
