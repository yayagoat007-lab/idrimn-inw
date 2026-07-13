import React from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';

interface SyncStatusBadgeProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount?: number;
}

export function SyncStatusBadge({
  isOnline,
  isSyncing,
  pendingCount = 0
}: SyncStatusBadgeProps) {
  if (isSyncing) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
        <RefreshCw size={11} className="animate-spin text-amber-600" />
        <span>Sync en cours ({pendingCount})</span>
      </span>
    );
  }

  if (!isOnline) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 text-rose-800 rounded-full text-[10px] font-black uppercase tracking-wider">
        <CloudOff size={11} className="text-rose-600" />
        <span>Hors-ligne {pendingCount > 0 && `(${pendingCount} en attente)`}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-wider">
      <Cloud size={11} className="text-emerald-600" />
      <span>Sauvegardé</span>
    </span>
  );
}
