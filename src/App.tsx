import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useBuckets } from '../hooks/use-buckets';
import { useTransactions } from '../hooks/use-transactions';
import { useOcr } from '../hooks/use-ocr';
import { useOffline } from '../hooks/use-offline';
import { getTranslation } from '../lib/i18n';
import { recordLastActiveTimestamp } from '../lib/inactivity-detector';
import { useWinBack } from '../hooks/use-winback';
import { WinBackModal } from '../components/winback/WinBackModal';
import { useAccountAnniversary } from '../hooks/use-account-anniversary';
import { AnniversaryModal } from '../components/anniversary/AnniversaryModal';
import { useGlobalSearch } from '../hooks/use-global-search';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal';
import { SkeletonCard } from '../components/shared/SkeletonCard';

// Pages
import DashboardPage from '../app/(dashboard)/page';
import TransactionsPage from '../app/(dashboard)/transactions/page';
import ImportPage from '../app/(dashboard)/transactions/import/page';
import BucketsPage from '../app/(dashboard)/buckets/page';
import InsightsPage from '../app/(dashboard)/insights/page';
import GoalsPage from '../app/(dashboard)/goals/page';
import TontinePage from '../app/(dashboard)/tontine/page';
import FamilyPage from '../app/(dashboard)/family/page';
import MREPage from '../app/(dashboard)/mre/page';
import NetWorthPage from '../app/(dashboard)/net-worth/page';
import ReportsPage from '../app/(dashboard)/reports/page';
import SettingsPage from '../app/(dashboard)/settings/page';
import { WalletPage } from '../components/wallet/WalletPage';
import HajjPlannerPage from '../app/(dashboard)/hajj-planner/page';
import CalculatorsPage from '../app/(dashboard)/calculators/page';
import CnssTrackerPage from '../app/(dashboard)/cnss-tracker/page';
import AidProgramsPage from '../app/(dashboard)/aid-programs/page';

const CommunityPage = React.lazy(() => import('../components/community/CommunityPage').then(m => ({ default: m.CommunityPage })));
const WrappedPage = React.lazy(() => import('../app/(dashboard)/wrapped/page'));
const LifePlanPage = React.lazy(() => import('../app/(dashboard)/life-plan/page'));
const AcademyPage = React.lazy(() => import('../app/(dashboard)/academy/page'));

// Public/Auth Pages
import LandingPage from '../app/(public)/page';
import PricingPage from '../app/(public)/pricing/page';
import LoginPage from '../app/(auth)/login/page';
import RegisterPage from '../app/(auth)/register/page';
import ForgotPasswordPage from '../app/(auth)/forgot-password/page';
import WelcomePage from '../app/welcome/page';
import OnboardingPage from '../app/onboarding/page';

// Layout & Forms
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import AdBanner from '../components/ads/AdBanner';
import TransactionForm from '../components/transactions/TransactionForm';
import { BucketForm } from '../components/buckets/BucketForm';
import { SidiFAB } from '../components/sidi/SidiFAB';
import BackupReminderBanner from '../components/settings/BackupReminderBanner';
import StorageWarningBanner from '../components/shared/StorageWarningBanner';

import { ShieldAlert, RefreshCw, Camera, Sparkles, X, Settings, Layers, Wallet, Check } from 'lucide-react';

// Advanced OCR & Cash features
import { ReceiptLineItemsPreview } from '../components/ocr/ReceiptLineItemsPreview';
import { SplitByCategoryModal } from '../components/ocr/SplitByCategoryModal';
import { QuickCashEntry } from '../components/ocr/QuickCashEntry';
import { validateAmount, validateDate } from '../lib/receipt-validation';
import { compressImage } from '../lib/image-compression';

// Schema migration system
import { runPendingMigrations } from '../lib/schema-migrations';

