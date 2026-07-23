import { Transaction, Goal, Bucket } from '../types';
import { calculateBehavioralMetrics, classifyBehaviorProfile, getAdviceForProfile } from './behavior-clustering';

export interface WrappedStats {
  year: number;
  totalSaved: number;
  totalSpent: number;
  totalIncome: number;
  bestMonth: { month: string; savedAmount: number };
  worstMonth: { month: string; overspentBucket: string };
  goalsCompleted: { name: string; amount: number; completedDate: string }[];
  topCategory: { name: string; amount: number; percentOfTotal: number };
  mostImprovedCategory: { name: string; percentReduction: number };
  longestStreak: number;
  totalTransactionsLogged: number;
  ocrReceiptsScanned: number;
  tontinesCompleted: number;
  personalityBadgeFr: string;
  personalityBadgeDarija: string;
  floussiScore?: number;
  floussiTier?: string;
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Calculates all stats for the personalized Floussi Wrapped
 */
export function calculateWrappedStats(
  transactions: Transaction[],
  goals: Goal[],
  buckets: Bucket[],
  gamificationState: any,
  periodStart: string,
  periodEnd: string
): WrappedStats {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const year = end.getFullYear();

  // Filter transactions within the glissant 12 months period
  const periodTxs = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d >= start && d <= end;
  });

  // Calculate totals
  let totalIncome = 0;
  let totalSpent = 0;
  let totalTransactionsLogged = periodTxs.length;
  let ocrReceiptsScanned = 0;

  // Monthly stats accumulator
  // key: "YYYY-MM"
  const monthlyData: Record<string, { income: number; spent: number; categories: Record<string, number> }> = {};

  // Category spent accumulator
  const categorySpent: Record<string, number> = {};

  periodTxs.forEach(t => {
    const d = new Date(t.transaction_date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, spent: 0, categories: {} };
    }

    // Detect OCR receipt scans
    const isOcr = t.tags?.includes('ocr') || t.description?.toLowerCase().includes('scan ticket') || t.description?.toLowerCase().includes('[split]');
    if (isOcr) {
      ocrReceiptsScanned++;
    }

    if (t.type === 'income') {
      totalIncome += t.amount;
      monthlyData[monthKey].income += t.amount;
    } else if (t.type === 'expense') {
      totalSpent += t.amount;
      monthlyData[monthKey].spent += t.amount;
      
      const cat = t.category || 'autres';
      monthlyData[monthKey].categories[cat] = (monthlyData[monthKey].categories[cat] || 0) + t.amount;
      categorySpent[cat] = (categorySpent[cat] || 0) + t.amount;
    }
  });

  const totalSaved = totalIncome - totalSpent;

  // 1. Find Best Month (highest net savings)
  let bestMonthName = 'N/A';
  let bestMonthSavings = -Infinity;

  // 2. Find Worst Month (month with largest bucket overspent, or highest total expense as fallback)
  let worstMonthName = 'N/A';
  let worstMonthOverspentBucket = 'Aucun';

  // We loop through months in period
  const monthKeys = Object.keys(monthlyData).sort();
  if (monthKeys.length > 0) {
    let maxOverspentAmount = 0;
    let highestSpentInMonth = -Infinity;

    monthKeys.forEach(mKey => {
      const parts = mKey.split('-');
      const mIdx = parseInt(parts[1], 10) - 1;
      const mName = MONTHS_FR[mIdx] || mKey;
      const mData = monthlyData[mKey];
      const savings = mData.income - mData.spent;

      if (savings > bestMonthSavings) {
        bestMonthSavings = savings;
        bestMonthName = mName;
      }

      if (mData.spent > highestSpentInMonth) {
        highestSpentInMonth = mData.spent;
        if (worstMonthName === 'N/A') {
          worstMonthName = mName;
        }
      }

      // Check overspent buckets for this month
      // In a real DB, buckets change over time, we can approximate by comparing category spends
      // in this month vs (allocated_amount of buckets in that category / 12)
      buckets.forEach(b => {
        const catSpent = mData.categories[b.category] || 0;
        const catAllocatedMonthly = b.allocated_amount; // assuming bucket allocation is monthly
        const overspent = catSpent - catAllocatedMonthly;
        if (overspent > maxOverspentAmount) {
          maxOverspentAmount = overspent;
          worstMonthOverspentBucket = b.name;
          worstMonthName = mName;
        }
      });
    });

    if (worstMonthOverspentBucket === 'Aucun' && worstMonthName !== 'N/A') {
      // Find top expense category of that worst month
      const worstMonthKey = monthKeys.find(m => {
        const parts = m.split('-');
        const mIdx = parseInt(parts[1], 10) - 1;
        return MONTHS_FR[mIdx] === worstMonthName;
      });
      if (worstMonthKey) {
        const catMap = monthlyData[worstMonthKey].categories;
        let topCat = 'autres';
        let topAmt = 0;
        Object.entries(catMap).forEach(([cat, amt]) => {
          if (amt > topAmt) {
            topAmt = amt;
            topCat = cat;
          }
        });
        worstMonthOverspentBucket = topCat.charAt(0).toUpperCase() + topCat.slice(1);
      }
    }
  }

  if (bestMonthSavings === -Infinity) bestMonthSavings = 0;

  // 3. Goals Completed
  const goalsCompleted = goals
    .filter(g => g.current_amount >= g.target_amount)
    .map(g => ({
      name: g.name,
      amount: g.target_amount,
      completedDate: g.updated_at ? new Date(g.updated_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')
    }));

  // 4. Top Category
  let topCategoryName = 'N/A';
  let topCategoryAmount = 0;
  let topCategoryPercent = 0;

  Object.entries(categorySpent).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategoryName = cat;
    }
  });

  if (totalSpent > 0) {
    topCategoryPercent = Math.round((topCategoryAmount / totalSpent) * 100);
  }

  // 5. Most Improved Category (reduction vs previous 12 months)
  // Calculate previous period spending
  const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
  const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
  const prevTxs = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d >= prevStart && d <= prevEnd;
  });

  const prevCategorySpent: Record<string, number> = {};
  prevTxs.forEach(t => {
    if (t.type === 'expense') {
      const cat = t.category || 'autres';
      prevCategorySpent[cat] = (prevCategorySpent[cat] || 0) + t.amount;
    }
  });

  let mostImprovedCategoryName = 'N/A';
  let maxReductionPercent = 0;

  Object.entries(prevCategorySpent).forEach(([cat, prevAmt]) => {
    const currentAmt = categorySpent[cat] || 0;
    if (prevAmt > 100) { // Only consider categories with meaningful previous spending
      const reduction = prevAmt - currentAmt;
      const reductionPercent = (reduction / prevAmt) * 100;
      if (reductionPercent > maxReductionPercent) {
        maxReductionPercent = reductionPercent;
        mostImprovedCategoryName = cat;
      }
    }
  });

  // If no category improved, fallback to any category with spending reduction or a default
  if (mostImprovedCategoryName === 'N/A') {
    // Look for any category with low spending
    const candidates = Object.keys(categorySpent).filter(c => c !== topCategoryName);
    mostImprovedCategoryName = candidates[0] || 'loisirs';
    maxReductionPercent = 15; // default simulated improvement
  }

  // 6. Streak and gamification
  const longestStreak = gamificationState?.streak || 5;

  // 7. Completed tontines
  // Count completed tontines from the localStorage table or from a default
  let tontinesCompleted = 0;
  try {
    const tontinesStr = localStorage.getItem('floussi_table_tontines');
    if (tontinesStr) {
      const tontinesList = JSON.parse(tontinesStr);
      tontinesCompleted = tontinesList.filter((t: any) => t.status === 'completed').length;
    }
  } catch (_) {}

  // 8. Personality Badge calculation using behavior clustering
  const behaviorMetrics = calculateBehavioralMetrics(periodTxs, 365);
  const profileId = classifyBehaviorProfile(behaviorMetrics, periodTxs);
  const profileDetails = getAdviceForProfile(profileId);

  const personalityBadgeFr = `${profileDetails.nameFr} ${year}`;
  const personalityBadgeDarija = `${profileDetails.nameDarija} ${year}`;

  // Retrieve latest Floussi Score & Tier
  let floussiScore = 350;
  let floussiTier = "Discipliné";
  try {
    const historyKey = `floussi_score_history_mock-user-id-9999`;
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      const historyList = JSON.parse(savedHistory);
      if (Array.isArray(historyList) && historyList.length > 0) {
        historyList.sort((a, b) => a.date.localeCompare(b.date));
        floussiScore = historyList[historyList.length - 1].score;
      }
    }
    
    if (floussiScore >= 850) {
      floussiTier = 'Légende';
    } else if (floussiScore >= 700) {
      floussiTier = 'Maître';
    } else if (floussiScore >= 500) {
      floussiTier = 'Stratège';
    } else if (floussiScore >= 300) {
      floussiTier = 'Discipliné';
    } else {
      floussiTier = 'Débutant';
    }
  } catch (_) {}

  return {
    year,
    totalSaved,
    totalSpent,
    totalIncome,
    bestMonth: { month: bestMonthName, savedAmount: bestMonthSavings },
    worstMonth: { month: worstMonthName, overspentBucket: worstMonthOverspentBucket },
    goalsCompleted,
    topCategory: { name: topCategoryName, amount: topCategoryAmount, percentOfTotal: topCategoryPercent },
    mostImprovedCategory: { name: mostImprovedCategoryName, percentReduction: Math.round(maxReductionPercent) },
    longestStreak,
    totalTransactionsLogged,
    ocrReceiptsScanned,
    tontinesCompleted,
    personalityBadgeFr,
    personalityBadgeDarija,
    floussiScore,
    floussiTier
  };
}

/**
 * Compares current period stats to a previous period
 */
export function getComparisonToPreviousPeriod(
  currentStats: WrappedStats,
  previousStats: Partial<WrappedStats>
): { savingsGrowthPercent: number; message: string } {
  const prevSaved = previousStats.totalSaved || 0;
  const currSaved = currentStats.totalSaved;

  if (prevSaved <= 0) {
    return {
      savingsGrowthPercent: 100,
      message: "Un excellent départ ! Vos économies progressent solidement cette année."
    };
  }

  const growth = ((currSaved - prevSaved) / Math.abs(prevSaved)) * 100;
  let message = "";

  if (growth > 25) {
    message = "Incroyable ! Vous avez largement boosté votre épargne par rapport à l'année dernière. Félicitations ! ✨";
  } else if (growth > 0) {
    message = "Bravo ! Vos efforts d'épargne portent leurs fruits, vous êtes en croissance positive. 📈";
  } else {
    message = "Pas de panique ! L'année a été riche en projets ou en imprévus, gardez le cap pour l'année prochaine. 💪";
  }

  return {
    savingsGrowthPercent: Math.round(growth),
    message
  };
}
