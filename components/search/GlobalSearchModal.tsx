import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Receipt, 
  Layers, 
  Target, 
  Users, 
  Wallet, 
  MessageSquare, 
  BookOpen, 
  PlusCircle, 
  Bot, 
  Sparkles,
  X,
  Search,
  CornerDownLeft,
  Trash2,
  History
} from 'lucide-react';
import { SearchableItem, normalizeText } from '../../lib/global-search';
import { useFocusTrap } from '../../hooks/use-focus-trap';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
  results: SearchableItem[];
  recentSearches: string[];
  clearRecentSearches: () => void;
  addRecentSearch: (q: string) => void;
  language: 'fr' | 'darija';
  onNavigate: (screen: string) => void;
}

const IconMap = {
  Receipt,
  Layers,
  Target,
  Users,
  Wallet,
  MessageSquare,
  BookOpen,
  PlusCircle,
  Bot,
  Sparkles,
  Search
};

const TRANSLATIONS = {
  fr: {
    placeholder: "Rechercher des transactions, enveloppes, objectifs, Jmâa...",
    recentSearches: "Recherches récentes",
    clear: "Effacer",
    noResults: "Aucun résultat trouvé pour",
    searchTips: "Conseils : Tapez 'ajouter' pour une transaction ou 'sidi' pour l'assistant.",
    quickActions: "Actions rapides",
    tipSub: "Vérifiez l'orthographe ou essayez d'autres mots-clés comme \"mizaniya\" ou \"sidi\".",
    groupHeaders: {
      transaction: "Transactions",
      bucket: "Enveloppes (Buckets)",
      goal: "Objectifs d'Épargne",
      tontine: "Daret (Jmâa)",
      networth: "Patrimoine (Net Worth)",
      community_post: "Discussions communauté",
      academy_lesson: "Académie Floussi",
      action: "Actions rapides"
    }
  },
  darija: {
    placeholder: "Keleb 3la mouamalat, zrouf, ahdaf d-tawfir, daret...",
    recentSearches: "Bohout Sabiqa",
    clear: "Mseh",
    noResults: "Hatta Natija ma lqina l-",
    searchTips: "Nasiha: Kteb 'ajouter' bach t-zid chi mouamala aw 'sidi' bach t-hder m3ah.",
    quickActions: "Ijra'at sariaa",
    tipSub: "T'haqqeq m-l-kteba aw jerrab kalimat khrin bhal \"mizaniya\" aw \"sidi\".",
    groupHeaders: {
      transaction: "Mouamalat d-flouss",
      bucket: "Zrouf (Buckets)",
      goal: "Ahdaf d-Tawfir",
      tontine: "Daret (Jmâa)",
      networth: "Patrimoine (Net Worth)",
      community_post: "Mansourat l-Moutada",
      academy_lesson: "Dorous dyal L-Academie",
      action: "Ijra'at sariaa"
    }
  }
};

const groupOrder: SearchableItem['type'][] = [
  'action',
  'transaction',
  'bucket',
  'goal',
  'tontine',
  'networth',
  'community_post',
  'academy_lesson'
];

