import React from 'react';
import { Anomaly } from '../../lib/anomaly-detection';
import { AlertTriangle, Sparkles, Check, HelpCircle, X, ChevronRight, CheckCircle2 } from 'lucide-react';

interface AnomalyAlertProps {
  anomaly: Anomaly;
  onCorrect?: (anomaly: Anomaly) => void;
  lang: 'fr' | 'darija';
}

export function AnomalyAlert({ anomaly, onCorrect, lang }: AnomalyAlertProps) {
  const styles = {
    danger: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-800',
      iconBg: 'bg-rose-100 text-rose-600',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      label: 'Dépense Critique'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      iconBg: 'bg-amber-100 text-amber-600',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      label: 'Doublon Suspect'
    },
    info: {
      bg: 'bg-slate-50 border-slate-200',
      text: 'text-slate-800',
      iconBg: 'bg-slate-100 text-slate-600',
      badge: 'bg-slate-100 text-slate-800 border-slate-200',
      label: 'Classement Catégorie'
    }
  };

  const currentStyle = styles[anomaly.severity] || styles.info;

  return (
    <div className={`border ${currentStyle.bg} rounded-2xl p-4 shadow-xs transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
      <div className="flex gap-3 items-start max-w-xl">
        <div className={`p-2 rounded-xl shrink-0 ${currentStyle.iconBg}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentStyle.badge}`}>
              {currentStyle.label}
            </span>
            <span className="text-[9px] text-slate-400 font-bold">Alerte Floussi IA</span>
          </div>
          <p className="text-xs font-semibold text-slate-800 leading-relaxed">
            {anomaly.message}
          </p>
        </div>
      </div>

      {anomaly.type === 'category_mismatch' && anomaly.suggestedCorrection && (
        <button
          onClick={() => onCorrect?.(anomaly)}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 hover:border-slate-300 self-end sm:self-auto active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Corriger en "{anomaly.suggestedCorrection.category}"</span>
        </button>
      )}
    </div>
  );
}
