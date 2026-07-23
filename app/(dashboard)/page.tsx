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
import { FloussiScoreWidget } from '../../components/dashboard/FloussiScoreWidget';
import { FloussiScoreGauge } from '../../components/score/FloussiScoreGauge';
import { useFloussiScore } from '../../hooks/use-floussi-score';
import { useDashboardLayout } from '../../hooks/use-dashboard-layout';
import { DashboardEditModeToggle } from '../../components/dashboard/DashboardEditModeToggle';
import { WidgetDragHandle } from '../../components/dashboard/WidgetDragHandle';
import { WidgetVisibilityPanel } from '../../components/dashboard/WidgetVisibilityPanel';
import { WidgetSizeSelector } from '../../components/dashboard/WidgetSizeSelector';
import { EmptyDashboardState } from '../../components/dashboard/EmptyDashboardState';
import { PersonaPresetSuggestionBanner } from '../../components/dashboard/PersonaPresetSuggestionBanner';
import { DASHBOARD_WIDGETS_REGISTRY } from '../../lib/dashboard-widgets-registry';

import { useGuidedTour } from '../../hooks/use-guided-tour';
import { dashboardTourDefinition } from '../../lib/dashboard-tour-definition';
import { SpotlightOverlay } from '../../components/tour/SpotlightOverlay';
import { TourTooltip } from '../../components/tour/TourTooltip';

