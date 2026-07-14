import { Transaction } from '../types';

export interface BehavioralMetrics {
  savingsRate: number; // (Income - Expense) / Income
  frequencyPerDay: number; // Total transactions / days in period
  expenseStdDev: number; // Variability of transaction amount
  weekendRatio: number; // Weekend spend / Weekday spend
}

export type BehaviorProfile = 'epargnant_discipline' | 'depensier_occasionnel' | 'impulsif_chronique' | 'famille_nombreuse';

export interface ProfileDetails {
  id: BehaviorProfile;
  nameFr: string;
  nameDarija: string;
  descriptionFr: string;
  descriptionDarija: string;
  adviceFr: string[];
  adviceDarija: string[];
}

/**
 * Calculates standard deviation of a number array
 */
function getStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Extract behavioral metrics from transactions of the last N days (usually 90 days)
 */
export function calculateBehavioralMetrics(
  transactions: Transaction[],
  days: number = 90
): BehavioralMetrics {
  const now = new Date();
  const thresholdDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const recentTxs = transactions.filter(t => new Date(t.transaction_date) >= thresholdDate);

  // Group by income and expense
  const incomeTxs = recentTxs.filter(t => t.type === 'income');
  const expenseTxs = recentTxs.filter(t => t.type === 'expense');

  const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

  // 1. Savings rate
  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;

  // 2. Frequency of transaction per day
  const frequencyPerDay = recentTxs.length / Math.max(1, days);

  // 3. Standard deviation of expenses
  const expenseAmounts = expenseTxs.map(t => t.amount);
  const expenseStdDev = getStandardDeviation(expenseAmounts);

  // 4. Weekend vs Weekday spending
  let weekendSpend = 0;
  let weekdaySpend = 0;

  expenseTxs.forEach(t => {
    const day = new Date(t.transaction_date).getDay();
    const isWeekend = day === 0 || day === 6; // Sunday or Saturday
    if (isWeekend) {
      weekendSpend += t.amount;
    } else {
      weekdaySpend += t.amount;
    }
  });

  const weekendRatio = weekdaySpend > 0 ? weekendSpend / weekdaySpend : weekendSpend > 0 ? 1.5 : 0;

  return {
    savingsRate: parseFloat(savingsRate.toFixed(4)),
    frequencyPerDay: parseFloat(frequencyPerDay.toFixed(2)),
    expenseStdDev: parseFloat(expenseStdDev.toFixed(2)),
    weekendRatio: parseFloat(weekendRatio.toFixed(2))
  };
}

/**
 * Classifies behavioral metrics into a distinct Profile
 */
export function classifyBehaviorProfile(metrics: BehavioralMetrics, transactions: Transaction[]): BehaviorProfile {
  // Let's also check if they are family by checking if they spend on school/education or buy large quantities
  const familyCount = transactions.filter(t => 
    t.category === 'education' || 
    t.description?.toLowerCase().includes('ecole') || 
    t.description?.toLowerCase().includes('enfants') ||
    t.description?.toLowerCase().includes('marjane') && t.amount > 1200
  ).length;

  if (familyCount >= 3) {
    return 'famille_nombreuse';
  }

  // Savings rate > 25% and low spending volatility (steady, disciplined budgeting)
  if (metrics.savingsRate >= 0.25 && metrics.expenseStdDev < 400) {
    return 'epargnant_discipline';
  }

  // Multiple high weekend spikes (weekend ratio > 0.8) or high transactional frequency, but not super high deficit
  if (metrics.weekendRatio > 0.7 && metrics.savingsRate >= 0) {
    return 'depensier_occasionnel';
  }

  // Deficit or very low savings rate combined with high transaction frequency & high amount volatility
  if (metrics.savingsRate < 0.05 || (metrics.frequencyPerDay > 0.6 && metrics.expenseStdDev > 600)) {
    return 'impulsif_chronique';
  }

  // Fallback to average/occasional spender
  return 'depensier_occasionnel';
}

