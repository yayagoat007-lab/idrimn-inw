import { get, set, del, clear } from 'idb-keyval';

export interface SyncItem {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

/**
 * Robust IndexedDB Local Database Wrapper using idb-keyval.
 * Supports offline-first capabilities and a synchronisation queue for offline transactions.
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
   * Removes processed items from the sync queue
   */
  async clearSyncQueue(itemIdsToRemove: string[]): Promise<void> {
    const queue = (await this.get('sync_queue') as SyncItem[]) || [];
    const remaining = queue.filter(item => !itemIdsToRemove.includes(item.id));
    await this.set('sync_queue', remaining);
    console.log(`[OfflineDB] ${itemIdsToRemove.length} items cleared from sync queue. ${remaining.length} remaining.`);
  }
};
