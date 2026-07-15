import { DailyCheckin } from '../types';

export interface CheckinPromptContext {
  yesterdayTransactionCount: number;
  todayBudgetStatus: 'good' | 'warning' | 'danger';
  upcomingEventName?: string;
  upcomingEventDays?: number;
}

export interface CheckinPrompt {
  questionFr: string;
  questionDarija: string;
}

/**
 * Generates a contextualized checkin question for Sidi Floussi
 */
export function generateCheckinPrompt(context: CheckinPromptContext): CheckinPrompt {
  // 1. Upcoming Event approaching (under 7 days)
  if (context.upcomingEventDays !== undefined && context.upcomingEventDays <= 7 && context.upcomingEventName) {
    return {
      questionFr: `L'événement "${context.upcomingEventName}" approche à grands pas (dans ${context.upcomingEventDays} jours) ! Comment tu te sens par rapport à tes préparatifs financiers ? 🌙`,
      questionDarija: `L-monasaba dyal "${context.upcomingEventName}" 9ribat bzaf (baqi liha ${context.upcomingEventDays} d l-yam) ! Kifach kat7ess b l-mizaniya dyalek fl-isti3dadat ? 🌙`
    };
  }

  // 2. Budget status is danger or warning
  if (context.todayBudgetStatus === 'danger') {
    return {
      questionFr: `Oups, j'ai vu que certains de tes sandoqs budgétaires sont sous haute tension (en rouge) 😰... Comment tu vis cette période financièrement ?`,
      questionDarija: `Aji tchouf, chi sandoq d l-budget dyalek mzira l-7ala fih bzaf dba 😰... Kifach raki m3amer had l-weqt fl-flouss ?`
    };
  } else if (context.todayBudgetStatus === 'warning') {
    return {
      questionFr: `Attention, tes limites de dépenses mensuelles se rapprochent. Comment gères-tu ton masrouf aujourd'hui ? ⚖️`,
      questionDarija: `7di rassek, 9rebti l-7add d l-masarif had chhar. Kifach dba rad l-bal m3a l-masrouf dyalek ? ⚖️`
    };
  }

  // 3. Yesterday had 0 logged transactions
  if (context.yesterdayTransactionCount === 0) {
    return {
      questionFr: `Tu n'as rien enregistré dans ton journal de dépenses hier — tout va bien ou as-tu simplement zappé quelques petits achats ? 😉`,
      questionDarija: `Ma sejjelti walou f l-flouss dyalek lbar7 — kolchi mzyan oula ghir nsiti chi mouchtariat sghira ? 😉`
    };
  }

  // 4. Default calm / positive day
  return {
    questionFr: `Journée financière tranquille aujourd'hui ? Comment décrirais-tu ton état d'esprit financier actuel en un mot ? 🪙`,
    questionDarija: `Nharek d l-flouss hani l-youma ? Kifach kat7ess b t-tawfir w l-masrouf dya l-weqt ? 🪙`
  };
}

/**
 * Saves a daily checkin and manages history (caps at 90 items)
 */
export function saveCheckin(checkin: DailyCheckin): void {
  const userId = checkin.userId || 'mock-user-id-9999';
  const key = `floussi_checkins_${userId}`;
  
  let history: DailyCheckin[] = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      history = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse checkin history:', err);
  }

  // Filter out any duplicate for today to prevent double entries
  history = history.filter(item => item.date !== checkin.date);

  // Add new checkin to the front
  history.unshift(checkin);

  // Cap at 90 days
  if (history.length > 90) {
    history = history.slice(0, 90);
  }

  localStorage.setItem(key, JSON.stringify(history));
}

/**
 * Retrieves the checkin history for a user
 */
export function getCheckinHistory(userId: string, days: number = 30): DailyCheckin[] {
  const cleanUserId = userId || 'mock-user-id-9999';
  const key = `floussi_checkins_${cleanUserId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const history = JSON.parse(raw) as DailyCheckin[];
      return history.slice(0, days);
    }
  } catch (err) {
    console.error('Failed to fetch checkin history:', err);
  }
  return [];
}

/**
 * Checks if the user already checked in today
 */
export function hasCheckedInToday(userId: string): boolean {
  const cleanUserId = userId || 'mock-user-id-9999';
  const todayStr = new Date().toISOString().split('T')[0];
  const history = getCheckinHistory(cleanUserId, 5);
  return history.some(item => item.date === todayStr);
}
