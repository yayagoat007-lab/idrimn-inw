export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpValue: number;
  unlockedAt?: string;
  category: 'onboarding' | 'savings' | 'tontine' | 'family' | 'streak' | 'features';
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  unlockedBadges: string[]; // badge IDs
  streakHistory: string[]; // list of dates (YYYY-MM-DD)
}

export const LEVEL_THRESHOLDS = [0, 100, 500, 2000, 5000];

export const ALL_BADGES: Badge[] = [
  { id: 'first_trans', title: 'Première transaction', description: 'Ajouter une première entrée de masrouf ou de revenu.', emoji: '🌱', xpValue: 10, category: 'onboarding' },
  { id: 'streak_3', title: 'Régulier d\'or', description: 'Maintenir un streak de saisie de 3 jours.', emoji: '🔥', xpValue: 30, category: 'streak' },
  { id: 'streak_7', title: 'Sérénité Hebdo', description: 'Maintenir un streak de saisie de 7 jours consécutifs.', emoji: '⚡', xpValue: 70, category: 'streak' },
  { id: 'streak_30', title: 'Pilier du Budget', description: 'Atteindre 30 jours de streak consécutifs.', emoji: '🌟', xpValue: 300, category: 'streak' },
  { id: 'streak_90', title: 'Maître Sandoq', description: 'Atteindre un record de 90 jours de streak.', emoji: '👑', xpValue: 1000, category: 'streak' },
  { id: 'streak_365', title: 'Légende de la Finance', description: 'Une année entière de sagesse budgétaire !', emoji: '🕌', xpValue: 5000, category: 'streak' },
  { id: 'saver_1000', title: 'Épargneur de Bronze', description: 'Épargner ses premiers 1 000 DH dans un sandoq.', emoji: '💰', xpValue: 100, category: 'savings' },
  { id: 'saver_5000', title: 'Épargneur d\'Argent', description: 'Accumuler 5 000 DH d\'épargne consolidée.', emoji: '🥈', xpValue: 300, category: 'savings' },
  { id: 'saver_10000', title: 'Épargneur d\'Or', description: 'Atteindre 10 000 DH d\'épargne de sécurité.', emoji: '🥇', xpValue: 1000, category: 'savings' },
  { id: 'budget_master_3m', title: 'Garde des Sceaux', description: 'Respecter ses limites budgétaires 3 mois consécutifs.', emoji: '🎯', xpValue: 500, category: 'features' },
  { id: 'ocr_master', title: 'Scanner Marjane', description: 'Numériser 10 reçus de caisse avec l\'appareil photo.', emoji: '📸', xpValue: 150, category: 'features' },
  { id: 'tontine_creator', title: 'Fondateur de Jmâa', description: 'Créer son tout premier cercle de confiance Daret.', emoji: '🤝', xpValue: 200, category: 'tontine' },
  { id: 'tontine_pay', title: 'Chkoun Khalass', description: 'Confirmer un versement sur la matrice Daret.', emoji: '💎', xpValue: 50, category: 'tontine' },
  { id: 'family_unity', title: 'Foyer d\'Amour', description: 'Ajouter au moins 3 membres de sa famille au groupe.', emoji: '👨‍👩‍👧‍👦', xpValue: 250, category: 'family' },
  { id: 'goal_completed', title: 'Rêve Réalisé', description: 'Compléter un objectif financier à 100%.', emoji: '🏆', xpValue: 150, category: 'savings' },
  { id: 'report_generated', title: 'Analyste Financier', description: 'Générer sa première synthèse budgétaire PDF.', emoji: '📊', xpValue: 80, category: 'features' },
  { id: 'ramadan_ready', title: 'Siyane & Sandoq', description: 'Activer le profil d\'enveloppes de dépenses Ramadan.', emoji: '🌙', xpValue: 120, category: 'features' },
  { id: 'zakat_pay', title: 'Zakat Al Maal', description: 'Utiliser le calculateur de Zakat pour évaluer son dû.', emoji: '🕋', xpValue: 100, category: 'features' },
  { id: 'referral_king', title: 'Ambassadeur Floussi', description: 'Inviter un ami qui s\'inscrit activement.', emoji: '🎁', xpValue: 200, category: 'onboarding' },
  { id: 'elite_tier', title: 'Club Floussi Elite', description: 'Passer à l\'abonnement Floussi Elite pour débloquer tout.', emoji: '✨', xpValue: 500, category: 'features' },
  { id: 'sidi_friend', title: 'Ami de Sidi', description: 'Discuter plus de 10 fois avec Sidi Floussi, l\'assistant IA.', emoji: '🧠', xpValue: 150, category: 'features' },
  { id: 'scanner_pro', title: 'Scanner Pro', description: 'Numériser 5 reçus avec succès en extrayant les articles.', emoji: '📱', xpValue: 120, category: 'features' },
  { id: 'smart_saver', title: 'Épargnant Malin', description: 'Activer le round-up automatique pour épargner sans effort.', emoji: '🌀', xpValue: 100, category: 'savings' },
  { id: 'community_citizen', title: 'Citoyen Communautaire', description: 'Créer votre premier post d\'entraide dans la communauté.', emoji: '🗣️', xpValue: 100, category: 'tontine' },
  { id: 'challenge_solved', title: 'Défi relevé', description: 'Compléter avec succès un défi budgétaire hebdomadaire.', emoji: '🎯', xpValue: 150, category: 'streak' },
  { id: 'hajj_pilgrim', title: 'Pèlerin en préparation', description: 'Créer un projet d\'épargne ou planifier pour le Hajj.', emoji: '🕋', xpValue: 200, category: 'savings' },
  { id: 'savings_champ', title: 'Champion de l\'Épargne', description: 'Compléter avec succès un défi d\'épargne hebdomadaire.', emoji: '💪', xpValue: 180, category: 'savings' }
];