function SearchItemIcon({ name, className = 'w-4 h-4' }: { name: string; className?: string }) {
  const IconComponent = IconMap[name as keyof typeof IconMap] || Sparkles;
  return <IconComponent className={className} />;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  query,
  setQuery,
  results,
  recentSearches,
  clearRecentSearches,
  addRecentSearch,
  language = 'fr',
  onNavigate
}: GlobalSearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  // Group items & flatten in display order
  const grouped: Record<string, SearchableItem[]> = {};
  results.forEach(item => {
    if (!grouped[item.type]) {
      grouped[item.type] = [];
    }
    grouped[item.type].push(item);
  });

  const orderedResults: SearchableItem[] = [];
  groupOrder.forEach(type => {
    if (grouped[type]) {
      orderedResults.push(...grouped[type]);
    }
  });

  // Reset selected item when query or results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results]);

  // Focus input on mount/open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (orderedResults.length > 0) {
        setSelectedIndex(prev => (prev + 1) % orderedResults.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (orderedResults.length > 0) {
        setSelectedIndex(prev => (prev - 1 + orderedResults.length) % orderedResults.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (orderedResults.length > 0 && orderedResults[selectedIndex]) {
        handleSelectItem(orderedResults[selectedIndex]);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelectItem = (item: SearchableItem) => {
    addRecentSearch(query || item.title);
    onClose();

    // Trigger actions vs raw navigation
    if (item.navigationTarget === 'action:add-transaction') {
      window.dispatchEvent(new CustomEvent('open-transaction-modal'));
    } else if (item.navigationTarget === 'action:add-goal') {
      onNavigate('goals');
      // Delay slightly to allow GoalsPage to mount and listen
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-goal-creator'));
      }, 150);
    } else if (item.navigationTarget === 'action:talk-sidi') {
      window.dispatchEvent(new CustomEvent('open-sidi-chat'));
    } else {
      onNavigate(item.navigationTarget);
    }
  };

  // Highlight matched substrings
  function HighlightMatch({ text, searchQuery }: { text: string; searchQuery: string }) {
    if (!searchQuery.trim()) return <>{text}</>;

    const normQuery = normalizeText(searchQuery);
    const words = normQuery.split(/\s+/).filter(Boolean);
    if (words.length === 0) return <>{text}</>;

    // Escape special regex characters in the words
    const escapedWords = words.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const pattern = new RegExp(`(${escapedWords.join('|')})`, 'gi');

    const parts = text.split(pattern);
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = words.some(w => normalizeText(part).toLowerCase() === normalizeText(w).toLowerCase());
          return isMatch ? (
            <mark key={i} className="bg-amber-100 text-amber-900 font-extrabold px-0.5 rounded-sm">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
      </>
    );
  }

  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-0 md:p-4 bg-slate-900/45 backdrop-blur-md">
        {/* Backdrop clickable Area to close */}
        <div className="absolute inset-0 cursor-default" onClick={onClose} />

        {/* Modal Window */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
          className="relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-2xl bg-white md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 z-10"
          onKeyDown={handleKeyDown}
        >
          {/* Header Search Field */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 text-sm md:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Fermer la recherche globale / إغلاق البحث الشامل"
              className="text-xs font-black uppercase text-slate-400 hover:text-slate-800 md:hidden ml-2 cursor-pointer"
            >
              {language === 'darija' ? "Sedd" : "Fermer"}
            </button>
            {/* Desktop shortcut tip */}
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              ESC
            </span>
          </div>

          {/* Results Area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh] md:max-h-[50vh] min-h-[150px] bg-slate-50/50"
          >
            {/* 1. Empty query state - Show recent searches & tips */}
            {!query.trim() && (
              <div className="space-y-4">
                {recentSearches.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" />
                        {t.recentSearches}
                      </h4>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[10px] font-black text-rose-500 hover:text-rose-700 hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t.clear}
                      </button>
                    </div>

                    <div className="space-y-1">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => setQuery(search)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5 text-slate-400" />
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Advice tips */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    {language === 'darija' ? "Nasiha Floussi" : "Conseil Floussi"}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    {t.searchTips}
                  </p>
                </div>
              </div>
            )}

            {/* 2. Dynamic Search Results matching */}
            {query.trim() && orderedResults.length > 0 && (
              <div className="space-y-4">
                {groupOrder.map(type => {
                  const items = grouped[type];
                  if (!items || items.length === 0) return null;

                  return (
                    <div key={type} className="space-y-1">
                      {/* Header Group */}
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 py-1">
                        {t.groupHeaders[type] || type}
                      </h4>

                      {/* Items */}
                      <div className="space-y-1">
                        {items.map(item => {
                          const isSelected = orderedResults[selectedIndex]?.id === item.id;
                          const absoluteIndex = orderedResults.findIndex(x => x.id === item.id);

                          return (
                            <button
                              key={item.id}
                              data-selected={isSelected}
                              onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                              onClick={() => handleSelectItem(item)}
                              className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-4 transition-all relative group cursor-pointer ${
                                isSelected 
                                  ? 'bg-slate-900 text-white shadow-md scale-[1.01]' 
                                  : 'bg-white hover:bg-slate-100 border border-slate-100/60 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Icon container with customizable visual theme */}
                                <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                                  isSelected 
                                    ? 'bg-slate-800 text-amber-400' 
                                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                }`}>
                                  <SearchItemIcon name={item.icon} className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-xs font-black truncate leading-tight">
                                    <HighlightMatch text={item.title} searchQuery={query} />
                                  </p>
                                  <p className={`text-[10px] truncate mt-0.5 font-bold ${
                                    isSelected ? 'text-slate-300' : 'text-slate-400'
                                  }`}>
                                    <HighlightMatch text={item.subtitle} searchQuery={query} />
                                  </p>
                                </div>
                              </div>

                              {/* Desktop specific selected arrow indicator feedback */}
                              <div className="shrink-0 flex items-center gap-1.5">
                                {isSelected && (
                                  <span className="hidden md:flex items-center gap-1 text-[8px] font-black uppercase text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-md">
                                    <CornerDownLeft className="w-2.5 h-2.5 text-amber-400" />
                                    ENTRER
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. Empty matching results search state */}
            {query.trim() && orderedResults.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <Search className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                <p className="text-xs font-black text-slate-600">
                  {t.noResults} <span className="text-amber-600">"{query}"</span>
                </p>
                <p className="text-[10px] font-bold text-slate-400 max-w-xs mx-auto">
                  {t.tipSub}
                </p>
              </div>
            )}
          </div>

          {/* Footer Stats / Shortcut hints bar */}
          <div className="hidden md:flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-3xs">↑↓</span>
                {language === 'darija' ? 'Tajah' : 'Navigate'}
              </span>
              <span className="flex items-center gap-1">
                <span className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-3xs">ENTER</span>
                {language === 'darija' ? 'Ikhtar' : 'Select'}
              </span>
              <span className="flex items-center gap-1">
                <span className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-3xs">ESC</span>
                {language === 'darija' ? 'Sedd' : 'Close'}
              </span>
            </div>
            {query.trim() && (
              <div>
                {language === 'darija'
                  ? `${orderedResults.length} ${orderedResults.length > 1 ? "nata'ij lqina" : "natija lqina"}`
                  : `${orderedResults.length} ${orderedResults.length > 1 ? 'résultats trouvés' : 'résultat trouvé'}`}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
