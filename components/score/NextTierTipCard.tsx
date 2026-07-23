import React from 'react';
import { Target, Sparkles, ChevronRight, CheckSquare, Award } from 'lucide-react';
import { NextTierRequirement, FloussiScoreTier } from '../../lib/floussi-score';

interface NextTierTipCardProps {
  currentScore: number;
  nextTierTip: NextTierRequirement;
  language: 'fr' | 'darija';
}

export function NextTierTipCard({ currentScore, nextTierTip, language }: NextTierTipCardProps) {
  const isDarija = language === 'darija';

  // Determine what the next tier name actually is
  const getNextTierName = (score: number): { fr: string; darija: string; color: string } => {
    if (score >= 850) {
      return { fr: 'Légende absolue', darija: 'الأسطورة المطلقة', color: 'text-amber-500 bg-amber-50' };
    } else if (score >= 700) {
      return { fr: 'Légende', darija: 'الأسطورة', color: 'text-orange-500 bg-orange-50' };
    } else if (score >= 500) {
      return { fr: 'Maître', darija: 'المعلم', color: 'text-emerald-500 bg-emerald-50' };
    } else if (score >= 300) {
      return { fr: 'Stratège', darija: 'المخطط', color: 'text-violet-500 bg-violet-50' };
    } else {
      return { fr: 'Discipliné', darija: 'المنضبط', color: 'text-blue-500 bg-blue-50' };
    }
  };

  const nextTier = getNextTierName(currentScore);
  const nextTierName = isDarija ? nextTier.darija : nextTier.fr;

  // Render a lovely checklist based on the tip content to make it very actionable
  const getActionsFromTip = (tip: string) => {
    // Basic smart heuristics to render specific recommended sub-tasks
    if (tip.includes('épargne') || tip.includes('tawfir') || tip.includes('budget')) {
      return [
        isDarija ? "أضف ميزانية أو معاملة جديدة لتوضيح أهدافك" : "Ajouter ou ajuster un objectif dans vos Sandoqs d'épargne",
        isDarija ? "خفض مصاريفك غير الأساسية المخصصة للترفيه" : "Réduire de 10% vos dépenses non prioritaires ce mois-ci"
      ];
    }
    if (tip.includes('Académie') || tip.includes('leçon') || tip.includes('dars')) {
      return [
        isDarija ? "أكمل درسا تفاعليا في أكاديمية فلوسي (+100 XP)" : "Compléter un nouveau cours interactif dans l'Académie (+100 XP)",
        isDarija ? "تحدث مع سيدي فلوسي حول مفاهيم الاستثمار" : "Discuter avec Sidi Floussi pour obtenir un conseil personnalisé"
      ];
    }
    if (tip.includes('connexion') || tip.includes('check-in') || tip.includes('streak')) {
      return [
        isDarija ? "ادخل للتطبيق غدا للحفاظ على سلسلة تسجيلاتك المتتالية" : "Ouvrir l'application demain pour maintenir votre série active",
        isDarija ? "قم بتسجيل شعورك المالي اليومي لكسب نقاط مضافة" : "Faire votre check-in d'état d'esprit financier pour valider le streak"
      ];
    }
    return [
      isDarija ? "شارك في نقاشات مجتمع فلوسي أو تبرع لدارت" : "Poser une question financière d'actualité dans le forum d'entraide",
      isDarija ? "قم بتفقد ميزانيتك الحالية مع سيدي فلوسي" : "Faire un bilan rapide de vos transactions de la semaine"
    ];
  };

  const actions = getActionsFromTip(nextTierTip.tip);

  if (nextTierTip.pointsNeeded === 0) {
    return (
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white rounded-3xl p-6 shadow-md space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-15">
          <Award size={120} />
        </div>
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-white/20 rounded-xl">
            <Award size={20} className="text-white animate-bounce" />
          </div>
          <h4 className="text-sm font-black uppercase tracking-widest">{isDarija ? "مبروك!" : "Excellent travail !"}</h4>
        </div>
        <p className="text-xs font-bold leading-relaxed pr-8">
          {nextTierTip.tip}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
      
      {/* Title */}
      <div className="flex gap-2.5 items-start">
        <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl mt-0.5">
          <Target size={16} className="animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-800 tracking-tight">
            {isDarija ? "خطتك للرتبة القادمة" : "Objectif Prochain Palier"}
          </h4>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">
            {isDarija ? "نصائح مخصصة لمساعدتك على رفع مستواك المالي" : "Conseils dynamiques calculés pour maximiser votre évolution"}
          </p>
        </div>
      </div>

      {/* Point breakdown banner */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-2">
        <div className="flex justify-between items-center text-[11px] font-bold">
          <span className="text-slate-500">
            {isDarija ? "المسافة حتى الرتبة القادمة" : "Distance vers le niveau suivant"}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${nextTier.color}`}>
            {nextTierName}
          </span>
        </div>
        
        {/* Progress bar visualizer */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${Math.max(10, Math.min(100, 100 - (nextTierTip.pointsNeeded / 300) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
            <span>{currentScore} pts</span>
            <span className="text-amber-600 font-extrabold">
              {isDarija ? `خاصك +${nextTierTip.pointsNeeded} نقطة` : `Il vous manque ${nextTierTip.pointsNeeded} points`}
            </span>
          </div>
        </div>
      </div>

      {/* Main tip advice text */}
      <div className="p-4 bg-amber-50/40 border border-amber-100/50 rounded-2xl">
        <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-1 w-fit mb-2">
          <Sparkles size={10} className="text-amber-600 animate-spin-slow" />
          <span>{isDarija ? "النصيحة الذهبية" : "Conseil Actif de Sidi Floussi"}</span>
        </span>
        <p className="text-xs text-slate-600 font-bold leading-relaxed">
          {nextTierTip.tip}
        </p>
      </div>

      {/* Actionable items Checklist */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {isDarija ? "الخطوات المقترحة :" : "Actions Immédiates recommandées :"}
        </p>
        <div className="space-y-2">
          {actions.map((act, index) => (
            <div key={index} className="flex gap-2.5 items-start">
              <div className="p-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md mt-0.5">
                <CheckSquare size={12} />
              </div>
              <span className="text-[11px] text-slate-600 font-bold leading-relaxed">
                {act}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default NextTierTipCard;
