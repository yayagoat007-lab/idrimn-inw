/**
 * Sidi Floussi's Personality and Conversational Templates
 * Chaleureux tone, Darija + French mixed naturally.
 */

// 15 Witty financial jokes based on Moroccan daily realities
export const MOROCCAN_FINANCIAL_JOKES = [
  "Chfti sandoq dyal ahwa (café)? B7al el-kessal dyal lhammam, dima dakhliin lih drahem walakin l7arara dima mzyana!",
  "Bghit nkhbi 100 DH l-Aïd, l9itha mchat l-moul l-hanout dyal simana li fatet... hna fin mcha l-baraka!",
  "Wahed khellas 200 DH f taxi sghir f Casabarata, moul l-taxi tkhla3 o 9allih: 'A khoya hada machi voyage, ghir rkeb nweslek l-fin bghiti f Tanger kamla!'",
  "Mchat 50 DH dyal rechargeable Orange f sa3a o l9it rassi m-alloué f sandoq 'Loisirs'. Wach hada watsap oula kraya dyal l'appartement?!",
  "Moul l-hanout dima kaygoul liya 'khlass daba, ghda ssahel'... mli mchit 3ando ghda, l9ito katekeb 3liya f daftar l-kraya!",
  "Kat-alloué 500 DH l sandoq 'Alimentation' o katchri biha ghir chwaya dyal l-kefta o zitoune f souq... Safi, l-masrouf rje3 b7al sbitar!",
  "Mchit l-marjane nchri ghir khobza, l9it rassi mkhallas 300 DH dyal les recharges o dattes m3ssline... Marjane b7al daret bla nuba!",
  "Daret dyalna fiha 10 dyal nass, o ana nuba dyali l-akhira... b7al ila katsalet 3la l-khre dyal l-3am!",
  "L-enveloppe Loisirs 3andi dima fiha sifr dirham. Daba ila bghit n-nechti, kankhrej ghir n-chouf s-sba7 dyal Casablanca o rje3 n-n3ass.",
  "Kifach t-savings 10 000 DH f l-Maroc? Sahl khlass: madirch l-ahwa, matchrich l-kefta, o rkeb ghir l-kroza dyal l-7mar!",
  "Ramadan dima sandoq 'Alimentation' kaytsalet 3la l-enveloppe dyal l-kraya. Kaygoul l-loyer: 'L-marqa o s-sfouf a khoya, ghadi n-skno f l-chbakia had l-chhar!'",
  "Wahed kasseb l-mouton dyal l-Aïd f s-sandoq 'Épargne'. L-mouton rje3 kaygoul lih: 'A khoya b had s-srf li khalliti liya, ghadi n-3eydo ghir b l-mer9a dyal d-djaj!'",
  "Moul l-taxi sghir f l-Rabat mli sraft 200 DH f l-ahwa dyal 10 DH: s-sift d-dma3 dyal s-srf b7al d-darba dyal l-CNOPS!",
  "A l-khawa, l-enveloppe 'Factures' dyal Lydec b7al d-dar dyal l-ghoula: dima kaddkhol d-drahem o dima mdowya bl-khouf!",
  "Mchit n-chri l-khoudra b 20 DH, moul l-khoudra ghouwwat 3liya: 'Hadchi a khoya ghir thaman dyal s-salam o l-kalam!' L-baraka mchat!"
];

interface ResponseContext {
  fullName?: string;
  lang?: 'fr' | 'darija';
  totalBalance?: number;
  unallocated?: number;
  bucketSpent?: number;
  bucketAllocated?: number;
  bucketName?: string;
  goalName?: string;
  goalTarget?: number;
  goalCurrent?: number;
  tontineName?: string;
  tontineDueDate?: string;
  tontineAmount?: number;
  eventCountdownDays?: number;
  eventName?: string;
  amount?: number;
  categoryName?: string;
  merchant?: string;
  walletBalance?: number;
  recipientName?: string;
  roundupSavings?: number;
  remittanceTotal?: number;
  remoteBudgetLimit?: number;
  remoteBudgetSpent?: number;
  activeChallengesCount?: number;
  recommendedLessonTitle?: string;
  completedLessonsCount?: number;
  certificatesCount?: number;
  referralCode?: string;
  invitedFriendsCount?: number;
  savingsGroupCount?: number;
  savingsGroupBalance?: number;
  floussiScore?: number;
  floussiTier?: string;
  scoreTip?: string;
  pointsToNextTier?: number;
  weeklyReportSummary?: string;
  optimizationChallengeTitle?: string;
  monthlyReviewMonth?: string;
  planUpgradeNotice?: string;
  unreadNotificationsCount?: number;
  notificationSummary?: string;
  searchQuery?: string;
  searchResultsCount?: number;
  searchResultsSummary?: string;
  preferenceKey?: string;
  preferenceValue?: string;
  preferenceStatus?: string;
}

