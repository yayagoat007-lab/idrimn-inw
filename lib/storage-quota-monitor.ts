import { inspectAllStorage, getTotalStorageUsageBytes } from './storage-inspector';
import { StorageCategory } from './storage-registry';

export type StorageHealthLevel = 'healthy' | 'watch' | 'warning' | 'critical';

export interface StorageHealthStatus {
  usedBytes: number;
  estimatedLimitBytes: number;
  percentUsed: number;
  healthLevel: StorageHealthLevel;
}

export interface StorageCategoryBreakdown {
  category: StorageCategory | 'unknown';
  label: string;
  bytes: number;
  percent: number;
}

const CATEGORY_LABELS: Record<StorageCategory | 'unknown', { fr: string; darija: string }> = {
  core_data: { fr: 'Données de base (Transactions, etc.)', darija: 'M3loumat l-Asasya (Mu3amalat...)' },
  gamification: { fr: 'Gamification (Niveaux & Badges)', darija: 'Gamification (Moustawa o Charafat)' },
  wallet: { fr: 'Portefeuille Virtuel (Mouvements & Solde)', darija: 'Portefeuille (Rassid o Harakat)' },
  community: { fr: 'Réseau & Postes Communautaires', darija: 'L-Moucharaka o L-Mawaqi3' },
  sidi: { fr: 'Conversations & Conseils Sidi', darija: 'Sidi (Hiwarat o Nassa2ih)' },
  preferences: { fr: 'Préférences & Devises (MRE)', darija: 'L-I3dadat dyal l-Khayar' },
  security: { fr: 'Sécurité, Session & Chiffrement', darija: 'S-Securité o L-Koudat' },
  onboarding: { fr: 'Tutoriels & Guides interactifs', darija: 'L-Guide dyal l-Bidaya' },
  cache_ephemeral: { fr: 'Cache & Fichiers éphémères', darija: 'Cache o l-M3loumat d-Diyala' },
  unknown: { fr: 'Autres données non répertoriées', darija: 'M3loumat khora ma 3roufach' }
};

/**
 * Returns storage health statistics.
 */
export function getStorageHealthStatus(userId: string): StorageHealthStatus {
  const usedBytes = getTotalStorageUsageBytes(userId);
  const estimatedLimitBytes = 5 * 1024 * 1024; // 5MB standard localStorage ceiling
  
  const percentUsed = (usedBytes / estimatedLimitBytes) * 100;
  
  let healthLevel: StorageHealthLevel = 'healthy';
  if (percentUsed >= 90) {
    healthLevel = 'critical';
  } else if (percentUsed >= 75) {
    healthLevel = 'warning';
  } else if (percentUsed >= 50) {
    healthLevel = 'watch';
  }

  return {
    usedBytes,
    estimatedLimitBytes,
    percentUsed: Math.min(100, parseFloat(percentUsed.toFixed(2))),
    healthLevel
  };
}

/**
 * Generates an analysis of space utilized by each Storage category.
 */
export function getStorageBreakdownByCategory(userId: string, language: 'fr' | 'darija' = 'fr'): StorageCategoryBreakdown[] {
  const items = inspectAllStorage(userId);
  const total = items.reduce((sum, item) => sum + item.sizeBytes, 0);

  const categorySizes: Record<StorageCategory | 'unknown', number> = {
    core_data: 0,
    gamification: 0,
    wallet: 0,
    community: 0,
    sidi: 0,
    preferences: 0,
    security: 0,
    onboarding: 0,
    cache_ephemeral: 0,
    unknown: 0
  };

  for (const item of items) {
    const cat = (item.category as StorageCategory) || 'unknown';
    if (cat in categorySizes) {
      categorySizes[cat] += item.sizeBytes;
    } else {
      categorySizes.unknown += item.sizeBytes;
    }
  }

  return Object.entries(categorySizes)
    .map(([cat, bytes]) => {
      const category = cat as StorageCategory | 'unknown';
      const label = CATEGORY_LABELS[category]?.[language] || category;
      return {
        category,
        label,
        bytes,
        percent: total > 0 ? parseFloat(((bytes / total) * 100).toFixed(1)) : 0
      };
    })
    .filter(item => item.bytes > 0)
    .sort((a, b) => b.bytes - a.bytes);
}