import { formatCurrency } from '../../lib/utils';
import { Language, getTranslation, t } from '../../lib/i18n';
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

  // Load Floussi Score for header gauge
  const { score: scoreObj } = useFloussiScore(userId, language as 'fr' | 'darija');

  // Load configurable dashboard layout
  const {
    layout,
    isCustomized,
    hasBeenOfferedPersonaPreset,
    updateWidgetOrder,
    toggleWidgetVisibility,
    setWidgetSize,
    applyPersonaPreset,
    dismissPersonaPreset,
    resetToDefault
  } = useDashboardLayout(userId);

  const [isEditMode, setIsEditMode] = useState(false);

  // Swap order of visible widgets
  const handleMoveWidget = (widgetId: string, direction: 'up' | 'down') => {
    const visibleWidgets = layout.filter(w => w.visible);
    const index = visibleWidgets.findIndex(w => w.id === widgetId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < visibleWidgets.length) {
      const currentWidget = visibleWidgets[index];
      const targetWidget = visibleWidgets[targetIndex];

      const currentOrder = currentWidget.order;
      const targetOrder = targetWidget.order;

      const newOrder = layout.map(w => {
        if (w.id === currentWidget.id) {
          return { id: w.id, order: targetOrder };
        }
        if (w.id === targetWidget.id) {
          return { id: w.id, order: currentOrder };
        }
        return { id: w.id, order: w.order };
      });

      updateWidgetOrder(newOrder);
    }
  };

  // Get user-friendly name of widget
  const getWidgetTitle = (widgetId: string) => {
    const titles: Record<string, { fr: string; darija: string }> = {
      solde: { fr: "Solde Disponible", darija: "Solde l-jib" },
      score: { fr: "Score Financier", darija: "Floussi Score" },
      free_to_spend: { fr: "Reste à dépenser & Projections", darija: "Ch'hal bqa l l-sarf" },
      buckets: { fr: "Compartiments (Sanadiq)", darija: "Sanadiq l-maliya" },
      events: { fr: "Événements & Traditions", darija: "Al-Mounasabate" },
      tontine: { fr: "Tontine (Daret)", darija: "Daret" },
      goals: { fr: "Objectifs (Ahdaf)", darija: "Ahdaf" },
      transactions: { fr: "Transactions récentes", darija: "Teqyidat l-khra" },
      alertes: { fr: "Alertes Info", darija: "Al-Tanbihate" }
    };
    const tItem = titles[widgetId];
    if (!tItem) return widgetId;
    return language === 'fr' ? tItem.fr : tItem.darija;
  };

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

  // Wrap widget for visual edit capabilities
  const wrapWidgetInEditMode = (widgetId: string, element: React.ReactNode) => {
    if (!isEditMode || !element) return element;

    const widgetConfig = layout.find(w => w.id === widgetId);
    const registryConfig = DASHBOARD_WIDGETS_REGISTRY.find(w => w.id === widgetId);
    if (!widgetConfig || !registryConfig) return element;

    const visibleWidgets = layout.filter(w => w.visible);
    const currentIndex = visibleWidgets.findIndex(w => w.id === widgetId);
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === visibleWidgets.length - 1;

    return (
      <div
        key={`edit-wrapper-${widgetId}`}
        className="relative p-2 rounded-[28px] border-2 border-dashed border-emerald-500 bg-emerald-50/5 hover:bg-emerald-50/10 transition-all duration-300"
      >
        {/* Visual Edit Mode Overlay Banner */}
        <div className="flex items-center justify-between gap-2 p-3 bg-white border border-slate-100 rounded-2xl shadow-md mb-3 select-none animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
              {getWidgetTitle(widgetId)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {registryConfig.isResizable && (
              <WidgetSizeSelector
                currentSize={widgetConfig.size}
                sizeOptions={registryConfig.sizeOptions}
                onChangeSize={(size) => setWidgetSize(widgetId, size)}
                language={language}
              />
            )}

            <WidgetDragHandle
              onMoveUp={() => handleMoveWidget(widgetId, 'up')}
              onMoveDown={() => handleMoveWidget(widgetId, 'down')}
              isFirst={isFirst}
              isLast={isLast}
            />
          </div>
        </div>

        {/* The actual component preview inside edit wrapper */}
        <div className="pointer-events-none select-none opacity-85 transition-opacity">
          {element}
        </div>
      </div>
    );
  };

  const renderEditableWidget = (widgetId: string) => {
    const rawWidget = renderWidget(widgetId);
    return wrapWidgetInEditMode(widgetId, rawWidget);
  };

  // Widget rendering helper
  const renderWidget = (widgetId: string) => {
    const widgetConfig = layout.find(w => w.id === widgetId);
    if (!widgetConfig || !widgetConfig.visible) return null;

    switch (widgetId) {
      case 'solde':
        return (
          <div key="widget-solde" className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
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
                      {tab === 'checking' ? t('courant', language) : tab === 'savings' ? t('epargne', language) : tab === 'cash' ? t('cash', language) : t('total', language)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Variation KPIs */}
              <div className="flex flex-col md:items-end gap-3.5 shrink-0">
                {/* Sync Badge */}
                <div className="flex items-center gap-2">
                  <FloussiScoreGauge score={scoreObj.totalScore} tier={scoreObj.tier} trend={scoreObj.trend} variant="header" language={language as 'fr' | 'darija'} />
                  <SyncStatusBadge isOnline={isOnline} isSyncing={isSyncing} />
                </div>

                <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/5 text-xs font-bold">
                  <div className={`p-1 rounded-lg ${stats.monthlyVariation.isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {stats.monthlyVariation.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-200/70 uppercase font-bold tracking-wider">{t('vsLastMonth', language)}</p>
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
                    <span>{t('enregistrer', language)}</span>
                  </button>
                  <button
                    onClick={() => onNavigate('buckets')}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white border border-white/10 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers size={14} />
                    <span>{t('sanadiq', language)}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      case 'score':
        return <FloussiScoreWidget key="widget-score" userId={userId} language={language as 'fr' | 'darija'} />;
      case 'free_to_spend':
        return (
          <div key="widget-free-to-spend" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free to spend gauge */}
            <div data-tour-id="free-to-spend" className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t('freeToSpend', language)}</span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mt-1">
                    {formatCurrency(stats.freeToSpend)}
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  {t('disponible', language)}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (stats.freeToSpend / stats.totalBalance) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">
                {t('freeToSpendDesc', language)}
              </p>
            </div>

            {/* Projection Fin de Mois */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t('projectionEndMonth', language)}</span>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mt-1">
                    {formatCurrency(stats.projectionEndMonth)}
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-800 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  {t('soldeEstime', language)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                {t('calculatedDailyRate', language).replace('{rate}', formatCurrency(stats.balanceByAccount.total / 30))}
              </p>
            </div>

            {/* Plus grosse dépense hebdo */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t('biggestWeeklyExpense', language)}</span>
                  {stats.biggestWeeklyExpense ? (
                    <h3 className="text-xl font-black text-rose-600 tracking-tight leading-none mt-1">
                      -{formatCurrency(stats.biggestWeeklyExpense.amount)}
                    </h3>
                  ) : (
                    <h3 className="text-xl font-black text-slate-400 tracking-tight leading-none mt-1">
                      {t('aucuneDepense', language)}
                    </h3>
                  )}
                </div>
                <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  {t('week', language)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold truncate leading-tight">
                {stats.biggestWeeklyExpense 
                  ? `${stats.biggestWeeklyExpense.description} (${stats.biggestWeeklyExpense.date})`
                  : t('noDebitTransaction', language)}
              </p>
            </div>
          </div>
        );
      case 'buckets': {
        const bucketsConfig = layout.find(w => w.id === 'buckets');
        const bucketsSize = bucketsConfig?.size || 'normal';
        const bucketsSliceLimit = bucketsSize === 'large' ? 6 : bucketsSize === 'compact' ? 2 : 4;
        const bucketsGridCols = bucketsSize === 'large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';

        // Promote tax/Provision IR bucket for freelancers
        const sortedBuckets = [...buckets];
        if (profile?.persona_type === 'freelance') {
          sortedBuckets.sort((a, b) => {
            const isAImpots = a.category === 'impots' || 
              (typeof a.name === 'string' && a.name.toLowerCase().includes('provision ir')) || 
              (a.name && typeof a.name === 'object' && (String((a.name as any).fr || '').toLowerCase().includes('provision ir') || String((a.name as any).darija || '').toLowerCase().includes('ضرائب')));
            const isBImpots = b.category === 'impots' || 
              (typeof b.name === 'string' && b.name.toLowerCase().includes('provision ir')) || 
              (b.name && typeof b.name === 'object' && (String((b.name as any).fr || '').toLowerCase().includes('provision ir') || String((b.name as any).darija || '').toLowerCase().includes('ضرائب')));
            if (isAImpots && !isBImpots) return -1;
            if (!isAImpots && isBImpots) return 1;
            return 0;
          });
        }

        return (
          <div key="widget-buckets" data-tour-id="buckets-section" className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">{t('vosSanadiqActifs', language)}</h3>
                <p className="text-xs text-slate-400 font-semibold">{t('vosSanadiqActifsDesc', language)}</p>
              </div>
              <button 
                onClick={() => onNavigate('buckets')}
                className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>{t('gerer', language)}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className={`grid ${bucketsGridCols} gap-4`}>
              {sortedBuckets.slice(0, bucketsSliceLimit).map(b => (
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
        );
      }
      case 'events': {
        const eventsConfig = layout.find(w => w.id === 'events');
        const eventsSize = eventsConfig?.size || 'normal';
        const eventsSliceLimit = eventsSize === 'large' ? 4 : eventsSize === 'compact' ? 1 : 2;
        const eventsGridCols = eventsSize === 'large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2';

        return (
          <div key="widget-events" className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">{t('evenementsTraditionnels', language)}</h3>
                <p className="text-xs text-slate-400 font-semibold">{t('evenementsTraditionnelsDesc', language)}</p>
              </div>
            </div>

            <div className={`grid ${eventsGridCols} gap-4`}>
              {events.slice(0, eventsSliceLimit).map(ev => {
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
        );
      }
      case 'tontine':
        return (
          <div key="widget-tontine" className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">{t('daretTontine', language)}</h3>
                <p className="text-xs text-slate-400 font-semibold">{t('daretTontineDesc', language)}</p>
              </div>
            </div>

            <TontineMiniCard
              tontineData={getNextCollection()}
              onPay={() => payContribution("tontine-1", 1000)}
              language={language}
            />
          </div>
        );
      case 'goals':
        return (
          <div key="widget-goals" data-tour-id="goals-section" className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">{t('objectifsEpargne', language)}</h3>
                <p className="text-xs text-slate-400 font-semibold">{t('objectifsEpargneDesc', language)}</p>
              </div>
              <button 
                onClick={() => onNavigate('goals')}
                className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>{t('gerer', language)}</span>
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
                {t('aucunObjectifEpargne', language)}
              </div>
            )}
          </div>
        );
      case 'transactions':
        return (
          <div key="widget-transactions" className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">{t('saisiesRecentes', language)}</h3>
                <p className="text-xs text-slate-400 font-semibold">{t('saisiesRecentesDesc', language)}</p>
              </div>
              <button 
                onClick={() => onNavigate('transactions')}
                className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>{t('toutes', language)}</span>
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
        );
      case 'alertes':
        return null;
      default:
        return null;
    }
  };

  const isSoldeVisible = layout.find(w => w.id === 'solde')?.visible ?? true;

  const topWidgetIds = ['solde', 'score', 'free_to_spend', 'alertes'];
  const visibleTopWidgets = layout
    .filter(w => topWidgetIds.includes(w.id) && w.visible)
    .sort((a, b) => a.order - b.order);

  const leftWidgetIds = ['buckets', 'events'];
  const visibleLeftWidgets = layout
    .filter(w => leftWidgetIds.includes(w.id) && w.visible)
    .sort((a, b) => a.order - b.order);

  const rightWidgetIds = ['tontine', 'goals', 'transactions'];
  const visibleRightWidgets = layout
    .filter(w => rightWidgetIds.includes(w.id) && w.visible)
    .sort((a, b) => a.order - b.order);

  const leftSpanClass = visibleRightWidgets.length === 0 ? "lg:col-span-3 space-y-6" : "lg:col-span-2 space-y-6";

  const getWidgetElement = (widgetId: string) => {
    return isEditMode ? renderEditableWidget(widgetId) : renderWidget(widgetId);
  };

  const hasVisibleWidgets = layout.some(w => w.visible);

  return (
    <div className={`space-y-6 font-sans transition-all duration-500 ${isEditMode ? 'bg-slate-50/70 p-4 sm:p-6 rounded-[32px] border-2 border-dashed border-emerald-500/30 ring-8 ring-emerald-500/5 shadow-inner' : ''}`}>
      
      {/* Dashboard Top Navigation / Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">
            {language === 'fr' ? "Mon Tableau de Bord" : "Dashboard Diali"}
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{getMoroccanTodayDate()}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 shrink-0">
            <SyncStatusBadge isOnline={isOnline} isSyncing={isSyncing} />
          </div>
          
          <DashboardEditModeToggle
            isEditMode={isEditMode}
            onToggle={() => setIsEditMode(!isEditMode)}
            language={language}
          />
        </div>
      </div>

      {/* Persona Layout Suggestion Banner */}
      {!isCustomized && !hasBeenOfferedPersonaPreset && profile?.persona_type && (
        <PersonaPresetSuggestionBanner
          personaId={profile.persona_type}
          onApply={() => applyPersonaPreset(profile.persona_type)}
          onDismiss={dismissPersonaPreset}
          language={language}
        />
      )}

      {/* Widget Visibility Panel shown only in Edit Mode */}
      {isEditMode && (
        <div className="animate-slideDown">
          <WidgetVisibilityPanel
            layout={layout}
            onToggleVisibility={toggleWidgetVisibility}
            onReset={resetToDefault}
            userTier={userTier}
            language={language}
          />
        </div>
      )}

      {/* Main Dashboard Widget Layout */}
      {!hasVisibleWidgets ? (
        <EmptyDashboardState onReset={resetToDefault} language={language} />
      ) : (
        <>
          {!isSoldeVisible && (
            <React.Fragment key="onboarding-fallback">
              {/* Daily Ritual Checkin Card */}
              <DailyCheckinCard userId={userId} language={language as 'fr' | 'darija'} />

              {/* Setup Checklist Card */}
              <SetupChecklistCard userId={userId} language={language} onNavigate={onNavigate} />
            </React.Fragment>
          )}

          {visibleTopWidgets.map(w => {
            if (w.id === 'solde') {
              return (
                <React.Fragment key="group-solde">
                  {getWidgetElement('solde')}
                  
                  {/* Daily Ritual Checkin Card */}
                  <DailyCheckinCard userId={userId} language={language as 'fr' | 'darija'} />

                  {/* Setup Checklist Card */}
                  <SetupChecklistCard userId={userId} language={language} onNavigate={onNavigate} />
                </React.Fragment>
              );
            }
            return getWidgetElement(w.id);
          })}

          {/* 3. AD BANNER (Free plan only) */}
          <AdBanner unitId="dashboard-native-1" userTier={userTier as any} />
          <PartnerOfferBanner />

          {/* 4. SECTIONS PRINCIPALES (Bento Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Columns - Buckets and Events */}
            {visibleLeftWidgets.length > 0 && (
              <div className={leftSpanClass}>
                {visibleLeftWidgets.map(w => getWidgetElement(w.id))}
              </div>
            )}

            {/* Right Column - Daret & Recent activity */}
            {visibleRightWidgets.length > 0 ? (
              <div className="space-y-6">
                {visibleRightWidgets.map(w => getWidgetElement(w.id))}
                
                {/* Traditional Moroccan Finance Tip */}
                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-3xl text-center space-y-1">
                  <Sparkles className="text-amber-600 mx-auto" size={20} />
                  <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-wider">{t('astuceFloussi', language)}</h4>
                  <p className="text-[10px] text-amber-700 leading-normal font-medium max-w-xs mx-auto">
                    "{t('astuceFloussiDesc', language)}"
                  </p>
                </div>
              </div>
            ) : (
              visibleLeftWidgets.length > 0 && (
                <div className="lg:col-span-3 bg-amber-50/50 border border-amber-100 p-4 rounded-3xl text-center space-y-1">
                  <Sparkles className="text-amber-600 mx-auto" size={20} />
                  <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-wider">{t('astuceFloussi', language)}</h4>
                  <p className="text-[10px] text-amber-700 leading-normal font-medium max-w-xs mx-auto">
                    "{t('astuceFloussiDesc', language)}"
                  </p>
                </div>
              )
            )}

          </div>
        </>
      )}

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
