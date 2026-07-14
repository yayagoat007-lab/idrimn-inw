export interface HajjPoste {
  id: string;
  nameFr: string;
  nameDarija: string;
  min: number;
  max: number;
}

export type ProximityLevel = 'near' | 'mid' | 'far';
export type HajjSeason = 'ramadan' | 'hajj' | 'low';

export function getHajjBudgetEstimate(
  proximityLevel: ProximityLevel,
  season: HajjSeason
) {
  // Base values in MAD/DH
  let visaMin = 3000;
  let visaMax = 3500;

  // Avion (8000-15000 according to season)
  let avionMin = 8000;
  let avionMax = 10000;
  if (season === 'ramadan') {
    avionMin = 10000;
    avionMax = 13000;
  } else if (season === 'hajj') {
    avionMin = 12000;
    avionMax = 15000;
  }

  // Hôtel Makkah (5000-15000 according to proximity to Kaaba)
  let makkahMin = 5000;
  let makkahMax = 7000;
  if (proximityLevel === 'mid') {
    makkahMin = 7500;
    makkahMax = 11000;
  } else if (proximityLevel === 'near') {
    makkahMin = 11500;
    makkahMax = 15000;
  }

  // Hôtel Médine (3000-8000)
  let medineMin = 3000;
  let medineMax = 5000;
  if (proximityLevel === 'mid') {
    medineMin = 5000;
    medineMax = 6500;
  } else if (proximityLevel === 'near') {
    medineMin = 6500;
    medineMax = 8000;
  }

  // Adahi/Sacrifice (2500-4000)
  let adahiMin = 2500;
  let adahiMax = 4000;

  // Nourriture (~2000)
  let nourritureMin = 1800;
  let nourritureMax = 2500;

  // Transport local (~1000)
  let transLocalMin = 800;
  let transLocalMax = 1200;

  // Shopping (2000-5000)
  let shoppingMin = 2000;
  let shoppingMax = 5000;

  const postes: HajjPoste[] = [
    { id: 'visa', nameFr: 'Visa & Frais de Dossier', nameDarija: 'Wiraqa d-Visa', min: visaMin, max: visaMax },
    { id: 'avion', nameFr: 'Transport Aérien (Vol)', nameDarija: 'Tayara', min: avionMin, max: avionMax },
    { id: 'makkah', nameFr: 'Hôtel Makkah (près de Kaaba)', nameDarija: 'Outil f Mekka', min: makkahMin, max: makkahMax },
    { id: 'medine', nameFr: 'Hôtel Médine', nameDarija: 'Outil f Medina', min: medineMin, max: medineMax },
    { id: 'adahi', nameFr: 'Sacrifice (Adahi)', nameDarija: 'Hady / Dbiha', min: adahiMin, max: adahiMax },
    { id: 'nourriture', nameFr: 'Nourriture & Repas', nameDarija: 'Makla', min: nourritureMin, max: nourritureMax },
    { id: 'local_trans', nameFr: 'Transports Locaux (Bus/TGV)', nameDarija: 'Khidmat Tonobilat', min: transLocalMin, max: transLocalMax },
    { id: 'shopping', nameFr: 'Cadeaux & Zamzam', nameDarija: 'Hdaya o Shopping', min: shoppingMin, max: shoppingMax },
  ];

  const minTotal = postes.reduce((sum, p) => sum + p.min, 0);
  const maxTotal = postes.reduce((sum, p) => sum + p.max, 0);

  return {
    postes,
    total: {
      min: minTotal,
      max: maxTotal
    }
  };
}
