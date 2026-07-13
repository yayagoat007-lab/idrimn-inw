import React from 'react';
import { Languages, Check } from 'lucide-react';
import { Language } from '../../lib/i18n';

interface Step1LanguageProps {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onNext: () => void;
}

export function Step1Language({ selectedLanguage, onSelectLanguage, onNext }: Step1LanguageProps) {
  return (
    <div className="space-y-6 font-sans">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 animate-bounce">
          <Languages size={24} />
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">
          Marhaban bikoum! • Bienvenue!
        </h3>
        <p className="text-xs font-semibold text-slate-400">
          Choisissez votre langue préférée pour l'application Floussi.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* French Option */}
        <button
          type="button"
          onClick={() => onSelectLanguage('fr')}
          className={`relative p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] cursor-pointer flex flex-col justify-between h-36 ${
            selectedLanguage === 'fr'
              ? 'border-emerald-600 bg-emerald-50/20 shadow-md shadow-emerald-600/5'
              : 'border-slate-100 hover:border-slate-200 bg-white'
          }`}
        >
          <div className="flex justify-between items-start w-full">
            <span className="text-2xl">🇫🇷</span>
            {selectedLanguage === 'fr' && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Check size={12} className="stroke-[3]" />
              </span>
            )}
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Français</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Interface standard en langue française.</p>
          </div>
        </button>

        {/* Darija Option */}
        <button
          type="button"
          onClick={() => onSelectLanguage('darija')}
          className={`relative p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] cursor-pointer flex flex-col justify-between h-36 ${
            selectedLanguage === 'darija'
              ? 'border-emerald-600 bg-emerald-50/20 shadow-md shadow-emerald-600/5'
              : 'border-slate-100 hover:border-slate-200 bg-white'
          }`}
        >
          <div className="flex justify-between items-start w-full">
            <span className="text-2xl">🇲🇦</span>
            {selectedLanguage === 'darija' && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Check size={12} className="stroke-[3]" />
              </span>
            )}
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">الدارجة المغربية</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Interface adaptée en Darija marocaine.</p>
          </div>
        </button>
      </div>

      <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 font-medium leading-relaxed">
        💡 <span className="font-bold text-slate-700">Info :</span> L'application Floussi intègre un dictionnaire hybride conçu spécialement pour le marché marocain, mélangeant des termes en Darija et en Français pour une compréhension intuitive et naturelle.
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
      >
        Continuer / زيدي للقدام
      </button>
    </div>
  );
}
export default Step1Language;
