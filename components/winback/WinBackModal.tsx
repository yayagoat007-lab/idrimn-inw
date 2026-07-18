import React from 'react';
import { SidiAvatar } from '../sidi/SidiAvatar';
import { WinBackMessage } from '../../lib/winback-messages';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useFocusTrap } from '../../hooks/use-focus-trap';

interface WinBackModalProps {
  message: WinBackMessage;
  language: 'fr' | 'darija';
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const WinBackModal: React.FC<WinBackModalProps> = ({
  message,
  language,
  onClose,
  onNavigate
}) => {
  const content = message[language];
  const targetPage = message.targetPage;

  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen: true, onClose });

  const handleCtaClick = () => {
    // Map winback targets to actual App screen routes
    const pageRouteMap: { [key: string]: string } = {
      goals: 'goals',
      tontine: 'tontine',
      wallet: 'wallet',
      events: 'dashboard', // Moroccan events are fully managed on the dashboard page
      dashboard: 'dashboard'
    };

    const targetRoute = pageRouteMap[targetPage] || 'dashboard';
    onNavigate(targetRoute);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        id="winback-welcome-modal"
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Subtle decorative Moroccan arch motif background overlay */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button 
          id="close-winback-modal"
          onClick={onClose}
          aria-label="Fermer le message de bienvenue / إغلاق رسالة الترحيب"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="p-6 md:p-8 pt-10 flex flex-col items-center text-center relative">
          {/* Sidi Floussi Avatar with elegant animated backdrop */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl scale-110 animate-pulse" />
            <SidiAvatar mood="happy" size={96} className="relative z-10 border-4 border-white rounded-full bg-slate-50 shadow-md" />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white rounded-full p-1.5 shadow-md z-10 border-2 border-white">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
            </div>
          </div>

          {/* Sidi Floussi's welcome balloon */}
          <div className="relative bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 mb-6 max-w-xs text-xs font-black text-slate-500 tracking-wider uppercase">
            {language === 'darija' ? 'Ahlan wa sahlan b-raj3a dyalk !' : 'Sidi Floussi est ravi de te revoir !'}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-8 border-transparent border-b-slate-50" />
          </div>

          {/* Title & Message */}
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight px-2">
            {content.title}
          </h3>
          
          <p className="text-slate-500 mt-3 text-sm md:text-base leading-relaxed px-1">
            {content.message}
          </p>

          {/* Buttons Stack */}
          <div className="w-full mt-8 flex flex-col gap-2.5">
            {/* Primary Action Button */}
            <button
              id="winback-cta-btn"
              onClick={handleCtaClick}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition-all shadow-lg shadow-emerald-600/15 active:scale-98 group"
            >
              <span>{content.ctaLabel}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Dismiss Button */}
            <button
              id="winback-dismiss-btn"
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-sm font-black transition-all active:scale-98"
            >
              {language === 'darija' ? 'Mn ba3d / Plus tard' : 'Plus tard, d\'accord !'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
