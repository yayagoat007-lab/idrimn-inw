"use client";

import React from 'react';
import { useTranslation } from '../../../hooks/use-translation';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
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
              3la Floussi 🇲🇦
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Floussi t-zad men l-irada bach n-qaddo l-tariqa d l-enveloppes l-3alamiya l-khassiyat d l-Mgharba.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              F l-Maghrib, masrouf kounchi b l-cash (79% d l-mu\'amalat) o fiha t-tadamoun dyal l-Aila o d-daret (tontine) bin l-asdiqa.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              L-hadaf dyalna houwa n-3tiw l koul mghribi s-swaret d l-tكنولوجيا bach i-tbe3 flousso dyal l-jib d l-cash koul nhar, o i-gadd l-mizaniya d Ramadan, l-Aid d-Dha, o l-madrassa bla d-dyoun.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
              À propos de Floussi 🇲🇦
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Floussi est né de la volonté d'adapter la méthode universelle et éprouvée des enveloppes budgétaires aux particularités uniques du marché marocain.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Au Maroc, la gestion financière est fortement ancrée dans le cash (79% des transactions) et repose sur de magnifiques mécanismes de solidarité communautaire, tels que la tontine traditionnelle amicale "Daret".
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Notre mission est de donner à chaque citoyen marocain les outils technologiques modernes pour suivre ses dépenses d'espèces quotidiennes, anticiper les grandes échéances familiales et religieuses (Ramadan, Aïd al-Adha), et faire prospérer son épargne en toute sérénité.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

