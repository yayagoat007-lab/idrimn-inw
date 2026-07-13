import React from 'react';
import { CreditCard, Landmark, Wallet, HelpCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface AccountSelectorProps {
  selectedAccountId: string;
  onChange: (id: string) => void;
  language: 'fr' | 'darija';
}

export function AccountSelector({
  selectedAccountId,
  onChange,
  language
}: AccountSelectorProps) {
  
  // Custom list of pre-configured accounts
  const ACCOUNTS = [
    {
      id: 'acc-cash',
      name: 'Cash (Porte-monnaie)',
      type: 'cash',
      balance: 3250,
      icon: Wallet,
      color: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    {
      id: 'acc-checking',
      name: 'Compte Courant (CIH / Attijari)',
      type: 'checking',
      balance: 12500,
      icon: CreditCard,
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      id: 'acc-savings',
      name: 'Compte Épargne (Tawfir)',
      type: 'savings',
      balance: 34000,
      icon: Landmark,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }
  ];

  return (
    <div className="space-y-1.5 font-sans">
      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        Compte de transaction (Compte)
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {ACCOUNTS.map(acc => {
          const isSelected = selectedAccountId === acc.id;
          const Icon = acc.icon;

          return (
            <button
              key={acc.id}
              type="button"
              onClick={() => onChange(acc.id)}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${isSelected ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/10' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${acc.color}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 truncate leading-tight">{acc.name}</p>
                <p className="text-[10px] font-bold text-slate-400 leading-none mt-0.5">{formatCurrency(acc.balance)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
