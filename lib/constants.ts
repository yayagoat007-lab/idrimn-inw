import { SubscriptionTier, AccountType, MoroccanEventType } from '../types';

export const SUBSCRIPTION_TIERS: Record<string, { name: string; price: string; features: string[] }> = {
  free: {
    name: "Gratuit (Siyahi)",
    price: "0 DH/mois",
    features: [
      "Suivi de budget de base (3 buckets)",
      "Saisie manuelle des transactions",
      "Publicités discrètes (Google AdSense)",
      "i18n Français / Darija",
      "Stockage IndexedDB local",
    ]
  },
  premium: {
    name: "Premium (Dahabi)",
    price: "29 DH/mois",
    features: [
      "Buckets illimités",
      "Pas de publicités",
      "OCR illimité pour tickets de caisse",
      "Synchronisation Supabase Cloud",
      "Statistiques avancées",
      "Rapports PDF mensuels",
    ]
  },
  analyse: {
    name: "Analyse Pro",
    price: "49 DH/mois",
    features: [
      "Toutes les fonctionnalités Premium",
      "Conseils personnalisés d'experts financiers marocains",
      "Prévisions de trésorerie par IA",
      "Planification des événements religieux (Ramadan, Aïd)",
      "Alertes de dépassement prédictives",
    ]
  },
  family: {
    name: "Famille (Aila)",
    price: "79 DH/mois",
    features: [
      "Jusqu'à 6 membres partagés",
      "Budgets familiaux collaboratifs",
      "Tableaux de bord pour enfants/conjoints",
      "Tontine privée intégrée",
      "Compte administrateur parent",
    ]
  },
  elite: {
    name: "Elite",
    price: "149 DH/mois",
    features: [
      "Toutes les fonctionnalités Famille & Analyse",
      "Assistance prioritaire 24/7 sur WhatsApp",
      "1 appel de conseil financier de 30min par trimestre",
      "Personnalisation totale des thèmes",
    ]
  }
};

export const BUCKET_CATEGORIES = [
  { id: "food", name: "Alimentation (Khobz & Lmarqa)", icon: "Utensils", color: "#EF4444" },
  { id: "housing", name: "Logement & Factures (Dar & Kahraba)", icon: "Home", color: "#3B82F6" },
  { id: "transport", name: "Transport (Taxi & Tonobil)", icon: "Car", color: "#F59E0B" },
  { id: "ramadan", name: "Ramadan & Aïd (Siam & Moussem)", icon: "Moon", color: "#10B981" },
  { id: "tontine", name: "Drahem d'Tontine (Daret)", icon: "Users", color: "#8B5CF6" },
  { id: "family", name: "Famille (L'Aila)", icon: "Heart", color: "#EC4899" },
  { id: "savings", name: "Épargne (Tawfir)", icon: "TrendingUp", color: "#06B6D4" },
  { id: "leisure", name: "Loisirs & Café (Nshat & Kawa)", icon: "Coffee", color: "#84CC16" },
  { id: "debt", name: "Remboursement (Sallaf)", icon: "ShieldAlert", color: "#6B7280" },
  { id: "other", name: "Autres (Hwayej khrin)", icon: "Layers", color: "#6366F1" }
];

export const ACCOUNT_TYPES: Record<AccountType, string> = {
  checking: "Compte Chèque (Courant)",
  savings: "Compte Épargne (Carnet)",
  cash: "Espèces (Cash / Flous l'jib)",
  investment: "Investissement",
  debt: "Dette / Crédit"
};

export const MOROCCAN_BANKS = [
  { id: "cash", name: "Espèces (Cash / Flous l'jib)" },
  { id: "attijari", name: "Attijariwafa Bank" },
  { id: "bcp", name: "Banque Populaire (BCP)" },
  { id: "cih", name: "CIH Bank" },
  { id: "bmce", name: "Bank of Africa (BMCE)" },
  { id: "sg", name: "Société Générale Maroc" },
  { id: "cdm", name: "Crédit du Maroc" },
  { id: "barid", name: "Al Barid Bank" },
  { id: "wafacash", name: "Wafacash" },
  { id: "cashplus", name: "Cash Plus" }
];

export const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Oujda",
  "Meknès",
  "Kénitra",
  "Tétouan",
  "Safi",
  "El Jadida",
  "Nador",
  "Mohammedia"
];

export const MOROCCAN_EVENTS: Record<MoroccanEventType, { name: string; defaultMonth: string; desc: string }> = {
  ramadan: { name: "Ramadan", defaultMonth: "Variable", desc: "Mois sacré d'abstinence et repas de Ftour conviviaux nécessitant une gestion fine des courses alimentaires." },
  aid_al_fitr: { name: "Aïd al-Fitr", defaultMonth: "Variable", desc: "Fête de fin de Ramadan, cadeaux (L'Aidiya) pour enfants et préparation de gâteaux traditionnels." },
  aid_al_adha: { name: "Aïd al-Adha (Aïd El Kbir)", defaultMonth: "Variable", desc: "Fête du sacrifice. Budget conséquent requis pour l'achat du mouton et des épices." },
  mawlid: { name: "Mawlid al-Nabawi", defaultMonth: "Variable", desc: "Célébration de la naissance du Prophète avec confection de gâteaux, crêpes et repas de famille." },
  hijri_new_year: { name: "Nouvel An Hijri", defaultMonth: "Variable", desc: "Début de l'année de l'Hégire, souvent célébré par un repas traditionnel de Couscous aux sept légumes." },
  wedding: { name: "Mariage (L'Aars)", defaultMonth: "Été", desc: "Mariage traditionnel marocain nécessitant la location de salle, traiteur, Neggafa et orchestre." },
  birth: { name: "Naissance (Sboue)", defaultMonth: "Variable", desc: "Célébration du nouveau-né le 7ème jour avec préparation de Rfissa et sacrifice d'agneaux." },
  hajj: { name: "Pèlerinage (Hajj / Omra)", defaultMonth: "Variable", desc: "Voyage sacré vers la Mecque, nécessitant une épargne à long terme substantielle." },
  custom: { name: "Événement Personnalisé", defaultMonth: "Variable", desc: "Tout autre événement culturel ou familial marocain (Achoura, vacances d'été)." }
};

export const AD_UNITS = {
  dashboard_banner: "ca-pub-1234567890123456/dash-banner",
  transactions_sidebar: "ca-pub-1234567890123456/trans-sidebar",
  insights_bottom: "ca-pub-1234567890123456/insights-bottom"
};
