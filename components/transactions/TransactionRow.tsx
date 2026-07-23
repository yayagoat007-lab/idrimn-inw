import React from 'react';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { getCategoryById, getCategoryName } from '../../lib/categories';
import { Language, t } from '../../lib/i18n';
import * as Icons from 'lucide-react';

interface TransactionRowProps {
  key?: any;
  transaction: Transaction;
  language: Language;
  variant?: 'simple' | 'complete';
  onDelete?: (id: string) => void;
  onDuplicate?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  onSplit?: (transaction: Transaction) => void;
}

export function TransactionRow({
  transaction,
  language,
  variant = 'complete',
  onDelete,
  onDuplicate,
  onEdit,
  onSplit
}: TransactionRowProps) {
  const categoryData = getCategoryById(transaction.category);
  const IconComponent = categoryData ? (Icons as any)[categoryData.icon] || Icons.HelpCircle : Icons.HelpCircle;

  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';

  const amountColor = isExpense 
    ? 'text-rose-600' 
    : isIncome 
      ? 'text-emerald-600' 
      : 'text-blue-600';

  const amountSign = isExpense ? '-' : isIncome ? '+' : '';

  const isPendingSync = transaction.id.startsWith('temp-') || transaction.tags.includes('en-attente');

  // Simple row for dashboard
  if (variant === 'simple') {
    return (
      <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors">
        <div className="flex items-center gap-3.5 min-w-0">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{ backgroundColor: categoryData?.color || '#94A3B8' }}
          >
            <IconComponent size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="font-extrabold text-xs text-slate-800 truncate">
              {transaction.description}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {transaction.merchant || t('commerce', language)}
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-[10px] font-semibold text-slate-400">
                {formatDate(transaction.transaction_date)}
              </span>
              {isPendingSync && (
                <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                  <Icons.RefreshCw size={8} className="animate-spin" />
                  {t('offline', language)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className={`font-black text-xs tracking-tight ${amountColor}`}>
            {amountSign}{formatCurrency(transaction.amount)}
          </p>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {transaction.account_id === 'acc-cash' ? t('cash', language) : t('carte', language)}
          </span>
        </div>
      </div>
    );
  }

  // Complete row for transactions table / list
  return (
    <tr className="hover:bg-slate-50/70 border-b border-slate-100/80 transition-colors group">
      {/* Date */}
      <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold text-slate-500">
        <div className="flex flex-col">
          <span>{formatDate(transaction.transaction_date)}</span>
          <span className="text-[10px] text-slate-400 font-bold">{transaction.transaction_date}</span>
        </div>
      </td>

      {/* Compte */}
      <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-600">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${transaction.account_id === 'acc-cash' ? 'bg-amber-500' : 'bg-blue-500'}`} />
          <span className="capitalize">{transaction.account_id === 'acc-cash' ? t('cash', language) : transaction.account_id === 'acc-checking' ? t('courant', language) : t('epargne', language)}</span>
        </div>
      </td>

      {/* Bénéficiaire */}
      <td className="px-5 py-4 whitespace-nowrap text-xs font-extrabold text-slate-900">
        <span className="line-clamp-1">{transaction.merchant || '-'}</span>
      </td>

      {/* Mémo */}
      <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-600 max-w-xs truncate">
        <span>{transaction.description}</span>
      </td>

      {/* Catégorie */}
      <td className="px-5 py-4 whitespace-nowrap">
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-xs"
          style={{ backgroundColor: categoryData?.color || '#94A3B8' }}
        >
          <IconComponent size={11} />
          <span>{categoryData ? getCategoryName(categoryData, language) : t('autre', language)}</span>
        </span>
      </td>

      {/* Montant */}
      <td className="px-5 py-4 whitespace-nowrap text-right text-xs font-black tracking-tight">
        <div className="flex flex-col items-end">
          <span className={amountColor}>
            {amountSign}{formatCurrency(transaction.amount)}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {transaction.is_recurring && (
              <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-[8px] font-bold uppercase tracking-wider">
                {t('recurrent', language)}
              </span>
            )}
            {transaction.bucket_id && (
              <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-md text-[8px] font-bold uppercase tracking-wider">
                {t('sanadiq', language)}
              </span>
            )}
            {isPendingSync && (
              <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                <Icons.RefreshCw size={8} className="animate-spin" />
                {t('attente', language)}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 whitespace-nowrap text-right text-xs font-bold">
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(transaction)}
              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              title={t('dupliquer', language)}
            >
              <Icons.Copy size={14} />
            </button>
          )}
          {onSplit && (
            <button
              onClick={() => onSplit(transaction)}
              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
              title={t('repartir', language)}
            >
              <Icons.Percent size={14} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
              title={t('edit', language)}
            >
              <Icons.Edit3 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
              title={t('delete', language)}
            >
              <Icons.Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
