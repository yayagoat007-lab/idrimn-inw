"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useTranslation } from '../../../hooks/use-translation';
import { useWeeklyCoaching, getLastCompletedWeekMonday } from '../../../hooks/use-weekly-coaching';
import { useMonthlyReview } from '../../../hooks/use-monthly-review';
import { useOptimizationChallenges } from '../../../hooks/use-optimization-challenges';
import { WeeklyReportCard } from '../../../components/coaching/WeeklyReportCard';
import { WeeklyReportHistory } from '../../../components/coaching/WeeklyReportHistory';
import { MonthlyReviewSession } from '../../../components/coaching/MonthlyReviewSession';
import { OptimizationChallengeCard } from '../../../components/coaching/OptimizationChallengeCard';
import { ChallengeAcceptModal } from '../../../components/coaching/ChallengeAcceptModal';
import { ChallengeResultCelebration } from '../../../components/coaching/ChallengeResultCelebration';
import { PlanGate } from '../../../components/shared/PlanGate';
import { WeeklyReport } from '../../../lib/weekly-coaching-report';
import { OptimizationSuggestion } from '../../../lib/optimization-suggestions';
import { 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  Compass, 
  HelpCircle,
  Calendar,
  AlertCircle,
  TrendingUp,
  Award,
  ChevronRight,
  MessageSquareCode,
  Bookmark,
  Target,
  Trophy,
  History,
  Info
} from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

