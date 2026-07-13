import { useMemo } from 'react';
import { useInsights } from './use-insights';
import { useBuckets } from './use-buckets';
import { useGoals } from './use-goals';
import { useNetWorth } from './use-net-worth';
import { 
  detectAnomalies, 
  generateSuggestions, 
  calculateFinancialHealthScore, 
  getPersonalizedAdvice 
} from '../lib/ai-rules';
import { getBenchmarkBySalary, REGIONAL_BENCHMARKS } from '../lib/benchmarks';

export function useAIInsights(userId: string = "mock-user-id-9999", lang: 'fr' | 'darija' = 'fr') {
  const { transactions, stats: insightStats, loading: insightsLoading } = useInsights(userId);
  const { buckets, loading: bucketsLoading } = useBuckets();
  const { goals, loading: goalsLoading } = useGoals(userId);
  const { totalAssets, totalLiabilities, loading: netWorthLoading } = useNetWorth(userId);

  const loading = insightsLoading || bucketsLoading || goalsLoading || netWorthLoading;

  const aiResults = useMemo(() => {
    if (loading) return null;

    // 1. Calculate health score
    const monthlyIncome = insightStats.totalIncome || 12000; // default/estimated
    const healthScore = calculateFinancialHealthScore(
      monthlyIncome,
      totalAssets,
      totalLiabilities,
      insightStats.savingsRate
    );

    // 2. Scan for anomalies
    const anomalies = detectAnomalies(transactions, buckets, lang);

    // 3. Generate actionable suggestions
    const suggestions = generateSuggestions(buckets, goals, monthlyIncome, lang);

    // 4. Personalized seasonal advice of the month
    const seasonalAdvice = getPersonalizedAdvice(lang);

    // 5. Compare with Moroccan benchmarks
    const benchmarks = getBenchmarkBySalary(monthlyIncome);
    const userCategoryPercent = insightStats.spendingByCategory.map(cat => {
      // Find matching benchmark category
      const match = benchmarks.find(b => b.category.toLowerCase().includes(cat.name.toLowerCase().substring(0, 4)));
      return {
        category: cat.name,
        userPercent: cat.percent,
        userAmount: cat.value,
        benchmarkPercent: match ? match.averagePercent : 10,
        benchmarkAmount: match ? (monthlyIncome * match.averagePercent) / 100 : 1200,
        diffPercent: cat.percent - (match ? match.averagePercent : 10)
      };
    });

    // 6. Savings forecast (projection)
    const monthlySavings = Math.max(0, monthlyIncome - insightStats.totalExpense);
    const potential12mSavings = monthlySavings * 12;

    return {
      healthScore,
      anomalies,
      suggestions,
      seasonalAdvice,
      benchmarks: userCategoryPercent,
      potential12mSavings,
      regionalAverage: REGIONAL_BENCHMARKS["casablanca-settat"] // Casablanca as default
    };
  }, [loading, transactions, buckets, goals, totalAssets, totalLiabilities, insightStats, lang]);

  return {
    loading,
    aiResults
  };
}
