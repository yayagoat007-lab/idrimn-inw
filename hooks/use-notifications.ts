import { useState, useEffect } from 'react';

export interface FloussiNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority?: 'urgent' | 'important' | 'info';
  timestamp: string; // ISO string
}

export function useNotifications(userId: string = "mock-user-id-9999") {
  const [notifications, setNotifications] = useState<FloussiNotification[]>([]);

  useEffect(() => {
    const loadNotifs = () => {
      const saved = localStorage.getItem(`notifs_${userId}`);
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
          return;
        } catch (_) {}
      }

      // Initial defaults
      const initial: FloussiNotification[] = [
        {
          id: "notif-1",
          title: "Rappel Jmâa",
          message: "Votre contribution de 1 000 DH pour 'Jmâa El Kheir' est due dans 3 jours.",
          time: "Il y a 1 heure",
          isRead: false,
          priority: 'important',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "notif-2",
          title: "Alerte Sandoq",
          message: "Le sandoq Alimentation a dépassé 80% de sa limite mensuelle.",
          time: "Il y a 1 jour",
          isRead: false,
          priority: 'urgent',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      setNotifications(initial);
      localStorage.setItem(`notifs_${userId}`, JSON.stringify(initial));
    };

    loadNotifs();
  }, [userId]);

  const saveNotifications = (list: FloussiNotification[]) => {
    setNotifications(list);
    localStorage.setItem(`notifs_${userId}`, JSON.stringify(list));
  };

  /**
   * Triggers a push or simulated notification with priority rules, silence hours, and rate limits.
   */
  const triggerPushNotification = async (
    title: string, 
    body: string, 
    priority: 'urgent' | 'important' | 'info' = 'info',
    language: 'fr' | 'darija' = 'fr'
  ) => {
    const now = new Date();
    const currentHour = now.getHours();

    // 1. SMART SILENCE WINDOW (22h - 8h)
    // Silence any notification that is NOT marked 'urgent' during these hours.
    const isSilencePeriod = currentHour >= 22 || currentHour < 8;
    if (isSilencePeriod && priority !== 'urgent') {
      console.log(`[Smart Silence] Suppressed '${priority}' notification: "${title}" during 22h-8h silence window.`);
      return;
    }

    // 2. PRIORITY SUSPENSION / COOLDOWN
    // Defer low-priority 'info' tips if user received any 'urgent' or 'important' alert in the last 15 minutes.
    const last15Mins = now.getTime() - (15 * 60 * 1000);
    const hasRecentHighPriority = notifications.some(n => 
      new Date(n.timestamp).getTime() > last15Mins && 
      (n.priority === 'urgent' || n.priority === 'important')
    );

    if (priority === 'info' && hasRecentHighPriority) {
      console.log(`[Priority Deferral] Deferring low priority tip: "${title}" due to recent critical alert.`);
      return;
    }

    // 3. HOUR RATE LIMIT & GROUPING (Max 3 notifications per hour)
    // If more than 3 alerts in the last hour, group them into a single summary alert.
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

    // Verify if Capacitor native push is loaded
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
      console.log(`[Notification Sim] [${priority.toUpperCase()}] ${finalTitle}: ${finalBody}`);
    }

    // Append to in-app log
    const newNotif: FloussiNotification = {
      id: `notif-${Math.random()}`,
      title: finalTitle,
      message: finalBody,
      time: "À l'instant",
      isRead: false,
      priority,
      timestamp: now.toISOString()
    };

    saveNotifications([newNotif, ...notifications]);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
  };

  const requestPermission = async () => {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
  };

  return {
    notifications,
    triggerPushNotification,
    markAllAsRead,
    requestPermission
  };
}
