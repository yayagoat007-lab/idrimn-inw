import { projectNetWorth } from './long-term-projection';

export interface ComparisonScenario {
  id: string;
  nameFr: string;
  nameDarija: string;
  monthlySavings: number;
  color: string;
}

export interface ComparisonDataPoint {
  year: number;
  age: number;
  [scenarioId: string]: number; // Maps scenarioId to projected net worth
}

/**
 * Compares multiple monthly savings scenarios over a certain number of years.
 * Returns data formatted specifically for multi-line Recharts visualization.
 */
export function compareScenarios(
  currentNetWorth: number,
  baseMonthlySavings: number,
  annualGrowthRate: number,
  years: number,
  currentAge: number,
  customScenarios?: ComparisonScenario[]
): {
  scenarios: ComparisonScenario[];
  chartData: ComparisonDataPoint[];
} {
  // Default scenarios if none are provided
  const activeScenarios: ComparisonScenario[] = customScenarios || [
    {
      id: 'current',
      nameFr: 'Épargne Actuelle',
      nameDarija: 'Iddikhar dyalk',
      monthlySavings: baseMonthlySavings,
      color: '#10b981', // Emerald
    },
    {
      id: 'plus_200',
      nameFr: '+200 DH / mois',
      nameDarija: '+200 DH / chhar',
      monthlySavings: baseMonthlySavings + 200,
      color: '#0ea5e9', // Sky blue
    },
    {
      id: 'plus_500',
      nameFr: '+500 DH / mois',
      nameDarija: '+500 DH / chhar',
      monthlySavings: baseMonthlySavings + 500,
      color: '#6366f1', // Indigo
    },
    {
      id: 'plus_1000',
      nameFr: '+1000 DH / mois',
      nameDarija: '+1000 DH / chhar',
      monthlySavings: baseMonthlySavings + 1000,
      color: '#d946ef', // Fuchsia
    }
  ];

  // Calculate projections for all scenarios
  const projectionsByScenario = activeScenarios.map(sc => {
    return {
      id: sc.id,
      data: projectNetWorth(currentNetWorth, sc.monthlySavings, annualGrowthRate, years)
    };
  });

  // Pivot the projections into a single chronological array of data points
  const chartData: ComparisonDataPoint[] = [];

  // projectionsByScenario[0].data has the years (0, 1, 2... years)
  const totalYears = projectionsByScenario[0].data.length;

  for (let i = 0; i < totalYears; i++) {
    const year = projectionsByScenario[0].data[i].year;
    const dataPoint: ComparisonDataPoint = {
      year,
      age: currentAge + year,
    };

    projectionsByScenario.forEach(proj => {
      dataPoint[proj.id] = proj.data[i].projectedNetWorth;
    });

    chartData.push(dataPoint);
  }

  return {
    scenarios: activeScenarios,
    chartData
  };
}
