import { CommunityPost, Challenge, SavingsGroup } from '../types';

export const SEED_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorAlias: 'Amine_Anfa',
    authorCity: 'Casablanca',
    content: 'Alhamdulillah! J\'ai enfin atteint 80% de mon objectif d\'épargne pour l\'Aïd Al-Adha ! L\'automatisation des arrondis avec Floussi m\'a vraiment aidé sans que je m\'en rende compte.',
    type: 'achievement',
    relatedGoalName: 'Aïd Al-Adha 2026',
    reactions: { '👍': 12, '❤️': 8, '🎉': 15, '🔥': 5, '💡': 0 },
    commentsCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'post-2',
    authorAlias: 'Fatima_Marrakchia',
    authorCity: 'Marrakech',
    content: 'Chkon li bda f l-challenge d "No Spend Coffee" had l-osimana? Épargner 15 DH par jour f l-bucket d l-Hajj s\'accumule super vite ! Sh7al wsseltou f l-epargne ? ☕️✨',
    type: 'question',
    reactions: { '👍': 8, '❤️': 3, '🎉': 0, '🔥': 4, '💡': 6 },
    commentsCount: 5,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
  },
  {
    id: 'post-3',
    authorAlias: 'Youssef_Rbati',
    authorCity: 'Rabat',
    content: 'Astuce budget : Pour réduire vos factures RADEEMA/Lydec, essayez d\'utiliser des multiprises avec interrupteur et de débrancher les appareils en veille. J\'ai économisé près de 90 DH ce mois-ci, directement versés sur mon projet de Mariage !',
    type: 'tip',
    reactions: { '👍': 24, '❤️': 4, '🎉': 2, '🔥': 3, '💡': 18 },
    commentsCount: 2,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: 'post-4',
    authorAlias: 'Sarah_Tanger',
    authorCity: 'Tanger',
    content: 'L-mariage dyali f l-obor ! 30,000 DH d l-objectif d-epargne atteint à 100% l-yom ! Merci l-tontine Floussi o l-sber. Prochaine étape : d-dar inchaAllah 🏠❤️',
    type: 'achievement',
    relatedGoalName: 'Mon Mariage 💍',
    reactions: { '👍': 15, '❤️': 32, '🎉': 28, '🔥': 10, '💡': 1 },
    commentsCount: 8,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    id: 'post-5',
    authorAlias: 'Karim_Souss',
    authorCity: 'Agadir',
    content: 'Est-ce que quelqu\'un a déjà testé le défi d\'épargne progressive (52 semaines) ? Je veux l\'adapter en Darija pour notre groupe d\'amis pour financer un voyage collectif à Dakhla.',
    type: 'question',
    reactions: { '👍': 6, '❤️': 1, '🎉': 0, '🔥': 2, '💡': 4 },
    commentsCount: 4,
    createdAt: new Date(Date.now() - 3600000 * 25).toISOString()
  },
  {
    id: 'post-6',
    authorAlias: 'Driss_Fassi',
    authorCity: 'Fès',
    content: 'Dert l-khlas dyal fatourat l-ma o l-kahraba b t-tariqa l-jadida f Floussi, dghya dghya o l-arrondi msha direct l-sandouq d t-tawari2. Chi haja hrbana ! 🔥⚡',
    type: 'tip',
    reactions: { '👍': 10, '❤️': 2, '🎉': 4, '🔥': 6, '💡': 12 },
    commentsCount: 1,
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
  },
  {
    id: 'post-7',
    authorAlias: 'Meryem_Oujda',
    authorCity: 'Oujda',
    content: 'Objectif Voiture Neuve lancé ! 🚗 J\'ai configuré un prélèvement automatique de 1500 DH après chaque réception de salaire. C\'est parti pour 24 mois de discipline ! 💪🇲🇦',
    type: 'achievement',
    relatedGoalName: 'Achat Voiture 🚗',
    reactions: { '👍': 19, '❤️': 12, '🎉': 14, '🔥': 8, '💡': 0 },
    commentsCount: 6,
    createdAt: new Date(Date.now() - 3600000 * 45).toISOString()
  },
  {
    id: 'post-8',
    authorAlias: 'Adnane_Kenitra',
    authorCity: 'Kénitra',
    content: 'Had l-3am ghadi n-jawzo Ramadan b-a9al khassa2ir malia ! Drna budget s7i7 f Floussi m3a l-madam o ghadi n-7awlo n-7tarmoh m3a les achats d l-7orira o s-sfoof.',
    type: 'tip',
    reactions: { '👍': 14, '❤️': 6, '🎉': 1, '🔥': 4, '💡': 9 },
    commentsCount: 2,
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString()
  },
  {
    id: 'post-9',
    authorAlias: 'Nadia_Meknes',
    authorCity: 'Meknès',
    content: 'J\'ai numérisé 15 reçus de supermarché cette semaine avec l\'OCR Floussi. Analyse incroyable de mes dépenses d\'épicerie ! J\'ai découvert que j\'achetais trop de produits hors-budget. Essayez de scanner, ça ouvre les yeux ! 🧾🧠',
    type: 'tip',
    reactions: { '👍': 22, '❤️': 5, '🎉': 3, '🔥': 4, '💡': 25 },
    commentsCount: 4,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 'post-10',
    authorAlias: 'Hassan_Nador',
    authorCity: 'Nador',
    content: 'Chkon li bgha n-diro l-Group d l-Epargne l t-tajhizat d d-dar ? L-hadaf howa 15,000 DH, kol wa7ed y-saham b l-9adr li bgha f l-aman dghya.',
    type: 'question',
    reactions: { '👍': 9, '❤️': 3, '🎉': 1, '🔥': 5, '💡': 2 },
    commentsCount: 7,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
  },
  {
    id: 'post-11',
    authorAlias: 'Zineb_Casa',
    authorCity: 'Casablanca',
    content: 'Objectif Hajj pour mes parents validé à 50% ! 🕋❤️ Une sensation incroyable de voir cette jauge monter mois après mois. Floussi facilite vraiment le suivi ! Al-7amdulillah.',
    type: 'achievement',
    relatedGoalName: 'Hajj Parents 🕋',
    reactions: { '👍': 45, '❤️': 60, '🎉': 55, '🔥': 12, '💡': 1 },
    commentsCount: 15,
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
  },
  {
    id: 'post-12',
    authorAlias: 'Tarik_Tetouan',
    authorCity: 'Tétouan',
    content: 'Régler son abonnement Internet Maroc Telecom directement via l-wallet de Floussi sans aucun frais supplémentaire. Simple, rapide, et l-arrondi va directement dans la cagnotte Voyage d\'été ! 🌊☀️',
    type: 'tip',
    reactions: { '👍': 17, '❤️': 2, '🎉': 5, '🔥': 3, '💡': 11 },
    commentsCount: 0,
    createdAt: new Date(Date.now() - 3600000 * 150).toISOString()
  }
];

