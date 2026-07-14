import { Transaction, Goal } from '../types';
import { estimateHijriEventInGregorian } from './hijri';

export interface ForecastSpendingPoint {
  month: string; // e.g., "2026-08"
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
  isSeasonalPeak: boolean;
  peakReason?: string;
}

export interface ForecastSavingsPoint {
  targetDate: string;
  projectedAmount: number;
}

export interface GoalScenario {
  monthlyContribution: number;
  monthsRemaining: number;
  estimatedDate: string;
}

export interface GoalCompletionForecast {
  estimatedDate: string;
  monthsRemaining: number;
  scenarioFaster: GoalScenario;
  scenarioSlower: GoalScenario;
}

/**
 * Perform a simple linear regression (y = mx + c)
 */
function linearRegression(data: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }
  
  const denominator = (n * sumXX - sumX * sumX);
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

/**
 * Checks if a given month (YYYY-MM) contains Ramadan or Aid
 */
function getSeasonalMultiplier(monthStr: string): { multiplier: number; reason: string | null } {
  const [year, month] = monthStr.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  // Check Ramadan and Aid for this year
  const ramadan = estimateHijriEventInGregorian('ramadan', year);
  const aidAlFitr = estimateHijriEventInGregorian('aid_al_fitr', year);
  const aidAlAdha = estimateHijriEventInGregorian('aid_al_adha', year);

  const ramadanStart = new Date(ramadan.start);
  const ramadanEnd = new Date(ramadan.end);
  const fitrStart = new Date(aidAlFitr.start);
  const fitrEnd = new Date(aidAlFitr.end);
  const adhaStart = new Date(aidAlAdha.start);
  const adhaEnd = new Date(aidAlAdha.end);

  const overlap = (startA: Date, endA: Date, startB: Date, endB: Date) => {
    return startA <= endB && endA >= startB;
  };

  if (overlap(monthStart, monthEnd, ramadanStart, ramadanEnd)) {
    return { multiplier: 1.25, reason: "Ramadan (Ftour & Alimentation)" };
  }
  if (overlap(monthStart, monthEnd, fitrStart, fitrEnd)) {
    return { multiplier: 1.15, reason: "Aïd al-Fitr (Fêtes)" };
  }
  if (overlap(monthStart, monthEnd, adhaStart, adhaEnd)) {
    return { multiplier: 1.35, reason: "Aïd al-Adha (Mouton & Transport)" };
  }

  return { multiplier: 1.0, reason: null };
}

/**
 * Forecast monthly spending based on 6-12 months of historical transaction data
 */
