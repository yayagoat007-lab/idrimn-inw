import { Transaction, Bucket, MoroccanEvent, Tontine } from '../types';

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

  // Save updated history back to localStorage if any messages were generated
  if (generatedMessages.length > 0) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (_) {}
  }

  // Limit returning newly generated messages to those that fit the daily quota
  return generatedMessages.slice(0, 3 - triggeredToday);
}
