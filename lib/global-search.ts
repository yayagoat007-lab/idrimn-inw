import { OfflineDB } from './offline-db';
import { ACADEMY_MODULES } from './academy-content';
import { SEED_POSTS } from './community-seed-data';
import { Transaction, Bucket, Goal, Tontine, NetWorthItem, CommunityPost } from '../types';

export interface SearchableItem {
  id: string;
  type: 'transaction' | 'bucket' | 'goal' | 'tontine' | 'networth' | 'community_post' | 'academy_lesson' | 'action';
  title: string;
  subtitle: string;
  matchText: string;
  navigationTarget: string;
  icon: string;
  amount?: number;
  category?: string;
  date?: string;
}

const QUICK_ACTIONS: { keywords: string[]; item: SearchableItem }[] = [
  {
    keywords: ["ajouter", "nouvelle", "depense", "dépense", "add", "transaction", "nouveau", "reçu", "achat", "pay"],
    item: {
      id: "action-add-transaction",
      type: "action",
      title: "Ajouter une transaction",
      subtitle: "Saisir une nouvelle dépense ou un nouveau revenu d'argent",
      matchText: "ajouter nouvelle dépense ajouter une transaction d'argent revenu cash carte credit payement",
      navigationTarget: "action:add-transaction",
      icon: "PlusCircle"
    }
  },
  {
    keywords: ["wallet", "solde", "compte", "jibi", "carte", "flous", "porte-monnaie", "portefeuille"],
    item: {
      id: "action-view-wallet",
      type: "action",
      title: "Voir mon Wallet",
      subtitle: "Consulter mes comptes et mon solde global",
      matchText: "wallet solde voir mon wallet comptes banque cih barid cash jibi",
      navigationTarget: "wallet",
      icon: "Wallet"
    }
  },
  {
    keywords: ["sidi", "conseil", "ai", "chat", "bot", "parler", "intelligence", "demander", "robot"],
    item: {
      id: "action-talk-sidi",
      type: "action",
      title: "Parler à Sidi",
      subtitle: "Discuter avec l'assistant financier intelligent Floussi",
      matchText: "sidi parler à sidi assistant virtuel intelligence artificielle chat bot conseils financier robot",
      navigationTarget: "action:talk-sidi",
      icon: "Bot"
    }
  },
  {
    keywords: ["objectif", "goal", "epargne", "safar", "projet", "nouvel", "omra", "hajj", "cible", "épargne"],
    item: {
      id: "action-add-goal",
      type: "action",
      title: "Nouvel objectif",
      subtitle: "Créer un nouveau projet d'épargne (Mariage, Omra, Hajj, etc.)",
      matchText: "objectif nouvel objectif épargne projet d'épargne mariage omra hajj achat d'or target goal",
      navigationTarget: "action:add-goal",
      icon: "Target"
    }
  }
];

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Builds a search index with all the user's data from IndexedDB and localStorage.
 */
