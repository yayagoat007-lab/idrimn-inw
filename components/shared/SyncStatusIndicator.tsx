import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  CloudOff, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Info
} from 'lucide-react';
import { OfflineDB, PrioritySyncItem } from '../../lib/offline-db';

interface SyncStatusIndicatorProps {
  language: 'fr' | 'darija';
  onSyncCompleted?: () => void;
}

export function SyncStatusIndicator({
  language,
  onSyncCompleted
}: SyncStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState<boolean>(typeof window !== 'undefined' ? navigator.onLine : true);
  const [isWifi, setIsWifi] = useState<boolean>(true);
  const [queue, setQueue] = useState<PrioritySyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
      updateQueueInfo();
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    updateQueueInfo();

    const interval = setInterval(updateQueueInfo, 8000); // Poll queue size periodically

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      clearInterval(interval);
    };
  }, []);

  const updateQueueInfo = async () => {
    const pQueue = await OfflineDB.getSyncPriorityQueue();
    setQueue(pQueue);

    // Detect WiFi state
    let wifiState = true;
    if (typeof window !== 'undefined') {
      const nav = navigator as any;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
      if (conn) {
        if (conn.type) {
          wifiState = conn.type === 'wifi' || conn.type === 'ethernet';
        } else if (conn.saveData) {
          wifiState = false;
        } else {
          wifiState = conn.effectiveType !== '2g' && conn.effectiveType !== '3g' && conn.effectiveType !== '4g';
        }
      }
    }
    setIsWifi(wifiState);
  };

  const textItems = queue.filter(item => !item.requiresWifi);
  const imageItems = queue.filter(item => item.requiresWifi);

  const handleForceSync = async () => {
    if (!isOnline) return;
    
    // If we have images to sync and we're NOT on WiFi, warn the user about cellular consumption
    if (imageItems.length > 0 && !isWifi && !showWarning) {
      setShowWarning(true);
      return;
    }

    setIsSyncing(true);
    setShowWarning(false);

    // Simulate item processing delay
    setTimeout(async () => {
      // Clear all synchronized items
      const allIds = queue.map(q => q.id);
      await OfflineDB.clearSyncQueue(allIds);
      
      setQueue([]);
      setIsSyncing(false);
      
      setSuccessMsg(
        language === 'darija' 
          ? 'Koulchi t-synchra b najah !' 
          : 'Toutes les données synchronisées avec succès !'
      );
      setTimeout(() => setSuccessMsg(''), 3000);

      if (onSyncCompleted) {
        onSyncCompleted();
      }
    }, 2000);
  };

  const t = {
    title: language === 'darija' ? 'Hala d-Synchronisation' : 'État de la Synchronisation',
    synced: language === 'darija' ? 'Koulchi m-synchri' : 'Données synchronisées',
    pendingText: (count: number) => language === 'darija' 
      ? `${count} elements (Kteba)` 
      : `${count} éléments (texte)`,
    pendingImages: (count: number) => language === 'darija' 
      ? `${count} tsawer (WiFi darouri)` 
      : `${count} images (WiFi requis)`,
    forceSyncBtn: language === 'darija' ? 'Forcer la sync (Bezzez)' : 'Forcer la synchronisation',
    warningTitle: language === 'darija' ? '⚠️ 3andek !' : '⚠️ Consommation de Données',
    warningMsg: language === 'darija' 
      ? "Ghadin t-synchri tsawer d-reçus bla WiFi. Hadchi 9der yakol lik l'internet dyal carte SIM."
      : "Vous allez synchroniser des images de reçus sans connexion WiFi. Cela peut consommer votre forfait mobile.",
    proceedBtn: language === 'darija' ? 'Kamel d-Sync' : 'Continuer quand même',
    cancelBtn: language === 'darija' ? 'Blach' : 'Annuler',
    offlineStatus: language === 'darija' ? 'Hors-ligne 🔴' : 'Hors-ligne 🔴',
    onlineStatus: language === 'darija' ? 'Connecté (WiFi)' : 'Connecté (WiFi)',
    cellularStatus: language === 'darija' ? 'Connecté (Réseau Mobile)' : 'Connecté (Réseau Mobile)',
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs space-y-4 font-sans" id="sync-status-indicator">
      
      {/* Title with live state */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-blue-600 animate-pulse" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{t.title}</h4>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase font-bold">
          {isOnline ? (
            isWifi ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <Wifi size={12} />
                <span>{t.onlineStatus}</span>
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1">
                <Cloud size={12} />
                <span>{t.cellularStatus}</span>
              </span>
            )
          ) : (
            <span className="text-red-500 flex items-center gap-1">
              <CloudOff size={12} />
              <span>{t.offlineStatus}</span>
            </span>
          )}
        </div>
      </div>

      {/* Synchronized state */}
      {queue.length === 0 && !isSyncing && !successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl">
          <CheckCircle className="text-emerald-600 shrink-0" size={16} />
          <div className="text-[11px] font-bold text-slate-700">
            <p className="font-black text-emerald-800 uppercase text-[9px] tracking-wider">{t.synced}</p>
            <p className="text-slate-400 font-semibold uppercase text-[8px] mt-0.5">Aucun élément en attente locale</p>
          </div>
        </div>
      )}

      {/* Success Notify */}
      {successMsg && (
        <div className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-center font-black p-3 rounded-2xl text-[10px] uppercase">
          {successMsg}
        </div>
      )}

      {/* Queue items pending display */}
      {queue.length > 0 && !isSyncing && (
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
            <div className="space-y-0.5">
              <span className="text-[8px] uppercase font-black text-slate-400 block">Éléments en attente</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {textItems.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono text-[9px] font-black border border-blue-100">
                    {t.pendingText(textItems.length)}
                  </span>
                )}
                {imageItems.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-mono text-[9px] font-black border border-amber-100 flex items-center gap-1">
                    <WifiOff size={9} />
                    <span>{t.pendingImages(imageItems.length)}</span>
                  </span>
                )}
              </div>
            </div>

            {isOnline && (
              <button
                onClick={handleForceSync}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black uppercase text-[9px] tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors self-end sm:self-auto"
              >
                <RefreshCw size={11} />
                <span>{t.forceSyncBtn}</span>
              </button>
            )}
          </div>

          {/* Interactive alert for WiFi requirement */}
          {imageItems.length > 0 && !isWifi && !showWarning && (
            <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl flex items-center gap-2">
              <Info size={13} className="text-amber-600 shrink-0" />
              <p className="text-[9px] text-amber-800 font-bold uppercase leading-relaxed">
                Les images de reçus attendent une connexion WiFi pour économiser votre forfait mobile.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sync in progress indicator */}
      {isSyncing && (
        <div className="flex flex-col items-center justify-center py-4 space-y-2">
          <RefreshCw size={24} className="animate-spin text-blue-600" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">
            {language === 'darija' ? 'Sbar, d-sync khadama...' : 'Synchronisation des données en cours...'}
          </p>
        </div>
      )}

      {/* Force cellular warning */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-100 p-4 rounded-2xl space-y-3"
          >
            <div className="flex gap-2">
              <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={16} />
              <div className="space-y-1">
                <h5 className="text-[10px] font-black text-red-900 uppercase tracking-wide">{t.warningTitle}</h5>
                <p className="text-[10px] text-red-700 font-bold leading-relaxed">
                  {t.warningMsg}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowWarning(false)}
                className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[9px] uppercase border border-slate-200 rounded-lg cursor-pointer transition-colors"
              >
                {t.cancelBtn}
              </button>
              <button
                onClick={handleForceSync}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-black text-[9px] uppercase rounded-lg cursor-pointer transition-colors"
              >
                {t.proceedBtn}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
export default SyncStatusIndicator;
