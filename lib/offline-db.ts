import { get, set, del, clear } from 'idb-keyval';

export interface SyncItem {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

export interface PrioritySyncItem extends SyncItem {
  priority: 'high' | 'medium' | 'low';
  requiresWifi: boolean;
  readyToSync: boolean;
}

/**
 * Robust IndexedDB Local Database Wrapper using idb-keyval.
 * Supports offline-first capabilities and a synchronisation queue for offline transactions.
 * Extended with sync prioritization and connection-aware scheduling.
 */
export const OfflineDB = {
  /**
   * Reads data from IndexedDB
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const val = await get(`floussi_${key}`);
      return val as T;
    } catch (error) {
      console.error(`Error reading from IndexedDB key "${key}":`, error);
      return undefined;
    }
  },

  /**
   * Writes data to IndexedDB
   */
  async set(key: string, value: any): Promise<void> {
    try {
      await set(`floussi_${key}`, value);
    } catch (error) {
      console.error(`Error writing to IndexedDB key "${key}":`, error);
    }
  },

  /**
   * Deletes a key from IndexedDB
   */
  async delete(key: string): Promise<void> {
    try {
      await del(`floussi_${key}`);
    } catch (error) {
      console.error(`Error deleting from IndexedDB key "${key}":`, error);
    }
  },

  /**
   * Clears all local Floussi data
   */
  async clearAll(): Promise<void> {
    try {
      await clear();
    } catch (error) {
      console.error("Error clearing IndexedDB:", error);
    }
  },

  /**
   * Appends an item to the offline synchronization queue
   */
  async addToSyncQueue(item: Omit<SyncItem, 'id' | 'timestamp'>): Promise<void> {
    const queue = (await this.get('sync_queue') as SyncItem[]) || [];
    const newItem: SyncItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString()
    };
    queue.push(newItem);
    await this.set('sync_queue', queue);
    console.log(`[OfflineDB] Item added to sync queue:`, newItem);
  },

  /**
   * Retrieves all items waiting in the synchronization queue
   */
  async getSyncQueue(): Promise<SyncItem[]> {
    return (await this.get('sync_queue') as SyncItem[]) || [];
  },

  /**
   * Retrieves the synchronization queue sorted by priority, mapping WiFi requirements.
   * - Transactions/text edits: HIGH priority (ready to sync immediately on any connection).
   * - Receipts, images, and OCR items: LOW priority (require WiFi to prevent cellular data drainage).
   */
  async getSyncPriorityQueue(): Promise<PrioritySyncItem[]> {
    const queue = await this.getSyncQueue();
    const isOnline = typeof window !== 'undefined' ? navigator.onLine : true;

    // Detect if we are on a WiFi/Ethernet connection
    let isWifi = true;
    if (typeof window !== 'undefined') {
      const nav = navigator as any;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
      if (conn) {
        if (conn.type) {
          isWifi = conn.type === 'wifi' || conn.type === 'ethernet';
        } else if (conn.saveData) {
          isWifi = false; // Data saver mode implies metered data
        } else {
          // Check effective type - assume cellular if 3g/4g is set and no connection.type is present
          const et = conn.effectiveType;
          isWifi = et !== '2g' && et !== '3g' && et !== '4g';
        }
      } else {
        // Fallback to simple online state
        isWifi = isOnline;
      }
    }

    const processed: PrioritySyncItem[] = queue.map(item => {
      // Check if it represents an image / ocr item
      const isImage = 
        item.table === 'ocr' || 
        item.table === 'receipts' || 
        item.table === 'images' ||
        !!item.data?.imageUrl || 
        !!item.data?.receiptImage ||
        !!item.data?.imagePath;

      const requiresWifi = isImage;
      const priority: 'high' | 'medium' | 'low' = isImage ? 'low' : 'high';
      const readyToSync = isOnline && (!requiresWifi || isWifi);

      return {
        ...item,
        priority,
        requiresWifi,
        readyToSync
      };
    });

    // Sort: High priority first, then medium, then low
    return processed.sort((a, b) => {
      const priorityWeights = { high: 0, medium: 1, low: 2 };
      return priorityWeights[a.priority] - priorityWeights[b.priority];
    });
  },

  /**
   * Removes processed items from the sync queue
   */
  async clearSyncQueue(itemIdsToRemove: string[]): Promise<void> {
    const queue = (await this.get('sync_queue') as SyncItem[]) || [];
    const remaining = queue.filter(item => !itemIdsToRemove.includes(item.id));
    await this.set('sync_queue', remaining);
    console.log(`[OfflineDB] ${itemIdsToRemove.length} items cleared from sync queue. ${remaining.length} remaining.`);
  }
};
