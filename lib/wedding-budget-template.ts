export interface WeddingPoste {
  id: string;
  nameFr: string;
  nameDarija: string;
  percentage: number; // typical percentage of total budget
  descriptionFr: string;
  descriptionDarija: string;
}

export type WeddingRegion = 'casa_rabat' | 'kech_fes' | 'provinces';

export interface WeddingRegionBudget {
  min: number;
  max: number;
  labelFr: string;
  labelDarija: string;
}

export const WEDDING_REGIONS: Record<WeddingRegion, WeddingRegionBudget> = {
  casa_rabat: {
    min: 80000,
    max: 150000,
    labelFr: 'Axe Casablanca - Rabat',
    labelDarija: 'Dar L-Beida / Rabat'
  },
  kech_fes: {
    min: 60000,
    max: 100000,
    labelFr: 'Marrakech - Fès (Villes Impériales)',
    labelDarija: 'Marrakech / Fes'
  },
  provinces: {
    min: 40000,
    max: 70000,
    labelFr: 'Provinces & Zones Rurales',
    labelDarija: 'Nawahi o Moudoun sghira'
  }
};

export const WEDDING_POSTES: WeddingPoste[] = [
  { 
    id: 'salle', 
    nameFr: 'Salle de Fête / Ryad', 
    nameDarija: 'Kraya d-Salle / Ryad', 
    percentage: 0.20,
    descriptionFr: 'Location de la salle, villas ou riads traditionnels',
    descriptionDarija: 'Kraya dyal kassar or l-villa f lilat l-farh'
  },
  { 
    id: 'traiteur', 
    nameFr: 'Traiteur & Pièce Montée', 
    nameDarija: 'Traiteur (Mone3ed l-Makla)', 
    percentage: 0.35,
    descriptionFr: 'Dîner traditionnel (Pastilla, Méchoui, Fruits, Thé et Gâteaux)',
    descriptionDarija: 'Makla dyal l-ferh (Bastila, L-hem, o kask d-Atay)'
  },
  { 
    id: 'orchestre', 
    nameFr: 'Orchestre / Chaâbi / Dakka', 
    nameDarija: 'Ghayat o Orchestre / Dakka', 
    percentage: 0.12,
    descriptionFr: 'Animation musicale live, Dakka Marrakchia ou Issawa',
    descriptionDarija: 'Nachat d-Moussiqa (Chaabi, Dakka Marrakchia or Issawa)'
  },
  { 
    id: 'neggafa', 
    nameFr: 'Neggafa, Amariya & Tenues', 
    nameDarija: 'Neggafa o Lbassi (Tkaffet)', 
    percentage: 0.10,
    descriptionFr: 'Prestation Neggafa, location Amariya, caftans et takchitas',
    descriptionDarija: 'Kraya d-Lmerba3, l-Amariya o Neggafa b lbassi'
  },
  { 
    id: 'photographe', 
    nameFr: 'Photographe & Caméraman', 
    nameDarija: 'Swayri o l-Video', 
    percentage: 0.06,
    descriptionFr: 'Reportage photo complet et montage vidéo HD/4K',
    descriptionDarija: 'Tsawer d-Lila d-Farh o l-Mounitir'
  },
  { 
    id: 'cadeaux', 
    nameFr: 'Cadeaux / Dfoua (Dotation)', 
    nameDarija: 'Dfou3 o Hdaya d-Laaroussa', 
    percentage: 0.08,
    descriptionFr: 'Tissus, parfums, dattes fourrées, lait et henné de bienvenue',
    descriptionDarija: 'Hdaya dyal l-khotba o l-farh (Dfou3 d-L3rossa)'
  },
  { 
    id: 'decoration', 
    nameFr: 'Décoration & Fleurs', 
    nameDarija: 'Zwaq d-Lwerd o Do', 
    percentage: 0.05,
    descriptionFr: 'Trônes des mariés, arrangements floraux et éclairages',
    descriptionDarija: 'Zwaq d-Korssi dyal l-3ors o l-Melyan d-Do'
  },
  { 
    id: 'transport', 
    nameFr: 'Transport des Invités & Cortège', 
    nameDarija: 'Khidmat r-Rkoub l d-Dyaf', 
    percentage: 0.04,
    descriptionFr: 'Navettes pour la famille et location du cortège d\'honneur',
    descriptionDarija: 'Tonobilat l l-3aila o l-cortège d-Laarssa'
  },
];

export function getWeddingBudgetEstimate(
  region: WeddingRegion,
  customTotalBudget?: number
) {
  const regionBudget = WEDDING_REGIONS[region];
  const totalBudget = customTotalBudget || Math.round((regionBudget.min + regionBudget.max) / 2);

  const breakdown = WEDDING_POSTES.map(p => {
    const allocated = Math.round(totalBudget * p.percentage);
    return {
      ...p,
      allocated
    };
  });

  return {
    regionLabelFr: regionBudget.labelFr,
    regionLabelDarija: regionBudget.labelDarija,
    totalBudget,
    breakdown
  };
}
