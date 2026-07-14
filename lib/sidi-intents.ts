import { MOROCCAN_CATEGORIES } from './categories';

export interface Intent {
  id: string;
  patterns: RegExp[];
  keywords: string[];
  category: string;
  description: string;
}

export const SIDI_INTENTS: Intent[] = [
  {
    id: "greeting",
    patterns: [
      /\bsalam\b/i,
      /\bbonjour\b/i,
      /\bmsa lkhair\b/i,
      /\bsbah lkhair\b/i,
      /\bahlan\b/i,
      /\bmarhaba\b/i,
      /\bcoucou\b/i,
      /\bsalut\b/i
    ],
    keywords: ["salam", "bonjour", "bonsoir", "ahlan", "marhaba", "salut"],
    category: "system",
    description: "Salutations amicales"
  },
  {
    id: "farewell",
    patterns: [
      /\bau_revoir\b/i,
      /\bbye\b/i,
      /\bbslama\b/i,
      /\bthlla\b/i,
      /\bciao\b/i,
      /\ballah ihennik\b/i
    ],
    keywords: ["au_revoir", "beslama", "bye", "thlla", "layhennik"],
    category: "system",
    description: "Prendre congé"
  },
  {
    id: "help",
    patterns: [
      /\baide\b/i,
      /\bhelp\b/i,
      /\bch3al\b/i,
      /\bchnou kaddire\b/i,
      /\bma3moul\b/i,
      /\bawnini\b/i,
      /\bassistance\b/i
    ],
    keywords: ["aide", "help", "awnini", "moussa3ada", "kaddire", "services"],
    category: "system",
    description: "Aide générale"
  },
  {
    id: "check_balance",
    patterns: [
      /\bsolde\b/i,
      /\bch7al 3andi\b/i,
      /\bchhal andi\b/i,
      /\bcombien j'ai\b/i,
      /\bmon argent\b/i,
      /\bmon solde\b/i,
      /\bfloussi chhal\b/i,
      /\brassid\b/i
    ],
    keywords: ["solde", "argent", "rassa", "rassid", "flouss", "chhal andi"],
    category: "finance",
    description: "Vérifier le solde de ses comptes"
  },
  {
    id: "check_bucket_status",
    patterns: [
      /\bbucket\b/i,
      /\benveloppe\b/i,
      /\bsandouq\b/i,
      /\bsandoq\b/i,
      /\bstatut enveloppe\b/i,
      /\bmaكلة\b/i,
      /\bkhoubz\b/i,
      /\bman lmarqa\b/i,
      /\bétat de mon budget\b/i
    ],
    keywords: ["bucket", "enveloppe", "sandouq", "seaux", "spent", "budget"],
    category: "finance",
    description: "Statut d'une ou des enveloppes budgétaires"
  },
  {
    id: "add_expense",
    patterns: [
      /\bdepense\b/i,
      /\bkhasr\b/i,
      /\bsraft\b/i,
      /\bkhrajt\b/i,
      /\bkhssert\b/i,
      /\bachat\b/i,
      /\bj'ai acheté\b/i,
      /\bj'ai payé\b/i,
      /\bpayé\b/i,
      /\bsarfat\b/i,
      /\bchrit\b/i
    ],
    keywords: ["depense", "sraft", "chrit", "paye", "achete", "khasr", "khrajt"],
    category: "finance",
    description: "Enregistrer une dépense"
  },
  {
    id: "add_income",
    patterns: [
      /\brevenu\b/i,
      /\bdkhal\b/i,
      /\bdkhlat\b/i,
      /\bsalaire\b/i,
      /\bkhlass\b/i,
      /\bmadkhoul\b/i,
      /\bj'ai reçu\b/i,
      /\breçu\b/i,
      /\bدخلت\b/i,
      /\brbaht\b/i
    ],
    keywords: ["revenu", "salaire", "khlass", "dkhal", "recu", "dakhil", "rbeht"],
    category: "finance",
    description: "Enregistrer un revenu"
  },
  {
    id: "check_goal_progress",
    patterns: [
      /\bgoal\b/i,
      /\bobjectif\b/i,
      /\bhadaf\b/i,
      /\bahdaf\b/i,
      /\bépargne\b/i,
      /\btawfir\b/i,
      /\biddikhar\b/i
    ],
    keywords: ["goal", "objectif", "hadaf", "ahdaf", "tawfir", "iddikhar", "epargne"],
    category: "savings",
    description: "Vérifier la progression des objectifs d'épargne"
  },
  {
    id: "check_tontine_reminder",
    patterns: [
      /\btontine\b/i,
      /\bdaret\b/i,
      /\bjmaa\b/i,
      /\bjmâa\b/i,
      /\btontines\b/i,
      /\bquand payer daret\b/i,
      /\béchéance tontine\b/i
    ],
    keywords: ["tontine", "daret", "jmaa", "jmâa", "darate", "echeance", "tour"],
    category: "social",
    description: "Rappel des cotisations Jmâa/Daret"
  },
  {
    id: "check_event_countdown",
    patterns: [
      /\baid\b/i,
      /\baïd\b/i,
      /\bramadan\b/i,
      /\bcountdown\b/i,
      /\bcompte à rebours\b/i,
      /\bévénement\b/i,
      /\bquand commence\b/i
    ],
    keywords: ["aid", "ramadan", "mawlid", "fete", "countdown", "jours restants"],
    category: "social",
    description: "Compte à rebours avant les fêtes marocaines (Ramadan, Aïd)"
  },
  {
    id: "show_spending_chart",
    patterns: [
      /\bgraphique\b/i,
      /\bchart\b/i,
      /\bstatistiques\b/i,
      /\bmonter le graphe\b/i,
      /\brapport\b/i,
      /\bvisualiser\b/i
    ],
    keywords: ["graphique", "chart", "statistiques", "rapport", "graphe", "dessine"],
    category: "finance",
    description: "Demander à voir les graphiques de dépenses"
  },
  {
    id: "show_top_expenses",
    patterns: [
      /\btop depenses\b/i,
      /\bplus grandes depenses\b/i,
      /\btop\b/i,
      /\bfin flouss ketra\b/i,
      /\bplus cher\b/i
    ],
    keywords: ["top", "plus cher", "depenses", "le plus", "max", "grandes"],
    category: "finance",
    description: "Découvrir ses plus gros postes de dépenses"
  },
  {
    id: "joke_request",
    patterns: [
      /\bblague\b/i,
      /\bnokta\b/i,
      /\bnoukta\b/i,
      /\brire\b/i,
      /\bme faire rire\b/i,
      /\bkhlass l9ahwa\b/i,
      /\bdrôle\b/i
    ],
    keywords: ["blague", "nokta", "noukta", "rire", "drole", "raconte"],
    category: "entertainment",
    description: "Raconter une nokta liée aux finances marocaines"
  },
  {
    id: "zakat_calculator",
    patterns: [
      /\bzakat\b/i,
      /\bcalculer zakat\b/i,
      /\bnissab\b/i,
      /\bnisab\b/i,
      /\b2.5\b/i,
      /\bzakat al mal\b/i
    ],
    keywords: ["zakat", "nisab", "nissab", "mal", "calculer zakat"],
    category: "finance",
    description: "Calculer la Zakat al-Maal"
  },
  {
    id: "change_language",
    patterns: [
      /\blangue\b/i,
      /\bprefere darija\b/i,
      /\bprefere francais\b/i,
      /\bparle darija\b/i,
      /\bparle francais\b/i,
      /\bbeddel lougha\b/i
    ],
    keywords: ["langue", "darija", "francais", "language", "lougha", "beddel"],
    category: "system",
    description: "Changer la langue préférée de l'application"
  },
  {
    id: "about_sidi",
    patterns: [
      /\bqui es-tu\b/i,
      /\bchkon sidi\b/i,
      /\bchkoune\b/i,
      /\bton nom\b/i,
      /\bqui est sidi\b/i,
      /\bprésente toi\b/i
    ],
    keywords: ["sidi", "qui es tu", "chkon", "nom", "presente", "presentation"],
    category: "system",
    description: "Qui est Sidi Floussi ?"
  },
  {
    id: "show_unallocated",
    patterns: [
      /\bnon alloue\b/i,
      /\bpas alloue\b/i,
      /\bflouss b9at\b/i,
      /\breste non alloue\b/i,
      /\bcombien reste hors enveloppe\b/i
    ],
    keywords: ["non alloue", "reste", "hors enveloppe", "b9at", "libre"],
    category: "finance",
    description: "Solde non-alloué dans les enveloppes"
  },
  {
    id: "pricing_inquiry",
    patterns: [
      /\btarifs\b/i,
      /\bprix\b/i,
      /\babonnement\b/i,
      /\bpremium\b/i,
      /\bcombien coute\b/i,
      /\bpayant\b/i
    ],
    keywords: ["tarifs", "prix", "abonnement", "premium", "coute", "dahabi"],
    category: "system",
    description: "Se renseigner sur les plans Floussi"
  },
  {
    id: "family_budget",
    patterns: [
      /\bfamille\b/i,
      /\bfoyer\b/i,
      /\bpartager budget\b/i,
      /\bdar dyalna\b/i,
      /\bcompte conjoint\b/i
    ],
    keywords: ["famille", "foyer", "partage", "darna", "couple", "enfants"],
    category: "social",
    description: "Gérer le budget familial à plusieurs"
  },
  {
    id: "praise_sidi",
    patterns: [
      /\bmerci sidi\b/i,
      /\bbravou\b/i,
      /\bbravo\b/i,
      /\bzwine\b/i,
      /\bnta wa3r\b/i,
      /\bnta waer\b/i,
      /\badraki\b/i,
      /\btes le meilleur\b/i
    ],
    keywords: ["bravo", "merci", "zwine", "waer", "wa3r", "meilleur", "top sidi"],
    category: "entertainment",
    description: "Complimenter Sidi Floussi"
  },
  {
    id: "how_to_save",
    patterns: [
      /\bcomment epargner\b/i,
      /\bnassiha\b/i,
      /\bconseil epargne\b/i,
      /\bkifach nkhbi\b/i,
      /\bkifach nwffer\b/i,
      /\bconseils\b/i
    ],
    keywords: ["conseil", "epargner", "nwffer", "nkhbi", "nassiha", "astuces"],
    category: "savings",
    description: "Demander des astuces de sagesse budgétaire marocaine"
  }
];

