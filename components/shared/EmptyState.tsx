import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-4 max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-xs">
        <Icon size={20} />
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{title}</h4>
        <p className="text-[11px] text-slate-400 font-bold uppercase leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer inline-block"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
export default EmptyState;
