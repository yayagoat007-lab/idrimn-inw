/**
 * Calculates the roundup savings for a transaction amount given a threshold.
 * Example: 47.50 DH with a threshold of 10 DH rounds up to 50.00 DH (+2.50 DH).
 * Example: 12.00 DH with a threshold of 5 DH rounds up to 15.00 DH (+3.00 DH).
 */
export function calculateRoundUp(transactionAmount: number, threshold: number): number {
  if (transactionAmount <= 0 || !threshold) return 0;
  
  const nextMultiple = Math.ceil(transactionAmount / threshold) * threshold;
  const diff = nextMultiple - transactionAmount;
  
  // Return rounded to 2 decimal places to prevent float errors
  return Math.max(0, Math.round(diff * 100) / 100);
}
