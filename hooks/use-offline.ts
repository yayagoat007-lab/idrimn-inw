import { useState, useEffect } from 'react';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';

/**
 * Hook to track online state and handle automatic synchronization of queued offline transactions.
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check and potential sync on mount
    if (navigator.onLine) {
      triggerSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Processes the offline synchronization queue by uploading items to Supabase
   */
  const triggerSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    
    const queue = await OfflineDB.getSyncQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    console.log(`[useOffline] Starting background synchronization of ${queue.length} items...`);
    
    const processedIds: string[] = [];

    try {
      for (const item of queue) {
        let success = true;
        
        try {
          if (item.action === 'insert') {
            await supabase.from(item.table).insert(item.data);
          } else if (item.action === 'update') {
            await supabase.from(item.table).update(item.data).eq('id', item.data.id);
          } else if (item.action === 'delete') {
            await supabase.from(item.table).delete().eq('id', item.data.id);
          }
        } catch (err) {
          console.error(`[useOffline] Failed syncing item ${item.id} on table ${item.table}:`, err);
          success = false;
        }

        if (success) {
          processedIds.push(item.id);
        }
      }

      if (processedIds.length > 0) {
        await OfflineDB.clearSyncQueue(processedIds);
      }
    } catch (error) {
      console.error("[useOffline] Error during synchronization:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    triggerSync,
    addToSyncQueue: OfflineDB.addToSyncQueue.bind(OfflineDB),
    getSyncQueue: OfflineDB.getSyncQueue.bind(OfflineDB)
  };
}
