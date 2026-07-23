import React from 'react';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface WidgetDragHandleProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function WidgetDragHandle({
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false
}: WidgetDragHandleProps) {
  return (
    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl p-1 shrink-0 shadow-sm">
      {/* Visual Grip Handle */}
      <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1 transition-colors" title="Glisser pour réordonner">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Accessible Reorder Arrows */}
      <div className="flex items-center gap-0.5 border-l border-slate-200/60 pl-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onMoveUp) onMoveUp();
          }}
          disabled={isFirst}
          className={`p-1 rounded-md transition-colors ${
            isFirst
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100 cursor-pointer'
          }`}
          title="Monter"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onMoveDown) onMoveDown();
          }}
          disabled={isLast}
          className={`p-1 rounded-md transition-colors ${
            isLast
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100 cursor-pointer'
          }`}
          title="Descendre"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
