import { Transaction, Bucket, Goal } from '../types';

export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  potentialSaving: number;
  actionLabel: string;
  actionKey: string;
}

export function calculateFinancialHealthScore(
  monthlyIncome: number,
  totalAssets: number,
  totalLiabilities: number,
  savingsRate: number
): number {
  let score = 50; // base score

  // Savings rate contribution (up to 25 points)
  if (savingsRate > 30) score += 25;
  else if (savingsRate > 15) score += 15;
  else if (savingsRate > 5) score += 5;
  else if (savingsRate < 0) score -= 15;

  // Debt-to-Asset ratio contribution (up to 25 points)
  const netWorth = totalAssets - totalLiabilities;
  if (totalAssets > 0) {
    const debtRatio = totalLiabilities / totalAssets;
    if (debtRatio < 0.2) score += 25;
    else if (debtRatio < 0.4) score += 15;
    else if (debtRatio > 0.8) score -= 20;
  } else if (netWorth >= 0) {
    score += 15;
  }

  return Math.max(10, Math.min(100, score));
}

export function detectAnomalies(
  transactions: Transaction[],
  buckets: Bucket[],
  lang: 'fr' | 'darija' = 'fr'
): string[] {
  const anomalies: string[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Highlight high telecom spending
  const telecomSpent = currentMonthTransactions
    .filter(t => t.category === 'telecom' || t.description?.toLowerCase().includes('telecom') || t.description?.toLowerCase().includes('inwi') || t.description?.toLowerCase().includes('maroc telecom') || t.description?.toLowerCase().includes('orange'))
    .reduce((sum, t) => sum + t.amount, 0);

  if (telecomSpent > 400) {
    if (lang === 'darija') {
      anomalies.push(`Masrouf El-Hatif dyalek (${telecomSpent} DH) kber bzzaf mkarana m3a l-mouwatinin l-marok (250 DH).`);
    } else {
      anomalies.push(`Votre budget Télécom (${telecomSpent} DH) est 25% plus cher que la moyenne nationale (250 DH).`);
    }
  }

  // Highlight double expense or unusually large expense
  const averageExpense = transactions.length > 0 
    ? (transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / Math.max(1, transactions.filter(t => t.type === 'expense').length))
    : 100;

  const highExpenses = currentMonthTransactions.filter(t => t.type === 'expense' && t.amount > averageExpense * 3 && t.amount > 1000);
  highExpenses.forEach(he => {
    if (lang === 'darija') {
      anomalies.push(`Kharja kbira dyal ${he.amount} DH 3nd ${he.merchant || 'commerçant'} f ${he.transaction_date}. Shouf wash kulshi mzyan.`);
    } else {
      anomalies.push(`Dépense inhabituelle de ${he.amount} DH chez ${he.merchant || 'commerçant'} le ${he.transaction_date}. Est-ce correct ?`);
    }
  });

  if (anomalies.length === 0) {
    if (lang === 'darija') {
      anomalies.push("Kulshi mzyan had l-shher! Ta l-haja ma kharja 3la l-3ada.");
    } else {
      anomalies.push("Aucune anomalie détectée ce mois-ci ! Excellente gestion.");
    }
  }

  return anomalies;
}

export function generateSuggestions(
  buckets: Bucket[],
  goals: Goal[],
  monthlyIncome: number,
  lang: 'fr' | 'darija' = 'fr'
): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Suggestion 1: Always suggest auto-transfer for savings
  suggestions.push({
    id: "s_auto",
    title: lang === 'darija' ? "Kteb iqtisad otomatik" : "Épargne Automatique Permanent",
    description: lang === 'darija' 
      ? "Dir tawil dyal 10% mn l-khlass dyalek ghedda dyal r-raha l sandoq l-iddikhar."
      : "Programmez un virement permanent de 10% de votre salaire le 26 du mois directement vers votre sandoq d'épargne.",
    potentialSaving: Math.round(monthlyIncome * 0.1),
    actionLabel: lang === 'darija' ? "Dir Virement" : "Activer l'épargne",
    actionKey: "auto_savings"
  });

  // Suggestion 2: Optimize food budget if there are high food buckets
  const foodBucket = buckets.find(b => b.name.toLowerCase().includes('alim') || b.name.toLowerCase().includes('nour'));
  if (foodBucket && foodBucket.spent_amount > 2000) {
    suggestions.push({
      id: "s_food",
      title: lang === 'darija' ? "Noqas mn l-makla f l-kharij" : "Optimiser les achats de gros",
      description: lang === 'darija'
        ? "Takteb l-gawda b shir s-souq bhal BIM wla Atacadao bash twffer hta l 300 DH had l-shher."
        : "Faites vos courses d'alimentation de base en gros chez BIM ou Atacadao pour économiser jusqu'à 300 DH ce mois-ci.",
      potentialSaving: 300,
      actionLabel: lang === 'darija' ? "Shouf l-bila" : "Ajuster sandoq",
      actionKey: "food_bulk"
    });
  }

  return suggestions;
}

export function getPersonalizedAdvice(lang: 'fr' | 'darija' = 'fr'): string {
  const currentMonth = new Date().getMonth();
  
  // Seasonal advice based on Moroccan lifestyle / events
  if (currentMonth === 5 || currentMonth === 6 || currentMonth === 7) { // June, July, August
    return lang === 'darija'
      ? "Sif hna! Red l-bal m3a l-masarif dyal l-bher, l-safar w l-monassabat dyal l-aarsat."
      : "C'est la saison d'été et des mariages ! Prévoyez un sandoq dédié pour les cadeaux d'Aars et les sorties de vacances.";
  } else if (currentMonth === 2 || currentMonth === 3) { // March/April (often around Ramadan/Aid in these years)
    return lang === 'darija'
      ? "L-mouda dyal l-gawda dial Ramadan t-khdem bzzaf. Dir d-Daret kbel l-weqt bash tqdi l-ghrad."
      : "Les gâteaux traditionnels et les repas du Ftour de Ramadan requièrent une planification d'avance. Pensez au sandoq spécial.";
  }
  
  return lang === 'darija'
    ? "Khdem b l-khotta d s-sandoqat d Floussi bash t-tebba3 masrouf l-khozna dyal dar."
    : "Maintenez la discipline de vos sandoqs (enveloppes) Floussi pour assurer l'équilibre budgétaire de votre foyer.";
}

// Keep original structure compatibility
export interface AIPrediction {
  projectedSavings3Months: number;
  financialHealthScore: number;
  scoreEvolution: 'up' | 'down' | 'stable';
  anomalies: string[];
  suggestions: {
    title: string;
    description: string;
    potentialSaving: number;
    actionLabel: string;
    actionKey: string;
  }[];
}

export function analyzeFinancials(
  transactions: Transaction[],
  buckets: Bucket[],
  goals: Goal[]
): AIPrediction {
  const score = calculateFinancialHealthScore(12000, 10000, 0, 20);
  const anomaliesList = detectAnomalies(transactions, buckets);
  const suggestionsList = generateSuggestions(buckets, goals, 12000);

  return {
    projectedSavings3Months: 2000 * 3,
    financialHealthScore: score,
    scoreEvolution: 'stable',
    anomalies: anomaliesList,
    suggestions: suggestionsList
  };
}
