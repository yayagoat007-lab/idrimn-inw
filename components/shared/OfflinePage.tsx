import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../hooks/use-translation';

export function OfflinePage() {
  const { lang } = useTranslation();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center max-w-sm mx-auto space-y-4">
      <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-150 text-rose-500 flex items-center justify-center shadow-xs animate-bounce">
        <WifiOff size={28} />
      </div>

      <div className="space-y-1">
        <h3 className="font-extrabold text-sm text-slate-900 leading-none">
          {lang === 'darija' ? "Mchat l-connexion" : "Connexion perdue"}
        </h3>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed pt-1">
          {lang === 'darija'
            ? "Ma qdernach n-rtbto m3a Supabase daba. Floussi ghadi i-kayyed l-masrouf dyalk bla internet o ghadi i-sowweb mli trje3 l-connexion."
            : "Impossible de se connecter à Supabase pour le moment. Floussi enregistre vos masroufs hors-ligne et se synchronisera dès que vous aurez du réseau."}
        </p>
      </div>

      <button
        onClick={handleRetry}
        className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <RefreshCw size={12} />
        <span>{lang === 'darija' ? "Awwed t-qiyyad" : "Réessayer"}</span>
      </button>
    </div>
  );
}
export default OfflinePage;

