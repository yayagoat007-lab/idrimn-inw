import React from 'react';
import { Sparkles, Calendar, ArrowRight, X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { useTranslation } from '../../hooks/use-translation';

interface WrappedIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  language?: 'fr' | 'darija';
}

export function WrappedIntroModal({ isOpen, onClose, onStart, language: propLanguage }: WrappedIntroModalProps) {
  const { lang } = useTranslation();
  const language = propLanguage || lang;
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  const t = {
    title: language === 'fr' ? "Ton année Floussi t'attend !" : "3am Floussi dyalek ra wajed !",
    subtitle: language === 'fr' 
      ? "Prêt à revivre vos victoires, analyser vos dépenses et célébrer vos sandoqs de l'année ?" 
      : "Wajed bach tchouf ch7al khbiti, fin srafti, w l-ahdaf li wsselti liha had l-3am ?",
    cta: language === 'fr' ? "Découvrir mon bilan" : "Chouf l-bilan dyali",
    skip: language === 'fr' ? "Plus tard" : "Mn b3d",
    badge: language === 'fr' ? "Rétrospective" : "Khlassa d l-3am"
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      
      {/* Container */}
      <div ref={modalRef} className="bg-radial from-slate-900 via-slate-950 to-black text-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-800 relative overflow-hidden text-center space-y-6">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full filter blur-3xl -ml-16 -mb-16"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Fermer l'introduction / إغلاق التقديم"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/50 transition-colors"
          id="btn-close-wrapped-intro"
        >
          <X size={20} />
        </button>

        {/* Icon & Badge */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-emerald-500 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
          <Sparkles className="text-slate-950" size={36} />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800 text-xs font-bold text-emerald-400 border border-slate-700/50 uppercase tracking-widest mx-auto">
          <Calendar size={12} />
          {t.badge}
        </span>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-sm font-semibold text-slate-400 leading-relaxed px-2">
            {t.subtitle}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={onStart}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            id="btn-discover-wrapped"
          >
            <span>{t.cta}</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            id="btn-skip-wrapped"
          >
            {t.skip}
          </button>
        </div>

      </div>
    </div>
  );
}
