import React from 'react';
import { Home, Wallet, PiggyBank, Heart } from 'lucide-react';
import { useTranslation } from '../../hooks/use-translation';

interface BucketType {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  color: string;
  icon: React.ComponentType<any>;
}

interface BucketPreviewProps {
  buckets: BucketType[];
  incomeAmount: number;
}

export function BucketPreview({ buckets, incomeAmount }: BucketPreviewProps) {
  const { lang } = useTranslation();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4 font-sans select-none">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
          {lang === 'darija' ? "Kholasat t-taqsim" : "Aperçu de la répartition"}
        </h4>
        <span className="text-[10px] font-bold text-slate-400">Total : {formatCurrency(incomeAmount)}</span>
      </div>

      {/* Horizontal Stacking Distribution Bar */}
      <div className="h-5.5 w-full bg-slate-100 rounded-2xl overflow-hidden flex shadow-xs border border-white">
        {buckets.map((b) => {
          if (b.percentage <= 0) return null;
          return (
            <div
              key={b.id}
              className={`h-full ${b.color} transition-all duration-300 relative group`}
              style={{ width: `${b.percentage}%` }}
              title={`${b.name} : ${b.percentage}%`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white opacity-85 hover:opacity-100">
                {b.percentage >= 8 && `${b.percentage}%`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Buckets Breakdown List */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {buckets.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.id} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg text-white ${b.color} flex-shrink-0 shadow-xs`}>
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-black text-[10px] text-slate-800 truncate">{b.name}</span>
                  <span className="text-[9px] font-bold text-slate-400">{b.percentage}%</span>
                </div>
                <div className="text-[10px] font-extrabold text-emerald-600 mt-0.5">
                  {formatCurrency(b.amount)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default BucketPreview;
