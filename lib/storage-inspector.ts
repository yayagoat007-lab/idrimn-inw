import { STORAGE_KEY_REGISTRY, StorageKeyEntry } from './storage-registry';

export interface InspectedKey {
  key: string;
  sizeBytes: number;
  category: string;
  isCritical: boolean;
  isOrphan: boolean;
}

/**
 * Calculates string size in bytes (UTF-8 encoding).
 */
export function getByteSize(str: string): number {
  if (typeof TextEncoder !== 'undefined') {
    try {
      return new TextEncoder().encode(str).length;
    } catch (_) {
      // Fallback
    }
  }
  // Fallback estimation (UTF-16 characters in JS)
  return str.length * 2;
}

/**
 * Converts a registry pattern into a RegExp to test against real keys.
 * e.g., 'floussi_wallet_balance_${userId}' -> /^floussi_wallet_balance_([a-zA-Z0-9_-]+)$/
 */
export function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/\${userId}/g, '([a-zA-Z0-9_-]+)')
    .replace(/\${table}/g, '([a-zA-Z0-9_-]+)')
    .replace(/\${tourId}/g, '([a-zA-Z0-9_-]+)');
  return new RegExp(`^${escaped}$`);
}

/**
 * Scans localStorage keys starting with 'floussi_' and returns an analysis
 * of their sizes, category, and criticality according to the registry.
 * Filters keys to those belonging to the given userId (or static global keys) if userId is specified.
 */
export function inspectAllStorage(userId?: string): InspectedKey[] {
  if (typeof window === 'undefined') return [];

  const results: InspectedKey[] = [];
  const keys = Object.keys(localStorage);

  for (const key of keys) {
    // Only inspect Floussi keys
    if (!key.startsWith('floussi_')) continue;

    const value = localStorage.getItem(key) || '';
    const sizeBytes = getByteSize(value);

    // Find if it matches any pattern
    let matchedEntry: StorageKeyEntry | undefined = undefined;

    for (const entry of STORAGE_KEY_REGISTRY) {
      const regex = patternToRegex(entry.pattern);
      if (regex.test(key)) {
        // If a userId filter is active, check user ownership of dynamic keys
        if (userId && entry.pattern.includes('${userId}')) {
          if (!key.includes(userId)) {
            // Key belongs to another user
            continue;
          }
        }
        matchedEntry = entry;
        break;
      }
    }

    if (matchedEntry) {
      results.push({
        key,
        sizeBytes,
        category: matchedEntry.category,
        isCritical: matchedEntry.isCritical,
        isOrphan: false,
      });
    } else {
      // Orphan key: starts with floussi_ but not in registry
      // Check if it belongs to this user based on substring if userId was passed
      if (userId && key.includes(userId)) {
        results.push({
          key,
          sizeBytes,
          category: 'unknown',
          isCritical: false,
          isOrphan: true,
        });
      } else if (!userId) {
        results.push({
          key,
          sizeBytes,
          category: 'unknown',
          isCritical: false,
          isOrphan: true,
        });
      }
    }
  }

  return results;
}

/**
 * Computes total active storage consumption in bytes for a specific user ID.
 */
export function getTotalStorageUsageBytes(userId: string): number {
  const items = inspectAllStorage(userId);
  return items.reduce((acc, curr) => acc + curr.sizeBytes, 0);
}
