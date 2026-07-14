export interface Category {
  id: string;
  name_fr: string;
  name_darija: string;
  icon: string;
  color: string;
  description_fr: string;
  description_darija: string;
  type: 'expense' | 'income' | 'transfer';
}

export const MOROCCAN_CATEGORIES: Category[] = [
  {
    id: 'logement',
    name_fr: 'Logement (Dar)',
    name_darija: 'الدار (Logement)',
    icon: 'Home',
    color: '#3B82F6', // Blue
    description_fr: 'Loyer, crédit immobilier, entretien',
    description_darija: 'الكراء، الرهن العقاري، الإصلاحات',
    type: 'expense'
  },
  {
    id: 'alimentation',
    name_fr: 'Alimentation (Khobz & Lmarqa)',
    name_darija: 'الماكلة (Alimentation)',
    icon: 'Utensils',
    color: '#10B981', // Emerald
    description_fr: 'Courses, épicerie, Hanout, marchés',
    description_darija: 'التقدية، الحانوت، السويقة، الخضرة',
    type: 'expense'
  },
  {
    id: 'transport',
    name_fr: 'Transport (Tombil & Taxi)',
    name_darija: 'الطوموبيل و الطاكسي',
    icon: 'Car',
    color: '#F59E0B', // Amber
    description_fr: 'Carburant, grand/petit taxi, tramway, bus',
    description_darija: 'المازوط، الطاكسي، الترامواي، الطوبيس',
    type: 'expense'
  },
  {
    id: 'telecom',
    name_fr: 'Télécom (Inwi, Maroc Telecom, Orange)',
    name_darija: 'الهاتف و الأنترنت',
    icon: 'Phone',
    color: '#EC4899', // Pink
    description_fr: 'Recharges, abonnements internet, ADSL/Fibre',
    description_darija: 'التعبئة، الاشتراك، الويفي، الفايبر',
    type: 'expense'
  },
  {
    id: 'factures',
    name_fr: 'Factures (Lydec, Redal, Radeema, Eau/Élec)',
    name_darija: 'الماء و الضو (Factures)',
    icon: 'FileText',
    color: '#EF4444', // Red
    description_fr: 'Eau, électricité, taxes communales',
    description_darija: 'الماء، الضو، الضريبة المحلية',
    type: 'expense'
  },
  {
    id: 'sante',
    name_fr: 'Santé (Tbib & Sbitar)',
    name_darija: 'الطبيب و الدوا (Santé)',
    icon: 'HeartPulse',
    color: '#06B6D4', // Cyan
    description_fr: 'Consultations, pharmacie, mutuelle (CNOPS/AMO)',
    description_darija: 'الطبيب، الصيدلية، لا كْنُوبْسْ/آمُو',
    type: 'expense'
  },
  {
    id: 'education',
    name_fr: 'Éducation (Madrassa)',
    name_darija: 'المدرسة و القراية',
    icon: 'GraduationCap',
    color: '#8B5CF6', // Violet
    description_fr: 'Frais de scolarité, fournitures, transport scolaire',
    description_darija: 'واجبات المدرسة، الكتوبة، النقل المدرسي',
    type: 'expense'
  },
  {
    id: 'loisirs',
    name_fr: 'Loisirs & Café (Ahwa)',
    name_darija: 'النشاط و القهوة',
    icon: 'Sparkles',
    color: '#F43F5E', // Rose
    description_fr: 'Sorties, cafés, hammam, voyages',
    description_darija: 'الخروج، القهوة، الحمام، السفر',
    type: 'expense'
  },
  {
    id: 'epargne',
    name_fr: 'Épargne (Tawfir)',
    name_darija: 'التوفير (Épargne)',
    icon: 'PiggyBank',
    color: '#6366F1', // Indigo
    description_fr: 'Argent mis de côté, investissements, or',
    description_darija: 'الفلوس مخبيين، الاستثمار، الذهب',
    type: 'expense'
  },
  {
    id: 'religieux',
    name_fr: 'Religieux & Fêtes (Sadaqa & Aid)',
    name_darija: 'الصدقة و الأعياد',
    icon: 'Moon',
    color: '#047857', // Dark Green
    description_fr: 'Zakat, Sadaqa, budget Achoura/Aid',
    description_darija: 'الزكاة، الصدقة، مصاريف العيد و عاشوراء',
    type: 'expense'
  },
  {
    id: 'social',
    name_fr: 'Social & Famille (Sila)',
    name_darija: 'العائلة و المناسبات',
    icon: 'Users',
    color: '#14B8A6', // Teal
    description_fr: 'Cadeaux, aide familiale, mariages, baptêmes',
    description_darija: 'الهدايا، مساعدة الوالدين، المناسبات',
    type: 'expense'
  },
  {
    id: 'revenus',
    name_fr: 'Revenus (Khlass & Khadma)',
    name_darija: 'المداخيل و الخلاص',
    icon: 'TrendingUp',
    color: '#10B981', // Emerald
    description_fr: 'Salaire, virements, projets freelance, commerce',
    description_darija: 'الصالير، الفيرمون، التجارة، فريلانس',
    type: 'income'
  },
  {
    id: 'transferts',
    name_fr: 'Transferts (Tahouil)',
    name_darija: 'تحويل الفلوس (Transfert)',
    icon: 'ArrowLeftRight',
    color: '#64748B', // Slate
    description_fr: 'Virement de compte à compte',
    description_darija: 'تحويل بين الحسابات الشخصية',
    type: 'transfer'
  },
  {
    id: 'non_categorise',
    name_fr: 'Non catégorisé',
    name_darija: 'غير مصنف',
    icon: 'HelpCircle',
    color: '#64748B', // Slate grey
    description_fr: 'Dépense à classer ultérieurement',
    description_darija: 'مصاريف سيتم تصنيفها لاحقًا',
    type: 'expense'
  }
];

export function getCategoryById(id: string): Category | undefined {
  return MOROCCAN_CATEGORIES.find(c => c.id === id);
}

export function getCategoryName(category: Category, language: 'fr' | 'darija'): string {
  return language === 'darija' ? category.name_darija : category.name_fr;
}
