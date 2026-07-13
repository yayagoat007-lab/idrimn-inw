import React, { useState } from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';

interface ExpertTipCardProps {
  category: string;
  title: string;
  content: string;
  onApply: () => void;
}

export function ExpertTipCard({ category, title, content, onApply }: ExpertTipCardProps) {
  const [applied, setApplied] = useState(false);

  const handleApplyClick = () => {
    onApply();
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="border border-amber-200/60 rounded-2xl p-4 bg-amber-50/20 shadow-xs relative overflow-hidden">
      <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-amber-100/40 flex items-center justify-center text-amber-600">
        <Sparkles className="w-4 h-4" />
      </div>

      <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">
        Conseil de l'expert : {category}
      </span>

      <h4 className="text-xs font-black text-slate-800 mt-1 mb-2">
        {title}
      </h4>

      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mb-4 pr-6">
        {content}
      </p>

      <button
        onClick={handleApplyClick}
        disabled={applied}
        className={`w-full py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 ${
          applied 
            ? 'bg-emerald-600 text-white' 
            : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
        }`}
      >
        {applied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Conseil Appliqué !</span>
          </>
        ) : (
          <>
            <span>Appliquer ce conseil</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
}
export default ExpertTipCard;
