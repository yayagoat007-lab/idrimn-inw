import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Laptop, 
  Users, 
  Globe, 
  Heart, 
  Sparkles, 
  Check, 
  X 
} from 'lucide-react';
import { Language } from '../../lib/i18n';
import { getPersonaTemplate } from '../../lib/persona-templates';

interface PersonaPresetSuggestionBannerProps {
  personaId: string;
  onApply: () => void;
  onDismiss: () => void;
  language: Language;
}

export function PersonaPresetSuggestionBanner({
  personaId,
  onApply,
  onDismiss,
  language
}: PersonaPresetSuggestionBannerProps) {
  // If no personaId or invalid, don't show
  if (!personaId) return null;

  const template = getPersonaTemplate(personaId);
  if (!template) return null;

  // Persona name and description in selected language
  const personaName = language === 'fr' ? template.label.fr : template.label.darija;

  // Icon mapping
  const iconMap: Record<string, React.ReactNode> = {
    GraduationCap: <GraduationCap className="w-5 h-5 text-emerald-600" />,
    Briefcase: <Briefcase className="w-5 h-5 text-emerald-600" />,
    Laptop: <Laptop className="w-5 h-5 text-emerald-600" />,
    Users: <Users className="w-5 h-5 text-emerald-600" />,
    Globe: <Globe className="w-5 h-5 text-emerald-600" />,
    Heart: <Heart className="w-5 h-5 text-emerald-600" />
  };

  const personaIcon = iconMap[template.icon] || <Sparkles className="w-5 h-5 text-emerald-600" />;

  const titleFr = `Disposition optimisée pour ton profil ${personaName}`;
  const titleDarija = `Tanzim mnasseb l l-brorfil dyalek: ${personaName}`;

  const descFr = `Nous avons préparé un agencement de tableau de bord spécialement adapté à tes priorités quotidiennes d'épargne et de budget. Souhaites-tu l'essayer ?`;
  const descDarija = `Gaddina lik tanzim d l-widgets khass b l-ihtiyajate l-yawmiya dyalek. Bghiti t-jerrbo ?`;

  return (
    <div 
      id="persona-preset-banner"
      className="bg-gradient-to-r from-emerald-50/60 to-teal-50/40 border border-emerald-100/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-fadeIn relative overflow-hidden"
    >
      {/* Decorative background flare */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-100/60 flex items-center justify-center shrink-0 shadow-xs">
          {personaIcon}
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">
              {language === 'fr' ? titleFr : titleDarija}
            </h4>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Nouveau</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 font-semibold leading-relaxed">
            {language === 'fr' ? descFr : descDarija}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 border-t border-emerald-100/40 pt-4 md:pt-0 md:border-0 justify-end">
        <button
          onClick={onDismiss}
          className="px-3.5 py-2 hover:bg-slate-100/80 border border-slate-100 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          {language === 'fr' ? "Plus tard" : "Men b3ad"}
        </button>
        
        <button
          onClick={onApply}
          className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/10 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{language === 'fr' ? "Appliquer" : "Khdem bih"}</span>
        </button>
      </div>
    </div>
  );
}
