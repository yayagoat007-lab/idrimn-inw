import React, { useState, useMemo } from 'react';
import { X, Check, PieChart, Info, Landmark, Layers } from 'lucide-react';
import { LineItem } from '../../lib/receipt-parser';
import { categorizeReceipt, CategorySplit } from '../../lib/receipt-categorizer';
import { Bucket } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface SplitByCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineItems: LineItem[];
  buckets: Bucket[];
  merchantName: string;
  receiptDate: string;
  onConfirmSplit: (splits: { category: string; amount: number; bucketId: string | null }[]) => void;
  lang: 'fr' | 'darija';
}

export function SplitByCategoryModal({
  isOpen,
  onClose,
  lineItems,
  buckets,
  merchantName,
  receiptDate,
  onConfirmSplit,
  lang
}: SplitByCategoryModalProps) {
  const splits = useMemo(() => categorizeReceipt(lineItems), [lineItems]);

  // Track which bucket each split category maps to
  const [bucketMappings, setBucketMappings] = useState<Record<string, string>>(() => {
    const initialMap: Record<string, string> = {};
    const processed = categorizeReceipt(lineItems);
    
    processed.forEach(split => {
      // Find a bucket that matches the category name/category field
      const matchingBucket = buckets.find(b => b.category.toLowerCase() === split.category.toLowerCase()) ||
                            buckets.find(b => b.name.toLowerCase().includes(split.category.toLowerCase())) ||
                            buckets[0];
      if (matchingBucket) {
        initialMap[split.category] = matchingBucket.id;
      }
    });
    return initialMap;
  });

  if (!isOpen) return null;

  const handleBucketChange = (category: string, bucketId: string) => {
    setBucketMappings(prev => ({
      ...prev,
      [category]: bucketId
    }));
  };

  const handleApply = () => {
    const finalSplits = splits.map(split => ({
      category: split.category,
      amount: split.totalForCategory,
      bucketId: bucketMappings[split.category] || null
    }));

    onConfirmSplit(finalSplits);
    onClose();
  };

  const getCategoryTitle = (category: string) => {
    const labels: Record<string, { fr: string; darija: string }> = {
      alimentation: { fr: 'Alimentation', darija: 'L-makla' },
      hygiene: { fr: 'Hygiène', darija: 'Ndafa' },
      logement: { fr: 'Maison / Logement', darija: 'Dar / Sandoq' },
      transport: { fr: 'Transport', darija: 'T-transport' },
      telecom: { fr: 'Télécom', darija: 'Internet' },
      loisirs: { fr: 'Loisirs / Resto', darija: 'Dahcha / Qahwa' },
      education: { fr: 'Éducation', darija: 'Qraya' },
      autres: { fr: 'Autre', darija: 'Haja khra' }
    };
    return lang === 'darija' ? labels[category]?.darija || category : labels[category]?.fr || category;
  };

  const totalSum = splits.reduce((acc, split) => acc + split.totalForCategory, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                {lang === 'darija' ? "T-9sim l'mouwamala b sandoq" : "Ventiler par catégorie (Split)"}
              </h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                {merchantName} • {receiptDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="m-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-950 rounded-2xl text-[11px] leading-relaxed font-semibold flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            {lang === 'darija' 
              ? "Sidi Floussi ghadi y-9sem l'mouwamala dyalek automatiquement 3la s-sandoqat. Kul sandoq ghadi y-9ta3 ghir l'montant dyalo s-shih!"
              : "Sidi Floussi va diviser cette transaction automatiquement. Chaque sandoq (budget) sera impacté exactement selon les articles qui lui correspondent !"}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-2 space-y-4 max-h-[50vh] overflow-y-auto">
          {/* Visual distribution bar */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Distribution du ticket</span>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
              {splits.map((split, i) => {
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-indigo-500'];
                const color = colors[i % colors.length];
                return (
                  <div 
                    key={split.category}
                    className={`${color} h-full transition-all`}
                    style={{ width: `${split.percentage}%` }}
                    title={`${getCategoryTitle(split.category)}: ${split.percentage}%`}
                  />
                );
              })}
            </div>
          </div>

          {/* Table of category mappings */}
          <div className="space-y-3 pt-2">
            {splits.map((split, i) => {
              const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-indigo-500'];
              const color = colors[i % colors.length];

              return (
                <div key={split.category} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-4">
                  {/* Category Name & Share */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`w-3 h-3 rounded-full ${color} shrink-0`} />
                    <div className="truncate min-w-0">
                      <p className="font-extrabold text-slate-800 text-xs truncate">
                        {getCategoryTitle(split.category)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono font-bold">
                        {split.percentage}% • {split.items.length} {split.items.length > 1 ? 'articles' : 'article'}
                      </p>
                    </div>
                  </div>

                  {/* Target Bucket Selector */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-mono text-xs font-black text-slate-900">
                        {formatCurrency(split.totalForCategory, 'fr').replace('MAD', 'DH')}
                      </span>
                    </div>

                    <select
                      value={bucketMappings[split.category] || ''}
                      onChange={(e) => handleBucketChange(split.category, e.target.value)}
                      className="text-[11px] font-black uppercase text-slate-600 bg-white border border-slate-200 rounded-xl px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">{lang === 'darija' ? "Bla sandoq" : "Sans budget"}</option>
                      {buckets.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info & Actions */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="font-mono">
            <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Somme à ventiler</span>
            <span className="text-sm font-black text-slate-900">
              {formatCurrency(totalSum, 'fr').replace('MAD', 'DH')}
            </span>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
            >
              {lang === 'darija' ? "Rj3" : "Retour"}
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check size={12} />
              <span>{lang === 'darija' ? "9bel l-9issma" : "Confirmer le split"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
