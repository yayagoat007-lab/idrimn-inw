import { OfflineDB } from './offline-db';
import { Transaction } from '../types';
import { getByteSize } from './storage-inspector';
import { compressImage, blobToDataURL } from './image-compression';

export interface CleanupCandidate {
  id: string;
  category: 'sidi' | 'preferences' | 'cache_ephemeral' | 'core_data';
  description: { fr: string; darija: string };
  estimatedBytesFreed: number;
  action: 'archive' | 'recompress' | 'delete_safe';
  details: {
    key?: string;
    transactionId?: string;
    notificationIds?: string[];
    messageIds?: string[];
    originalValue?: string;
  };
}

/**
 * Helper to compress a Base64 image using our HTML5 Canvas utility.
 */
export async function recompressBase64Image(base64Str: string, maxSizeKB: number = 15): Promise<string> {
  if (!base64Str || !base64Str.startsWith('data:image/')) {
    return base64Str;
  }
  try {
    const response = await fetch(base64Str);
    const blob = await response.blob();
    const file = new File([blob], "receipt_recompressed.jpg", { type: blob.type || "image/jpeg" });
    const compressedBlob = await compressImage(file, maxSizeKB, 400, 400); // More aggressive resolution down-sizing
    return await blobToDataURL(compressedBlob);
  } catch (err) {
    console.error("[CleanupStrategies] Failed to recompress base64 image", err);
    return base64Str; // Return original if failed
  }
}

/**
 * Scans localStorage and offlineDB to identify potential cleanup candidates.
 */
