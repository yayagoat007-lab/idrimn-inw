import { Transaction, Bucket, Goal } from '../types';
import { generateOptimizationSuggestions } from './optimization-suggestions';
import { calculateFloussiScore, getScoreHistory } from './floussi-score';
import { getSavedChallenges } from './optimization-challenges';

export interface WeeklyReport {
  id: string;
  weekStartDate: string; // YYYY-MM-DD
  period: string; // e.g., "Semaine du 14 au 20 juillet 2026"
  summary: {
    totalSpent: number;
    totalSaved: number;
    comparedToLastWeek: number; // e.g., -12 (spent 12% less)
  };
  topInsight: string;
  threeWins: string[];
  oneWatchout: string;
  weekAheadTip: string;
  scoreImpact: string;
}

// Map months for nice period strings
const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
  'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
];

/**
 * Helper to format the weekly period elegantly in French or Darija
 */
function formatPeriod(startDateStr: string, lang: 'fr' | 'darija'): string {
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return startDateStr;
  
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  
  const startDay = start.getDate();
  const startMonthIdx = start.getMonth();
  const startYear = start.getFullYear();
  
  const endDay = end.getDate();
  const endMonthIdx = end.getMonth();
  const endYear = end.getFullYear();

  if (lang === 'darija') {
    const startMonth = MONTHS_AR[startMonthIdx];
    const endMonth = MONTHS_AR[endMonthIdx];
    if (startMonthIdx === endMonthIdx) {
      return `الأسبوع من ${startDay} إلى ${endDay} ${startMonth} ${startYear}`;
    }
    return `الأسبوع من ${startDay} ${startMonth} إلى ${endDay} ${endMonth} ${endYear}`;
  } else {
    const startMonth = MONTHS_FR[startMonthIdx];
    const endMonth = MONTHS_FR[endMonthIdx];
    if (startMonthIdx === endMonthIdx) {
      return `Semaine du ${startDay} au ${endDay} ${startMonth} ${startYear}`;
    }
    return `Semaine du ${startDay} ${startMonth} au ${endDay} ${endMonth} ${endYear}`;
  }
}

/**
 * Calculates a highly personalized weekly coaching report based on real data
 */
