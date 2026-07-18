import { ProactiveMessage } from './sidi-proactive-rules';
import { WinBackMessage } from './winback-messages';
import { Badge } from './gamification';

export interface FloussiNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority?: 'urgent' | 'important' | 'info';
  timestamp: string; // ISO string
  category?: 'urgent_financial' | 'sidi' | 'gamification' | 'social' | 'system';
  actionLabel?: string;
  actionPayload?: Record<string, any>;
}

/**
 * Normalizes a proactive message from Sidi into the central FloussiNotification pivot format.
 */
export function normalizeProactiveMessage(msg: ProactiveMessage): FloussiNotification {
  return {
    id: msg.id || `proactive-${msg.ruleName}-${Date.now()}`,
    title: msg.title,
    message: msg.message,
    time: "À l'instant",
    isRead: false,
    priority: msg.type === 'warning' ? 'urgent' : msg.type === 'success' ? 'info' : 'important',
    timestamp: msg.createdAt || new Date().toISOString(),
    category: 'sidi',
    actionLabel: msg.actionLabel,
    actionPayload: msg.actionPayload
  };
}

/**
 * Normalizes a badge unlock event into the central FloussiNotification pivot format.
 */
export function normalizeBadgeUnlock(
  badge: { id: string; title: string; description: string; emoji: string },
  language: 'fr' | 'darija' = 'fr'
): FloussiNotification {
  return {
    id: `badge-unlock-${badge.id}-${Date.now()}`,
    title: language === 'darija' ? "🏅 Badge t-ftech !" : "🏅 Badge débloqué !",
    message: badge.title,
    time: "À l'instant",
    isRead: false,
    priority: 'info',
    timestamp: new Date().toISOString(),
    category: 'gamification'
  };
}

/**
 * Normalizes a WinBack Message into the central FloussiNotification pivot format.
 */
export function normalizeWinBackMessage(msg: WinBackMessage, language: 'fr' | 'darija' = 'fr'): FloussiNotification {
  const content = msg[language] || msg['fr'];
  return {
    id: `winback-${msg.targetPage}-${Date.now()}`,
    title: content.title,
    message: content.message,
    time: "À l'instant",
    isRead: false,
    priority: 'important',
    timestamp: new Date().toISOString(),
    category: 'urgent_financial',
    actionLabel: content.ctaLabel,
    actionPayload: { targetPage: msg.targetPage }
  };
}

/**
 * Categorizes a notification into one of the unifed categories.
 */
export function categorizeNotification(notif: FloussiNotification): 'urgent_financial' | 'sidi' | 'gamification' | 'social' | 'system' {
  if (notif.category) {
    return notif.category;
  }

  const titleLower = notif.title.toLowerCase();
  const msgLower = notif.message.toLowerCase();

  if (titleLower.includes('sidi') || msgLower.includes('sidi')) {
    return 'sidi';
  }
  if (
    titleLower.includes('badge') ||
    titleLower.includes('xp') ||
    titleLower.includes('niveau') ||
    titleLower.includes('streak') ||
    titleLower.includes('défi') ||
    titleLower.includes('defi')
  ) {
    return 'gamification';
  }
  if (
    titleLower.includes('ami') ||
    titleLower.includes('partage') ||
    titleLower.includes('invit') ||
    titleLower.includes('referral') ||
    titleLower.includes('parrainage') ||
    titleLower.includes('partager')
  ) {
    return 'social';
  }
  if (
    notif.priority === 'urgent' ||
    notif.priority === 'important' ||
    titleLower.includes('budget') ||
    titleLower.includes('sandoq') ||
    titleLower.includes('daret') ||
    titleLower.includes('tontine') ||
    titleLower.includes('rappel') ||
    titleLower.includes('alerte') ||
    titleLower.includes('dépassement')
  ) {
    return 'urgent_financial';
  }

  return 'system';
}
