import React from 'react';
import { EyeOff, RefreshCw } from 'lucide-react';
import { Language } from '../../lib/i18n';

interface EmptyDashboardStateProps {
  onReset: () => void;
  language: Language;
}

export function EmptyDashboardState({
  onReset,
  language
}: EmptyDashboardStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-dashed border-slate-200 rounded-3xl max-w-lg mx-auto my-12 space-y-6 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
        <EyeOff className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
          {language === 'fr' ? "Tableau de Bord Vide" : "Dashboard Khawi"}
        </h3>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
          {language === 'fr'
            ? "Vous avez masqué tous les modules de votre écran d'accueil. Vos données ne sont pas supprimées."
            : "Khbity ga3 l-widgets men l-Dashboard. Bla matkhaf, l-ma'loumat dyalek rahom m'amnin."}
        </p>
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl text-xs font-black shadow-md hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>{language === 'fr' ? "Rétablir la disposition par défaut" : "Rjja3 l-tanzim dyal l-bdaya"}</span>
      </button>
    </div>
  );
}
