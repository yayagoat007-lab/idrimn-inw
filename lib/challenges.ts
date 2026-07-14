import { Challenge, Transaction } from '../types';

/**
 * Calculates the current user progress value for a given challenge.
 *
 * @param challenge The challenge details
 * @param transactions All user transactions
 * @param goalContributions All goal contribution logs
 * @returns number represents the current progress
 */
export function calculateChallengeProgress(
  challenge: Challenge,
  transactions: Transaction[] = [],
  goalContributions: any[] = []
): number {
  const challengeStart = new Date(challenge.startDate);
  const challengeEnd = new Date(challenge.endDate);

  // Filter transactions within the challenge dates
  const relevantTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.transaction_date || tx.created_at);
    return txDate >= challengeStart && txDate <= challengeEnd;
  });

  if (challenge.type === 'savings') {
    // 1. Sum up all savings transactions or direct goal contributions
    const txSavings = relevantTransactions
      .filter((tx) => tx.category === 'savings' || tx.tags.includes('épargne'))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const logSavings = goalContributions
      .filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= challengeStart && logDate <= challengeEnd;
      })
      .reduce((sum, log) => sum + log.amount, 0);

    return Math.max(txSavings, logSavings);
  }

  if (challenge.type === 'no_spend') {
    // 2. Count of days in the challenge window with zero expenses in non-essential food/cafes/leisure
    const totalDays = Math.max(1, Math.ceil((challengeEnd.getTime() - challengeStart.getTime()) / (1000 * 3600 * 24)));
    
    const spentDays = new Set<string>();
    relevantTransactions.forEach((tx) => {
      const desc = tx.description.toLowerCase();
      const isFastFoodOrCafe = 
        tx.category === 'leisure' || 
        desc.includes('café') || 
        desc.includes('cafe') || 
        desc.includes('fast-food') || 
        desc.includes('mcdo') || 
        desc.includes('starbucks') || 
        desc.includes('kfc') || 
        desc.includes('burger');

      if (tx.type === 'expense' && isFastFoodOrCafe) {
        const dayStr = new Date(tx.transaction_date || tx.created_at).toISOString().split('T')[0];
        spentDays.add(dayStr);
      }
    });

    // Progress is the number of "no-spend" days
    const noSpendDays = Math.max(0, totalDays - spentDays.size);
    return Math.min(challenge.targetValue, noSpendDays);
  }

  if (challenge.type === 'ocr_scan') {
    // 3. Count how many transactions have an OCR tag or non-null receipt_url
    const count = relevantTransactions.filter((tx) => 
      tx.receipt_url !== null || 
      tx.tags.includes('ocr') || 
      tx.tags.includes('receipt') || 
      tx.tags.includes('scan')
    ).length;

    return count;
  }

  return 0;
}
