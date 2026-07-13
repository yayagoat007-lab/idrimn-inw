"use client";

import React from 'react';
import { ArrowRight, Star, ShieldCheck } from 'lucide-react';
import HeroAnimation from '../../components/landing/HeroAnimation';
import StatsCounter from '../../components/landing/StatsCounter';
import FeatureBento from '../../components/landing/FeatureBento';
import TestimonialCard from '../../components/landing/TestimonialCard';
import FAQAccordion from '../../components/landing/FAQAccordion';
import StepCard from '../../components/landing/StepCard';

interface LandingPageProps {
  onEnterApp: () => void;
  onNavigatePricing: () => void;
}

const TESTIMONIALS_DATA = [
  { name: 'Khadija El Mansouri', city: 'Casablanca', text: 'Grâce aux enveloppes Floussi, j\'ai enfin pu économiser pour le mouton de l\'Aïd Al Adha sans me retrouver à découvert à la fin du mois. Une bénédiction !', avatarUrl: '', planName: 'Premium' },
  { name: 'Amine Bennani', city: 'Fès', text: 'La Jmâa Digitale nous permet de suivre notre tontine amicale sans disputes de cahier. Tout le monde voit qui a payé et qui est le prochain sur la liste.', avatarUrl: '', planName: 'Famille' },
  { name: 'Youssef Alami', city: 'Marrakech', text: 'Je gère mon commerce 100% en cash. Le scan OCR des tickets BIM et le suivi hors-ligne sur l\'appli Floussi me font gagner un temps fou chaque soir.', avatarUrl: '', planName: 'Analyse' }
];

export default function LandingPage({ onEnterApp, onNavigatePricing }: LandingPageProps) {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between font-sans antialiased text-slate-800">
      
      {/* Navbar header */}
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-600 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/10">
            F
          </div>
          <div>
            <span className="font-black text-sm tracking-tight text-slate-900 block leading-none">
              Floussi
            </span>
            <span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase mt-0.5 block">
              Mon Argent 🇲🇦
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onNavigatePricing}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
          >
            Tarifs
          </button>
          <button 
            onClick={onEnterApp}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs"
          >
            Ouvrir Floussi
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 space-y-24 pb-20">
        <section className="px-6 pt-16 md:pt-24 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              L'enveloppe budgétaire réinventée pour le Maroc 🇲🇦
            </span>
            
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">
              Maîtrisez votre <span className="text-emerald-600">Masrouf</span> & Épargnez ensemble
            </h1>
            
            <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
              Floussi est la première application d'enveloppes budgétaires adaptée au marché marocain. Suivez vos dépenses en cash, planifiez le Ramadan, gérez vos budgets familiaux et pilotez vos tontines (Daret) en toute transparence.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group"
              >
                <span>S'enregistrer gratuitement</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onNavigatePricing}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
              >
                Voir les abonnements
              </button>
            </div>
          </div>

          <div>
            <HeroAnimation />
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 bg-slate-100/40 py-12 border-y border-slate-100">
          <StatsCounter />
        </section>

        {/* How It Works (Steps) */}
        <section className="px-6 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Simplicité</span>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Comment fonctionne la méthode Floussi ?</h2>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Reprenez le contrôle de vos finances en 3 étapes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StepCard
              number="01"
              emoji="📂"
              title="Créez vos Seaux"
              description="Séparez vos rentrées d'argent dans des enveloppes (Loyer, Viande, École, Épargne Aïd)."
              colorClass="text-emerald-500"
            />
            <StepCard
              number="02"
              emoji="📸"
              title="Saisissez en Cash ou OCR"
              description="Entrez vos dépenses au jour le jour en cash, ou scannez vos tickets de caisse Marjane/BIM avec l'IA."
              colorClass="text-blue-500"
            />
            <StepCard
              number="03"
              emoji="🏆"
              title="Épargnez & Débloquez"
              description="Obtenez des badges, gagnez de l'XP de sagesse financière, et réalisez vos projets familiaux sans dettes."
              colorClass="text-amber-500"
            />
          </div>
        </section>

        {/* Features Bento */}
        <section className="px-6 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Fonctionnalités</span>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Pensé exclusivement pour notre quotidien</h2>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Au-delà de la banque traditionnelle, une approche humaine</p>
          </div>

          <FeatureBento />
        </section>

        {/* Testimonials */}
        <section className="px-6 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Avis d'utilisateurs</span>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ils ont adopté Floussi 💚</h2>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Témoignages vérifiés de nos clients partout au Royaume</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS_DATA.map((t, idx) => (
              <TestimonialCard
                key={idx}
                name={t.name}
                city={t.city}
                text={t.text}
                avatarUrl={t.avatarUrl}
                planName={t.planName}
              />
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="px-6 max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Des questions ?</span>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Foire aux questions</h2>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Tout ce qu'il faut savoir sur Floussi</p>
          </div>

          <FAQAccordion />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-center py-10 px-6 text-[11px] border-t border-slate-900 space-y-3 font-semibold">
        <p className="text-slate-300 font-bold uppercase tracking-widest">Floussi — Fabriqué avec fierté au Maroc 🇲🇦</p>
        <p>© 2026 Floussi. Tous droits réservés. Clone marocain de BucketBudgetApp.</p>
        <div className="flex justify-center gap-4 text-[10px] text-slate-500 uppercase tracking-wider">
          <a href="/about" className="hover:text-white transition-colors">À Propos</a>
          <span>·</span>
          <a href="/privacy" className="hover:text-white transition-colors">Vie Privée</a>
          <span>·</span>
          <a href="/terms" className="hover:text-white transition-colors">CGU</a>
        </div>
      </footer>

    </div>
  );
}