export const SEED_COMMENTS: Record<string, any[]> = {
  'post-1': [
    { id: 'c-1', postId: 'post-1', authorAlias: 'Samir_Rabat', content: 'Mabrok ! L-arrondi automatique d Floussi daret lia nefss l-balane, bdite n-nsa beli kanchri o l-sarf tay-tkhba3 bwe7do.', createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString() },
    { id: 'c-2', postId: 'post-1', authorAlias: 'Khadija_Marrakech', content: 'Félicitations Amine ! Quel seuil d\'arrondi as-tu choisi ? Le x10 ou le x20 ?', createdAt: new Date(Date.now() - 3600000 * 1).toISOString() },
    { id: 'c-3', postId: 'post-1', authorAlias: 'Amine_Anfa', content: 'Merci ! Khadija, j\'ai choisi le seuil de 10 DH, c\'est parfait pour mon rythme.', createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString() }
  ],
  'post-2': [
    { id: 'c-4', postId: 'post-2', authorAlias: 'Ayoub_Fes', content: 'M3ak f l-khatt ! No Spend Coffee bdito had l-tneen, kan-khba3 fih 20 DH d taxi o 15 DH d 9ahwa.', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
    { id: 'c-5', postId: 'post-2', authorAlias: 'Yasmine_Oujda', content: 'Moi aussi ! Déjà 105 DH d\'épargnés en faisant mon café à la maison. Petit à petit on va y arriver ! ☕💪', createdAt: new Date(Date.now() - 3600000 * 3.5).toISOString() }
  ],
  'post-3': [
    { id: 'c-6', postId: 'post-3', authorAlias: 'Omar_Salé', content: 'Excellente idée, je savais pas pour les appareils en veille. Je vais tester ça ce soir !', createdAt: new Date(Date.now() - 3600000 * 10).toISOString() }
  ],
  'post-4': [
    { id: 'c-7', postId: 'post-4', authorAlias: 'Halima_Taza', content: 'L-mabrok l-3laikom ! L-3oqba l-shi dweira d l-khair o l-hna inshaAllah.', createdAt: new Date(Date.now() - 3600000 * 18).toISOString() },
    { id: 'c-8', postId: 'post-4', authorAlias: 'Med_Casablanca', content: 'Félicitations ! Ça motive grave de voir qu\'on peut y arriver en s\'organisant bien.', createdAt: new Date(Date.now() - 3600000 * 15).toISOString() }
  ],
  'post-7': [
    { id: 'c-9', postId: 'post-7', authorAlias: 'Rachid_Agadir', content: 'Allah y-ssakhar ! Quel modèle de voiture tu as en vue ?', createdAt: new Date(Date.now() - 3600000 * 40).toISOString() },
    { id: 'c-10', postId: 'post-7', authorAlias: 'Meryem_Oujda', content: 'Merci Rachid, une Dacia Sandero Stepway inchaAllah, économique et solide !', createdAt: new Date(Date.now() - 3600000 * 38).toISOString() }
  ]
};

export const SEED_CHALLENGES: Challenge[] = [
  {
    id: 'chall-1',
    title: 'Défi Épargne Hebdo (Dépôt)',
    description: 'Épargnez au moins 150 DH cette semaine sur l\'un de vos objectifs pour booster vos projets.',
    type: 'savings',
    targetValue: 150,
    startDate: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // started 2 days ago
    endDate: new Date(Date.now() + 3600000 * 24 * 5).toISOString(), // ends in 5 days
    participantsCount: 142,
    xpReward: 100
  },
  {
    id: 'chall-2',
    title: 'Semaine Sans Fast-Food 🍔',
    description: 'Zéro dépenses dans la catégorie Restauration/Fast-Food pendant 5 jours consécutifs pour purifier votre portefeuille et votre corps !',
    type: 'no_spend',
    targetValue: 5, // 5 days target
    startDate: new Date(Date.now() - 3600000 * 24).toISOString(),
    endDate: new Date(Date.now() + 3600000 * 24 * 6).toISOString(),
    participantsCount: 89,
    xpReward: 150
  },
  {
    id: 'chall-3',
    title: 'Chasseur de Reçus (Scan OCR) 🧾',
    description: 'Scannez et analysez au moins 3 reçus d\'achats marocains réels cette semaine pour mettre à jour votre budget Floussi.',
    type: 'ocr_scan',
    targetValue: 3,
    startDate: new Date(Date.now() - 3600000 * 12).toISOString(),
    endDate: new Date(Date.now() + 3600000 * 24 * 4).toISOString(),
    participantsCount: 205,
    xpReward: 80
  }
];

export const SEED_GROUPS: SavingsGroup[] = [
  {
    id: 'group-1',
    name: 'Aïd El Adha solidaire 🐏',
    targetAmount: 5000,
    currentAmount: 3200,
    deadline: new Date(Date.now() + 3600000 * 24 * 45).toISOString(),
    memberIds: ['user-1', 'user-demo-2', 'user-demo-3', 'user-demo-4'],
    createdBy: 'user-demo-2'
  },
  {
    id: 'group-2',
    name: 'Cadeau Mariage de Reda 🎁',
    targetAmount: 2500,
    currentAmount: 1800,
    deadline: new Date(Date.now() + 3600000 * 24 * 12).toISOString(),
    memberIds: ['user-1', 'user-demo-5', 'user-demo-6'],
    createdBy: 'user-1'
  }
];
