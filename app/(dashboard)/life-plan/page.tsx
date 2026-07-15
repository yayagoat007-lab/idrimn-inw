import React, { useState, useEffect } from 'react';
import { useLongTermPlan, Assumptions } from '../../../hooks/use-long-term-plan';
import { ScenarioComparisonChart } from '../../../components/life-plan/ScenarioComparisonChart';
import { LifeMilestoneTimeline } from '../../../components/life-plan/LifeMilestoneTimeline';
import { AssumptionsEditor } from '../../../components/life-plan/AssumptionsEditor';
import { PlanGate } from '../../../components/shared/PlanGate';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Sparkles,
  ShieldAlert,
  TrendingUp,
  Calendar,
  Lock,
  Compass,
  ArrowRight,
  PiggyBank,
  CheckCircle,
  HelpCircle,
  Sliders,
  ChevronRight,
  Activity,
  AlertTriangle,
  Info
} from 'lucide-react';

interface LifePlanPageProps {
  language: 'fr' | 'darija';
}

export default function LifePlanPage({ language }: LifePlanPageProps) {
  const userId = "mock-user-id-9999";
  const {
    assumptions,
    loading,
    annualGrowthRate,
    projections,
    milestones,
    comparisonScenarios,
    comparisonChartData,
    retirementDetails,
    updateAssumptions,
    resetAssumptions,
    currentNetWorth
  } = useLongTermPlan(userId);

  // For interactive slider projection
  const [selectedYear, setSelectedYear] = useState<number>(10);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Form states for first-time onboarding
  const [formCurrentAge, setFormCurrentAge] = useState<number>(30);
  const [formRetirementAge, setFormRetirementAge] = useState<number>(60);
  const [formCnssYears, setFormCnssYears] = useState<number>(8);
  const [formMonthlySalary, setFormMonthlySalary] = useState<number>(9500);
  const [formMonthlySavings, setFormMonthlySavings] = useState<number>(2000);

  useEffect(() => {
    try {
      const isInit = localStorage.getItem('floussi_life_plan_initialized');
      if (isInit === 'true') {
        setInitialized(true);
      }
    } catch (_) {}
  }, []);

  // Update form values once assumptions load
  useEffect(() => {
    if (assumptions) {
      setFormCurrentAge(assumptions.currentAge);
      setFormRetirementAge(assumptions.retirementAge);
      setFormCnssYears(assumptions.cnssContributionYears);
      setFormMonthlySalary(assumptions.averageMonthlySalary);
      setFormMonthlySavings(assumptions.monthlyNetSavings);
    }
  }, [assumptions]);

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAssumptions({
      currentAge: formCurrentAge,
      retirementAge: formRetirementAge,
      cnssContributionYears: formCnssYears,
      averageMonthlySalary: formMonthlySalary,
      monthlyNetSavings: formMonthlySavings,
    });
    setInitialized(true);
    localStorage.setItem('floussi_life_plan_initialized', 'true');
  };

  if (loading || !assumptions) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Activity className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
            {language === 'fr' ? 'Sidi calcule ton plan de vie...' : 'Sidi kay-qadd l-moukhtat dyalk...'}
          </p>
        </div>
      </div>
    );
  }

  // Format monetary values
  const formatCurrency = (val: number) => {
    return `${val.toLocaleString(language === 'fr' ? 'fr-FR' : 'ar-MA')} DH`;
  };

  const selectedProj = projections[Math.min(selectedYear, projections.length - 1)] || projections[0];
  const selectedAge = assumptions.currentAge + selectedProj.year;
  const currentYearCalendar = new Date().getFullYear() + selectedProj.year;

  // i18n
  const t = {
    title: language === 'fr' ? 'Planificateur Financier Long Terme' : 'Idarat l-Patrimoine f l-Ajal l-Tawil',
    subtitle: language === 'fr' 
      ? 'Évalue ton patrimoine futur, simule ta retraite CNSS et construis ta liberté financière à 10, 20 et 30 ans.' 
      : 'Hseb l-moustaqbal d l-flouss dyalk, chouf retraite CNSS, o bni l-stifada dyalk f 10, 20 o 30 3am.',
    indicativeWarningTitle: language === 'fr' ? '⚠️ ESTIMATIONS FINANCIÈRES INDICATIVES' : '⚠️ TAQDIRAT TAQRIBIYA GHIR RASMIYA',
    indicativeWarningBody: language === 'fr'
      ? 'Les résultats affichés sont des projections mathématiques basées sur les intérêts composés et l’historique moyen de rendement du marché marocain. Ils ne constituent pas des garanties de gains futurs. Les rendements de bourse, de l’or ou de l’immobilier peuvent fluctuer.'
      : 'Had l-arqam ghir ta9ribiya d-ryadiyat o l-fayda l-morakkaba. Machi dmanat 100% dyal l-arbaj d l-moustaqbal. Souq, l-or o l-aqar i9drou i-tbdlo.',
    onboardingTitle: language === 'fr' ? '🎯 Configure ton Plan de Vie Financier' : '🎯 Qadd l-Plan d-Moustaqbal dyalk',
    onboardingSubtitle: language === 'fr'
      ? 'Pour simuler vos 40 prochaines années de vie financière au Maroc, Sidi a besoin de quelques informations de départ.'
      : 'Bach Sidi i-dir lik t-ta9dir dyal 40 3am d l-flouss f l-Maroc, bdel had l-arqam dyal l-bdaya.',
    onboardingSubmit: language === 'fr' ? 'Générer mon plan de vie long terme' : 'Chouf l-Plan d l-Moustaqbal dyal floussi',
    currentNetWorthLabel: language === 'fr' ? 'Patrimoine de départ réel' : 'Patrimoine dyal l-bdaya l-7aqiqi',
    projectionTitle: language === 'fr' ? 'Courbe d’Évolution du Patrimoine' : 'Khatt d l-Patrimoine dyalk',
    projectionSubtitle: language === 'fr' 
      ? 'Utilise le curseur interactif ci-dessous pour explorer l’évolution de ton épargne cumulée.' 
      : 'Khdem b l-curseur li l-teht bach t-chouf chhal gha t-koun jm3ti mn flouss.',
    interactiveTracker: language === 'fr' ? 'Analyse Interactive d’Étape' : 'T-tobo3 d l-Marahil Interactive',
    contributed: language === 'fr' ? 'Versements (Épargne cumulée)' : 'Koulchi l-flouss li dkhalti',
    interest: language === 'fr' ? 'Intérêts générés (Plus-value)' : 'L-arba7 d l-fayda morakkaba',
    retirementHeader: language === 'fr' ? 'Analyse & Simulation Retraite 🏖️' : 'Retraite o l-Madkhoul dyal l-kbourya 🏖️',
    retirementSubtitle: language === 'fr'
      ? 'Estimation croisée de ta pension légale CNSS et des revenus générés par ton capital d’épargne.'
      : 'Taqdir dyal retraite CNSS o l-flouss li kat-khrej mn sandoq d-iddikhar dyalk.',
    pensionCNSS: language === 'fr' ? 'Pension CNSS Maroc (Estimée)' : 'Retraite CNSS (Taqribiya)',
    pensionCNSSDesc: language === 'fr' ? 'Calculée selon le barème officiel (salaire de référence plafonné à 6 000 DH/mois).' : 'Hissab m3a l-qanoun d l-CNSS (Oujra l-max f l-calcul hiya 6 000 DH).',
    savingsIncome: language === 'fr' ? 'Revenu d’Épargne (Règle des 4%)' : 'Revenu mn l-iddikhar (Règle 4%)',
    savingsIncomeDesc: language === 'fr' ? 'Retrait mensuel pérenne sans entamer le capital d’origine dans des conditions de marché normales.' : 'Kharaj d chhar bla ma t-9ess ras l-mal s-s7i7.',
    totalRetirementIncome: language === 'fr' ? 'Revenu Mensuel Total Projeté' : 'Koulchi Madkhoul d-Chhar f l-Retraite',
    premiumSectionTitle: language === 'fr' ? 'Sidi AI — Conseil & Optimisation Patrimoine' : 'Sidi AI — Nassa\'ih o t-Stifada d-Patrimoine',
    premiumSectionSubtitle: language === 'fr'
      ? 'Bénéficiez d’une étude personnalisée par notre IA pour restructurer vos dettes, maximiser vos niches fiscales d’épargne retraite (ex: Assurance Retraite active) et booster vos rendements.'
      : 'Stafed mn d-da3m d Sidi AI bach t-naqass d-dyoun, t-stafed mn d-dariba d l-Maroc o t-rabah ktar.',
    recalculatePrompt: language === 'fr' ? 'Ajuster les hypothèses' : 'Bdel l-arqam dyal l-hsab',
  };

  // Onboarding view if not initialized
  if (!initialized) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 pb-24 font-sans" id="life-plan-onboarding">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-md space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Compass size={24} className="animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight">
                  {t.onboardingTitle}
                </h1>
                <p className="text-xs text-slate-500 font-bold leading-normal">
                  {t.onboardingSubtitle}
                </p>
              </div>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Real Patrimoine de depart read-only */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 sm:col-span-2">
                  <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">
                    {t.currentNetWorthLabel} (connecté)
                  </span>
                  <span className="text-lg font-black text-slate-800 font-mono">
                    {formatCurrency(currentNetWorth)}
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">
                    {language === 'fr' 
                      ? "Floussi utilise ton patrimoine actuel issu de ton tableau de bord Patrimoine Net comme capital de départ pour l’intérêt composé."
                      : "Floussi kay-khdem b l-patrimoine dyalk d l-bdaya li derti f l-Net Worth rasmiyan."}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    {language === 'fr' ? 'Âge Actuel' : 'L-3mar dyalk db'}
                  </label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="90"
                    value={formCurrentAge}
                    onChange={(e) => setFormCurrentAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    {language === 'fr' ? 'Âge de Retraite Souhaité' : 'L-3mar d-retraite li baghi'}
                  </label>
                  <input
                    type="number"
                    required
                    min={formCurrentAge + 1}
                    max="100"
                    value={formRetirementAge}
                    onChange={(e) => setFormRetirementAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    {language === 'fr' ? 'Années de Cotisation CNSS' : '3wam dyal CNSS li khdmti'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="50"
                    value={formCnssYears}
                    onChange={(e) => setFormCnssYears(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    {language === 'fr' ? 'Salaire de Référence Moyen' : 'Oujra d-chhar l-moyen'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formMonthlySalary}
                    onChange={(e) => setFormMonthlySalary(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    {language === 'fr' ? 'Épargne nette mensuelle estimée (DH)' : 'L-iddikhar dyal chhar (DH)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formMonthlySavings}
                    onChange={(e) => setFormMonthlySavings(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
                  />
                </div>

              </div>

              <button
                type="submit"
                className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{t.onboardingSubmit}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          {/* High visibility warning */}
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl space-y-2">
            <h4 className="text-xs font-black text-amber-800 flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>{t.indicativeWarningTitle}</span>
            </h4>
            <p className="text-[10px] text-amber-900 font-bold leading-relaxed uppercase">
              {t.indicativeWarningBody}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 pb-24 font-sans" id="life-plan-page">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* TOP BANNER */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-3xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 flex items-center gap-1.5">
              <Compass className="animate-spin" style={{ animationDuration: '20s' }} size={13} />
              <span>Vision Maroc 2050 / Planification Long Terme</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
              <span>{t.title}</span>
              <span className="text-indigo-600">🏖️</span>
            </h1>
            <p className="text-xs text-slate-500 font-bold max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <button
            onClick={() => setInitialized(false)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all active:scale-95 shrink-0 self-start md:self-center border border-slate-200"
          >
            <Sliders size={13} />
            <span>{t.recalculatePrompt}</span>
          </button>
        </div>

        {/* HIGH-VISIBILITY WARNING (MANDATORY REQUIREMENT) */}
        <div className="bg-amber-50 border border-amber-200/80 p-5 rounded-3xl space-y-2" id="life-plan-warning">
          <h4 className="text-xs font-black text-amber-800 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>{t.indicativeWarningTitle}</span>
          </h4>
          <p className="text-[10px] text-amber-900 font-bold leading-relaxed uppercase">
            {t.indicativeWarningBody}
          </p>
        </div>

        {/* MAIN PROJECTION ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main projection graph and interactive slider */}
          <div className="lg:col-span-7 bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 gap-4 flex-wrap">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span>{t.projectionTitle}</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-bold leading-normal mt-0.5">
                  {t.projectionSubtitle}
                </p>
              </div>
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                Rendement annuel: {annualGrowthRate}%
              </div>
            </div>

            {/* Recharts Area with visual gradients */}
            <div className="h-64 w-full" id="recharts-projection-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={projections.slice(0, 31)} // First 30 years
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                    fontSize={10}
                    fontWeight={700}
                    tickFormatter={(year) => `${year} ${language === 'fr' ? 'ans' : '3am'}`}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                    fontSize={10}
                    fontWeight={700}
                    tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${val/1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value)), language === 'fr' ? 'Patrimoine Net' : 'L-Patrimoine']}
                    labelFormatter={(label) => `${language === 'fr' ? 'Année' : 'L-3am'} : ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="projectedNetWorth"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorNetWorth)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Tactile Slider Selector */}
            <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                <span>{language === 'fr' ? 'Aujourd’hui (Ans 0)' : 'L-Youm (0 3am)'}</span>
                <span className="text-emerald-600 font-extrabold text-xs">
                  {language === 'fr' ? `Horizon de projection` : `Moudat l-moukhtat`} : +{selectedYear} {language === 'fr' ? 'ans' : 'snin'}
                </span>
                <span>{language === 'fr' ? 'Année 30' : '30 3am'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          {/* Interactive Stage Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={15} className="text-indigo-600" />
                <span>{t.interactiveTracker}</span>
              </h3>

              <div className="space-y-4">
                {/* Year and Age display */}
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[8px] uppercase font-black text-slate-400 block tracking-widest">{language === 'fr' ? 'Année civile' : 'L-3am'}</span>
                    <span className="text-base font-black text-slate-700 font-mono">{currentYearCalendar}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase font-black text-slate-400 block tracking-widest">{language === 'fr' ? 'Ton âge projeté' : 'L-3mar dyalk'}</span>
                    <span className="text-base font-black text-slate-700 font-mono">{selectedAge} {language === 'fr' ? 'ans' : '3am'}</span>
                  </div>
                </div>

                {/* Big Net Worth Projection */}
                <div className="bg-emerald-950 text-white rounded-3xl p-5 relative overflow-hidden shadow-xs">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[9px] uppercase font-black tracking-widest text-emerald-300 block mb-1">
                    {language === 'fr' ? 'Patrimoine Net Estimé' : 'L-Patrimoine l-Mat9adar'}
                  </span>
                  <span className="text-2xl font-black font-mono block leading-none">
                    {formatCurrency(selectedProj.projectedNetWorth)}
                  </span>
                </div>

                {/* Contribution details */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5">
                    <span className="text-[8px] uppercase font-black text-slate-400 block mb-1 leading-none">{t.contributed}</span>
                    <span className="text-xs font-black font-mono text-slate-700 block">
                      {formatCurrency(selectedProj.totalContributed)}
                    </span>
                  </div>
                  <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5">
                    <span className="text-[8px] uppercase font-black text-slate-400 block mb-1 leading-none">{t.interest}</span>
                    <span className="text-xs font-black font-mono text-emerald-600 block">
                      +{formatCurrency(selectedProj.totalInterest)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-3 flex gap-2">
                  <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 font-bold leading-normal">
                    {language === 'fr' 
                      ? `En plaçant ton capital, les gains d’intérêts cumulés représentent déjà ${Math.round((selectedProj.totalInterest / Math.max(1, selectedProj.projectedNetWorth)) * 100)}% de ton patrimoine net global à cette étape.`
                      : `F had l-marhala, l-arba7 d l-fayda kat-mettel ${Math.round((selectedProj.totalInterest / Math.max(1, selectedProj.projectedNetWorth)) * 100)}% mn koulchi l-flouss dyalk.`}
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* COMPARATIVE SCENARIOS CHART & EDIT ASSUMPTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-7">
            <ScenarioComparisonChart
              chartData={comparisonChartData}
              scenarios={comparisonScenarios}
              language={language}
            />
          </div>

          <div className="lg:col-span-5">
            <AssumptionsEditor
              assumptions={assumptions}
              onUpdate={updateAssumptions}
              onReset={resetAssumptions}
              language={language}
            />
          </div>

        </div>

        {/* RETIREMENT SUMMARY & WARNINGS */}
        {retirementDetails && (
          <div 
            className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs space-y-6"
            id="retirement-summary-card"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <PiggyBank size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  {t.retirementHeader}
                </h3>
                <p className="text-[11px] text-slate-500 font-bold leading-normal mt-0.5">
                  {t.retirementSubtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CNSS Pension Detail */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {t.pensionCNSS}
                  </span>
                  <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    Taux: {retirementDetails.pensionRatePercent}%
                  </span>
                </div>
                <span className="text-xl font-black font-mono text-slate-700 block">
                  {formatCurrency(retirementDetails.estimatedMonthlyPensionCNSS)} / mois
                </span>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  {t.pensionCNSSDesc}
                </p>
              </div>

              {/* Savings Withdrawal Detail */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {t.savingsIncome}
                  </span>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Règle: 4%
                  </span>
                </div>
                <span className="text-xl font-black font-mono text-emerald-600 block">
                  {formatCurrency(retirementDetails.estimatedMonthlyFromSavings)} / mois
                </span>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  {t.savingsIncomeDesc}
                </p>
              </div>

              {/* Combined Total */}
              <div className="border border-indigo-150 rounded-2xl p-5 bg-indigo-950 text-white space-y-2 flex flex-col justify-center relative overflow-hidden shadow-xs">
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-lg pointer-events-none" />
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest block">
                  {t.totalRetirementIncome}
                </span>
                <span className="text-2xl font-black font-mono block leading-none">
                  {formatCurrency(retirementDetails.totalMonthlyRetirementIncome)} / mois
                </span>
                <p className="text-[10px] text-indigo-200/75 font-semibold mt-1">
                  {language === 'fr'
                    ? `Visé à l’âge de ${assumptions.retirementAge} ans, basé sur ton profil d’iddikhar actuel.`
                    : `F l-3mar d ${assumptions.retirementAge} 3am, m3as l-plan dyal ddhoul d-iddikhar.`}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* LIFE TIMELINE (MILESTONES) */}
        <LifeMilestoneTimeline
          milestones={milestones}
          language={language}
        />

        {/* ADVANCED RECOMMENDATIONS WITH PLANGATE FOR ANALYSE+/ELITE */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                {t.premiumSectionTitle}
              </h3>
              <p className="text-[11px] text-slate-500 font-bold leading-normal mt-0.5">
                {t.premiumSectionSubtitle}
              </p>
            </div>
          </div>

          <PlanGate requiredTier="analyse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-emerald-50/10 rounded-2xl border border-emerald-100" id="premium-advice-box">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block">
                  Analyse d'Assurance Retraite & Optimisation d'Impôt IGR
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {language === 'fr'
                    ? "Au Maroc, l'Assurance Épargne Retraite souscrite auprès des compagnies d'assurance marocaines permet d'en déduire intégralement les primes de l'assiette de l'Impôt sur le Revenu (IGR) sans aucun plafond si tu es salarié (Art. 28 du CGI). Cela te permet de récupérer instantanément jusqu'à 38% du montant épargné sous forme de réduction d'impôt annuelle."
                    : "F l-Maroc, l'Assurance Épargne Retraite kat-khalik t-naqas l-impôt IGR dima (Art. 28 CGI). Kat-raj3 lik t-tal l-38% mn l-iddikhar dyalk f t-takhfiss driba d chhar."}
                </p>
                <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-xs font-bold space-y-1.5">
                  <div className="flex justify-between font-mono text-[10px] text-emerald-300">
                    <span>Niche fiscale marocaine :</span>
                    <span>Art. 28 CGI</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gain annuel estimé pour votre tranche :</span>
                    <span className="font-mono text-emerald-300 font-black">+{Math.round(assumptions.averageMonthlySalary * 0.12 * 0.30).toLocaleString()} DH / an</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block">
                  Recommandation Sidi AI pour ton Patrimoine Net
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {language === 'fr'
                    ? "Ton ratio d'endettement actuel et tes placements imposent de restructurer d’ici 5 ans. Ton Dacia Sandero Stepway perd de la valeur (-12%/an) tandis que ton appartement Sidi Maarouf s'apprécie (+3.5%/an). Nous te recommandons de verser une épargne forcée de 1 500 DH/mois supplémentaire directement sur un OPCVM actions marocain (fonds mutuels de type diversifié) plutôt que de rembourser par anticipation ton crédit immobilier à 4.25%."
                    : "L-flouss dyal Tomobil kat-naqas (-12%/an) o d-dar dyal Sidi Maarouf kat-ziid (+3.5%/an). Sidi AI kay-nshak t-dir 1 500 DH f chhar f OPCVM actions f blasa ma t-khallas l-crédit d-sakan b-zerba."}
                </p>
                <div className="flex gap-2 text-emerald-700">
                  <CheckCircle size={14} className="shrink-0 mt-0.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Plan d’action d’investissement à long terme validé par Sidi</span>
                </div>
              </div>
            </div>
          </PlanGate>

        </div>

      </div>
    </div>
  );
}
