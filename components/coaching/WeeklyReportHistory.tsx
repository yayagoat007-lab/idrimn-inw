import React from 'react';
import { WeeklyReport } from '../../lib/weekly-coaching-report';
import { Calendar, ChevronRight, FileText, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface WeeklyReportHistoryProps {
  reports: WeeklyReport[];
  onSelectReport: (report: WeeklyReport) => void;
  activeReportId?: string;
  language: 'fr' | 'darija';
}

export function WeeklyReportHistory({ 
  reports, 
  onSelectReport, 
  activeReportId,
  language 
}: WeeklyReportHistoryProps) {
  const isDarija = language === 'darija';

  if (reports.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-xs">
        <p className="text-xs text-slate-400 font-semibold">
          {isDarija 
            ? "Makan hta chi t-taqarir sabeqa lhad l'an." 
            : "Aucun historique de rapport hebdomadaire disponible pour le moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-black text-slate-400 tracking-wide uppercase px-1">
        {isDarija ? "Taqarir Sabeqa" : "Rapports Hebdomadaires Précédents"}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reports.map((rep) => {
          const isActive = rep.id === activeReportId;
          return (
            <button
              key={rep.id}
              onClick={() => onSelectReport(rep)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                  : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-500'
                }`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    {rep.period}
                  </div>
                  <div className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {isDarija 
                      ? `Masrouf: ${formatCurrency(rep.summary.totalSpent)} | Épargne: ${formatCurrency(rep.summary.totalSaved)}`
                      : `Dépenses : ${formatCurrency(rep.summary.totalSpent)} | Épargne : ${formatCurrency(rep.summary.totalSaved)}`}
                  </div>
                </div>
              </div>
              
              <ChevronRight className={`w-4 h-4 shrink-0 ml-2 ${
                isActive ? 'text-white' : 'text-slate-300'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
