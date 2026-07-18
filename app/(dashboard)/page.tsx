"use client";

import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useBuckets } from '../../hooks/use-buckets';
import { useTransactions } from '../../hooks/use-transactions';
import { useGoals } from '../../hooks/use-goals';
import { useMoroccanEvents } from '../../hooks/use-moroccan-events';
import { useTontine } from '../../hooks/use-tontine';
import { useOffline } from '../../hooks/use-offline';
import { useDashboardStats } from '../../hooks/use-dashboard-stats';
import { useAds } from '../../hooks/use-ads';
import { useBudgetSettings } from '../../hooks/use-budget-settings';

import { StatCard } from '../../components/dashboard/StatCard';
import { BucketCard } from '../../components/dashboard/BucketCard';
import { AlertBanner } from '../../components/dashboard/AlertBanner';
import { GoalCard } from '../../components/dashboard/GoalCard';
import { EventCard } from '../../components/dashboard/EventCard';
import { TontineMiniCard } from '../../components/dashboard/TontineMiniCard';
import { TransactionRow } from '../../components/transactions/TransactionRow';
import { AdBanner } from '../../components/ads/AdBanner';
import { SyncStatusBadge } from '../../components/shared/SyncStatusBadge';
import { PartnerOfferBanner } from '../../components/shared/PartnerOfferBanner';
import { useWrapped } from '../../hooks/use-wrapped';
import { WrappedIntroModal } from '../../components/wrapped/WrappedIntroModal';
import { DailyCheckinCard } from '../../components/checkin/DailyCheckinCard';
import { FirstGoalQuickWin } from '../../components/onboarding/FirstGoalQuickWin';
import { useFirstTransactionMoment } from '../../hooks/use-first-transaction-moment';
import { FirstTransactionCelebration } from '../../components/onboarding/FirstTransactionCelebration';
import { SetupChecklistCard } from '../../components/checklist/SetupChecklistCard';

import { useGuidedTour } from '../../hooks/use-guided-tour';
import { dashboardTourDefinition } from '../../lib/dashboard-tour-definition';
import { SpotlightOverlay } from '../../components/tour/SpotlightOverlay';
import { TourTooltip } from '../../components/tour/TourTooltip';

import { formatCurrency } from '../../lib/utils';
import { Language, getTranslation } from '../../lib/i18n';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  Layers, 
  Plus, 
  RotateCcw,
  RefreshCw,
  PiggyBank,
  Users
} from 'lucide-react';

interface DashboardPageProps {
  buckets: any[];
  transactions: any[];
  language: Language;
  onNavigate: (route: string) => void;
  onQuickAdd: () => void;
  cashRatio: number;
  userTier: string;
}

