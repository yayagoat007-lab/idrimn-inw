import React from 'react';
import { 
  Activity, Award, Calendar, BookOpen, 
  ChevronRight, Info, CheckCircle2, AlertCircle, HelpCircle
} from 'lucide-react';
import { FloussiScoreComponents } from '../../lib/floussi-score';

interface ScoreBreakdownCardProps {
  components: FloussiScoreComponents;
  language: 'fr' | 'darija';
}

export function ScoreBreakdownCard({ components, language }: ScoreBreakdownCardProps) {
  const isDarija = language === 'darija';

  // Define each pillar's configuration
  const pillars = [
    {
      key: 'financialHealth',
      labelFr: 'Santé Financière',
      labelDarija: 'الصحة المالية',
      value: components.financialHealth,
      weight: '40%',
      icon: <Activity className="w-4 h-4 text-emerald-500" />,
      colorClass: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      descFr: 'Basée sur votre taux d’épargne, votre niveau d’endettement et votre budget disponible.',
      descDarija: 'كتعبر على نسبة التوفير ديالك، الديون المتبقية والميزانية لي شاطت ليك.'
    },
    {
      key: 'gamificationProgress',
      labelFr: 'Niveaux & Récompenses',
      labelDarija: 'الرتب والجوائز',
      value: components.gamificationProgress,
      weight: '25%',
      icon: <Award className="w-4 h-4 text-amber-500" />,
      colorClass: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      descFr: 'Mesure vos badges débloqués, vos objectifs complétés et votre XP total.',
      descDarija: 'كتحسب الشارات لي ربحتها، الأهداف لي كملتيها ونقاط الخبرة ديالك.'
    },
    {
      key: 'consistency',
      labelFr: 'Régularité de Saisie',
      labelDarija: 'الاستمرارية والمواظبة',
      value: components.consistency,
      weight: '20%',
      icon: <Calendar className="w-4 h-4 text-blue-500" />,
      colorClass: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      descFr: 'Prend en compte votre série de connexions consécutives (streak) et vos saisies régulières.',
      descDarija: 'كتعتمد على عدد المرات لي كدخل فيها للتطبيق ومتابعة المصاريف بلا انقطاع.'
    },
    {
      key: 'engagement',
      labelFr: 'Académie & Activités',
      labelDarija: 'الأكاديمية والأنشطة',
      value: components.engagement,
      weight: '15%',
      icon: <BookOpen className="w-4 h-4 text-violet-500" />,
      colorClass: 'bg-violet-500',
      textColor: 'text-violet-700',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-100',
      descFr: 'Évalue les leçons complétées dans l’Académie Floussi et vos chats d’apprentissage avec Sidi Floussi.',
      descDarija: 'كتعبر على الدروس لي قريتيها فAcadémie والمحادثات لي درتي مع سيدي فلوسي.'
    }
  ];

  // Evaluate the status of a pillar value
  const getPillarStatus = (val: number) => {
    if (val >= 80) {
      return {
        labelFr: 'Excellent',
        labelDarija: 'ممتاز',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      };
    } else if (val >= 50) {
      return {
        labelFr: 'Bon',
        labelDarija: 'جيد',
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <CheckCircle2 className="w-3 h-3 text-blue-600" />
      };
    } else if (val >= 30) {
      return {
        labelFr: 'Moyen',
        labelDarija: 'متوسط',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <AlertCircle className="w-3 h-3 text-amber-600" />
      };
    } else {
      return {
        labelFr: 'À améliorer',
        labelDarija: 'يحتاج تحسين',
        badge: 'bg-rose-100 text-rose-800 border-rose-200',
        icon: <AlertCircle className="w-3 h-3 text-rose-600" />
      };
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
      
      {/* Header section with minimal clean styling */}
      <div>
        <h4 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
          <span>{isDarija ? "تفاصيل سكور فلوسي" : "Composition du Score"}</span>
        </h4>
        <p className="text-[11px] text-slate-400 font-bold mt-1">
          {isDarija 
            ? "هاد الأركان الأربعة هي لي كتحدد سكور ديالك. كولما حسنتهيوم، كايزيد سكورك الكلي."
            : "Chaque pilier est évalué sur 100 points puis pondéré pour calculer votre maturité financière globale."}
        </p>
      </div>

      {/* Grid of the 4 Pillars */}
      <div className="space-y-4">
        {pillars.map((pillar) => {
          const status = getPillarStatus(pillar.value);
          const name = isDarija ? pillar.labelDarija : pillar.labelFr;
          const desc = isDarija ? pillar.descDarija : pillar.descFr;
          const statusLabel = isDarija ? status.labelDarija : status.labelFr;

          return (
            <div 
              key={pillar.key} 
              className="p-4 border border-slate-100 rounded-2xl bg-slate-50/20 hover:bg-slate-50/60 transition-colors duration-150 space-y-3"
            >
              
              {/* Pillar Title & Meta */}
              <div className="flex justify-between items-start">
                <div className="flex gap-2.5 items-center">
                  <div className={`p-2 rounded-xl ${pillar.bgColor} ${pillar.textColor} border ${pillar.borderColor}`}>
                    {pillar.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-slate-800">{name}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-400 font-extrabold px-1.5 py-0.5 rounded-md">
                        {isDarija ? `الوزن : ${pillar.weight}` : `Coef. ${pillar.weight}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 max-w-sm sm:max-w-md">
                      {desc}
                    </p>
                  </div>
                </div>

                {/* Score & Evaluation Badge */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-slate-800">
                    {pillar.value} <span className="text-[10px] text-slate-400 font-bold">/ 100</span>
                  </div>
                  <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-extrabold tracking-tight ${status.badge}`}>
                    {status.icon}
                    <span>{statusLabel}</span>
                  </div>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`${pillar.colorClass} h-full rounded-full transition-all duration-1000`} 
                    style={{ width: `${pillar.value}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
export default ScoreBreakdownCard;
