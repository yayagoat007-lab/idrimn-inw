/**
 * contextual-ads-rules.ts
 * 
 * Contextual ad decision engine for Floussi.
 * Maps active bucket/spending context to Moroccan-specific helpful simulated ad offers.
 * Includes a clean structure "pretConnectableAdData" to hook into Google AdSense or
 * regional ad APIs in the future.
 */

export interface PreConnectableAdData {
  id: string;
  category: string;
  sponsorName: string;
  titleFr: string;
  titleDarija: string;
  descriptionFr: string;
  descriptionDarija: string;
  ctaTextFr: string;
  ctaTextDarija: string;
  trackingId?: string; // Standard Google AdSense / DoubleClick placement slots
  targetUrl: string;
}

export const CONTEXTUAL_ADS: PreConnectableAdData[] = [
  {
    id: 'ad_marjane_groceries',
    category: 'Alimentation',
    sponsorName: 'Marjane',
    titleFr: 'Pensez à comparer avec l\'App Marjane !',
    titleDarija: 'Qaren l-atmane m3a application Marjane !',
    descriptionFr: 'Budget alimentation serré ? Achetez en gros ou profitez des offres exclusives "M-Carte" ce week-end.',
    descriptionDarija: 'Mizaniya d-Makla qasra ? Chri b l-joumla o stafd mn takhfidat l-khas f l-week-end.',
    ctaTextFr: 'Télécharger l\'application',
    ctaTextDarija: 'Inzel l-App',
    targetUrl: 'https://www.marjane.ma'
  },
  {
    id: 'ad_tramway_mobility',
    category: 'Transport',
    sponsorName: 'Casa Tramway',
    titleFr: 'Économisez sur vos trajets quotidiens',
    titleDarija: 'Wfer l-flouss f d-safar l-yaoumi dyalk',
    descriptionFr: 'Le prix du carburant augmente ? Passez à la carte d\'abonnement rechargeable Tramway, c\'est 25% d\'économie.',
    descriptionDarija: 'Mazout ghali ? Khoud l-carte d-tramway dyal l-chhar, kat-wfer 25% dyal l-masrouf.',
    ctaTextFr: 'Voir les abonnements',
    ctaTextDarija: 'Chouf l-Ishtirakat',
    targetUrl: 'https://www.casatramway.ma'
  },
  {
    id: 'ad_amo_axa',
    category: 'Santé',
    sponsorName: 'AXA Assurances Maroc',
    titleFr: 'Complémentaire Santé AMO Intégrale',
    titleDarija: 'T-Ameen s-Sihha d-Kamel m3a AXA',
    descriptionFr: 'Des soins mal remboursés par la CNSS ? AXA complète votre remboursement AMO jusqu\'à 100% sur les grosses hospitalisations.',
    descriptionDarija: 'AMO makat-khalas-ch koulchi ? Assurances AXA kat-kamel l-khlass hta l 100% f l-sbitar.',
    ctaTextFr: 'Simuler mon tarif',
    ctaTextDarija: 'Hseb t-taman',
    targetUrl: 'https://www.axa.ma'
  },
  {
    id: 'ad_cih_youth',
    category: 'Loisirs',
    sponsorName: 'CIH Bank',
    titleFr: 'La Carte Code 18-30 sans frais',
    titleDarija: 'Carte Code CIH bla masarif',
    descriptionFr: 'Sorties et abonnements streaming ? Payez en ligne gratuitement avec la carte Code 30, sans aucuns frais de gestion de compte.',
    descriptionDarija: 'Nashat o streaming ? K خلص f l-internet gratuit m3a Carte Code 30, bla masarif dyal l-banka.',
    ctaTextFr: 'Ouvrir mon compte en ligne',
    ctaTextDarija: 'Fteh hsab en ligne',
    targetUrl: 'https://www.cihbank.ma'
  },
  {
    id: 'ad_wafa_epargne',
    category: 'Investissement',
    sponsorName: 'Wafa Assurance',
    titleFr: 'Wafa Épargne Retraite Active',
    titleDarija: 'Taqawod dyalk mzyan m3a Wafa',
    descriptionFr: 'Assurez vos vieux jours et réduisez vos impôts au Maroc (déduction fiscale jusqu\'à 100% sur l\'impôt sur le revenu).',
    descriptionDarija: 'Wfer l-flouss l l-kber o nqos d-dariba dyal l-fawkara f l-Maghrib.',
    ctaTextFr: 'Découvrir le plan',
    ctaTextDarija: 'Chouf l-Khitta',
    targetUrl: 'https://www.wafaassurance.ma'
  }
];

/**
 * Returns a contextual ad banner based on category or spending alert.
 * Fallbacks to a generic Moroccan helpful sponsor if no match.
 */
export function getContextualAd(activeCategory?: string): PreConnectableAdData {
  if (!activeCategory) {
    // Return a random ad
    const idx = Math.floor(Math.random() * CONTEXTUAL_ADS.length);
    return CONTEXTUAL_ADS[idx];
  }

  const matched = CONTEXTUAL_ADS.find(ad => ad.category.toLowerCase() === activeCategory.toLowerCase());
  return matched || CONTEXTUAL_ADS[0]; // fallback
}

/**
 * Limits daily ad notification or display (1 display per day per user) using localStorage.
 */
export function canShowContextualAdToday(): boolean {
  const todayStr = new Date().toDateString(); // e.g. "Tue Jul 14 2026"
  const lastShownDate = localStorage.getItem('last_contextual_ad_shown');
  
  if (lastShownDate === todayStr) {
    return false;
  }
  return true;
}

/**
 * Marks that a contextual ad was displayed today
 */
export function markContextualAdShown() {
  const todayStr = new Date().toDateString();
  localStorage.setItem('last_contextual_ad_shown', todayStr);
}
