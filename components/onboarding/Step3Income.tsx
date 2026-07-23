import React from 'react';
import { DollarSign, Calendar, Landmark, Briefcase, TrendingUp, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Language } from '../../lib/i18n';

interface Step3IncomeProps {
  incomeAmount: number;
  setIncomeAmount: (val: number) => void;
  incomeSource: string;
  setIncomeSource: (val: string) => void;
  payDay: number;
  setPayDay: (val: number) => void;
  language: Language;
  onNext: () => void;
  onPrev: () => void;
}

const INCOME_PRESETS = [
  { label: 'SMIG (3120 DH)', value: 3120 },
  { label: '5 000 DH', value: 5000 },
  { label: '8 000 DH', value: 8000 },
  { label: '12 000 DH', value: 12000 },
  { label: '20 000 DH', value: 20000 }
];

const SOURCES = [
  { id: 'salaire', label_fr: 'Salaire', label_darija: 'Salarié', desc_fr: 'Virement stable', desc_darija: 'Virement f l-banka', icon: Landmark },
  { id: 'freelance', label_fr: 'Freelance', label_darija: 'Freelance', desc_fr: 'Contrats & Projets', desc_darija: 'Mouta3aqid', icon: Briefcase },
  { id: 'commerce', label_fr: 'Commerce / Cash', label_darija: 'Tijara / Cash', desc_fr: 'Ventes directes', desc_darija: 'L-Bi3 o s-chra', icon: TrendingUp },
  { id: 'autre', label_fr: 'Autre source', label_darija: 'Madakhil khra', desc_fr: 'Revenus divers', desc_darija: 'Haja khra', icon: HelpCircle }
];

export function Step3Income({
  incomeAmount,
  setIncomeAmount,
  incomeSource,
  setIncomeSource,
  payDay,
  setPayDay,
  language,
  onNext,
  onPrev
}: Step3IncomeProps) {

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">
          {language === 'darija' ? 'الخلصة و المدخول' : 'Configurez vos revenus'}
        </h3>
        <p className="text-xs font-semibold text-slate-400">
          {language === 'darija' ? "Kteb chhal kat-ched f chhar bach n-qasmo l-enveloppes dyalk." : "Entrez vos ressources mensuelles pour diviser vos enveloppes."}
        </p>
      </div>

      <div className="space-y-5">
        {/* Income Amount Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700">
              {language === 'darija' ? "Koulchi li kat-ched f chhar *" : "Revenu mensuel total *"}
            </label>
            <span className="text-base font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
              {formatCurrency(incomeAmount)}
            </span>
          </div>
          
          <input
            type="range"
            min="1000"
            max="50000"
            step="250"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          
          <div className="flex justify-between text-[9px] text-slate-400 font-bold">
            <span>1 000 DH</span>
            <span>25 000 DH</span>
            <span>50 000 DH</span>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            {INCOME_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setIncomeAmount(preset.value)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                  incomeAmount === preset.value
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-extrabold'
                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Income Source cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            {language === 'darija' ? "Mnin kay-jiw l-flouss bezaf *" : "Source principale de revenu *"}
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {SOURCES.map((src) => {
              const Icon = src.icon;
              const isSelected = incomeSource === src.id;
              return (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => setIncomeSource(src.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between h-24 cursor-pointer hover:scale-[1.01] ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/10'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <Icon size={18} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />
                  <div>
                    <h4 className="font-extrabold text-[11px] text-slate-900 leading-tight">
                      {language === 'darija' ? src.label_darija : src.label_fr}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-none">
                      {language === 'darija' ? src.desc_darija : src.desc_fr}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day of the month */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700">
              {language === 'darija' ? "Nhar f chhar mnin kat-ched l-flouss *" : "Jour de réception de la paie *"}
            </label>
            <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <Calendar size={12} className="text-slate-500" /> 
              {language === 'darija' ? `Nhar ${payDay} f chhar` : `Le ${payDay} du mois`}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="31"
            step="1"
            value={payDay}
            onChange={(e) => setPayDay(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />

          <div className="flex justify-between text-[9px] text-slate-400 font-bold">
            <span>{language === 'darija' ? "Bdayat chhar (1)" : "Début du mois (1)"}</span>
            <span>{language === 'darija' ? "Nsf chhar (15)" : "Milieu (15)"}</span>
            <span>{language === 'darija' ? "L-Lekhr d chhar (31)" : "Fin du mois (31)"}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onPrev}
          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{language === 'darija' ? "Rje3" : "Retour"}</span>
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>{language === 'darija' ? "Kamal" : "Continuer"}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
export default Step3Income;
