import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useBuckets } from '../hooks/use-buckets';
import { useTransactions } from '../hooks/use-transactions';
import { useOcr } from '../hooks/use-ocr';
import { useOffline } from '../hooks/use-offline';
import { getTranslation } from '../lib/i18n';

// Pages
import DashboardPage from '../app/(dashboard)/page';
import TransactionsPage from '../app/(dashboard)/transactions/page';
import ImportPage from '../app/(dashboard)/transactions/import/page';
import BucketsPage from '../app/(dashboard)/buckets/page';
import InsightsPage from '../app/(dashboard)/insights/page';
import GoalsPage from '../app/(dashboard)/goals/page';
import TontinePage from '../app/(dashboard)/tontine/page';
import FamilyPage from '../app/(dashboard)/family/page';
import NetWorthPage from '../app/(dashboard)/net-worth/page';
import ReportsPage from '../app/(dashboard)/reports/page';
import SettingsPage from '../app/(dashboard)/settings/page';

// Public/Auth Pages
import LandingPage from '../app/(public)/page';
import PricingPage from '../app/(public)/pricing/page';
import LoginPage from '../app/(auth)/login/page';
import RegisterPage from '../app/(auth)/register/page';
import ForgotPasswordPage from '../app/(auth)/forgot-password/page';

// Layout & Forms
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import AdBanner from '../components/ads/AdBanner';
import TransactionForm from '../components/transactions/TransactionForm';
import { BucketForm } from '../components/buckets/BucketForm';

import { ShieldAlert, RefreshCw, Camera, Sparkles, X } from 'lucide-react';

export default function App() {
  const { user, profile, loading, updateProfile, setLanguage, upgradeSubscription, logout, login, register } = useAuth();
  const session = user ? { user } : null;
  const language = profile?.preferred_language || 'fr';

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

  // Simulated scan state
  const [scannedResult, setScannedResult] = useState<any | null>(null);

  // Sync current navigation with auth state
  useEffect(() => {
    if (session) {
      if (currentScreen === 'landing' || currentScreen === 'login' || currentScreen === 'register') {
        setCurrentScreen('dashboard');
      }
    } else {
      if (currentScreen !== 'landing' && currentScreen !== 'pricing' && currentScreen !== 'login' && currentScreen !== 'register' && currentScreen !== 'forgot-password') {
        setCurrentScreen('landing');
      }
    }
  }, [session]);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannedResult(null);
    try {
      const result = await scanReceipt(file);
      if (result) {
        setScannedResult(result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyOcrResult = () => {
    if (!scannedResult) return;

    createTransaction({
      amount: scannedResult.amount,
      description: scannedResult.description || 'Scan Ticket Marjane/BIM',
      type: 'expense',
      category: 'alimentation', // default
      transaction_date: scannedResult.date || new Date().toISOString().split('T')[0],
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
      case 'family':
        return <FamilyPage language={language} />;
      case 'net-worth':
        return <NetWorthPage language={language} />;
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

      {/* MODAL: Ticket OCR Scanner */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                <Camera size={18} className="text-emerald-600" />
                Numériseur OCR Floussi (Darija)
              </h3>
              <button 
                onClick={() => {
                  setShowOcrModal(false);
                  setScannedResult(null);
                }}
                className="p-1 hover:bg-slate-50 text-gray-400 hover:text-gray-900 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-gray-500">
              <p className="leading-relaxed text-gray-500">
                Uploadez ou prenez une photo de votre ticket de caisse (Marjane, BIM, Carrefour, Aswak Assalam). Notre IA Tesseract va extraire le montant total et le marchand automatiquement !
              </p>

              <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOcrFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="space-y-2">
                  <Camera size={28} className="text-gray-400 mx-auto" />
                  <p className="font-bold text-gray-700">Cliquez pour prendre une photo</p>
                  <p className="text-[10px] text-gray-400 font-medium">PNG, JPG, JPEG jusqu'à 5 MB</p>
                </div>
              </div>

              {isScanning && (
                <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl text-emerald-800">
                  <RefreshCw size={14} className="animate-spin text-emerald-600" />
                  <span>Analyse du ticket de caisse (Tesseract OCR)...</span>
                </div>
              )}

              {scannedResult && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3">
                  <h4 className="font-extrabold text-xs text-emerald-900 flex items-center gap-1">
                    <Sparkles size={14} className="text-emerald-600" />
                    Informations Extraites :
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-950 font-bold">
                    <div>Marchand : {scannedResult.merchant}</div>
                    <div>Montant : {scannedResult.amount} DH</div>
                    <div className="col-span-2">Date détectée : {scannedResult.date || "Aujourd'hui"}</div>
                  </div>

                  <button
                    onClick={handleApplyOcrResult}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
                  >
                    Enregistrer la dépense
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
