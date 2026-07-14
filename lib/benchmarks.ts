export interface BenchmarkItem {
  category: string;
  averagePercent: number;
}

export const REGIONAL_BENCHMARKS = {
  "casablanca-settat": {
    name: "Grand Casablanca - Settat",
    avgIncome: 8500,
    housingPercent: 32,
    foodPercent: 35,
    transportPercent: 12
  },
  "rabat-sale-kenitra": {
    name: "Rabat - Salé - Kénitra",
    avgIncome: 8200,
    housingPercent: 34,
    foodPercent: 33,
    transportPercent: 10
  }
};

export const MOROCCAN_BENCHMARKS_BY_INCOME = {
  low: [
    { category: "alimentation", averagePercent: 42 },
    { category: "logement", averagePercent: 28 },
    { category: "transport", averagePercent: 8 },
    { category: "telecom", averagePercent: 5 },
    { category: "sante", averagePercent: 7 },
    { category: "autres", averagePercent: 10 }
  ],
  medium: [
    { category: "alimentation", averagePercent: 34 },
    { category: "logement", averagePercent: 30 },
    { category: "transport", averagePercent: 12 },
    { category: "telecom", averagePercent: 6 },
    { category: "sante", averagePercent: 8 },
    { category: "autres", averagePercent: 10 }
  ],
  high: [
    { category: "alimentation", averagePercent: 25 },
    { category: "logement", averagePercent: 35 },
    { category: "transport", averagePercent: 18 },
    { category: "telecom", averagePercent: 5 },
    { category: "sante", averagePercent: 7 },
    { category: "autres", averagePercent: 10 }
  ]
};

export function getBenchmarkBySalary(monthlySalary: number): BenchmarkItem[] {
  if (monthlySalary < 5000) {
    return MOROCCAN_BENCHMARKS_BY_INCOME.low;
  } else if (monthlySalary < 15000) {
    return MOROCCAN_BENCHMARKS_BY_INCOME.medium;
  } else {
    return MOROCCAN_BENCHMARKS_BY_INCOME.high;
  }
}

// Keep previous types and helpers too
export interface MoroccanBenchmarkData {
  city: string;
  incomeBracket: string;
  familySize: 'single' | 'couple' | 'family-small' | 'family-large';
  categories: {
    alimentation: number;
    logement: number;
    transport: number;
    education: number;
    sante: number;
    loisirs: number;
    autres: number;
  };
}

export const MOROCCAN_BENCHMARKS: MoroccanBenchmarkData[] = [
  {
    city: "Casablanca",
    incomeBracket: "5000-12000 DH",
    familySize: "family-small",
    categories: { alimentation: 3500, logement: 3500, transport: 1200, education: 800, sante: 600, loisirs: 500, autres: 1000 }
  }
];

export function getBenchmark(city: string, incomeBracket: string, familySize: string): MoroccanBenchmarkData {
  return MOROCCAN_BENCHMARKS[0];
}

// --- NEW ENRICHED BENCHMARKS DIMENSION (CITY x INCOME RANGE x CATEGORY) ---

export type MoroccanCity = "Casablanca" | "Rabat" | "Marrakech" | "Fès" | "Tanger" | "Agadir";
export type IncomeRange = "< 5000 DH" | "5000-10000 DH" | "10000-20000 DH" | "> 20000 DH";

// High-fidelity statistical base percentage of total spend per city and bracket
const CITY_COST_MODIFIERS: Record<MoroccanCity, number> = {
  "Casablanca": 1.10, // 10% more expensive than national baseline
  "Rabat": 1.05,
  "Marrakech": 0.98,
  "Fès": 0.88,
  "Tanger": 1.02,
  "Agadir": 0.92
};

const INCOME_MEDIANS: Record<IncomeRange, number> = {
  "< 5000 DH": 3500,
  "5000-10000 DH": 7500,
  "10000-20000 DH": 14000,
  "> 20000 DH": 28000
};

// National baseline expenditure percentage allocations
const NATIONAL_CATEGORY_BASE_PERCENT: Record<string, number> = {
  alimentation: 36,
  food: 36,
  logement: 28,
  housing: 28,
  transport: 12,
  telecom: 6,
  sante: 7,
  health: 7,
  loisirs: 6,
  education: 5,
  autres: 5
};

