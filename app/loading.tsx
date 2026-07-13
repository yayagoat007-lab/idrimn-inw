"use client";

import { RefreshCw } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
      <RefreshCw className="animate-spin text-emerald-600" size={32} />
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
        Chargement de Floussi...
      </p>
    </div>
  );
}
