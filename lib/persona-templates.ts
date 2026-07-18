import { Home, Utensils, Car, GraduationCap, Phone, PiggyBank, Heart, TrendingUp, Sparkles, Receipt, ShieldAlert, Coins, Plane } from 'lucide-react';

export interface PersonaTemplate {
  id: string;
  label: {
    fr: string;
    darija: string;
  };
  icon: string; // Saved as name to map dynamically
  description: {
    fr: string;
    darija: string;
  };
  suggestedBuckets: {
    category: string;
    label: {
      fr: string;
      darija: string;
    };
    allocatedPercent: number;
    isEssential: boolean;
    icon: string;
    color: string;
  }[];
  suggestedGoals: {
    name: {
      fr: string;
      darija: string;
    };
    icon: string;
    suggestedAmount: number;
  }[];
  recommendedAcademyModuleId?: string;
  tipMessage: {
    fr: string;
    darija: string;
  };
}

export const PERSONA_TEMPLATES: Record<string, PersonaTemplate> = {
  etudiant: {
    id: 'etudiant',
    label: {
      fr: 'Étudiant',
      darija: 'طالب'
    },
    icon: 'GraduationCap',
    description: {
      fr: 'Budget serré, focus sur les études, télécoms et petits loisirs.',
      darija: 'ميزانية على قد الحال، التركيز على الدراسة، الأنترنت والنشاط.'
    },
    suggestedBuckets: [
      { category: 'housing', label: { fr: 'Logement & Internat', darija: 'السكن و الكراء' }, allocatedPercent: 25, isEssential: true, icon: 'Home', color: 'bg-emerald-600' },
      { category: 'food', label: { fr: 'Alimentation & RU', darija: 'الماكلة و الشرب' }, allocatedPercent: 20, isEssential: true, icon: 'Utensils', color: 'bg-blue-600' },
      { category: 'education', label: { fr: 'Études & Livres', darija: 'الدراسة و الكتوبة' }, allocatedPercent: 20, isEssential: true, icon: 'GraduationCap', color: 'bg-indigo-600' },
      { category: 'transport', label: { fr: 'Transport & Bus', darija: 'الطوبيس و الترونسبور' }, allocatedPercent: 10, isEssential: true, icon: 'Car', color: 'bg-amber-500' },
      { category: 'leisure', label: { fr: 'Loisirs & Sorties', darija: 'النشاط و الدوران' }, allocatedPercent: 10, isEssential: false, icon: 'Sparkles', color: 'bg-rose-500' },
      { category: 'savings', label: { fr: 'Épargne Étudiante', darija: 'توفير الطلبة' }, allocatedPercent: 10, isEssential: false, icon: 'PiggyBank', color: 'bg-purple-600' },
      { category: 'utilities', label: { fr: 'Télécom & Internet', darija: 'الأنترنت و التعبئة' }, allocatedPercent: 5, isEssential: true, icon: 'Phone', color: 'bg-cyan-500' }
    ],
    suggestedGoals: [
      { name: { fr: "Fonds d'urgence étudiant", darija: 'صندوق الطوارئ للطالب' }, icon: 'PiggyBank', suggestedAmount: 2000 }
    ],
    recommendedAcademyModuleId: 'budget_basics',
    tipMessage: {
      fr: 'Privilégiez les abonnements étudiants et cuisinez chez vous pour économiser !',
      darija: 'خوذ اشتراكات الطلبة و طيب في الدار باش توفر كثر !'
    }
  },
  salarie: {
    id: 'salarie',
    label: {
      fr: 'Salarié',
      darija: 'موظف'
    },
    icon: 'Briefcase',
    description: {
      fr: 'Revenus réguliers, répartition classique équilibrée et épargne automatique.',
      darija: 'صالير منتظم، تقسيم كلاسيكي متوازن و توفير تلقائي.'
    },
    suggestedBuckets: [
      { category: 'housing', label: { fr: 'Logement (Fixe)', darija: 'السكن و الكراء' }, allocatedPercent: 30, isEssential: true, icon: 'Home', color: 'bg-emerald-600' },
      { category: 'food', label: { fr: 'Alimentation (Souq)', darija: 'التقدية و الماكلة' }, allocatedPercent: 25, isEssential: true, icon: 'Utensils', color: 'bg-blue-600' },
      { category: 'savings', label: { fr: 'Épargne Projets', darija: 'التوفير و الحصالة' }, allocatedPercent: 15, isEssential: false, icon: 'PiggyBank', color: 'bg-purple-600' },
      { category: 'transport', label: { fr: 'Transport & Carburant', darija: 'المواصلات و المازوط' }, allocatedPercent: 10, isEssential: true, icon: 'Car', color: 'bg-amber-500' },
      { category: 'leisure', label: { fr: 'Loisirs & Café', darija: 'النشاط و القهوة' }, allocatedPercent: 10, isEssential: false, icon: 'Sparkles', color: 'bg-rose-500' },
      { category: 'utilities', label: { fr: 'Factures (Eau, Élec)', darija: 'الماء، الضو و الويفي' }, allocatedPercent: 10, isEssential: true, icon: 'Receipt', color: 'bg-cyan-500' }
    ],
    suggestedGoals: [
      { name: { fr: "Fonds d'urgence 3 mois", darija: 'صندوق الطوارئ (3 أشهر)' }, icon: 'ShieldAlert', suggestedAmount: 25000 }
    ],
    recommendedAcademyModuleId: 'saving_strategies',
    tipMessage: {
      fr: 'Épargnez dès le jour de paye avant de commencer à dépenser !',
      darija: 'وفر نهار الشدّة ديال الخلصة قبل ما تبدا تخسر الفلوس !'
    }
  },
  freelance: {
    id: 'freelance',
    label: {
      fr: 'Freelance / Indépendant',
      darija: 'مستقل / مقاول ذاتي'
    },
    icon: 'Laptop',
    description: {
      fr: 'Revenus irréguliers, anticipation fiscale (CNSS, IR) et sécurité.',
      darija: 'مدخول غير منتظم، الاحتياط للضرائب و التغطية الصحية.'
    },
    suggestedBuckets: [
      { category: 'taxes', label: { fr: 'Provision IR & CNSS', darija: 'احتياط الضرائب و CNSS' }, allocatedPercent: 20, isEssential: true, icon: 'ShieldAlert', color: 'bg-rose-600' },
      { category: 'housing', label: { fr: 'Logement & Bureau', darija: 'السكن و المكتب' }, allocatedPercent: 25, isEssential: true, icon: 'Home', color: 'bg-emerald-600' },
      { category: 'food', label: { fr: 'Alimentation & Vie', darija: 'التقدية و المعيشة' }, allocatedPercent: 20, isEssential: true, icon: 'Utensils', color: 'bg-blue-600' },
      { category: 'savings', label: { fr: 'Trésorerie Sécurité', darija: 'صندوق احتياطي أمان' }, allocatedPercent: 15, isEssential: false, icon: 'PiggyBank', color: 'bg-purple-600' },
      { category: 'transport', label: { fr: 'Transport & Déplacement', darija: 'التنقل و السفر' }, allocatedPercent: 10, isEssential: true, icon: 'Car', color: 'bg-amber-500' },
      { category: 'utilities', label: { fr: 'Télécom & Logiciels', darija: 'الأنترنت و الأدوات' }, allocatedPercent: 10, isEssential: false, icon: 'Phone', color: 'bg-cyan-500' }
    ],
    suggestedGoals: [
      { name: { fr: 'Trésorerie de sécurité (6 mois)', darija: 'احتياطي الأمان (6 أشهر)' }, icon: 'ShieldAlert', suggestedAmount: 40000 }
    ],
    recommendedAcademyModuleId: 'tax_maroc',
    tipMessage: {
      fr: "Mettez systématiquement de côté vos provisions d'impôts dès chaque encaissement client !",
      darija: 'خزن فلوس الضريبة و الضمان الاجتماعي مع كل خلاص من عند الكليان !'
    }
  },
  parent_famille: {
    id: 'parent_famille',
    label: {
      fr: 'Parent de famille',
      darija: 'رب أو ربة أسرة'
    },
    icon: 'Users',
    description: {
      fr: 'Gestion de foyer, renforcement éducation, santé et grands moments de l’année.',
      darija: 'تسيير البيت، قراية الدراري، الصحة و المناسبات الدينية.'
    },
    suggestedBuckets: [
      { category: 'housing', label: { fr: 'Logement & Charges', darija: 'السكن و الكراء' }, allocatedPercent: 30, isEssential: true, icon: 'Home', color: 'bg-emerald-600' },
      { category: 'food', label: { fr: 'Alimentation Foyer', darija: 'قضية الكوزينة و الماكلة' }, allocatedPercent: 25, isEssential: true, icon: 'Utensils', color: 'bg-blue-600' },
      { category: 'education', label: { fr: 'Scolarité & Enfants', darija: 'المدارس و قراية الدراري' }, allocatedPercent: 15, isEssential: true, icon: 'GraduationCap', color: 'bg-indigo-600' },
      { category: 'health', label: { fr: 'Santé & Pharmacie', darija: 'الصحة و الطبيب' }, allocatedPercent: 10, isEssential: true, icon: 'Heart', color: 'bg-rose-500' },
      { category: 'transport', label: { fr: 'Transport Famille', darija: 'الطريق و طوموبيل العائلة' }, allocatedPercent: 10, isEssential: true, icon: 'Car', color: 'bg-amber-500' },
      { category: 'savings', label: { fr: 'Épargne & Avenir', darija: 'توفير مستقبل الدراري' }, allocatedPercent: 10, isEssential: false, icon: 'PiggyBank', color: 'bg-purple-600' }
    ],
    suggestedGoals: [
      { name: { fr: 'Rentrée scolaire', darija: 'الدخول المدرسي' }, icon: 'GraduationCap', suggestedAmount: 5000 },
      { name: { fr: 'Aïd Al-Adha famille', darija: 'كبش العيد' }, icon: 'Coins', suggestedAmount: 3500 }
    ],
    recommendedAcademyModuleId: 'family_budgeting',
    tipMessage: {
      fr: 'Préparez la rentrée scolaire et l’Aïd Al-Adha un peu chaque mois pour éviter les fins de mois difficiles.',
      darija: 'وجد لفلوس الدخول المدرسي و العيد شوية بشوية كل شهر باش تفادى الكريديات !'
    }
  },
  mre: {
    id: 'mre',
    label: {
      fr: 'MRE (Marocain résidant à l’étranger)',
      darija: 'مغاربة العالم MRE'
    },
    icon: 'Globe',
    description: {
      fr: 'Gestion double, transferts au pays, investissements au Maroc et budget vacances.',
      darija: 'تحويلات البلاد، الاستثمار في المغرب و عطلة الصيف.'
    },
    suggestedBuckets: [
      { category: 'remittance', label: { fr: 'Envoi Famille Maroc', darija: 'مصروف العائلة في المغرب' }, allocatedPercent: 20, isEssential: true, icon: 'Heart', color: 'bg-rose-600' },
      { category: 'savings', label: { fr: 'Investissement Maroc', darija: 'الاستثمار في المغرب' }, allocatedPercent: 25, isEssential: false, icon: 'TrendingUp', color: 'bg-purple-600' },
      { category: 'food', label: { fr: 'Vie Courante & Alimentation', darija: 'المصاريف و الماكلة اليومية' }, allocatedPercent: 25, isEssential: true, icon: 'Utensils', color: 'bg-blue-600' },
      { category: 'housing', label: { fr: 'Logement principal', darija: 'السكن و الكراء بالخارج' }, allocatedPercent: 20, isEssential: true, icon: 'Home', color: 'bg-emerald-600' },
      { category: 'transport', label: { fr: 'Voyages & Vacances', darija: 'السفر و العطلة بالبلاد' }, allocatedPercent: 10, isEssential: false, icon: 'Car', color: 'bg-amber-500' }
    ],
    suggestedGoals: [
      { name: { fr: 'Investissement immobilier au Maroc', darija: 'بناء أو شراء منزل في المغرب' }, icon: 'Home', suggestedAmount: 150000 }
    ],
    recommendedAcademyModuleId: 'mre_invest',
    tipMessage: {
      fr: 'Utilisez le Mode MRE pour planifier vos transferts d’argent et réduire les frais de virement !',
      darija: 'خدم بوضعية MRE باش تنظم تحويلات الفلوس بأقل تكلفة ممكنة !'
    }
  },
  retraite: {
    id: 'retraite',
    label: {
      fr: 'Retraité',
      darija: 'متقاعد'
    },
    icon: 'Heart',
    description: {
      fr: 'Revenus fixes, focus sur la santé, l’aide aux proches et les projets personnels.',
      darija: 'صالير التقاعد الثابت، التركيز على الصحة، مساعدة الأحفاد و العمرة.'
    },
    suggestedBuckets: [
      { category: 'housing', label: { fr: 'Logement & Charges', darija: 'السكن و المصاريف الثابتة' }, allocatedPercent: 30, isEssential: true, icon: 'Home', color: 'bg-emerald-600' },
      { category: 'food', label: { fr: 'Alimentation', darija: 'التقدية و الصحة الغذائية' }, allocatedPercent: 25, isEssential: true, icon: 'Utensils', color: 'bg-blue-600' },
      { category: 'health', label: { fr: 'Santé & Traitement', darija: 'الصحة، الدوا و التحاليل' }, allocatedPercent: 20, isEssential: true, icon: 'Heart', color: 'bg-rose-600' },
      { category: 'leisure', label: { fr: 'Cadeaux & Petits-enfants', darija: 'هدايا الأحفاد و النشاط' }, allocatedPercent: 15, isEssential: false, icon: 'Sparkles', color: 'bg-indigo-600' },
      { category: 'savings', label: { fr: 'Épargne & Omra', darija: 'حصالة التوفير و العمرة' }, allocatedPercent: 10, isEssential: false, icon: 'PiggyBank', color: 'bg-purple-600' }
    ],
    suggestedGoals: [
      { name: { fr: 'Voyage religieux (Omra)', darija: 'سفر العمرة المباركة' }, icon: 'Plane', suggestedAmount: 18000 },
      { name: { fr: 'Cadeaux Petits-enfants', darija: 'هدايا الأحفاد' }, icon: 'Coins', suggestedAmount: 3000 }
    ],
    recommendedAcademyModuleId: 'retirement_prep',
    tipMessage: {
      fr: 'Suivez de près vos dépenses de santé et anticipez les renouvellements de soins.',
      darija: 'تبع مزيان مصاريف العلاج و الصحة و توكل على الله فالتوفير لعمرتك !'
    }
  }
};

export function getPersonaTemplate(personaId: string): PersonaTemplate {
  return PERSONA_TEMPLATES[personaId] || PERSONA_TEMPLATES.salarie;
}

export function applyPersonaToOnboardingState(personaId: string, monthlyIncome: number) {
  const template = getPersonaTemplate(personaId);
  
  const suggestedBuckets = template.suggestedBuckets.map(b => ({
    id: b.category,
    name: b.label,
    category: b.category,
    percentage: b.allocatedPercent,
    amount: Math.round((monthlyIncome * b.allocatedPercent) / 100),
    color: b.color,
    icon: b.icon,
    isEssential: b.isEssential
  }));

  const suggestedGoals = template.suggestedGoals.map(g => ({
    name: g.name,
    icon: g.icon,
    suggestedAmount: g.suggestedAmount
  }));

  return {
    suggestedBuckets,
    suggestedGoals,
    recommendedAcademyModuleId: template.recommendedAcademyModuleId,
    tipMessage: template.tipMessage
  };
}
