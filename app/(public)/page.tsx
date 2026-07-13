"use client";

import { Sparkles, Layers, ShieldCheck, Heart, PiggyBank, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '../../lib/constants';

interface LandingPageProps {
  onEnterApp: () => void;
  onNavigatePricing: () => void;
}

export default function LandingPage({ onEnterApp, onNavigatePricing }: LandingPageProps) {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between">
      
      {/* Navbar header */}
      <header className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/10">
            F
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 block leading-none">
              Floussi
            </span>
            <span className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase">
              Mon Argent 🇲🇦
            </span>
          </div>
        </div>

        <button 
          onClick={onEnterApp}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Ouvrir Floussi
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-6 py-16 md:py-24 text-center max-w-4xl mx-auto space-y-6">
          <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
            Le clone marocain de BucketBudgetApp 🇲🇦
          </span>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-none">
            Maîtrisez votre <span className="text-emerald-600">Budget</span> et épargnez solidairement
          </h1>
          
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Floussi est la première application d'enveloppes budgétaires adaptée au marché marocain. Suivez vos dépenses en cash, planifiez le Ramadan et participez à des tontines numériques (Daret).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/15 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Accéder à l'application</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onNavigatePricing}
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-bold text-sm transition-all"
            >
              Découvrir les offres
            </button>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="bg-white border-y border-gray-100 py-16 px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Fonctionnalités conçues pour le Maroc
              </h2>
              <p className="text-xs text-gray-500">Un outil adapté aux réalités locales et aux traditions familiales.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
                <div className="bg-emerald-100 text-emerald-800 w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                  💸
                </div>
                <h4 className="font-extrabold text-sm text-gray-900">
                  Suivi Cash First (Flous l'jib)
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Le cash représente 79% des transactions au Maroc. Tracez vos espèces simplement avec des catégories adaptées au souq et aux commerces de proximité.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
                <div className="bg-purple-100 text-purple-800 w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                  🤝
                </div>
                <h4 className="font-extrabold text-sm text-gray-900">
                  Daret (Tontine Numérique)
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Planifiez et suivez vos tontines de confiance directement dans l'application. Gérez l'ordre de passage, les cotisations mensuelles et le versement du pot.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
                <div className="bg-amber-100 text-amber-800 w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                  🕌
                </div>
                <h4 className="font-extrabold text-sm text-gray-900">
                  Événements Religieux (Ahdaf)
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Préparez sereinement les dépenses du Ramadan, de l'Aïd al-Adha (achat du mouton) et des vacances d'été grâce à nos compartiments d'épargne dédiés.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-8 px-6 text-xs border-t border-slate-800 space-y-2">
        <p className="font-semibold text-slate-300">Floussi — Fabriqué avec fierté au Maroc 🇲🇦</p>
        <p>© 2026 Floussi. Tous droits réservés. Clone adapté de BucketBudgetApp.</p>
      </footer>

    </div>
  );
}
