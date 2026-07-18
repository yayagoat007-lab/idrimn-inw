import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Laptop, 
  Users, 
  Globe, 
  Heart, 
  Check, 
  UserCheck 
} from 'lucide-react';
import { PERSONA_TEMPLATES } from '../../lib/persona-templates';
import { Language } from '../../lib/i18n';

interface Step0PersonaProps {
  selectedPersona: string | null;
  onSelectPersona: (personaId: string) => void;
  language: Language;
  onNext: () => void;
}

const IconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  GraduationCap,
  Briefcase,
  Laptop,
  Users,
  Globe,
  Heart
};

export function Step0Persona({
  selectedPersona,
  onSelectPersona,
  language = 'fr',
  onNext
}: Step0PersonaProps) {
  const isDarija = language === 'darija';

  return (
    <div className="space-y-6 font-sans">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 animate-pulse">
          <UserCheck size={24} />
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">
          {isDarija ? 'أشنو هو البروفايل ديالك؟' : 'Quel est votre profil ?'}
        </h3>
        <p className="text-xs font-semibold text-slate-400">
          {isDarija 
            ? 'اختار البروفايل اللي كيشبه ليك باش نوجدو ليك ميزانية مخصصة.' 
            : 'Choisissez le profil qui vous correspond le mieux pour personnaliser vos enveloppes.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {Object.values(PERSONA_TEMPLATES).map((persona) => {
          const IconComponent = IconMap[persona.icon] || Briefcase;
          const isSelected = selectedPersona === persona.id;

          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => onSelectPersona(persona.id)}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] cursor-pointer flex flex-col gap-2 min-h-[110px] ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/20 shadow-md shadow-emerald-600/5'
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <IconComponent size={18} />
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check size={12} className="stroke-[3]" />
                  </span>
                )}
              </div>
              
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">
                  {isDarija ? persona.label.darija : persona.label.fr}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-relaxed">
                  {isDarija ? persona.description.darija : persona.description.fr}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!selectedPersona}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:pointer-events-none"
      >
        {isDarija ? 'الاستمرار / زيدي للقدام' : 'Continuer'}
      </button>
    </div>
  );
}

export default Step0Persona;
