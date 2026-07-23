"use client";

import React from 'react';
import { useTranslation } from '../../../hooks/use-translation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const { lang, changeLanguage } = useTranslation();

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-6 font-sans antialiased text-slate-800">
      <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-xs space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{lang === 'darija' ? "Rje3 l l-Accueil" : "Retour à l'accueil"}</span>
          </a>
          <button
            onClick={() => changeLanguage(lang === 'fr' ? 'darija' : 'fr')}
            className="px-2 py-1 text-[10px] font-extrabold border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer text-slate-600 uppercase tracking-widest"
          >
            {lang === 'fr' ? '🇲🇦 Darija' : '🇫🇷 Français'}
          </button>
        </div>

        {lang === 'darija' ? (
          <>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
              Siyassat l-Khoussoussiya 🔒
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              F Floussi, sirrya o l-Aman dyal m3loumat dyalk l-maliya hiya f ras l-liha dyalna. Floussek o m3loumat dyalk dyalk bohedk.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kandiro l-chiffrement l-kamel (chiffrement de bout en bout) 3la koul l-mu\'amalat lli m-synchyine m3a Supabase Cloud. Ila knti khddam bla internet, l-m3loumat dyalk kat-bqa ghir f t-tilifoun dyalk f l-IndexedDB l-secure (b Capacitor wrapper).
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Makan-bi3ouch o makan-char-kouch m3loumat dyalk m3a hta chi had khor, bhal l-bnaqi aw charikat d s-salaf. L-ish\'harat (dyal Google AdSense l l-hssabat l-fabor) kat-koune bla smyya (anonyme).
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
              Politique de Confidentialité 🔒
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Chez Floussi, la confidentialité et la sécurité de vos informations financières sont notre priorité absolue. Vos données budgétaires vous appartiennent.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nous mettons en œuvre un chiffrement de bout en bout sur toutes les transactions stockées et synchronisées dans notre infrastructure Supabase Cloud. Si vous utilisez Floussi hors-ligne, vos données de budget restent confinées dans la mémoire IndexedDB sécurisée de votre smartphone (Capacitor wrapper).
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nous ne vendons ni ne partageons vos données financières privées avec des organismes de crédit ou des banques tierces. Toute intégration publicitaire (Google AdSense pour les utilisateurs gratuits) s'effectue de manière anonymisée.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

