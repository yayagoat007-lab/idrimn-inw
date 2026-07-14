import { Bucket, Goal, Transaction } from '../types';
import { getEnrichedBenchmark, MoroccanCity, IncomeRange } from './benchmarks';

export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  potentialSaving: number;
  actionLabel: string;
  actionKey: string;
  type: 'goal_accelerator' | 'benchmark_excess' | 'general';
  impactMonths?: number;
  targetGoalName?: string;
  category?: string;
}

/**
 * Generates highly personalized, mathematically calculated financial optimization suggestions.
 */
export function generateOptimizationSuggestions(
  buckets: Bucket[],
  goals: Goal[],
  transactions: Transaction[],
  monthlyIncome: number,
  city: MoroccanCity = "Casablanca",
  incomeRange: IncomeRange = "5000-10000 DH"
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // --- Suggestion 1: Goal Accelerator (Loisirs vs. Active Goal) ---
  const activeGoal = goals.find(g => g.target_amount > g.current_amount);
  const discretionaryBucket = buckets.find(b => 
    b.category === 'loisirs' || 
    b.name.toLowerCase().includes('loisir') || 
    b.name.toLowerCase().includes('restau') ||
    b.name.toLowerCase().includes('café') ||
    b.name.toLowerCase().includes('ahwa')
  );

  if (activeGoal && discretionaryBucket && discretionaryBucket.spent_amount > 200) {
    const missingAmount = activeGoal.target_amount - activeGoal.current_amount;
    const currentSpent = discretionaryBucket.spent_amount;
    
    // Propose cutting discretionary spend by 35%
    const potentialSaving = Math.round(currentSpent * 0.35);
    
    // Assume baseline contribution is auto_contribute_amount, or 500 DH as default
    const baseContribution = activeGoal.auto_contribute_amount > 0 ? activeGoal.auto_contribute_amount : 400;
    
    const monthsWithoutSaving = missingAmount / baseContribution;
    const monthsWithSaving = missingAmount / (baseContribution + potentialSaving);
    
    const diffMonths = Math.max(1, Math.round(monthsWithoutSaving - monthsWithSaving));

    if (potentialSaving >= 50 && diffMonths >= 1) {
      suggestions.push({
        id: `opt-goal-acc-${activeGoal.id}`,
        title: `Accélérateur Objectif : ${activeGoal.name} 🕋`,
        description: `En réduisant de 35% votre sandoq "${discretionaryBucket.name}" (soit une économie de ${potentialSaving} DH/mois sur vos cafés/sorties) et en l'allouant à votre projet "${activeGoal.name}", vous l'atteindrez ${diffMonths} mois plus tôt !`,
        potentialSaving,
        actionLabel: `Transférer vers ${activeGoal.name}`,
        actionKey: "transfer_saving_to_goal",
        type: 'goal_accelerator',
        impactMonths: diffMonths,
        targetGoalName: activeGoal.name,
        category: discretionaryBucket.category
      });
    }
  }

  // --- Suggestion 2: Regional Benchmark audit (Category exceeds official average by > 15%) ---
  buckets.forEach(bucket => {
    // We only audit standard expense categories
    let categoryKey = bucket.category.toLowerCase().trim();
    if (categoryKey === 'food') categoryKey = 'alimentation';
    if (categoryKey === 'housing') categoryKey = 'logement';

    const benchmark = getEnrichedBenchmark(city, incomeRange, categoryKey);
    
    if (benchmark.averageAmount > 0 && bucket.spent_amount > benchmark.averageAmount * 1.15) {
      const excess = bucket.spent_amount - benchmark.averageAmount;
      const potentialSaving = Math.round(excess);

      let title = "";
      let description = "";

      if (categoryKey === 'alimentation' || categoryKey === 'food') {
        title = `Alerte Courses : Dérive sur l'alimentation 🛒`;
        description = `Vos dépenses en alimentation (${bucket.spent_amount} DH) dépassent de 15%+ le baromètre HCP pour un foyer à ${city} (${benchmark.averageAmount} DH). Astuce : Achetez en gros chez BIM/Atacadao pour économiser ${potentialSaving} DH ce mois-ci.`;
      } else if (categoryKey === 'logement' || categoryKey === 'housing') {
        title = `Ajustement Logement & Factures 🏠`;
        description = `Votre enveloppe Logement (${bucket.spent_amount} DH) est supérieure à la moyenne régionale de ${city} (${benchmark.averageAmount} DH). Économisez environ ${potentialSaving} DH en renégociant vos abonnements ou en optimisant votre consommation Lydec.`;
      } else {
        title = `Surcharge sur le sandoq "${bucket.name}" 📂`;
        description = `Votre enveloppe "${bucket.name}" (${bucket.spent_amount} DH) dépasse le standard statistique de ${city} (${benchmark.averageAmount} DH). Vous pouvez facilement économiser ${potentialSaving} DH en rationnant cet usage.`;
      }

      suggestions.push({
        id: `opt-bench-excess-${bucket.id}`,
        title,
        description,
        potentialSaving,
        actionLabel: `Ajuster l'enveloppe`,
        actionKey: "reduce_bucket_budget",
        type: 'benchmark_excess',
        category: bucket.category
      });
    }
  });

  // --- Suggestion 3: General backup saving suggestion if none generated ---
  if (suggestions.length === 0) {
    const generalSaving = Math.round(monthlyIncome * 0.1);
    suggestions.push({
      id: "opt-general-savings",
      title: "Règle d'or de la Baraka (10%) 🪙",
      description: `Il n'y a pas de dérive majeure sur vos sandoqs ! Pour aller plus loin, épargnez systématiquement ${generalSaving} DH de votre salaire dès le 26 du mois en activant le Tawfir Automatique.`,
      potentialSaving: generalSaving,
      actionLabel: "Activer l'auto-épargne",
      actionKey: "activate_auto_savings",
      type: 'general'
    });
  }

  return suggestions;
}
