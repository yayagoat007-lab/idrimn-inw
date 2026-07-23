import React, { useState } from 'react';
import { Search, RotateCcw, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { MOROCCAN_CATEGORIES, getCategoryName } from '../../lib/categories';
import { Bucket } from '../../types';
import { Language, t } from '../../lib/i18n';

interface TransactionFiltersProps {
  buckets: Bucket[];
  language: Language;
  activeFilters: {
    search: string;
    type: string;
    category: string;
    accountId: string;
    bucketId: string;
    status: string;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}

export function TransactionFilters({
  buckets,
  language,
  activeFilters,
  onFilterChange,
  onReset
}: TransactionFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    onFilterChange({
      ...activeFilters,
      [field]: value
    });
  };

  const activeChips = Object.entries(activeFilters).filter(([k, v]) => v !== '');

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
      {/* Primary search and type bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={activeFilters.search}
            onChange={(e) => handleFieldChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            placeholder={t('searchPlaceholder', language)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Quick type filter */}
          <select
            value={activeFilters.type}
            onChange={(e) => handleFieldChange('type', e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">{t('allTypes', language)}</option>
            <option value="expense">{t('expenses', language)}</option>
            <option value="income">{t('incomes', language)}</option>
            <option value="transfer">{t('transfers', language)}</option>
          </select>

          {/* Quick account filter */}
          <select
            value={activeFilters.accountId}
            onChange={(e) => handleFieldChange('accountId', e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">{t('allAccounts', language)}</option>
            <option value="acc-cash">{t('cashDarija', language)}</option>
            <option value="acc-checking">{t('checkingCIH', language)} ({t('courant', language)})</option>
            <option value="acc-savings">{t('savingsAccount', language)} ({t('epargne', language)})</option>
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Filter size={14} />
            <span>{t('filters', language)}</span>
            {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {activeChips.length > 0 && (
            <button
              onClick={onReset}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-2xl border border-slate-100 transition-colors cursor-pointer"
              title="Réinitialiser"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters block */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-50 animate-fadeIn">
          {/* Category filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t('category', language)}</label>
            <select
              value={activeFilters.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">{t('allCategories', language)}</option>
              {MOROCCAN_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{getCategoryName(cat, language)}</option>
              ))}
            </select>
          </div>

          {/* Bucket filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t('compartimentLabel', language)}</label>
            <select
              value={activeFilters.bucketId}
              onChange={(e) => handleFieldChange('bucketId', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">{t('allCompartments', language)}</option>
              {buckets.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t('syncStatusLabel', language)}</label>
            <select
              value={activeFilters.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">{t('allStatuses', language)}</option>
              <option value="synced">{t('syncedOnline', language)}</option>
              <option value="pending">{t('pendingOffline', language)}</option>
              <option value="recurring">{t('recurrent', language)}</option>
            </select>
          </div>
        </div>
      )}

      {/* Chips of active filters */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-50">
          {activeChips.map(([key, value]) => {
            if (!value) return null;
            return (
              <span 
                key={key} 
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold capitalize"
              >
                <span>{key}: {value}</span>
                <button
                  onClick={() => handleFieldChange(key, '')}
                  className="hover:bg-emerald-100 p-0.5 rounded-full text-emerald-600 cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
