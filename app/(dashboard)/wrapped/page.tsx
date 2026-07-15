"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useWrapped } from '../../../hooks/use-wrapped';
import { WrappedSlideViewer } from '../../../components/wrapped/WrappedSlideViewer';
import { FLOUSSI_THEMES } from '../../../lib/themes';
import { 
  Sparkles, Calendar, TrendingUp, TrendingDown, 
  Flame, Award, Target, ShoppingBag, ArrowUpRight, Check, Play 
} from 'lucide-react';

export default function WrappedPage() {
  const { user, profile } = useAuth();
  const userId = user?.id || '';
  const language = profile?.preferred_language || 'fr';
  const [themeId, setThemeId] = useState('default');

  useEffect(() => {
    if (!userId) return;
    const active = localStorage.getItem(`floussi_active_theme_${userId}`) || localStorage.getItem('floussi_active_theme') || 'default';
    setThemeId(active);
  }, [userId]);

  // Hook for wrapped data
  const { 
    stats, 
    selectedYear, 
    setSelectedYear, 
    availableYears, 
    generateImages, 
    loading 
  } = useWrapped(userId);

  const [slides, setSlides] = useState<string[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Handle starting story viewer
  const handleStartStory = async () => {
    if (!stats) return;
    setGenerating(true);
    setIsViewerOpen(true);
    try {
      const generatedSlides = await generateImages(themeId, language as 'fr' | 'darija');
      setSlides(generatedSlides);
    } catch (err) {
      console.error('[Wrapped] Failed to generate slides:', err);
    } finally {
      setGenerating(false);
    }
  };

  const t = {
    title: language === 'fr' ? 'Mon Floussi Wrapped' : 'Floussi Wrapped dyali',
    subtitle: language === 'fr' 
      ? 'La rétrospective personnalisée de vos habitudes financières.' 
      : 'Khlassa kamla d l-mou3amalat o l-iddikhar dyalek.',
    yearSelector: language === 'fr' ? 'Sélectionner l\'année' : 'Khtar l-3am',
    launchCta: language === 'fr' ? 'Lancer la Story interactive' : 'Khdem s-story d l-bilan',
    statsOverview: language === 'fr' ? 'Aperçu de mes chiffres' : 'Khlassa d l-ar9am dyali',
    saved: language === 'fr' ? 'Épargne nette' : 'Tawfir Safi',
    spent: language === 'fr' ? 'Dépenses totales' : 'Masarif kamla',
    income: language === 'fr' ? 'Revenus totaux' : 'Madkhoul kamel',
    bestMonth: language === 'fr' ? 'Meilleur mois' : '7sen chhar',
    worstMonth: language === 'fr' ? 'Mois de dérapage' : 'Chhar d s-srf bzaf',
    streak: language === 'fr' ? 'Discipline (Streak)' : 'L-indibat (Streak)',
    ocrScans: language === 'fr' ? 'Tickets scannés' : 'Tickets mseyline',
    tontines: language === 'fr' ? 'Tontines complétées' : 'Daret mkmela',
    goals: language === 'fr' ? 'Projets accomplis' : 'Ahdaf mkmela',
    topCategory: language === 'fr' ? 'Catégorie principale' : 'L-masrouf l-awwal',
    ofTotal: language === 'fr' ? 'du budget dépensé' : 'mn l-budget d l-masarif',
    badge: language === 'fr' ? 'Titre de l\'année' : 'Xara d l-3am',
    viewDetails: language === 'fr' ? 'Voir ma story' : 'Chouf s-story dyali',
    generatingText: language === 'fr' ? 'Sidi Floussi prépare vos slides...' : 'Sidi Floussi kay-7seb l-bilan...'
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-1 font-sans text-slate-800 pb-12">
      
      {/* Header and Year selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-150 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 text-slate-900">
            <Sparkles className="text-emerald-500 animate-pulse" size={32} />
            <span>{t.title}</span>
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            {t.subtitle}
          </p>
        </div>

        {/* Selector */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
            {t.yearSelector} :
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === 'glissant' ? 'glissant' : parseInt(e.target.value, 10))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="glissant">Last 12 Months (Glissant)</option>
            {availableYears.map(yr => (
              <option key={yr} value={yr}>
                Année {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Story Callout */}
      {stats && (
        <div className="bg-radial from-slate-900 via-slate-950 to-black text-white p-8 md:p-10 rounded-3xl relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl -mr-24 -mt-24"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl -ml-24 -mb-24"></div>

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-3 max-w-lg">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[10px] font-black text-emerald-400 border border-slate-700/50 uppercase tracking-widest">
                <Calendar size={11} />
                {selectedYear === 'glissant' ? '12 mois glissants' : `Bilan ${selectedYear}`}
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                {language === 'fr' ? 'Votre Story Interactive Floussi' : 'Story Interactive d l-Bilan dyalek'}
              </h2>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                {language === 'fr' 
                  ? 'Plongez dans une expérience immersive digne de Spotify Wrapped, découvrez vos statistiques insolites et partagez votre réussite sur vos réseaux.' 
                  : 'Chouf tawfir w l-indibat d l-flouss dyalek b tariqa moutslyil d Instagram o charekha m3a s7abek.'}
              </p>
            </div>

            <button
              onClick={handleStartStory}
              className="px-6 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-lg flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
              id="btn-launch-wrapped-story"
            >
              <Play size={14} fill="currentColor" />
              <span>{t.launchCta.toUpperCase()}</span>
            </button>
          </div>
        </div>
      )}

      {/* Bento Grid Analytics */}
      {stats && (
        <div className="space-y-6">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest pl-1">
            {t.statsOverview}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1: Main Financial Balances */}
            <div className="bg-white p-6 rounded-3xl border border-slate-150/80 shadow-xs md:col-span-2 flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Compte de Résultat</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={16} /></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.saved}</span>
                  <p className="text-3xl font-black text-emerald-600 leading-none">
                    {stats.totalSaved.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400">DH</span>
                  </p>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                    Taux d'épargne : {stats.totalIncome > 0 ? Math.round((stats.totalSaved / stats.totalIncome) * 100) : 0}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.spent}</span>
                  <p className="text-2xl font-extrabold text-slate-800 leading-none">
                    {stats.totalSpent.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400">DH</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.income}</span>
                  <p className="text-2xl font-extrabold text-slate-800 leading-none">
                    {stats.totalIncome.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400">DH</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Personality Title */}
            <div className="bg-gradient-to-tr from-emerald-600 to-emerald-800 text-white p-6 rounded-3xl shadow-md flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">{t.badge}</span>
                <span className="p-2 bg-white/10 text-white rounded-xl"><Award size={16} /></span>
              </div>

              <div className="space-y-1 py-4">
                <h4 className="text-xl font-black tracking-tight leading-tight">
                  {language === 'fr' ? stats.personalityBadgeFr : stats.personalityBadgeDarija}
                </h4>
                <p className="text-[10px] text-emerald-200 font-bold leading-normal">
                  {language === 'fr' 
                    ? 'Déterminé selon votre régularité de saisie, vos ratios de dépenses du weekend et votre taux de mise de côté.'
                    : 'M7sed b l-indibat d l-kitaba d s-srf dyalek w t-tawfir dialek.'}
                </p>
              </div>
            </div>

            {/* Bento Card 3: Best and Worst Month */}
            <div className="bg-white p-6 rounded-3xl border border-slate-150/80 shadow-xs grid grid-cols-2 gap-4">
              <div className="border-r border-slate-100 pr-2 space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t.bestMonth}</span>
                <h5 className="text-lg font-black text-slate-900">{stats.bestMonth.month}</h5>
                <p className="text-xs font-extrabold text-emerald-600">+{stats.bestMonth.savedAmount.toLocaleString('fr-FR')} DH</p>
              </div>

              <div className="pl-2 space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t.worstMonth}</span>
                <h5 className="text-lg font-black text-slate-900">{stats.worstMonth.month}</h5>
                <p className="text-xs font-extrabold text-rose-500 overflow-hidden text-ellipsis whitespace-nowrap" title={stats.worstMonth.overspentBucket}>
                  {stats.worstMonth.overspentBucket}
                </p>
              </div>
            </div>

            {/* Bento Card 4: Top expense Category */}
            <div className="bg-white p-6 rounded-3xl border border-slate-150/80 shadow-xs flex items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t.topCategory}</span>
                <h4 className="text-2xl font-black text-slate-950 uppercase leading-none">{stats.topCategory.name}</h4>
                <p className="text-xs font-semibold text-slate-500 leading-normal">
                  {stats.topCategory.percentOfTotal}% {t.ofTotal}
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl flex-shrink-0">
                <ShoppingBag size={24} />
              </div>
            </div>

            {/* Bento Card 5: Daily logs and streak */}
            <div className="bg-white p-6 rounded-3xl border border-slate-150/80 shadow-xs flex items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t.streak}</span>
                <h4 className="text-2xl font-black text-slate-950 leading-none">{stats.longestStreak} Jours</h4>
                <p className="text-xs font-semibold text-slate-500 leading-normal">
                  {stats.totalTransactionsLogged} transactions saisies.
                </p>
              </div>
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl flex-shrink-0">
                <Flame size={24} className="animate-pulse" />
              </div>
            </div>

            {/* Bento Card 6: Gamification milestones */}
            <div className="bg-white p-6 rounded-3xl border border-slate-150/80 shadow-xs md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Scans OCR</span>
                <p className="text-xl font-extrabold text-slate-800">{stats.ocrReceiptsScanned}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tontines</span>
                <p className="text-xl font-extrabold text-slate-800">{stats.tontinesCompleted}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Objectifs</span>
                <p className="text-xl font-extrabold text-slate-800">{stats.goalsCompleted.length}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Année</span>
                <p className="text-xl font-extrabold text-slate-800">{stats.year}</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Slide Viewer popup overlays */}
      <WrappedSlideViewer
        isOpen={isViewerOpen}
        slides={slides}
        onClose={() => setIsViewerOpen(false)}
        loading={generating}
        language={language as 'fr' | 'darija'}
      />

    </div>
  );
}
