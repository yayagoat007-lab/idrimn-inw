import { useState, useEffect, useCallback } from 'react';
import { buildSearchIndex, searchItems, getQuickActions, SearchableItem } from '../lib/global-search';

export function useGlobalSearch(userId: string = "mock-user-id-9999") {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchableItem[]>([]);
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const recentSearchesKey = `floussi_recent_searches_${userId}`;

  // Load recent searches on mount/user change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(recentSearchesKey);
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (_) {
          setRecentSearches([]);
        }
      } else {
        setRecentSearches([]);
      }
    }
  }, [userId, recentSearchesKey]);

  // Open & Rebuild index
  const openSearch = useCallback(async () => {
    setIsOpen(true);
    // Rebuild index ONLY at opening of the search
    const index = await buildSearchIndex(userId);
    setSearchIndex(index);
  }, [userId]);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(recentSearchesKey);
  }, [recentSearchesKey]);

  // Add recent search query
  const addRecentSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem(recentSearchesKey, JSON.stringify(updated));
      return updated;
    });
  }, [recentSearchesKey]);

  // Debounced search execution
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const actions = getQuickActions(query);
      const items = searchItems(query, searchIndex);
      
      // Filter out duplicate IDs just in case
      const seen = new Set<string>();
      const combined = [...actions, ...items].filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      setResults(combined);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, searchIndex]);

  return {
    query,
    setQuery,
    results,
    recentSearches,
    clearRecentSearches,
    addRecentSearch,
    isOpen,
    openSearch,
    closeSearch
  };
}
export type UseGlobalSearchReturn = ReturnType<typeof useGlobalSearch>;
