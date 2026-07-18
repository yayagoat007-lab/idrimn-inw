import { TourDefinition } from './guided-tour-engine';

export const dashboardTourDefinition: TourDefinition = {
  id: 'dashboard_first_visit',
  steps: [
    {
      targetSelector: '[data-tour-id="solde"]',
      placement: 'bottom',
      title: {
        fr: "💰 Ton Solde Disponible Actif",
        darija: "💰 Rsside dyalk l-7ali"
      },
      description: {
        fr: "Ici s'affiche la somme totale de ta Baraka ! Tu peux basculer entre ton compte courant, ton épargne ou ton cash physique.",
        darija: "Hna kat-chouf l-Baraka dyalek kamla! T9der t-bdal bin l-7issab l-jari, l-iddikhar aw l-cash f jiybek."
      }
    },
    {
      targetSelector: '[data-tour-id="free-to-spend"]',
      placement: 'bottom',
      title: {
        fr: "💸 Le Free-to-Spend (Masrouf Flex)",
        darija: "💸 Masrouf Flex (Li t9der tkhsser)"
      },
      description: {
        fr: "C'est l'argent que tu peux dépenser l'esprit tranquille. On a déjà déduit de ton solde ce qu'il faut mettre de côté pour tes factures et projets !",
        darija: "Hada houwa l-masrouf li t9der tkhsro o rassek hani. Hiyyadna m l-rsside dyalek dakchi li khass t-khbi l l-fawatir o l-mouchari3 dyalek!"
      }
    },
    {
      targetSelector: '[data-tour-id="buckets-section"]',
      placement: 'top',
      title: {
        fr: "📦 Vos Sanadiq (Enveloppes)",
        darija: "📦 S-Sanadiq dyalek (L-Gharrafat)"
      },
      description: {
        fr: "Ce sont tes enveloppes de budget virtuelles ! Répartis ton argent pour le loyer, l'alimentation, le shopping... Fini les mauvaises surprises !",
        darija: "Hado houma s-sanadiq d l-budget dyalek ! Farraq floussek 3la l-kra, l-makla, t-taqdiya... Bach t-hanni rassek mn mofaja'at khayba!"
      }
    },
    {
      targetSelector: '[data-tour-id="add-quick"]',
      placement: 'bottom',
      title: {
        fr: "✍️ Enregistrement ultra-rapide",
        darija: "✍️ T-Sjjel dghya dghya"
      },
      description: {
        fr: "Un achat en cash ou une rentrée d'argent ? Clique ici pour saisir rapidement ta transaction ou scanner un reçu !",
        darija: "Chriti chi 7aja b l-cash aw dkhlatk chi baraka? Klikki hna bach t-sjjel l-mouwamala dyalk dghya aw t-scanni l-boun dyalk!"
      }
    },
    {
      targetSelector: '[data-tour-id="goals-section"]',
      placement: 'top',
      title: {
        fr: "🎯 Vos Objectifs d'Épargne",
        darija: "🎯 L-Ahdaf d l-iddikhar"
      },
      description: {
        fr: "Pour acheter de l'or, préparer la Omra ou l'Aïd, crée un objectif et épargne pas à pas. Chaque dirham compte !",
        darija: "Bach t-chri l-dhab, t-qadd l-Omra aw l-Aïd, diir hadaf o jme3 l-flouss chwiya b chwiya. Kul derhem 3ndo 9imto!"
      }
    },
    {
      targetSelector: '[data-tour-id="sidi-fab"]',
      placement: 'left',
      title: {
        fr: "🧔 Sidi Floussi est là !",
        darija: "🧔 Sidi Floussi dima m3ak !"
      },
      description: {
        fr: "Besoin d'un conseil ou d'une astuce ? Je suis toujours disponible ici. N'hésite pas à me parler en darija ou en français !",
        darija: "7tajti chi mouchawara aw nassi7a? Ana dima hna 7dak. Hdar m3aya b l-darija aw b l-franssawiya rani nafhmek!"
      }
    }
  ]
};
