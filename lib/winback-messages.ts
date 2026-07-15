import { InactivityTier } from './inactivity-detector';

export interface WinBackContext {
  lastActiveGoalName?: string;
  lastActiveGoalProgress?: number;
  lastActiveGoalRemaining?: number;
  activeBucketNearLimit?: string;
  pendingTontineReminder?: boolean;
  tontineName?: string;
  upcomingMoroccanEvent?: { name: string; daysUntil: number };
}

export interface WinBackMessageContent {
  title: string;
  message: string;
  ctaLabel: string;
}

export interface WinBackMessage {
  fr: WinBackMessageContent;
  darija: WinBackMessageContent;
  targetPage: 'goals' | 'tontine' | 'events' | 'wallet' | 'dashboard';
}

/**
 * Generates an empathetic and hyper-personalized winback message based on available user context.
 * Prioritizes active user goals with progress, then Jmâas (tontines) with pending contributions,
 * then upcoming Moroccan events, and falls back to a tier-specific warm message.
 */
export function generateWinBackMessage(tier: InactivityTier, context: WinBackContext = {}): WinBackMessage {
  // Priority 1: Active goal with progress > 0%
  if (context.lastActiveGoalName && context.lastActiveGoalProgress && context.lastActiveGoalProgress > 0) {
    const progress = Math.round(context.lastActiveGoalProgress);
    const remaining = context.lastActiveGoalRemaining ? Math.round(context.lastActiveGoalRemaining) : null;
    const name = context.lastActiveGoalName;

    const remainingFr = remaining ? ` — encore ${remaining} DH et tu y es` : '';
    const remainingAr = remaining ? ` — bqat lik ghir ${remaining} DH o twsal` : '';

    return {
      fr: {
        title: "🎯 Ton objectif t'attend !",
        message: `Ton objectif « ${name} » est à ${progress}%${remainingFr}. On reprend ensemble ? 🚀`,
        ctaLabel: "Continuer mon objectif"
      },
      darija: {
        title: "🎯 Hadaf dyalek kaytsannak !",
        message: `L-hadaf dyalek « ${name} » wsal l ${progress}%${remainingAr}. Nkemlo m3a ba3dyatna ? 🚀`,
        ctaLabel: "Kemmel l-hadaf dyali"
      },
      targetPage: 'goals'
    };
  }

  // Priority 2: Tontine (Jmâa) with pending payment / contribution
  if (context.pendingTontineReminder && context.tontineName) {
    const name = context.tontineName;
    return {
      fr: {
        title: "🤝 Ta Jmâa a besoin de toi !",
        message: `Ta Jmâa « ${name} » a besoin de ta contribution. Les autres membres comptent sur toi pour ce cycle ! ✨`,
        ctaLabel: "Voir ma Jmâa"
      },
      darija: {
        title: "🤝 Jmâa dyalek m7taja lik !",
        message: `Jmâa dyalek « ${name} » m7taja l-mosahama dyalek. L-a3da2 l-akhrin m3tamdin 3lik f had d-dawra ! ✨`,
        ctaLabel: "Chouf Jmâa dyali"
      },
      targetPage: 'tontine'
    };
  }

  // Priority 3: Upcoming Moroccan event (e.g. Ramadan, Eid, Rentree scolaire) < 15 days away
  if (context.upcomingMoroccanEvent && context.upcomingMoroccanEvent.daysUntil <= 15 && context.upcomingMoroccanEvent.daysUntil >= 0) {
    const { name, daysUntil } = context.upcomingMoroccanEvent;
    return {
      fr: {
        title: "📅 Prépare ton budget !",
        message: `L'événement « ${name} » approche dans ${daysUntil} jours. Il n'est pas trop tard pour ajuster ton budget et fêter sereinement ! 🐑`,
        ctaLabel: "Organiser mon budget"
      },
      darija: {
        title: "📅 Wejjed l-mizaniya dyalek !",
        message: `L-monasaba dyal « ${name} » qriba tji f ${daysUntil} yum. Baqi l-waqt bach t-qadd l-mizaniya dyalek o t-frah mzyan ! 🐑`,
        ctaLabel: "Wejjed l-mizaniya"
      },
      targetPage: 'events'
    };
  }

  // Priority 4: Active bucket spending near limit
  if (context.activeBucketNearLimit) {
    const bucketName = context.activeBucketNearLimit;
    return {
      fr: {
        title: "⚠️ Budget sous surveillance",
        message: `Attention, ton budget « ${bucketName} » est presque épuisé pour ce mois. Faisons le point ensemble !`,
        ctaLabel: "Vérifier mes dépenses"
      },
      darija: {
        title: "⚠️ Mizaniya ta7t l-moraqaba",
        message: `3ndak, l-mizaniya dyal « ${bucketName} » qrib t-sala had ch-char. Aji chouf l-masarif dyalek !`,
        ctaLabel: "Chouf l-masarif"
      },
      targetPage: 'wallet'
    };
  }

  // Priority 5: Fallback to warm, tier-based messages
  switch (tier) {
    case 'day_3':
      return {
        fr: {
          title: "👋 Tu nous as manqué !",
          message: "Quelques jours sans te voir ! Viens faire un petit point rapide sur tes comptes aujourd'hui pour garder le cap.",
          ctaLabel: "Ouvrir mon tableau de bord"
        },
        darija: {
          title: "👋 Twe7chnak !",
          message: "Hadi modda sghira ma chfnakch ! Aji dir t-we7ida sghira l-7isabat dyalek l-yum bach tbqa dima msaid.",
          ctaLabel: "Chouf l-7issab dyali"
        },
        targetPage: 'dashboard'
      };
    
    case 'day_7':
      return {
        fr: {
          title: "🌟 Déjà une semaine !",
          message: "Une semaine est passée ! C'est le moment idéal pour enregistrer tes dernières transactions et rester maître de tes finances.",
          ctaLabel: "Enregistrer mes transactions"
        },
        darija: {
          title: "🌟 Safi simana daba !",
          message: "Safi simana daba dازت ! Hada huwa l-waqt l-monassib bach t-sajjel l-masarif dyalek o t-7kem f floussek mzyan.",
          ctaLabel: "Sajjel l-masarif"
        },
        targetPage: 'wallet'
      };

    case 'day_30':
      return {
        fr: {
          title: "🌱 On reprend de bonnes habitudes ?",
          message: "Un mois s'est écoulé. Ne laisse pas tes magnifiques efforts financiers de côté ! Sidi Floussi est là pour t'accompagner pas à pas.",
          ctaLabel: "Reprendre en main mes finances"
        },
        darija: {
          title: "🌱 N-rej3o l-3adat l-mzyana ?",
          message: "Kamal ch-chhar daba. Ma t-sm7ch f l-majhodat l-maliya dyalek ! Sidi Floussi dima m3ak f d-drb.",
          ctaLabel: "Rejja3 l-kontrol"
        },
        targetPage: 'dashboard'
      };

    case 'day_90_plus':
    default:
      return {
        fr: {
          title: "🚀 Que de nouveautés depuis ton départ !",
          message: "Ça fait un moment ! On a ajouté de nouvelles fonctionnalités intelligentes (dont l'Académie Floussi 🎓) pour t'aider au quotidien. Viens jeter un œil !",
          ctaLabel: "Découvrir les nouveautés"
        },
        darija: {
          title: "🚀 Bezaf d-j-jdid bano mlli mchiti !",
          message: "Hadi modda twila ! Zdna bezaf d-t-7sinat o l-adawat l-dakiya (b7al Akadimiya Floussi 🎓) bach n-sehlo 3lik l-7ayat. Aji chouf j-jdid !",
          ctaLabel: "Chouf j-jdid"
        },
        targetPage: 'dashboard'
      };
  }
}
