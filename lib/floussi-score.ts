import { calculateFinancialHealthScore } from './ai-rules';
import { getLevelForXp } from './gamification';
import { Transaction, Bucket, Goal, NetWorthItem } from '../types';
import { calculateBehavioralMetrics, classifyBehaviorProfile, BehaviorProfile } from './behavior-clustering';

// Named constants for Floussi Score component weights
export const WEIGHT_FINANCIAL_HEALTH = 0.40;       // 40%
export const WEIGHT_GAMIFICATION_PROGRESS = 0.25;  // 25%
export const WEIGHT_CONSISTENCY = 0.20;            // 20%
export const WEIGHT_ENGAGEMENT = 0.15;             // 15%

export type FloussiScoreTier = 'Débutant' | 'Discipliné' | 'Stratège' | 'Maître' | 'Légende';

export interface FloussiScoreComponents {
  financialHealth: number;       // 0-100
  gamificationProgress: number;  // 0-100
  consistency: number;           // 0-100
  engagement: number;            // 0-100
}

export interface FloussiScoreResult {
  totalScore: number;            // 0-1000
  tier: FloussiScoreTier;
  components: FloussiScoreComponents;
  trend: 'up' | 'stable' | 'down';
  behaviorProfile?: BehaviorProfile;
}

export interface ScoreHistoryEntry {
  date: string;                  // YYYY-MM-DD
  score: number;
}

export interface NextTierRequirement {
  pointsNeeded: number;
  tip: string;
}

export interface FloussiScoreInputData {
  transactions?: Transaction[];
  buckets?: Bucket[];
  goals?: Goal[];
  netWorthItems?: any[];
}

/**
 * Calculates the complete, composite Floussi Score (0-1000) for a user.
 * Reuses existing helper functions as subcomponents to form a unified progress metric.
 * Also saves the score to history once per day.
 */
