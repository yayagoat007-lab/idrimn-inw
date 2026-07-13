import { useState, useEffect } from 'react';

export interface SupportTicket {
  id: string;
  userName: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  replies: { sender: 'admin' | 'user'; text: string; date: string }[];
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-1',
    userName: 'Kamil Alaoui',
    email: 'kamil.alaoui@gmail.com',
    subject: 'Problème de validation PIN Jmâa',
    message: 'Mon cousin n\'arrive pas à entrer son PIN pour valider sa cotisation de 500 DH. Que faire ?',
    status: 'open',
    createdAt: '2026-07-12 10:34',
    replies: []
  },
  {
    id: 'tkt-2',
    userName: 'Meryem Slaoui',
    email: 'meryem.s@hotmail.fr',
    subject: 'Demande de remboursement 30 jours',
    message: 'J\'ai souscrit au forfait Sandoqs Famille par erreur, je souhaite être remboursée.',
    status: 'in_progress',
    createdAt: '2026-07-11 15:20',
    replies: [
      { sender: 'admin', text: 'Bonjour Meryem, nous avons pris en compte votre demande. Votre remboursement est en cours de traitement par CMI.', date: '2026-07-12 09:00' }
    ]
  },
  {
    id: 'tkt-3',
    userName: 'Said Naciri',
    email: 'naciri.said@gmail.com',
    subject: 'Exportation de données comptables',
    message: 'Est-il possible d\'automatiser l\'envoi des rapports de dépenses par email en format CSV ?',
    status: 'closed',
    createdAt: '2026-07-08 11:15',
    replies: [
      { sender: 'admin', text: 'Bonjour Said, oui, c\'est possible avec le plan Analyse ou Elite.', date: '2026-07-08 14:00' },
      { sender: 'user', text: 'Parfait, merci pour votre réponse rapide !', date: '2026-07-08 16:30' }
    ]
  }
];

export function useAdminTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('floussi_support_tickets');
    if (saved) {
      setTickets(JSON.parse(saved));
    } else {
      setTickets(INITIAL_TICKETS);
      localStorage.setItem('floussi_support_tickets', JSON.stringify(INITIAL_TICKETS));
    }
    setLoading(false);
  }, []);

  const saveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    localStorage.setItem('floussi_support_tickets', JSON.stringify(updated));
  };

  const addTicketReply = (ticketId: string, replyText: string) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'in_progress' as const,
          replies: [...t.replies, { sender: 'admin' as const, text: replyText, date: new Date().toLocaleString() }]
        };
      }
      return t;
    });
    saveTickets(updated);
  };

  const updateTicketStatus = (ticketId: string, status: 'open' | 'in_progress' | 'closed') => {
    const updated = tickets.map(t => t.id === ticketId ? { ...t, status } : t);
    saveTickets(updated);
  };

  const createTicket = (data: { userName: string; email: string; subject: string; message: string }) => {
    const newTicket: SupportTicket = {
      ...data,
      id: `tkt-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toLocaleString(),
      replies: []
    };
    saveTickets([newTicket, ...tickets]);
  };

  return { tickets, loading, addTicketReply, updateTicketStatus, createTicket };
}