export function forecastSpending(
  transactions: Transaction[],
  monthsAhead: 1 | 3 | 6 | 12
): ForecastSpendingPoint[] {
  // 1. Group past expenses by month
  const monthlyExpenses: Record<string, { total: number; food: number; transport: number }> = {};
  
  const expenses = transactions.filter(t => t.type === 'expense');
  
  expenses.forEach(t => {
    const date = new Date(t.transaction_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyExpenses[monthKey]) {
      monthlyExpenses[monthKey] = { total: 0, food: 0, transport: 0 };
    }
    
    monthlyExpenses[monthKey].total += t.amount;
    if (t.category === 'alimentation') {
      monthlyExpenses[monthKey].food += t.amount;
    } else if (t.category === 'transport') {
      monthlyExpenses[monthKey].transport += t.amount;
    }
  });

  const sortedMonths = Object.keys(monthlyExpenses).sort();
  const historyCount = sortedMonths.length;
  
  // Default values if no history exists
  let slope = 0;
  let intercept = 3000; // baseline
  let stdDev = 500;

  if (historyCount >= 2) {
    const regressionData = sortedMonths.map((month, idx) => ({
      x: idx,
      y: monthlyExpenses[month].total
    }));
    
    const reg = linearRegression(regressionData);
    slope = reg.slope;
    intercept = reg.intercept;

    // Calculate historical Standard Deviation of the total expenses
    const average = regressionData.reduce((sum, d) => sum + d.y, 0) / historyCount;
    const squaredDiffs = regressionData.map(d => Math.pow(d.y - average, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / historyCount;
    stdDev = Math.sqrt(variance) || 500;
  } else if (historyCount === 1) {
    intercept = monthlyExpenses[sortedMonths[0]].total;
  }

  // 2. Project future months
  const forecasts: ForecastSpendingPoint[] = [];
  const latestDate = historyCount > 0 ? new Date(sortedMonths[historyCount - 1] + "-15") : new Date();

  for (let i = 1; i <= monthsAhead; i++) {
    const futureDate = new Date(latestDate.getFullYear(), latestDate.getMonth() + i, 15);
    const monthKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
    
    const xIndex = historyCount + i - 1;
    let basePrediction = Math.max(0, slope * xIndex + intercept);
    
    // Apply seasonal Ramadan/Aid adjustments from Hijri dates
    const seasonal = getSeasonalMultiplier(monthKey);
    if (seasonal.multiplier > 1) {
      basePrediction *= seasonal.multiplier;
    }

    // Confidence intervals
    // Expanding confidence intervals the further we look ahead
    const predictionInterval = stdDev * (1 + 0.1 * i);
    const confidenceLow = Math.max(0, Math.round(basePrediction - predictionInterval));
    const confidenceHigh = Math.round(basePrediction + predictionInterval);

    forecasts.push({
      month: monthKey,
      predicted: Math.round(basePrediction),
      confidenceLow,
      confidenceHigh,
      isSeasonalPeak: seasonal.multiplier > 1,
      peakReason: seasonal.reason || undefined
    });
  }

  return forecasts;
}

/**
 * Forecast savings accumulation
 */
export function forecastSavings(
  currentSavings: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  monthsAhead: number
): ForecastSavingsPoint[] {
  const points: ForecastSavingsPoint[] = [];
  const now = new Date();
  
  let total = currentSavings;
  const netMonthly = Math.max(-5000, monthlyIncome - monthlyExpenses);

  for (let i = 1; i <= monthsAhead; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const dateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
    total += netMonthly;
    
    points.push({
      targetDate: dateStr,
      projectedAmount: Math.max(0, Math.round(total))
    });
  }

  return points;
}

/**
 * Forecast when a savings goal will be completed based on the current contribution rate
 */
export function forecastGoalCompletion(
  goal: Goal,
  currentContributionRate: number // DH per month
): GoalCompletionForecast {
  const amountNeeded = Math.max(0, goal.target_amount - goal.current_amount);
  
  // Guard against division by zero
  const activeRate = currentContributionRate > 0 ? currentContributionRate : 100;
  const monthsRemaining = amountNeeded / activeRate;

  const formatDate = (months: number) => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + Math.ceil(months));
    return targetDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const estimatedDate = formatDate(monthsRemaining);

  // Scenarios:
  // Faster: add 300 DH/month or 20% more, whichever is higher
  const extraDH = Math.max(300, Math.round(activeRate * 0.2));
  const fasterRate = activeRate + extraDH;
  const monthsRemainingFaster = amountNeeded / fasterRate;
  const scenarioFaster: GoalScenario = {
    monthlyContribution: fasterRate,
    monthsRemaining: Math.ceil(monthsRemainingFaster),
    estimatedDate: formatDate(monthsRemainingFaster)
  };

  // Slower: delay contribution by 1 month, or simulate a 20% drop in contributions
  const slowerRate = Math.max(50, Math.round(activeRate * 0.8));
  const monthsRemainingSlower = amountNeeded / slowerRate;
  const scenarioSlower: GoalScenario = {
    monthlyContribution: slowerRate,
    monthsRemaining: Math.ceil(monthsRemainingSlower),
    estimatedDate: formatDate(monthsRemainingSlower)
  };

  return {
    estimatedDate,
    monthsRemaining: Math.ceil(monthsRemaining),
    scenarioFaster,
    scenarioSlower
  };
}
