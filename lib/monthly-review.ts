import { Transaction, Bucket, Goal, MoroccanEvent } from '../types';
import { calculateFloussiScore, getScoreHistory } from './floussi-score';

export interface MonthlyReviewChapter {
  title: string;
  text: string;
}

export interface MonthlyReview {
  id: string;
  month: string; // YYYY-MM
  monthName: string; // e.g. "Juillet 2026"
  openingMessage: string;
  moneyFlowChapter: {
    title: string;
    text: string;
    totalIncome: number;
    totalSpent: number;
    totalSaved: number;
    savingsRate: number;
    categoriesBreakdown: { category: string; amount: number; percentage: number }[];
  };
  goalsChapter: {
    title: string;
    text: string;
    goals: { name: string; target: number; current: number; progress: number }[];
  };
  scoreChapter: {
    title: string;
    text: string;
    startScore: number;
    endScore: number;
    scoreDiff: number;
    tier: string;
  };
  lookAheadChapter: {
    title: string;
    text: string;
    upcomingEvents: { name: string; date: string; daysLeft: number }[];
    tips: string[];
  };
  feedbackResponse?: string; // Saved user priority choice
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
  'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
];

/**
 * Generates an automated, highly personalized Monthly Review for the user
 */
export async function generateMonthlyReview(
  userId: string = "mock-user-id-9999",
  monthStr: string, // YYYY-MM
  lang: 'fr' | 'darija' = 'fr'
): Promise<MonthlyReview> {
  const isDarija = lang === 'darija';
  
  // 1. Fetch real tables from local storage
  let txs: Transaction[] = [];
  let buckets: Bucket[] = [];
  let goals: Goal[] = [];
  let events: MoroccanEvent[] = [];
  
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

  try {
    const rawEvents = localStorage.getItem('floussi_table_events') || localStorage.getItem('moroccan_events');
    if (rawEvents) events = JSON.parse(rawEvents);
  } catch (_) {}

  // Parse Month
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr);
  const monthIndex = parseInt(monthNumStr) - 1;

  const monthName = isDarija 
    ? `${MONTHS_AR[monthIndex]} ${year}`
    : `${MONTHS_FR[monthIndex]} ${year}`;

  // Filter transactions for this month
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59);

  const monthTxs = txs.filter(t => {
    const d = new Date(t.transaction_date);
    return d >= monthStart && d <= monthEnd;
  });

  // Filter transactions for previous month
  const prevMonthStart = new Date(year, monthIndex - 1, 1);
  const prevMonthEnd = new Date(year, monthIndex, 0, 23, 59, 59);

  const prevMonthTxs = txs.filter(t => {
    const d = new Date(t.transaction_date);
    return d >= prevMonthStart && d <= prevMonthEnd;
  });

  // 2. Money Flow Statistics
  const totalSpent = monthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncomeReal = monthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  let defaultMonthlyIncome = 13000;
  try {
    const rawProfile = localStorage.getItem('user_profile') || localStorage.getItem('floussi_table_profiles');
    if (rawProfile) {
      const profile = JSON.parse(rawProfile);
      if (profile.monthly_income) {
        defaultMonthlyIncome = Number(profile.monthly_income);
      }
    }
  } catch (_) {}

  const totalIncome = totalIncomeReal > 0 ? totalIncomeReal : defaultMonthlyIncome;
  const totalSaved = Math.max(0, totalIncome - totalSpent);
  const savingsRate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0;

  // Previous month comparison
  const prevSpent = prevMonthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const spentDiffPercent = prevSpent > 0 ? Math.round(((totalSpent - prevSpent) / prevSpent) * 100) : 0;

  // Category breakdown
  const categorySpent: Record<string, number> = {};
  monthTxs.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'autres';
    categorySpent[cat] = (categorySpent[cat] || 0) + t.amount;
  });

  const categoriesBreakdown = Object.entries(categorySpent)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategoryItem = categoriesBreakdown[0];

  // 3. Floussi Score Evolution
  let startScore = 350;
  let endScore = 350;
  let scoreTier = 'Discipliné';
  try {
    const currentScoreObj = await calculateFloussiScore(userId);
    endScore = currentScoreObj.totalScore;
    scoreTier = currentScoreObj.tier;

    // Fetch start score from score history (e.g. oldest from history or custom mock diff)
    const history = getScoreHistory(userId, 30);
    if (history.length > 1) {
      startScore = history[0].score;
    } else {
      // Mock some logical progress based on spent/saved ratio
      startScore = Math.max(100, endScore - (savingsRate > 20 ? 45 : 15));
    }
  } catch (_) {}

  const scoreDiff = endScore - startScore;

  // 4. Goals progress
  const activeGoals = goals.map(g => {
    const current = g.current_amount || 0;
    const target = g.target_amount || 1;
    const progress = Math.round((current / target) * 100);
    return {
      name: g.name,
      target,
      current,
      progress
    };
  });

  // 5. Moroccan Events lookahead
  const now = new Date();
  const upcomingEvents = events
    .map(e => {
      const target = new Date(e.start_date);
      const diffTime = target.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        name: e.name,
        date: e.start_date,
        daysLeft
      };
    })
    .filter(e => e.daysLeft > 0 && e.daysLeft <= 45)
    .slice(0, 2);

  // 6. Conversational Chapters generation
  
  // Chapter 0: Opening Message (Tone & Mood)
  let openingMessage = "";
  if (savingsRate >= 30) {
    openingMessage = isDarija
      ? `Salam a sidi! Lah ybarek, had l-chhar d ${monthName} fat ghzal bzzaf! Drbna fiha wahed l-yddikhar s7i7 d ${savingsRate}%. Sidi Floussi rah fkhour bik, rak gadi f triq d l-baraka o l-7orriya l-maliya!`
      : `Salam mon ami ! Magnifique mois de ${monthName} ! Nous avons atteint un taux d'épargne exceptionnel de ${savingsRate}%. Sidi Floussi est extrêmement fier de ton sérieux. Tu es en train de bâtir une vraie sécurité financière solide !`;
  } else if (savingsRate >= 10) {
    openingMessage = isDarija
      ? `Salam oualikoum! Chhar d ${monthName} daz mzyan o s-solde dyalk b9a fl-aman. Wffrti chwiya d l-flouss (${savingsRate}%) o s-siyer dyalk kan dki. Aji nchoufo l-kamal d l-arkam dyalk s-sana!`
      : `Salam ! Le mois de ${monthName} s'est achevé sur une note positive. Ton budget est resté équilibré et tu as mis de côté ${savingsRate}% de tes revenus. Une gestion saine et posée, c'est exactement la clé de la régularité !`;
  } else {
    openingMessage = isDarija
      ? `Salam a sidi. Chhar d ${monthName} kan chwiya s3eb m3a l-masrouf. Ma wffrtich bzzaf d l-flouss, walakin hadchi machi mochkila! Fin ma kan l-hbot, dima kat-koun forsa bach nt3almo o n-rejj3o l-baraka. Aji n-kellmo f had l-bilaan b-koul t-ti9a.`
      : `Salam mon ami. Le mois de ${monthName} a été un peu plus rude pour tes économies. L'épargne a été timide, mais garde le sourire ! C'est justement dans les mois difficiles qu'on apprend le plus. Analysons cela calmement et en toute confiance pour rebondir !`;
  }

  // Chapter 1: Money Flow
  let moneyFlowText = "";
  const totalSpentStr = `${totalSpent} DH`;
  const totalSavedStr = `${totalSaved} DH`;
  if (isDarija) {
    moneyFlowText = `L-masrouf l-kamel dyalek daz l ${totalSpentStr} m3a d-dkhla d ${totalIncome} DH. Hadchi khlla l-yddikhar yawsal l ${totalSavedStr}.\n\n`;
    if (topCategoryItem) {
      moneyFlowText += `Akbar blassa mchaw fiha l-flouss hya "${topCategoryItem.category}" b ${topCategoryItem.amount} DH (${topCategoryItem.percentage}% d l-kamel). `;
    }
    if (spentDiffPercent < 0) {
      moneyFlowText += `Mzyan bzzaf! Nقصti l-masrouf b ${Math.abs(spentDiffPercent)}% 3la chhar li fat! 🎉`;
    } else if (spentDiffPercent > 0) {
      moneyFlowText += `Rd l-bal! S-srf tzad b +${spentDiffPercent}% 3la chhar li fat. Hawl tzyer l-sandoq d l-loisirs l-chhar l-majya.`;
    }
  } else {
    moneyFlowText = `Ce mois-ci, tes entrées totales s'élèvent à ${totalIncome} DH pour des dépenses consolidées de ${totalSpentStr}. Tu as réussi à préserver ${totalSavedStr} de côté (soit un taux d'épargne de ${savingsRate}%).\n\n`;
    if (topCategoryItem) {
      moneyFlowText += `Ton premier pôle de dépenses a été **${topCategoryItem.category.toUpperCase()}** avec un montant de ${topCategoryItem.amount} DH, représentant ${topCategoryItem.percentage}% de tes charges mensuelles. `;
    }
    if (spentDiffPercent < 0) {
      moneyFlowText += `Félicitations ! Tes dépenses ont fondu de ${Math.abs(spentDiffPercent)}% par rapport au mois précédent. Une très belle victoire ! 📉`;
    } else if (spentDiffPercent > 0) {
      moneyFlowText += `Vigilance : tes dépenses ont augmenté de +${spentDiffPercent}% comparé au mois dernier. Essaye de repérer les petits extras évitables le mois prochain.`;
    }
  }

  // Chapter 2: Goals Chapter
  let goalsText = "";
  if (activeGoals.length > 0) {
    const highestProgress = activeGoals.sort((a, b) => b.progress - a.progress)[0];
    if (isDarija) {
      goalsText = `Kat-t7ada rassek bach tawsal l ${activeGoals.length} d l-ahdaf d l-yddikhar.\n\n`;
      goalsText += `Hada li l-foq huwa "${highestProgress.name}" li wssel l ${highestProgress.progress}% d l-hadaf dyalo! Tbarqallah 3lik. Kter men check-in l-yawmi ghadi y-khallik t-ghaddi sandoq d l-ahdaaf dyalk s-sri3.`;
    } else {
      goalsText = `Tu poursuis activement ${activeGoals.length} noble(s) objectif(s) de prévoyance.\n\n`;
      goalsText += `Ton projet le plus avancé est **${highestProgress.name}**, qui affiche désormais **${highestProgress.progress}%** de réalisation avec ${highestProgress.current} DH épargnés sur ${highestProgress.target} DH. Continue d'alimenter régulièrement tes sandoqs !`;
    }
  } else {
    goalsText = isDarija
      ? "L-an, ma3ndek hta chi hadaf d l-yddikhar m-sajjal. Bach d-dir t-tatawor, khassak d-dir chi hadaf d l-dhab oula d l-Omra! Aji n-karro chi hadaf s-sghir f l'application."
      : "Pour l'instant, aucun sandoq d'objectif d'épargne à long terme (comme l'Achat d'Or ou la préparation de l'Aïd) n'est actif. Fixer un cap clair est la meilleure façon d'éviter le gaspillage. Créez votre premier objectif dès aujourd'hui !";
  }

  // Chapter 3: Score Chapter
  let scoreText = "";
  if (scoreDiff > 0) {
    scoreText = isDarija
      ? `Skour Floussi dyalk rba7 +${scoreDiff} d l-pwanat had l-chhar! Daba nta f l-moustawa dyal ${endScore} PTS (Rutba: ${scoreTier}). Hadchi ja men l-mowadaba dyal check-in o r-ri3aya d l-mizaniat dyalk. Lah ykemmel bl-khir ! 🏆`
      : `Excellente dynamique ! Votre Score Floussi a bondi de **+${scoreDiff} points** ce mois-ci, atteignant un total de **${endScore} PTS** (Palier : **${scoreTier}**). Cette croissance valide ta régularité de saisie et ta discipline budgétaire ! 🏆`;
  } else if (scoreDiff < 0) {
    scoreText = isDarija
      ? `Had l-chhar skour dyalk hbet b ${scoreDiff} d l-pwanat (daba rje3 l ${endScore} PTS, Rutba: ${scoreTier}). Machi mochkila, ghir r-rj3 d l-mowadaba dyal s-saisies o l-9raya d l-akademya ghadi t-khlik t-tla3 t-tani s-skour.`
      : `Ton Score Floussi a accusé un léger repli de **${scoreDiff} points** ce mois-ci (actuellement à **${endScore} PTS**, Palier : **${scoreTier}**). Pas d'inquiétude, reprends simplement le réflexe de noter tes transactions quotidiennes et de lire nos fiches conseils pour rebondir !`;
  } else {
    scoreText = isDarija
      ? `Skour Floussi dyalk b9a mustaqer f ${endScore} PTS (Rutba: ${scoreTier}). Khassak d-dir chwiya d t-tahaddiat o d-jawab 3la sidi floussi bach t-khlas pwanat jdad o t-tla3 f r-rutbat!`
      : `Ton Score Floussi est resté stable à **${endScore} PTS** (Palier : **${scoreTier}**). Pour passer au niveau supérieur, relève des défis budgétaires hebdomadaires et réponds à nos quiz éducationnels !`;
  }

  // Chapter 4: Look Ahead
  let lookAheadText = "";
  const tips: string[] = [];
  if (isDarija) {
    lookAheadText = `Aji n-stajdo l-chhar l-majya! Had l-aw9at d s-sana, khassna n-rdo l-bal. `;
    if (upcomingEvents.length > 0) {
      lookAheadText += `Hna m9eblin 3la "${upcomingEvents[0].name}" f ${upcomingEvents[0].daysLeft} yawm. Khassak d-dir chwiya d l-baraka f sandoq khass biha. `;
    }
    lookAheadText += "Nasiha dyal Sidi Floussi: Ziyer l-masrouf d l-alimentation f l-bdaya d l-chhar, o sawet d-daret m3a s7abk bach t-mwell t-tahaddiat.";
    tips.push("R-mden sandoq Alimentation b +10% f l-mizaniya bac t-jri s-sfouf o l-khra.");
    tips.push("Hrem rassek men 2 kahwa d bra f s-simana o l-flouss dirha f sandoq l-dhab.");
  } else {
    lookAheadText = `Préparons ensemble le mois prochain pour maximiser vos chances de réussite ! `;
    if (upcomingEvents.length > 0) {
      lookAheadText += `L'événement **${upcomingEvents[0].name}** se profile dans ${upcomingEvents[0].daysLeft} jours. C'est l'opportunité parfaite de planifier une épargne dédiée pour éviter le stress de dernière minute. `;
    }
    lookAheadText += "Voici mes recommandations clés : anticipez vos achats essentiels dès les premiers jours du mois et réduisez les sorties impulsives du weekend.";
    tips.push("Abondance saine : Allouez 10% de moins à l'enveloppe Loisirs au profit de votre épargne active.");
    tips.push("Planification Maroc : Anticipez les coûts des grandes célébrations en créant dès maintenant un sandoq thématique.");
  }

  const id = `monthly-review-${monthStr}-${userId}`;

  return {
    id,
    month: monthStr,
    monthName,
    openingMessage,
    moneyFlowChapter: {
      title: isDarija ? "Douran d l-Flouss 💸" : "Flux Financiers du Mois 💸",
      text: moneyFlowText,
      totalIncome,
      totalSpent,
      totalSaved,
      savingsRate,
      categoriesBreakdown
    },
    goalsChapter: {
      title: isDarija ? "L-Ahdaaf dyalk 🎯" : "État de vos Objectifs 🎯",
      text: goalsText,
      goals: activeGoals
    },
    scoreChapter: {
      title: isDarija ? "Skour Floussi 📈" : "Évolution du Score Floussi 📈",
      text: scoreText,
      startScore,
      endScore,
      scoreDiff,
      tier: scoreTier
    },
    lookAheadChapter: {
      title: isDarija ? "Siyer l-Majya 🔮" : "Anticipation & Opportunités 🔮",
      text: lookAheadText,
      upcomingEvents,
      tips
    }
  };
}

/**
 * Saves completed monthly review details in local storage
 */
export function getSavedMonthlyReviews(userId: string): MonthlyReview[] {
  const cleanUserId = userId || "mock-user-id-9999";
  const key = `floussi_monthly_reviews_${cleanUserId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const reviews = JSON.parse(raw);
      if (Array.isArray(reviews)) {
        return reviews;
      }
    }
  } catch (_) {}
  return [];
}

export function saveMonthlyReview(userId: string, review: MonthlyReview) {
  const cleanUserId = userId || "mock-user-id-9999";
  const key = `floussi_monthly_reviews_${cleanUserId}`;
  const list = getSavedMonthlyReviews(cleanUserId);
  
  const filtered = list.filter(r => r.id !== review.id);
  filtered.push(review);
  
  localStorage.setItem(key, JSON.stringify(filtered));
}