export function identifyCleanupCandidates(userId: string): CleanupCandidate[] {
  const candidates: CleanupCandidate[] = [];
  const now = Date.now();

  // 1. Recent Searches (preferences)
  const searchKey = `floussi_recent_searches_${userId}`;
  const searchVal = localStorage.getItem(searchKey);
  if (searchVal) {
    try {
      const searches = JSON.parse(searchVal);
      if (Array.isArray(searches) && searches.length > 0) {
        const size = getByteSize(searchVal);
        candidates.push({
          id: 'clean_searches',
          category: 'preferences',
          description: {
            fr: "Effacer l'historique de vos recherches récentes",
            darija: "Mseh rasi l-baht l-khir dyalk"
          },
          estimatedBytesFreed: size,
          action: 'delete_safe',
          details: { key: searchKey }
        });
      }
    } catch (_) {}
  }

  // 2. Read notifications older than 60 days (cache_ephemeral)
  const notifKey = `notifs_${userId}`;
  const notifVal = localStorage.getItem(notifKey);
  if (notifVal) {
    try {
      const notifications = JSON.parse(notifVal);
      if (Array.isArray(notifications) && notifications.length > 0) {
        const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;
        const oldReadNotifications = notifications.filter((n: any) => {
          const timestamp = n.timestamp ? new Date(n.timestamp).getTime() : 0;
          return n.isRead && timestamp < sixtyDaysAgo;
        });

        if (oldReadNotifications.length > 0) {
          const oldReadIds = oldReadNotifications.map((n: any) => n.id);
          // Estimate byte size freed (proportional to number of characters)
          const totalSize = getByteSize(notifVal);
          const estimatedFreed = Math.round((oldReadNotifications.length / notifications.length) * totalSize);

          candidates.push({
            id: 'clean_old_notifications',
            category: 'cache_ephemeral',
            description: {
              fr: `Supprimer ${oldReadNotifications.length} notifications lues de plus de 60 jours`,
              darija: `Mseh ${oldReadNotifications.length} notifications lues li fat 3lihom 60 yom`
            },
            estimatedBytesFreed: estimatedFreed,
            action: 'delete_safe',
            details: { key: notifKey, notificationIds: oldReadIds }
          });
        }
      }
    } catch (_) {}
  }

  // 3. Sidi chat messages older than 90 days (sidi)
  const sidiKey = `floussi_sidi_history_${userId}`;
  const sidiVal = localStorage.getItem(sidiKey);
  if (sidiVal) {
    try {
      const messages = JSON.parse(sidiVal);
      if (Array.isArray(messages) && messages.length > 0) {
        const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
        const oldMessages = messages.filter((m: any) => {
          const timestamp = m.timestamp ? new Date(m.timestamp).getTime() : 0;
          return timestamp < ninetyDaysAgo;
        });

        if (oldMessages.length > 0) {
          const oldMsgIds = oldMessages.map((m: any) => m.id);
          const totalSize = getByteSize(sidiVal);
          const estimatedFreed = Math.round((oldMessages.length / messages.length) * totalSize);

          candidates.push({
            id: 'clean_old_sidi_chat',
            category: 'sidi',
            description: {
              fr: `Effacer l'historique des discussions Sidi de plus de 90 jours (${oldMessages.length} messages)`,
              darija: `Mseh hiwarat sidi li fat 3lihom 90 yom (${oldMessages.length} l-rassayel)`
            },
            estimatedBytesFreed: estimatedFreed,
            action: 'delete_safe',
            details: { key: sidiKey, messageIds: oldMsgIds }
          });
        }
      }
    } catch (_) {}
  }

  // 4. Receipt photos of transactions older than 2 years (core_data)
  // Let's scan transactions in localStorage/offline DB.
  const txKey = 'floussi_table_transactions';
  const txVal = localStorage.getItem(txKey);
  if (txVal) {
    try {
      const transactions: Transaction[] = JSON.parse(txVal);
      if (Array.isArray(transactions)) {
        const twoYearsAgo = now - 2 * 365 * 24 * 60 * 60 * 1000;
        
        transactions.forEach((tx) => {
          if (tx.receipt_url && tx.receipt_url.startsWith('data:image/')) {
            const txTime = tx.transaction_date ? new Date(tx.transaction_date).getTime() : 0;
            const sizeBytes = getByteSize(tx.receipt_url);

            // We propose cleanup if the transaction is older than 2 years,
            // or if it's a very large receipt image (for demonstration / testing)
            const isVeryOld = txTime < twoYearsAgo;
            
            if (isVeryOld) {
              // Propose Archive (delete image, keep receipt text metadata)
              candidates.push({
                id: `archive_receipt_${tx.id}`,
                category: 'core_data',
                description: {
                  fr: `Archiver le reçu de "${tx.description || tx.merchant}" (${tx.transaction_date}) : Supprimer l'image mais garder les détails financiers`,
                  darija: `Archiver r-tawsil dyal "${tx.description || tx.merchant}" : Mseh s-soura o khlli l-m3loumat l-maliya`
                },
                estimatedBytesFreed: sizeBytes,
                action: 'archive',
                details: { transactionId: tx.id, originalValue: tx.receipt_url }
              });

              // Propose Recompression (highly aggressive compression)
              candidates.push({
                id: `recompress_receipt_${tx.id}`,
                category: 'core_data',
                description: {
                  fr: `Recompresser l'image du reçu de "${tx.description || tx.merchant}" (${tx.transaction_date}) pour libérer de l'espace`,
                  darija: `Ziyer s-soura dyal r-tawsil "${tx.description || tx.merchant}" bach t-khwi l-blassa`
                },
                estimatedBytesFreed: Math.max(0, Math.round(sizeBytes * 0.85)), // Estimating 85% reduction
                action: 'recompress',
                details: { transactionId: tx.id, originalValue: tx.receipt_url }
              });
            } else if (sizeBytes > 100 * 1024) {
              // Also support cleaning up large images in general!
              candidates.push({
                id: `archive_receipt_${tx.id}`,
                category: 'core_data',
                description: {
                  fr: `Archiver le grand reçu de "${tx.description || tx.merchant}" (${tx.transaction_date}) [${Math.round(sizeBytes / 1024)} KB] : Supprimer l'image`,
                  darija: `Archiver r-tawsil l-kbir dyal "${tx.description || tx.merchant}" : Mseh s-soura dyalo`
                },
                estimatedBytesFreed: sizeBytes,
                action: 'archive',
                details: { transactionId: tx.id, originalValue: tx.receipt_url }
              });

              candidates.push({
                id: `recompress_receipt_${tx.id}`,
                category: 'core_data',
                description: {
                  fr: `Recompresser l'image lourde de "${tx.description || tx.merchant}" (${tx.transaction_date}) [${Math.round(sizeBytes / 1024)} KB]`,
                  darija: `Ziyer s-soura l-ghlida dyal "${tx.description || tx.merchant}"`
                },
                estimatedBytesFreed: Math.max(0, Math.round(sizeBytes * 0.85)),
                action: 'recompress',
                details: { transactionId: tx.id, originalValue: tx.receipt_url }
              });
            }
          }
        });
      }
    } catch (_) {}
  }

  return candidates;
}