/**
 * Returns the official simulated benchmark average amount and percentage
 * based on City, Income Bracket, and Category.
 */
export function getEnrichedBenchmark(
  city: MoroccanCity,
  incomeRange: IncomeRange,
  category: string
): { averageAmount: number; averagePercent: number } {
  // Normalize category name
  let cat = category.toLowerCase().trim();
  if (cat === 'food') cat = 'alimentation';
  if (cat === 'housing') cat = 'logement';
  if (cat === 'health') cat = 'sante';

  const basePercent = NATIONAL_CATEGORY_BASE_PERCENT[cat] || 6;
  const cityModifier = CITY_COST_MODIFIERS[city] || 1.0;
  const incomeMedian = INCOME_MEDIANS[incomeRange] || 8000;

  // Let's fine-tune the percentage allocations based on income bracket
  // (Engel's Law: higher income bracket spends less percentage on food, more on transport/leisure)
  let bracketPercentAdjustment = basePercent;
  if (incomeRange === "< 5000 DH") {
    if (cat === 'alimentation') bracketPercentAdjustment = 42;
    if (cat === 'logement') bracketPercentAdjustment = 30;
    if (cat === 'loisirs') bracketPercentAdjustment = 3;
  } else if (incomeRange === "5000-10000 DH") {
    if (cat === 'alimentation') bracketPercentAdjustment = 35;
    if (cat === 'logement') bracketPercentAdjustment = 30;
    if (cat === 'loisirs') bracketPercentAdjustment = 5;
  } else if (incomeRange === "10000-20000 DH") {
    if (cat === 'alimentation') bracketPercentAdjustment = 28;
    if (cat === 'logement') bracketPercentAdjustment = 28;
    if (cat === 'transport') bracketPercentAdjustment = 14;
    if (cat === 'loisirs') bracketPercentAdjustment = 8;
  } else if (incomeRange === "> 20000 DH") {
    if (cat === 'alimentation') bracketPercentAdjustment = 20;
    if (cat === 'logement') bracketPercentAdjustment = 32;
    if (cat === 'transport') bracketPercentAdjustment = 18;
    if (cat === 'loisirs') bracketPercentAdjustment = 12;
  }

  // Adjust for city cost index
  let adjustedPercent = bracketPercentAdjustment;
  if (cat === 'logement' || cat === 'loisirs') {
    adjustedPercent = bracketPercentAdjustment * cityModifier;
  } else if (cat === 'alimentation') {
    adjustedPercent = bracketPercentAdjustment * (1 + (cityModifier - 1) * 0.5); // Food differs less than housing across cities
  }

  // Keep percentage capped to logical amounts
  adjustedPercent = parseFloat(Math.max(1, Math.min(60, adjustedPercent)).toFixed(1));
  const averageAmount = Math.round((incomeMedian * adjustedPercent) / 100);

  return {
    averageAmount,
    averagePercent: adjustedPercent
  };
}

export function getFinHealthScoreDescription(score: number): { status: string; advice: string } {
  if (score >= 80) {
    return {
      status: "Excellent (Sain)",
      advice: "Vos finances sont très solides. Vos sandoqs d'épargne sont approvisionnés régulièrement et vous lissez parfaitement vos pics saisonniers de dépenses (Aïd, rentrée)."
    };
  }
  if (score >= 60) {
    return {
      status: "Correct / Sain",
      advice: "Vos finances sont saines mais restent sensibles aux gros imprévus. Continuez à garnir vos sandoqs d'épargne Dakira."
    };
  }
  if (score >= 40) {
    return {
      status: "Moyen (À surveiller)",
      advice: "Des ajustements sont requis. Vos enveloppes de dépenses de loisirs empiètent parfois sur votre épargne de sécurité."
    };
  }
  return {
    status: "Critique (Ajuster d'urgence)",
    advice: "Vos charges fixes ou vos dépenses discrétionnaires dépassent votre budget mensuel. Il est crucial de revoir l'allocation de vos enveloppes."
  };
}
