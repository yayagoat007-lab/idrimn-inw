import { Language } from './i18n';

export interface ChecklistItem {
  id: string;
  label: {
    fr: string;
    darija: string;
  };
  description: {
    fr: string;
    darija: string;
  };
  isCompleted: (userData: SetupChecklistData) => boolean;
  actionRoute: string; // The screen key we pass to onNavigate
  xpReward: number;
  icon: string;
}

export interface SetupChecklistData {
  accounts: any[];
  goals: any[];
  transactions: any[];
  sidiMessages: any[];
  buckets: any[];
  walletMovements: any[];
}

export const SETUP_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'add_account',
    label: {
      fr: "Ajouter ton premier compte",
      darija: "Zid l'hssab dyalk l'awal 💳"
    },
    description: {
      fr: "Configurez votre premier compte bancaire ou compte cash pour suivre votre solde global.",
      darija: "Sejjel hssab l-banka dyalk wlla cash bach t-tabe3 r-rassid l-3am."
    },
    isCompleted: (data: SetupChecklistData) => data.accounts.length > 0,
    actionRoute: 'settings', // Direct to settings where accounts are managed
    xpReward: 30,
    icon: 'CreditCard'
  },
  {
    id: 'create_goal',
    label: {
      fr: "Créer ton premier objectif d'épargne",
      darija: "Diir l-hadaf dyalk l'awal 🎯"
    },
    description: {
      fr: "Aïd, mariage, voyage ou apport immobilier : commencez à épargner pour vos rêves.",
      darija: "Aïd, zwaj, safar wlla chra dyal d-dar : bda t-khbi floussekk l-hadaf dyalk."
    },
    isCompleted: (data: SetupChecklistData) => data.goals.length > 0,
    actionRoute: 'goals',
    xpReward: 30,
    icon: 'Target'
  },
  {
    id: 'scan_receipt',
    label: {
      fr: "Scanner ton premier reçu",
      darija: "Scanni l-wasl dyalk l'awal 🧾"
    },
    description: {
      fr: "Prenez en photo un ticket Marjane, BIM ou Carrefour pour l'analyser automatiquement.",
      darija: "Sowwer ticket d-cash dyalk (Marjane, BIM) bach s-sistim i-9rah rasso."
    },
    isCompleted: (data: SetupChecklistData) => {
      return data.transactions.some(t => 
        (t.tags && (t.tags.includes('ocr') || t.tags.includes('split'))) || 
        !!t.receipt_url
      );
    },
    actionRoute: 'transactions',
    xpReward: 50,
    icon: 'Camera'
  },
  {
    id: 'try_sidi',
    label: {
      fr: "Essayer Sidi Floussi",
      darija: "Hdar m3a Sidi Floussi 🤖"
    },
    description: {
      fr: "Discutez avec notre assistant IA virtuel de vos objectifs financiers en Darija ou en Français.",
      darija: "Sifet risala l Sidi Floussi bach i-jawbek b-Darija o i-3tik nassa2ih."
    },
    isCompleted: (data: SetupChecklistData) => {
      return data.sidiMessages.some(m => m.sender === 'user');
    },
    actionRoute: 'dashboard', // Sidi is accessible from the floating FAB on dashboard
    xpReward: 30,
    icon: 'MessageSquareCode'
  },
  {
    id: 'customize_buckets',
    label: {
      fr: "Personnaliser tes enveloppes (Sanadi9)",
      darija: "Beddel s-sanadi9 dyalk 📦"
    },
    description: {
      fr: "Modifiez l'un de vos buckets par défaut ou créez-en un nouveau pour l'adapter à vos besoins.",
      darija: "Beddel l-montant dyal sandoq bach i-jii m3a l-masrouf dyalk."
    },
    isCompleted: (data: SetupChecklistData) => {
      if (data.buckets.length !== 3) return true;
      const defaultFood = data.buckets.find(b => b.id === 'bucket-food');
      const defaultHousing = data.buckets.find(b => b.id === 'bucket-housing');
      const defaultTontine = data.buckets.find(b => b.id === 'bucket-tontine');
      
      if (!defaultFood || !defaultHousing || !defaultTontine) return true;
      return defaultFood.allocated_amount !== 1500 || defaultHousing.allocated_amount !== 2500 || defaultTontine.allocated_amount !== 500;
    },
    actionRoute: 'buckets',
    xpReward: 30,
    icon: 'Package'
  },
  {
    id: 'discover_wallet',
    label: {
      fr: "Découvrir le Wallet virtuel",
      darija: "Ktechef l-Mihfada l'iftiradiya 📱"
    },
    description: {
      fr: "Accédez à votre espace Wallet pour simuler des transferts P2P, recharges et défis d'épargne.",
      darija: "Ktechef l-Mihfada dyalk bach t-jarrab l-tahwilat, r-recharges o l-challenges d-tawfir."
    },
    isCompleted: (data: SetupChecklistData) => {
      const discovered = typeof window !== 'undefined' ? localStorage.getItem('floussi_wallet_discovered') === 'true' : false;
      return discovered || data.walletMovements.length > 1;
    },
    actionRoute: 'wallet',
    xpReward: 30,
    icon: 'Wallet'
  }
];

export function calculateChecklistProgress(items: ChecklistItem[], userData: SetupChecklistData) {
  const totalCount = items.length;
  const completedCount = items.filter(item => item.isCompleted(userData)).length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return {
    completedCount,
    totalCount,
    percentComplete
  };
}

export function shouldShowChecklist(accountCreatedAt: string | undefined, percentComplete: number): boolean {
  if (percentComplete === 100) return false;
  if (!accountCreatedAt) return true;
  
  const createdDate = new Date(accountCreatedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 30;
}