export default function CoachingPage() {
  const { user, profile } = useAuth();
  const { lang } = useTranslation();
  const isDarija = lang === 'darija';
  
  const userId = user?.id || "mock-user-id-9999";
  
  // Weekly reports logic
  const { 
    currentReport: latestReport, 
    previousReports, 
    isLoading: isWeeklyLoading, 
    generateNow: generateWeeklyReport 
  } = useWeeklyCoaching(userId);

  // Monthly reviews logic
  const {
    currentMonthReview,
    isReviewing,
    isLoading: isMonthlyLoading,
    startGuidedReview,
    stopGuidedReview,
    submitFeedback,
    triggerGeneration: generateMonthlyReview
  } = useMonthlyReview(userId);

  // Optimization challenges logic
  const {
    availableSuggestions,
    activeChallenges,
    challengeHistory,
    justSucceededChallenge,
    isLoading: isChallengesLoading,
    acceptChallenge,
    abandonChallenge,
    clearCelebration
  } = useOptimizationChallenges(userId);

  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'challenges'>('weekly');
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [selectedSuggestionForChallenge, setSelectedSuggestionForChallenge] = useState<OptimizationSuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSuccessMessage, setGenSuccessMessage] = useState<string | null>(null);

  // Sync selected report with latest report on load or when latest changes
  useEffect(() => {
    if (latestReport && !selectedReport) {
      setSelectedReport(latestReport);
    }
  }, [latestReport, selectedReport]);

  const handleSelectReport = (report: WeeklyReport) => {
    setSelectedReport(report);
  };

  const handleForceGenerateWeekly = async () => {
    setIsGenerating(true);
    setGenSuccessMessage(null);
    try {
      const targetMonday = getLastCompletedWeekMonday();
      const newReport = await generateWeeklyReport(targetMonday);
      if (newReport) {
        setSelectedReport(newReport);
        setGenSuccessMessage(
          isDarija 
            ? "T-Taqrir t-skowen b naja7!" 
            : "Le rapport hebdomadaire a été recalculé et généré !"
        );
        setTimeout(() => setGenSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error("Manual weekly generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleForceGenerateMonthly = async () => {
    setIsGenerating(true);
    setGenSuccessMessage(null);
    try {
      // Find previous month string (e.g. 2026-06)
      const now = new Date();
      let prevMonth = now.getMonth();
      let prevYear = now.getFullYear();
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
      }
      const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
      
      const newReview = await generateMonthlyReview(prevMonthStr);
      if (newReview) {
        setGenSuccessMessage(
          isDarija 
            ? "Bilaan d chhar t-soweb b naja7!" 
            : "Le bilan mensuel de Sidi Floussi a été recalculé avec succès !"
        );
        setTimeout(() => setGenSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error("Manual monthly generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const activeReportToShow = selectedReport || latestReport;
  const showLoading = isWeeklyLoading || isMonthlyLoading;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Compass className="text-amber-500 w-5 h-5 animate-pulse" />
            <span>{isDarija ? "Markaz d l-Kouching d l-Mali" : "Hub d'Accompagnement & Coaching"}</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1">
            {isDarija 
              ? "Nasayih mowajjaha o taqarir d l-coaching khassa bik bach t-hsen s-Skour Floussi dyalk."
              : "Bilan hebdomadaire, rendez-vous mensuel guidé avec Sidi, et alertes personnalisées."}
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Analyse & Elite design pattern) */}
      <div className="flex border-b border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`pb-3 px-4 text-xs font-black tracking-wide uppercase border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'weekly' 
              ? 'border-slate-800 text-slate-800' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {isDarija ? "T-Taqrir d l'Osimana" : "Rapports Hebdomadaires"}
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`pb-3 px-4 text-xs font-black tracking-wide uppercase border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'monthly' 
              ? 'border-slate-800 text-slate-800' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {isDarija ? "Bilaan d Chhar d Sidi" : "Rendez-vous Mensuel de Sidi"}
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`pb-3 px-4 text-xs font-black tracking-wide uppercase border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'challenges' 
              ? 'border-slate-800 text-slate-800' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {isDarija ? "Tahaddiat d l-Mizaniya" : "Défis de Budget IA"}
        </button>
      </div>

      {/* PlanGate wraps premium content */}
      <PlanGate requiredTier="analyse">
        <div className="space-y-6">
          {/* Action and Alert Notifications */}
          {genSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>{genSuccessMessage}</span>
            </div>
          )}

          {/* TAB 1: WEEKLY COACHING */}
          {activeTab === 'weekly' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Weekly Report Column */}
              <div className="lg:col-span-2 space-y-6">
                {showLoading && !activeReportToShow ? (
                  /* Skeleton Loader */
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-pulse">
                    <div className="h-8 bg-slate-100 rounded-lg w-1/3"></div>
                    <div className="h-24 bg-slate-50 rounded-2xl"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-20 bg-slate-100 rounded-xl"></div>
                      <div className="h-20 bg-slate-100 rounded-xl"></div>
                      <div className="h-20 bg-slate-100 rounded-xl"></div>
                    </div>
                    <div className="h-32 bg-slate-100 rounded-2xl"></div>
                  </div>
                ) : activeReportToShow ? (
                  <WeeklyReportCard 
                    report={activeReportToShow} 
                    language={lang as 'fr' | 'darija'} 
                  />
                ) : (
                  /* Empty state when eligible but no data exists yet */
                  <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-xs flex flex-col items-center justify-center space-y-4 py-16">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800">
                      {isDarija ? "Makan hta chi taqrir" : "Aucun rapport généré"}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold max-w-sm leading-relaxed">
                      {isDarija 
                        ? "Nta 3ndek l-haq f l-coaching! Drb l-bouton l-te7t bach t-soweb t-taqrir l-wel dyalk had l'osimana."
                        : "Vous êtes éligible au coaching personnalisé ! Cliquez sur le bouton ci-dessous pour lancer l'analyse de votre première semaine."}
                    </p>
                    <button
                      onClick={handleForceGenerateWeekly}
                      disabled={isGenerating}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 text-xs font-black tracking-wide transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      <span>{isDarija ? "Soweb Taqrir l-An" : "Générer mon rapport maintenant"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar Controls & History */}
              <div className="space-y-6">
                {/* Force Recalculate Controls */}
                {activeReportToShow && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                        {isDarija ? "Control d l-Taqarir" : "Contrôle du Coaching"}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-semibold mt-1">
                        {isDarija 
                          ? "Recalculer t-taqrir dyal l'osimana l-fatet b t-transactions jdad."
                          : "Forcez la mise à jour des calculs de votre rapport avec vos dernières saisies."}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleForceGenerateWeekly}
                      disabled={isGenerating}
                      className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <RefreshCw className={`w-4 h-4 text-slate-500 ${isGenerating ? 'animate-spin' : ''}`} />
                      <span>{isGenerating ? (isDarija ? "Kanjm3o..." : "Recalcul...") : (isDarija ? "3awed Hsseb t-Taqrir" : "Recalculer le rapport")}</span>
                    </button>
                  </div>
                )}

                {/* Weekly History List */}
                <WeeklyReportHistory 
                  reports={previousReports}
                  onSelectReport={handleSelectReport}
                  activeReportId={activeReportToShow?.id}
                  language={lang as 'fr' | 'darija'}
                />
              </div>
            </div>
          )}

          {/* TAB 2: MONTHLY GUIDED REVIEW */}
          {activeTab === 'monthly' && (
            <div className="space-y-6">
              {showLoading && !currentMonthReview ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center animate-pulse">
                  <div className="h-6 bg-slate-100 w-1/4 rounded mx-auto mb-4"></div>
                  <div className="h-20 bg-slate-50 rounded-2xl"></div>
                </div>
              ) : currentMonthReview ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto space-y-6">
                  {/* Monthly Summary Intro card */}
                  <div className="flex items-center gap-4 border-b border-slate-50 pb-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-800 tracking-tight">
                        {isDarija ? `Bilaan d chhar d ${currentMonthReview.monthName}` : `Bilan Mensuel de ${currentMonthReview.monthName}`}
                      </h2>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        {isDarija ? "Rendez-vous dyalek m3a Sidi d l-mizaniya d chhar kmlat." : "Votre séance de coaching mensuel interactive avec Sidi Floussi."}
                      </p>
                    </div>
                  </div>

                  {/* Summary Indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Dépenses</span>
                      <span className="text-sm font-black text-slate-800 block mt-1">{formatCurrency(currentMonthReview.moneyFlowChapter.totalSpent)}</span>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Épargne</span>
                      <span className="text-sm font-black text-slate-800 block mt-1">{formatCurrency(currentMonthReview.moneyFlowChapter.totalSaved)}</span>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Taux</span>
                      <span className="text-sm font-black text-emerald-600 block mt-1">{currentMonthReview.moneyFlowChapter.savingsRate}%</span>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Points</span>
                      <span className="text-sm font-black text-slate-800 block mt-1">{currentMonthReview.scoreChapter.scoreDiff >= 0 ? `+${currentMonthReview.scoreChapter.scoreDiff}` : `${currentMonthReview.scoreChapter.scoreDiff}`} PTS</span>
                    </div>
                  </div>

                  {/* Saved User Priority Choice (Continuity verification) */}
                  {currentMonthReview.feedbackResponse && (
                    <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                      <Bookmark className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[10px] font-black text-amber-800 tracking-wide uppercase">
                          {isDarija ? "L-Hadaf dyalek d l-Chhar l-Majya" : "Votre Priorité du Mois Prochain"}
                        </h4>
                        <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
                          {currentMonthReview.feedbackResponse}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Launch button */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={startGuidedReview}
                      className="flex-grow bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 px-6 text-xs font-black tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <MessageSquareCode className="w-4 h-4 text-slate-200" />
                      <span>{isDarija ? "Bda l-Mouchawara l-Iftiradiya" : "Lancer le Rendez-vous Mensuel"}</span>
                    </button>

                    <button
                      onClick={handleForceGenerateMonthly}
                      disabled={isGenerating}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl py-3 px-5 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 text-slate-500 ${isGenerating ? 'animate-spin' : ''}`} />
                      <span>{isGenerating ? (isDarija ? "Kanjm3o..." : "Calcul...") : (isDarija ? "3awed Hsseb" : "Recalculer")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty state when no monthly review exists yet */
                <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-xs flex flex-col items-center justify-center space-y-4 py-16 max-w-lg mx-auto">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800">
                    {isDarija ? "Makan hta chi Bilaan" : "Bilan mensuel indisponible"}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold max-w-sm leading-relaxed">
                    {isDarija 
                      ? "Nta 3ndek l-haq f l-Bilaan l-mali dyal chhar! Drb l-bouton l-te7t bach t-soweb Bilaan d chhar l-fat."
                      : "Le bilan mensuel se base sur vos 4 dernières semaines d'activité. Cliquez ci-dessous pour initier l'analyse du mois écoulé."}
                  </p>
                  <button
                    onClick={handleForceGenerateMonthly}
                    disabled={isGenerating}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 text-xs font-black tracking-wide transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isDarija ? "Soweb Bilaan l-An" : "Générer mon bilan mensuel"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OPTIMIZATION CHALLENGES */}
          {activeTab === 'challenges' && (
            <div className="space-y-8">
              {/* Active Challenges Subsection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                    {isDarija ? "Tahaddiat l-Khaddama" : "Défis Actifs en Cours"}
                  </h3>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {activeChallenges.length}
                  </span>
                </div>

                {activeChallenges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeChallenges.map(challenge => (
                      <OptimizationChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onAbandon={abandonChallenge}
                        language={lang as 'fr' | 'darija'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-3 py-10">
                    <Trophy className="w-8 h-8 text-slate-300" />
                    <h4 className="text-xs font-bold text-slate-700">
                      {isDarija ? "Ma 3ndek hta chi tahaddi khaddam l-An" : "Aucun défi actif pour le moment"}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold max-w-sm">
                      {isDarija 
                        ? "Khoud chi i9tra7 d l-Baraka d Sidi l-te7t o bda l-Tahaddi dyalk d 30 yawm d-yddikhar !"
                        : "Choisissez une suggestion d'optimisation intelligente ci-dessous pour démarrer votre premier défi d'épargne !"}
                    </p>
                  </div>
                )}
              </div>

              {/* Suggestions / Available Challenges Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                    {isDarija ? "Iqtirahāt d l-Yddikhār" : "Suggestions d'Épargne Recommandées"}
                  </h3>
                </div>

                {availableSuggestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {availableSuggestions.map(suggestion => (
                      <div 
                        key={suggestion.id}
                        className="bg-white border border-slate-100 rounded-3xl p-5 hover:shadow-md hover:border-slate-200/60 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-black text-sm text-slate-800 leading-snug">
                              {suggestion.title}
                            </h4>
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-100/30 shrink-0">
                              +{formatCurrency(suggestion.potentialSaving)}/m
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                            {suggestion.description}
                          </p>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => setSelectedSuggestionForChallenge(suggestion)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-black tracking-wide cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Target className="w-4 h-4 text-amber-400" />
                            <span>{isDarija ? "N-Dewwez l-Tahaddi" : "Relever le Défi !"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50/50 p-6 rounded-2xl text-center border border-slate-100 text-xs text-slate-400 font-semibold">
                    {isDarija ? "Kemmelti ga3 iqtirahāt d Sidi !" : "Toutes les suggestions d'optimisation ont été relevées ! Félicitations !"}
                  </div>
                )}
              </div>

              {/* Historical Logs Section */}
              {challengeHistory.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-400" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                      {isDarija ? "Arshif d l-Tahaddiat" : "Historique des Défis Passés"}
                    </h3>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-semibold">
                        <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100">
                          <tr>
                            <th className="p-4">{isDarija ? "L-Tahaddi" : "Défi"}</th>
                            <th className="p-4">{isDarija ? "L-Mizaniya" : "Objectif / Réel"}</th>
                            <th className="p-4">{isDarija ? "L-Halat" : "Statut"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {challengeHistory.map(h => {
                            const isSuccess = h.status === 'succeeded';
                            const isAbandoned = h.status === 'abandoned';
                            const isFailed = h.status === 'failed';

                            const statusLabel = isSuccess 
                              ? (isDarija ? "Naja7 🎉" : "Réussi 🎉")
                              : isAbandoned 
                                ? (isDarija ? "Staslem" : "Abandonné")
                                : (isDarija ? "Khser" : "Échoué");

                            const statusColor = isSuccess 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100/40'
                              : isAbandoned 
                                ? 'bg-slate-100 text-slate-500 border-slate-200/50'
                                : 'bg-red-50 text-red-700 border-red-100/40';

                            return (
                              <tr key={h.id} className="hover:bg-slate-50/40 transition-all">
                                <td className="p-4 font-black text-slate-800">
                                  <div>{h.title}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{h.category}</div>
                                </td>
                                <td className="p-4 text-slate-600">
                                  <span>{formatCurrency(h.targetValue)}</span>
                                  <span className="text-slate-300 mx-1.5">/</span>
                                  <span className={isFailed ? 'text-red-600 font-bold' : isSuccess ? 'text-emerald-600 font-bold' : ''}>
                                    {formatCurrency(h.currentValue)}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusColor}`}>
                                    {statusLabel}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PlanGate>

      {/* Render the Immersive Fullscreen Guided Review Modal */}
      {isReviewing && currentMonthReview && (
        <MonthlyReviewSession
          review={currentMonthReview}
          onClose={stopGuidedReview}
          onSubmitFeedback={submitFeedback}
          language={lang as 'fr' | 'darija'}
        />
      )}

      {/* Challenge Acceptance Modal Popup */}
      {selectedSuggestionForChallenge && (
        <ChallengeAcceptModal
          suggestion={selectedSuggestionForChallenge}
          onClose={() => setSelectedSuggestionForChallenge(null)}
          onAccept={acceptChallenge}
          language={lang as 'fr' | 'darija'}
        />
      )}

      {/* Challenge Result Success Celebration Popup */}
      {justSucceededChallenge && (
        <ChallengeResultCelebration
          challenge={justSucceededChallenge}
          onClose={clearCelebration}
          language={lang as 'fr' | 'darija'}
        />
      )}
    </div>
  );
}
