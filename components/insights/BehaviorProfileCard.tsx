import React from 'react';
import { useBehaviorProfile } from '../../hooks/use-behavior-profile';
import { getAdviceForProfile } from '../../lib/behavior-clustering';
import { Sparkles, Coins, HelpCircle, Activity, ShoppingCart, Calendar, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface BehaviorProfileCardProps {
  lang: 'fr' | 'darija';
}

export function BehaviorProfileCard({ lang }: BehaviorProfileCardProps) {
  const { metrics, currentProfileId, currentProfileDetails, history, loading } = useBehaviorProfile();

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-slate-500">Chargement de votre profil d'épargnant...</p>
      </div>
    );
  }

  // Formatting metrics for user friendly display
  const savingsRatePct = Math.round(metrics.savingsRate * 100);
  const txsCount = Math.round(metrics.frequencyPerDay * 30);
  const isDeficit = metrics.savingsRate < 0;

  // Map profile ids to colors
  const profileColors: Record<string, { bg: string; text: string; border: string; accent: string }> = {
    epargnant_discipline: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', accent: 'text-amber-600' },
    depensier_occasionnel: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', accent: 'text-emerald-600' },
    impulsif_chronique: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', accent: 'text-rose-600' },
    famille_nombreuse: { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200', accent: 'text-violet-600' }
  };

  const colors = profileColors[currentProfileId] || profileColors.depensier_occasionnel;

  return (
    <div className="space-y-6">
      {/* 1. Main Profile Badge Banner */}
      <div className={`border ${colors.border} ${colors.bg} rounded-2xl p-6 shadow-sm relative overflow-hidden`}>
        <div className="absolute right-4 top-4 opacity-10">
          <Sparkles className="w-24 h-24 text-slate-900" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
              {lang === 'darija' ? currentProfileDetails.nameDarija : currentProfileDetails.nameFr}
            </span>
            <span className="text-[10px] bg-slate-900 text-slate-100 px-2.5 py-0.5 rounded-full font-bold">
              Profil d'Habitude Floussi
            </span>
          </div>

          <p className="text-sm font-black text-slate-800">
            {lang === 'darija' ? "Analyse d'habitudes d'argent" : "Votre Portrait de Dépensier"}
          </p>

          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-2xl">
            {lang === 'darija' ? currentProfileDetails.descriptionDarija : currentProfileDetails.descriptionFr}
          </p>
        </div>
      </div>

      {/* 2. Metrics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Taux d'épargne */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Taux d'Épargne</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className={`text-xl font-mono font-black ${isDeficit ? 'text-rose-600' : 'text-slate-800'}`}>
              {savingsRatePct}%
            </span>
            <span className="text-[8px] text-slate-400 block font-medium">Revenu restant après dépenses</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${isDeficit ? 'bg-rose-500' : 'bg-emerald-500'}`} 
              style={{ width: `${Math.max(0, Math.min(100, isDeficit ? -savingsRatePct : savingsRatePct))}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Fréquence transactions */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Fréquence</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <span className="text-xl font-mono font-black text-slate-800">
              {metrics.frequencyPerDay} <span className="text-[11px] font-sans font-bold text-slate-400">/ jour</span>
            </span>
            <span className="text-[8px] text-slate-400 block font-medium">~{txsCount} transactions / mois</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full" 
              style={{ width: `${Math.max(10, Math.min(100, metrics.frequencyPerDay * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Volatilité des dépenses */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Volatilité</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <span className="text-xl font-mono font-black text-slate-800">
              {Math.round(metrics.expenseStdDev)} <span className="text-[11px] font-sans font-bold text-slate-400">DH</span>
            </span>
            <span className="text-[8px] text-slate-400 block font-medium">Écart-type moyen de vos dépenses</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full" 
              style={{ width: `${Math.max(10, Math.min(100, (metrics.expenseStdDev / 1500) * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Ratio Weekend / Semaine */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Rapport Weekend</span>
            <ShoppingCart className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <span className="text-xl font-mono font-black text-slate-800">
              {Math.round(metrics.weekendRatio * 100)}%
            </span>
            <span className="text-[8px] text-slate-400 block font-medium">Dépenses Weekend vs Semaine</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-violet-500 h-full rounded-full" 
              style={{ width: `${Math.max(10, Math.min(100, metrics.weekendRatio * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. History Timeline & Evolutionary tracker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <h4 className="text-xs font-black text-slate-800">Évolution de votre profil comportemental</h4>
        </div>

        <div className="flex items-center flex-wrap gap-2 py-2">
          {history.map((hist, index) => {
            const details = getAdviceForProfile(hist.profileId);
            const isLast = index === history.length - 1;
            const itemColors = profileColors[hist.profileId] || profileColors.depensier_occasionnel;
            
            // Format month nicely
            const [y, m] = hist.month.split('-');
            const monthNames = ["Janv.", "Févr.", "Mars", "Avril", "Mai", "Juin", "Juill.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];
            const readableMonth = `${monthNames[parseInt(m, 10) - 1]} ${y}`;

            return (
              <React.Fragment key={hist.month}>
                <div className={`flex items-center gap-2 border ${itemColors.border} ${itemColors.bg} rounded-xl px-3 py-2 ${isLast ? 'ring-2 ring-emerald-400' : ''}`}>
                  <span className="text-[10px] font-bold text-slate-500">{readableMonth}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className={`text-xs font-black ${itemColors.text}`}>
                    {lang === 'darija' ? details.nameDarija : details.nameFr}
                  </span>
                </div>
                {!isLast && <ArrowRight className="w-4 h-4 text-slate-300" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 4. Personalized Advice list */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Conseils d'arbitrage de Sidi Floussi</h4>
            <p className="text-[9px] text-slate-400 font-semibold">Conseils sur-mesure pour redonner de la baraka à votre portefeuille.</p>
          </div>
        </div>

        <ul className="space-y-3">
          {(lang === 'darija' ? currentProfileDetails.adviceDarija : currentProfileDetails.adviceFr).map((tip, idx) => (
            <motion.li 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl hover:bg-slate-800/80 transition-colors"
            >
              <div className="p-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-lg mt-0.5 shrink-0">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-medium text-slate-200 leading-relaxed">{tip}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
