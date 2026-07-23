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
  | 'cache_ephemeral'
  | 'academy';

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
  'notifications',
  'net_worth_items',
  'monthly_incomes'
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
    pattern: 'floussi_score_history_${userId}',
    category: 'gamification',
    description: "Historique d'évolution du score Floussi global quotidien pour l'utilisateur",
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
  },

  // 16 NEW MANDATORY PATTERNS REQUESTED BY THE USER
  {
    pattern: 'floussi_remittances',
    category: 'wallet',
    description: "Historique d'envois de fonds (remittances) des Marocains Résidant à l'Étranger (MRE) vers leurs proches",
    isCritical: true,
  },
  {
    pattern: 'floussi_savings_groups',
    category: 'community',
    description: "Groupes d'épargne collaborative (Dardat/Tontines communautaires)",
    isCritical: true,
  },
  {
    pattern: 'floussi_savings_group_contributions',
    category: 'community',
    description: "Historique des cotisations des membres aux différents groupes d'épargne collaborative",
    isCritical: true,
  },
  {
    pattern: 'floussi_academy_lessons_${userId}',
    category: 'academy',
    description: "Progression pédagogique de l'utilisateur dans les cours et leçons de l'Académie financière",
    isCritical: true,
  },
  {
    pattern: 'floussi_academy_certs_${userId}',
    category: 'academy',
    description: "Certificats de réussite obtenus par l'utilisateur après complétion des quiz de l'Académie",
    isCritical: true,
  },
  {
    pattern: 'floussi_ref_code_${userId}',
    category: 'gamification',
    description: "Code de parrainage unique de l'utilisateur pour le programme d'invitation",
    isCritical: true,
  },
  {
    pattern: 'floussi_referrals_${userId}',
    category: 'gamification',
    description: "Liste et statut des filleuls parrainés par l'utilisateur",
    isCritical: true,
  },
  {
    pattern: 'floussi_cnss_dossiers',
    category: 'core_data',
    description: "Dossiers de remboursement médical CNSS suivis par l'utilisateur",
    isCritical: true,
  },
  {
    pattern: 'floussi_sidi_history_${userId}',
    category: 'sidi',
    description: "Historique complet des conversations et échanges textuels avec l'assistant IA Sidi",
    isCritical: false,
  },
  {
    pattern: 'floussi_sidi_pending_proactive_${userId}',
    category: 'sidi',
    description: "Conseils proactifs de l'assistant Sidi en attente de traitement ou d'affichage",
    isCritical: false,
  },
  {
    pattern: 'floussi_last_winback_shown_${userId}',
    category: 'preferences',
    description: "Timestamp de la dernière présentation de l'alerte ou offre de reconquête (winback)",
    isCritical: false,
  },
  {
    pattern: 'floussi_anniversary_shown_${userId}_${currentYear}',
    category: 'preferences',
    description: "Indicateur de visionnage de la célébration de l'anniversaire d'inscription pour l'année en cours",
    isCritical: false,
  },
  {
    pattern: 'floussi_wrapped_seen_${userId}_${currentYear}',
    category: 'preferences',
    description: "Indicateur confirmant que l'utilisateur a visualisé sa rétrospective annuelle (Wrapped) pour l'année en cours",
    isCritical: false,
  },
  {
    pattern: 'floussi_long_term_assumptions_${userId}',
    category: 'core_data',
    description: "Hypothèses et configurations de planification financière à long terme (retraite/patrimoine)",
    isCritical: true,
  },
  {
    pattern: 'notifs_${userId}',
    category: 'core_data',
    description: "Notifications in-app historiques de l'utilisateur (note : n'utilise pas le préfixe floussi_ pour des raisons historiques)",
    isCritical: true,
  },
  {
    pattern: 'notif_prefs_${userId}',
    category: 'preferences',
    description: "Préférences de réception des notifications in-app et push (note : n'utilise pas le préfixe floussi_ pour des raisons historiques)",
    isCritical: false,
  },

  // 14 ADDITIONAL LOCALSTORAGE KEYS FOUND DURING AUDIT FOR COMPLETE EXHAUSTIVENESS
  {
    pattern: 'floussi_behavior_history_${userId}',
    category: 'core_data',
    description: "Historique d'évolution du profil comportemental de l'utilisateur",
    isCritical: true,
  },
  {
    pattern: 'floussi_last_backup_${userId}',
    category: 'preferences',
    description: "Timestamp de la dernière sauvegarde réussie effectuée par l'utilisateur",
    isCritical: false,
  },
  {
    pattern: 'floussi_onboarding_step',
    category: 'onboarding',
    description: "Étape courante du tunnel d'onboarding de l'utilisateur",
    isCritical: false,
  },
  {
    pattern: 'floussi_student_name',
    category: 'preferences',
    description: "Nom de l'étudiant configuré pour les certificats de l'Académie",
    isCritical: false,
  },
  {
    pattern: 'floussi_first_goal_quickwin_completed',
    category: 'gamification',
    description: "Indicateur d'accomplissement du micro-défi d'aide au premier objectif",
    isCritical: false,
  },
  {
    pattern: 'floussi_restart_dashboard_tour',
    category: 'onboarding',
    description: "Indicateur pour forcer le redémarrage du tour guidé du tableau de bord",
    isCritical: false,
  },
  {
    pattern: 'floussi_life_plan_initialized',
    category: 'onboarding',
    description: "Indicateur d'initialisation du plan de vie financière",
    isCritical: false,
  },
  {
    pattern: 'floussi_initial_buckets',
    category: 'onboarding',
    description: "Allocation initiale recommandée de seaux (buckets) lors de l'onboarding",
    isCritical: false,
  },
  {
    pattern: 'floussi_active_theme_${userId}',
    category: 'preferences',
    description: "Thème actif personnalisé de l'utilisateur",
    isCritical: false,
  },
  {
    pattern: 'floussi_active_theme',
    category: 'preferences',
    description: "Thème global par défaut",
    isCritical: false,
  },
  {
    pattern: 'floussi_setup_checklist_dismissed_${userId}',
    category: 'preferences',
    description: "Indicateur de masquage de la checklist de démarrage",
    isCritical: false,
  },
  {
    pattern: 'floussi_checklist_rewarded_${userId}',
    category: 'gamification',
    description: "Liste des récompenses obtenues pour la complétion des éléments de checklist",
    isCritical: true,
  },
  {
    pattern: 'theme_auto_night',
    category: 'preferences',
    description: "Préférence pour l'activation automatique du mode nuit",
    isCritical: false,
  },
  {
    pattern: 'theme_oled_black',
    category: 'preferences',
    description: "Préférence pour le thème noir pur OLED",
    isCritical: false,
  },
  {
    pattern: 'floussi_dashboard_layout_${userId}',
    category: 'preferences',
    description: "Dispositions et personnalisations configurables des widgets du tableau de bord",
    isCritical: false,
  },
  {
    pattern: 'floussi_dashboard_customized_${userId}',
    category: 'preferences',
    description: "Indicateur indiquant si l'utilisateur a personnalisé manuellement son tableau de bord",
    isCritical: false,
  },
  {
    pattern: 'floussi_dashboard_preset_offered_${userId}',
    category: 'preferences',
    description: "Indicateur indiquant si le preset adapté au persona a déjà été proposé à l'utilisateur",
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
      const needsCurrentYear = pattern.includes('${currentYear}');

      let combinations: Record<string, string>[] = [{}];

      if (needsUserId) {
        const next: Record<string, string>[] = [];
        for (const c of combinations) {
          next.push({ ...c, userId });
        }
        combinations = next;
      }

      if (needsTable) {
        const next: Record<string, string>[] = [];
        for (const c of combinations) {
          for (const table of KNOWN_TABLES) {
            next.push({ ...c, table });
          }
        }
        combinations = next;
      }

      if (needsTourId) {
        const next: Record<string, string>[] = [];
        for (const c of combinations) {
          for (const tourId of KNOWN_TOURS) {
            next.push({ ...c, tourId });
          }
        }
        combinations = next;
      }

      if (needsCurrentYear) {
        const next: Record<string, string>[] = [];
        const currentYearStr = new Date().getFullYear().toString();
        // Check current year, and also previous year for robustness
        const years = [currentYearStr, (new Date().getFullYear() - 1).toString()];
        for (const c of combinations) {
          for (const year of years) {
            next.push({ ...c, currentYear: year });
          }
        }
        combinations = next;
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