export async function calculateFloussiScore(
  userId: string = "mock-user-id-9999",
  data?: FloussiScoreInputData
): Promise<FloussiScoreResult> {
  const cleanUserId = userId || "mock-user-id-9999";

  // --- 1. FINANCIAL HEALTH COMPONENT (40%) ---
  let txs: Transaction[] = data?.transactions || [];
  if (!data?.transactions) {
    try {
      const raw = localStorage.getItem('floussi_table_transactions');
      if (raw) txs = JSON.parse(raw);
    } catch (_) {}
  }

  let buckets: Bucket[] = data?.buckets || [];
  if (!data?.buckets) {
    try {
      const raw = localStorage.getItem('floussi_table_buckets');
      if (raw) buckets = JSON.parse(raw);
    } catch (_) {}
  }

  let nwItems: any[] = data?.netWorthItems || [];
  if (!data?.netWorthItems) {
    try {
      const raw = localStorage.getItem('floussi_net_worth_items') || localStorage.getItem('floussi_table_net_worth_items');
      if (raw) nwItems = JSON.parse(raw);
    } catch (_) {}
  }

  // Get monthly income from profile or fallback
  let monthlyIncome = 12000;
  try {
    const rawProfile = localStorage.getItem('user_profile') || localStorage.getItem('floussi_table_profiles');
    if (rawProfile) {
      const profile = JSON.parse(rawProfile);
      if (profile.monthly_income) {
        monthlyIncome = Number(profile.monthly_income);
      } else if (Array.isArray(profile)) {
        const authUser = localStorage.getItem('floussi_auth_user');
        if (authUser) {
          const user = JSON.parse(authUser);
          const activeProfile = profile.find((p: any) => p.id === user.id);
          if (activeProfile && activeProfile.monthly_income) {
            monthlyIncome = Number(activeProfile.monthly_income);
          }
        }
      }
    }
  } catch (_) {}

  // Calculate savings rate
  const now = new Date();
  const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const recentTxs = txs.filter(t => new Date(t.transaction_date) >= last90Days);
  const totalIncome = recentTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = recentTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 20; // fallback to 20%

  // Calculate net worth assets/liabilities
  let totalAssets = 995000; // standard default
  let totalLiabilities = 480000; // standard default
  if (nwItems && nwItems.length > 0) {
    totalAssets = nwItems.filter((i: any) => i.type === 'asset').reduce((sum: number, i: any) => sum + Number(i.current_value || 0), 0);
    totalLiabilities = nwItems.filter((i: any) => i.type === 'liability').reduce((sum: number, i: any) => sum + Number(i.current_value || 0), 0);
  }

  const financialHealth = calculateFinancialHealthScore(
    monthlyIncome,
    totalAssets,
    totalLiabilities,
    savingsRate
  );

  // --- 2. GAMIFICATION PROGRESS COMPONENT (25%) ---
  let xp = 140;
  let unlockedBadges: string[] = [];
  try {
    const savedGam = localStorage.getItem(`floussi_gamification_${cleanUserId}`);
    if (savedGam) {
      const state = JSON.parse(savedGam);
      if (state) {
        if (typeof state.xp === 'number') xp = state.xp;
        if (Array.isArray(state.unlockedBadges)) unlockedBadges = state.unlockedBadges;
      }
    }
  } catch (_) {}

  // Scale XP dynamically: 5000 XP (Level 5 Maître) represents 100% gamification progress
  const gamificationProgress = Math.min(100, Math.max(10, Math.round((xp / 5000) * 100)));

  // --- 3. CONSISTENCY COMPONENT (20%) ---
  let streak = 3;
  try {
    const savedGam = localStorage.getItem(`floussi_gamification_${cleanUserId}`);
    if (savedGam) {
      const state = JSON.parse(savedGam);
      if (state && typeof state.streak === 'number') {
        streak = state.streak;
      }
    }
  } catch (_) {}

  let checkinCount = 0;
  try {
    const rawCheckins = localStorage.getItem(`floussi_checkins_${cleanUserId}`);
    if (rawCheckins) {
      const checkinsList = JSON.parse(rawCheckins);
      if (Array.isArray(checkinsList)) {
        checkinCount = checkinsList.filter((c: any) => {
          const diff = Date.now() - new Date(c.date).getTime();
          return diff <= 30 * 24 * 60 * 60 * 1000; // last 30 days
        }).length;
      }
    }
  } catch (_) {}

  // Streak points (max 50) + monthly checkin points (max 50)
  const streakPoints = Math.min(50, streak * 3.33); // reaches 50 at 15-day streak
  const checkinPoints = Math.min(50, checkinCount * 2.5); // reaches 50 at 20 checkins
  const consistency = Math.max(10, Math.min(100, Math.round(streakPoints + checkinPoints)));

  // --- 4. ENGAGEMENT COMPONENT (15%) ---
  let completedLessonsCount = 0;
  try {
    const rawAcad = localStorage.getItem(`floussi_academy_lessons_${cleanUserId}`);
    if (rawAcad) {
      const lessons = JSON.parse(rawAcad);
      if (Array.isArray(lessons)) {
        completedLessonsCount = lessons.filter((l: any) => l.completed).length;
      }
    }
  } catch (_) {}

  let sidiChatCount = 0;
  try {
    const rawSidi = localStorage.getItem(`floussi_sidi_history_${cleanUserId}`);
    if (rawSidi) {
      const history = JSON.parse(rawSidi);
      if (Array.isArray(history)) {
        sidiChatCount = history.length;
      }
    }
  } catch (_) {}

  // Community participation: check community badges unlocked
  let communityScore = 0;
  if (unlockedBadges.includes('community_citizen')) communityScore += 15;
  if (unlockedBadges.includes('tontine_creator')) communityScore += 15;
  if (unlockedBadges.includes('tontine_pay')) communityScore += 10;
  communityScore = Math.min(30, communityScore);

  const academyPoints = Math.min(40, completedLessonsCount * 8); // 5 lessons = 40 pts
  const sidiPoints = Math.min(30, sidiChatCount * 3); // 10 chats = 30 pts
  const engagement = Math.max(10, Math.min(100, Math.round(academyPoints + sidiPoints + communityScore)));

  // --- COMPUTE COMPOSITE SCORE ---
  const weightedSum = (
    financialHealth * WEIGHT_FINANCIAL_HEALTH +
    gamificationProgress * WEIGHT_GAMIFICATION_PROGRESS +
    consistency * WEIGHT_CONSISTENCY +
    engagement * WEIGHT_ENGAGEMENT
  );
  const totalScore = Math.max(0, Math.min(1000, Math.round(weightedSum * 10)));

  // --- RESOLVE TIER ---
  let tier: FloussiScoreTier = 'Débutant';
  if (totalScore >= 850) {
    tier = 'Légende';
  } else if (totalScore >= 700) {
    tier = 'Maître';
  } else if (totalScore >= 500) {
    tier = 'Stratège';
  } else if (totalScore >= 300) {
    tier = 'Discipliné';
  }

  // --- LOAD AND SAVE HISTORY ENTRY (ONCE PER DAY) ---
  const historyKey = `floussi_score_history_${cleanUserId}`;
  let historyList: ScoreHistoryEntry[] = [];
  try {
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      historyList = JSON.parse(savedHistory);
    }
  } catch (_) {}

  const todayStr = now.toISOString().split('T')[0];

  // Seed simulated history if completely empty to provide beautiful initial graphs
  if (historyList.length === 0) {
    const baseSimScore = Math.max(120, totalScore - 150);
    for (let i = 30; i > 0; i--) {
      const pastDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const pastStr = pastDate.toISOString().split('T')[0];
      const sinWave = Math.sin((30 - i) * 0.3) * 30;
      const walk = (30 - i) * 4.5 + sinWave + (Math.random() - 0.35) * 8;
      const simulatedScore = Math.max(100, Math.min(950, Math.round(baseSimScore + walk)));
      historyList.push({ date: pastStr, score: simulatedScore });
    }
  }

  // Update or insert today's record
  const todayIdx = historyList.findIndex(h => h.date === todayStr);
  if (todayIdx >= 0) {
    historyList[todayIdx].score = totalScore;
  } else {
    historyList.push({ date: todayStr, score: totalScore });
  }

  // Limit to 365 entries
  if (historyList.length > 365) {
    historyList.sort((a, b) => a.date.localeCompare(b.date));
    historyList = historyList.slice(historyList.length - 365);
  }

  localStorage.setItem(historyKey, JSON.stringify(historyList));

  // --- DETERMINE TREND (COMPARED TO 30 DAYS AGO) ---
  let trend: 'up' | 'stable' | 'down' = 'stable';
  if (historyList.length > 0) {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    let closestEntry = historyList[0];
    let minDiff = Math.abs(new Date(closestEntry.date).getTime() - thirtyDaysAgo.getTime());

    for (const entry of historyList) {
      const diff = Math.abs(new Date(entry.date).getTime() - thirtyDaysAgo.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestEntry = entry;
      }
    }

    if (closestEntry) {
      const scoreDiff = totalScore - closestEntry.score;
      if (scoreDiff > 8) {
        trend = 'up';
      } else if (scoreDiff < -8) {
        trend = 'down';
      } else {
        trend = 'stable';
      }
    }
  }

  // --- CALCULATE BEHAVIORAL PROFILE ---
  let behaviorProfile: BehaviorProfile = 'depensier_occasionnel';
  try {
    const metrics = calculateBehavioralMetrics(txs, 90);
    behaviorProfile = classifyBehaviorProfile(metrics, txs);
  } catch (_) {}

  return {
    totalScore,
    tier,
    components: {
      financialHealth,
      gamificationProgress,
      consistency,
      engagement
    },
    trend,
    behaviorProfile
  };
}

