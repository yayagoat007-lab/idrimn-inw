export interface AidProgram {
  id: string;
  nameFr: string;
  nameDarija: string;
  type: 'monthly' | 'one_time';
  descriptionFr: string;
  descriptionDarija: string;
}

export interface ChildDetail {
  id: string;
  age: number;
  inSchool: boolean;
}

export interface EligibleResult {
  id: string;
  nameFr: string;
  nameDarija: string;
  amount: number;
  type: 'monthly' | 'one_time';
  descriptionFr: string;
  descriptionDarija: string;
}

export const AID_PROGRAMS: AidProgram[] = [
  {
    id: 'asd_family',
    nameFr: 'Aide Sociale Directe (ASD) - Allocations Mensuelles',
    nameDarija: 'Da3m L-Ijtima3i L-Moubachir (Chahriya)',
    type: 'monthly',
    descriptionFr: 'Aide mensuelle directe pour les ménages avec enfants ou en situation de vulnérabilité, avec un minimum de 500 DH/mois.',
    descriptionDarija: 'Da3m d-Chhar l l-3ailat mzyana b l-aqal 500 DH f l-chhar.'
  },
  {
    id: 'asd_birth',
    nameFr: 'Aide Directe - Prime de Naissance',
    nameDarija: 'Da3m l-Wilada (Prime)',
    type: 'one_time',
    descriptionFr: 'Prime unique de naissance octroyée aux ménages éligibles : 2000 DH pour le premier enfant, 1000 DH pour le deuxième.',
    descriptionDarija: 'Flouss l-Khlas dyal l-3aila (2000 DH l l-ewwel, 1000 DH l t-tani).'
  },
  {
    id: 'housing_aid',
    nameFr: 'Aide Directe au Logement (Daam Sakane)',
    nameDarija: 'Da3m L-Sakan (Logement)',
    type: 'one_time',
    descriptionFr: 'Aide de l\'État pour acquérir un logement principal : 100 000 DH (valeur < 300 000 DH) ou 70 000 DH (valeur 300 000 à 700 000 DH).',
    descriptionDarija: 'Da3m dyal l-mou3awna l kraya or chra d-Dar d-Sakan.'
  },
  {
    id: 'tayssir',
    nameFr: 'Programme d\'Appui Scolaire (Tayssir)',
    nameDarija: 'Da3m Tayssir (Scolarité)',
    type: 'monthly',
    descriptionFr: 'Bourse mensuelle par enfant scolarisé : 60 DH (primaire), 80 DH (collège), 140 DH (lycée).',
    descriptionDarija: 'Msa3ada dyal l-madrassa l l-drari s-sghar.'
  }
];