export default function DashboardPage({
  buckets: parentBuckets,
  transactions: parentTransactions,
  language,
  onNavigate,
  onQuickAdd,
  cashRatio,
  userTier
}: DashboardPageProps) {
  const { user, profile } = useAuth();
  const userId = user?.id || "mock-user-id-9999";

  // Hooks for stateful Moroccan budget features
  const { buckets, updateBucket } = useBuckets(userId);
  const { transactions, createTransaction } = useTransactions(userId);
  const { goals, contributeToGoal } = useGoals(userId);
  const { totalMonthlyIncome } = useBudgetSettings(userId);
  const { events, getDaysRemaining, getEventStatus, contributeToEvent } = useMoroccanEvents(userId);
  const { getNextCollection, payContribution } = useTontine(userId);
  const { isOnline, isSyncing, triggerSync, getSyncQueue } = useOffline();
  
  // Local state for account tab selection
  const [activeAccountTab, setActiveAccountTab] = useState<'checking' | 'savings' | 'cash' | 'total'>('total');

  // Load stats
  const stats = useDashboardStats(transactions, buckets, userTier, 0);

  // Load ads config
  const { shouldShowAds, trackImpression } = useAds();

  // Guided Tour Hook
  const tour = useGuidedTour(userId, dashboardTourDefinition);

  // First Transaction Quick Win Moment
  const { isFirstTransactionCelebration, dismissCelebration } = useFirstTransactionMoment(userId);

  // Floussi Wrapped Season check & state
  const { isWrappedSeasonActive, hasSeenThisYearWrapped, markAsSeen: markWrappedAsSeen } = useWrapped(userId);
  const [isWrappedIntroOpen, setIsWrappedIntroOpen] = useState(false);
  const [showQuickWin, setShowQuickWin] = useState(
    typeof window !== 'undefined' && localStorage.getItem('floussi_first_goal_quickwin_completed') !== 'true'
  );

  React.useEffect(() => {
    if (isWrappedSeasonActive && !hasSeenThisYearWrapped) {
      setIsWrappedIntroOpen(true);
    }
  }, [isWrappedSeasonActive, hasSeenThisYearWrapped]);

  // Handle manual tour restart from settings
  React.useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('floussi_restart_dashboard_tour') === 'true') {
      localStorage.removeItem('floussi_restart_dashboard_tour');
      tour.startTour();
    }
  }, [tour]);

  // Handle active balance display based on selected tab and trigger wallet discovery
  React.useEffect(() => {
    if (activeAccountTab !== 'total') {
      localStorage.setItem('floussi_wallet_discovered', 'true');
      window.dispatchEvent(new Event('floussi_wallet_discovered_updated'));
    }
  }, [activeAccountTab]);

  // Handle active balance display based on selected tab
  const getDisplayBalance = () => {
    switch (activeAccountTab) {
      case 'checking':
        return stats.balanceByAccount.checking;
      case 'savings':
        return stats.balanceByAccount.savings;
      case 'cash':
        return stats.balanceByAccount.cash;
      case 'total':
      default:
        return stats.balanceByAccount.total;
    }
  };

  // Quick allocation helper for buckets (+100 or +200 DH)
  const handleQuickAllocate = async (bucketId: string, amount: number) => {
    const bucket = buckets.find(b => b.id === bucketId);
    if (!bucket) return;

    const updatedAlloc = bucket.allocated_amount + amount;
    await updateBucket(bucketId, { allocated_amount: updatedAlloc });
    
    // Light vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  // Formatted daily date in French & Arabic
  // ex: "12 juillet 2026 / 27 Dhu al-Hijjah 1447"
  const getMoroccanTodayDate = () => {
    const todayFr = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());

    // Simple approximate Hijri converter or clean representation
    // 2026-07-12 is approximately 27 Dhu al-Hijjah 1447
    return `${todayFr} / ٢٧ ذو الحجة ١٤٤٧`;
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. SECTION HERO (En haut) */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Decorative mosaic pattern */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Solde Total / Par Compte with Tabs */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-emerald-300 font-extrabold uppercase tracking-wider">
                <span>{getMoroccanTodayDate()}</span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <p className="text-[11px] text-emerald-100 font-bold uppercase tracking-widest">Solde Disponible Actif</p>
              
              {/* Massive Balance Counter */}
              <h1 data-tour-id="solde" className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none animate-fadeIn">
                {formatCurrency(getDisplayBalance())}
              </h1>
            </div>

            {/* Account Selector Tabs */}
            <div className="flex bg-white/10 p-1 rounded-xl text-[10px] font-black uppercase tracking-wider w-full max-w-sm border border-white/5 gap-1">
              {(['checking', 'savings', 'cash', 'total'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveAccountTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${activeAccountTab === tab ? 'bg-white text-emerald-950 shadow-xs font-black' : 'text-emerald-100/70 hover:text-white hover:bg-white/5'}`}
                >
                  {tab === 'checking' ? 'Courant' : tab === 'savings' ? 'Épargne' : tab === 'cash' ? 'Cash' : 'Total'}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Variation KPIs */}
          <div className="flex flex-col md:items-end gap-3.5 shrink-0">
            {/* Sync Badge */}
            <div className="flex items-center gap-2">
              <SyncStatusBadge isOnline={isOnline} isSyncing={isSyncing} />
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/5 text-xs font-bold">
              <div className={`p-1 rounded-lg ${stats.monthlyVariation.isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {stats.monthlyVariation.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              </div>
              <div>
                <p className="text-[10px] text-emerald-200/70 uppercase font-bold tracking-wider">vs Mois dernier</p>
                <p className="font-extrabold text-white text-xs">
                  {stats.monthlyVariation.isPositive ? '+' : '-'}{stats.monthlyVariation.percent}% ({formatCurrency(stats.monthlyVariation.amount)})
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={onQuickAdd}
                data-tour-id="add-quick"
                className="flex-1 md:flex-none px-4 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Enregistrer</span>
              </button>
              <button
                onClick={() => onNavigate('buckets')}
                className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white border border-white/10 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Layers size={14} />
                <span>Sanadiq</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Daily Ritual Checkin Card */}
      <DailyCheckinCard userId={userId} language={language as 'fr' | 'darija'} />

      {/* Setup Checklist Card */}
      <SetupChecklistCard userId={userId} language={language} onNavigate={onNavigate} />

      {/* 2. SECTION FREE-TO-SPEND */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Free to spend gauge */}
        <div data-tour-id="free-to-spend" className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Mo مصروف Flex (Free-to-Spend)</span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mt-1">
                {formatCurrency(stats.freeToSpend)}
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-full text-[9px] font-bold uppercase tracking-wider">
              Disponible
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (stats.freeToSpend / stats.totalBalance) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold">
            Somme restante après déduction des sanadiq indispensables (Loyer, Factures).
          </p>
        </div>

        {/* Projection Fin de Mois */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Projection fin de mois</span>
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mt-1">
                {formatCurrency(stats.projectionEndMonth)}
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-800 rounded-full text-[9px] font-bold uppercase tracking-wider">
              Solde estimé
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            Calculé sur votre rythme moyen quotidien de {formatCurrency(stats.balanceByAccount.total / 30)}/jour.
          </p>
        </div>

        {/* Plus grosse dépense hebdo */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Plus grosse dépense (7j)</span>
              {stats.biggestWeeklyExpense ? (
                <h3 className="text-xl font-black text-rose-600 tracking-tight leading-none mt-1">
                  -{formatCurrency(stats.biggestWeeklyExpense.amount)}
                </h3>
              ) : (
                <h3 className="text-xl font-black text-slate-400 tracking-tight leading-none mt-1">
                  Aucune dépense
                </h3>
              )}
            </div>
            <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-full text-[9px] font-bold uppercase tracking-wider">
              Semaine
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold truncate leading-tight">
            {stats.biggestWeeklyExpense 
              ? `${stats.biggestWeeklyExpense.description} (${stats.biggestWeeklyExpense.date})`
              : "Aucune transaction de débit enregistrée ces 7 derniers jours."}
          </p>
        </div>

      </div>

      {/* 3. AD BANNER (Free plan only) */}
      <AdBanner unitId="dashboard-native-1" userTier={userTier as any} />
      <PartnerOfferBanner />

      {/* 4. SECTIONS PRINCIPALES (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Buckets and Events */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* COMPARTIMENTS (Sanadiq) */}
          <div data-tour-id="buckets-section" className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Vos Sanadiq Actifs</h3>
                <p className="text-xs text-slate-400 font-semibold">Consommation des enveloppes d'épargne enveloppe-budget</p>
              </div>
              <button 
                onClick={() => onNavigate('buckets')}
                className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Gérer</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {buckets.slice(0, 4).map(b => (
                <div key={b.id} className="relative group space-y-2.5">
                  <BucketCard
                    bucket={b}
                    language={language}
                    variant="compact"
                    onSelect={() => onNavigate('buckets')}
                  />
                  {/* Quick allocate buttons beneath each card */}
                  <div className="absolute right-3.5 bottom-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleQuickAllocate(b.id, 100); }}
                      className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[9px] font-bold cursor-pointer"
                    >
                      +100 DH
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleQuickAllocate(b.id, 200); }}
                      className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[9px] font-bold cursor-pointer"
                    >
                      +200 DH
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ÉVÉNEMENTS MAROCAINS COMPTE À REBOURS */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Événements Traditionnels</h3>
                <p className="text-xs text-slate-400 font-semibold">Budget Ramadan, Aid Al Adha et Rentrée</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.slice(0, 2).map(ev => {
                const daysLeft = getDaysRemaining(ev.start_date);
                const status = getEventStatus(ev);

                return (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    daysRemaining={daysLeft}
                    status={status}
                    onContribute={contributeToEvent}
                    language={language}
                  />
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column - Daret & Recent activity */}
        <div className="space-y-6">
          
          {/* TONTINE (Daret) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Daret (Tontine)</h3>
                <p className="text-xs text-slate-400 font-semibold">Épargne solidaire de groupe</p>
              </div>
            </div>

            <TontineMiniCard
              tontineData={getNextCollection()}
              onPay={() => payContribution("tontine-1", 1000)}
              language={language}
            />
          </div>

          {/* VOS OBJECTIFS (Ahdaf) */}
          <div data-tour-id="goals-section" className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Objectifs d'Épargne</h3>
                <p className="text-xs text-slate-400 font-semibold">Projets d'avenir et épargne ciblée</p>
              </div>
              <button 
                onClick={() => onNavigate('goals')}
                className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Gérer</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {goals && goals.length > 0 ? (
              <div className="space-y-3">
                {goals.slice(0, 1).map(g => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    onContribute={contributeToGoal}
                    language={language as 'fr' | 'darija'}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 p-4 rounded-3xl text-center text-xs text-slate-400 font-medium">
                Aucun objectif d'épargne actif. Créez-en un pour commencer !
              </div>
            )}
          </div>

          {/* RECENT SAISIES */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Saisies Récentes</h3>
                <p className="text-xs text-slate-400 font-semibold">Flux de dépenses & rentrées d'argent</p>
              </div>
              <button 
                onClick={() => onNavigate('transactions')}
                className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Toutes</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100/60">
              {transactions.slice(0, 4).map(t => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  language={language}
                  variant="simple"
                />
              ))}
            </div>
          </div>

          {/* Traditional Moroccan Finance Tip */}
          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-3xl text-center space-y-1">
            <Sparkles className="text-amber-600 mx-auto" size={20} />
            <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-wider">L'Astuce Floussi</h4>
            <p className="text-[10px] text-amber-700 leading-normal font-medium max-w-xs mx-auto">
              "Enregistrez immédiatement vos achats en cash chez le Moul Hanout pour ne perdre aucune trace de votre budget mensuel."
            </p>
          </div>

        </div>

      </div>

      <WrappedIntroModal
        isOpen={isWrappedIntroOpen}
        onClose={() => {
          markWrappedAsSeen();
          setIsWrappedIntroOpen(false);
        }}
        onStart={() => {
          markWrappedAsSeen();
          setIsWrappedIntroOpen(false);
          onNavigate('wrapped');
        }}
        language={language}
      />

      {/* Guided Tour Spotlight & Tooltip Overlay */}
      {tour.isActive && tour.currentStep && (
        <>
          <SpotlightOverlay
            targetSelector={tour.currentStep.targetSelector}
            isActive={tour.isActive}
          />
          <TourTooltip
            targetSelector={tour.currentStep.targetSelector}
            title={tour.currentStep.title}
            description={tour.currentStep.description}
            placement={tour.currentStep.placement}
            currentStepIndex={tour.currentStepIndex}
            totalSteps={tour.totalSteps}
            language={language}
            onNext={tour.nextStep}
            onPrevious={tour.previousStep}
            onSkip={tour.skipTour}
          />
        </>
      )}

      {showQuickWin && (
        <FirstGoalQuickWin
          userId={userId}
          persona={profile?.persona_type || 'salarie'}
          monthlyIncome={totalMonthlyIncome || 8000}
          language={language}
          onResolve={() => {
            setShowQuickWin(false);
            if (tour.shouldAutoStart) {
              tour.startTour();
            }
          }}
        />
      )}

      {isFirstTransactionCelebration && (
        <FirstTransactionCelebration
          userId={userId}
          language={language}
          onClose={dismissCelebration}
        />
      )}

    </div>
  );
}
