import React from 'react';
import { OptimizationSuggestion } from '../../lib/optimization-suggestions';
import { SidiAvatar } from '../sidi/SidiAvatar';
import { 
  X, 
  Target, 
  TrendingDown, 
  Award, 
  Sparkles, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface ChallengeAcceptModalProps {
  suggestion: OptimizationSuggestion;
  onClose: () => void;
  onAccept: (suggestion: OptimizationSuggestion) => void;
  language: 'fr' | 'darija';
}

export function ChallengeAcceptModal({
  suggestion,
  onClose,
  onAccept,
  language
}: ChallengeAcceptModalProps) {
  const isDarija = language === 'darija';

  // Compute mock-accurate visual projection
  const potentialSaving = suggestion.potentialSaving;
  const computedBaseline = Math.round(potentialSaving / 0.35); // 35% reduction typical
  const computedTarget = Math.max(50, computedBaseline - potentialSaving);

  const xpReward = Math.round((computedBaseline - computedTarget) * 0.5) + 100;

  const handleAcceptClick = () => {
    onAccept(suggestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative border border-slate-100 animate-scaleUp">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 p-6 flex items-center gap-4 border-b border-amber-100/30">
          <SidiAvatar mood="happy" size={54} />
          <div>
            <h4 className="font-extrabold text-sm text-slate-800">Sidi Floussi</h4>
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
              {isDarija ? "Tahaddi d l-mizaniya jdid!" : "Nouveau Défi Budgétaire !"}
            </p>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800 leading-snug">
              {suggestion.title}
            </h3>
            <p className="text-xs text-slate-400 font-bold">
              {isDarija ? "Khir o Baraka f triq d l-yddikhar" : "Activez l'analyse avant/après sur 30 jours"}
            </p>
          </div>

          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            {suggestion.description}
          </p>

          {/* Mathematical breakdown banner */}
          <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-4 space-y-3.5">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
              {isDarija ? "Hsabiya d l-Tahaddi" : "Paramètres du Défi (30 Jours)"}
            </h4>

            <div className="flex items-center justify-between gap-4">
              {/* Baseline */}
              <div className="text-center flex-grow bg-white border border-slate-100 rounded-xl p-2.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isDarija ? "Daba kat-khrej" : "Aujourd'hui"}
                </span>
                <span className="text-xs font-black text-slate-800 block mt-0.5">
                  {formatCurrency(computedBaseline)} / chhar
                </span>
              </div>

              <div className="text-slate-300">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Target */}
              <div className="text-center flex-grow bg-indigo-50 border border-indigo-100/40 rounded-xl p-2.5">
                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block">
                  {isDarija ? "L-Hadaf d l-Chhar" : "Objectif de Limite"}
                </span>
                <span className="text-xs font-black text-indigo-800 block mt-0.5">
                  {formatCurrency(computedTarget)} / chhar
                </span>
              </div>
            </div>

            {/* Projection potential */}
            <div className="bg-emerald-50 border border-emerald-100/50 rounded-xl p-3 flex justify-between items-center text-xs text-emerald-800 font-black">
              <span>{isDarija ? "Baraka d l-chhar d l'yddikhar" : "Économie Net Projetée"}</span>
              <span className="text-emerald-600">+{formatCurrency(potentialSaving)} DH</span>
            </div>
          </div>

          {/* XP & Rewards */}
          <div className="flex items-center justify-between border-t border-slate-50 pt-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{isDarija ? "Modda d 30 Yawm" : "Durée de 30 Jours"}</span>
            </div>

            <div className="flex items-center gap-1.5 text-indigo-600 font-black text-xs">
              <Award className="w-4 h-4 text-indigo-500 animate-bounce" />
              <span>+{xpReward} XP récompense</span>
            </div>
          </div>
        </div>

        {/* Buttons Action */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-grow bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer text-center"
          >
            {isDarija ? "Machi daba" : "Peut-être plus tard"}
          </button>
          <button
            onClick={handleAcceptClick}
            className="flex-grow bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-black tracking-wide transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{isDarija ? "N-9bel l-Tahaddi !" : "Accepter le Défi !"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
