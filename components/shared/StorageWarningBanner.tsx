import React, { useState, useEffect } from 'react';
import { useStorageHealth } from '../../hooks/use-storage-health';
import { ShieldAlert, ArrowRight, X } from 'lucide-react';

interface StorageWarningBannerProps {
  userId: string;
  language: 'fr' | 'darija';
  onNavigateToSettings: () => void;
  context?: 'dashboard' | 'settings';
}

export default function StorageWarningBanner({
  userId,
  language,
  onNavigateToSettings,
  context = 'dashboard'
}: StorageWarningBannerProps) {
  const { healthStatus } = useStorageHealth(userId, language);
  const [isDismissed, setIsDismissed] = useState(false);

  // Determine visibility based on rules:
  // - Dashboard: only show if level is 'critical'
  // - Settings: show if level is 'warning' or 'critical'
  const shouldShow = 
    !isDismissed && 
    (context === 'dashboard' 
      ? healthStatus.healthLevel === 'critical' 
      : (healthStatus.healthLevel === 'warning' || healthStatus.healthLevel === 'critical'));

  if (!shouldShow) return null;

  const t = {
    criticalTitle: language === 'darija' ? "Khatar : Al-Khazna l-Mahalliya 3amrat bzzaf ! 🚨" : "Stockage local saturé ! 🚨",
    warningTitle: language === 'darija' ? "Intibah : Al-Khazna l-Mahalliya qarbat t3marr ! ⚠️" : "Stockage local presque plein ! ⚠️",
    criticalDesc: language === 'darija'
      ? "L-massa7a dyal l-browser fatet 90%. Khass t-khwiha daba f s-Settings bach t-fada machakil l-hifd."
      : "Votre espace de stockage local dépasse 90%. Veuillez libérer de l'espace immédiatement pour éviter des pertes de données.",
    warningDesc: language === 'darija'
      ? "L-massa7a dyal l-browser fatet 75%. N-ssiha: Mseh ba3d l-milafat f s-Settings."
      : "Votre espace de stockage local dépasse 75%. Nous vous conseillons de faire un nettoyage pour préserver les performances.",
    cta: language === 'darija' ? "Nettoyer daba" : "Nettoyer maintenant",
  };

  const isCritical = healthStatus.healthLevel === 'critical';
  const title = isCritical ? t.criticalTitle : t.warningTitle;
  const desc = isCritical ? t.criticalDesc : t.warningDesc;

  return (
    <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-slideDown ${
      isCritical 
        ? 'bg-rose-50 border-rose-100 text-rose-800' 
        : 'bg-amber-50 border-amber-100 text-amber-800'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          isCritical ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
        }`}>
          <ShieldAlert size={18} className={isCritical ? "animate-pulse" : ""} />
        </div>
        <div className="space-y-0.5">
          <h4 className={`text-xs font-black leading-none ${isCritical ? 'text-rose-950' : 'text-amber-950'}`}>{title}</h4>
          <p className="text-[11px] font-medium leading-normal max-w-2xl mt-1">{desc}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          onClick={() => setIsDismissed(true)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isCritical ? 'hover:bg-rose-100 text-rose-600' : 'hover:bg-amber-100 text-amber-600'
          }`}
          title={language === 'darija' ? "Sedd" : "Fermer"}
        >
          <X size={14} />
        </button>
        <button
          onClick={onNavigateToSettings}
          className={`px-3.5 py-2 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0 ${
            isCritical ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
          }`}
        >
          <span>{t.cta}</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
