export interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface AcademyLesson {
  id: string;
  title: string;
  contentParagraphs: string[];
  estimatedMinutes: number;
  quiz: QuizQuestion[];
}

export interface AcademyModule {
  id: string;
  title: string;
  titleDarija: string;
  level: 'debutant' | 'intermediaire' | 'avance' | 'expert';
  category: 'budget' | 'epargne' | 'investissement' | 'credit' | 'retraite' | 'fiscalite';
  descriptionFr: string;
  descriptionDarija: string;
  lessons: AcademyLesson[];
}

export const ACADEMY_MODULES: AcademyModule[] = [
  {
    id: 'budget_basics',
    title: "Les bases du budget",
    titleDarija: "Qawa3id d-Mizaniya",
    level: 'debutant',
    category: 'budget',
    descriptionFr: "Maîtrise les fondamentaux de la gestion de tes dépenses mensuelles et construis une base solide.",
    descriptionDarija: "T3allem kifach t-tsarraf f l-flouss dyalek f l-chhar o tbni l-asass dyal d-mizaniya.",
    lessons: [
      {
        id: 'budget_basics_l1',
        title: "Pourquoi budgétiser au Maroc ?",
        estimatedMinutes: 4,
        contentParagraphs: [
          "Gérer ses finances au Maroc demande de l'organisation face à la cohabitation constante entre le secteur formel (virements bancaires, factures prélevées) et informel (paiements en cash au Hanout, taxis, marchés hebdomadaires). Sans un suivi précis, les petites dépenses en cash créent un phénomène d'évaporation de l'argent difficile à retracer en fin de mois.",
          "Faire un budget n'est pas une restriction de liberté, mais un plan d'action pour tes objectifs de vie. Cela te permet de décider à l'avance où ira chaque dirham durement gagné au lieu de te demander où il est parti. En identifiant précisément tes charges fixes (loyer, crédit, abonnements) et tes dépenses variables (courses, sorties), tu évites le stress du découvert à partir du 20 du mois.",
          "En adoptant le réflexe de budgétiser avec Floussi, tu passes d'une posture réactive (subir tes factures) à une posture proactive. Tu prends le contrôle de ton Masrouf en allouant des enveloppes de dépenses claires, ce qui te libère l'esprit pour épargner sereinement."
        ],
        quiz: [
          {
            question: "Quelle est la principale cause d'évaporation invisible de l'argent au Maroc ?",
            options: [
              "Les frais d'abonnements de streaming",
              "Les petites dépenses quotidiennes en cash non répertoriées (Hanout, taxis, etc.)",
              "La hausse subite du loyer d'un mois à l'autre"
            ],
            correctOptionIndex: 1,
            explanation: "Au Maroc, le cash circule énormément au quotidien. Ne pas noter les dépenses faites chez le Hanout ou dans les transports informels est la cause n°1 des écarts de budget inexpliqués."
          },
          {
            question: "Qu'est-ce que faire un budget apporte réellement ?",
            options: [
              "Une restriction stricte qui empêche de se faire plaisir",
              "Un plan d'action qui donne le contrôle sur chaque dirham dépensé",
              "Un document obligatoire à remettre à sa banque marocaine"
            ],
            correctOptionIndex: 1,
            explanation: "Le budget n'est pas une punition, mais un outil de liberté qui oriente vos ressources vers ce qui compte vraiment pour vous."
          },
          {
            question: "Quand doit-on définir son budget de dépenses ?",
            options: [
              "Au début du mois, dès la réception du salaire ou des revenus",
              "À la fin du mois, après avoir tout dépensé",
              "Uniquement en période de fête (Ramadan, Aïd)"
            ],
            correctOptionIndex: 0,
            explanation: "Planifier dès la réception du salaire permet d'attribuer un rôle à chaque dirham avant que les tentations de dépenses impulsives ne surviennent."
          }
        ]
      },
      {
        id: 'budget_basics_l2',
        title: "La méthode des buckets/enveloppes",
        estimatedMinutes: 5,
        contentParagraphs: [
          "La méthode des enveloppes, ou 'Sandoqat' en Darija, consiste à diviser tes revenus mensuels nets en catégories bien distinctes et étanches. Traditionnellement réalisée avec des enveloppes physiques contenant du cash, elle se digitalise aujourd'hui avec Floussi pour offrir une flexibilité totale.",
          "Une répartition populaire est la règle du 50/30/20. Tu alloues 50% de tes revenus aux Besoins essentiels (loyer, électricité Radeema/Lydec, courses Marjane/Souq, santé). Ensuite, 30% sont dédiés aux Envies et loisirs (cafés, restaurants, abonnements sport, shopping). Les derniers 20% sont directement versés dans l'Épargne et les investissements dès le début du mois.",
          "Si tes revenus fluctuent ou si le coût de la vie exige des ajustements, tu peux adapter ces proportions (par exemple 60/20/20 ou 70/15/15). L'important est de sanctuariser la part d'épargne d'abord, puis de respecter scrupuleusement la limite fixée pour chaque 'bucket' de dépense."
        ],
        quiz: [
          {
            question: "Selon la règle classique du 50/30/20, quel pourcentage des revenus doit être alloué aux Envies (loisirs, cafés, shopping) ?",
            options: [
              "50% des revenus nets",
              "20% des revenus nets",
              "30% des revenus nets"
            ],
            correctOptionIndex: 2,
            explanation: "La règle alloue 50% aux besoins vitaux, 30% aux plaisirs et loisirs personnels, et 20% à l'épargne de long terme."
          },
          {
            question: "Comment appliquer la méthode des enveloppes si on paie principalement par carte bancaire ?",
            options: [
              "On ne peut pas, cette méthode fonctionne uniquement avec du cash physique",
              "On utilise une application comme Floussi pour suivre virtuellement les enveloppes de dépenses",
              "On demande à la banque d'ouvrir 15 comptes différents"
            ],
            correctOptionIndex: 1,
            explanation: "La budgétisation par enveloppe virtuelle sur Floussi permet de conserver le confort des paiements électroniques tout en limitant les dérives par catégorie."
          },
          {
            question: "Que signifie 'sanctuariser l'épargne' ?",
            options: [
              "Épargner uniquement ce qu'il reste à la fin du mois",
              "Mettre de côté ses 20% d'épargne dès le jour de la paye avant toute dépense",
              "Placer de l'argent dans un coffre-fort dans une mosquée"
            ],
            correctOptionIndex: 1,
            explanation: "Épargner en premier ('Pay yourself first') garantit que vos objectifs financiers sont prioritaires, évitant que l'épargne ne soit grignotée par des dépenses secondaires."
          }
        ]
      },
      {
        id: 'budget_basics_l3',
        title: "Gérer le cash au quotidien au Maroc",
        estimatedMinutes: 5,
        contentParagraphs: [
          "Au Maroc, le cash reste roi pour une multitude d'actes d'achat quotidiens : le gardien de voiture (3 DH), l'achat de légumes au Souq hebdomadaire, le pain chaud au coin de la rue ou le plombier venu réparer une fuite. Pour maîtriser ce flux, il convient d'adopter des règles de gestion simples.",
          "Tout d'abord, évite de retirer de petites sommes de 100 DH à répétition au guichet automatique (GAB), car cela multiplie les frais de tenue de compte et rend le suivi illisible. Préfère retirer une somme fixe hebdomadaire dédiée uniquement à ton argent de poche en cash (ex : 500 DH pour la semaine) que tu enregistres immédiatement comme retrait de cash dans ton gestionnaire.",
          "Prends l'habitude d'arrondir mentalement tes dépenses au dirham supérieur et d'utiliser l'appareil photo de Floussi pour scanner tes reçus de supermarché (Bim, Acima, Carrefour) afin de gagner du temps. En catégorisant tes dépenses en cash au fur et à mesure, tu découvriras vite que les pièces de monnaie perdues finissent par former de grandes vagues d'épargne à la fin de l'année."
        ],
        quiz: [
          {
            question: "Pourquoi vaut-il mieux éviter de multiplier les petits retraits de 100 DH au guichet automatique (GAB) ?",
            options: [
              "Parce que les GAB du Maroc limitent le nombre de retraits à un par mois",
              "Car cela fragmente le suivi et engendre des frais bancaires d'opération superflus",
              "Parce que les billets de 100 DH perdent de la valeur par rapport aux billets de 200 DH"
            ],
            correctOptionIndex: 1,
            explanation: "Des retraits réguliers brouillent votre visibilité financière et peuvent gonfler vos frais d'écritures ou d'opérations hors réseau bancaire."
          },
          {
            question: "Comment gérer efficacement l'argent de poche destiné aux dépenses informelles au Maroc ?",
            options: [
              "Ne jamais utiliser de cash et exiger le paiement par carte partout",
              "Retirer une somme globale hebdomadaire encadrée et suivre son utilisation",
              "Laisser des chèques signés en blanc chez les commerçants"
            ],
            correctOptionIndex: 1,
            explanation: "Retirer une enveloppe de cash fixe pour la semaine vous donne une limite physique concrète à ne pas dépasser pour votre quotidien."
          },
          {
            question: "Quelle bonne habitude permet d'automatiser l'épargne sur Floussi lors des dépenses ?",
            options: [
              "Le calcul mental complexe à chaque achat",
              "Le scan immédiat de tickets de caisse et l'activation de la règle d'arrondi (Round-up)",
              "L'écriture sur un carnet de notes papier rangé à la maison"
            ],
            correctOptionIndex: 1,
            explanation: "Le scan et l'arrondi permettent de suivre en temps réel ses dépenses tout en épargnant de micro-sommes à chaque transaction par carte."
          }
        ]
      }
    ]
  },
  {
    id: 'savings_mastery',
    title: "Épargner intelligemment",
    titleDarija: "Iddikhar d-Dki",
    level: 'debutant',
    category: 'epargne',
    descriptionFr: "Découvre comment structurer ton épargne entre sécurité immédiate et objectifs à moyen terme au Maroc.",
    descriptionDarija: "Ktechef kifach t-khbi floussek bin sandoq d-tawari o l-ahdaf dyalek d l-moustaqbal.",
    lessons: [
      {
        id: 'savings_mastery_l1',
        title: "L'épargne de précaution (Sandoq d-Tawari)",
        estimatedMinutes: 5,
        contentParagraphs: [
          "L'épargne de précaution, ou fonds d'urgence, est la brique de sécurité indispensable de tout plan financier. Son but n'est pas de rapporter de l'argent, mais de te protéger contre les imprévus majeurs de la vie : une panne de voiture imprévue, des frais médicaux non remboursés immédiatement par l'AMO, ou une perte soudaine d'emploi.",
          "Au Maroc, il est fortement conseillé de constituer un fonds de précaution équivalent à 3 à 6 mois de tes dépenses mensuelles courantes. Si tes charges incompressibles s'élèvent à 6 000 DH par mois, ton sandoq d'urgence idéal se situe entre 18 000 DH et 36 000 DH. Cet argent doit être conservé dans un endroit sûr et hautement liquide.",
          "Le meilleur support au Maroc pour cette épargne est le 'Compte sur Carnet' (disponible dans toutes les banques marocaines ou à Al Barid Bank). Il est gratuit, sécurisé, et te reverse des intérêts garantis chaque trimestre, tout en te permettant de retirer tes fonds instantanément en cas de besoin."
        ],
        quiz: [
          {
            question: "Quel montant est généralement recommandé pour un fonds d'urgence (Sandoq d-Tawari) ?",
            options: [
              "L'équivalent de 1 mois de salaire brut",
              "L'équivalent de 3 à 6 mois de dépenses mensuelles courantes",
              "Exactement 100 000 DH pour tout le monde"
            ],
            correctOptionIndex: 1,
            explanation: "3 à 6 mois de dépenses vous laissent le temps de vous retourner face à un coup dur sans sombrer dans les dettes à la consommation."
          },
          {
            question: "Quel est le meilleur outil d'épargne au Maroc pour placer son fonds d'urgence ?",
            options: [
              "Un Compte sur Carnet (liquide, gratuit et sécurisé)",
              "L'achat de crypto-monnaies volatiles",
              "Garder tout en billets sous le matelas"
            ],
            correctOptionIndex: 0,
            explanation: "Le compte sur carnet offre une disponibilité immédiate et une protection totale du capital, parfait pour un fonds d'urgence."
          },
          {
            question: "Quelle est la règle d'or d'utilisation du fonds d'urgence ?",
            options: [
              "L'utiliser pour acheter le dernier smartphone en promotion",
              "Ne l'utiliser exclusivement qu'en cas d'imprévu réel et non planifié",
              "Le dépenser entièrement pour les vacances d'été"
            ],
            correctOptionIndex: 1,
            explanation: "Un fonds d'urgence n'est pas une enveloppe de plaisir. C'est une ceinture de sécurité financière à ne détacher qu'en cas d'accident de parcours."
          }
        ]
      },
      {
        id: 'savings_mastery_l2',
        title: "Épargner pour un projet concret",
        estimatedMinutes: 5,
        contentParagraphs: [
          "Une fois ton fonds de précaution bien établi, tu peux commencer à épargner pour des projets de vie à moyen terme. Au Maroc, ces projets sont souvent d'une grande importance culturelle et sociale : l'achat du mouton de l'Aïd El Adha, la préparation d'un mariage traditionnel (qui peut coûter de 30 000 DH à plus de 150 000 DH), ou l'apport initial pour l'achat d'un premier appartement.",
          "Pour réussir, chaque objectif d'épargne doit être 'S.M.A.R.T' : Spécifique, Mesurable, Atteignable, Réaliste, et Temporellement défini. Par exemple : 'Je veux épargner 24 000 DH en 2 ans pour mon mariage, ce qui nécessite de mettre de côté exactement 1 000 DH par mois.'",
          "Grâce aux sandoqs thématiques de Floussi, tu peux attribuer une tirelire virtuelle étanche à chaque projet. Cela te permet de mesurer visuellement ton avancement, de célébrer tes étapes, et d'éviter que l'argent du mariage ne soit accidentellement dépensé dans les sorties quotidiennes."
        ],
        quiz: [
          {
            question: "Parmi ces formulations, laquelle correspond à un objectif d'épargne SMART ?",
            options: [
              "Je veux épargner beaucoup d'argent pour acheter une nouvelle voiture bientôt",
              "Je vais mettre de côté 1 200 DH par mois pendant 12 mois pour financer un apport auto de 14 400 DH",
              "J'espère acheter une maison un jour au Maroc si j'y pense"
            ],
            correctOptionIndex: 1,
            explanation: "Cette option comporte un montant précis, une mensualité claire et une durée fixée dans le temps, ce qui la rend parfaitement mesurable."
          },
          {
            question: "Pourquoi est-il avantageux d'isoler son épargne projet dans des sandoqs virtuels séparés sur Floussi ?",
            options: [
              "Pour gagner des intérêts plus élevés auprès de l'État",
              "Pour éviter de mélanger vos objectifs et de grignoter l'argent destiné à un projet précis",
              "Pour bloquer juridiquement l'argent afin qu'on ne puisse plus y toucher"
            ],
            correctOptionIndex: 1,
            explanation: "L'étanchéité visuelle et mentale des comptes d'épargne dédiés renforce la discipline et évite le détournement de vos objectifs."
          },
          {
            question: "Que doit-on faire de l'argent épargné pour un projet qui aura lieu dans 6 mois (ex: Aïd El Adha) ?",
            options: [
              "Le placer en Bourse de Casablanca pour tenter de doubler la mise",
              "Le laisser sur un compte courant ou compte sur carnet très sécurisé",
              "Prêter la somme à un collègue sans garantie de remboursement"
            ],
            correctOptionIndex: 1,
            explanation: "À un horizon inférieur à un an, la sécurité et la liquidité totale priment sur la recherche de rendement."
          }
        ]
      },
      {
        id: 'savings_mastery_l3',
        title: "Éviter les pièges de l'achat impulsif",
        estimatedMinutes: 4,
        contentParagraphs: [
          "Le marketing moderne, les publicités ciblées sur Instagram et les facilités de paiement sans frais lors du 'Black Friday' ou des périodes de soldes au Maroc incitent constamment à l'achat impulsif. Ces dépenses non planifiées sont les ennemies directes de ton épargne.",
          "Une technique redoutable pour contrer ces pulsions est la règle des 48 heures. Avant d'acheter un objet non essentiel (vêtements haut de gamme, gadgets, décoration luxueuse), force-toi à attendre deux jours entiers. Dans 80% des cas, l'excitation initiale retombe et tu te rends compte que tu n'en avais pas réellement besoin.",
          "Une autre méthode marocaine consiste à convertir le prix de l'objet convoité en 'heures de travail'. Si tu gagnes 50 DH de l'heure nets et que tu convoites une paire de baskets de marque à 1 000 DH, pose-toi la question : 'Suis-je vraiment prêt à travailler 20 heures entières au bureau juste pour acquérir ces chaussures ?' La réponse t'aidera souvent à rationaliser."
        ],
        quiz: [
          {
            question: "En quoi consiste la règle des 48 heures face à une envie d'achat impulsive ?",
            options: [
              "Acheter le produit dans les 48 heures avant la fin de la promotion",
              "Attendre obligatoirement 48 heures avant de finaliser l'achat pour laisser l'émotion redescendre",
              "Demander à 48 amis différents leur avis sur le produit"
            ],
            correctOptionIndex: 1,
            explanation: "Patienter deux jours permet d'éliminer l'achat guidé par l'émotion immédiate et de faire un choix rationnel."
          },
          {
            question: "Comment calculer la valeur réelle d'un achat de confort ?",
            options: [
              "En comparant sa couleur avec celle de ses vêtements",
              "En traduisant le prix de l'objet en heures de travail réelles nécessaires pour le payer",
              "En demandant une réduction systématique au vendeur"
            ],
            correctOptionIndex: 1,
            explanation: "Rapporter le coût d'un produit à l'effort physique ou intellectuel fourni au travail est un excellent moyen de calmer les dépenses superflues."
          },
          {
            question: "Quel comportement d'achat est à proscrire pour préserver sa santé financière ?",
            options: [
              "Négocier de bons prix au Souq d'artisanat",
              "Acheter de manière impulsive en utilisant les découverts ou des micro-crédits revolving",
              "Faire des listes de courses détaillées à l'avance"
            ],
            correctOptionIndex: 1,
            explanation: "L'utilisation du crédit revolving ou de facilités de caisse pour financer du superflu engendre des intérêts vertigineux et fragilise vos finances."
          }
        ]
      }
    ]
  },
  {
    id: 'credit_maroc',
    title: "Comprendre le crédit au Maroc",
    titleDarija: "Fahm l-Crédit f l-Maroc",
    level: 'intermediaire',
    category: 'credit',
    descriptionFr: "Maîtrise le fonctionnement des emprunts bancaires marocains, des taux fixes à la Mourabaha.",
    descriptionDarija: "T3allem kifach kaykhdem l-crédit d-sakan o l-consommation, o l-farq m3a l-Mourabaha.",
    lessons: [
      {
        id: 'credit_maroc_l1',
        title: "Le crédit immobilier : Classique vs Mourabaha",
        estimatedMinutes: 5,
        contentParagraphs: [
          "L'achat d'un bien immobilier est souvent l'engagement financier le plus lourd d'une vie au Maroc. Les particuliers ont le choix entre deux grands modèles de financement : le crédit immobilier classique (proposé par les banques conventionnelles) et le financement participatif Mourabaha (proposé par les banques participatives agréées par Bank Al-Maghrib).",
          "Le crédit classique repose sur un prêt d'argent rémunéré par un taux d'intérêt (généralement fixe ou variable, situé autour de 4% à 5%). La banque prête la somme et l'emprunteur rembourse le capital assorti d'intérêts mensuels.",
          "La Mourabaha, quant à elle, n'est pas un prêt d'argent. C'est un contrat de vente. La banque acquiert le bien immobilier à son nom, puis te le revend à un prix majoré d'une marge bénéficiaire convenue d'avance. Tu rembourses ensuite ce prix de vente sous forme de mensualités fixes sur une période définie. Il n'y a aucun intérêt de retard cumulatif, mais le coût global peut s'avérer supérieur ou égal selon les dossiers."
        ],
        quiz: [
          {
            question: "Quelle est la différence fondamentale du contrat Mourabaha par rapport au crédit classique ?",
            options: [
              "C'est un prêt d'argent à taux d'intérêt zéro de l'État",
              "C'est un contrat d'achat/revente de bien par la banque avec une marge convenue, sans prêt d'argent direct",
              "La Mourabaha est réservée uniquement à l'achat de terrains agricoles"
            ],
            correctOptionIndex: 1,
            explanation: "Dans une Mourabaha, la banque achète le bien immobilier puis vous le revend avec un bénéfice fixe. Il s'agit d'une transaction commerciale conforme aux principes de la finance participative."
          },
          {
            question: "Quel est l'impact d'un taux d'intérêt immobilier révisable (variable) au Maroc ?",
            options: [
              "Il reste fixe pendant toute la durée du crédit quoi qu'il arrive",
              "Il peut augmenter ou diminuer selon l'évolution du taux directeur de Bank Al-Maghrib, faisant varier vos mensualités",
              "Il est interdit par la loi marocaine"
            ],
            correctOptionIndex: 1,
            explanation: "Un taux variable répercute les hausses et baisses des taux financiers du pays, ce qui peut rendre vos mensualités instables et risquées sur 25 ans."
          },
          {
            question: "Quel critère doit-on absolument comparer au-delà de la mensualité affichée ?",
            options: [
              "La couleur de la carte bancaire fournie",
              "Le TEG (Taux Effectif Global) qui englobe les intérêts, frais de dossier et assurances obligatoires",
              "Le nombre d'agences de la banque dans la ville"
            ],
            correctOptionIndex: 1,
            explanation: "Le TEG représente le coût réel et global de votre crédit. Il intègre tous les frais annexes indispensables (comme l'assurance décès/invalidité)."
          }
        ]
      },
      {
        id: 'credit_maroc_l2',
        title: "Le crédit à la consommation et ses risques",
        estimatedMinutes: 5,
        contentParagraphs: [
          "Le crédit à la consommation est un outil bancaire qui permet d'emprunter rapidement des fonds pour des besoins de court terme (achat d'électroménager, réparation de véhicule, frais de scolarité de la rentrée scolaire ou financement de vacances). S'il paraît séduisant, il comporte des taux d'intérêt (TEG) très élevés au Maroc, oscillant souvent entre 6% et 12%.",
          "L'utilisation répétée du crédit à la consommation crée l'effet boule de neige inverse de l'épargne : tu t'appauvris en payant aujourd'hui avec tes revenus futurs, augmentés de frais d'intérêts massifs. Le danger ultime est le surendettement, défini au Maroc lorsque les mensualités globales dépassent 40% à 45% de ton salaire net disponible.",
          "Pour préserver ton pouvoir d'achat, suis une règle stricte : ne contracte jamais de crédit pour des biens de consommation dépréciables ou des dépenses éphémères (vacances, mariages, cadeaux). Attends d'avoir épargné la somme requise dans un sandoq dédié sur Floussi."
        ],
        quiz: [
          {
            question: "Quel est l'ordre de grandeur moyen des taux d'intérêt (TEG) des crédits à la consommation au Maroc ?",
            options: [
              "Entre 1% et 3%",
              "Entre 6% et 12%",
              "Ils sont gratuits selon la charte du consommateur"
            ],
            correctOptionIndex: 1,
            explanation: "Les taux de crédit à la consommation sont extrêmement onéreux par rapport aux taux de crédit immobilier, ce qui en fait un piège d'endettement rapide."
          },
          {
            question: "Qu'est-ce que le taux d'endettement maximum couramment accepté par les banques au Maroc ?",
            options: [
              "Environ 10% de vos revenus nets",
              "Entre 40% et 50% du salaire mensuel net",
              "Il n'y a pas de limite légale ou bancaire"
            ],
            correctOptionIndex: 1,
            explanation: "Dépasser 45% de taux d'endettement laisse un 'reste à vivre' trop faible pour faire face aux dépenses alimentaires et imprévus quotidiens."
          },
          {
            question: "Quel type d'achat ne devrait JAMAIS être financé par un crédit à la consommation ?",
            options: [
              "Des vacances d'été ou un événement festif éphémère",
              "Un investissement immobilier locatif",
              "Le lancement d'une entreprise commerciale rentable"
            ],
            correctOptionIndex: 0,
            explanation: "Emprunter à un taux élevé pour une dépense de loisir éphémère détruit durablement votre capital et installe de mauvaises habitudes de vie au-dessus de vos moyens."
          }
        ]
      },
      {
        id: 'credit_maroc_l3',
        title: "Décrypter son tableau d'amortissement",
        estimatedMinutes: 4,
        contentParagraphs: [
          "Lorsque tu contractes un crédit immobilier ou à la consommation, la banque te remet obligatoirement un document crucial : le tableau d'amortissement. Ce tableau détaille, ligne par ligne et mois après mois, la décomposition de chaque mensualité que tu vas verser.",
          "Chaque mensualité se compose de trois éléments principaux : 1) La part de Capital remboursé (qui diminue la dette réelle), 2) La part d'Intérêts (la rémunération de la banque), et 3) L'Assurance obligatoire de l'emprunteur.",
          "Au début d'un crédit à long terme, la part d'intérêts est gigantesque tandis que la part de capital remboursé est minuscule. C'est pourquoi, si tu décides de revendre ton bien ou de rembourser par anticipation après seulement 5 ans sur un crédit de 25 ans, tu constateras avec surprise que ta dette restante auprès de la banque n'a que très peu baissé. Comprendre cette mécanique permet de mieux évaluer l'intérêt d'un remboursement anticipé (qui peut être soumis à des indemnités de max 4% du capital restant dû au Maroc)."
        ],
        quiz: [
          {
            question: "De quoi est principalement constituée votre mensualité durant les premières années d'un crédit immobilier de 20 ans ?",
            options: [
              "Essentiellement de capital remboursé",
              "Majoritairement d'intérêts versés à la banque",
              "Uniquement de frais d'assurances décès"
            ],
            correctOptionIndex: 1,
            explanation: "Au début du prêt, les intérêts sont calculés sur un capital restant dû maximal, représentant donc la part dominante de vos mensualités."
          },
          {
            question: "Que représente le 'capital restant dû' sur un tableau d'amortissement ?",
            options: [
              "La somme totale des intérêts que vous devez encore payer",
              "Le solde réel de la dette que vous devez rembourser si vous soldez le prêt aujourd'hui",
              "La valeur estimée de votre maison sur le marché"
            ],
            correctOptionIndex: 1,
            explanation: "Le capital restant dû est le montant net que vous devez encore restituer à la banque à un instant T, hors intérêts futurs."
          },
          {
            question: "Au Maroc, quel est le plafond légal des frais de remboursement anticipé (indemnités) pour un crédit classique ?",
            options: [
              "Aucun plafond, la banque décide librement",
              "Plafonné à un montant équivalent à 4% du capital restant dû ou moins selon les contrats",
              "Ils sont strictement interdits par Bank Al-Maghrib"
            ],
            correctOptionIndex: 1,
            explanation: "La loi marocaine encadre ces frais d'indemnité de remboursement anticipé (IRA) pour protéger les consommateurs qui souhaitent se libérer plus tôt de leur dette."
          }
        ]
      }
    ]
  },
  {
    id: 'investing_maroc',
    title: "Investir au Maroc",
    titleDarija: "Estethmar f l-Maroc",
    level: 'intermediaire',
    category: 'investissement',
    descriptionFr: "Initie-toi aux supports d'investissement locaux, des actions de la Bourse de Casa aux OPCVM.",
    descriptionDarija: "T3allem kifach t-stethmer floussek f l-bourse d Casa, OPCVM, o l-aqar.",
    lessons: [
      {
        id: 'investing_maroc_l1',
        title: "Les OPCVM expliqués simplement",
        estimatedMinutes: 5,
        contentParagraphs: [
          "Investir directement en bourse ou dans l'immobilier requiert du temps, du capital conséquent et des connaissances poussées. Pour les particuliers, les OPCVM (Organismes de Placement Collectif en Valeurs Mobilières) représentent l'un des moyens les plus simples et accessibles de faire fructifier leur épargne au Maroc.",
          "Un OPCVM est un panier d'actifs financiers (actions, obligations d'État, bons du trésor) géré par des professionnels agréés par l'AMMC (Autorité Marocaine du Marché des Capitaux). En achetant des parts d'un OPCVM, tu délègues la gestion de ton argent et bénéficies d'une diversification immédiate, ce qui réduit considérablement les risques.",
          "Il existe plusieurs types d'OPCVM selon ton profil de risque. Les OPCVM 'Monétaires' ou 'Obligataires court terme' sont très sûrs et adaptés pour de l'épargne de moyen terme (rendements stables mais modérés). Les OPCVM 'Actions' investissent dans les grandes entreprises marocaines cotées et visent des performances bien plus élevées à long terme (au prix d'une volatilité temporaire)."
        ],
        quiz: [
          {
            question: "Qu'est-ce qu'un OPCVM au Maroc ?",
            options: [
              "Un programme d'aide sociale de l'État pour l'accès au logement",
              "Un fonds d'investissement collectif qui regroupe l'épargne de milliers de particuliers pour la diversifier",
              "Un type de compte d'épargne bloqué sur 30 ans"
            ],
            correctOptionIndex: 1,
            explanation: "Les OPCVM (fonds mutuels de placement) permettent d'accéder facilement et à moindres frais à un portefeuille diversifié d'actions et obligations géré par des experts agréés."
          },
          {
            question: "Quel est l'avantage principal d'investir via un OPCVM plutôt que d'acheter des actions individuelles ?",
            options: [
              "Les OPCVM garantissent 100% de gains tous les jours",
              "Une diversification immédiate qui réduit l'impact de la baisse d'une seule entreprise",
              "Il n'y a aucuns frais de gestion de portefeuille"
            ],
            correctOptionIndex: 1,
            explanation: "La diversification est la règle n°1 de l'investisseur : en répartissant votre capital sur des dizaines d'entreprises, vous limitez le risque lié à un échec individuel."
          },
          {
            question: "Pour un projet d'épargne de 2 ans très sécurisé, quel type d'OPCVM privilégier ?",
            options: [
              "OPCVM Actions de croissance technologique",
              "OPCVM Monétaire ou Obligataire à court terme",
              "OPCVM Spéculatif sur matières premières"
            ],
            correctOptionIndex: 1,
            explanation: "Les fonds monétaires et obligataires court terme offrent d'excellents rapports sécurité/liquidité pour des horizons de placement courts de quelques années."
          }
        ]
      },
      {
        id: 'investing_maroc_l2',
        title: "La Bourse de Casablanca pour les particuliers",
        estimatedMinutes: 5,
        contentParagraphs: [
          "La Bourse de Casablanca est la place financière marocaine où s'échangent les actions de plus de 70 grandes entreprises nationales (Maroc Telecom, Attijariwafa Bank, Label'Vie, LafargeHolcim Maroc, etc.). Devenir actionnaire signifie acheter une petite part de ces entreprises, et ainsi participer à leur succès.",
          "Les investisseurs en bourse gagnent de l'argent de deux manières : d'une part grâce aux Dividendes (la part des bénéfices annuels reversée directement aux actionnaires, traditionnellement généreuse au Maroc), et d'autre part grâce à la Plus-value (si le cours de l'action augmente au fil des années).",
          "Pour acheter des actions à titre individuel, tu dois obligatoirement ouvrir un compte-titres ou un Plan d'Épargne Actions (PEA) auprès d'une société de bourse agréée ou de ta banque. Attention, la bourse n'est pas un casino : il faut y investir de l'argent dont tu n'as pas besoin pour vivre à court terme, et viser un horizon de placement de 5 à 10 ans minimum."
        ],
        quiz: [
          {
            question: "Comment un investisseur particulier gagne-t-il de l'argent à la Bourse de Casablanca ?",
            options: [
              "Uniquement si l'État lui verse des subventions de compensation",
              "Grâce aux dividendes (bénéfices redistribués) et à la plus-value de revente des actions",
              "En revendant ses comptes bancaires aux enchères"
            ],
            correctOptionIndex: 1,
            explanation: "L'investissement en actions produit de la valeur via les dividendes réguliers versés par les entreprises saines et la hausse de la valeur des titres sur le long terme."
          },
          {
            question: "Quel est l'horizon d'investissement recommandé pour placer son capital en bourse ?",
            options: [
              "Quelques jours pour faire des gains rapides",
              "De 5 à 10 ans minimum (moyen et long terme)",
              "Exactement 6 mois"
            ],
            correctOptionIndex: 1,
            explanation: "La bourse connaît des cycles de hausse et de baisse. Investir sur le long terme (5-10 ans) permet de lisser la volatilité et de profiter de la croissance économique réelle des entreprises."
          },
          {
            question: "Quel compte avantageux sur le plan fiscal peut-on ouvrir pour investir en actions au Maroc ?",
            options: [
              "Un compte courant classique",
              "Un PEA (Plan d'Épargne Actions) qui offre une exonération d'impôt sur les plus-values sous conditions de durée",
              "Un carnet de chèques bloqué"
            ],
            correctOptionIndex: 1,
            explanation: "Au Maroc, le PEA permet de bénéficier d'une exonération totale d'impôt sur le revenu sur les dividendes et plus-values après 5 ans de détention, dans la limite d'un plafond de versement."
          }
        ]
      },
      {
        id: 'investing_maroc_l3',
        title: "Comprendre le couple Rendement/Risque",
        estimatedMinutes: 4,
        contentParagraphs: [
          "En finance, il existe une loi universelle absolue : le couple rendement/risque. Il est mathématiquement impossible d'obtenir un rendement élevé sans accepter une part de risque ou de volatilité équivalente sur ton capital.",
          "Si un intermédiaire financier, un groupe d'entraide ou une plateforme en ligne te promet au Maroc des rendements magiques de '15% ou 20% par mois garantis et sans risque', il s'agit à coup sûr d'une arnaque financière (comme une chaîne de Ponzi ou des placements hautement frauduleux). Un rendement garanti sans risque au Maroc (comme l'État ou le Compte sur Carnet) oscille généralement entre 2% et 4% par an.",
          "Pour construire ta liberté financière, tu dois équilibrer ton portefeuille : une partie en placements hyper-sécurisés (fonds d'urgence, compte sur carnet), et une partie de ton épargne mensuelle sur des placements plus dynamiques (OPCVM Actions, immobilier) acceptant des variations de valeur quotidiennes pour capturer une croissance solide à long terme."
        ],
        quiz: [
          {
            question: "Quelle est la règle absolue concernant le rendement et le risque en investissement ?",
            options: [
              "On peut facilement trouver un rendement de 30% par an sans aucun risque",
              "Le rendement potentiel est directement proportionnel au risque accepté (pas de gain élevé sans risque)",
              "Le risque disparaît si on investit uniquement le vendredi"
            ],
            correctOptionIndex: 1,
            explanation: "Toute promesse de fort rendement sans risque associé est une anomalie mathématique ou une escroquerie."
          },
          {
            question: "Quel taux de rendement annuel réel et garanti peut-on attendre d'un support sans risque au Maroc ?",
            options: [
              "Environ 2% à 4% par an",
              "Exactement 15% par an",
              "Le rendement est toujours négatif à cause des impôts"
            ],
            correctOptionIndex: 0,
            explanation: "Les placements sans risque (comme les Comptes sur Carnet ou les Bons du Trésor marocains à court terme) offrent des taux stables et bas, proches de l'inflation."
          },
          {
            question: "Comment se prémunir efficacement contre la perte en capital tout en cherchant de la croissance ?",
            options: [
              "Placer tout son capital sur une seule action à fort potentiel",
              "Diversifier son portefeuille entre placements de sécurité liquide et placements de croissance à long terme",
              "Garder tout son argent en liquide à la maison"
            ],
            correctOptionIndex: 1,
            explanation: "L'équilibre du patrimoine (répartition d'actifs) amortit les chocs en cas de baisse des marchés tout en capturant les opportunités de croissance."
          }
        ]
      }
    ]
  },
  {
    id: 'retirement_prep',
    title: "Préparer sa retraite au Maroc",
    titleDarija: "Retraite d-Dhabya",
    level: 'avance',
    category: 'retraite',
    descriptionFr: "Maîtrise le système de retraite marocain de la CNSS et planifie ta propre rente complémentaire.",
    descriptionDarija: "Fhem l-calcul dyal pension CNSS, CIMR o l-placements d-retraite dyalek.",
    lessons: [
      {
        id: 'retirement_prep_l1',
        title: "Fonctionnement de la CNSS et de la CIMR",
        estimatedMinutes: 5,
        contentParagraphs: [
          "Le système de retraite légal au Maroc pour les salariés du secteur privé s'appuie principalement sur la Caisse Nationale de Sécurité Sociale (CNSS). Pour bénéficier d'une pension de retraite CNSS à l'âge légal (généralement 60 ans), le salarié doit cumuler un nombre de jours de cotisation strict.",
          "Le minimum requis est de 3 240 jours de cotisation (ce qui correspond à environ 15 ans d'activité salariée continue). Si tu atteins ce seuil, tu obtiens une pension de base égale à 50% de ton salaire mensuel moyen de référence. Ce salaire de référence est malheureusement plafonné par la loi marocaine à 6 000 DH par mois. Ainsi, même si ton salaire réel moyen était de 15 000 DH, la CNSS calculera ta pension sur une base de 6 000 DH maximum, te versant au mieux 3 000 DH par mois, ou 4 200 DH (70% max) si tu as cumulé beaucoup d'années supplémentaires.",
          "Pour pallier ce plafonnement très bas, les entreprises et les cadres souscrivent souvent à la CIMR (Caisse Interprofessionnelle Marocaine de Retraite). La CIMR fonctionne selon un système par points : tes cotisations mensuelles se convertissent en points capitalisés qui détermineront un complément de revenus substantiel à la retraite."
        ],
        quiz: [
          {
            question: "Quel est le nombre minimum de jours de cotisation exigé par la CNSS pour prétendre à une pension de retraite au Maroc ?",
            options: [
              "1 000 jours",
              "3 240 jours (environ 15 ans de travail salarié)",
              "10 000 jours"
            ],
            correctOptionIndex: 1,
            explanation: "Le seuil légal de 3240 jours est impératif sous le régime CNSS classique pour déclencher le versement d'une pension de vieillesse."
          },
          {
            question: "Quel est le plafond légal du salaire mensuel de référence pris en compte par la CNSS pour calculer la pension de retraite ?",
            options: [
              "Il n'y a aucun plafond",
              "Plafonné à 6 000 DH par mois",
              "Plafonné à 20 000 DH par mois"
            ],
            correctOptionIndex: 1,
            explanation: "C'est la limite majeure du système public marocain : le salaire de référence servant au calcul est bloqué à 6 000 DH, limitant fortement la pension autonome des classes moyennes et supérieures."
          },
          {
            question: "Quel est le rôle de la CIMR dans le paysage de la retraite marocaine ?",
            options: [
              "Un organisme qui distribue des aides de l'État pour le logement social",
              "Une caisse de retraite complémentaire par points pour rehausser le niveau de revenus des retraités du privé",
              "Une assurance maladie obligatoire complémentaire"
            ],
            correctOptionIndex: 1,
            explanation: "La CIMR permet d'épargner au-delà du plafond CNSS afin de conserver un niveau de vie décent après la vie active."
          }
        ]
      },
      {
        id: 'retirement_prep_l2',
        title: "Pourquoi commencer tôt ? L'intérêt composé",
        estimatedMinutes: 5,
        contentParagraphs: [
          "L'intérêt composé est souvent qualifié de 'huitième merveille du monde' par les grands financiers. Sa mécanique est d'une simplicité redoutable mais produit des effets vertigineux à long terme : les intérêts que ton argent produit chaque année sont réinvestis et produisent à leur tour de nouveaux intérêts.",
          "Imaginons deux épargnants marocains, Samir et Kenza, qui visent tous deux la retraite à 60 ans sur un support affichant un rendement de 7% par an. Samir commence à épargner 1 000 DH par mois dès l'âge de 25 ans. Il s'arrête à 35 ans (il aura versé 120 000 DH au total) et laisse son argent fructifier sans plus rien verser. De son côté, Kenza commence à épargner 1 000 DH par mois mais commence seulement à 35 ans et continue jusqu'à ses 60 ans (elle aura versé 300 000 DH sur 25 ans).",
          "À l'âge de 60 ans, Samir possédera un capital d'environ 1 100 000 DH alors qu'il n'a épargné que pendant 10 ans ! Kenza, malgré un effort d'épargne plus de deux fois supérieur sur 25 ans, ne possédera que 810 000 DH. Cet exemple concret prouve que le temps est le facteur le plus puissant pour bâtir son patrimoine : commencer tôt demande deux fois moins d'efforts financiers."
        ],
        quiz: [
          {
            question: "Qu'est-ce que le principe des intérêts composés (Moun7ana l-Ossi) ?",
            options: [
              "Des frais d'intérêts bancaires de plus en plus élevés sur vos dettes",
              "Le fait que vos gains réinvestis génèrent eux-mêmes de nouveaux gains au fil du temps",
              "Un intérêt calculé uniquement sur l'argent liquide"
            ],
            correctOptionIndex: 1,
            explanation: "C'est l'effet boule de neige : vos bénéfices travaillent à leur tour pour créer de la richesse de manière autonome."
          },
          {
            question: "Dans l'exemple de Samir et Kenza, pourquoi Samir finit-il avec un capital plus important à 60 ans en ayant épargné moins ?",
            options: [
              "Parce qu'il a bénéficié d'un taux d'intérêt magique réservé aux jeunes",
              "Grâce au facteur temps : son capital a disposé de 10 années de capitalisation supplémentaires sans interruption",
              "Parce que Samir a mieux négocié son contrat bancaire au Maroc"
            ],
            correctOptionIndex: 1,
            explanation: "Le temps est l'ingrédient principal de la formule mathématique de l'intérêt composé. Commencer 10 ans plus tôt change drastiquement la courbe de croissance."
          },
          {
            question: "Quelle conclusion pratique doit-on en tirer pour son épargne personnelle ?",
            options: [
              "Qu'il vaut mieux attendre d'avoir 50 ans pour épargner de très grosses sommes d'un coup",
              "Qu'il faut commencer à épargner régulièrement le plus tôt possible, même de très petites sommes (ex: 200 DH/mois)",
              "Qu'épargner ne sert à rien si on ne gagne pas 30 000 DH par mois"
            ],
            correctOptionIndex: 1,
            explanation: "Même de micro-contributions de 200 DH par mois à 22 ans créent un socle financier colossal à la retraite grâce aux décennies de capitalisation cumulée."
          }
        ]
      },
      {
        id: 'retirement_prep_l3',
        title: "Optimiser avec l'Assurance Épargne Retraite",
        estimatedMinutes: 5,
        contentParagraphs: [
          "Au Maroc, l'État encourage fortement les citoyens à préparer leur propre retraite en leur offrant un cadre fiscal d'exception à travers les contrats d'Assurance Épargne Retraite active (proposés par les compagnies d'assurance marocaines ou via ta banque).",
          "Le gros avantage réside dans la déductibilité fiscale intégrale de tes versements. Si tu es salarié, les cotisations versées sur un plan d'épargne retraite individuel sont déductibles à 100% de ton assiette imposable de l'Impôt sur le Revenu (Art. 28 du Code Général des Impôts), sans aucun plafond ! Si tu te situes dans la tranche d'imposition à 38%, chaque versement de 1 000 DH te coûte réellement seulement 620 DH nets, l'État prenant en charge indirectement les 380 DH restants sous forme de réduction d'impôt automatique sur ton bulletin de paie.",
          "Pour conserver cet avantage fiscal majeur, le capital épargné doit rester bloqué jusqu'à l'âge de 50 ans minimum et le contrat doit avoir une durée de vie d'au moins 8 ans. À la sortie, tu pourras récupérer ton capital sous forme de capital unique faiblement imposé ou de rente mensuelle quasi-exonérée d'impôts."
        ],
        quiz: [
          {
            question: "Quel est l'avantage fiscal majeur d'une Assurance Épargne Retraite individuelle au Maroc pour un salarié ?",
            options: [
              "Il n'y a aucun avantage fiscal",
              "Les cotisations versées sont déductibles à 100% du salaire brut imposable (Art. 28 du CGI), réduisant immédiatement votre impôt IGR",
              "L'État double votre capital à la fin de l'année"
            ],
            correctOptionIndex: 1,
            explanation: "Le Code Général des Impôts marocain permet aux salariés de déduire la totalité de leurs cotisations de retraite de l'assiette de l'IR, ce qui constitue la plus puissante niche fiscale du pays."
          },
          {
            question: "Quelles sont les deux conditions d'âge et de durée pour conserver définitivement cet avantage fiscal sans pénalité au Maroc ?",
            options: [
              "Avoir au moins 30 ans et 3 ans d'ancienneté de contrat",
              "Atteindre l'âge de 50 ans révolus et détenir le contrat depuis au moins 8 ans",
              "Retirer l'argent uniquement pendant le mois de Ramadan"
            ],
            correctOptionIndex: 1,
            explanation: "Retirer son capital avant 50 ans ou avant 8 ans de détention du contrat entraîne une requalification fiscale lourde avec un prélèvement d'impôt à la source rétroactif."
          },
          {
            question: "Si vous êtes imposé à une tranche de 34% d'IGR, quel est le coût net réel pour vous d'un versement de 1 000 DH sur votre plan de retraite ?",
            options: [
              "1 000 DH",
              "660 DH (l'État vous reversant 340 DH de baisse d'impôt)",
              "340 DH"
            ],
            correctOptionIndex: 1,
            explanation: "Grâce à la déduction d'impôt, un versement de 1000 DH réduit votre assiette fiscale et diminue votre impôt de 340 DH, ramenant l'effort d'épargne réel à seulement 660 DH."
          }
        ]
      }
    ]
  },
  {
    id: 'tax_maroc',
    title: "Fiscalité personnelle marocaine",
    titleDarija: "Driba f l-Maroc",
    level: 'avance',
    category: 'fiscalite',
    descriptionFr: "Comprends le fonctionnement de l'IGR marocain, tes fiches de paie et les déductions légales.",
    descriptionDarija: "Fhem l-calcul d l-impôt IGR f la fiche de paie dyalek o l-ikhsaat l-qanouniya.",
    lessons: [
      {
        id: 'tax_maroc_l1',
        title: "Comprendre l'Impôt sur le Revenu (IGR)",
        estimatedMinutes: 5,
        contentParagraphs: [
          "L'Impôt sur le Revenu (IGR) au Maroc s'applique aux revenus professionnels, salaires, revenus agricoles, ainsi qu'aux gains fonciers et mobiliers. Pour la majorité des citoyens, il est prélevé directement à la source chaque mois sur le bulletin de paie par l'employeur.",
          "Le barème de l'IGR marocain est progressif et comporte plusieurs tranches d'imposition allant de 0% (pour la tranche de salaire net imposable annuelle inférieure à 40 000 DH en 2025/2026 suite aux réformes de la Loi de Finances) jusqu'à un taux marginal maximal de 37% ou 38% pour les hauts revenus.",
          "Il est primordial de faire la différence entre ton Salaire Brut (le montant global avant impôts et cotisations sociales), ton Salaire Net Imposable (le salaire brut diminué des charges sociales déductibles comme la CNSS, l'assurance maladie, et les frais professionnels forfaitaires légaux), et ton Salaire Net Réel (l'argent qui arrive effectivement sur ton compte en banque). Savoir lire ces lignes te permet de comprendre exactement le coût de l'impôt dans ta vie quotidienne."
        ],
        quiz: [
          {
            question: "Comment est prélevé l'IGR pour un salarié du secteur privé au Maroc ?",
            options: [
              "Le salarié doit envoyer un chèque au Trésor public à la fin de chaque année",
              "Il est prélevé directement à la source chaque mois par l'employeur sur le bulletin de paie",
              "L'impôt est payé sous forme de taxes lors des achats au supermarché"
            ],
            correctOptionIndex: 1,
            explanation: "Au Maroc, le prélèvement à la source décharge le salarié des calculs complexes, l'employeur effectuant le versement de l'IGR directement à l'administration fiscale."
          },
          {
            question: "Qu'est-ce que le 'Salaire Net Imposable' ?",
            options: [
              "Le salaire brut total avant déduction",
              "L'assiette financière sur laquelle l'impôt IGR est calculé, obtenue après déduction des charges sociales et des abattements professionnels légaux",
              "L'argent net qui vous est viré à la fin du mois sur votre compte bancaire"
            ],
            correctOptionIndex: 1,
            explanation: "Le salaire net imposable est inférieur au salaire brut car l'État retire de l'assiette fiscale les montants indispensables aux cotisations de sécurité sociale et aux frais de fonctionnement professionnel."
          },
          {
            question: "Que signifie un impôt à barème progressif ?",
            options: [
              "Que tout le monde paie exactement le même pourcentage d'impôt quel que soit son salaire",
              "Que le taux d'imposition augmente par tranches successives au fur et à mesure que les revenus s'élèvent",
              "Que l'impôt augmente tous les ans automatiquement"
            ],
            correctOptionIndex: 1,
            explanation: "La progressivité fiscale marocaine signifie que vos premiers dirhams gagnés ne sont pas imposés, et que seules les tranches supérieures de votre revenu subissent les taux d'imposition les plus hauts."
          }
        ]
      },
      {
        id: 'tax_maroc_l2',
        title: "Les déductions fiscales légales au Maroc",
        estimatedMinutes: 5,
        contentParagraphs: [
          "Le Code Général des Impôts (CGI) marocain offre plusieurs opportunités légales de réduire son IGR, appelées 'déductions fiscales'. Utiliser ces outils est un droit fondamental pour optimiser ton pouvoir d'achat.",
          "La première déduction majeure concerne l'achat de ta résidence principale. Si tu contractes un crédit immobilier pour acquérir ton logement principal (de type logement social ou de standing normal), les intérêts de ton crédit (dans la limite de 10% du salaire net imposable) ou le coût d'acquisition en Mourabaha sont intégralement déductibles de ton revenu imposable, ce qui allège considérablement ton impôt mensuel.",
          "La deuxième grande déduction, comme vu précédemment, est celle de l'Assurance Retraite individuelle (sans aucun plafond s'il s'agit d'un plan de retraite classique par versements réguliers). En combinant ces dispositifs, un cadre marocain moyen peut légalement réduire son impôt mensuel de plusieurs centaines à plusieurs milliers de dirhams par an, réinjectables directement dans son épargne productive."
        ],
        quiz: [
          {
            question: "Quelle déduction fiscale peut-on appliquer lors de l'acquisition de sa résidence principale au Maroc ?",
            options: [
              "Les frais de peinture et d'aménagement intérieur",
              "La totalité ou une partie des intérêts du crédit immobilier ou de la marge bénéficiaire Mourabaha",
              "La taxe d'édilité locale est gratuite à vie"
            ],
            correctOptionIndex: 1,
            explanation: "L'État encourage l'accès à la propriété en vous permettant d'enlever le coût des intérêts d'emprunt de votre salaire imposable, ce qui baisse vos impôts mensuels."
          },
          {
            question: "Quel est le plafond de déduction pour les versements dans un plan de retraite complémentaire pour un salarié au Maroc ?",
            options: [
              "Plafonné à 10 000 DH par an",
              "Aucun plafond (déductibilité intégrale du salaire brut imposable)",
              "La déduction est limitée à 50% de la cotisation"
            ],
            correctOptionIndex: 1,
            explanation: "Pour les salariés, les cotisations d'assurance retraite ne connaissent pas de plafond de déduction de l'IGR salarial (Art. 28 du CGI), offrant un espace d'optimisation massif."
          },
          {
            question: "Comment activer concrètement ces déductions fiscales ?",
            options: [
              "En le demandant poliment au guichet de sa banque",
              "En remettant les justificatifs (attestation d'intérêts, contrat d'assurance) au service RH/comptabilité de son employeur pour ajustement sur la paie",
              "Elles s'activent de manière automatique par puce GPS"
            ],
            correctOptionIndex: 1,
            explanation: "Le service des ressources humaines de votre entreprise ajustera votre bulletin de paie mensuel pour y intégrer ces exonérations légales."
          }
        ]
      },
      {
        id: 'tax_maroc_l3',
        title: "Erreurs fiscales courantes et déclaration",
        estimatedMinutes: 4,
        contentParagraphs: [
          "Beaucoup de contribuables marocains commettent des erreurs simples par méconnaissance du système fiscal, ce qui leur coûte parfois de l'argent ou des pénalités inutiles auprès de la Direction Générale des Impôts (DGI).",
          "Une erreur classique est de ne pas déclarer ses revenus annexes (comme les revenus de location d'un petit studio ou d'un garage). Le fisc marocain croise de plus en plus les bases de données (contrats de bail, abonnements Lydec/Redal, etc.). Déclarer ces revenus volontairement permet de bénéficier de taux libératoires d'impôts très bas (ex : 10% ou 15% après abattement) bien inférieurs aux redressements fiscaux éventuels.",
          "De même, si tu as plusieurs employeurs ou sources de salaires durant la même année fiscale, tu as l'obligation légale de souscrire une déclaration globale annuelle de revenus (via le portail en ligne Simpl-IGR de la DGI). Le non-respect de cette déclaration peut entraîner des pénalités de retard conséquentes. Être en règle fiscalement est le socle de base pour bâtir un patrimoine solide et serein au Maroc."
        ],
        quiz: [
          {
            question: "Quelle obligation fiscale s'impose si vous cumulez deux salaires différents de deux employeurs marocains différents durant la même année ?",
            options: [
              "Aucune, chaque employeur s'occupe de tout séparément",
              "Souscrire obligatoirement une déclaration annuelle globale de revenus sur le portail de la DGI pour régulariser les tranches d'impôt cumulées",
              "Demander à l'un des employeurs d'annuler votre salaire"
            ],
            correctOptionIndex: 1,
            explanation: "Chaque employeur calculant l'impôt comme s'il était votre unique source de revenus, le cumul des salaires vous fait grimper de tranche d'imposition, d'où l'obligation de régularisation annuelle."
          },
          {
            question: "Pourquoi est-il risqué de ne pas déclarer les loyers perçus pour un bien immobilier au Maroc ?",
            options: [
              "Parce que les locataires marocains dénoncent systématiquement leur propriétaire",
              "Car la DGI croise de plus en plus ses fichiers avec les régies d'eau, d'électricité et les contrats de bail enregistrés",
              "Parce que l'impôt sur le loyer est de 90%"
            ],
            correctOptionIndex: 1,
            explanation: "La numérisation de l'administration marocaine permet de croiser efficacement les données de consommation et de baux, rendant la fraude immobilière facilement détectable."
          },
          {
            question: "Quel portail en ligne permet d'effectuer ses démarches et déclarations fiscales au Maroc ?",
            options: [
              "Le site de la CNSS",
              "Le portail national de la Direction Générale des Impôts (DGI) - SIMPL",
              "Le site du Ministère du Tourisme"
            ],
            correctOptionIndex: 1,
            explanation: "Le portail SIMPL de la DGI permet de déclarer en ligne ses revenus fonciers, son IGR, et de payer ses impôts par carte bancaire en toute sécurité."
          }
        ]
      }
    ]
  }
];