export function simulateEligibleAids(
  rsuScore: number, // RSU Registry score, e.g. 9.15 to 10.5. (Threshold for ASD is usually <= 9.74)
  hasFirstChildBirth: boolean,
  hasSecondChildBirth: boolean,
  children: ChildDetail[],
  buyingHouseValue?: number
) {
  const eligiblePrograms: EligibleResult[] = [];
  let totalAidsMonthly = 0;
  let totalAidsOneTime = 0;

  const isAsdEligible = rsuScore <= 9.743; // Standard threshold for direct social aid in Morocco

  // 1. ASD Family Allocations
  if (isAsdEligible && children.length > 0) {
    let asdAmount = 0;
    
    children.forEach((child, idx) => {
      if (child.age < 21) {
        if (idx < 3) {
          // 300 DH per child (increased for 2026/2027)
          asdAmount += 300;
        } else {
          // 150 DH per child starting from 4th
          asdAmount += 150;
        }
      }
    });

    // Minimum guaranteed amount for ASD is 500 DH/month
    const finalAsdAmount = Math.max(500, asdAmount);

    eligiblePrograms.push({
      id: 'asd_family',
      nameFr: 'Aide Sociale Directe - Allocations Enfants',
      nameDarija: 'Da3m L-Ijtima3i L-Moubachir',
      amount: finalAsdAmount,
      type: 'monthly',
      descriptionFr: `Éligible grâce à votre score RSU (${rsuScore}). Allocation calculée pour ${children.length} enfant(s). Garanti à 500 DH minimum.`,
      descriptionDarija: `Da3m chahri maqboula m3a l-indice dyal l-RSU (${rsuScore}).`
    });
    totalAidsMonthly += finalAsdAmount;
  }

  // 2. Birth Grants
  if (isAsdEligible) {
    if (hasFirstChildBirth) {
      eligiblePrograms.push({
        id: 'asd_birth_1',
        nameFr: 'Prime de Naissance - Premier Enfant',
        nameDarija: 'Da3m l-Wilada (1er Enfant)',
        amount: 2000,
        type: 'one_time',
        descriptionFr: 'Versement de l\'État de 2000 DH à la naissance du premier enfant.',
        descriptionDarija: 'Flouss l-wilada dyal l-weld l-ewwel (2000 DH).'
      });
      totalAidsOneTime += 2000;
    }
    if (hasSecondChildBirth) {
      eligiblePrograms.push({
        id: 'asd_birth_2',
        nameFr: 'Prime de Naissance - Deuxième Enfant',
        nameDarija: 'Da3m l-Wilada (2e Enfant)',
        amount: 1000,
        type: 'one_time',
        descriptionFr: 'Versement de l\'État de 1000 DH à la naissance du deuxième enfant.',
        descriptionDarija: 'Flouss l-wilada dyal l-weld t-tani (1000 DH).'
      });
      totalAidsOneTime += 1000;
    }
  }

  // 3. Housing Aid (Daam Sakane)
  if (buyingHouseValue && buyingHouseValue > 0) {
    if (buyingHouseValue <= 300000) {
      eligiblePrograms.push({
        id: 'housing_aid_luxe',
        nameFr: 'Aide Directe au Logement - Tranche sociale',
        nameDarija: 'Da3m Sakane (Kteb mn 30M)',
        amount: 100000,
        type: 'one_time',
        descriptionFr: 'Subvention directe de l\'État de 100 000 DH pour un logement principal dont le prix est inférieur à 300 000 DH.',
        descriptionDarija: 'Moussa3ada dyal 10 mlyon l chra d-Sakan l-khass.'
      });
      totalAidsOneTime += 100000;
    } else if (buyingHouseValue <= 700000) {
      eligiblePrograms.push({
        id: 'housing_aid_mid',
        nameFr: 'Aide Directe au Logement - Tranche intermédiaire',
        nameDarija: 'Da3m Sakane (Bin 30M o 70M)',
        amount: 70000,
        type: 'one_time',
        descriptionFr: 'Subvention directe de l\'État de 70 000 DH pour un logement principal dont le prix est compris entre 300 000 DH et 700 000 DH.',
        descriptionDarija: 'Moussa3ada dyal 7 mlyon l chra d-Sakan.'
      });
      totalAidsOneTime += 70000;
    }
  }

  // 4. Tayssir Education Program (If not receiving ASD, or runs concurrently for some specific regions)
  // Usually, Tayssir is integrated under the new ASD, but let's simulate as a separate supportive scholarship
  if (children.length > 0) {
    let tayssirAmount = 0;
    children.forEach(child => {
      if (child.inSchool && child.age >= 6 && child.age <= 18) {
        if (child.age <= 11) {
          tayssirAmount += 60; // Primary school
        } else if (child.age <= 15) {
          tayssirAmount += 80; // Middle school
        } else {
          tayssirAmount += 140; // High school
        }
      }
    });

    if (tayssirAmount > 0) {
      eligiblePrograms.push({
        id: 'tayssir_allowance',
        nameFr: 'Aide de Scolarité (Tayssir)',
        nameDarija: 'Da3m Tayssir l l-Madrassa',
        amount: tayssirAmount,
        type: 'monthly',
        descriptionFr: `Versement mensuel d'un total de ${tayssirAmount} DH calculé pour vos enfants en cours de scolarité obligatoire.`,
        descriptionDarija: `Da3m dyal drari li f l-madrassa (Tayssir).`
      });
      totalAidsMonthly += tayssirAmount;
    }
  }

  return {
    eligiblePrograms,
    totalAidsMonthly,
    totalAidsOneTime
  };
}
