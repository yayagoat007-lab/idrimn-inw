import React from 'react';
import { PeriodType } from '../../hooks/use-insights';
import { Calendar, Download, RefreshCw } from 'lucide-react';

interface PeriodSelectorProps {
  period: PeriodType;
  setPeriod: (p: PeriodType) => void;
  comparePrevious: boolean;
  setComparePrevious: (c: boolean) => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
}

export function PeriodSelector({
  period,
  setPeriod,
  comparePrevious,
  setComparePrevious,
  onExportCSV,
  onExportExcel
}: PeriodSelectorProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      {/* Period Toggles */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full md:w-auto">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Période d'analyse</span>
        
        <div className="bg-slate-100 p-0.5 rounded-xl flex w-full sm:w-auto">
          <button
            onClick={() => setPeriod('month')}
            className={`flex-1 sm:flex-none text-[10px] font-black px-3.5 py-2 rounded-lg transition-all ${period === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Ce mois-ci
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`flex-1 sm:flex-none text-[10px] font-black px-3.5 py-2 rounded-lg transition-all ${period === 'quarter' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Trimestre
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`flex-1 sm:flex-none text-[10px] font-black px-3.5 py-2 rounded-lg transition-all ${period === 'year' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Cette année
          </button>
        </div>
      </div>

      {/* Comparisons & Exports */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* Compare Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 transition-all">
          <input
            type="checkbox"
            checked={comparePrevious}
            onChange={(e) => setComparePrevious(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
          />
          <span>Comparer au passé</span>
        </label>

        {/* Exports Dropdown buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-950 text-white rounded-xl py-2 px-3 text-[10px] font-black tracking-wide transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-3 text-[10px] font-black tracking-wide transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
