import React from 'react';
import { AcademyModule } from '../../lib/academy-content';
import { BookOpen, Lock, CheckCircle2, Award } from 'lucide-react';
import { useTranslation } from '../../hooks/use-translation';

interface ModuleCardProps {
  module: AcademyModule;
  progress: number;
  isUnlocked: boolean;
  onSelect: () => void;
  language?: 'fr' | 'darija';
  hasCertificate: boolean;
  onViewCertificate: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  progress,
  isUnlocked,
  onSelect,
  language: propLanguage,
  hasCertificate,
  onViewCertificate
}) => {
  const { lang } = useTranslation();
  const language = propLanguage || lang;
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'budget': return language === 'darija' ? 'Mizaniya (Budget)' : 'Budget';
      case 'epargne': return language === 'darija' ? 'Iddikhar (Épargne)' : 'Épargne';
      case 'credit': return language === 'darija' ? 'Slaf (Crédit)' : 'Crédit';
      case 'investissement': return language === 'darija' ? 'Estethmar (Investissement)' : 'Investissement';
      case 'retraite': return language === 'darija' ? 'Retraite (Retraite)' : 'Retraite';
      case 'fiscalite': return language === 'darija' ? 'Driba (Fiscalité)' : 'Fiscalité';
      default: return cat;
    }
  };

  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case 'debutant': return language === 'darija' ? 'Moubtadi2 (Débutant)' : 'Débutant';
      case 'intermediaire': return language === 'darija' ? 'Moutawassit (Intermédiaire)' : 'Intermédiaire';
      case 'avance': return language === 'darija' ? 'Moutaqaddim (Avancé)' : 'Avancé';
      case 'expert': return language === 'darija' ? 'Mouhtarif (Expert)' : 'Expert';
      default: return lvl;
    }
  };

  const levelColors: { [key: string]: string } = {
    debutant: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    intermediaire: 'bg-blue-50 text-blue-700 border-blue-100',
    avance: 'bg-amber-50 text-amber-700 border-amber-100',
    expert: 'bg-purple-50 text-purple-700 border-purple-100'
  };

  const categoryColors: { [key: string]: string } = {
    budget: 'bg-sky-50 text-sky-700 border-sky-100',
    epargne: 'bg-teal-50 text-teal-700 border-teal-100',
    credit: 'bg-rose-50 text-rose-700 border-rose-100',
    investissement: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    retraite: 'bg-amber-50 text-amber-700 border-amber-100',
    fiscalite: 'bg-violet-50 text-violet-700 border-violet-100'
  };

  // Calculate total reading duration
  const totalMinutes = module.lessons.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);

  return (
    <div 
      id={`module-card-${module.id}`}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isUnlocked 
          ? 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50/40 cursor-pointer' 
          : 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-80'
      }`}
      onClick={() => isUnlocked && onSelect()}
    >
      {/* Decorative colored bar */}
      <div className={`h-1.5 w-full ${
        progress === 100 
          ? 'bg-emerald-500' 
          : module.level === 'debutant' 
            ? 'bg-emerald-400' 
            : module.level === 'intermediaire'
              ? 'bg-blue-400'
              : 'bg-amber-500'
      }`} />

      <div className="p-6">
        {/* Top badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${levelColors[module.level]}`}>
            {getLevelLabel(module.level)}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryColors[module.category]}`}>
            {getCategoryLabel(module.category)}
          </span>
          {progress === 100 && (
            <span className="flex items-center gap-1 ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {language === 'darija' ? 'Kamal' : 'Complété'}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 leading-snug">
          {module.title}
        </h3>
        <p className="text-sm font-medium text-emerald-700 mt-0.5 font-mono">
          {module.titleDarija}
        </p>

        {/* Description */}
        <p className="text-slate-500 text-sm mt-3 line-clamp-2">
          {language === 'darija' ? module.descriptionDarija : module.descriptionFr}
        </p>

        {/* Lessons info */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-4 mb-5 border-t border-slate-50 pt-3">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {module.lessons.length} {language === 'darija' ? 'Dourouss' : 'leçons'}
          </span>
          <span>•</span>
          <span>
            {totalMinutes} {language === 'darija' ? 'Daqiqa' : 'min'}
          </span>
        </div>

        {/* Progress Section */}
        {isUnlocked ? (
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
              <span>{language === 'darija' ? 'Taqaddoum' : 'Progression'}</span>
              <span className={progress === 100 ? 'text-emerald-600' : 'text-slate-700'}>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Certificate access button */}
            {hasCertificate && (
              <button
                id={`view-certificate-btn-${module.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCertificate();
                }}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all"
              >
                <Award className="w-4 h-4 text-amber-600" />
                {language === 'darija' ? 'Chouf ch-chahada' : 'Voir mon certificat'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold mt-3">
            <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              {language === 'darija' 
                ? "Khassek t-kemmel dars men l-mostawa l-fayt bach t-7all hada." 
                : "Complète au moins un module du niveau précédent pour débloquer."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
