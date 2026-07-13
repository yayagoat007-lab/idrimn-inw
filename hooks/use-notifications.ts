import { useState, useEffect } from 'react';

export interface FloussiNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export function useNotifications(userId: string = "mock-user-id-9999") {
  const [notifications, setNotifications] = useState<FloussiNotification[]>([]);

  useEffect(() => {
    // Initial standard warnings
    setNotifications([
      {
        id: "notif-1",
        title: "Rappel Jmâa",
        message: "Votre contribution de 1 000 DH pour 'Jmâa El Kheir' est due dans 3 jours.",
        time: "Il y a 1 heure",
        isRead: false
      },
      {
        id: "notif-2",
        title: "Alerte Sandoq",
        message: "Le sandoq Alimentation a dépassé 80% de sa limite mensuelle.",
        time: "Il y a 1 jour",
        isRead: false
      }
    ]);
  }, [userId]);

  const triggerPushNotification = async (title: string, body: string) => {
    // Verify if Capacitor native push is loaded
    const cap = (window as any).Capacitor;
    if (cap?.Plugins?.LocalNotifications) {
      try {
        await cap.Plugins.LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
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
      new Notification(title, { body });
    } else {
      console.log(`[Notification Sim] Title: ${title}, Body: ${body}`);
    }

    // Add to in-app notification logs
    const newNotif: FloussiNotification = {
      id: `notif-${Math.random()}`,
      title,
      message: body,
      time: "À l'instant",
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
