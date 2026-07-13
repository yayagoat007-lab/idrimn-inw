import React from 'react';
import { MOROCCAN_CATEGORIES, Category, getCategoryName } from '../../lib/categories';
import * as Icons from 'lucide-react';

interface CategorySelectorProps {
  selectedCategoryId: string;
  onChange: (id: string) => void;
  language: 'fr' | 'darija';
}

export function CategorySelector({
  selectedCategoryId,
  onChange,
  language
}: CategorySelectorProps) {
  return (
    <div className="space-y-2 font-sans">
      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        Catégorie (Féat d'Drahem)
      </label>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {MOROCCAN_CATEGORIES.map(cat => {
          const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer hover:bg-slate-50 ${isSelected ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/10' : 'border-slate-100'}`}
            >
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: cat.color }}
              >
                <IconComponent size={16} />
              </div>
              <span className="text-[10px] font-black tracking-tight leading-tight line-clamp-1">
                {getCategoryName(cat, language)}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => alert("Fonctionnalité Premium: Customisation des catégories")}
          className="p-2.5 rounded-2xl border border-dashed border-slate-200 transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer hover:bg-slate-50 text-slate-400"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <Icons.Plus size={16} />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Ajouter</span>
        </button>
      </div>
    </div>
  );
}