/**
 * Retrieves the historical log of Floussi Scores for charts
 */
export function getScoreHistory(
  userId: string = "mock-user-id-9999",
  months: number = 3
): ScoreHistoryEntry[] {
  const cleanUserId = userId || "mock-user-id-9999";
  const historyKey = `floussi_score_history_${cleanUserId}`;
  try {
    const raw = localStorage.getItem(historyKey);
    if (raw) {
      const list = JSON.parse(raw) as ScoreHistoryEntry[];
      if (Array.isArray(list)) {
        const thresholdDate = new Date();
        thresholdDate.setMonth(thresholdDate.getMonth() - months);
        const thresholdStr = thresholdDate.toISOString().split('T')[0];
        
        return list
          .filter(h => h.date >= thresholdStr)
          .sort((a, b) => a.date.localeCompare(b.date));
      }
    }
  } catch (_) {}
  return [];
}

/**
 * Calculates requirements and concrete advice for the next Floussi Score tier.
 * Target the weakest component score to maximize progression.
 */
export function getNextTierRequirement(
  currentScore: number,
  components: FloussiScoreComponents,
  language: 'fr' | 'darija' = 'fr'
): NextTierRequirement {
  const isDarija = language === 'darija';
  
  if (currentScore >= 1000) {
    return {
      pointsNeeded: 0,
      tip: isDarija
        ? "Mabrouk! Wselti l-darajat Légende (1000 pts) f Floussi. Nta houwa l-mou3alim dyal l-flouss!"
        : "Félicitations ! Vous avez atteint le score Floussi maximal de 1000. Vous êtes une véritable Légende de la gestion financière marocaine !"
    };
  }

  let nextTierScore = 300;
  if (currentScore >= 850) {
    nextTierScore = 1000;
  } else if (currentScore >= 700) {
    nextTierScore = 850;
  } else if (currentScore >= 500) {
    nextTierScore = 700;
  } else if (currentScore >= 300) {
    nextTierScore = 500;
  }

  const pointsNeeded = nextTierScore - currentScore;

  // Find the weakest component
  const { financialHealth, gamificationProgress, consistency, engagement } = components;
  const minScore = Math.min(financialHealth, gamificationProgress, consistency, engagement);

  let tip = "";

  if (minScore === financialHealth) {
    tip = isDarija
      ? "Sante dyal l-flouss dyalk m3etla chwiya. Hawel t-waffer kther men 15% men dakhliya dyalk oula t-naqes men l-masarif f sandoq 'Autre' bach t-tla3 score dyalk hna."
      : "Votre santé financière (taux d'épargne, endettement) est la composante la plus faible. Essayez d'allouer plus de budget à vos sandoqs d'épargne active ou réduisez vos dépenses non prioritaires.";
  } else if (minScore === gamificationProgress) {
    tip = isDarija
      ? "L-niveau dyalek f Récompenses baqi hbat. Hawel t-kamal chi objectif d t-tawfir oula t-khalas chi Daret (tontine) bach t-rba7 badges jdad o t-tla3 XP dyalk d l-gamification."
      : "Votre progression de gamification est en retard. Allez relever des défis hebdomadaires ou créez un nouvel objectif d'épargne pour débloquer de nouveaux badges et accumuler de l'XP.";
  } else if (minScore === consistency) {
    tip = isDarija
      ? "Ma kat-dkhoulch bzzaf. Hawel t-dkhol l t-tadbiq 3 jours t-ba3 s-st streak dyalk o t-dir check-in quotidien m3a Sidi Floussi bach t-rba7 consistency points bzzaf."
      : "Votre régularité de connexion est faible. Prenez l'habitude de vous connecter 3 jours d'affilée pour lancer un streak et effectuez votre check-in d'état d'esprit financier pour booster vos points.";
  } else {
    tip = isDarija
      ? "Khassak t-stafed kter men l-mouassat dyalna. Hawel t-qra chi dars f l-Académie Floussi oula t-hder kter m3a Sidi Floussi bach t-zid l-engagement dyalk."
      : "Votre niveau d'engagement avec l'application est perfectible. Complétez un cours interactif dans l'Académie Floussi, posez des questions à Sidi Floussi, ou participez à la communauté.";
  }

  return {
    pointsNeeded,
    tip
  };
}
