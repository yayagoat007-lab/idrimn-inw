/**
 * Account Anniversary Logic for Floussi
 * Helps calculate and build dynamic, stats-driven celebration summaries.
 */

export interface AnniversarySummaryContent {
  title: string;
  message: string;
  highlightStat: string;
}

export interface AnniversarySummary {
  fr: AnniversarySummaryContent;
  darija: AnniversarySummaryContent;
  yearsCount: number;
}

/**
 * Get number of years elapsed since the account creation date
 */
export function getYearsSinceCreation(createdAt: string): number {
  if (!createdAt) return 0;
  try {
    const createdDate = new Date(createdAt);
    const today = new Date();
    
    let years = today.getFullYear() - createdDate.getFullYear();
    
    // Adjust if current date is before anniversary date in the current year
    const monthDiff = today.getMonth() - createdDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < createdDate.getDate())) {
      years--;
    }
    
    return Math.max(0, years);
  } catch (err) {
    console.error("Error computing years since creation", err);
    return 0;
  }
}

/**
 * Checks if today is the anniversary of the user's account creation.
 * Compares only month and day, and verifies that at least one full year has passed.
 */
export function isAnniversaryToday(createdAt: string): boolean {
  if (!createdAt) return false;
  try {
    const createdDate = new Date(createdAt);
    const today = new Date();
    
    // Must be at least 1 year old to have an anniversary celebration
    const years = getYearsSinceCreation(createdAt);
    if (years < 1) return false;
    
    return (
      createdDate.getDate() === today.getDate() &&
      createdDate.getMonth() === today.getMonth()
    );
  } catch (err) {
    console.error("Error checking anniversary", err);
    return false;
  }
}

/**
 * Generate a dynamic summary of user accomplishments to celebrate their anniversary.
 */
export function generateAnniversarySummary(
  createdAt: string,
  allTimeStats: {
    totalTransactions: number;
    totalSaved: number;
    goalsCompleted: number;
    badgesUnlocked: number;
    currentLevel: string;
  }
): AnniversarySummary {
  const yearsCount = getYearsSinceCreation(createdAt);
  const { totalTransactions, totalSaved, goalsCompleted, badgesUnlocked, currentLevel } = allTimeStats;

  // Formatting large numbers elegantly
  const formattedSaved = totalSaved.toLocaleString('fr-FR');

  // French version
  const titleFr = yearsCount === 1 
    ? "🎉 Joyeux 1er anniversaire Floussi !" 
    : `🎉 Joyeux ${yearsCount}ème anniversaire Floussi !`;
    
  const messageFr = `Déjà ${yearsCount} ${yearsCount === 1 ? 'an' : 'ans'} que nous bâtissons ensemble ta liberté financière au Maroc ! 🇲🇦 Depuis ton inscription, tu as été incroyable. Tu as enregistré pas moins de ${totalTransactions} transactions, complété ${goalsCompleted} objectifs de vie majeurs, débloqué ${badgesUnlocked} badges d'excellence, et atteint le niveau « ${currentLevel} ».`;
  
  const highlightStatFr = `${formattedSaved} DH épargnés à ce jour 💰`;

  // Darija version
  const titleDarija = yearsCount === 1
    ? "🎉 3id milad sa3id m3a Floussi (1 Sanah) !"
    : `🎉 3id milad sa3id m3a Floussi (${yearsCount} Sawat) !`;

  const messageDarija = `Hadi t-kemlat ${yearsCount} ${yearsCount === 1 ? '3am' : 'snin'} o 7na msafrin m3a ba3dyatna f triq l-istisla7 l-mali f l-Maroc ! 🇲🇦 Men nhar ssejjelti, drti khedma kbira b-zaf. Ssejjelti ktr men ${totalTransactions} l-masarif, wsalti l ${goalsCompleted} d-l-ahdaf l-maliya d-l-khalas, jm3ti ${badgesUnlocked} badjat, o rbe7ti l-mostawa d-« ${currentLevel} ».`;

  const highlightStatDarija = `${formattedSaved} DH t-khbat f l-majmou3 💰`;

  return {
    fr: {
      title: titleFr,
      message: messageFr,
      highlightStat: highlightStatFr
    },
    darija: {
      title: titleDarija,
      message: messageDarija,
      highlightStat: highlightStatDarija
    },
    yearsCount
  };
}
