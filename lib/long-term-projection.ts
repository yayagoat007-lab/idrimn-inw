import { calculateIRMaroc } from './calculators';

export interface Milestone {
  age: number;
  year: number;
  titleFr: string;
  titleDarija: string;
  descriptionFr: string;
  descriptionDarija: string;
  projectedNetWorth: number;
  achieved: boolean;
}

/**
 * Calculates long-term net worth projection using monthly compounding interest on monthly savings
 * and monthly compound growth on existing capital.
 */
export function projectNetWorth(
  currentNetWorth: number,
  monthlyNetSavings: number,
  annualGrowthRate: number,
  years: number
): { year: number; projectedNetWorth: number; totalContributed: number; totalInterest: number }[] {
  const monthlyRate = annualGrowthRate / 100 / 12;
  const totalMonths = years * 12;
  
  let balance = currentNetWorth;
  let totalContributed = currentNetWorth;
  
  const projections = [
    {
      year: 0,
      projectedNetWorth: Math.round(currentNetWorth),
      totalContributed: Math.round(currentNetWorth),
      totalInterest: 0,
    }
  ];

  for (let m = 1; m <= totalMonths; m++) {
    // Existing capital grows + new savings added at the end of the month
    balance = balance * (1 + monthlyRate) + monthlyNetSavings;
    totalContributed += monthlyNetSavings;

    if (m % 12 === 0) {
      const year = m / 12;
      const totalInterest = Math.max(0, balance - totalContributed);
      
      projections.push({
        year,
        projectedNetWorth: Math.round(balance),
        totalContributed: Math.round(totalContributed),
        totalInterest: Math.round(totalInterest),
      });
    }
  }

  return projections;
}

/**
 * Projects retirement income using CNSS rules and the 4% sustainable withdrawal rule
 */
export function projectRetirementIncome(
  cnssContributionYears: number,
  averageMonthlySalary: number,
  projectedNetWorthAtRetirement: number,
  withdrawalRatePercent: number = 4
): {
  estimatedMonthlyPensionCNSS: number;
  estimatedMonthlyFromSavings: number;
  totalMonthlyRetirementIncome: number;
  pensionRatePercent: number;
} {
  // CNSS Retirement Rules:
  // - Minimum of 3240 contribution days (~15 years of standard contributions) is required to get a pension.
  // - Reference salary is capped at 6,000 DH per month.
  // - At 15 contribution years, base pension is 50% of reference salary.
  // - For every additional year (~216 days) above 15 years, pension rate increases by 1%, capped at 70% max.
  let pensionRatePercent = 0;
  if (cnssContributionYears >= 15) {
    const extraYears = Math.max(0, cnssContributionYears - 15);
    pensionRatePercent = 50 + extraYears;
    if (pensionRatePercent > 70) {
      pensionRatePercent = 70;
    }
  }

  const cappedSalary = Math.min(6000, averageMonthlySalary);
  const estimatedMonthlyPensionCNSS = Math.round(cappedSalary * (pensionRatePercent / 100));

  // Savings income based on the 4% rule (annual withdrawal = 4% of capital, divided by 12)
  const estimatedMonthlyFromSavings = Math.round(
    (projectedNetWorthAtRetirement * (withdrawalRatePercent / 100)) / 12
  );

  const totalMonthlyRetirementIncome = estimatedMonthlyPensionCNSS + estimatedMonthlyFromSavings;

  return {
    estimatedMonthlyPensionCNSS,
    estimatedMonthlyFromSavings,
    totalMonthlyRetirementIncome,
    pensionRatePercent,
  };
}

/**
 * Generates dynamic milestones based on projected net worth targets and age milestones.
 */
