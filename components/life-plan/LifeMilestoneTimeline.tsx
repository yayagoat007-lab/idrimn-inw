import React from 'react';
import { Milestone } from '../../lib/long-term-projection';
import { CheckCircle2, Circle, Trophy, ArrowRight, Star } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { useTranslation } from '../../hooks/use-translation';

interface LifeMilestoneTimelineProps {
  milestones: Milestone[];
  language?: 'fr' | 'darija';
}

export function LifeMilestoneTimeline({ milestones, language: propLanguage }: LifeMilestoneTimelineProps) {
  const { lang } = useTranslation();
  const language = propLanguage || lang;
  const t = {
    title: language === 'fr' ? 'Ta Frise Chronologique de Vie' : 'Moutsalsal dyal l-7ayat dyalk',
    subtitle: language === 'fr' 
      ? 'Découvre les grands jalons financiers que ton rythme actuel te permet d’atteindre.' 
      : 'Ktechef l-marahil l-kbeera li gha t-wsal liha b had l-i9a3 dyal l-iddikhar.',
    ageLabel: language === 'fr' ? 'ans' : '3am',
    yearLabel: language === 'fr' ? 'Dans' : 'F dorf',
    yearSuffix: language === 'fr' ? 'ans' : 'snin',
    projectedWorth: language === 'fr' ? 'Patrimoine projeté :' : 'L-flouss l-mat9adra :',
    achievable: language === 'fr' ? 'Planifié' : 'Moukhtat',
    today: language === 'fr' ? 'Aujourd’hui' : 'L-Youm',
  };

  return (
    <div 
      className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs space-y-5"
      id="life-milestones-timeline-card"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            {t.title}
          </h3>
          <p className="text-[11px] text-slate-500 font-bold leading-normal mt-0.5">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 pt-2" id="milestones-vertical-line-container">
        {/* The solid vertical timeline indicator line */}
        <div className="absolute left-[11px] sm:left-[15px] top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-500 via-sky-400 to-indigo-500 rounded-full" />

        {milestones.map((milestone, idx) => {
          const isRetirement = milestone.titleFr.includes("Retraite") || milestone.titleFr.includes("retraite");
          
          return (
            <div 
              key={idx}
              className="relative group transition-all duration-300"
            >
              {/* Timeline marker node */}
              <div className="absolute -left-[23px] sm:-left-[27px] top-1.5 z-10 flex items-center justify-center">
                {isRetirement ? (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow-xs flex items-center justify-center group-hover:scale-125 transition-transform duration-200">
                    <Star size={8} className="text-white fill-current" />
                  </div>
                ) : milestone.achieved ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-xs flex items-center justify-center group-hover:scale-125 transition-transform duration-200">
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-300 border-4 border-white shadow-xs flex items-center justify-center group-hover:scale-125 transition-transform duration-200">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                )}
              </div>

              {/* Card Container */}
              <div className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-xs hover:border-slate-300 ${
                isRetirement 
                  ? 'bg-gradient-to-r from-indigo-50/50 to-white border-indigo-150' 
                  : milestone.achieved 
                    ? 'bg-gradient-to-r from-emerald-50/20 to-white border-emerald-100' 
                    : 'bg-slate-50/30 border-slate-150'
              }`}>
                {/* Age & Year Indicators */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                      isRetirement 
                        ? 'bg-indigo-600 text-white' 
                        : milestone.achieved 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-200 text-slate-700'
                    }`}>
                      {milestone.age} {t.ageLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">
                      {t.yearLabel} {milestone.year} {t.yearSuffix}
                    </span>
                  </div>

                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isRetirement 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : milestone.achieved 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isRetirement ? (language === 'fr' ? 'Retraite' : 'Retraite') : milestone.achieved ? t.achievable : (language === 'fr' ? 'Hors limite' : 'B3id chwiya')}
                  </span>
                </div>

                {/* Milestone Title */}
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                  {language === 'fr' ? milestone.titleFr : milestone.titleDarija}
                </h4>

                {/* Description */}
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed mt-1">
                  {language === 'fr' ? milestone.descriptionFr : milestone.descriptionDarija}
                </p>

                {/* Projected Value Footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] uppercase font-black text-slate-400">
                    {t.projectedWorth}
                  </span>
                  <span className={`text-xs font-black font-mono ${
                    isRetirement ? 'text-indigo-600' : milestone.achieved ? 'text-emerald-600' : 'text-slate-600'
                  }`}>
                    {formatCurrency(milestone.projectedNetWorth)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default LifeMilestoneTimeline;
