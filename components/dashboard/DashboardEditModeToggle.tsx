import React from 'react';
import { Sliders, Check } from 'lucide-react';
import { Language } from '../../lib/i18n';

interface DashboardEditModeToggleProps {
  isEditMode: boolean;
  onToggle: () => void;
  language: Language;
}

export function DashboardEditModeToggle({
  isEditMode,
  onToggle,
  language
}: DashboardEditModeToggleProps) {
  const labelFr = isEditMode ? "Terminer la personnalisation" : "Personnaliser mon Dashboard";
  const labelDarija = isEditMode ? "Kamal l-tafsil" : "Detail l-Dashboard dyali";

  return (
    <button
      id="dashboard-edit-toggle-btn"
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all duration-300 shadow-md ${
        isEditMode
          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/10'
          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100 shadow-slate-200/10'
      } cursor-pointer`}
    >
      {isEditMode ? (
        <Check className="w-4 h-4 animate-scaleIn" />
      ) : (
        <Sliders className="w-4 h-4 text-emerald-500" />
      )}
      <span>{language === 'fr' ? labelFr : labelDarija}</span>
    </button>
  );
}
