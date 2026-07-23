import { Transaction, Bucket, MoroccanEvent, Tontine } from '../types';
import { getSavedChallenges } from './optimization-challenges';
import { getSavedWeeklyReports } from './weekly-coaching-report';
import { getWalletBalance, getBillPayments } from './wallet-mock';
import { getSubscriptionBadgeVisual } from './subscription-badge-display';

export interface ProactiveMessage {
  id: string;
  ruleName: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  actionLabel?: string;
  actionPayload?: Record<string, any>;
  createdAt: string;
}

export interface ProactiveEvaluationContext {
  userId: string;
  transactions: Transaction[];
  buckets: Bucket[];
  events: MoroccanEvent[];
  tontines: Tontine[];
  streakDays?: number;
  floussiScoreTier?: string;
  subscriptionTier?: string;
}

/**
 * Evaluates triggers to generate proactive Sidi Floussi notifications.
 * Uses localStorage to persist trigger history, avoid double triggers,
 * and limit notifications to a maximum of 3 per day.
 */
export function evaluateProactiveTriggers(context: ProactiveEvaluationContext): ProactiveMessage[] {
  const { userId, transactions, buckets, events, tontines } = context;
  const storageKey = `floussi_sidi_proactive_history_${userId}`;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Load trigger history
  let history: Record<string, string> = {}; // rule_name -> last_triggered_date_str
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) history = JSON.parse(raw);
  } catch (_) {}

  // Keep track of how many triggered today
  const triggeredToday = Object.values(history).filter(date => date === todayStr).length;
  if (triggeredToday >= 3) {
    // Strict spam protection: max 3 messages per day
    return [];
  }

  const generatedMessages: ProactiveMessage[] = [];

  const addMessage = (ruleName: string, title: string, message: string, type: 'info' | 'warning' | 'success', options?: { actionLabel?: string; actionPayload?: Record<string, any> }) => {
    // Check if already triggered today or recently (e.g. within 24h)
    const lastTriggered = history[ruleName];
    if (lastTriggered === todayStr) return;

    const newMessage: ProactiveMessage = {
      id: `proactive-${ruleName}-${Date.now()}`,
      ruleName,
      title,
      message,
      type,
      actionLabel: options?.actionLabel,
      actionPayload: options?.actionPayload,
      createdAt: now.toISOString()
    };

    generatedMessages.push(newMessage);
    
    // Log in history
    history[ruleName] = todayStr;
  };

  // --- Rule 1: Yesterday's empty logs (Remind user at 8 AM style) ---
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];
  const yesterdayTxs = transactions.filter(t => t.transaction_date === yesterday);
  if (yesterdayTxs.length === 0) {
    addMessage(
      "yesterday_empty_logs",
      "Sidi Floussi t'a l'œil ! 👀",
      "Sidi Floussi a remarqué que tu n'as saisi aucune transaction hier. Hchouma ! Même pour un petit café à 10 DH, il faut le noter pour garder la baraka du sandoq !",
      "warning",
      { actionLabel: "Saisir maintenant", actionPayload: { action: "open_add_transaction" } }
    );
  }

  // --- Rule 2: Category Spike Check (Today expense > Average) ---
  const todayExpenses = transactions.filter(t => t.transaction_date === todayStr && t.type === 'expense');
  for (const exp of todayExpenses) {
    if (exp.amount >= 500) {
      addMessage(
        `spike_detection_${exp.category}`,
        "Dépense importante détectée ! 💸",
        `Oula ! Tu as dépensé ${exp.amount} DH d'un coup dans la catégorie ${exp.category} (${exp.description}). Veille à ce que ton sandoq ne se vide pas trop vite !`,
        "warning",
        { actionLabel: "Voir mes enveloppes", actionPayload: { action: "navigate_buckets" } }
      );
      break;
    }
  }

  // --- Rule 3: Friday Leisure Advice (Hammam & Ahwa) ---
  if (now.getDay() === 5) { // 5 is Friday
    addMessage(
      "friday_leisure_advice",
      "C'est vendredi ! Ahwa & Hammam ☕",
      "Le weekend commence ! L'enveloppe 'Loisirs & Café' va être sollicitée. Sois sage à l'café, ne paie pas pour tout le quartier s'il te plaît ! Préserve tes dirhams.",
      "info",
      { actionLabel: "Vérifier Loisirs", actionPayload: { action: "check_bucket", bucket_id: "bucket-loisirs" } }
    );
  }

  // --- Rule 4: Moroccan Holiday Countdown (J-7 before Ramadan/Aid) ---
  events.forEach(e => {
    const target = new Date(e.start_date);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0 && diffDays <= 7) {
      addMessage(
        `event_countdown_${e.id}`,
        `${e.name} approche à grands pas ! 🇲🇦`,
        `Il reste seulement ${diffDays} jours avant ${e.name}. C'est le moment d'activer ton profil saisonnier et de blinder l'enveloppe d'achats !`,
        "info",
        { actionLabel: "Gérer le Budget Fête", actionPayload: { action: "navigate_events", event_id: e.id } }
      );
    }
  });

  // --- Rule 5: Jmâa Reminder (Contribution due soon) ---
  tontines.forEach(t => {
    if (t.status === 'active') {
      addMessage(
        `tontine_due_${t.id}`,
        "Échéance Jmâa El Kheir ! 🤝",
        `C'est bientôt le tour de cotisation pour ta tontine "${t.name}". Prépare tes ${t.contribution_amount} DH à verser à tes partenaires d'épargne !`,
        "info",
        { actionLabel: "Voir Daret", actionPayload: { action: "navigate_tontines" } }
      );
    }
  });

  // --- Rule 6: Monthly Bilan Ready (1st of each month for Analyse+/Elite tiers) ---
  if (now.getDate() === 1) {
    let subscriptionTier = 'free';
    let lang = 'fr';
    try {
      const rawProfile = localStorage.getItem('user_profile') || localStorage.getItem('floussi_table_profiles');
      if (rawProfile) {
        const profile = JSON.parse(rawProfile);
        subscriptionTier = profile.subscription_tier || 'free';
        lang = profile.preferred_language || 'fr';
      }
    } catch (_) {}

    if (subscriptionTier === 'analyse' || subscriptionTier === 'elite') {
      const prevMonthNamesFr = ['Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre'];
      const prevMonthNamesAr = ['دجنبر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر'];
      const prevMonthIndex = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      
      const prevMonthName = lang === 'darija' ? prevMonthNamesAr[prevMonthIndex] : prevMonthNamesFr[prevMonthIndex];
      const title = lang === 'darija' ? "Bilaan dyal Chhar Waajed ! 📊" : "Bilan Mensuel Prêt ! 📊";
      const message = lang === 'darija'
        ? `Ton bilan de ${prevMonthName} est prêt, tu veux qu'on le regarde ensemble ? Sidi Floussi a hâte de faire le point avec toi !`
        : `Ton bilan de ${prevMonthName} est prêt, tu veux qu'on le regarde ensemble ? Sidi Floussi a hâte de faire le point avec toi !`;

      addMessage(
        "monthly_bilan_ready",
        title,
        message,
        "success",
        { actionLabel: lang === 'darija' ? "N-choufo" : "Regarder", actionPayload: { action: "navigate_coaching_monthly" } }
      );
    }
  }

  // --- Rule 7: Floussi Score Tier Changed ---
  if (context.floussiScoreTier) {
    const prevTier = history['last_seen_score_tier'];
    if (prevTier && prevTier !== context.floussiScoreTier) {
      addMessage(
        "score_tier_changed",
        "Nouveau palier Score Floussi ! 🎉",
        `Félicitations ! Tu es passé du palier ${prevTier} au palier **${context.floussiScoreTier}**. Sidi Floussi est fier de ta discipline financière. Continue comme ça ! 🚀`,
        "success",
        { actionLabel: "Voir mon score", actionPayload: { action: "navigate", url: "/insights" } }
      );
    }
    history['last_seen_score_tier'] = context.floussiScoreTier;
  }

  // --- Rule 8: Unviewed Weekly Report Reminder ---
  const savedReports = getSavedWeeklyReports(userId);
  if (savedReports.length > 0) {
    const latestReport = savedReports[0];
    const viewedKey = `floussi_weekly_report_viewed_${latestReport.id}`;
    const isViewed = localStorage.getItem(viewedKey) === 'true';
    if (!isViewed) {
      const genKey = `floussi_weekly_report_detected_${latestReport.id}`;
      let detectedAtStr = localStorage.getItem(genKey);
      if (!detectedAtStr) {
        detectedAtStr = now.toISOString();
        localStorage.setItem(genKey, detectedAtStr);
      }
      const detectedAt = new Date(detectedAtStr);
      const diffMs = now.getTime() - detectedAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays >= 2) {
        addMessage(
          "weekly_report_unviewed_reminder",
          "Rapport Hebdo en attente ! 📈",
          "Ton rapport de coaching de la semaine est disponible depuis 2 jours et t'attend. Aji, prenons 2 minutes pour faire le point sur ton sandoq et tes réussites !",
          "info",
          { actionLabel: "Consulter mon rapport", actionPayload: { action: "navigate", url: "/coaching" } }
        );
      }
    }
  }

  // --- Rule 9: Active Optimization Challenge Ending Soon ---
  const savedChallenges = getSavedChallenges(userId);
  const activeChals = savedChallenges.filter(c => c.status === 'active');
  activeChals.forEach(c => {
    const end = new Date(c.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 2 && c.onTrack) {
      addMessage(
        `challenge_ending_soon_${c.id}`,
        "Dernière ligne droite ! 🏁",
        `Ton défi "${c.title}" se termine dans moins de 2 jours ! Tu es parfaitement sur la bonne voie (${c.currentValue} DH dépensés sur un budget de ${c.targetValue} DH). Continue ainsi, tu vas réussir ! 💪`,
        "success",
        { actionLabel: "Voir mon défi", actionPayload: { action: "navigate", url: "/coaching" } }
      );
    }
  });

  // --- Rule 10: Low Wallet Balance with Recurring Bills ---
  const walletBal = getWalletBalance(userId);
  const bills = getBillPayments(userId);
  if (walletBal && walletBal.balance < 50 && bills && bills.length > 0) {
    addMessage(
      "wallet_balance_low_with_bills",
      "Alerte solde Wallet bas ! ⚠️",
      `Attention ! Ton solde de portefeuille virtuel est de seulement ${walletBal.balance} DH alors que tu as des factures enregistrées. Recharge ton sandoq Wallet pour éviter les interruptions !`,
      "warning",
      { actionLabel: "Recharger mon Wallet", actionPayload: { action: "navigate", url: "/net-worth" } }
    );
  }

  // --- Rule 11: Subscription Tier Changed ---
  if (context.subscriptionTier) {
    const prevSubTier = history['last_seen_subscription_tier'];
    if (prevSubTier && prevSubTier !== context.subscriptionTier) {
      const badgeInfo = getSubscriptionBadgeVisual(context.subscriptionTier);
      addMessage(
        `subscription_tier_changed_${context.subscriptionTier}`,
        `Bienvenue au palier ${badgeInfo.nameFr} ! ${badgeInfo.emoji}`,
        `Sidi Floussi te souhaite la bienvenue dans ton nouveau palier **${badgeInfo.nameFr}** (${badgeInfo.nameDarija}) ! Profite dès maintenant de tous tes avantages et de l'accompagnement exclusif. ✨`,
        "success",
        { actionLabel: "Voir mes avantages", actionPayload: { action: "navigate", url: "/settings" } }
      );
    }
    history['last_seen_subscription_tier'] = context.subscriptionTier;
  }

  // Save updated history back to localStorage if any messages were generated
  if (generatedMessages.length > 0) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (_) {}
  }

  // Limit returning newly generated messages to those that fit the daily quota
  return generatedMessages.slice(0, 3 - triggeredToday);
}