/**
 * Utility to unlock a badge globally from any context/hook.
 * It reads the local gamification state for the current user, appends the badge, adds the XP,
 * and updates the level before saving.
 */
export function unlockGlobalBadge(userId: string = "mock-user-id-9999", badgeId: string): { unlocked: boolean; badge?: Badge; newXp?: number } {
  try {
    const key = `floussi_gamification_${userId}`;
    const saved = localStorage.getItem(key);
    let state: GamificationState;
    
    if (saved) {
      state = JSON.parse(saved);
    } else {
      state = {
        xp: 140,
        level: 2,
        streak: 3,
        lastActiveDate: new Date().toISOString().split('T')[0],
        unlockedBadges: ['first_trans', 'streak_3'],
        streakHistory: []
      };
    }

    if (state.unlockedBadges.includes(badgeId)) {
      return { unlocked: false };
    }

    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (!badge) {
      return { unlocked: false };
    }

    const updatedXp = state.xp + badge.xpValue;
    const { level } = getLevelForXp(updatedXp);

    const updatedState: GamificationState = {
      ...state,
      unlockedBadges: [...state.unlockedBadges, badgeId],
      xp: updatedXp,
      level
    };

    localStorage.setItem(key, JSON.stringify(updatedState));
    console.log(`[Gamification] Badge unlocked! ${badge.title} (+${badge.xpValue} XP)`);

    // Dispatch custom event to let components/listeners know a badge was unlocked
    const event = new CustomEvent('floussi_badge_unlocked', { detail: { badge, xpEarned: badge.xpValue } });
    window.dispatchEvent(event);

    return { unlocked: true, badge, newXp: updatedXp };
  } catch (err) {
    console.error("Error unlocking global badge", err);
    return { unlocked: false };
  }
}

export function getLevelForXp(xp: number): { level: number; levelName: string; nextLevelThreshold: number; percent: number } {
  let level = 1;
  let levelName = '🥉 Débutant';
  
  if (xp >= 5000) {
    return { level: 5, levelName: '👑 Maître', nextLevelThreshold: 5000, percent: 100 };
  } else if (xp >= 2000) {
    level = 4;
    levelName = '💎 Expert';
  } else if (xp >= 500) {
    level = 3;
    levelName = '🥇 Avancé';
  } else if (xp >= 100) {
    level = 2;
    levelName = '🥈 Intermédiaire';
  }

  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level];
  const totalNeeded = nextThreshold - currentThreshold;
  const currentEarned = xp - currentThreshold;
  const percent = Math.min(Math.round((currentEarned / totalNeeded) * 100), 99);

  return {
    level,
    levelName,
    nextLevelThreshold: nextThreshold,
    percent
  };
}

export function updateStreak(lastActiveDate: string | null, currentStreak: number): { streak: number; shouldReset: boolean } {
  if (!lastActiveDate) {
    return { streak: 1, shouldReset: false };
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (lastActiveDate === today) {
    return { streak: currentStreak, shouldReset: false };
  } else if (lastActiveDate === yesterday) {
    return { streak: currentStreak + 1, shouldReset: false };
  } else {
    // Break in streak
    return { streak: 1, shouldReset: true };
  }
}
