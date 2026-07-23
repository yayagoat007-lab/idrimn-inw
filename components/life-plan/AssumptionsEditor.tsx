import React from 'react';
import { Assumptions } from '../../hooks/use-long-term-plan';
import { Settings, Shield, RefreshCw, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/use-translation';

interface AssumptionsEditorProps {
  assumptions: Assumptions;
  onUpdate: (newAssumptions: Partial<Assumptions>) => void;
  onReset: () => void;
  language?: 'fr' | 'darija';
}

export function AssumptionsEditor({
  assumptions,
  onUpdate,
  onReset,
  language: propLanguage,
}: AssumptionsEditorProps) {
  const { lang } = useTranslation();
  const language = propLanguage || lang;
  
  const handleInputChange = (field: keyof Assumptions, val: string | number) => {
    onUpdate({ [field]: val });
  };

  const t = {
    title: language === 'fr' ? 'Hypothèses de Travail' : 'Hypotheses dyal l-Hsab',
    subtitle: language === 'fr' 
      ? 'Ajuste tes paramètres personnels pour recalculer instantanément tes projections de vie.' 
      : 'Bdel l-arqam dyalk bach t-chouf t-taqdirat dyalk t-bdel f l-7al.',
    currentAge: language === 'fr' ? 'Âge Actuel' : 'L-3mar dyalk db',
    retirementAge: language === 'fr' ? 'Âge Retraite Visé' : 'L-3mar d-retraite li baghi',
    cnssYears: language === 'fr' ? 'Années CNSS cumulées' : '3wam dyal CNSS li khdmti',
    monthlySalary: language === 'fr' ? 'Salaire mensuel moyen (DH)' : 'Oujra d-chhar (DH)',
    monthlySavings: language === 'fr' ? 'Épargne nette mensuelle (DH)' : 'L-Iddikhar dyal chhar (DH)',
    growthScenario: language === 'fr' ? 'Scénario de Rendement' : 'Scénario d-Arba7',
    prudent: language === 'fr' ? 'Prudent (3.5%)' : 'Prudent (3.5%)',
    balanced: language === 'fr' ? 'Équilibré (6.0%)' : 'Moutawassit (6.0%)',
    dynamic: language === 'fr' ? 'Dynamique (8.5%)' : 'Haraki (8.5%)',
    resetBtn: language === 'fr' ? 'Réinitialiser' : '3awd l-bdaya',
    salaryHelp: language === 'fr' ? 'Capped à 6 000 DH/mois pour la pension CNSS.' : 'Tay7bess f 6 000 DH f l-CNSS.',
    savingsHelp: language === 'fr' ? 'Somme que tu mets de côté dans tes sandoqs chaque mois.' : 'Chhal kat-khb3 f s-sandoqat dyalk kola chhar.',
  };

  return (
    <div 
      className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs space-y-5"
      id="assumptions-editor-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              {t.title}
            </h3>
            <p className="text-[11px] text-slate-500 font-bold leading-normal mt-0.5">
              {t.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer border border-slate-150"
        >
          <RefreshCw size={11} />
          <span>{t.resetBtn}</span>
        </button>
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="assumptions-inputs-grid">
        
        {/* Current Age */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
            {t.currentAge}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="18"
              max="90"
              value={assumptions.currentAge}
              onChange={(e) => handleInputChange('currentAge', Math.max(18, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 font-mono"
            />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'fr' ? 'Ans' : '3am'}</span>
          </div>
        </div>

        {/* Retirement Age */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
            {t.retirementAge}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={assumptions.currentAge + 1}
              max="100"
              value={assumptions.retirementAge}
              onChange={(e) => handleInputChange('retirementAge', Math.max(assumptions.currentAge + 1, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 font-mono"
            />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'fr' ? 'Ans' : '3am'}</span>
          </div>
        </div>

        {/* CNSS Contribution Years */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
            {t.cnssYears}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="50"
              value={assumptions.cnssContributionYears}
              onChange={(e) => handleInputChange('cnssContributionYears', Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 font-mono"
            />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'fr' ? 'Ans' : '3am'}</span>
          </div>
        </div>

        {/* Salary */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
              {t.monthlySalary}
            </label>
            <div className="group relative cursor-pointer">
              <HelpCircle size={12} className="text-slate-400 hover:text-slate-600" />
              <div className="absolute right-0 bottom-full mb-1 w-48 bg-slate-800 text-white text-[9px] font-bold p-2 rounded-lg hidden group-hover:block z-25 leading-normal">
                {t.salaryHelp}
              </div>
            </div>
          </div>
          <input
            type="number"
            min="0"
            value={assumptions.averageMonthlySalary}
            onChange={(e) => handleInputChange('averageMonthlySalary', Math.max(0, Number(e.target.value)))}
            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Savings */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
              {t.monthlySavings}
            </label>
            <div className="group relative cursor-pointer">
              <HelpCircle size={12} className="text-slate-400 hover:text-slate-600" />
              <div className="absolute right-0 bottom-full mb-1 w-48 bg-slate-800 text-white text-[9px] font-bold p-2 rounded-lg hidden group-hover:block z-25 leading-normal">
                {t.savingsHelp}
              </div>
            </div>
          </div>
          <input
            type="number"
            min="0"
            value={assumptions.monthlyNetSavings}
            onChange={(e) => handleInputChange('monthlyNetSavings', Math.max(0, Number(e.target.value)))}
            className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Growth Scenario Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
            {t.growthScenario}
          </label>
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {(['prudent', 'balanced', 'dynamic'] as const).map((scen) => (
              <button
                key={scen}
                type="button"
                onClick={() => handleInputChange('growthScenario', scen)}
                className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  assumptions.growthScenario === scen
                    ? 'bg-white text-slate-800 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {scen === 'prudent' ? t.prudent : scen === 'balanced' ? t.balanced : t.dynamic}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="flex gap-2.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4.5 items-start">
        <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
        <p className="text-[10px] text-indigo-900 font-bold leading-normal">
          {language === 'fr' 
            ? "💡 Comment optimiser ? Épargner ne suffit pas : en choisissant un scénario Équilibré ou Dynamique (avec placements boursiers OPCVM, actions de dividende marocaines, ou immobilier), ton patrimoine grandira beaucoup plus vite qu’avec de l’épargne dormante."
            : "💡 Kifach t-stafed ktar ? T-khbi l-flouss ghir f l-khna machi kafi: ila derti scenario Moutawassit ola Haraki (investissement f l-bourse, dividende, ola l-aqar), l-flouss dyalk gha t-kbar bzaf bzerba m3a l-fayda l-morakkaba."}
        </p>
      </div>
    </div>
  );
}
export default AssumptionsEditor;
