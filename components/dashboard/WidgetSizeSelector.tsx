import React from 'react';
import { Minimize2, Maximize2, Square } from 'lucide-react';
import { Language } from '../../lib/i18n';

interface WidgetSizeSelectorProps {
  currentSize: 'compact' | 'normal' | 'large';
  sizeOptions: ('compact' | 'normal' | 'large')[];
  onChangeSize: (size: 'compact' | 'normal' | 'large') => void;
  language: Language;
}

export function WidgetSizeSelector({
  currentSize,
  sizeOptions,
  onChangeSize,
  language
}: WidgetSizeSelectorProps) {
  if (sizeOptions.length <= 1) return null;

  const sizeLabels: Record<'compact' | 'normal' | 'large', { fr: string; darija: string; icon: React.ReactNode }> = {
    compact: {
      fr: "Compact",
      darija: "Sghir",
      icon: <Minimize2 className="w-3 h-3" />
    },
    normal: {
      fr: "Normal",
      darija: "3adi",
      icon: <Square className="w-3 h-3" />
    },
    large: {
      fr: "Large",
      darija: "Kbir",
      icon: <Maximize2 className="w-3 h-3" />
    }
  };

  return (
    <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50 gap-0.5 shadow-sm text-[10px] font-black uppercase shrink-0">
      {sizeOptions.map(size => {
        const isActive = currentSize === size;
        const labels = sizeLabels[size];

        return (
          <button
            key={size}
            onClick={(e) => {
              e.stopPropagation();
              onChangeSize(size);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              isActive
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'
            }`}
          >
            {labels.icon}
            <span>{language === 'fr' ? labels.fr : labels.darija}</span>
          </button>
        );
      })}
    </div>
  );
}
