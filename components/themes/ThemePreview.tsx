import React from 'react';
import { FloussiTheme } from '../../lib/themes';
import { LayoutDashboard, Wallet, CreditCard, ChevronRight, TrendingUp } from 'lucide-react';

interface ThemePreviewProps {
  theme: FloussiTheme;
}

export function ThemePreview({ theme }: ThemePreviewProps) {
  return (
    <div className="border border-slate-150 rounded-2xl bg-white p-5 shadow-xs relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h4 className="text-xs font-black text-slate-800 tracking-tight">Aperçu du Thème Actif</h4>
        <span 
          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
        >
          {theme.name.split(' ')[0]}
        </span>
      </div>

      {/* Simulated Device Interface */}
      <div 
        className="rounded-xl border border-slate-150 overflow-hidden text-slate-800"
        style={{ backgroundColor: theme.background }}
      >
        {/* Navigation header */}
        <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}>
              <span className="text-[10px] font-black">F</span>
            </div>
            <span className="text-[10px] font-black text-slate-800 tracking-tight">Floussi</span>
          </div>
          <div className="w-4 h-4 rounded-full bg-slate-200" />
        </div>

        {/* Content body */}
        <div className="p-3 space-y-3">
          {/* Main Card */}
          <div 
            className="rounded-lg p-3 text-white shadow-xs"
            style={{ backgroundColor: theme.primary }}
          >
            <div className="text-[8px] font-bold opacity-80 uppercase tracking-wider">Solde Total</div>
            <div className="text-sm font-black mt-0.5">14 250,00 DH</div>
            <div className="flex items-center gap-1 mt-1 text-[8px] font-semibold opacity-90">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>+15% ce mois-ci</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-2 border border-slate-100">
              <span className="text-[7px] font-bold text-slate-400 uppercase block">Sandoq Alimentation</span>
              <span className="text-[9px] font-black text-slate-800 block mt-0.5">1 200,00 DH</span>
              <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '65%', backgroundColor: theme.accent }} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 border border-slate-100">
              <span className="text-[7px] font-bold text-slate-400 uppercase block">Daret Darb Sultan</span>
              <span className="text-[9px] font-black text-slate-800 block mt-0.5">Active</span>
              <div className="flex items-center justify-between mt-1 text-[7px] font-semibold" style={{ color: theme.primary }}>
                <span>Rond 4 / 10</span>
                <ChevronRight className="w-2 h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ThemePreview;
