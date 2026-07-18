import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FloussiNotification,
  normalizeProactiveMessage,
  normalizeBadgeUnlock,
  normalizeWinBackMessage,
  categorizeNotification
} from '../lib/notification-hub';
import { ProactiveMessage } from '../lib/sidi-proactive-rules';
import { WinBackMessage } from '../lib/winback-messages';

export interface NotificationPreferences {
  quietHoursEnabled: boolean;
  quietHoursStart: number; // e.g. 22 (10 PM)
  quietHoursEnd: number;   // e.g. 8 (8 AM)
  categoriesEnabled: Record<string, boolean>;
  channelPush: boolean;
  channelEmail: boolean;
  channelSms: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  quietHoursEnabled: true,
  quietHoursStart: 22,
  quietHoursEnd: 8,
  categoriesEnabled: {
    urgent_financial: true,
    sidi: true,
    gamification: true,
    social: true,
    system: true,
  },
  channelPush: true,
  channelEmail: true,
  channelSms: true,
};

export function useNotificationCenter(userId: string = "mock-user-id-9999") {
  const [notifications, setNotifications] = useState<FloussiNotification[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS);

  // 1. Load notifications and preferences from localStorage on mount & when userId changes
  useEffect(() => {
    if (!userId) return;

    // Load Notifications
    const savedNotifs = localStorage.getItem(`notifs_${userId}`);
    let loadedNotifs: FloussiNotification[] = [];
    if (savedNotifs) {
      try {
        loadedNotifs = JSON.parse(savedNotifs);
      } catch (_) {}
    } else {
      // Setup initial default notifications if none exist
      loadedNotifs = [
        {
          id: "notif-1",
          title: "Rappel Jmâa",
          message: "Votre contribution de 1 000 DH pour 'Jmâa El Kheir' est due dans 3 jours.",
          time: "Il y a 1 heure",
          isRead: false,
          priority: 'important',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          category: 'urgent_financial'
        },
        {
          id: "notif-2",
          title: "Alerte Sandoq",
          message: "Le sandoq Alimentation a dépassé 80% de sa limite mensuelle.",
          time: "Il y a 1 jour",
          isRead: false,
          priority: 'urgent',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          category: 'urgent_financial'
        }
      ];
      localStorage.setItem(`notifs_${userId}`, JSON.stringify(loadedNotifs));
    }

    // Load Preferences
    const savedPrefs = localStorage.getItem(`notif_prefs_${userId}`);
    if (savedPrefs) {
      try {
        setNotificationPreferences(JSON.parse(savedPrefs));
      } catch (_) {}
    } else {
      localStorage.setItem(`notif_prefs_${userId}`, JSON.stringify(DEFAULT_PREFS));
    }

    // Sync any existing pending Sidi proactive messages on mount
    const savedSidiPending = localStorage.getItem(`floussi_sidi_pending_proactive_${userId}`);
    if (savedSidiPending) {
      try {
        const sidiMsgs: ProactiveMessage[] = JSON.parse(savedSidiPending);
        let hasChanges = false;
        
        sidiMsgs.forEach(msg => {
          const isAlreadyAdded = loadedNotifs.some(n => n.id === msg.id || n.id.includes(msg.ruleName));
          if (!isAlreadyAdded) {
            const normalized = normalizeProactiveMessage(msg);
            loadedNotifs = [normalized, ...loadedNotifs];
            hasChanges = true;
          }
        });

        if (hasChanges) {
          localStorage.setItem(`notifs_${userId}`, JSON.stringify(loadedNotifs));
        }
      } catch (_) {}
    }

    setNotifications(loadedNotifs);
  }, [userId]);

  // 2. Save notifications helper
  const saveNotifications = useCallback((list: FloussiNotification[]) => {
    setNotifications(list);
    localStorage.setItem(`notifs_${userId}`, JSON.stringify(list));
  }, [userId]);

  // 3. Mark single as read
  const markAsRead = useCallback((id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // 4. Mark all as read
  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // 5. Delete notification
  const deleteNotification = useCallback((id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // 6. Update preferences
  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setNotificationPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem(`notif_prefs_${userId}`, JSON.stringify(updated));
      return updated;
    });
  }, [userId]);

  // 7. Get sorted notifications (unread first, then newest first)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [notifications]);

  // 8. Filter by category function
  const filterByCategory = useCallback((category: string) => {
    if (category === 'all') return sortedNotifications;
    return sortedNotifications.filter(n => categorizeNotification(n) === category);
  }, [sortedNotifications]);

  // 9. Count of unread notifications
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // 10. Trigger central notification with preference gating, quiet hours, and channel routing
  const triggerPushNotification = useCallback(async (
    title: string,
    body: string,
    priority: 'urgent' | 'important' | 'info' = 'info',
    category: 'urgent_financial' | 'sidi' | 'gamification' | 'social' | 'system' = 'system',
    language: 'fr' | 'darija' = 'fr'
  ) => {
    // Check category settings
    if (notificationPreferences.categoriesEnabled && !notificationPreferences.categoriesEnabled[category]) {
      console.log(`[Notification Hub] Suppressed notification of disabled category: "${category}".`);
      return;
    }

    // Check quiet hours
    const now = new Date();
    const currentHour = now.getHours();
    let isQuietTime = false;
    const { quietHoursEnabled, quietHoursStart, quietHoursEnd } = notificationPreferences;
    
    if (quietHoursEnabled) {
      if (quietHoursStart <= quietHoursEnd) {
        isQuietTime = currentHour >= quietHoursStart && currentHour < quietHoursEnd;
      } else {
        isQuietTime = currentHour >= quietHoursStart || currentHour < quietHoursEnd;
      }
    }

    if (isQuietTime && priority !== 'urgent') {
      console.log(`[Smart Silence] Suppressed '${priority}' notification: "${title}" during silence window (${quietHoursStart}h-${quietHoursEnd}h).`);
      return;
    }

    // Check priority cooldown (defer 'info' if recent high-priority alerts)
    const last15Mins = now.getTime() - (15 * 60 * 1000);
    const hasRecentHighPriority = notifications.some(n =>
      new Date(n.timestamp).getTime() > last15Mins &&
      (n.priority === 'urgent' || n.priority === 'important')
    );

    if (priority === 'info' && hasRecentHighPriority) {
      console.log(`[Priority Deferral] Deferring low priority tip: "${title}" due to recent critical alert.`);
      return;
    }

    // Hourly rate limit & grouping (max 3 per hour)
    const oneHourAgo = now.getTime() - (60 * 60 * 1000);
    const sentInLastHour = notifications.filter(n => new Date(n.timestamp).getTime() > oneHourAgo);

    let finalTitle = title;
    let finalBody = body;

    if (sentInLastHour.length >= 3) {
      const totalCount = sentInLastHour.length + 1;
      finalTitle = language === 'darija'
        ? `🔔 ${totalCount} dyal t-Tanbihat Jdad f Floussi`
        : `🔔 ${totalCount} nouvelles alertes Floussi`;
      finalBody = language === 'darija'
        ? "3andek alertes jdad b-nisba l l-mizaniya dyalk ola d-tontine. Dkhol l-app dba."
        : "Vous avez reçu plusieurs alertes budgétaires ou d'épargne. Ouvrez l'application pour voir le récapitulatif.";
      console.log(`[Notification Grouping] Grouped ${totalCount} notifications to avoid visual noise.`);
    }

    // Local / Push Notification triggers
    if (notificationPreferences.channelPush) {
      const cap = (window as any).Capacitor;
      if (cap?.Plugins?.LocalNotifications) {
        try {
          await cap.Plugins.LocalNotifications.schedule({
            notifications: [
              {
                title: finalTitle,
                body: finalBody,
                id: Math.floor(Math.random() * 100000),
                schedule: { at: new Date(Date.now() + 1000) },
                sound: null,
                attachments: null,
                actionTypeId: "",
                extra: null
              }
            ]
          });
        } catch (err) {
          console.error("Capacitor local push error", err);
        }
      } else if ("Notification" in window && Notification.permission === "granted") {
        new Notification(finalTitle, { body: finalBody });
      } else {
        console.log(`[Notification Sim] [PUSH] [${priority.toUpperCase()}] ${finalTitle}: ${finalBody}`);
      }
    }

    if (notificationPreferences.channelEmail) {
      console.log(`[Notification Sim] [EMAIL] sent to ${userId}: "${finalTitle}" - ${finalBody}`);
    }

    if (notificationPreferences.channelSms) {
      console.log(`[Notification Sim] [SMS] sent to ${userId}: "${finalTitle}" - ${finalBody}`);
    }

    // Add to in-app notifications log
    const newNotif: FloussiNotification = {
      id: `notif-${Math.random()}`,
      title: finalTitle,
      message: finalBody,
      time: "À l'instant",
      isRead: false,
      priority,
      timestamp: now.toISOString(),
      category
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem(`notifs_${userId}`, JSON.stringify(updated));
      return updated;
    });
  }, [userId, notifications, notificationPreferences]);

  // 11. Event listeners to aggregate all event sources reactively
  useEffect(() => {
    // Listener A: Gamification Badge Unlocked
    const handleBadgeUnlocked = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { badge } = customEvent.detail;
      if (badge) {
        const notif = normalizeBadgeUnlock(badge);
        setNotifications(prev => {
          const isDuplicate = prev.some(n => n.id === notif.id);
          if (isDuplicate) return prev;
          
          const updated = [notif, ...prev];
          localStorage.setItem(`notifs_${userId}`, JSON.stringify(updated));
          
          // Trigger push/channel alerts
          triggerPushNotification(
            notif.title,
            notif.message,
            notif.priority,
            notif.category,
            'fr'
          );

          return updated;
        });
      }
    };

    // Listener B: Sidi Proactive message added
    const handleSidiProactiveAdded = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { messages } = customEvent.detail;
      if (Array.isArray(messages)) {
        setNotifications(prev => {
          let updated = [...prev];
          let hasChanges = false;

          messages.forEach((msg: ProactiveMessage) => {
            const isDuplicate = updated.some(n => n.id === msg.id || n.id.includes(msg.ruleName));
            if (!isDuplicate) {
              const notif = normalizeProactiveMessage(msg);
              updated = [notif, ...updated];
              hasChanges = true;

              // Push notifications
              triggerPushNotification(
                notif.title,
                notif.message,
                notif.priority,
                notif.category,
                'fr'
              );
            }
          });

          if (hasChanges) {
            localStorage.setItem(`notifs_${userId}`, JSON.stringify(updated));
          }
          return updated;
        });
      }
    };

    // Listener C: Winback triggered
    const handleWinbackTriggered = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { message } = customEvent.detail;
      if (message) {
        const winbackMsg = message as WinBackMessage;
        const notif = normalizeWinBackMessage(winbackMsg, 'fr');
        setNotifications(prev => {
          const isDuplicate = prev.some(n => n.title === notif.title && n.message === notif.message);
          if (isDuplicate) return prev;

          const updated = [notif, ...prev];
          localStorage.setItem(`notifs_${userId}`, JSON.stringify(updated));

          // Trigger push/channel alerts
          triggerPushNotification(
            notif.title,
            notif.message,
            notif.priority,
            notif.category,
            'fr'
          );

          return updated;
        });
      }
    };

    window.addEventListener('floussi_badge_unlocked', handleBadgeUnlocked);
    window.addEventListener('floussi_sidi_proactive_added', handleSidiProactiveAdded);
    window.addEventListener('floussi_winback_triggered', handleWinbackTriggered);

    return () => {
      window.removeEventListener('floussi_badge_unlocked', handleBadgeUnlocked);
      window.removeEventListener('floussi_sidi_proactive_added', handleSidiProactiveAdded);
      window.removeEventListener('floussi_winback_triggered', handleWinbackTriggered);
    };
  }, [userId, triggerPushNotification]);

  return {
    notifications: sortedNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    filterByCategory,
    getFilteredNotifications: filterByCategory,
    notificationPreferences,
    updatePreferences,
    triggerPushNotification
  };
}
