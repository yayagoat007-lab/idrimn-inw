import React from 'react';
import { Report } from '../../types';
import { FileText, Download, Trash2, Calendar, Share2 } from 'lucide-react';

interface ReportCardProps {
  report: Report;
  onDownload: (report: Report) => void;
  onDelete: (id: string) => void;
}

export function ReportCard({ report, onDownload, onDelete }: ReportCardProps) {
  const formattedDate = new Date(report.generated_at).toLocaleDateString('fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="border border-slate-150 rounded-2xl p-4 bg-white hover:shadow-xs transition-all flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
            Rapport {report.type === 'monthly' ? 'Mensuel' : report.type === 'quarterly' ? 'Trimestriel' : 'Annuel'}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-semibold">
            <Calendar className="w-3 h-3" />
            <span>Généré le {formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onDownload(report)}
          className="p-2 hover:bg-slate-50 text-slate-600 hover:text-emerald-600 rounded-lg transition-colors"
          title="Télécharger"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const shareText = `Rapport financier Floussi - ${report.type}`;
            if (navigator.share) {
              navigator.share({ title: shareText, text: shareText, url: window.location.href });
            } else {
              alert("Lien de partage copié dans le presse-papiers !");
            }
          }}
          className="p-2 hover:bg-slate-50 text-slate-600 hover:text-blue-600 rounded-lg transition-colors"
          title="Partager"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(report.id)}
          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
export default ReportCard;