export function generateLifeMilestones(
  currentAge: number,
  retirementAge: number,
  projections: { year: number; projectedNetWorth: number }[],
  cnssContributionYears: number,
  averageMonthlySalary: number
): Milestone[] {
  const milestones: Milestone[] = [];
  const yearsInProjection = projections.length - 1;

  // Find the first year a certain net worth threshold is reached
  const findYearForThreshold = (threshold: number): number => {
    const item = projections.find(p => p.projectedNetWorth >= threshold);
    return item ? item.year : -1;
  };

  // 1. Apport Logement (150,000 DH)
  const apportYear = findYearForThreshold(150000);
  milestones.push({
    age: apportYear !== -1 ? currentAge + apportYear : currentAge + 5,
    year: apportYear !== -1 ? apportYear : 5,
    titleFr: "Apport Logement Sécurisé 🏠",
    titleDarija: "Tsbii9 d-Dar Mdmoun 🏠",
    descriptionFr: apportYear !== -1 
      ? `Tu auras accumulé plus de 150 000 DH, ce qui est l'apport moyen idéal pour acquérir un appartement de standing correct au Maroc.` 
      : `Objectif d'apport logement de 150 000 DH. Dans 5 ans, tu auras ${projections[Math.min(5, yearsInProjection)]?.projectedNetWorth.toLocaleString()} DH.`,
    descriptionDarija: apportYear !== -1
      ? `Gha t-koun jm3ti ktar mn 150 000 DH, l-kfiya bach t-dfa3 tsbii9 dyal apartment mzyana f l-Maroc.`
      : `Hada hadaf tsbii9 d-dar d 150 000 DH. Mn hna l 5 snin gha t-koun 3ndk ${projections[Math.min(5, yearsInProjection)]?.projectedNetWorth.toLocaleString()} DH.`,
    projectedNetWorth: apportYear !== -1 ? projections[apportYear].projectedNetWorth : projections[Math.min(5, yearsInProjection)]?.projectedNetWorth || 0,
    achieved: apportYear !== -1,
  });

  // 2. Premier Demi-Million (500,000 DH)
  const halfMillionYear = findYearForThreshold(500000);
  milestones.push({
    age: halfMillionYear !== -1 ? currentAge + halfMillionYear : currentAge + 15,
    year: halfMillionYear !== -1 ? halfMillionYear : 15,
    titleFr: "Cap des 500k DH Franchi 📈",
    titleDarija: "Nass Mlyoun Darham 📈",
    descriptionFr: halfMillionYear !== -1
      ? `Ton patrimoine atteint un demi-million de dirhams ! Les intérêts composés commencent à travailler de manière visible à ce niveau.`
      : `Objectif d'un demi-million de dirhams. Dans 15 ans, ton épargne projetée sera de ${projections[Math.min(15, yearsInProjection)]?.projectedNetWorth.toLocaleString()} DH.`,
    descriptionDarija: halfMillionYear !== -1
      ? `L-patrimoine dyalk wsal l nass mlyoun derham! L-arbaj d-lfayda bdaw i-khdmo b wejh bayen db.`
      : `Hadaf dyal nass mlyoun derham. Mn hna l 15-el 3am gha t-koun jm3ti ${projections[Math.min(15, yearsInProjection)]?.projectedNetWorth.toLocaleString()} DH.`,
    projectedNetWorth: halfMillionYear !== -1 ? projections[halfMillionYear].projectedNetWorth : projections[Math.min(15, yearsInProjection)]?.projectedNetWorth || 0,
    achieved: halfMillionYear !== -1,
  });

  // 3. Statut de Millionnaire Floussi (1,000,000 DH)
  const millionYear = findYearForThreshold(1000000);
  milestones.push({
    age: millionYear !== -1 ? currentAge + millionYear : currentAge + 25,
    year: millionYear !== -1 ? millionYear : 25,
    titleFr: "Le Club des Millionnaires 👑",
    titleDarija: "Nadi l-Mlyonarat 👑",
    descriptionFr: millionYear !== -1
      ? `Félicitations ! Tu es officiellement millionnaire en dirhams. Ton capital produit de la richesse de manière autonome.`
      : `Le cap symbolique du million de dirhams. Dans 25 ans, ton patrimoine projeté sera de ${projections[Math.min(25, yearsInProjection)]?.projectedNetWorth.toLocaleString()} DH.`,
    descriptionDarija: millionYear !== -1
      ? `Mabrouk! Rje3ti mlyonari b l-derham rasmiyan. Ras l-mal dyalk i-ntaj l-flouss bo7do db.`
      : `L-mar7ala d-mlyoun derham. Mn hna l 25-el 3am gha t-koun jm3ti ${projections[Math.min(25, yearsInProjection)]?.projectedNetWorth.toLocaleString()} DH.`,
    projectedNetWorth: millionYear !== -1 ? projections[millionYear].projectedNetWorth : projections[Math.min(25, yearsInProjection)]?.projectedNetWorth || 0,
    achieved: millionYear !== -1,
  });

  // 4. L'âge de la retraite
  const retirementYear = Math.max(0, retirementAge - currentAge);
  const projAtRetirement = projections[Math.min(retirementYear, yearsInProjection)] || projections[yearsInProjection];
  const retirementIncome = projectRetirementIncome(
    cnssContributionYears + retirementYear,
    averageMonthlySalary,
    projAtRetirement?.projectedNetWorth || 0
  );

  milestones.push({
    age: retirementAge,
    year: retirementYear,
    titleFr: "Âge de la Retraite Dorée 🏖️",
    titleDarija: "Retraite d-Dhabya 🏖️",
    descriptionFr: `À ${retirementAge} ans, ton patrimoine estimé est de ${projAtRetirement?.projectedNetWorth.toLocaleString()} DH. Ton revenu mensuel total estimé sera de ${retirementIncome.totalMonthlyRetirementIncome.toLocaleString()} DH/mois (dont ${retirementIncome.estimatedMonthlyPensionCNSS.toLocaleString()} DH de pension CNSS et ${retirementIncome.estimatedMonthlyFromSavings.toLocaleString()} DH issus de tes placements).`,
    descriptionDarija: `F l-3mar d ${retirementAge} snin, flouss l-patrimoine dyalk hiya ${projAtRetirement?.projectedNetWorth.toLocaleString()} DH. L-madkhoul d-chhar gha i-koun ${retirementIncome.totalMonthlyRetirementIncome.toLocaleString()} DH (menha ${retirementIncome.estimatedMonthlyPensionCNSS.toLocaleString()} DH d-retraite CNSS o ${retirementIncome.estimatedMonthlyFromSavings.toLocaleString()} DH dyal sandouq d-iddikhar).`,
    projectedNetWorth: projAtRetirement?.projectedNetWorth || 0,
    achieved: true,
  });

  // Sort milestones chronologically by year/age
  return milestones.sort((a, b) => a.year - b.year);
}
