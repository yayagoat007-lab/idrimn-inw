/**
 * Unique and exhaustive storage registry for Floussi.
 * Lists all localStorage patterns, categories, descriptions, and critical status.
 */

export type StorageCategory = 
  | 'core_data' 
  | 'gamification' 
  | 'wallet' 
  | 'community' 
  | 'sidi' 
  | 'preferences' 
  | 'security' 
  | 'onboarding' 
  | 'cache_ephemeral';

export interface StorageKeyEntry {
  pattern: string;
  category: StorageCategory;
  description: string;
  isCritical: boolean;
}

export const KNOWN_TABLES = [
  'profiles',
  'transactions',
  'buckets',
  'goals',
  'tontines',
  'achievements',
  'family_members',
  'challenges',
  'posts',
  'comments',
  'notifications'
];

export const KNOWN_TOURS = [
  'dashboard',
  'buckets',
  'wallet',
  'tontine',
  'academy',
  'community',
  'goals',
  'admin'
];

export const STORAGE_KEY_REGISTRY: StorageKeyEntry[] = [
  {
    pattern: 'floussi_auth_user',
    category: 'security',
    description: "Données de l'utilisateur actuellement authentifié en session mockée",
    isCritical: true,
  },
  {
    pattern: 'floussi_table_${table}',
    category: 'core_data',
    description: "Tables de base de données mockées de l'application (simulant Supabase)",
    isCritical: true,
  },
  {
    pattern: 'floussi_admin_users',
    category: 'security',
    description: "Membres administrateurs gérant la plateforme locale",
    isCritical: true,
  },
  {
    pattern: 'floussi_custom_exchange_rates',
    category: 'preferences',
    description: "Taux de change personnalisés pour les calculs de conversion de devises (MRE)",
    isCritical: false,
  },
  {
    pattern: 'floussi_mre_pref_currency',
    category: 'preferences',
    description: "Devise préférée de l'utilisateur (ex: EUR, USD) pour l'affichage en mode MRE",
    isCritical: false,
  },
  {
    pattern: 'floussi_mre_enabled',
    category: 'preferences',
    description: "Indicateur d'activation globale du mode MRE (Marocains Résidant à l'Étranger)",
    isCritical: false,
  },
  {
    pattern: 'floussi_selected_persona',
    category: 'preferences',
    description: "Persona actif sélectionné par l'utilisateur lors de l'onboarding",
    isCritical: false,
  },
  {
    pattern: 'floussi_encryption_salt_${userId}',
    category: 'security',
    description: "Sel de chiffrement unique par utilisateur pour la sécurisation locale",
    isCritical: true,
  },
  {
    pattern: 'floussi_sidi_proactive_history_${userId}',
    category: 'sidi',
    description: "Historique d'apparition et de déclenchement des conseils proactifs de l'assistant Sidi",
    isCritical: false,
  },
  {
    pattern: 'floussi_gamification_${userId}',
    category: 'gamification',
    description: "État de gamification de l'utilisateur (niveau, XP, badges débloqués)",
    isCritical: true,
  },
  {
    pattern: 'floussi_checkins_${userId}',
    category: 'gamification',
    description: "Historique des connexions quotidiennes de l'utilisateur pour le suivi de la régularité (checkins/streak)",
    isCritical: true,
  },
  {
    pattern: 'floussi_wallet_balance_${userId}',
    category: 'wallet',
    description: "Solde courant du portefeuille virtuel (Wallet)",
    isCritical: true,
  },
  {
    pattern: 'floussi_wallet_movements_${userId}',
    category: 'wallet',
    description: "Historique de transactions et mouvements financiers du portefeuille virtuel",
    isCritical: true,
  },
  {
    pattern: 'floussi_p2p_transfers_${userId}',
    category: 'wallet',
    description: "Historique des transferts peer-to-peer (P2P) émis ou reçus",
    isCritical: true,
  },
  {
    pattern: 'floussi_bill_payments_${userId}',
    category: 'wallet',
    description: "Historique de paiements de factures",
    isCritical: true,
  },
  {
    pattern: 'floussi_mobile_recharges_${userId}',
    category: 'wallet',
    description: "Historique des recharges téléphoniques mobiles achetées",
    isCritical: true,
  },
  {
    pattern: 'floussi_round_up_${userId}',
    category: 'wallet',
    description: "Configuration d'arrondi automatique à l'unité supérieure pour l'épargne",
    isCritical: true,
  },
  {
    pattern: 'floussi_micro_challenges_${userId}',
    category: 'wallet',
    description: "Progression de l'utilisateur dans les micro-défis d'épargne active",
    isCritical: true,
  },
  {
    pattern: 'floussi_last_active_${userId}',
    category: 'security',
    description: "Dernier timestamp d'activité de l'utilisateur pour calculer l'expiration de session",
    isCritical: false,
  },
  {
    pattern: 'floussi_tour_completed_${tourId}_${userId}',
    category: 'onboarding',
    description: "Indicateur qu'un guide interactif (tour) a été complété par l'utilisateur",
    isCritical: false,
  },
  {
    pattern: 'floussi_tour_skipped_${tourId}_${userId}',
    category: 'onboarding',
    description: "Indicateur qu'un guide interactif (tour) a été volontairement ignoré",
    isCritical: false,
  },
  {
    pattern: 'floussi_onboarding_completed',
    category: 'onboarding',
    description: "Indique si l'utilisateur a terminé l'onboarding général de l'application",
    isCritical: false,
  },
  {
    pattern: 'floussi_welcome_seen',
    category: 'onboarding',
    description: "Indique si l'écran d'accueil ou de bienvenue a été visualisé",
    isCritical: false,
  },
  {
    pattern: 'floussi_wallet_discovered',
    category: 'onboarding',
    description: "Indique si la checklist de découverte du Wallet a été complétée",
    isCritical: false,
  },
  {
    pattern: 'floussi_community_posts',
    category: 'cache_ephemeral',
    description: "Cache de posts de la communauté pour optimiser le moteur de recherche global",
    isCritical: false,
  },
  {
    pattern: 'floussi_recent_searches_${userId}',
    category: 'preferences',
    description: "Historique des recherches récentes effectuées par l'utilisateur dans le moteur global",
    isCritical: false,
  }
];

