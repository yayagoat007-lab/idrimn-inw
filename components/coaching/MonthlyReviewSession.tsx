import React, { useState } from 'react';
import { MonthlyReview } from '../../lib/monthly-review';
import { SidiAvatar } from '../sidi/SidiAvatar';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Award, 
  PieChart, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Target,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Bookmark
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface MonthlyReviewSessionProps {
  review: MonthlyReview;
  onClose: () => void;
  onSubmitFeedback: (choice: string) => void;
  language: 'fr' | 'darija';
}

export function MonthlyReviewSession({ 
  review, 
  onClose, 
  onSubmitFeedback,
  language 
}: MonthlyReviewSessionProps) {
  const isDarija = language === 'darija';
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(review.feedbackResponse || null);

  const steps = [
    { id: 'opening', title: isDarija ? "Merhba d l-Bilaan" : "Bienvenue dans votre Bilan" },
    { id: 'moneyFlow', title: isDarija ? "Siyer d l-Flouss" : "Flux Financiers" },
    { id: 'goals', title: isDarija ? "L-Ahdaf dyalk" : "Vos Objectifs" },
    { id: 'score', title: isDarija ? "Skour Floussi" : "Score Floussi" },
    { id: 'lookAhead', title: isDarija ? "Siyer l-Majya" : "Anticipation & Plan" }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSelectPriority = (priority: string) => {
    setSelectedPriority(priority);
    onSubmitFeedback(priority);
    // Move to completion state / close after brief delay
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // Determine Sidi's avatar mood based on chapter and performance
  const getSidiMood = (): 'neutral' | 'happy' | 'worried' => {
    if (currentStep === 0) {
      return review.moneyFlowChapter.savingsRate >= 15 ? 'happy' : 'neutral';
    }
    if (currentStep === 1) {
      return review.moneyFlowChapter.savingsRate >= 10 ? 'happy' : 'worried';
    }
    if (currentStep === 3) {
      return review.scoreChapter.scoreDiff >= 0 ? 'happy' : 'neutral';
    }
    return 'neutral';
  };

  const priorityOptions = isDarija ? [
    "Nقص men masrouf d d-Zna / Café",
    "N-bda n-wffer l Sandoq d l-Dhab",
    "N-bteb kulshi f sandoq l-mizaniya d l-makla",
    "Ndkhul f Daret / Jmâa jidda",
    "Blinder l-fonds d'urgence / Sandoq El-Aman"
  ] : [
    "Réduire les dépenses Restos & Cafés",
    "Épargner activement pour l'Or ou l'Omra",
    "Mieux respecter le budget Alimentation",
    "Rejoindre une nouvelle tontine (Daret)",
    "Renforcer mon fonds d'urgence (Sandoq El-Aman)"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] min-h-[500px]">
        
        {/* Left column: Conversational Sidi Floussi Bubble Panel */}
        <div className="w-full md:w-[42%] bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-amber-100/60 shrink-0">
          
          {/* Top Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-black text-amber-900/80 tracking-wide uppercase">
                {review.monthName}
              </span>
            </div>
            <span className="text-[10px] font-black tracking-widest bg-amber-200/50 text-amber-800 px-2.5 py-1 rounded-full uppercase">
              {steps[currentStep].title}
            </span>
          </div>

          {/* Conversation Bubble */}
          <div className="my-6 space-y-4 flex-grow flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <SidiAvatar mood={getSidiMood()} size={54} />
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">Sidi Floussi</h4>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                  {isDarija ? "Mouchawer l-Mali" : "Conseiller Financier de Poche"}
                </p>
              </div>
            </div>

            <div className="bg-white border border-amber-200/40 rounded-2xl p-5 shadow-sm relative after:content-[''] after:absolute after:top-5 after:left-[-6px] after:w-3 after:h-3 after:bg-white after:rotate-45 after:border-l after:border-b after:border-amber-200/40 hidden md:block">
              <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line">
                {currentStep === 0 && review.openingMessage}
                {currentStep === 1 && review.moneyFlowChapter.text}
                {currentStep === 2 && review.goalsChapter.text}
                {currentStep === 3 && review.scoreChapter.text}
                {currentStep === 4 && review.lookAheadChapter.text}
              </p>
            </div>
          </div>

          {/* Steps Indicator Dots */}
          <div className="flex items-center justify-between border-t border-amber-100 pt-4">
            <div className="flex gap-1.5">
              {steps.map((s, idx) => (
                <div 
                  key={s.id} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-6 bg-slate-900' : 'w-1.5 bg-amber-200'
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={onClose}
              className="text-xs text-amber-800/60 hover:text-amber-900 font-black tracking-wide uppercase cursor-pointer"
            >
              {isDarija ? "Khrej" : "Quitter"}
            </button>
          </div>
        </div>

        {/* Right column: Interactive dashboard showing metrics/charts */}
        <div className="flex-grow p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-slate-50/50">
          
          {/* Conversational Text displayed directly on Mobile ONLY */}
          <div className="block md:hidden bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
            <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line">
              {currentStep === 0 && review.openingMessage}
              {currentStep === 1 && review.moneyFlowChapter.text}
              {currentStep === 2 && review.goalsChapter.text}
              {currentStep === 3 && review.scoreChapter.text}
              {currentStep === 4 && review.lookAheadChapter.text}
            </p>
          </div>

          {/* Chapter Content Renderers */}
          <div className="flex-grow flex flex-col justify-center">
            
            {/* 1. Opening Chapter Graphics */}
            {currentStep === 0 && (
              <div className="space-y-6 text-center max-w-md mx-auto py-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 mx-auto border border-amber-100/50">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">
                    {isDarija ? "Bilaan d Chhar l-Kamel" : "Bilan Complet du Mois"}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">
                    {isDarija ? "Ji7at o masrouf dyal chhar l-fat kmlat." : "Votre activité financière agrégée et analysée pas à pas."}
                  </p>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {isDarija ? "Nisba d l-Yddikhar" : "Taux d'Épargne Mensuel"}
                    </span>
                    <span className="text-3xl font-black text-emerald-600 mt-1 block">
                      {review.moneyFlowChapter.savingsRate}%
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-sm">
                    {review.moneyFlowChapter.savingsRate >= 15 ? '👍' : '📝'}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Money Flow Chapter Details */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Income</span>
                    <span className="text-sm font-black text-slate-800 block mt-1">
                      {formatCurrency(review.moneyFlowChapter.totalIncome)}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Expenses</span>
                    <span className="text-sm font-black text-red-600 block mt-1">
                      {formatCurrency(review.moneyFlowChapter.totalSpent)}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Savings</span>
                    <span className="text-sm font-black text-emerald-600 block mt-1">
                      {formatCurrency(review.moneyFlowChapter.totalSaved)}
                    </span>
                  </div>
                </div>

                {/* Categories Horizontal Bars representation (Mathematical layout spacing) */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                    {isDarija ? "Qessmat l-Masrouf" : "Répartition Principale des Dépenses"}
                  </h4>
                  
                  {review.moneyFlowChapter.categoriesBreakdown.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center font-bold">Aucune dépense enregistrée.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {review.moneyFlowChapter.categoriesBreakdown.slice(0, 4).map((c, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span className="capitalize">{c.category}</span>
                            <span>{formatCurrency(c.amount)} ({c.percentage}%)</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-slate-800 rounded-full transition-all duration-500" 
                              style={{ width: `${c.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Goals Progress Display */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-500" />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                      {isDarija ? "Taqaddom d l-Ahdaaf" : "Avancement de vos Objectifs"}
                    </h4>
                  </div>

                  {review.goalsChapter.goals.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                      {isDarija ? "Makan hta chi hadaf mfetouh." : "Aucun sandoq d'objectif actif pour le moment."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {review.goalsChapter.goals.map((g, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-black text-slate-800 block truncate">{g.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                              {formatCurrency(g.current)} / {formatCurrency(g.target)}
                            </span>
                          </div>
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-[10px] font-black text-emerald-600">
                              <span>Progression</span>
                              <span>{g.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-white border border-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, g.progress)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Score Chapter Metrics */}
            {currentStep === 3 && (
              <div className="space-y-5 text-center max-w-sm mx-auto animate-fadeIn">
                <div className="relative inline-flex items-center justify-center p-6 bg-slate-50 rounded-full border border-slate-100/85">
                  <div className="text-4xl">🏆</div>
                  <div className="absolute -top-1 -right-1 bg-emerald-500 text-white font-black text-xs px-2.5 py-1 rounded-full border-2 border-white shadow-sm">
                    {review.scoreChapter.scoreDiff >= 0 ? `+${review.scoreChapter.scoreDiff}` : `${review.scoreChapter.scoreDiff}`} PTS
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-slate-800">
                    {review.scoreChapter.endScore} PTS
                  </h3>
                  <div className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                    {review.scoreChapter.tier}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {isDarija 
                      ? `Bditii Chhar b ${review.scoreChapter.startScore} PTS` 
                      : `Vous avez commencé le mois avec ${review.scoreChapter.startScore} PTS`}
                  </p>
                </div>
              </div>
            )}

            {/* 5. Look Ahead Priority Choice */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-4 flex gap-3">
                  <Lightbulb className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-black text-indigo-800 uppercase tracking-wide">
                      {isDarija ? "Khitam d Sidi Floussi" : "Résolution de Sidi Floussi"}
                    </h4>
                    <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                      {isDarija 
                        ? "Chnahia l-haja l-wahda li bghiti t-rekkaz 3liha l-chhar l-majya bach n-re3o l-baraka f s-sandoq dyalk?"
                        : "Quelle est la priorité unique que vous souhaitez fixer pour le mois prochain afin de maximiser vos économies ?"}
                    </p>
                  </div>
                </div>

                {selectedPriority ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center text-xs font-black text-emerald-800 animate-pulse">
                    🎉 {isDarija ? `Sjjelt had l-hadaf: "${selectedPriority}"` : `Priorité enregistrée : "${selectedPriority}" !`}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {priorityOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectPriority(opt)}
                        className="w-full text-left bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl p-3.5 text-xs font-bold text-slate-700 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                      >
                        <span className="group-hover:text-slate-900 transition-colors">{opt}</span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-4 py-2 text-xs font-extrabold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 flex items-center gap-1 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isDarija ? "Rje3" : "Précédent"}</span>
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 text-xs font-black tracking-wide flex items-center gap-1 transition-all cursor-pointer shadow-md"
              >
                <span>{isDarija ? "Zid" : "Suivant"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="h-10 w-24"></div> // Placeholder to maintain spacing
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
