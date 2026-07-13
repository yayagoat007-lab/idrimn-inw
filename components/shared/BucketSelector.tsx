import React from 'react';
import { Bucket } from '../../types';
import { formatCurrency } from '../../lib/utils';
import * as Icons from 'lucide-react';

interface BucketSelectorProps {
  buckets: Bucket[];
  selectedBucketId: string | null;
  onChange: (id: string | null) => void;
  language: 'fr' | 'darija';
}

export function BucketSelector({
  buckets,
  selectedBucketId,
  onChange,
  language
}: BucketSelectorProps) {
  return (
    <div className="space-y-1.5 font-sans">
      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        Compartiment (Sanadouq)
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${selectedBucketId === null ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/10' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <Icons.Layers size={15} />
            </div>
            <span className="text-xs font-black text-slate-800">Aucun compartiment</span>
          </div>
        </button>

        {buckets.map(b => {
          const IconComponent = (Icons as any)[b.icon] || Icons.Layers;
          const isSelected = selectedBucketId === b.id;
          const remaining = b.allocated_amount - b.spent_amount;

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onChange(b.id)}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${isSelected ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/10' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: b.color }}
                >
                  <IconComponent size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate leading-tight">{b.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold leading-none mt-0.5">Reste : {formatCurrency(remaining)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
