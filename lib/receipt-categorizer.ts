import { LineItem } from './receipt-parser';

// Rich keyword mapping to standard Moroccan wallet categories
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  alimentation: [
    'lait', 'pain', 'riz', 'huile', 'sucre', 'tomate', 'poulet', 'oeuf', 'viande',
    'poisson', 'sardine', 'farine', 'semoule', 'couscous', 'eau', 'jus', 'yaourt',
    'fromage', 'beurre', 'the', 'ataye', 'chocolat', 'biscuit', 'chips', 'legume',
    'fruit', 'pate', 'sauce', 'cafe', 'epicerie', 'supermarch', 'hanout'
  ],
  hygiene: [
    'shampoing', 'dentifrice', 'savon', 'couches', 'brosse', 'douche', 'parfum',
    'creme', 'serviette', 'pansement', 'medicament', 'doliprane', 'pharmacie',
    'gel', 'deodorant', 'rasoir'
  ],
  logement: [
    'lessive', 'eponge', 'sac_poubelle', 'detergent', 'papier', 'essuie', 'pile',
    'ampoule', 'lydec', 'redal', 'amendis', 'facture', 'gaz', 'nettoyage', 'chaise',
    'table', 'cuisine', 'ampoule'
  ],
  transport: [
    'essence', 'gasoil', 'afriquia', 'shell', 'total', 'oncf', 'tramway', 'autoroute',
    'peage', 'taxi', 'carburant', 'station', 'pneu'
  ],
  telecom: [
    'iam', 'orange', 'inwi', 'recharge', 'forfait', 'internet', 'telephon'
  ],
  loisirs: [
    'cinema', 'restaurant', 'decathlon', 'sport', 'jeu', 'glovo', 'voyage',
    'hotel', 'shein', 'café', 'cafe', 'patisserie', 'crepe', 'pizza', 'fast'
  ],
  education: [
    'ecole', 'livre', 'stylo', 'cahier', 'scolarite', 'inscription', 'fourniture',
    'maternelle', 'creche'
  ]
};

/**
 * Categorizes a single item name by looking up keywords
 */
export function categorizeLineItem(itemName: string): string {
  const cleanName = itemName.toLowerCase().trim();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (cleanName.includes(keyword)) {
        return category;
      }
    }
  }

  return 'autres';
}

export interface CategorySplit {
  category: string;
  totalForCategory: number;
  percentage: number;
  items: LineItem[];
}

/**
 * Parses multiple line items and aggregates them by category.
 * Used to propose automatically splitting a receipt transaction over multiple buckets.
 */
export function categorizeReceipt(lineItems: LineItem[]): CategorySplit[] {
  const categoryMap: Record<string, { total: number; items: LineItem[] }> = {};

  let overallTotal = 0;

  for (const item of lineItems) {
    const category = categorizeLineItem(item.name);
    const cost = item.quantity * item.unitPrice;
    const finalCost = item.isPromo && cost > 0 ? -cost : cost; // promotional items reduce category expense

    overallTotal += finalCost;

    if (!categoryMap[category]) {
      categoryMap[category] = { total: 0, items: [] };
    }

    categoryMap[category].total += finalCost;
    categoryMap[category].items.push(item);
  }

  return Object.entries(categoryMap)
    .map(([category, data]) => {
      // Ensure positive values or absolute representation
      const totalForCategory = Math.max(0, Math.round(data.total * 100) / 100);
      const percentage = overallTotal > 0 ? Math.round((totalForCategory / overallTotal) * 100) : 0;
      return {
        category,
        totalForCategory,
        percentage,
        items: data.items
      };
    })
    .filter(split => split.totalForCategory > 0)
    .sort((a, b) => b.totalForCategory - a.totalForCategory);
}