export interface DetectedResult {
  intent: Intent;
  confidence: number;
  slots: {
    amount?: number;
    category?: string;
    merchant?: string;
    date_relative?: 'today' | 'yesterday' | 'tomorrow';
    target_name?: string;
  };
}

/**
 * Detects the intent from a normalized input string.
 * Uses pattern matching and keyword counts.
 */
export function detectIntent(normalizedText: string, originalText: string): DetectedResult {
  let matchedIntent: Intent = SIDI_INTENTS.find(i => i.id === "fallback") || {
    id: "fallback",
    patterns: [],
    keywords: [],
    category: "system",
    description: "Aucun intent détecté"
  };
  
  let maxScore = 0;

  // 1. Regular expression matching (High confidence trigger)
  for (const intent of SIDI_INTENTS) {
    for (const pattern of intent.patterns) {
      if (pattern.test(normalizedText) || pattern.test(originalText)) {
        matchedIntent = intent;
        maxScore = 1.0;
        break;
      }
    }
    if (maxScore === 1.0) break;
  }

  // 2. Keyword matching fallback
  if (maxScore < 1.0) {
    const words = normalizedText.split(" ");
    for (const intent of SIDI_INTENTS) {
      let matchedCount = 0;
      for (const kw of intent.keywords) {
        if (words.includes(kw) || normalizedText.includes(kw)) {
          matchedCount++;
        }
      }
      
      const score = matchedCount / Math.max(1, intent.keywords.length);
      if (score > maxScore && matchedCount > 0) {
        maxScore = score;
        matchedIntent = intent;
      }
    }
  }

  // Set confidence threshold
  let confidence = maxScore;
  if (confidence < 0.15) {
    matchedIntent = SIDI_INTENTS.find(i => i.id === "fallback") || matchedIntent;
    confidence = 0.0;
  }

  // 3. Extract slots
  const slots: DetectedResult['slots'] = {};

  // Extract Amount (e.g., "50 dh", "200 dirhams", "1000", "50dh")
  // Look for any numbers first
  const amountRegex = /(\d+(?:\.\d+)?)\s*(?:dh|dirham|dirhams|mad|dhs|dryal)?/gi;
  const matchAmount = amountRegex.exec(originalText) || amountRegex.exec(normalizedText);
  if (matchAmount) {
    slots.amount = parseFloat(matchAmount[1]);
  }

  // Extract Category from MOROCCAN_CATEGORIES matching keywords
  for (const cat of MOROCCAN_CATEGORIES) {
    const normalizedCatFr = cat.name_fr.toLowerCase();
    const normalizedCatDar = cat.name_darija.toLowerCase();
    if (
      normalizedText.includes(cat.id) ||
      normalizedText.includes(normalizedCatFr) ||
      normalizedText.includes(normalizedCatDar)
    ) {
      slots.category = cat.id;
      break;
    }
  }

  // If category wasn't found, try a simple lookup from keywords
  if (!slots.category) {
    if (normalizedText.includes("makla") || normalizedText.includes("alimentation") || normalizedText.includes("tagine") || normalizedText.includes("bim") || normalizedText.includes("marjane")) {
      slots.category = "alimentation";
    } else if (normalizedText.includes("dar") || normalizedText.includes("loyer") || normalizedText.includes("kraya")) {
      slots.category = "logement";
    } else if (normalizedText.includes("tombil") || normalizedText.includes("carburant") || normalizedText.includes("taxi") || normalizedText.includes("mazot")) {
      slots.category = "transport";
    } else if (normalizedText.includes("inwi") || normalizedText.includes("iam") || normalizedText.includes("orange") || normalizedText.includes("recharge")) {
      slots.category = "telecom";
    } else if (normalizedText.includes("lydec") || normalizedText.includes("redal") || normalizedText.includes("radeema") || normalizedText.includes("lma") || normalizedText.includes("do")) {
      slots.category = "factures";
    } else if (normalizedText.includes("tbib") || normalizedText.includes("dwa") || normalizedText.includes("pharmacie")) {
      slots.category = "sante";
    } else if (normalizedText.includes("madrassa") || normalizedText.includes("ecole") || normalizedText.includes("scolaire")) {
      slots.category = "education";
    } else if (normalizedText.includes("qahwa") || normalizedText.includes("ahwa") || normalizedText.includes("voyage") || normalizedText.includes("hammam")) {
      slots.category = "loisirs";
    } else if (normalizedText.includes("tawfir") || normalizedText.includes("gold") || normalizedText.includes("epargne")) {
      slots.category = "epargne";
    } else if (normalizedText.includes("sadaqa") || normalizedText.includes("zakat") || normalizedText.includes("aid")) {
      slots.category = "religieux";
    } else if (normalizedText.includes("family") || normalizedText.includes("hadiya") || normalizedText.includes("cadeau")) {
      slots.category = "social";
    }
  }

  // Extract Merchant
  const merchants = ["marjane", "bim", "carrefour", "lydec", "iam", "orange", "inwi", "redal", "radeema", "moul lhanout", "afriquia", "shell", "total"];
  for (const merch of merchants) {
    if (originalText.toLowerCase().includes(merch) || normalizedText.includes(merch)) {
      slots.merchant = merch.charAt(0).toUpperCase() + merch.slice(1);
      break;
    }
  }

  // Extract date relative
  if (normalizedText.includes("aujourd_hui") || normalizedText.includes("lyouma") || normalizedText.includes("lyoum")) {
    slots.date_relative = "today";
  } else if (normalizedText.includes("hier") || normalizedText.includes("lbareh") || normalizedText.includes("lbarh")) {
    slots.date_relative = "yesterday";
  } else if (normalizedText.includes("demain") || normalizedText.includes("ghda") || normalizedText.includes("gheda")) {
    slots.date_relative = "tomorrow";
  } else {
    slots.date_relative = "today"; // default
  }

  // Target name (fuzzy extraction of goals or tontines)
  if (originalText.includes("Omra") || originalText.includes("omra") || normalizedText.includes("omra")) {
    slots.target_name = "Omra";
  } else if (originalText.includes("Dhab") || originalText.includes("Or") || originalText.includes("or") || normalizedText.includes("dhab")) {
    slots.target_name = "Or";
  } else if (originalText.includes("Jmâa") || originalText.includes("jmaa") || normalizedText.includes("jmaa")) {
    slots.target_name = "Jmâa El Kheir";
  }

  return {
    intent: matchedIntent,
    confidence: confidence > 0 ? confidence : 0.4, // Fallback confidence
    slots
  };
}