export async function buildSearchIndex(userId: string): Promise<SearchableItem[]> {
  const index: SearchableItem[] = [];

  try {
    // 1. Transactions
    const txs = (await OfflineDB.get<Transaction[]>('transactions')) || [];
    const filteredTxs = txs.filter(t => t.user_id === userId);
    filteredTxs.forEach(tx => {
      const tagsStr = (tx.tags || []).join(' ');
      index.push({
        id: tx.id,
        type: 'transaction',
        title: tx.description || tx.merchant || "Transaction sans description",
        subtitle: `${tx.type === 'expense' ? '-' : '+'}${tx.amount} DH • ${tx.category || 'Sans catégorie'} • ${tx.transaction_date}`,
        matchText: `${tx.description || ''} ${tx.merchant || ''} ${tx.category || ''} ${tagsStr} ${tx.amount} ${tx.type || ''}`,
        navigationTarget: 'transactions',
        icon: 'Receipt',
        amount: tx.amount,
        category: tx.category,
        date: tx.transaction_date
      });
    });

    // 2. Buckets
    const buckets = (await OfflineDB.get<Bucket[]>('buckets')) || [];
    const filteredBuckets = buckets.filter(b => b.user_id === userId && !b.is_archived);
    filteredBuckets.forEach(b => {
      const rest = b.allocated_amount - b.spent_amount;
      index.push({
        id: b.id,
        type: 'bucket',
        title: b.name,
        subtitle: `Alloué: ${b.allocated_amount} DH • Reste: ${rest} DH`,
        matchText: `${b.name} ${b.category || ''} bucket enveloppe ${b.is_essential ? 'essentiel' : ''}`,
        navigationTarget: 'buckets',
        icon: 'Layers'
      });
    });

    // 3. Goals
    const goals = (await OfflineDB.get<Goal[]>('goals')) || [];
    const filteredGoals = goals.filter(g => g.user_id === userId);
    filteredGoals.forEach(g => {
      const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
      index.push({
        id: g.id,
        type: 'goal',
        title: g.name,
        subtitle: `${g.current_amount} / ${g.target_amount} DH (${pct}%) • Échéance: ${g.deadline || 'Sans date'}`,
        matchText: `${g.name} goal objectif épargne safar omra hajj`,
        navigationTarget: 'goals',
        icon: 'Target'
      });
    });

    // 4. Tontines (Jmâa / Daret)
    const tontines = (await OfflineDB.get<Tontine[]>('tontines')) || [];
    const filteredTontines = tontines.filter(t => t.creator_id === userId);
    filteredTontines.forEach(t => {
      index.push({
        id: t.id,
        type: 'tontine',
        title: t.name,
        subtitle: `Cotisation: ${t.contribution_amount} DH • ${t.total_members} membres • Statut: ${t.status}`,
        matchText: `${t.name} ${t.description || ''} tontine daret jmaa jmâa solidarité`,
        navigationTarget: 'tontine',
        icon: 'Users'
      });
    });

    // 5. Net Worth Items
    const netWorthItems = (await OfflineDB.get<any[]>('net_worth_items')) || [];
    const filteredNetWorth = netWorthItems.filter(i => i.user_id === userId);
    filteredNetWorth.forEach(i => {
      index.push({
        id: i.id,
        type: 'networth',
        title: i.name,
        subtitle: `${i.type === 'asset' ? '+' : '-'}${i.current_value} DH • ${i.category || i.institution || ''}`,
        matchText: `${i.name} ${i.category || ''} ${i.institution || ''} ${i.notes || ''} patrimoine net worth`,
        navigationTarget: 'net-worth',
        icon: 'Wallet'
      });
    });

    // 6. Community Posts (only index non-sensitive content and public alias/city)
    let posts: CommunityPost[] = [];
    if (typeof window !== 'undefined') {
      const localPosts = localStorage.getItem('floussi_community_posts');
      if (localPosts) {
        try {
          posts = JSON.parse(localPosts);
        } catch (e) {
          posts = SEED_POSTS;
        }
      } else {
        posts = SEED_POSTS;
      }
    } else {
      posts = SEED_POSTS;
    }

    posts.forEach(post => {
      index.push({
        id: post.id,
        type: 'community_post',
        title: post.content.length > 50 ? `${post.content.slice(0, 50)}...` : post.content,
        subtitle: `Par @${post.authorAlias} (${post.authorCity}) • Forum d'entraide`,
        matchText: `${post.content} ${post.authorAlias} ${post.authorCity} ${post.relatedGoalName || ''} post communance daret`,
        navigationTarget: 'community',
        icon: 'MessageSquare'
      });
    });

    // 7. Academy Lessons & Modules
    ACADEMY_MODULES.forEach(mod => {
      mod.lessons.forEach(lesson => {
        const textContent = (lesson.contentParagraphs || []).join(' ');
        index.push({
          id: lesson.id,
          type: 'academy_lesson',
          title: lesson.title,
          subtitle: `Leçon • Module: ${mod.title} (${mod.titleDarija}) • ~${lesson.estimatedMinutes} min`,
          matchText: `${lesson.title} ${textContent} ${mod.title} ${mod.titleDarija} cours academie dars l-flouss`,
          navigationTarget: 'academy',
          icon: 'BookOpen'
        });
      });
    });

  } catch (err) {
    console.error("Error building global search index:", err);
  }

  return index;
}

/**
 * Helper to perform fuzzy search by matching parts of words.
 */
export function searchItems(query: string, index: SearchableItem[]): SearchableItem[] {
  if (!query.trim()) return [];

  const normQuery = normalizeText(query);
  const words = normQuery.split(/\s+/).filter(Boolean);

  if (words.length === 0) return [];

  // Filter items that match all query words in matchText or title/subtitle
  const matched = index.filter(item => {
    const normTitle = normalizeText(item.title);
    const normSubtitle = normalizeText(item.subtitle);
    const normMatchText = normalizeText(item.matchText);

    return words.every(word =>
      normTitle.includes(word) ||
      normSubtitle.includes(word) ||
      normMatchText.includes(word)
    );
  });

  // Sort by relevance
  return matched.sort((a, b) => {
    const normTitleA = normalizeText(a.title);
    const normTitleB = normalizeText(b.title);

    // 1. Exact title match
    const exactA = normTitleA === normQuery;
    const exactB = normTitleB === normQuery;
    if (exactA && !exactB) return -1;
    if (!exactA && exactB) return 1;

    // 2. Starts with query
    const startsA = normTitleA.startsWith(normQuery);
    const startsB = normTitleB.startsWith(normQuery);
    if (startsA && !startsB) return -1;
    if (!startsA && startsB) return 1;

    // 3. Title contains query
    const containsA = normTitleA.includes(normQuery);
    const containsB = normTitleB.includes(normQuery);
    if (containsA && !containsB) return -1;
    if (!containsA && containsB) return 1;

    // 4. Subtitle contains query
    const subContainsA = normalizeText(a.subtitle).includes(normQuery);
    const subContainsB = normalizeText(b.subtitle).includes(normQuery);
    if (subContainsA && !subContainsB) return -1;
    if (!subContainsA && subContainsB) return 1;

    return 0;
  });
}

/**
 * Returns matching quick actions triggered by relevant words in the query.
 */
export function getQuickActions(query: string): SearchableItem[] {
  if (!query.trim()) return [];
  const normalizedQuery = normalizeText(query);

  return QUICK_ACTIONS.filter(action => {
    return action.keywords.some(keyword => {
      const normKeyword = normalizeText(keyword);
      return normalizedQuery.includes(normKeyword) || normKeyword.includes(normalizedQuery);
    });
  }).map(action => action.item);
}
