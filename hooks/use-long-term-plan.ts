import { useState, useEffect, useMemo } from 'react';
import { useNetWorth } from './use-net-worth';
import { useTransactions } from './use-transactions';
import { projectNetWorth, projectRetirementIncome, generateLifeMilestones, Milestone } from '../lib/long-term-projection';
import { compareScenarios, ComparisonScenario, ComparisonDataPoint } from '../lib/scenario-comparison';

export interface Assumptions {
  currentAge: number;
  retirementAge: number;
  cnssContributionYears: number;
  averageMonthlySalary: number;
  monthlyNetSavings: number;
  growthScenario: 'prudent' | 'balanced' | 'dynamic';
}

const DEFAULT_ASSUMPTIONS: Assumptions = {
  currentAge: 30,
  retirementAge: 60,
  cnssContributionYears: 8,
  averageMonthlySalary: 9500,
  monthlyNetSavings: 2000,
  growthScenario: 'balanced'
};

export function useLongTermPlan(userId: string = "mock-user-id-9999") {
  const { netWorth, loading: netWorthLoading } = useNetWorth(userId);
  const { transactions, loading: transactionsLoading } = useTransactions(userId);

  const [assumptions, setAssumptions] = useState<Assumptions | null>(null);

  // Auto-estimate base salary and savings based on transactions if not already set in localStorage
  useEffect(() => {
    if (transactionsLoading) return;

    try {
      const stored = localStorage.getItem(`floussi_long_term_assumptions_${userId}`);
      if (stored) {
        setAssumptions(JSON.parse(stored));
        return;
      }

      // If no stored assumptions, calculate estimates from transactions
      let estimatedSalary = DEFAULT_ASSUMPTIONS.averageMonthlySalary;
      let estimatedSavings = DEFAULT_ASSUMPTIONS.monthlyNetSavings;

      if (transactions && transactions.length > 0) {
        // Find date range of transactions
        const dates = transactions.map(t => new Date(t.transaction_date).getTime());
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        const diffMs = maxDate - minDate;
        const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const diffMonths = Math.max(1, diffDays / 30);

        // Group by incomes/expenses
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const monthlyIncomeAvg = Math.round(totalIncome / diffMonths);
        const monthlyExpenseAvg = Math.round(totalExpense / diffMonths);

        if (monthlyIncomeAvg > 1000) {
          estimatedSalary = monthlyIncomeAvg;
        }
        
        const netSavings = Math.max(0, monthlyIncomeAvg - monthlyExpenseAvg);
        if (netSavings > 100) {
          estimatedSavings = Math.round(netSavings);
        } else {
          estimatedSavings = Math.round(estimatedSalary * 0.15); // Default to 15% of estimated salary
        }
      }

      const initialAssumptions: Assumptions = {
        ...DEFAULT_ASSUMPTIONS,
        averageMonthlySalary: estimatedSalary,
        monthlyNetSavings: estimatedSavings
      };

      setAssumptions(initialAssumptions);
      localStorage.setItem(`floussi_long_term_assumptions_${userId}`, JSON.stringify(initialAssumptions));
    } catch (_) {
      setAssumptions(DEFAULT_ASSUMPTIONS);
    }
  }, [transactions, transactionsLoading, userId]);

  // Map growth scenario string to actual interest rate
  const annualGrowthRate = useMemo(() => {
    if (!assumptions) return 5;
    switch (assumptions.growthScenario) {
      case 'prudent': return 3.5;  // Prudent (Comptes sur Carnet / Obligataire court terme)
      case 'balanced': return 6.0;  // Balanced (OPVCM Diversifiés / Dividendes)
      case 'dynamic': return 8.5;   // Dynamic (Actions de croissance, immobilier locatif, or)
      default: return 6.0;
    }
  }, [assumptions]);

  // Update assumptions handler
  const updateAssumptions = (newAssumptions: Partial<Assumptions>) => {
    setAssumptions(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...newAssumptions };
      localStorage.setItem(`floussi_long_term_assumptions_${userId}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Reset assumptions to default
  const resetAssumptions = () => {
    setAssumptions(DEFAULT_ASSUMPTIONS);
    localStorage.setItem(`floussi_long_term_assumptions_${userId}`, JSON.stringify(DEFAULT_ASSUMPTIONS));
  };

  // Compute 30-year projections
  const projections = useMemo(() => {
    if (!assumptions) return [];
    // Start with real user net worth
    const startNetWorth = isNaN(netWorth) ? 0 : netWorth;
    return projectNetWorth(
      startNetWorth,
      assumptions.monthlyNetSavings,
      annualGrowthRate,
      40 // Run projection for 40 years to cover any normal retirement age
    );
  }, [netWorth, assumptions, annualGrowthRate]);

  // Compute milestones
  const milestones = useMemo(() => {
    if (!assumptions || projections.length === 0) return [];
    return generateLifeMilestones(
      assumptions.currentAge,
      assumptions.retirementAge,
      projections,
      assumptions.cnssContributionYears,
      assumptions.averageMonthlySalary
    );
  }, [assumptions, projections]);

  // Compute comparison scenarios
  const comparison = useMemo(() => {
    if (!assumptions) return { scenarios: [], chartData: [] };
    const startNetWorth = isNaN(netWorth) ? 0 : netWorth;
    return compareScenarios(
      startNetWorth,
      assumptions.monthlyNetSavings,
      annualGrowthRate,
      30, // Compare over standard 30 years
      assumptions.currentAge
    );
  }, [netWorth, assumptions, annualGrowthRate]);

  // Compute retirement details
  const retirementDetails = useMemo(() => {
    if (!assumptions || projections.length === 0) return null;
    
    const yearsToRetirement = Math.max(0, assumptions.retirementAge - assumptions.currentAge);
    const netWorthAtRetirement = projections[Math.min(yearsToRetirement, projections.length - 1)]?.projectedNetWorth || 0;
    
    return projectRetirementIncome(
      assumptions.cnssContributionYears + yearsToRetirement,
      assumptions.averageMonthlySalary,
      netWorthAtRetirement
    );
  }, [assumptions, projections]);

  return {
    assumptions,
    loading: netWorthLoading || transactionsLoading || assumptions === null,
    annualGrowthRate,
    projections,
    milestones,
    comparisonScenarios: comparison.scenarios,
    comparisonChartData: comparison.chartData,
    retirementDetails,
    updateAssumptions,
    resetAssumptions,
    currentNetWorth: isNaN(netWorth) ? 0 : netWorth
  };
}
