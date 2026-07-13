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