/**
 * Executes cleanup actions for chosen candidate IDs.
 */
export async function executeCleanup(userId: string, selectedIds: string[]): Promise<{ bytesFreed: number }> {
  let bytesFreed = 0;
  if (selectedIds.length === 0) return { bytesFreed };

  const candidates = identifyCleanupCandidates(userId);
  const selectedCandidates = candidates.filter(c => selectedIds.includes(c.id));

  // Load transactions table to prepare potential updates
  const txKey = 'floussi_table_transactions';
  let transactions: Transaction[] = [];
  let transactionsModified = false;

  const txVal = localStorage.getItem(txKey);
  if (txVal) {
    try {
      transactions = JSON.parse(txVal);
    } catch (_) {}
  }

  for (const candidate of selectedCandidates) {
    const { action, details } = candidate;

    if (action === 'delete_safe') {
      if (details.key === `floussi_recent_searches_${userId}`) {
        localStorage.removeItem(details.key);
        bytesFreed += candidate.estimatedBytesFreed;
      } else if (details.key === `notifs_${userId}` && details.notificationIds) {
        const notifsVal = localStorage.getItem(details.key);
        if (notifsVal) {
          try {
            const notifs = JSON.parse(notifsVal);
            const remainingNotifs = notifs.filter((n: any) => !details.notificationIds!.includes(n.id));
            localStorage.setItem(details.key, JSON.stringify(remainingNotifs));
            bytesFreed += candidate.estimatedBytesFreed;
            // Notify UI
            window.dispatchEvent(new Event('floussi_notifications_updated'));
          } catch (_) {}
        }
      } else if (details.key === `floussi_sidi_history_${userId}` && details.messageIds) {
        const sidiVal = localStorage.getItem(details.key);
        if (sidiVal) {
          try {
            const messages = JSON.parse(sidiVal);
            const remainingMsgs = messages.filter((m: any) => !details.messageIds!.includes(m.id));
            localStorage.setItem(details.key, JSON.stringify(remainingMsgs));
            bytesFreed += candidate.estimatedBytesFreed;
            window.dispatchEvent(new Event('floussi_sidi_history_updated'));
          } catch (_) {}
        }
      }
    } else if (action === 'archive' && details.transactionId) {
      // Find the transaction and remove its receipt_url
      const index = transactions.findIndex(t => t.id === details.transactionId);
      if (index !== -1) {
        transactions[index] = {
          ...transactions[index],
          receipt_url: null, // delete the heavy base64 image
          updated_at: new Date().toISOString()
        };
        transactionsModified = true;
        bytesFreed += candidate.estimatedBytesFreed;
      }
    } else if (action === 'recompress' && details.transactionId && details.originalValue) {
      // Recompress base64
      const index = transactions.findIndex(t => t.id === details.transactionId);
      if (index !== -1) {
        const recompressed = await recompressBase64Image(details.originalValue, 15); // aggressive maxSizeKB=15
        const originalSize = candidate.estimatedBytesFreed / 0.85; // retrieve estimate
        const newSize = getByteSize(recompressed);
        const saved = Math.max(0, originalSize - newSize);

        transactions[index] = {
          ...transactions[index],
          receipt_url: recompressed,
          updated_at: new Date().toISOString()
        };
        transactionsModified = true;
        bytesFreed += saved;
      }
    }
  }

  // Persist updated transactions if any modifications occurred
  if (transactionsModified) {
    localStorage.setItem(txKey, JSON.stringify(transactions));
    await OfflineDB.set('transactions', transactions);
    window.dispatchEvent(new Event('floussi_transactions_updated'));
  }

  return { bytesFreed: Math.round(bytesFreed) };
}
