import React, { useState } from 'react';
import { useReports } from '../../hooks/use-reports';
import { useInsights } from '../../hooks/use-insights';
import { FileText, Plus, Download, Trash2, ShieldAlert, Sparkles } from 'lucide-react';

export function ReportsHistory() {
  const { reports, loading, generateReport, deleteReport, simulatePDFDownload } = useReports();
  const { stats } = useInsights();
  const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    // Combine mock info from current stats
    const payload = {
      totalIncome: stats.totalIncome || 12000,
      totalExpense: stats.totalExpense || 8200,
      savingsRate: stats.savingsRate || 31,
      healthScore: 78
    };
    await generateReport(reportType, payload);
    setCreating(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Rapports Exécutifs PDF</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold">
            Générez et archivez des rapports de performance imprimables pour votre comptabilité familiale.
          </p>
        </div>

        {/* Generate actions */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <select
            value={reportType}
            onChange={(e: any) => setReportType(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-bold bg-white"
          >
            <option value="monthly">Mensuel</option>
            <option value="quarterly">Trimestriel</option>
            <option value="annual">Annuel</option>
          </select>
          
          <button
            onClick={handleCreate}
            disabled={creating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-1.5 px-3 text-[10px] font-black tracking-wide flex items-center gap-1 shadow-md shadow-emerald-500/10 transition-all disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{creating ? "Génération..." : "Générer"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 font-bold text-center py-6">Chargement de l'archive...</p>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold">Aucun rapport généré pour le moment.</p>
          <p className="text-[9px] text-slate-400 font-medium mt-1">Sélectionnez une période et cliquez sur "Générer".</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((rep) => (
            <div key={rep.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3 hover:bg-slate-100/50 transition-all gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 tracking-tight capitalize">
                    Rapport {rep.type === 'monthly' ? 'Mensuel' : rep.type === 'quarterly' ? 'Trimestriel' : 'Annuel'}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-semibold">
                    ID: {rep.id} • Émis le {new Date(rep.generated_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => simulatePDFDownload(rep)}
                  className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-emerald-500 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Imprimer / PDF</span>
                </button>
                <button
                  onClick={() => deleteReport(rep.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
