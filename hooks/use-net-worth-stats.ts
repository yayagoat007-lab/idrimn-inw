import { useMemo } from 'react';
import { useNetWorth, NetWorthItemExtended } from './use-net-worth';

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

export function useNetWorthStats() {
  const { items, loading } = useNetWorth();

  const stats = useMemo(() => {
    const assets = items.filter(i => i.type === 'asset');
    const liabilities = items.filter(i => i.type === 'liability');

    // Category Breakdown for Assets
    const assetCategories: Record<string, number> = {};
    assets.forEach(item => {
      assetCategories[item.category] = (assetCategories[item.category] || 0) + item.current_value;
    });

    const assetColors: Record<string, string> = {
      "Immobilier": "#10b981", // Emerald
      "Véhicule": "#3b82f6", // Blue
      "Investissements": "#8b5cf6", // Purple
      "Compte bancaire / Épargne / Cash": "#06b6d4", // Cyan
      "Or / Bijoux": "#fbbf24", // Yellow/Amber
      "Bétail": "#f97316", // Orange
      "Commerce / Entreprise": "#ec4899", // Pink
      "Retraite": "#6366f1", // Indigo
      "Autres": "#6b7280" // Gray
    };

    const assetBreakdown: CategoryBreakdown[] = Object.keys(assetCategories).map(cat => ({
      name: cat,
      value: assetCategories[cat],
      color: assetColors[cat] || "#2563eb"
    }));

    // Category Breakdown for Liabilities
    const liabilityCategories: Record<string, number> = {};
    liabilities.forEach(item => {
      liabilityCategories[item.category] = (liabilityCategories[item.category] || 0) + item.current_value;
    });

    const liabilityColors: Record<string, string> = {
      "Crédit immobilier": "#ef4444", // Red
      "Crédit auto / Crédit consommation": "#f97316", // Orange
      "Carte crédit": "#f43f5e", // Rose
      "Prêt étudiant": "#ec4899", // Pink
      "Prêt tontine": "#d946ef", // Fuchsia
      "Dette familiale": "#a855f7", // Purple
      "Autres": "#9ca3af" // Gray
    };

    const liabilityBreakdown: CategoryBreakdown[] = Object.keys(liabilityCategories).map(cat => ({
      name: cat,
      value: liabilityCategories[cat],
      color: liabilityColors[cat] || "#dc2626"
    }));

    // Average Interest Rate (Weighted by debt size)
    const totalDebt = liabilities.reduce((sum, item) => sum + item.current_value, 0);
    let weightedInterestSum = 0;
    let rateCount = 0;

    liabilities.forEach(item => {
      if (item.interest_rate !== null && item.interest_rate !== undefined) {
        weightedInterestSum += item.interest_rate * item.current_value;
        rateCount += item.current_value;
      }
    });

    const averageInterestRate = rateCount > 0 ? weightedInterestSum / rateCount : 0;

    // Total Cost of Credit (accumulated interest estimation based on remaining amortization)
    // Approximation: outstanding loan * interest rate * years/2 as a rough rule of thumb, or more specific
    let estimatedTotalInterests = 0;
    liabilities.forEach(item => {
      if (item.interest_rate && item.interest_rate > 0) {
        // Assume remaining duration is approx 5 years if not specified
        const assumedRemainingYears = 8;
        estimatedTotalInterests += item.current_value * (item.interest_rate / 100) * assumedRemainingYears * 0.55;
      }
    });

    // Payoff dates (find furthest maturity date or estimate based on monthly payment)
    let maxRemainingMonths = 0;
    liabilities.forEach(item => {
      if (item.monthly_payment && item.monthly_payment > 0) {
        const remainingMonths = item.current_value / item.monthly_payment;
        if (remainingMonths > maxRemainingMonths) {
          maxRemainingMonths = remainingMonths;
        }
      }
    });

    const estimatedPayoffDate = new Date();
    estimatedPayoffDate.setMonth(estimatedPayoffDate.getMonth() + Math.round(maxRemainingMonths || 60));

    return {
      assetBreakdown,
      liabilityBreakdown,
      averageInterestRate,
      estimatedTotalInterests,
      estimatedPayoffDate: maxRemainingMonths > 0 ? estimatedPayoffDate.toLocaleDateString('fr', { month: 'long', year: 'numeric' }) : "Aucune dette active",
      maxRemainingMonths: Math.round(maxRemainingMonths)
    };
  }, [items]);

  return {
    ...stats,
    loading
  };
}