/**
 * Resolves a key pattern using provided parameters.
 * e.g., 'floussi_wallet_balance_${userId}' with { userId: '123' } returns 'floussi_wallet_balance_123'
 */
export function resolveKeyPattern(pattern: string, params: Record<string, string>): string {
  let resolved = pattern;
  for (const [key, value] of Object.entries(params)) {
    resolved = resolved.replace(`\${${key}}`, value);
  }
  return resolved;
}

/**
 * Generates all potential active keys in localStorage for a given user ID, 
 * and returns the list of keys that actually have non-null entries in localStorage.
 */
export function getAllKeysForUser(userId: string): string[] {
  if (typeof window === 'undefined') return [];

  const foundKeys: string[] = [];

  for (const entry of STORAGE_KEY_REGISTRY) {
    const { pattern } = entry;

    if (!pattern.includes('${')) {
      // Static key with no parameters
      if (localStorage.getItem(pattern) !== null) {
        foundKeys.push(pattern);
      }
    } else {
      // Dynamic key
      const needsUserId = pattern.includes('${userId}');
      const needsTable = pattern.includes('${table}');
      const needsTourId = pattern.includes('${tourId}');

      const combinations: Record<string, string>[] = [];

      if (needsTable && needsUserId) {
        // Table & User
        for (const table of KNOWN_TABLES) {
          combinations.push({ userId, table });
        }
      } else if (needsTourId && needsUserId) {
        // Tour & User
        for (const tourId of KNOWN_TOURS) {
          combinations.push({ userId, tourId });
        }
      } else if (needsUserId) {
        // Just User
        combinations.push({ userId });
      } else if (needsTable) {
        // Just Table
        for (const table of KNOWN_TABLES) {
          combinations.push({ table });
        }
      } else if (needsTourId) {
        // Just Tour
        for (const tourId of KNOWN_TOURS) {
          combinations.push({ tourId });
        }
      }

      for (const params of combinations) {
        const resolvedKey = resolveKeyPattern(pattern, params);
        if (localStorage.getItem(resolvedKey) !== null) {
          foundKeys.push(resolvedKey);
        }
      }
    }
  }

  return foundKeys;
}
