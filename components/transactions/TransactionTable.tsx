import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types';
import { TransactionRow } from './TransactionRow';
import { Language } from '../../lib/i18n';
import { EmptyState } from '../shared/EmptyState';
import { ChevronUp, ChevronDown, Eye, AlertCircle } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  language: Language;
  onDelete: (id: string) => void;
  onDuplicate?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  onSplit?: (transaction: Transaction) => void;
}

type SortField = 'date' | 'amount' | 'merchant' | 'category';
type SortOrder = 'asc' | 'desc';

export function TransactionTable({
  transactions,
  language,
  onDelete,
  onDuplicate,
  onEdit,
  onSplit
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'date') {
        comparison = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'merchant') {
        comparison = (a.merchant || '').localeCompare(b.merchant || '');
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [transactions, sortField, sortOrder]);

  // Group by date if sorted by date
  const groupedTransactions = useMemo(() => {
    if (sortField !== 'date') return null;

    const groups: Record<string, Transaction[]> = {};
    sortedTransactions.forEach(t => {
      const date = t.transaction_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(t);
    });
    return groups;
  }, [sortedTransactions, sortField]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />;
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
        <EmptyState
          title={language === 'darija' ? "Walo mouamalat" : "Aucune transaction"}
          description={language === 'darija' ? "Mazal madakhalti tal chi mouamala (Dépense awla Revenu)." : "Commencez à enregistrer vos dépenses et revenus pour voir l'historique de vos flux."}
          icon={AlertCircle}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100/85 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
              <th 
                className="px-5 py-4 cursor-pointer hover:text-slate-700 transition-colors"
                onClick={() => handleSort('date')}
              >
                Date <SortIcon field="date" />
              </th>
              <th className="px-5 py-4">Compte</th>
              <th 
                className="px-5 py-4 cursor-pointer hover:text-slate-700 transition-colors"
                onClick={() => handleSort('merchant')}
              >
                Bénéficiaire <SortIcon field="merchant" />
              </th>
              <th className="px-5 py-4">Memo</th>
              <th 
                className="px-5 py-4 cursor-pointer hover:text-slate-700 transition-colors"
                onClick={() => handleSort('category')}
              >
                Catégorie <SortIcon field="category" />
              </th>
              <th 
                className="px-5 py-4 text-right cursor-pointer hover:text-slate-700 transition-colors"
                onClick={() => handleSort('amount')}
              >
                Montant <SortIcon field="amount" />
              </th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupedTransactions ? (
              Object.keys(groupedTransactions).map(date => (
                <React.Fragment key={date}>
                  {/* Sticky daily group header */}
                  <tr className="bg-slate-50/30 sticky top-0 z-10">
                    <td colSpan={7} className="px-5 py-2.5 border-y border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {date} ({groupedTransactions[date].length} {groupedTransactions[date].length > 1 ? 'transactions' : 'transaction'})
                    </td>
                  </tr>
                  {groupedTransactions[date].map(t => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      language={language}
                      variant="complete"
                      onDelete={onDelete}
                      onDuplicate={onDuplicate}
                      onEdit={onEdit}
                      onSplit={onSplit}
                    />
                  ))}
                </React.Fragment>
              ))
            ) : (
              sortedTransactions.map(t => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  language={language}
                  variant="complete"
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onEdit={onEdit}
                  onSplit={onSplit}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