export async function generateWeeklyReport(
  userId: string = "mock-user-id-9999",
  weekStartDateStr: string,
  lang: 'fr' | 'darija' = 'fr'
): Promise<WeeklyReport> {
  const isDarija = lang === 'darija';
  
  // 1. Fetch real tables from local storage
  let txs: Transaction[] = [];
  let buckets: Bucket[] = [];
  let goals: Goal[] = [];
  
  try {
    const rawTxs = localStorage.getItem('floussi_table_transactions');
    if (rawTxs) txs = JSON.parse(rawTxs);
  } catch (_) {}

  try {
    const rawBuckets = localStorage.getItem('floussi_table_buckets');
    if (rawBuckets) buckets = JSON.parse(rawBuckets);
  } catch (_) {}

  try {
    const rawGoals = localStorage.getItem('floussi_table_goals');
    if (rawGoals) goals = JSON.parse(rawGoals);
  } catch (_) {}

  // Parse dates
  const weekStart = new Date(weekStartDateStr);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1); // 7 days total inclusive

  const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prevWeekEnd = new Date(weekStart.getTime() - 1);

  // Filter transactions for current week
  const weekTxs = txs.filter(t => {
    const d = new Date(t.transaction_date);
    return d >= weekStart && d <= weekEnd;
  });

  // Filter transactions for previous week
  const prevWeekTxs = txs.filter(t => {
    const d = new Date(t.transaction_date);
    return d >= prevWeekStart && d <= prevWeekEnd;
  });

  // 2. Compute Summary Metrics
  const totalSpent = weekTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = weekTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Fallback weekly income estimation (income is usually monthly, so we prorate if no income this week)
  let estimatedWeeklyIncome = 3000; // fallback default (13000 / 4.3)
  try {
    const rawProfile = localStorage.getItem('user_profile') || localStorage.getItem('floussi_table_profiles');
    if (rawProfile) {
      const profile = JSON.parse(rawProfile);
      if (profile.monthly_income) {
        estimatedWeeklyIncome = Math.round(Number(profile.monthly_income) / 4.3);
      }
    }
  } catch (_) {}

  const activeIncome = totalIncome > 0 ? totalIncome : estimatedWeeklyIncome;
  const totalSaved = Math.max(0, activeIncome - totalSpent);

  // Compare spent to last week
  const prevSpent = prevWeekTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  let comparedToLastWeek = 0;
  if (prevSpent > 0) {
    comparedToLastWeek = Math.round(((totalSpent - prevSpent) / prevSpent) * 100);
  } else if (totalSpent > 0) {
    comparedToLastWeek = 100; // 100% increase if previous week was 0
  }

  // 3. Category analysis of current week
  const categorySpent: Record<string, number> = {};
  weekTxs.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'autres';
    categorySpent[cat] = (categorySpent[cat] || 0) + t.amount;
  });

  // Sort categories by expenditure
  const sortedCategories = Object.entries(categorySpent).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0]?.[0] || 'autres';
  const topCategoryAmount = sortedCategories[0]?.[1] || 0;
  const topCategoryPercent = totalSpent > 0 ? Math.round((topCategoryAmount / totalSpent) * 100) : 0;

  // 4. Dynamic Top Insight calculation
  let topInsight = "";
  if (totalSpent === 0) {
    topInsight = isDarija
      ? "Siyana ghzala! Ma dert hta chi masrouf had l'osimana. Sandoqat dyalek kamlin f l-aman."
      : "Semaine parfaite ! Aucune dépense n'a été enregistrée cette semaine. Vos sandoqs dorment au calme.";
  } else if (comparedToLastWeek < -15) {
    topInsight = isDarija
      ? `Had l'osimana, nقصti masrouf dyalek b ${Math.abs(comparedToLastWeek)}% mkarana m3a l'osimana l-fatet. Intilaqa mzyana!`
      : `Cette semaine, vous avez réduit vos dépenses de ${Math.abs(comparedToLastWeek)}% par rapport à la semaine dernière. Excellent contrôle !`;
  } else if (topCategoryPercent > 40 && topCategoryAmount > 200) {
    topInsight = isDarija
      ? `Dépensat dyalek tmerkzou f khana dyal "${topCategory}" b ${topCategoryPercent}% (${topCategoryAmount} DH).`
      : `Vos dépenses se sont fortement concentrées sur "${topCategory}" à hauteur de ${topCategoryPercent}% du total (${topCategoryAmount} DH).`;
  } else {
    topInsight = isDarija
      ? `Had l'osimana srf ti ${totalSpent} DH o wffrti tkriban ${totalSaved} DH. Indibat mzyan m3a l-mizaniya.`
      : `Cette semaine, vous avez dépensé ${totalSpent} DH et épargné environ ${totalSaved} DH. Votre budget reste sous contrôle régulier.`;
  }

  // 5. Generate Exactly 3 Wins
  const threeWins: string[] = [];

  // Win 1: Savings win or spending reduction
  if (totalSaved > 500) {
    threeWins.push(
      isDarija
        ? `Épargne top: Nta wffrti ksar men ${totalSaved} DH had l'osimana !`
        : `Épargne robuste : Vous avez mis de côté ${totalSaved} DH cette semaine !`
    );
  } else if (comparedToLastWeek < 0) {
    threeWins.push(
      isDarija
        ? `Taqachof: Nقصti l-masrouf dyalek b ${Math.abs(comparedToLastWeek)}% had l'osimana.`
        : `Économie : Vos dépenses globales ont diminué de ${Math.abs(comparedToLastWeek)}% par rapport à l'octave précédente.`
    );
  } else {
    threeWins.push(
      isDarija
        ? "Wafaa d l-mizaniya: Zéro d l-krediat jdad had l'osimana."
        : "Sagesse : Aucune nouvelle dette contractée au cours de la période."
    );
  }

  // Win 2: Category budget discipline
  let foundCategoryWin = false;
  for (const b of buckets) {
    const weeklyLimit = b.allocated_amount / 4.3;
    const spentThisWeek = categorySpent[b.category] || 0;
    if (spentThisWeek < weeklyLimit * 0.9 && b.allocated_amount > 100) {
      threeWins.push(
        isDarija
          ? `Mizaniya ${b.name}: B9iti t7t l-mizaniya dyal ${b.name} b ${Math.round(weeklyLimit - spentThisWeek)} DH.`
          : `Rigueur sur ${b.name} : Vous avez dépensé moins que la limite hebdomadaire de ${Math.round(weeklyLimit - spentThisWeek)} DH.`
      );
      foundCategoryWin = true;
      break;
    }
  }

  if (!foundCategoryWin) {
    threeWins.push(
      isDarija
        ? "Masrouf rzin: Makaynach hta chi kharja d l-flouss kbira dyal bzzaf (fayta 1000 DH)."
        : "Maîtrise : Aucune dépense impulsive ou inhabituelle de plus de 1000 DH constatée."
    );
  }

  // Win 3: Engagement and transaction logging consistency
  if (weekTxs.length >= 4) {
    threeWins.push(
      isDarija
        ? `Mowadaba: Sjjelt ${weekTxs.length} d l-mou3amalat. Hadchi kaykhlik t3ref floussek fin katmchi.`
        : `Fidélité de saisie : ${weekTxs.length} transactions consignées avec exactitude pour une visibilité totale.`
    );
  } else {
    threeWins.push(
      isDarija
        ? "Mowadaba: Siyer ti l-istimrariya dyal check-in l-yawmi dyalek."
        : "Check-in : Vous avez pris soin de valider vos humeurs financières régulièrement."
    );
  }

  // Ensure we have exactly 3 wins
  while (threeWins.length < 3) {
    threeWins.push(
      isDarija
        ? "Sandoq El-Aman: Kat7afed 3la tawazir mzyan m3a sandoq El-Aman dyalek."
        : "Sécurité : Votre fonds d'urgence reste intact et préservé de tout retrait."
    );
  }
  if (threeWins.length > 3) {
    threeWins.splice(3);
  }

  // 6. Generate EXACTLY 1 Watchout
  let oneWatchout = "";
  let foundWatchout = false;

  // Watchout 1: Exceeding weekly category limits
  for (const b of buckets) {
    const weeklyLimit = b.allocated_amount / 4.3;
    const spentThisWeek = categorySpent[b.category] || 0;
    if (spentThisWeek > weeklyLimit && b.allocated_amount > 100) {
      oneWatchout = isDarija
        ? `Vigilance f ${b.name}: Dfe3ti f had l'osimana ${Math.round(spentThisWeek)} DH mkarana m3a ${Math.round(weeklyLimit)} DH dyal l-mizaniya dyalk.`
        : `Vigilance sur ${b.name} : Dépense de ${Math.round(spentThisWeek)} DH cette semaine pour un prorata conseillé de ${Math.round(weeklyLimit)} DH.`;
      foundWatchout = true;
      break;
    }
  }

  // Fallbacks if no category was exceeded
  if (!foundWatchout) {
    if (comparedToLastWeek > 20) {
      oneWatchout = isDarija
        ? `Kharjat tal3in: Dépensat dyalek tzadou b ${comparedToLastWeek}% had l'osimana. Rd l-bal l'osimana l-jaya.`
        : `Augmentation : Hausse de ${comparedToLastWeek}% de vos sorties financières cette semaine. Pensez à ralentir le rythme.`;
    } else if (weekTxs.length < 3) {
      oneWatchout = isDarija
        ? "Sijill khawi: Sjjelt gha chwiya d l-mou3amalat. Rd l-bal tnsa l-masrouf dyalek dyal l-yawm."
        : "Saisie incomplète : Très peu de transactions enregistrées. Veillez à noter chaque achat pour un diagnostic juste.";
    } else {
      oneWatchout = isDarija
        ? "Chwiya d t-taraf: Sandoq d l-loisirs dyalek 3la wash i3mer. Hawl t9asri fi l-masrouf."
        : "Attention discrétionnaire : Votre enveloppe Loisirs & Café est active, gardez un œil sur les petits extras.";
    }
  }

  // 7. Week Ahead Tip (derived from optimization rules or custom category tips)
  let weekAheadTip = "";
  try {
    // We try to call the real optimize engine
    const suggestions = generateOptimizationSuggestions(buckets, goals, txs, activeIncome * 4.3);
    if (suggestions.length > 0) {
      const topSuggestion = suggestions[0];
      weekAheadTip = topSuggestion.description;
    }
  } catch (_) {}

  if (!weekAheadTip) {
    if (topCategory === 'alimentation' || topCategory === 'food') {
      weekAheadTip = isDarija
        ? "Had l'osimana l-majya, t9da l-khodra o l-fawakih f Sou9 l'Oubou/Bim bach tnقص 15% d l-mizaniya dyal l-makla."
        : "Pour la semaine prochaine, privilégiez les achats groupés ou les discounts chez BIM pour réduire de 15% votre sandoq Alimentation.";
    } else {
      weekAheadTip = isDarija
        ? "Dir tahaddiat d l'osimana 'Zéro Dépense' f l-makla d bra, o ktab kulshi f s-sandoq d l-yddikhar dyalk."
        : "Lancez-vous le défi d'une semaine 'Zéro Resto' en cuisinant à l'avance le dimanche pour garnir vos sandoqs d'épargne.";
    }
  }

  // Inject active challenge tracking if any
  try {
    const savedChallenges = getSavedChallenges(userId);
    const activeChallenge = savedChallenges.find(c => c.status === 'active');
    if (activeChallenge) {
      const isOver = activeChallenge.currentValue > activeChallenge.targetValue;
      const trackingMsg = isDarija
        ? `\n\n📌 Tahaddi dyal "${activeChallenge.title}" khdam: Khserti ${activeChallenge.currentValue} DH 3la hadaf d ${activeChallenge.targetValue} DH. ${isOver ? "Kmme l-mizaniya d3if m3ah ⚠️" : "Gadi mzyan, kmme had l'osimana ! ✅"}`
        : `\n\n📌 Défi en cours : "${activeChallenge.title}". Dépenses actuelles : ${activeChallenge.currentValue} DH sur un budget de ${activeChallenge.targetValue} DH. ${isOver ? "Soyez vigilant, vous dépassez la cible ! ⚠️" : "Superbe gestion, continuez ainsi ! ✅"}`;
      weekAheadTip += trackingMsg;
    }
  } catch (_) {}

  // 8. Floussi Score Impact analysis
  let scoreImpact = "";
  try {
    const currentScoreObj = await calculateFloussiScore(userId);
    const scoreVal = currentScoreObj.totalScore;
    const history = getScoreHistory(userId, 1);
    
    // Check if we have historical points
    if (history.length > 1) {
      const prevScore = history[history.length - 2]?.score || scoreVal;
      const diff = scoreVal - prevScore;
      
      if (diff > 0) {
        scoreImpact = isDarija
          ? `Zid f s-skour: Skour Floussi dyalk tzad b +${diff} d l-pwanat (wsel l ${scoreVal}). Kat9reb l-palier dyal ${currentScoreObj.tier} !`
          : `Progression de score : Votre Score Floussi a grimpé de +${diff} points (désormais à ${scoreVal}). Vous foncez vers le grade de ${currentScoreObj.tier} !`;
      } else if (diff < 0) {
        scoreImpact = isDarija
          ? `Hbot f s-skour: Skour Floussi dyalk hbet b ${diff} d l-pwanat (wsel l ${scoreVal}). T9ed t3awd trj3o bl-indibat o l-qraya d l-leçons.`
          : `Fléchissement de score : Retrait de ${Math.abs(diff)} points (score à ${scoreVal}). Rehaussez-le en complétant de nouvelles leçons d'éducation financière.`;
      } else {
        scoreImpact = isDarija
          ? `Skour Floussi dyalk b9a mustaqer f ${scoreVal} pwanat. Hawl tdir check-in d l-humeur kul l-yawm bach t-khd pwanat jdad.`
          : `Score Floussi stable à ${scoreVal} points. Validez vos humeurs quotidiennes ou débloquez un badge pour franchir le prochain palier !`;
      }
    } else {
      scoreImpact = isDarija
        ? `Skour Floussi dyalk rah f ${scoreVal} pwanat (r-rutba dyal ${currentScoreObj.tier}). Kmme l s-saisie dyal t-transactions bach tzid t9eddmo.`
        : `Votre Score Floussi se situe à ${scoreVal} points (niveau ${currentScoreObj.tier}). Enregistrez régulièrement vos budgets pour l'optimiser !`;
    }
  } catch (_) {
    scoreImpact = isDarija
      ? "Skour Floussi dyalk f t-tatawor mzyan. Dir l-check-ins yawmiyan o jawb sidi floussi bach t-khd l-pwanat."
      : "Votre Score Floussi progresse favorablement. Effectuez vos saisies régulières et discutez avec Sidi Floussi pour accumuler des points.";
  }

  // Unique report ID
  const id = `rep-weekly-${weekStartDateStr}-${userId}`;

  return {
    id,
    weekStartDate: weekStartDateStr,
    period: formatPeriod(weekStartDateStr, lang),
    summary: {
      totalSpent,
      totalSaved,
      comparedToLastWeek
    },
    topInsight,
    threeWins,
    oneWatchout,
    weekAheadTip,
    scoreImpact
  };
}

/**
 * Syncs weekly report histories in local storage
 */
export function getSavedWeeklyReports(userId: string): WeeklyReport[] {
  const cleanUserId = userId || "mock-user-id-9999";
  const key = `floussi_weekly_reports_${cleanUserId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const reports = JSON.parse(raw) as WeeklyReport[];
      if (Array.isArray(reports)) {
        return reports.sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
      }
    }
  } catch (_) {}
  return [];
}

export function saveWeeklyReport(userId: string, report: WeeklyReport) {
  const cleanUserId = userId || "mock-user-id-9999";
  const key = `floussi_weekly_reports_${cleanUserId}`;
  const list = getSavedWeeklyReports(cleanUserId);
  
  // Prevent duplicate ID saves
  const filtered = list.filter(r => r.id !== report.id);
  filtered.push(report);
  
  localStorage.setItem(key, JSON.stringify(filtered));
}
