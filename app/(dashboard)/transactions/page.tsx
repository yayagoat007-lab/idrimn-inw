"use client";

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useTransactions } from '../../../hooks/use-transactions';
import { useBuckets } from '../../../hooks/use-buckets';
import { useOffline } from '../../../hooks/use-offline';
import { useAds } from '../../../hooks/use-ads';

import { TransactionTable } from '../../../components/transactions/TransactionTable';
import { TransactionFilters } from '../../../components/transactions/TransactionFilters';
import { DateRangePicker } from '../../../components/shared/DateRangePicker';
import { QuickAddModal } from '../../../components/shared/QuickAddModal';
import { SyncStatusBadge } from '../../../components/shared/SyncStatusBadge';
import { SkeletonCard } from '../../../components/shared/SkeletonCard';
import { AdBanner } from '../../../components/ads/AdBanner';

import { formatCurrency } from '../../../lib/utils';
import { generateId } from '../../../lib/utils';
import { Language } from '../../../lib/i18n';
import { Plus, Download, RefreshCw, Layers, PieChart, Sparkles, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Transaction } from '../../../types';

interface TransactionsPageProps {
  language: Language;
  onNavigate: (route: string) => void;
  userTier: string;
}

export default function TransactionsPage({
  language,
  onNavigate,
  userTier
}: TransactionsPageProps) {
  const { user } = useAuth();
  const userId = user?.id || "mock-user-id-9999";

  const { buckets } = useBuckets(userId);
  const { transactions, loading: txsLoading, createTransaction, deleteTransaction, getCashRatio } = useTransactions(userId);
  const { isOnline, isSyncing } = useOffline();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<Transaction | null>(null);

  // Date range state: default to this month (e.g., July 1, 2026 to July 31, 2026)
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-31');

  // Active filters state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    accountId: '',
    bucketId: '',
    status: ''
  });

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      accountId: '',
      bucketId: '',
      status: ''
    });
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Date range filter
      if (t.transaction_date < startDate || t.transaction_date > endDate) {
        return false;
      }

      // 2. Text search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const descMatch = t.description.toLowerCase().includes(query);
        const merchantMatch = (t.merchant || '').toLowerCase().includes(query);
        const tagMatch = t.tags.some(tag => tag.toLowerCase().includes(query));
        if (!descMatch && !merchantMatch && !tagMatch) {
          return false;
        }
      }

      // 3. Type
      if (filters.type && t.type !== filters.type) {
        return false;
      }

      // 4. Category
      if (filters.category && t.category !== filters.category) {
        return false;
      }

      // 5. Account ID
      if (filters.accountId && t.account_id !== filters.accountId) {
        return false;
      }

      // 6. Bucket ID
      if (filters.bucketId && t.bucket_id !== filters.bucketId) {
        return false;
      }

      // 7. Status (offline/online/recurring)
      if (filters.status) {
        const isOfflineTx = t.id.startsWith('temp-');
        if (filters.status === 'pending' && !isOfflineTx) return false;
        if (filters.status === 'synced' && isOfflineTx) return false;
        if (filters.status === 'recurring' && !t.is_recurring) return false;
      }

      return true;
    });
  }, [transactions, startDate, endDate, filters]);

  // Calculations based on filtered set
  const totalInflow = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalOutflow = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const cashRatio = getCashRatio();

  // Duplicate transaction (1-click)
  const handleDuplicate = async (tx: Transaction) => {
    const { id, created_at, updated_at, ...dataToCopy } = tx;
    const duplicatedData = {
      ...dataToCopy,
      description: `${tx.description} (Copie)`,
      transaction_date: new Date().toISOString().split('T')[0]
    };
    await createTransaction(duplicatedData);
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  // Split transaction (splitting into two halves for family / business purposes)
  const handleSplit = async (tx: Transaction) => {
    const splitAmount = Math.round((tx.amount / 2) * 100) / 100;
    
    // First update current transaction amount to splitAmount
    // (For simulation simplicity we delete and re-create two transactions of splitAmount)
    await deleteTransaction(tx.id);

    const payload1 = {
      ...tx,
      id: undefined,
      amount: splitAmount,
      description: `${tx.description} (Partie 1/2)`,
    };
    const payload2 = {
      ...tx,
      id: undefined,
      amount: splitAmount,
      description: `${tx.description} (Partie 2/2)`,
    };

    await createTransaction(payload1);
    await createTransaction(payload2);

    alert(`Transaction de ${tx.amount} DH éclatée avec succès en deux transactions de ${splitAmount} DH.`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Saisies & Historique</h2>
          <p className="text-xs text-slate-400 font-semibold">Gérez vos flux financiers (Dépenses, Revenus, Transferts)</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Synchronisation Status Badge */}
          <SyncStatusBadge isOnline={isOnline} isSyncing={isSyncing} />

          <button
            onClick={() => onNavigate('transactions/import')}
            className="px-4 py-2.5 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 font-extrabold rounded-2xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Importer</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus size={14} />
            <span>Nouvelle Saisie</span>
          </button>
        </div>
      </div>

      {/* Date range picker header filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 rounded-3xl gap-4 border border-slate-100/50">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Période du relevé :</span>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => { setStartDate(start); setEndDate(end); }}
            language={language}
          />
        </div>

        <div className="flex items-center gap-6 text-xs font-bold text-slate-600">
          <div>
            Entrées : <span className="font-black text-emerald-600">{formatCurrency(totalInflow)}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div>
            Sorties : <span className="font-black text-rose-600">{formatCurrency(totalOutflow)}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div>
            Darija Cash : <span className="font-black text-amber-600">{cashRatio}%</span>
          </div>
        </div>
      </div>

      {/* Filters search component */}
      <TransactionFilters
        buckets={buckets}
        activeFilters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Main transactions list table */}
      {txsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <TransactionTable
          transactions={filteredTransactions}
          language={language}
          onDelete={deleteTransaction}
          onDuplicate={handleDuplicate}
          onSplit={handleSplit}
        />
      )}

      {/* Banner Ad Sense */}
      <AdBanner unitId="transactions-footer-banner" userTier={userTier as any} />

      {/* Quick Add Form Modal */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        buckets={buckets}
        onAddTransaction={async (tx) => {
          await createTransaction(tx);
        }}
        language={language}
      />

    </div>
  );
}