export function getPersonalityResponse(intentId: string, context: ResponseContext = {}): string {
  const lang = context.lang || 'fr';
  const name = context.fullName || 'A khoya';
  const amount = context.amount ? `${context.amount} DH` : "un montant";
  const cat = context.categoryName || "quelque chose";
  const merch = context.merchant ? `chez ${context.merchant}` : "";

  // Time-of-day greeting modifier
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 13) {
      return lang === 'darija' ? `Sbah l'khair a ${name} ! 🌅` : `Bonjour ${name} ! Sbah l'khair. 🌅`;
    } else if (hr >= 13 && hr < 18) {
      return lang === 'darija' ? `Salam a ${name} ! ☕` : `Salam ${name} ! J'espère que ta journée se passe bien. ☕`;
    } else {
      return lang === 'darija' ? `Msa l'khair a ${name} ! 🌙` : `Bonsoir ${name} ! Msa l'khair. 🌙`;
    }
  };

  const templates: Record<string, string[]> = {
    greeting: [
      `${getGreeting()} Labess 3lik ? Comment se portent tes finances aujourd'hui ?`,
      `${getGreeting()} Mar7ba bik ! Sidi Floussi à ton service. Qu'est-ce qu'on gère aujourd'hui ?`,
      `Salam a ${name} ! Labess, koulchi mzyan ? Je suis là pour veiller sur ton masrouf ! 🇲🇦`,
      `Ahlan a ${name} ! Sbah/msa l'khair. Prêt à optimiser tes enveloppes de cash avec la baraka ? 💸`,
      `Salam oualikoum a sidi ${name} ! Comment puis-je t'aider à faire de belles économies aujourd'hui ?`
    ],
    farewell: [
      `Beslama a ${name} ! Que la baraka soit avec ton argent. À très bientôt ! 🇲🇦`,
      `Beslama ! N'oublie pas de noter tes dépenses au fur et à mesure. Sidi Floussi surveille ! 😉`,
      `Au revoir ${name} ! Allah i3awnak f l'masrouf. Thlla f rassek !`,
      `Beslama ! Que chaque dirham dépensé soit utile. À la prochaine ! 💸`,
      `Allah ihennik ! Prends soin de ton sandoq dyal dhab. À bientôt !`
    ],
    help: [
      `Je suis Sidi Floussi, ton conseiller de poche 🇲🇦 ! Tu peux me demander :\n- *Vérifier ton solde* ("Chhal 3andi ?")\n- *Consulter une enveloppe* ("Sandouq l'makla")\n- *Noter une dépense* ("Sraft 120 DH f l'makla")\n- *Suivre tes objectifs d'Or ou d'Omra* ("Épargne")\n- *Demander une blague* ("Raconte une nokta")`,
      `Hani m3ak ! Tu peux enregistrer tes dépenses en cash très facilement. Écris juste *"sraft 50 DH pour le taxi"* ou *"reçu 3000 DH salaire"*. Tu veux tester ?`,
      `Je maîtrise la méthode des enveloppes à la marocaine ! Pose-moi des questions sur ton solde, tes tontines (Daret), ou demande-moi des conseils d'épargne !`,
      `Besoin d'aide ? Je gère tes finances sans internet ni serveurs, tout est en local ! Dis-moi par exemple : *"combien me reste-t-il dans l'enveloppe logement ?"*`,
      `Avec moi, finis les cahiers perdus ! Demande-moi ton solde total, de créer un sandoq, ou d'enregistrer ton café à 12 DH !`
    ],
    check_balance: [
      `Ma cha'a Allah ! Ton solde global actuel est de **${context.totalBalance ?? 0} DH**. Lah yzid l'baraka ! 📈`,
      `Après calcul de toutes tes enveloppes, il te reste un total de **${context.totalBalance ?? 0} DH**. Koulchi fl-aman !`,
      `Voilà la situation a sidi : ton solde global est de **${context.totalBalance ?? 0} DH**. Veille bien à respecter tes limites !`,
      `Ton argent total enregistré s'élève à **${context.totalBalance ?? 0} DH**. Prêt à allouer de nouvelles enveloppes ? 📂`,
      `Hamdoulillah ! On compte **${context.totalBalance ?? 0} DH** dans tes coffres. C'est le moment d'investir ou d'économiser.`
    ],
    check_bucket_status: [
      context.bucketName 
        ? `Pour l'enveloppe **${context.bucketName}** : Tu as alloué **${context.bucketAllocated ?? 0} DH** et dépensé **${context.bucketSpent ?? 0} DH**. Il te reste **${(context.bucketAllocated ?? 0) - (context.bucketSpent ?? 0)} DH** ! 👍`
        : `Toutes tes enveloppes (Seaux) sont bien tenues ! Les dépenses pour l'alimentation et le logement sont conformes. Quel sandoq veux-tu inspecter en détail ?`,
      context.bucketName
        ? `L'état de ton sandoq **${context.bucketName}** : **${context.bucketSpent ?? 0} DH** dépensés sur un budget de **${context.bucketAllocated ?? 0} DH**. Reste calme, il te reste **${(context.bucketAllocated ?? 0) - (context.bucketSpent ?? 0)} DH** !`
        : `Dis-moi le nom de ton enveloppe (alimentation, transport, loisirs...) et je te ferai le rapport complet du masrouf !`,
      `Sandoq inspecté ! Tu as encore de la marge. Il te reste précisément **${(context.bucketAllocated ?? 0) - (context.bucketSpent ?? 0)} DH** dans cette enveloppe. Lah ybarek.`,
      `Attention ! Pour **${context.bucketName || "ton enveloppe"}**, tu as consommé **${context.bucketSpent ?? 0} DH** sur un total de **${context.bucketAllocated ?? 0} DH**. Baraka men srf ! ⚠️`,
      `Rapport Sidi Floussi : Ton enveloppe **${context.bucketName || "sélectionnée"}** affiche **${(context.bucketAllocated ?? 0) - (context.bucketSpent ?? 0)} DH** restants. C'est géré comme un chef !`
    ],
    add_expense: [
      `Safi ! J'ai bien enregistré ta dépense de **${amount}** f l'catégorie **${cat}** ${merch}. C'est déduit de ton budget ! 💸`,
      `Noté ! **${amount}** dépensés ${merch} f **${cat}**. C'est consigné dans le registre Floussi.`,
      `Dépense validée a sidi : **${amount}** ${merch} pour **${cat}**. Tes enveloppes se mettent à jour automatiquement !`,
      `C'est bon, j'ai déduit **${amount}** f **${cat}** ${merch}. Doucement sur le masrouf a sidi ! 😉`,
      `Et voilà, **${amount}** enregistrés ${merch}. Ton sandoq a été recalculé instantanément.`
    ],
    add_expense_uncertain: [
      `J'ai bien enregistré ta dépense de **${amount}** ${merch}, mais je ne suis pas sûr de la catégorie — tu peux la corriger dans tes transactions ! 🧐`,
      `Noté : **${amount}** dépensés ${merch}, mais c'est classé comme "Non catégorisé" pour l'instant. Choisis la bonne catégorie pour garder tes sandoqs propres !`,
      `Safi, dépense de **${amount}** enregistrée. Par contre, je ne suis pas sûr de la catégorie... Tu peux cliquer ci-dessous pour la changer ! 👍`,
      `Srafti **${amount}** ${merch} ! Walakin ma3reftch l'catégorie exact... Khayra, t9der tbeddelha daba !`
    ],
    add_income: [
      `Allah ybarek ! J'ai ajouté un revenu de **${amount}** pour **${cat}** dans ton portefeuille. Lah yzid f l'baraka ! 📈`,
      `Parfait ! **${amount}** reçus f **${cat}**. Ton solde global augmente !`,
      `Revenu enregistré de **${amount}** ! C'est le moment idéal pour allouer cet argent dans tes enveloppes de rechange.`,
      `Revenu noté a sidi : **${amount}** ajoutés. Que la richesse et la baraka accompagnent ton foyer !`,
      `Hamdoulillah ! **${amount}** de plus f **${cat}**. Tu es sur la bonne voie.`
    ],
    check_goal_progress: [
      context.goalName
        ? `Pour ton objectif **${context.goalName}** : Tu as épargné **${context.goalCurrent ?? 0} DH** sur un objectif cible de **${context.goalTarget ?? 0} DH** (soit ${Math.round(((context.goalCurrent ?? 0) / (context.goalTarget ?? 1)) * 100)}% d'avancement). L'Or ou l'Omra se rapproche ! 🕋`
        : `Tu as des objectifs d'épargne très nobles (Achat d'Or, Omra, Mouton d'Aïd). Continue d'alimenter tes comptes d'épargne régulièrement !`,
      `Ton objectif **${context.goalName || "d'épargne"}** avance à grands pas ! Tu es à **${context.goalCurrent ?? 0} DH** accumulés. Encore un effort et c'est validé !`,
      `Sagesse financière : Tu as déjà collecté **${context.goalCurrent ?? 0} DH** / **${context.goalTarget ?? 0} DH** pour **${context.goalName || "ton projet"}**. Allah ysehhel !`,
      `Avancement de **${context.goalName || "ton objectif"}** : **${Math.round(((context.goalCurrent ?? 0) / (context.goalTarget ?? 1)) * 100)}%** atteint. Tu es formidable !`,
      `Chaque dirham mis de côté est un pas vers **${context.goalName || "la réussite"}**. Tu as actuellement **${context.goalCurrent ?? 0} DH** d'épargnés.`
    ],
    check_tontine_reminder: [
      context.tontineName
        ? `Rappel Jmâa/Daret : Pour **${context.tontineName}**, ta prochaine contribution de **${context.tontineAmount ?? 1000} DH** arrive très bientôt. Sois prêt à honorer ta parole ! 🤝`
        : `La Jmâa Digitale de Floussi te permet de suivre ta tontine sans disputes de cahier. Tout le monde paye en temps et en heure !`,
      `N'oublie pas de préparer ta cotisation pour daret **${context.tontineName || "familiale"}**. Un bon membre de la jmâa paye toujours le premier !`,
      `La tontine **${context.tontineName || ""}** est active. Ta part de **${context.tontineAmount ?? 1000} DH** est requise pour ce tour. C'est l'esprit de solidarité !`,
      `Prochain tour Jmâa : Assure-toi d'avoir approvisionné ton enveloppe tontine de **${context.tontineAmount ?? 1000} DH** pour ne pas faire attendre tes proches.`,
      `Daret avance bien ! Prépare tes **${context.tontineAmount ?? 1000} DH** pour le cercle amical.`
    ],
    check_event_countdown: [
      context.eventName
        ? `Compte à rebours 🇲🇦 : Il reste environ **${context.eventCountdownDays ?? 0} jours** avant **${context.eventName}** ! As-tu approvisionné ton enveloppe spéciale ?`
        : `Les fêtes marocaines (Ramadan, Aïd Al Adha, Rentrée Scolaire) demandent beaucoup d'anticipation. Reste vigilant sur tes enveloppes thématiques !`,
      `Tic tac... **${context.eventName || "La fête"}** arrive dans **${context.eventCountdownDays ?? 0} jours**. Prévois ton budget à l'avance pour éviter les imprévus !`,
      `Plus que **${context.eventCountdownDays ?? 0} jours** avant **${context.eventName || "l'événement"}**. J'espère que ton sandoq est bien rempli pour les festivités !`,
      `Événement national : Dans **${context.eventCountdownDays ?? 0} jours** nous célébrerons **${context.eventName || "notre fête"}**. Prépare tes enveloppes budgétaires !`,
      `Anticipation Floussi : **${context.eventCountdownDays ?? 0} jours** restants avant **${context.eventName || "l'échéance"}**. Ne te laisse pas surprendre !`
    ],
    show_spending_chart: [
      `J'ai préparé de jolis graphiques interactifs pour toi ! Rends-toi sur l'onglet **Rapports** ou **Analyses** pour voir la répartition de ton masrouf. 📊`,
      `Regarde tes graphiques de dépenses sur le tableau de bord pour visualiser où s'envolent tes billets !`,
      `Tes statistiques sont prêtes sur la page Analyses. Tu y découvriras la proportion de ton cash par rapport à tes paiements carte ! 💳`,
      `Un graphique vaut mille mots, a sidi ! Ouvre l'écran des Rapports pour voir ton évolution mensuelle complète.`,
      `Va vite voir l'écran principal ou la section rapports pour analyser ton camembert de dépenses.`
    ],
    show_top_expenses: [
      `Tes plus grands gouffres financiers ce mois-ci se situent généralement dans l'Alimentation (Marjane, BIM, Souq) et le Logement. Fais attention ! 🛒`,
      `D'après mes calculs, ce sont les enveloppes de Logement et d'Alimentation qui consomment le plus de baraka de ton salaire !`,
      `La palme d'or de tes dépenses revient au poste de ton loyer et tes courses. Essaye de négocier avec moul l'hanout ! 😄`,
      `Tes top dépenses sont enregistrées. Surveille de près l'enveloppe Loisirs & Café (Ahwa) qui se vide très vite par petites pièces de 10 DH !`,
      `Le plus gros de ton argent s'en va dans les dépenses fixes de loyer et factures d'eau/électricité. C'est normal, mais reste vigilant.`
    ],
    joke_request: [
      `Haha ! Écoute celle-là : "${MOROCCAN_FINANCIAL_JOKES[0]}" 😂`,
      `Une petite nokta financière pour détendre l'atmosphère : "${MOROCCAN_FINANCIAL_JOKES[1]}" 😉`,
      `Tu veux rire ? Voici une vérité marocaine : "${MOROCCAN_FINANCIAL_JOKES[2]}" 😆`,
      `Moul l'taxi o s-sandoq Floussi... écoute : "${MOROCCAN_FINANCIAL_JOKES[3]}" 😂`,
      `En voici une bien bonne sur notre quotidien : "${MOROCCAN_FINANCIAL_JOKES[4]}" 😃`
    ],
    zakat_calculator: [
      `La Zakat al-Maal correspond à **2,5%** de ton épargne stagnante depuis un an, si elle dépasse le seuil du *Nissab* (environ 80 000 DH selon le cours de l'or actuel). Tu veux que je calcule pour toi ?`,
      `Pour purifier ton argent : si ton épargne a dépassé le Nissab pendant 1 an hégirien, tu verses 2.5% de sa valeur en Sadaqa/Zakat. Une vraie bénédiction !`,
      `Nissab & Zakat : Calcule facilement tes 2.5% f l'appli. C'est un devoir noble et protecteur pour tes richesses.`,
      `Zakat Al Mal : Prends ton épargne totale stagnante, divise-la par 40 (ce qui fait 2,5%), et verse cette somme aux nécessiteux. Allah ytaqabbal !`,
      `Tu as des doutes sur la Zakat ? Utilise notre simulateur financier intégré ou demande-moi de t'assister pour extraire les 2,5% de ta baraka.`
    ],
    change_language: [
      `Wakha ! Tu peux changer la langue (Français/Darija) f l'onglet **Paramètres** de l'application à tout moment.`,
      `Pas de problème, je m'adapte ! Tu veux qu'on continue en Darija ou en Français ? C'est modifiable f les Paramètres.`,
      `Safi, l'langue de ton choix est configurable f l'écran de configuration du profil.`,
      `Wakha a sidi ! Choisis Darija ou Français dans tes préférences de compte.`,
      `Entendu ! Je parle les deux langues pour que tu sois parfaitement à l'aise.`
    ],
    about_sidi: [
      `Je suis **Sidi Floussi** 🇲🇦, ton guide spirituel et financier de poche ! J'ai été conçu au Maroc pour t'aider à dompter ton masrouf et faire grandir ta baraka sans dettes ni stress.`,
      `Enchanté ! Je suis Sidi Floussi, ton conseiller de tontine, d'enveloppes de cash et de sagesse financière. Ensemble, on va bannir le découvert bancaire ! 💸`,
      `Moi ? Je suis l'assistant intelligent de Floussi. Je traduis le jargon bancaire en conseils humains, chaleureux, mélangeant Français et Darija de chez nous !`,
      `Sidi Floussi à ton service ! Je combine la méthode éprouvée des enveloppes (buckets) avec la solidarité de la Jmâa marocaine.`,
      `Je suis ton compagnon de route budgétaire. Mon but est de t'aider à économiser pour l'Aïd, l'école des enfants ou ton projet d'achat d'Or (Dhab) !`
    ],
    show_unallocated: [
      `Tu as actuellement **${context.unallocated ?? 0} DH** non alloués (hors enveloppes). C'est de l'argent libre que tu devrais placer dans un sandoq pour ne pas le gaspiller !`,
      `Il te reste **${context.unallocated ?? 0} DH** de cash non attribué. Rappelle-toi de la règle d'or : chaque dirham doit avoir sa mission !`,
      `Solde libre : **${context.unallocated ?? 0} DH**. Dépêche-toi de créer une enveloppe ou d'alimenter tes objectifs avant de succomber à un café ou un taxi sghir ! 😉`,
      `Tu as **${context.unallocated ?? 0} DH** f l'poche sans sandoq attribué. C'est dangereux pour ton budget !`,
      `Sagesse Floussi : **${context.unallocated ?? 0} DH** dorment hors enveloppes. Alloue-les vite pour un masrouf serein.`
    ],
    pricing_inquiry: [
      `Floussi est 100% gratuit pour débuter (jusqu'à 3 enveloppes) ! Pour débloquer les enveloppes illimitées et la Jmâa de tontine, passe au plan **Premium** à seulement 29 DH/mois. 🪙`,
      `Nous proposons des abonnements très simples : Premium à 29 DH/mois et Famille à 49 DH/mois. Va faire un tour sur notre page **Tarifs** pour voir tous les avantages Dahabi !`,
      `Pour piloter le budget de tout le ménage, je te conseille l'abonnement **Famille (49 DH/mois)**, c'est l'idéal pour lier les comptes de ton foyer !`,
      `Tous nos tarifs sont transparents et sans engagement. Consulte l'écran Tarifs depuis le menu principal !`,
      `De l'utilisation basique gratuite à l'accompagnement Elite VIP, il y a forcément une formule Floussi faite pour toi.`
    ],
    family_budget: [
      `Pilotez l'argent du ménage à plusieurs ! Avec le plan **Famille**, liez jusqu'à 4 profils de foyer et partagez vos enveloppes de loyer ou de courses Marjane en temps réel. 👨‍👩‍👧‍👦`,
      `Le budget familial partagé évite bien des soucis ! Chacun note ses dépenses sur les enveloppes communes. C'est l'idéal pour le couple.`,
      `Gère l'argent du foyer en toute sérénité. Invite ton conjoint sur Floussi et suivez les dépenses d'alimentation ensemble.`,
      `Avec notre module Famille, sensibilisez même vos enfants à la valeur de la baraka avec des tirelires digitales !`,
      `Partagez vos enveloppes de dépenses fixes (factures, école, loyer) pour une transparence totale dans le foyer.`
    ],
    praise_sidi: [
      `Llah yhafdek a sidi ! C'est un honneur de t'accompagner au quotidien. Continuons à faire briller tes économies ! ✨`,
      `Barak'Allaho fik ! Ton assiduité est ma plus belle récompense. On est ensemble ! 🇲🇦`,
      `Chokran bezaf ! C'est grâce à ton sérieux que ton budget se porte si bien. Sagesse infinie !`,
      `Llah ybarek fik ! Tu es sur la voie de la liberté financière sans dettes, je suis fier de toi.`,
      `Merci ! Que la paix financière règne sur ton foyer. On lâche rien !`
    ],
    how_to_save: [
      `Conseil de sage : Applique la règle marocaine des 3 tiers. Un tiers pour la subsistance (Dar & Makla), un tiers pour les imprévus/famille, et un tiers pour le Tawfir (Épargne). 👍`,
      `Astuce du jour : Évite les d-dépenses de 'Khlass de café' compulsifs. 10 DH par-ci, 15 DH par-là... À la fin du mois, c'est un sandoq entier qui s'est évaporé !`,
      `Anticipe toujours le Ramadan et l'Aïd Al Adha dès le début de l'année. Mettre 200 DH de côté chaque mois est plus facile que de sortir 3000 DH d'un coup !`,
      `Sagesse financière : Ne dépense jamais de l'argent que tu n'as pas encore reçu. Fuis les petits crédits de consommation comme la peste !`,
      `Pour économiser, fais tes courses au souq hebdomadaire plutôt qu'au supermarché pour les fruits, légumes et viande. C'est meilleur pour la santé et le sandoq !`
    ],
    check_wallet_balance: [
      `Votre solde Wallet est de **${context.walletBalance ?? 0} DH**. Lah yzid l'baraka f had s-sandoq l-mounassib ! 📱`,
      `Ton solde de portefeuille mobile (Wallet) s'élève à **${context.walletBalance ?? 0} DH** lyouma. Koulchi f l'amane !`,
      `Flous li andek f l-wallet sghir dyalek slla l **${context.walletBalance ?? 0} DH**. Prêt pour un paiement ou un transfert rapide ?`
    ],
    send_p2p_transfer: [
      `Safi ! J'ai bien envoyé **${amount}** à **${context.recipientName ?? 'ton destinataire'}** en toute sécurité. Ton solde Wallet a été mis à jour ! 💸`,
      `Transfert effectué avec succès de **${amount}** l **${context.recipientName ?? 'ton proche'}** ! Lah ybarek l'amitiat o s-solidarité.`,
      `C'est fait ! **${amount}** transférés avec succès à **${context.recipientName ?? 'ton contact'}**. Sécurité et plafonds parfaitement respectés, d'accord avec Sidi !`
    ],
    pay_bill_via_sidi: [
      `Pour payer ta facture ONEE, IAM ou Lydec en toute sécurité, je t'ai ouvert le formulaire officiel ci-dessous ! Remplis-le en deux clics. 📝`,
      `Khlass d l-factures khasso t-tba3 mzyan ! Ouvre le formulaire de paiement juste en dessous pour régler ça en toute confiance.`,
      `Rien de plus simple ! Utilise le formulaire ci-dessous que je viens de t'ouvrir pour payer tes factures d'eau, d'électricité ou de télécom.`
    ],
    recharge_via_sidi: [
      `Besoin d'une recharge IAM, Orange ou Inwi ? Je t'ai préparé le formulaire de recharge rapide juste en dessous ! Saisis ton numéro et c'est parti. 📱`,
      `Ta3bi2a f l-ghalta la ! Remplis le formulaire de recharge rapide ci-dessous pour recharger ta ligne en toute sécurité et sans erreur.`,
      `Je t'ai ouvert l'écran de recharge mobile ! Saisis ton opérateur et ton type de recharge (*6, *3...) pour rester connecté avec les proches.`
    ],
    check_roundup_savings: [
      `Grâce à tes micro-épargnes par arrondi de transactions, tu as déjà mis de côté **${context.roundupSavings ?? 0} DH** ! Une vraie tirelire de baraka sans aucun effort ! 🪙`,
      `Ma cha'a Allah ! Tes petits sous d'arrondi sllat l **${context.roundupSavings ?? 0} DH**. C'est de l'argent qui grandit en cachette !`,
      `Tu as cumulé **${context.roundupSavings ?? 0} DH** grâce à l'arrondi automatique. Petit à petit, l'oiseau fait son nid, n-khbiw chouia b chouia !`
    ],
    check_remittance_history: [
      `En tant que MRE, tu as envoyé un total de **${context.remittanceTotal ?? 0} DH** à ta famille restée au Maroc ce mois-ci. Lah yjazik bikhair ! 🇲🇦`,
      `Historique des remises d'argent : Tes transferts s'élèvent à **${context.remittanceTotal ?? 0} DH** au total. Ta solidarité familiale est magnifique.`,
      `Tu as envoyé **${context.remittanceTotal ?? 0} DH** au foyer. Chaque dirham soutient tes proches au pays, Lah ybarek f l-masrouf.`
    ],
    check_family_budget_remote: [
      `Le budget de ton foyer distant au pays est de **${context.remoteBudgetLimit ?? 0} DH**, et ils ont dépensé **${context.remoteBudgetSpent ?? 0} DH**. Reste disponible pour eux ! 🏡`,
      `Suivi remote : Ta famille a consommé **${context.remoteBudgetSpent ?? 0} DH** sur le budget de **${context.remoteBudgetLimit ?? 0} DH** alloué. Tout est sous contrôle.`,
      `Masrouf d l'khout f l-Blad : Ils ont dépensé **${context.remoteBudgetSpent ?? 0} DH** sur **${context.remoteBudgetLimit ?? 0} DH** ce mois-ci. L'économie est bien gérée !`
    ],
    check_active_challenges: [
      `Tu as actuellement **${context.activeChallengesCount ?? 0}** défis d'optimisation en cours. Allez, m3ak l-khir, t-kemelhoum kamlin l-bonté dyal sandoq ! 🏆`,
      `Tahadiyat f l-cours : Tu as **${context.activeChallengesCount ?? 0}** challenges actifs. Tiens bon pour décrocher tes badges et ton bonus d'XP !`,
      `Koulchi 3la l-motivaçion ! Tu as **${context.activeChallengesCount ?? 0}** défis actifs pour affûter ta sagesse budgétaire marocaine.`
    ],
    suggest_academy_lesson: [
      `Pour continuer à faire grandir ton esprit financier, je te propose la leçon : **${context.recommendedLessonTitle ?? 'Gestion du budget'}** dans l'Académie ! 📚`,
      `Dars l-moufidd lyoum : Que dis-tu d'apprendre sur **${context.recommendedLessonTitle ?? 'L\'Épargne'}** ? Une vraie perle de sagesse !`,
      `Savoir, c'est économiser ! Ouvre notre académie Floussi et découvre le cours **${context.recommendedLessonTitle ?? 'Les secrets du tawfir'}**.`
    ],
    check_academy_progress: [
      `Ma cha'a Allah ! Tu as déjà validé **${context.completedLessonsCount ?? 0}** modules et tu as décroché **${context.certificatesCount ?? 0}** certificats officiels de l'Académie Floussi ! 🎓`,
      `Progression Académie : **${context.completedLessonsCount ?? 0}** leçons terminées. Ton score d'intelligence financière augmente chaque jour !`,
      `Chahadat li andek : Tu détiens **${context.certificatesCount ?? 0}** certificats de réussite. Les banquiers n'ont qu'à bien se tenir devant toi !`
    ],
    check_referral_status: [
      `Parraine tes proches et partage la baraka ! Ton code est **${context.referralCode ?? 'FLOUSSI-PRO'}** et tu as déjà invité **${context.invitedFriendsCount ?? 0}** filleuls. 👍`,
      `Stada3 l-ahbab : Tu as invité **${context.invitedFriendsCount ?? 0}** personnes à rejoindre Floussi. Voici ton code magique : **${context.referralCode ?? 'MY-CODE'}** !`,
      `Plus on est de fous, plus on économise ! Ton code de parrainage est **${context.referralCode ?? 'SIDI-REFER'}** (déjà **${context.invitedFriendsCount ?? 0}** filleuls).`
    ],
    check_savings_group: [
      `Ton groupe d'épargne ou tontine amicale (Jam3iya) contient **${context.savingsGroupCount ?? 0}** groupes actifs, avec une cagnotte globale de **${context.savingsGroupBalance ?? 0} DH**. Solidarité totale ! 🤝`,
      `Cagnotte commune entre amis : Tu as **${context.savingsGroupCount ?? 0}** groupes d'épargne en cours de cotisation. La cagnotte s'élève à **${context.savingsGroupBalance ?? 0} DH** .`,
      `Jam3iya dyalkoum fiha **${context.savingsGroupBalance ?? 0} DH** d'épargne commune. Un vrai projet de vie solidaire géré en toute confiance.`
    ],
    share_achievement: [
      `Quelle fierté ! Je te propose de partager ta réussite sur le flux de la communauté pour inspirer les autres citoyens de Floussi ! 🌟`,
      `Partage ta baraka ! Choisis l'une de tes victoires récentes ci-dessous pour l'annoncer fièrement à la communauté.`,
      `L'encouragement mutuel fait la force ! Partage ton badge ou ton objectif atteint avec les autres membres en toute simplicité.`
    ],
    check_floussi_score: [
      `Ton Score Floussi est de **${context.floussiScore ?? 350} points**, ce qui te place au rang de **${context.floussiTier ?? 'Débutant'}** ! 📈 Tu te débrouilles super bien, continue comme ça !`,
      `Score Floussi dyalk hwa **${context.floussiScore ?? 350} points** (**${context.floussiTier ?? 'Débutant'}**). L'intelligence financière t-bda t-tla3 t-bqa f l-qouwa ! 💪`,
      `La baraka du score : tu as **${context.floussiScore ?? 350} pts** ! Ton niveau de gestionnaire est **${context.floussiTier ?? 'Débutant'}**. C'est solide ! 🌟`
    ],
    explain_score_breakdown: [
      `Voici l'analyse de ta sagesse financière : il te manque **${context.pointsToNextTier ?? 50} points** pour atteindre le palier supérieur ! 💡 Conseil personnalisé de Sidi : *${context.scoreTip ?? 'Épargne un peu plus chaque mois'}*`,
      `F-fham kifach t-tla3 score dyalk : Khassak ghir **${context.pointsToNextTier ?? 50} d l-points** bach t-tla3 l-niveau jdid. S-saha dyal sandoq : *${context.scoreTip ?? 'Zid chwiya dyal t-tawfir'}*`,
      `Pour faire grandir ta baraka financière de **${context.pointsToNextTier ?? 50} points**, suis ce précieux conseil : *${context.scoreTip ?? 'Participe à un cours de l\'Académie'}* ! 📚`
    ],
    check_weekly_report: [
      `Voici ton rapport hebdomadaire personnalisé, réservé aux membres d'élite ! 📊\n\n${context.weeklyReportSummary ?? 'Semaine d\'économies exceptionnelles et de saine discipline !'}`,
      `Moul l-kora rje3 ! Ton rapport de la semaine est prêt, sidi. Résumé : ${context.weeklyReportSummary ?? 'Sagesse et gestion au top.'} 🌟`,
      `Rapport hebdomadaire Elite : ${context.weeklyReportSummary ?? 'Félicitations pour ton assiduité.'}`
    ],
    start_monthly_review: [
      `C'est l'heure de notre bilan du mois de **${context.monthlyReviewMonth ?? 'ce mois-ci'}** ! Ensemble, on fait le tri des enveloppes et on célèbre tes victoires. 📅`,
      `Aji n-diro l-bilan dyal chhar **${context.monthlyReviewMonth ?? 'l-fat'}** ! On va regarder tes sandoqs un par un pour faire fructifier la baraka. ✨`,
      `Bilan mensuel guidé lancé ! Analysons le mois de **${context.monthlyReviewMonth ?? 'dernier'}** pour perfectionner ta stratégie financière.`
    ],
    suggest_optimization_challenge: [
      `Pour optimiser tes dépenses, je te propose de relever le défi suivant : **${context.optimizationChallengeTitle ?? 'Zéro café en dehors du foyer'}** ! ☕`,
      `Un challenge d'élite pour toi : **${context.optimizationChallengeTitle ?? 'Réduction du sandoq Loisirs de 10%'}** ! Es-tu prêt à le relever ? 🏆`,
      `Optimise ton sandoq avec ce défi : **${context.optimizationChallengeTitle ?? 'Achat en gros chez moul l-hanout'}**. La baraka n'attend pas !`
    ],
    premium_upgrade_required: [
      `Oups, cette fonctionnalité exclusive (rapports de coaching IA, défis d'optimisation avancés, bilans mensuels) fait partie de nos formules supérieures **Analyse+** ou **Elite**. 🌟 Tu peux passer au niveau supérieur à tout moment depuis les paramètres de ton profil pour débloquer ces précieux outils sans aucune pression !`,
      `Had l-mouassat d l-coaching khassa ghir b n-nass dyal **Analyse+** oula **Elite**. ✨ T9dar t-upgrade l-abonnement dyalk melli t-bghi, bla machakil o b l-baraka dyalk !`,
      `Pour débloquer la pleine puissance du Coach IA (rapports hebdomadaires, bilans guidés mensuels), rejoins notre communauté premium **Analyse+ / Elite** ! C'est un bel investissement pour ta sagesse financière future. 👍`
    ],
    check_unread_notifications: lang === 'darija' ? [
      `3andek **${context.unreadNotificationsCount ?? 0}** tanbih(at) jdid(in) machi ma9riyin ! 🔔\n\n${context.notificationSummary ?? "Machi mouchkil, t9dar tchoufhoum f l-centre d l-notifications !"}`,
      `Chouf, s-Sandoq dyal l-notifications fih **${context.unreadNotificationsCount ?? 0}** hwayj jdad ! 📈 Résumé: ${context.notificationSummary ?? "Koulchi mzyan, khoya."}`,
      `Rani l9it **${context.unreadNotificationsCount ?? 0}** alertes jdad lyouma. Aji n-choufo l-khbar : ${context.notificationSummary ?? "Machi mouchkil."}`
    ] : [
      `Tu as **${context.unreadNotificationsCount ?? 0}** notification(s) non lue(s) ! 🔔\n\n${context.notificationSummary ?? "Rien à signaler pour l'instant !"}`,
      `Voici ce qui est nouveau, ${name} : **${context.unreadNotificationsCount ?? 0}** alertes t'attendent ! 📈 Résumé : ${context.notificationSummary ?? "Tout est sous contrôle."}`,
      `J'ai trouvé **${context.unreadNotificationsCount ?? 0}** notifications importantes à ton attention. Résumé : ${context.notificationSummary ?? "Pas d'alertes majeures."}`
    ],
    search_via_sidi: lang === 'darija' ? [
      `9lebt f s-sandoq dyali l-ktab 3la **"${context.searchQuery ?? ''}"** o l9it **${context.searchResultsCount ?? 0}** natija : ${context.searchResultsSummary ?? 'makayn walou...'} 🔍`,
      `Ha hya l-natija d l-ba7t dyalk l **"${context.searchQuery ?? ''}"** : L9ina **${context.searchResultsCount ?? 0}** 3onsor ! ${context.searchResultsSummary ?? 'Walo f l-mouassat.'} 📂`,
      `B-nisba l l-ba7t dyal **"${context.searchQuery ?? ''}"** : Ha chnou l9it (**${context.searchResultsCount ?? 0}** results) : ${context.searchResultsSummary ?? 'qleb mzyan !'}`
    ] : [
      `J'ai cherché dans tes archives pour **"${context.searchQuery ?? ''}"** et j'ai trouvé **${context.searchResultsCount ?? 0}** résultat(s) : ${context.searchResultsSummary ?? 'aucun résultat...'} 🔍`,
      `Voici les résultats de ta recherche pour **"${context.searchQuery ?? ''}"** : **${context.searchResultsCount ?? 0}** élément(s) détecté(s). ${context.searchResultsSummary ?? 'Aucun élément trouvé.'} 📂`,
      `Recherche de **"${context.searchQuery ?? ''}"** terminée ! J'ai déniché **${context.searchResultsCount ?? 0}** correspondance(s) : ${context.searchResultsSummary ?? 'pas de correspondance.'}`
    ],
    update_preference_via_sidi: lang === 'darija' ? [
      `Safi ! Bedelt lik preference dyalk b n-nja7 : **${context.preferenceStatus ?? 'koulchi mzyan'}** ! ⚙️`,
      `T-mte3 b had l-bedil jdid : **${context.preferenceStatus ?? 'safé'}** ! Sidi Floussi dima f l-khedma. 👍`,
      `Koulchi fl-aman, sidi ! L-preference dyalk t-bdel : **${context.preferenceStatus ?? 'safé'}** ! ✨`
    ] : [
      `Parfait ! J'ai bien mis à jour ta préférence : **${context.preferenceStatus ?? 'opération réussie'}** ! ⚙️`,
      `Changement effectué avec succès : **${context.preferenceStatus ?? 'réussi'}** ! Sidi Floussi s'adapte à tes habitudes. 👍`,
      `C'est fait, sidi ! Ta préférence a été modifiée : **${context.preferenceStatus ?? 'mis à jour'}** ! ✨`
    ],
    fallback: [
      `Aji, je n'ai pas tout à fait compris ta demande. Peux-tu reformuler ? Tu peux me dire par exemple *"Solde"* ou *"Sraft 40 DH dans loisirs"* !`,
      `Sidi Floussi s'excuse, ma sagesse a ses limites ! Peux-tu me réexpliquer avec des mots simples (alimentation, daret, épargne...) ?`,
      `Hmm, je n'ai pas capté. Parle-moi de tes enveloppes, de tes transactions, ou demande-moi une blague (nokta) pour rire un peu ! 🇲🇦`,
      `Je n'ai pas trouvé de correspondance dans mes grimoires. Essaie de me dire *"Chhal andi ?"* ou de me confier tes dépenses quotidiennes !`,
      `Pas de souci ! Reformule ta phrase en mélangeant Français et Darija ou demande-moi de l'aide en tapant *"aide"* !`
    ]
  };

  const list = templates[intentId] || templates.fallback;
  
  // Special check for jokes: select randomly from jokes
  if (intentId === "joke_request") {
    const jokeIdx = Math.floor(Math.random() * MOROCCAN_FINANCIAL_JOKES.length);
    const joke = MOROCCAN_FINANCIAL_JOKES[jokeIdx];
    return `Haha ! Écoute celle-là a ${name} : "${joke}" 🤣🤣`;
  }

  const index = Math.floor(Math.random() * list.length);
  return list[index];
}
