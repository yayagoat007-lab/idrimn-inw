/**
 * Validates the discrepancy between the OCR-scanned amount and manual corrections.
 * Flags warnings if the variance exceeds 5%.
 */
export function validateAmount(
  ocrAmount: number,
  manualAmount: number,
  lang: 'fr' | 'darija' = 'fr'
): {
  isValid: boolean;
  discrepancyPercent: number;
  warning?: string;
} {
  if (ocrAmount <= 0) {
    return { isValid: true, discrepancyPercent: 0 };
  }

  const diff = Math.abs(ocrAmount - manualAmount);
  const discrepancyPercent = (diff / ocrAmount) * 100;

  if (discrepancyPercent > 5) {
    const roundedPercent = Math.round(discrepancyPercent);
    const warningFr = `Écart important détecté (${roundedPercent}% de différence). Le montant numérisé était de ${ocrAmount} DH, mais vous avez saisi ${manualAmount} DH.`;
    const warningDarija = `Kayn far9 kbir (${roundedPercent}% dyal l-far9). L-montant m s-scan kan ${ocrAmount} DH, walakin dkhalti ${manualAmount} DH.`;

    return {
      isValid: false,
      discrepancyPercent,
      warning: lang === 'darija' ? warningDarija : warningFr
    };
  }

  return {
    isValid: true,
    discrepancyPercent
  };
}

/**
 * Checks if the receipt is older than 7 days, which is critical for real-time Moroccan expense tracking.
 */
export function validateDate(
  receiptDateStr: string,
  lang: 'fr' | 'darija' = 'fr'
): {
  isValid: boolean;
  warning?: string;
} {
  try {
    const receiptDate = new Date(receiptDateStr);
    const now = new Date();
    
    // Set both to midnight to only compare day difference
    receiptDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(now.getTime() - receiptDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      const warningFr = `Reçu ancien (${diffDays} jours d'ancienneté). Ajouter des transactions trop anciennes peut fausser vos calculs de sandoqs du mois en cours.`;
      const warningDarija = `Reçu 9dim b ${diffDays} khre dyal l-ayam. Ghadi t-ghlet l-hsabat dyal sandoq dyal had chhar.`;

      return {
        isValid: false,
        warning: lang === 'darija' ? warningDarija : warningFr
      };
    }
  } catch (_) {}

  return {
    isValid: true
  };
}
