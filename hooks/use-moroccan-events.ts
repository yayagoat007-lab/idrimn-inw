import { useState, useEffect } from 'react';
import { MoroccanEvent, MoroccanEventType } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';
import { convertGregorianToHijri, estimateHijriEventInGregorian } from '../lib/hijri';

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  daysRemaining: number;
}

const DEFAULT_EVENTS: MoroccanEvent[] = [
  {
    id: "event-ramadan",
    user_id: "mock-user-id-9999",
    name: "Ramadan 1448",
    type: "ramadan",
    start_date: "2027-02-08",
    end_date: "2027-03-09",
    budget_allocated: 5000,
    budget_spent: 1200,
    notes: "Chbakia, Sellou, dattes et harira pour la famille.",
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "event-aid-adha",
    user_id: "mock-user-id-9999",
    name: "Aïd al-Adha (Mouton Sardi)",
    type: "aid_al_adha",
    start_date: "2026-05-27",
    end_date: "2026-05-30",
    budget_allocated: 4500,
    budget_spent: 4300,
    notes: "Achat du mouton de l'Aïd, charbon et épices.",
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "event-rentree",
    user_id: "mock-user-id-9999",
    name: "Rentrée Scolaire 2026",
    type: "custom",
    start_date: "2026-09-01",
    end_date: "2026-09-08",
    budget_allocated: 3500,
    budget_spent: 3100,
    notes: "Inscription des enfants et achat de livres et fournitures scolaires.",
    is_recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function useMoroccanEvents(userId: string = "mock-user-id-9999") {
  const [events, setEvents] = useState<MoroccanEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      let localEvents = await OfflineDB.get<MoroccanEvent[]>('moroccan_events');

      if (!localEvents || localEvents.length === 0) {
        localEvents = DEFAULT_EVENTS.map(ev => ({ ...ev, user_id: userId }));
        await OfflineDB.set('moroccan_events', localEvents);
        localStorage.setItem('floussi_table_moroccan_events', JSON.stringify(localEvents));
      }

      setEvents(localEvents);
      calculateAlerts(localEvents);
      setLoading(false);
    }

    loadEvents();
  }, [userId]);

  const saveEvents = async (newEvents: MoroccanEvent[]) => {
    setEvents(newEvents);
    await OfflineDB.set('moroccan_events', newEvents);
    localStorage.setItem('floussi_table_moroccan_events', JSON.stringify(newEvents));
    calculateAlerts(newEvents);
  };

  const getDaysRemaining = (targetDateStr: string): number => {
    const target = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getEventStatus = (event: MoroccanEvent): 'active' | 'upcoming' | 'past' => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (todayStr >= event.start_date && todayStr <= event.end_date) {
      return 'active';
    } else if (todayStr < event.start_date) {
      return 'upcoming';
    } else {
      return 'past';
    }
  };

  const calculateAlerts = (evList: MoroccanEvent[]) => {
    const computedAlerts: AlertNotification[] = [];
    evList.forEach(e => {
      const days = getDaysRemaining(e.start_date);
      if (days > 0 && days <= 60) {
        if (e.type === 'ramadan') {
          computedAlerts.push({
            id: `alert-ramadan-${e.id}`,
            title: "Prépare Ramadan !",
            message: `Le Ramadan commence dans ${days} jours. C'est le moment idéal pour ajuster vos enveloppes alimentaires.`,
            type: days <= 15 ? 'warning' : 'info',
            daysRemaining: days
          });
        } else if (e.type === 'aid_al_adha') {
          computedAlerts.push({
            id: `alert-aid-adha-${e.id}`,
            title: "Budget Mouton !",
            message: `Aïd Al-Adha approche à grands pas (dans ${days} jours). Prévoyez environ 3 000 DH pour l'achat du mouton.`,
            type: days <= 30 ? 'warning' : 'info',
            daysRemaining: days
          });
        } else if (e.name.toLowerCase().includes('scolaire') || e.name.toLowerCase().includes('rentrée')) {
          computedAlerts.push({
            id: `alert-school-${e.id}`,
            title: "Rentrée Scolaire !",
            message: `La rentrée scolaire est dans ${days} jours. Anticipez les frais de fournitures et inscriptions !`,
            type: days <= 10 ? 'warning' : 'info',
            daysRemaining: days
          });
        } else {
          computedAlerts.push({
            id: `alert-generic-${e.id}`,
            title: `Événement ${e.name}`,
            message: `Il reste ${days} jours avant l'événement "${e.name}". Pensez à finaliser son budget.`,
            type: days <= 7 ? 'warning' : 'info',
            daysRemaining: days
          });
        }
      }
    });
    setAlerts(computedAlerts);
  };

  // CRUD Actions
  const createEvent = async (event: Omit<MoroccanEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newEvent: MoroccanEvent = {
      ...event,
      id: `ev-${generateId()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [...events, newEvent];
    await saveEvents(updated);
    try {
      await supabase.from('moroccan_events').insert([newEvent]);
    } catch (_) {}
    return newEvent;
  };

  const updateEvent = async (id: string, updates: Partial<MoroccanEvent>) => {
    const updated = events.map(e => {
      if (e.id === id) {
        return { ...e, ...updates, updated_at: new Date().toISOString() };
      }
      return e;
    });
    await saveEvents(updated);
    try {
      await supabase.from('moroccan_events').update(updates).eq('id', id);
    } catch (_) {}
  };

  const deleteEvent = async (id: string) => {
    const updated = events.filter(e => e.id !== id);
    await saveEvents(updated);
    try {
      await supabase.from('moroccan_events').delete().eq('id', id);
    } catch (_) {}
  };

  const duplicateEvent = async (id: string) => {
    const target = events.find(e => e.id === id);
    if (!target) return;
    
    // Increment Gregorian year
    const dStart = new Date(target.start_date);
    dStart.setFullYear(dStart.getFullYear() + 1);
    const dEnd = new Date(target.end_date);
    dEnd.setFullYear(dEnd.getFullYear() + 1);

    const duplicated: MoroccanEvent = {
      ...target,
      id: `ev-${generateId()}`,
      name: `${target.name} (Copie)`,
      start_date: dStart.toISOString().split('T')[0],
      end_date: dEnd.toISOString().split('T')[0],
      budget_spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [...events, duplicated];
    await saveEvents(updated);
    try {
      await supabase.from('moroccan_events').insert([duplicated]);
    } catch (_) {}
  };

  const contributeToEvent = async (eventId: string, amount: number) => {
    const updated = events.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          budget_spent: Math.min(e.budget_allocated, e.budget_spent + amount),
          updated_at: new Date().toISOString()
        };
      }
      return e;
    });
    await saveEvents(updated);
    try {
      await supabase.from('moroccan_events').update({ budget_spent: updated.find(x => x.id === eventId)?.budget_spent }).eq('id', eventId);
    } catch (_) {}
  };

  return {
    events,
    loading,
    alerts,
    getDaysRemaining,
    getEventStatus,
    createEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    contributeToEvent
  };
}
