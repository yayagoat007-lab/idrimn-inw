import React from 'react';
import { Trash2, Edit2, Plus, RefreshCw, AlertCircle, ShoppingBag, Check } from 'lucide-react';
import { LineItem } from '../../lib/receipt-parser';
import { categorizeLineItem } from '../../lib/receipt-categorizer';
import { formatCurrency } from '../../lib/utils';

interface ReceiptLineItemsPreviewProps {
  lineItems: LineItem[];
  onChange: (items: LineItem[]) => void;
  lang: 'fr' | 'darija';
}

export function ReceiptLineItemsPreview({
  lineItems,
  onChange,
  lang
}: ReceiptLineItemsPreviewProps) {

  const handleUpdateItem = (index: number, updatedFields: Partial<LineItem>) => {
    const nextItems = [...lineItems];
    nextItems[index] = { ...nextItems[index], ...updatedFields };
    onChange(nextItems);
  };

  const handleDeleteItem = (index: number) => {
    const nextItems = lineItems.filter((_, i) => i !== index);
    onChange(nextItems);
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      name: lang === 'darija' ? 'Mouwamala jdida' : 'Nouvel article',
      quantity: 1,
      unitPrice: 10.00,
      isPromo: false
    };
    onChange([...lineItems, newItem]);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { fr: string; darija: string }> = {
      alimentation: { fr: 'Alimentation', darija: 'L-makla' },
      hygiene: { fr: 'Hygiène', darija: 'Ndafa' },
      logement: { fr: 'Maison / Logement', darija: 'Dar / Sandoq' },
      transport: { fr: 'Transport', font: 'Tomobile', darija: 'T-transport' } as any,
      telecom: { fr: 'Télécom', darija: 'Internet' },
      loisirs: { fr: 'Loisirs / Resto', darija: 'Dahcha / Qahwa' },
      education: { fr: 'Éducation', darija: 'Qraya' },
      autres: { fr: 'Autre', darija: 'Haja khra' }
    };
    // Fix transport label mismatch
    if (category === 'transport') {
      return lang === 'darija' ? 'T-transport' : 'Transport';
    }
    return lang === 'darija' ? labels[category]?.darija || category : labels[category]?.fr || category;
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h4 className="font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'darija' ? 'Articlat m-stikhrajin' : 'Articles détaillés détectés'}</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-mono">{lineItems.length}</span>
        </h4>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'darija' ? 'Zid article' : 'Ajouter'}</span>
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
        {lineItems.length === 0 ? (
          <p className="text-[10px] text-slate-400 font-bold text-center py-6">
            {lang === 'darija' ? "Walo makayn tta article m-stikhraj." : "Aucun article détecté. Ajoutez-en manuellement."}
          </p>
        ) : (
          lineItems.map((item, idx) => {
            const suggestedCategory = memorizeCategory(item.name);
            return (
              <div 
                key={idx}
                className={`p-3 rounded-xl border transition-all relative ${item.isPromo ? 'bg-rose-50/50 border-rose-200/50' : 'bg-slate-50 border-slate-200/40 hover:border-slate-200'}`}
              >
                {/* Promo Badge */}
                {item.isPromo && (
                  <span className="absolute top-2 right-2 inline-block text-[8px] bg-rose-500 text-white font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                    {lang === 'darija' ? 'Takhfid' : 'Promo'}
                  </span>
                )}

                <div className="flex flex-col gap-2">
                  {/* Row 1: Name and Category */}
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, { name: e.target.value })}
                      className="font-extrabold text-slate-800 bg-transparent border-b border-transparent focus:border-slate-400 focus:outline-hidden py-0.5 flex-1 text-xs truncate min-w-0"
                    />
                    
                    <span className="inline-block text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">
                      {getCategoryLabel(suggestedCategory)}
                    </span>
                  </div>

                  {/* Row 2: Quantity, price & promo checkbox */}
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-200/40">
                    <div className="flex items-center gap-2">
                      {/* Quantity */}
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Qty</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, { quantity: parseInt(e.target.value, 10) || 1 })}
                          className="w-8 text-center font-bold font-mono focus:outline-hidden text-[11px]"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">
                        <span className="text-[9px] text-slate-400 font-bold">DH</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                          className="w-14 text-center font-bold font-mono focus:outline-hidden text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Promo toggle */}
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isPromo}
                          onChange={(e) => handleUpdateItem(idx, { isPromo: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-rose-500 focus:ring-rose-400 border-slate-300"
                        />
                        <span className="text-[9px] font-bold text-slate-500">{lang === 'darija' ? 'Promo' : 'Promo'}</span>
                      </label>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Calculated Total for confirmation */}
      <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between font-mono">
        <span className="text-[10px] font-black uppercase text-slate-400">Total calculé articles</span>
        <span className="text-sm font-black text-emerald-400">
          {formatCurrency(
            lineItems.reduce((acc, item) => {
              const cost = item.quantity * item.unitPrice;
              return item.isPromo && cost > 0 ? acc - cost : acc + cost;
            }, 0),
            'fr'
          ).replace('MAD', 'DH')}
        </span>
      </div>
    </div>
  );
}

// Simple memo wrapper around helper to avoid re-renders
function memorizeCategory(name: string): string {
  return categorizeLineItem(name);
}