export default function App() {
  const { user, profile, loading, updateProfile, setLanguage, upgradeSubscription, logout, login, register } = useAuth();
  const session = user ? { user } : null;
  const language = profile?.preferred_language || 'fr';

  const userId = user?.id || 'mock-user-id-9999';

  // Run pending schema migrations synchronously before other hooks execute their logic
  const migrationResult = React.useMemo(() => {
    return runPendingMigrations(userId);
  }, [userId]);

  // Winback logic for returning inactive users
  const { winBackMessage, dismissWinBack } = useWinBack(user?.id || '');

  // Account anniversary celebration logic
  const { 
    isAnniversaryToday, 
    summary: anniversarySummary, 
    hasBeenShownThisYear: anniversaryShownThisYear, 
    markAsShown: markAnniversaryAsShown 
  } = useAccountAnniversary(user?.id || '');

  // Record user activity on mount and when user session changes
  useEffect(() => {
    if (user?.id) {
      recordLastActiveTimestamp(user.id);
    }
  }, [user?.id]);

  const { buckets, loading: bucketsLoading, createBucket, deleteBucket, autoAllocate } = useBuckets(user?.id || '');
  const { transactions, loading: transactionsLoading, createTransaction, deleteTransaction, getCashRatio } = useTransactions(user?.id || '');
  const cashRatio = getCashRatio();

  const { isOnline, isSyncing, getSyncQueue } = useOffline();
  const [syncQueueCount, setSyncQueueCount] = useState(0);

  useEffect(() => {
    async function updateQueue() {
      const q = await getSyncQueue();
      setSyncQueueCount(q.length);
    }
    updateQueue();
  }, [getSyncQueue, transactions, buckets, profile]);

  const { scanReceipt, scanning: isScanning, error: ocrError } = useOcr();

  const [currentScreen, setCurrentScreen] = useState<string>('landing');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBucketModal, setShowBucketModal] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);

  // Global Universal Search Hook
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    recentSearches,
    clearRecentSearches,
    addRecentSearch,
    isOpen: isSearchOpen,
    openSearch,
    closeSearch
  } = useGlobalSearch(user?.id || 'mock-user-id-9999');

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k';
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isK && isCtrlOrCmd) {
        const activeEl = document.activeElement;
        if (activeEl) {
          const tagName = activeEl.tagName.toLowerCase();
          const isEditable = activeEl.getAttribute('contenteditable') === 'true';
          if (tagName === 'input' || tagName === 'textarea' || isEditable) {
            return;
          }
        }

        e.preventDefault();
        openSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  // Global listeners for modals
  useEffect(() => {
    const handleOpenTx = () => setShowTransactionModal(true);
    const handleOpenBucket = () => setShowBucketModal(true);
    
    window.addEventListener('open-transaction-modal', handleOpenTx);
    window.addEventListener('open-bucket-modal', handleOpenBucket);
    
    return () => {
      window.removeEventListener('open-transaction-modal', handleOpenTx);
      window.removeEventListener('open-bucket-modal', handleOpenBucket);
    };
  }, []);

  // Simulated scan state
  const [scannedResult, setScannedResult] = useState<any | null>(null);

  // Advanced states
  const [ocrTab, setOcrTab] = useState<'scan' | 'quick'>('scan');
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [editedOcrAmount, setEditedOcrAmount] = useState<number>(0);
  const [editedOcrDate, setEditedOcrDate] = useState<string>('');

  // Sync current navigation with auth state
  useEffect(() => {
    if (session) {
      if (currentScreen === 'landing' || currentScreen === 'login' || currentScreen === 'register') {
        const hasCompletedOnboarding = localStorage.getItem('floussi_onboarding_completed') === 'true' || profile?.persona_type;
        if (!hasCompletedOnboarding) {
          const hasSeenWelcome = localStorage.getItem('floussi_welcome_seen') === 'true';
          setCurrentScreen(hasSeenWelcome ? 'onboarding' : 'welcome');
        } else {
          setCurrentScreen('dashboard');
        }
      }
    } else {
      if (currentScreen !== 'landing' && currentScreen !== 'pricing' && currentScreen !== 'login' && currentScreen !== 'register' && currentScreen !== 'forgot-password') {
        setCurrentScreen('landing');
      }
    }
  }, [session, profile, currentScreen]);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannedResult(null);
    try {
      let finalFile = file;
      if (file.type.startsWith('image/')) {
        try {
          const compressed = await compressImage(file, 400); // compress to 400KB max
          finalFile = new File([compressed], file.name, { type: compressed.type });
        } catch (compressionErr) {
          console.warn("[App] Image compression failed, scanning original:", compressionErr);
        }
      }

      const result = await scanReceipt(finalFile);
      if (result) {
        setScannedResult(result);
        setEditedOcrAmount(result.amount);
        setEditedOcrDate(result.date);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyOcrResult = () => {
    if (!scannedResult) return;

    createTransaction({
      amount: editedOcrAmount,
      description: `Scan Ticket ${scannedResult.merchant}`,
      type: 'expense',
      category: scannedResult.category || 'alimentation',
      transaction_date: editedOcrDate || new Date().toISOString().split('T')[0],
      account_id: 'acc-cash',
      tags: ['ocr', 'cash', scannedResult.merchant?.toLowerCase() || 'marjane'],
      merchant: scannedResult.merchant || 'Marjane',
      bucket_id: null,
      receipt_url: null,
      is_recurring: false,
      recurring_frequency: null
    });

    setScannedResult(null);
    setShowOcrModal(false);
  };

  const handleConfirmSplit = (splits: { category: string; amount: number; bucketId: string | null }[]) => {
    splits.forEach(split => {
      createTransaction({
        amount: split.amount,
        description: `[Split] ${split.category.toUpperCase()} - ${scannedResult?.merchant || 'Ticket'}`,
        type: 'expense',
        category: split.category,
        transaction_date: editedOcrDate || scannedResult?.date || new Date().toISOString().split('T')[0],
        account_id: 'acc-cash',
        tags: ['ocr', 'split', split.category],
        merchant: scannedResult?.merchant || 'Marchand',
        bucket_id: split.bucketId,
        receipt_url: null,
        is_recurring: false,
        recurring_frequency: null
      });
    });
    setScannedResult(null);
    setShowOcrModal(false);
    setShowSplitModal(false);
  };

  // Render correct subpage
  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardPage
            buckets={buckets}
            transactions={transactions}
            language={language}
            onNavigate={handleNavigate}
            onQuickAdd={() => setShowTransactionModal(true)}
            cashRatio={cashRatio}
            userTier={profile?.subscription_tier || 'free'}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            language={language}
            onNavigate={handleNavigate}
            userTier={profile?.subscription_tier || 'free'}
          />
        );
      case 'transactions/import':
        return (
          <ImportPage
            language={language}
            onNavigate={handleNavigate}
          />
        );
      case 'buckets':
        return (
          <BucketsPage
            buckets={buckets}
            onCreate={createBucket}
            onDelete={deleteBucket}
            onAutoAllocate={autoAllocate}
            onQuickAddBucket={() => setShowBucketModal(true)}
            language={language}
          />
        );
      case 'insights':
        return (
          <InsightsPage
            transactions={transactions}
            buckets={buckets}
            language={language}
          />
        );
      case 'goals':
        return <GoalsPage language={language} />;
      case 'tontine':
        return <TontinePage language={language} />;
      case 'wallet':
        return <WalletPage lang={language} />;
      case 'community':
        return (
          <React.Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}>
            <CommunityPage lang={language} />
          </React.Suspense>
        );
      case 'calculators':
        return <CalculatorsPage language={language} />;
      case 'hajj-planner':
        return <HajjPlannerPage language={language} />;
      case 'cnss-tracker':
        return <CnssTrackerPage language={language} />;
      case 'aid-programs':
        return <AidProgramsPage language={language} />;
      case 'wrapped':
        return (
          <React.Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}>
            <WrappedPage />
          </React.Suspense>
        );
      case 'family':
        return <FamilyPage language={language} />;
      case 'mre':
        return <MREPage language={language} />;
      case 'net-worth':
        return <NetWorthPage language={language} />;
      case 'life-plan':
        return (
          <React.Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}>
            <LifePlanPage language={language} />
          </React.Suspense>
        );
      case 'academy':
        return (
          <React.Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}>
            <AcademyPage language={language} />
          </React.Suspense>
        );
      case 'reports':
        return <ReportsPage language={language} />;
      case 'settings':
        return (
          <SettingsPage
            profile={profile}
            onUpdateProfile={updateProfile}
            onUpgrade={upgradeSubscription}
            language={language}
            setLanguage={setLanguage}
            onNavigate={handleNavigate}
          />
        );
      default:
        return (
          <DashboardPage
            buckets={buckets}
            transactions={transactions}
            language={language}
            onNavigate={handleNavigate}
            onQuickAdd={() => setShowTransactionModal(true)}
            cashRatio={cashRatio}
            userTier={profile?.subscription_tier || 'free'}
          />
        );
    }
  };

  // If database / schema migration failed, block with a gorgeous, user-friendly screen
  if (!migrationResult.success) {
    const errorMsg = migrationResult.errors.join(', ');
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-850 border border-slate-700/50 p-8 rounded-3xl shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldAlert size={32} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-black tracking-tight text-white">
              {language === 'darija' ? "Khatar f Tahdith l-M3loumat ⚙️" : "Échec de la mise à jour ⚙️"}
            </h1>
            <p className="text-xs font-bold text-slate-400">
              {language === 'darija' ? "System ma qdarch i-bdel l-m3loumat dyalk l l-version l-jdida dyal Floussi." : "Le système n'a pas pu migrer vos données vers la nouvelle version de Floussi."}
            </p>
          </div>

          <div className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-2xl text-left font-mono text-[10px] text-rose-400 space-y-1">
            <span className="font-bold text-slate-500 block text-[9px] uppercase tracking-wider">Erreur technique / Khata2 :</span>
            <p className="break-all">{errorMsg || "Unknown schema migration error"}</p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              {language === 'darija' ? "A3id l-Mohawala 🔄" : "Réessayer la mise à jour 🔄"}
            </button>
            <p className="text-[10px] font-semibold text-slate-500">
              {language === 'darija' 
                ? "Ila bqa had l-mouchkil, t-wassal m3a s-support dyalna." 
                : "Si le problème persiste, veuillez contacter le support technique."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Public layouts
  if (!session) {
    if (currentScreen === 'pricing') {
      return <PricingPage onEnterApp={() => setCurrentScreen('login')} />;
    }
    if (currentScreen === 'login') {
      return <LoginPage onLogin={() => {}} onNavigateRegister={() => setCurrentScreen('register')} />;
    }
    if (currentScreen === 'register') {
      return <RegisterPage onRegister={() => {}} onNavigateLogin={() => setCurrentScreen('login')} />;
    }
    if (currentScreen === 'forgot-password') {
      return <ForgotPasswordPage onNavigateLogin={() => setCurrentScreen('login')} />;
    }
    return <LandingPage onEnterApp={() => setCurrentScreen('login')} onNavigatePricing={() => setCurrentScreen('pricing')} />;
  }

  // Intercept for Onboarding / Welcome sequence if not completed yet
  const hasCompletedOnboarding = localStorage.getItem('floussi_onboarding_completed') === 'true' || profile?.persona_type;
  if (!hasCompletedOnboarding) {
    if (currentScreen === 'welcome') {
      return (
        <WelcomePage 
          onComplete={() => setCurrentScreen('onboarding')} 
        />
      );
    }
    if (currentScreen === 'onboarding') {
      return (
        <OnboardingPage 
          onComplete={() => {
            localStorage.setItem('floussi_onboarding_completed', 'true');
            setCurrentScreen('dashboard');
          }} 
        />
      );
    }
    // Default fallback
    const hasSeenWelcome = localStorage.getItem('floussi_welcome_seen') === 'true';
    if (!hasSeenWelcome) {
      return (
        <WelcomePage 
          onComplete={() => setCurrentScreen('onboarding')} 
        />
      );
    } else {
      return (
        <OnboardingPage 
          onComplete={() => {
            localStorage.setItem('floussi_onboarding_completed', 'true');
            setCurrentScreen('dashboard');
          }} 
        />
      );
    }
  }

  const totalBalance = buckets.reduce((sum, b) => sum + (b.allocated_amount - b.spent_amount), 0);
  const monthlyIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlySpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const isFreeTier = profile?.subscription_tier === 'free';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <Sidebar 
        currentRoute={currentScreen} 
        onNavigate={handleNavigate} 
        language={language} 
        subscriptionTier={profile?.subscription_tier || 'free'}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <Header 
          profile={profile} 
          isOnline={isOnline} 
          isSyncing={isSyncing}
          totalBalance={totalBalance}
          monthlyIncome={monthlyIncome}
          monthlySpent={monthlySpent}
          language={language}
          setLanguage={setLanguage}
          onNavigate={handleNavigate}
          onScanClick={() => setShowOcrModal(true)}
          onSearchClick={openSearch}
        />

        {/* Ads banner for Free tier users */}
        {isFreeTier && (
          <div className="px-6 pt-4">
            <AdBanner 
              unitId="ca-pub-floussi-banner"
              userTier={profile?.subscription_tier || 'free'}
              onUpgrade={() => setCurrentScreen('settings')}
            />
          </div>
        )}

        {/* Main Content scrollable panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 pb-24 md:pb-8">
          {currentScreen === 'dashboard' && (
            <>
              <StorageWarningBanner 
                userId={user?.id || 'mock-user-id-9999'} 
                language={language} 
                onNavigateToSettings={() => setCurrentScreen('settings')} 
                context="dashboard"
              />
              <BackupReminderBanner 
                userId={user?.id || 'mock-user-id-9999'} 
                language={language} 
                onNavigateToSettings={() => setCurrentScreen('settings')} 
              />
            </>
          )}
          {renderActiveScreen()}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav 
          currentRoute={currentScreen} 
          onNavigate={handleNavigate} 
          onQuickAdd={() => setShowTransactionModal(true)}
        />

      </div>

      {/* MODAL: Transaction Creator */}
      {showTransactionModal && (
        <TransactionForm
          buckets={buckets}
          onClose={() => setShowTransactionModal(false)}
          onSave={(data) => {
            createTransaction(data);
            setShowTransactionModal(false);
          }}
          language={language}
        />
      )}

      {/* MODAL: Bucket Creator */}
      {showBucketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <BucketForm
              buckets={buckets}
              onSubmit={(data) => {
                createBucket(data);
                setShowBucketModal(false);
              }}
              onCancel={() => setShowBucketModal(false)}
              limitReached={profile?.subscription_tier === 'free' && buckets.length >= 3}
            />
          </div>
        </div>
      )}

      {/* MODAL: Ticket OCR Scanner / Cash quick entry tabbed panel */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden font-sans">
            
            {/* Header / Tabs Selector */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Camera size={18} className="text-emerald-600 animate-pulse" />
                  <span>{language === 'darija' ? 'Nafida d l-mouwamalat' : 'Transactions & Saisies Floussi'}</span>
                </h3>
                <button 
                  onClick={() => {
                    setShowOcrModal(false);
                    setScannedResult(null);
                  }}
                  className="p-1 hover:bg-slate-150 text-slate-400 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mode switch: scan vs quick-cash */}
              <div className="grid grid-cols-2 p-1 bg-slate-150 rounded-xl gap-1">
                <button
                  onClick={() => setOcrTab('scan')}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    ocrTab === 'scan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {language === 'darija' ? 'Numériser Ticket' : 'Scanner Ticket'}
                </button>
                <button
                  onClick={() => setOcrTab('quick')}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    ocrTab === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {language === 'darija' ? 'Kash Express' : 'Saisie Cash Express'}
                </button>
              </div>
            </div>

            {/* TAB CONTENT: Quick cash entry */}
            {ocrTab === 'quick' && (
              <div className="p-6">
                <QuickCashEntry lang={language as 'fr' | 'darija'} onClose={() => setShowOcrModal(false)} />
              </div>
            )}

            {/* TAB CONTENT: Scan Ticket (OCR) */}
            {ocrTab === 'scan' && (
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {language === 'darija' 
                    ? "Sowwer l'ticket d caisse dyalek (Marjane, BIM, Carrefour). L'machine ghadi t-khrej l-hsab b wa7dha."
                    : "Uploadez une photo de votre ticket de caisse marocain. L'intelligence Floussi extraira le montant, la date, et chaque ligne d'article automatiquement."}
                </p>

                {/* Dropzone/Picker */}
                {!scannedResult && !isScanning && (
                  <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-all relative bg-slate-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOcrFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="space-y-2">
                      <Camera size={28} className="text-slate-400 mx-auto animate-bounce" />
                      <p className="font-extrabold text-slate-700 text-xs">
                        {language === 'darija' ? 'Sowwer / Khtar l-ticket' : 'Prendre une photo ou Choisir'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PNG, JPG, JPEG • Auto-compressé</p>
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isScanning && (
                  <div className="flex flex-col items-center justify-center gap-2 p-8 bg-slate-50 rounded-2xl text-emerald-800 border border-slate-100 text-xs font-bold text-center">
                    <RefreshCw size={24} className="animate-spin text-emerald-600 mb-2" />
                    <span>{language === 'darija' ? 'Kay-9ra l-ticket dyalek... (Tesseract OCR)' : 'Sidi Floussi lit les articles de votre ticket...'}</span>
                  </div>
                )}

                {/* Scanned Result & Editing Interface */}
                {scannedResult && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Header extracted details info */}
                    <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-4 space-y-3.5">
                      <h4 className="font-extrabold text-xs text-emerald-900 flex items-center gap-1">
                        <Sparkles size={14} className="text-emerald-600 animate-pulse" />
                        <span>{language === 'darija' ? 'L-ma3loumat l-makhrouja :' : 'Données En-tête :'}</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-3.5">
                        {/* Merchant */}
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Marchand</span>
                          <span className="font-extrabold text-slate-800 text-xs">{scannedResult.merchant}</span>
                        </div>

                        {/* Date with validation warning */}
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Date</span>
                          <input
                            type="date"
                            value={editedOcrDate}
                            onChange={(e) => setEditedOcrDate(e.target.value)}
                            className="font-mono text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-0.5"
                          />
                          {validateDate(editedOcrDate, language as 'fr' | 'darija').warning && (
                            <span className="text-[8px] text-amber-600 font-black uppercase tracking-wider block mt-1 animate-pulse" title={validateDate(editedOcrDate, language as 'fr' | 'darija').warning}>
                              ⚠️ {language === 'darija' ? 'Ticket 9dim' : 'Ticket ancien (>7j)'}
                            </span>
                          )}
                        </div>

                        {/* Amount Override with validation */}
                        <div className="space-y-1 col-span-2">
                          <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Montant total (DH)</span>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              step="0.01"
                              value={editedOcrAmount}
                              onChange={(e) => setEditedOcrAmount(parseFloat(e.target.value) || 0)}
                              className="font-mono text-sm font-black text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1 w-28 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-bold text-slate-400">DH</span>
                          </div>

                          {validateAmount(scannedResult.amount, editedOcrAmount, language as 'fr' | 'darija').warning && (
                            <p className="text-[9px] text-rose-500 font-bold mt-1 bg-rose-50 p-2 rounded-lg leading-normal">
                              ⚠️ {validateAmount(scannedResult.amount, editedOcrAmount, language as 'fr' | 'darija').warning}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subcomponent: ReceiptLineItemsPreview */}
                    <ReceiptLineItemsPreview 
                      lineItems={scannedResult.lineItems} 
                      onChange={(updatedItems) => {
                        setScannedResult({ ...scannedResult, lineItems: updatedItems });
                        // Recalculate sum of items to prompt amount sync
                        const itemsSum = updatedItems.reduce((acc: number, item: any) => {
                          const cost = item.quantity * item.unitPrice;
                          return item.isPromo && cost > 0 ? acc - cost : acc + cost;
                        }, 0);
                        setEditedOcrAmount(Math.max(0, Math.round(itemsSum * 100) / 100));
                      }}
                      lang={language as 'fr' | 'darija'}
                    />

                    {/* Submit and Split actions footer */}
                    <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => setShowSplitModal(true)}
                          className="flex-1 py-2.5 border border-emerald-600/30 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Layers size={13} />
                          <span>{language === 'darija' ? '9ssem b sandoq' : 'Ventiler sandoqs (Split)'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleApplyOcrResult}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check size={13} />
                          <span>{language === 'darija' ? 'Sejjel l-kamil' : 'Enregistrer'}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setScannedResult(null);
                        }}
                        className="w-full text-center py-1.5 text-[9px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest"
                      >
                        {language === 'darija' ? 'Sowwer ticket akhor' : 'Scanner un autre ticket'}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Split Modal overlay trigger */}
      {showSplitModal && scannedResult && (
        <SplitByCategoryModal
          isOpen={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          lineItems={scannedResult.lineItems}
          buckets={buckets}
          merchantName={scannedResult.merchant}
          receiptDate={editedOcrDate}
          onConfirmSplit={handleConfirmSplit}
          lang={language as 'fr' | 'darija'}
        />
      )}

      {/* Winback Welcome Modal popup */}
      {winBackMessage && (
        <WinBackModal
          message={winBackMessage}
          language={language as 'fr' | 'darija'}
          onClose={dismissWinBack}
          onNavigate={handleNavigate}
        />
      )}

      {/* Account Anniversary Celebration Modal */}
      {isAnniversaryToday && !anniversaryShownThisYear && anniversarySummary && (
        <AnniversaryModal
          summary={anniversarySummary}
          language={language as 'fr' | 'darija'}
          onClose={markAnniversaryAsShown}
          onNavigate={handleNavigate}
        />
      )}

      {/* Floating Sidi Floussi Assistant */}
      <SidiFAB />

      {/* Global Universal Search Command Palette */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={closeSearch}
        query={searchQuery}
        setQuery={setSearchQuery}
        results={searchResults}
        recentSearches={recentSearches}
        clearRecentSearches={clearRecentSearches}
        addRecentSearch={addRecentSearch}
        language={language as 'fr' | 'darija'}
        onNavigate={handleNavigate}
      />

    </div>
  );
}