const PROFILE_DETAILS_MAP: Record<BehaviorProfile, ProfileDetails> = {
  epargnant_discipline: {
    id: 'epargnant_discipline',
    nameFr: "Épargnant Discipliné (Tawfir Dahabi)",
    nameDarija: "المدخر الملتزم 🪙",
    descriptionFr: "Vous gérez vos finances d'une main de maître. Vos dépenses sont stables et vous parvenez à économiser de façon constante.",
    descriptionDarija: "Tat-tahkem f l'masrouf dyalek b tariqa mzyana. Dima tat-khlli chi baraka m9rossa l sandoq l-iddikhar.",
    adviceFr: [
      "Pensez à diversifier votre épargne en achetant de l'Or (Dhab) ou en participant à des tontines d'investissement.",
      "Fixez-vous un objectif de 'Zakat al-Maal' pour purifier vos économies stagnantes.",
      "Optimisez vos placements en ouvrant un sandoq de secours équivalant à 6 mois de dépenses."
    ],
    adviceDarija: [
      "Khmem f bach t-allouer d-dhb oula daret dyal l'investissement bach l'baraka t-kber.",
      "Dir xouira dyal Zakat al-Maal bach t-tahhar l-flouss dialek.",
      "Khbi masrouf dyal 6 chhor dyal l-imprevu f sandoq bou7do."
    ]
  },
  depensier_occasionnel: {
    id: 'depensier_occasionnel',
    nameFr: "Dépensier Occasionnel (Masrouf Mou3tadil)",
    nameDarija: "المصروف المعتدل ☕",
    descriptionFr: "Votre budget est généralement équilibré, mais vos sorties de weekend et les petits plaisirs (Ahwa, restaurants) freinent vos projets d'épargne.",
    descriptionDarija: "L'budget dyalek ghadi mzyan fl-galeb, walakin s-srf dial l'weekend w la7wayej dial d-do9 (l'ahwa, les sorties) tay-harsso l-tawfir dialek.",
    adviceFr: [
      "Prévoyez une enveloppe stricte 'Loisirs' le vendredi pour éviter de piocher dans l'argent du loyer.",
      "Limitez les règlements par carte le weekend : utilisez du cash enveloppé pour mieux ressentir la dépense.",
      "Automatisez un virement d'épargne de 300 DH dès le début de mois."
    ],
    adviceDarija: [
      "Dir wahed sandoq d 'Loisirs' khass b l'weekend bach matchfch l'mika dial l-kra.",
      "Khdem b l-kax (cash) f l'weekend badal l-carte bancaire bach ths b l-flouss taytiro.",
      "Programmi wahed l'virement dial 300 DH dima f l-bdaya dial ch-char."
    ]
  },
  impulsif_chronique: {
    id: 'impulsif_chronique',
    nameFr: "Acheteur Impulsif (Saraf Bla Hsabi)",
    nameDarija: "المبذر السريع 💸",
    descriptionFr: "Alerte rouge ! Vos dépenses sont très variables, fréquentes, et votre taux d'épargne est critique. Le découvert vous guette.",
    descriptionDarija: "L'khre dial chhar dima tayssalek sifr dirham. Tat-sraf bla ktaba w bla hsab sandoq, red l-bal mel fa9r !",
    adviceFr: [
      "Activez la règle de validation de 24h avant tout achat non essentiel supérieur à 200 DH.",
      "Supprimez les applications de shopping compulsif et n'enregistrez pas votre carte bancaire en ligne.",
      "Créez un sandoq 'Dépenses Impromptues' de 400 DH maximum et cachez votre carte de crédit."
    ],
    adviceDarija: [
      "Khdem b l-9anoun dial 24 sa3a d s-sbar 9bel matchri ay 7aja ktr mn 200 DH.",
      "7yed les cartes bancaires mn les sites dial shopping (BIM, Jumia, etc.).",
      "Dir sandoq 'Masrouf Bla Hsabi' m7doud f 400 DH maximum fl-chhar."
    ]
  },
  famille_nombreuse: {
    id: 'famille_nombreuse',
    nameFr: "Gestionnaire de Foyer (Moul L'khayma)",
    nameDarija: "مول الخيمة 👨‍👩‍👧‍👦",
    descriptionFr: "Vos finances sont rythmées par les besoins du foyer : scolarité, courses de gros (Marjane/BIM), et factures d'eau/électricité.",
    descriptionDarija: "L'masrouf dyalek dima f l'mou3amalat d l'khayma: l'madrassa dial d-drari, Marjane, w l'factures dial Lydec.",
    adviceFr: [
      "Regroupez vos courses d'alimentation mensuelles chez BIM ou Atacadao pour économiser sur le volume.",
      "Partagez l'enveloppe 'Alimentation' avec votre conjoint en utilisant la fonction Budget Familial.",
      "Anticipez la rentrée scolaire dès le mois d'avril en provisionnant 150 DH/mois."
    ],
    adviceDarija: [
      "Chri l'khdra w s-srf f s-souq d s-simana, w l'alimentation f Atacadao oula BIM.",
      "Charek sandoq d 'L'makla' m3a l'mra/moul d-dar f l'appli.",
      "Khbi 150 DH koula chhar l l-madrassa w l'ktoub d s-septembre mn dba."
    ]
  }
};

export function getAdviceForProfile(profile: BehaviorProfile): ProfileDetails {
  return PROFILE_DETAILS_MAP[profile] || PROFILE_DETAILS_MAP.depensier_occasionnel;
}
