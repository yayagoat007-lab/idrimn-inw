import { useState, useEffect, useCallback } from 'react';
import { 
  getStorageHealthStatus, 
  getStorageBreakdownByCategory, 
  StorageHealthStatus, 
  StorageCategoryBreakdown 
} from '../lib/storage-quota-monitor';
import { 
  identifyCleanupCandidates, 
  executeCleanup as runCleanup, 
  CleanupCandidate 
} from '../lib/storage-cleanup-strategies';

export function useStorageHealth(userId: string, language: 'fr' | 'darija' = 'fr') {
  const [healthStatus, setHealthStatus] = useState<StorageHealthStatus>({
    usedBytes: 0,
    estimatedLimitBytes: 5 * 1024 * 1024,
    percentUsed: 0,
    healthLevel: 'healthy'
  });

  const [breakdown, setBreakdown] = useState<StorageCategoryBreakdown[]>([]);
  const [cleanupCandidates, setCleanupCandidates] = useState<CleanupCandidate[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);

  const refreshHealth = useCallback(() => {
    if (!userId) return;
    const status = getStorageHealthStatus(userId);
    setHealthStatus(status);

    const categoriesBreakdown = getStorageBreakdownByCategory(userId, language);
    setBreakdown(categoriesBreakdown);

    const candidates = identifyCleanupCandidates(userId);
    setCleanupCandidates(candidates);
  }, [userId, language]);

  useEffect(() => {
    refreshHealth();

    // Listen to all events that might change storage usage
    window.addEventListener('floussi_transactions_updated', refreshHealth);
    window.addEventListener('floussi_notifications_updated', refreshHealth);
    window.addEventListener('floussi_sidi_history_updated', refreshHealth);
    window.addEventListener('floussi_storage_cleaned', refreshHealth);

    return () => {
      window.removeEventListener('floussi_transactions_updated', refreshHealth);
      window.removeEventListener('floussi_notifications_updated', refreshHealth);
      window.removeEventListener('floussi_sidi_history_updated', refreshHealth);
      window.removeEventListener('floussi_storage_cleaned', refreshHealth);
    };
  }, [refreshHealth]);

  const executeCleanup = useCallback(async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return { bytesFreed: 0 };
    setIsCleaning(true);
    try {
      const result = await runCleanup(userId, selectedIds);
      // Dispatch custom event to trigger reload everywhere
      window.dispatchEvent(new Event('floussi_storage_cleaned'));
      refreshHealth();
      return result;
    } catch (err) {
      console.error("[useStorageHealth] Cleanup execution failed:", err);
      return { bytesFreed: 0 };
    } finally {
      setIsCleaning(false);
    }
  }, [userId, refreshHealth]);

  const shouldShowWarning = healthStatus.healthLevel === 'warning' || healthStatus.healthLevel === 'critical';

  return {
    healthStatus,
    breakdown,
    cleanupCandidates,
    executeCleanup,
    shouldShowWarning,
    isCleaning,
    refreshHealth
  };
}
