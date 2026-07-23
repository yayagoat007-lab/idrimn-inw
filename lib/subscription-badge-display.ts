export interface SubscriptionBadgeVisual {
  id: string;
  nameFr: string;
  nameDarija: string;
  descFr: string;
  descDarija: string;
  emoji: string;
  colorClass: string; // Tailwind text & accent classes
  bgClass: string;    // Tailwind background container classes
  borderClass: string; // Tailwind border classes
  gradientClass: string; // Tailwind gradient classes for detailed view
}

export const SUBSCRIPTION_BADGES_VISUAL: Record<string, SubscriptionBadgeVisual> = {
  free: {
    id: 'free',
    nameFr: 'Membre Gratuit',
    nameDarija: 'Plan Siyahi 🇲🇦',
    descFr: 'Plan de base individuel',
    descDarija: 'Hssab fabor dyal l-bda',
    emoji: '🌱',
    colorClass: 'text-slate-500 bg-slate-100/80',
    bgClass: 'bg-slate-50',
    borderClass: 'border-slate-200/60',
    gradientClass: 'from-slate-50 to-slate-100/60'
  },
  premium: {
    id: 'premium',
    nameFr: 'Membre Premium',
    nameDarija: 'Plan Dahabi ⭐',
    descFr: 'Abonnement Premium complet',
    descDarija: 'Ishtirak Dahabi kamel',
    emoji: '⭐',
    colorClass: 'text-amber-700 bg-amber-100/80',
    bgClass: 'bg-amber-50/60',
    borderClass: 'border-amber-200/70',
    gradientClass: 'from-amber-50 to-amber-100/40'
  },
  family: {
    id: 'family',
    nameFr: 'Floussi Famille',
    nameDarija: 'Floussi Aila 👨‍👩‍👧‍👦',
    descFr: 'Abonnement Famille & Foyer',
    descDarija: 'Ishtirak d l-Aila d l-foyer',
    emoji: '👨‍👩‍👧‍👦',
    colorClass: 'text-indigo-700 bg-indigo-100/80',
    bgClass: 'bg-indigo-50/60',
    borderClass: 'border-indigo-200/70',
    gradientClass: 'from-indigo-50 to-indigo-100/40'
  },
  analyse: {
    id: 'analyse',
    nameFr: 'Analyste Floussi',
    nameDarija: 'Moul l-Hssab 📊',
    descFr: 'Intelligence IA & Prévisions',
    descDarija: 'Nasayih d l-IA d l-masrouf',
    emoji: '📊',
    colorClass: 'text-emerald-700 bg-emerald-100/80',
    bgClass: 'bg-emerald-50/60',
    borderClass: 'border-emerald-200/70',
    gradientClass: 'from-emerald-50 to-emerald-100/40'
  },
  elite: {
    id: 'elite',
    nameFr: 'Club VIP Elite',
    nameDarija: 'Club VIP Elite ✨',
    descFr: 'Accompagnement d\'excellence',
    descDarija: 'Taj rray o l-mourafqa VIP',
    emoji: '✨',
    colorClass: 'text-rose-700 bg-rose-100/80',
    bgClass: 'bg-rose-50/60',
    borderClass: 'border-rose-200/70',
    gradientClass: 'from-rose-50 to-rose-100/40'
  }
};

export function getSubscriptionBadgeVisual(tier: string = 'free'): SubscriptionBadgeVisual {
  const normalized = tier === 'famille' || tier === 'family' ? 'family' : tier;
  return SUBSCRIPTION_BADGES_VISUAL[normalized] || SUBSCRIPTION_BADGES_VISUAL.free;
}
