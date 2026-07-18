import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

interface SearchTriggerButtonProps {
  onClick: () => void;
  language: 'fr' | 'darija';
}

export function SearchTriggerButton({ onClick, language = 'fr' }: SearchTriggerButtonProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }
  }, []);

  const label = language === 'darija' ? 'Keleb...' : 'Rechercher...';
  const shortcutText = isMac ? '⌘K' : 'Ctrl+K';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 md:py-2 md:px-4 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/50 rounded-2xl transition-all cursor-pointer select-none text-left"
      title={`${label} (${shortcutText})`}
    >
      <Search size={16} className="text-slate-500 shrink-0" />
      
      {/* Desktop layout label + shortcut badge */}
      <span className="hidden md:inline text-xs font-semibold pr-3 shrink-0">
        {label}
      </span>
      <kbd className="hidden md:inline-flex items-center text-[9px] font-black tracking-wider text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg shadow-3xs ml-auto select-none uppercase">
        {shortcutText}
      </kbd>
    </button>
  );
}
