import { Transaction } from '../types';

export interface Anomaly {
  id: string;
  type: 'duplicate' | 'category_mismatch' | 'spending_spike';
  severity: 'info' | 'warning' | 'danger';
  message: string;
  transactionId: string;
  suggestedCorrection?: {
    category?: string;
    amount?: number;
  };
}

// Map merchants to their expected standard categories
const MERCHANT_CATEGORY_MAP: Record<string, string[]> = {
  marjane: ['food', 'alimentation'],
  bim: ['food', 'alimentation'],
  carrefour: ['food', 'alimentation'],
  atacadao: ['food', 'alimentation'],
  aswak: ['food', 'alimentation'],
  lydec: ['housing', 'logement', 'factures'],
  redal: ['housing', 'logement', 'factures'],
  amendis: ['housing', 'logement', 'factures'],
  iam: ['telecom'],
  'maroc telecom': ['telecom'],
  orange: ['telecom'],
  inwi: ['telecom'],
  afriquia: ['transport'],
  total: ['transport'],
  shell: ['transport'],
  oncf: ['transport'],
  tramway: ['transport'],
  glovo: ['food', 'alimentation', 'loisirs'],
  shein: ['shopping', 'loisirs', 'autres'],
  decathlon: ['loisirs', 'autres']
};

/**
 * Runs rule-based anomaly detection algorithms on user transactions
 */
export function detectAllAnomalies(
  transactions: Transaction[],
  lang: 'fr' | 'darija' = 'fr'
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const sortedTxs = [...transactions].sort(
    (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  );

  // Group transactions for historical category averages (90 days)
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const recentExpenses = sortedTxs.filter(
    t => t.type === 'expense' && new Date(t.transaction_date) >= ninetyDaysAgo
  );

  // Calculate category averages
  const categoryStats: Record<string, { sum: number; count: number }> = {};
  recentExpenses.forEach(t => {
    if (!categoryStats[t.category]) {
      categoryStats[t.category] = { sum: 0, count: 0 };
    }
    categoryStats[t.category].sum += t.amount;
    categoryStats[t.category].count += 1;
  });

  const categoryAverages: Record<string, number> = {};
  Object.keys(categoryStats).forEach(cat => {
    categoryAverages[cat] = categoryStats[cat].sum / categoryStats[cat].count;
  });

  // Let's sweep and check each transaction
  for (let i = 0; i < sortedTxs.length; i++) {
    const tx = sortedTxs[i];
    if (tx.type !== 'expense') continue;

    const txDate = new Date(tx.transaction_date);

    // --- 1. DUPLICATE DETECTION (Same amount + same merchant within 24h) ---
    for (let j = i + 1; j < sortedTxs.length; j++) {
      const other = sortedTxs[j];
      if (other.type !== 'expense' || other.id === tx.id) continue;

      const otherDate = new Date(other.transaction_date);
      const timeDiffHours = Math.abs(txDate.getTime() - otherDate.getTime()) / (1000 * 60 * 60);

      if (
        timeDiffHours <= 24 &&
        tx.amount === other.amount &&
        tx.merchant &&
        other.merchant &&
        tx.merchant.toLowerCase().trim() === other.merchant.toLowerCase().trim()
      ) {
        const message = lang === 'darija'
          ? `Ghaliban kyn ghlat dyal t-tekrari ! Zoj l-mouwamalat dyal ${tx.amount} DH f nefss l'weqt 3nd "${tx.merchant}".`
          : `Risque de doublon ! Deux transactions identiques de ${tx.amount} DH enregistrées en moins de 24h chez "${tx.merchant}".`;

        anomalies.push({
          id: `dup-${tx.id}-${other.id}`,
          type: 'duplicate',
          severity: 'warning',
          message,
          transactionId: tx.id
        });
        break; // Only trigger once per transaction pair
      }
    }

    // --- 2. CATEGORY MISMATCH DETECTION (Merchant Category Incoherence) ---
    if (tx.merchant) {
      const merchLower = tx.merchant.toLowerCase().trim();
      let matchedMerchantKey = "";
      
      // Find matching merchant key
      for (const key of Object.keys(MERCHANT_CATEGORY_MAP)) {
        if (merchLower.includes(key)) {
          matchedMerchantKey = key;
          break;
        }
      }

      if (matchedMerchantKey) {
        const expectedCats = MERCHANT_CATEGORY_MAP[matchedMerchantKey];
        const currentCatLower = tx.category.toLowerCase().trim();
        
        // If current category does not overlap with expected categories
        const isMatched = expectedCats.some(expected => 
          currentCatLower.includes(expected) || expected.includes(currentCatLower)
        );

        if (!isMatched) {
          const suggested = expectedCats[0];
          const message = lang === 'darija'
            ? `Incohérence category ! Khdemti l-catégorie "${tx.category}" l moussajal d "${tx.merchant}", normallment khass t-koun f "${suggested}".`
            : `Catégorie suspecte ! Vous avez classé "${tx.merchant}" sous "${tx.category}". Sidi Floussi conseille de le mettre sous "${suggested}".`;

          anomalies.push({
            id: `mismatch-${tx.id}`,
            type: 'category_mismatch',
            severity: 'info',
            message,
            transactionId: tx.id,
            suggestedCorrection: { category: suggested }
          });
        }
      }
    }

    // --- 3. UNUSUAL SPIKE DETECTION (Transaction > 3x Average on category over 90 days) ---
    const catAvg = categoryAverages[tx.category];
    // Ignore small transactions under 150 DH to avoid spamming alerts on 30 DH cafés
    if (catAvg && tx.amount > 150 && tx.amount > catAvg * 3) {
      const message = lang === 'darija'
        ? `Khraja kharija 3la l'3ada ! L-mouwamala dial ${tx.amount} DH f "${tx.category}" kter b 3 d l'merrat m l-mou3addal dyalek (${Math.round(catAvg)} DH).`
        : `Dépense inhabituelle ! Votre achat de ${tx.amount} DH dans la catégorie "${tx.category}" est 3 fois supérieur à votre moyenne de ${Math.round(catAvg)} DH.`;

      anomalies.push({
        id: `spike-${tx.id}`,
        type: 'spending_spike',
        severity: 'danger',
        message,
        transactionId: tx.id
      });
    }
  }

  return anomalies;
}
