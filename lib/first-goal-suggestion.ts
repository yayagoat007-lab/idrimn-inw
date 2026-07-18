export interface SuggestedGoal {
  name: {
    fr: string;
    darija: string;
  };
  icon: string;
  suggestedAmount: number;
  suggestedDeadlineMonths: number;
  reasoning: {
    fr: string;
    darija: string;
  };
  color: string;
}

export function getSuggestedFirstGoal(persona?: string, monthlyIncome?: number): SuggestedGoal {
  const income = monthlyIncome || 0;

  // If persona matches, customize the suggestion
  if (persona === 'mre') {
    return {
      name: {
        fr: "Investissement Immobilier au Maroc",
        darija: "الاستثمار العقاري في المغرب"
      },
      icon: "Home",
      suggestedAmount: 150000,
      suggestedDeadlineMonths: 24,
      color: "#059669", // Emerald
      reasoning: {
        fr: "Idéal pour bâtir ou acheter votre chez-vous au pays et sécuriser votre patrimoine d'avenir.",
        darija: "ممتاز باش تبني ولا تشري دويرتك فبلادك وتضمن المستقبل ديالك."
      }
    };
  }

  if (persona === 'parent_famille') {
    return {
      name: {
        fr: "Rentrée Scolaire & Aïd",
        darija: "الدخول المدرسي و العيد"
      },
      icon: "GraduationCap",
      suggestedAmount: 5000,
      suggestedDeadlineMonths: 6,
      color: "#4F46E5", // Indigo
      reasoning: {
        fr: "Idéal pour lisser ces dépenses familiales prévisibles et garder l'esprit tranquille le moment venu.",
        darija: "باش تقاد هاد المصاريف ديال العائلة بلا ما تزير فاش يوصل وقتها."
      }
    };
  }

  if (persona === 'freelance') {
    const amount = income > 0 ? Math.round(income * 3) : 15000;
    return {
      name: {
        fr: "Fonds d'Urgence Sécurité (3 mois)",
        darija: "صندوق الطوارئ (3 أشهر)"
      },
      icon: "ShieldAlert",
      suggestedAmount: amount,
      suggestedDeadlineMonths: 12,
      color: "#DC2626", // Red
      reasoning: {
        fr: `Pour compenser les variations de revenus propres au statut d'indépendant avec un coussin de ${amount.toLocaleString('fr-FR')} DH.`,
        darija: `باش تضمن الاستقرار و تفادى تقلبات المدخول ديال الخدمة الحرة ببركة ديال ${amount.toLocaleString('fr-FR')} درهم.`
      }
    };
  }

  if (persona === 'etudiant') {
    return {
      name: {
        fr: "Fonds d'Urgence Étudiant",
        darija: "صندوق الطوارئ للطالب"
      },
      icon: "PiggyBank",
      suggestedAmount: 2000,
      suggestedDeadlineMonths: 4,
      color: "#D97706", // Amber
      reasoning: {
        fr: "Pour parer aux imprévus de la vie étudiante (frais médicaux, transport, matériel) sans stress.",
        darija: "باش تواجه أي مفajأة (طبيب، ماتريال، سفر) بلا ما توحل فالدراسة ديالك."
      }
    };
  }

  if (persona === 'retraite') {
    return {
      name: {
        fr: "Voyage Spirituel (Omra)",
        darija: "سفر العمرة المباركة"
      },
      icon: "Plane",
      suggestedAmount: 18000,
      suggestedDeadlineMonths: 12,
      color: "#059669", // Emerald
      reasoning: {
        fr: "Préparez sereinement votre prochain pèlerinage spirituel sans stresser votre pension mensuelle.",
        darija: "وجد على خاطرك للسفر المبارك ولا العمرة بلا ما تزير الميزانية ديال التقاعد ديالك."
      }
    };
  }

  if (persona === 'salarie') {
    const amount = income > 0 ? Math.round(income * 3) : 15000;
    return {
      name: {
        fr: "Fonds d'Urgence (3 mois de dépenses)",
        darija: "صندوق الطوارئ (3 أشهر صالير)"
      },
      icon: "ShieldAlert",
      suggestedAmount: amount,
      suggestedDeadlineMonths: 12,
      color: "#D97706", // Amber
      reasoning: {
        fr: `La base de la sérénité : disposer de ${amount.toLocaleString('fr-FR')} DH de côté en cas de coup dur.`,
        darija: `الأساس ديال الهناء : توفر ${amount.toLocaleString('fr-FR')} درهم مخبية للزمان والظروف الصعبة.`
      }
    };
  }

  // Default fallback
  const fallbackAmount = income > 0 ? Math.round(income * 3) : 5000;
  return {
    name: {
      fr: "Mon Premier Fonds d'Urgence",
      darija: "صندوق الطوارئ الأول ديالي"
    },
    icon: "PiggyBank",
    suggestedAmount: fallbackAmount,
    suggestedDeadlineMonths: 12,
    color: "#0D9488", // Teal
    reasoning: {
      fr: `Constituer un coussin de sécurité de ${fallbackAmount.toLocaleString('fr-FR')} DH est la première étape indispensable pour libérer votre esprit.`,
      darija: `جمع واحد البركة ديال الأمان ديال ${fallbackAmount.toLocaleString('fr-FR')} درهم هي الخطوة الأولى والأساسية باش ترتاح.`
    }
  };
}
