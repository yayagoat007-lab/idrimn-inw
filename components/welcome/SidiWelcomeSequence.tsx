import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SidiAvatar } from '../sidi/SidiAvatar';
import { Language } from '../../lib/i18n';
import { ArrowRight, Sparkles, Languages } from 'lucide-react';

interface SidiWelcomeSequenceProps {
  fullName?: string;
  initialLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onComplete: () => void;
}

export function SidiWelcomeSequence({
  fullName,
  initialLanguage,
  onLanguageChange,
  onComplete,
}: SidiWelcomeSequenceProps) {
  const [step, setStep] = useState<number>(1);
  const [lang, setLang] = useState<Language>(initialLanguage);

  const nameToUse = fullName ? fullName.split(' ')[0] : '';

  const handleLangToggle = (selectedLang: Language) => {
    setLang(selectedLang);
    onLanguageChange(selectedLang);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  // Auto transition for step 1 and 2 after 4.5 seconds unless user manually interacts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < 3) {
        setStep(prev => prev + 1);
      }
    }, 5500);
    return () => clearTimeout(timer);
  }, [step]);

  // Content for each step in both languages
  const content = {
    fr: {
      step1: {
        title: nameToUse ? `Mar7ba bik, ${nameToUse} !` : "Mar7ba bik !",
        text: "Moi, c'est Sidi Floussi, ton conseiller de poche. Bienvenue dans la famille ! Je suis ravi de t'aider à veiller sur ta baraka et tes enveloppes de cash.",
        bubble: "Salam oualikoum ! Content de faire ta connaissance ! 😊"
      },
      step2: {
        title: "Simple et efficace",
        text: "On va configurer ton budget ensemble, ça prend 2 minutes montre en main. Pas de jargon bancaire bizarre, juste de la simplicité et de la sagesse !",
        bubble: "⏱️ 2 minutes montre en main, promis juré !"
      },
      step3: {
        title: "Prêt à commencer ?",
        text: "Ensemble, on va dompter tes dépenses et faire grandir tes économies pour tes projets (Achat d'or, Omra, Aïd...). C'est parti ?",
        bubble: "Yallah, on commence l'aventure ? 🚀",
        button: "C'est parti !"
      },
      skip: "Passer l'introduction",
      next: "Suivant"
    },
    darija: {
      step1: {
        title: nameToUse ? `Mar7ba bik, a ${nameToUse} !` : "Mar7ba bik !",
        text: "Ana Sidi Floussi, l-mouchawir dyalek. Mar7ba bik f'l-aïla d'Floussi ! Far7an bzaff n-3awnek tthella f l-baraka o tsseter s-sanadiq dyalek.",
        bubble: "Salam oualikoum ! Far7an b chouftkoum ! 😊"
      },
      step2: {
        title: "Sahla o mofida",
        text: "Ghadin nqaddou l-budget dyalek b-zouj, f-zouj dqaïq d l-waqt. Bla klam s3ib, ghir l-basata o l-fayda dyalna !",
        bubble: "⏱️ Jouj dqaïq, dghya dghya !"
      },
      step3: {
        title: "Wajed bach nbdaw ?",
        text: "M3aya ghadi t-tsseter s-sanadiq dyalek o tkhbi l-flouss dyal l-mouchari3 (Iddikhar d l-dhab, l-Omra, l-Aïd...). Ndowzo l-ma3qoul ?",
        bubble: "Yallah, bismillah nbdaw ? 🚀",
        button: "Yallah, nbdaw !"
      },
      skip: "Nqqez l-bdya",
      next: "Zid"
    }
  };

  const activeContent = content[lang];

  // Map step to Sidi mood
  const getSidiMood = (): 'happy' | 'neutral' | 'worried' => {
    if (step === 1) return 'happy';
    if (step === 2) return 'neutral';
    return 'happy';
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* Language Switcher */}
      <div className="flex justify-between items-center mb-6 z-10">
        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
          <Languages size={14} className="text-emerald-600" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Langue / Lougha</span>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-extrabold border border-slate-200">
          <button
            onClick={() => handleLangToggle('fr')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              lang === 'fr' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => handleLangToggle('darija')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              lang === 'darija' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            دريجة
          </button>
        </div>
      </div>

      {/* Discrete Skip Button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 text-[10px] font-black uppercase text-slate-400 hover:text-emerald-600 tracking-wider transition-colors z-10 cursor-pointer border border-slate-100 bg-slate-50/50 hover:bg-slate-100 px-2.5 py-1 rounded-lg"
      >
        {activeContent.skip}
      </button>

      {/* Main Avatar Section */}
      <div className="flex flex-col items-center text-center mt-4 mb-6">
        <div className="relative">
          {/* Pulsing light rings behind Sidi */}
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl scale-125 animate-pulse" />
          <div className="absolute inset-0 bg-amber-500/5 rounded-full blur-md scale-150 animate-ping duration-1000 opacity-30" />
          
          <SidiAvatar mood={getSidiMood()} size={110} className="relative z-10" />
        </div>

        {/* Sidi Interactive Chat Bubble */}
        <motion.div
          key={`bubble-${step}-${lang}`}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-5 bg-amber-50/70 border border-amber-100 text-amber-950 px-4 py-2.5 rounded-2xl text-[11px] font-bold max-w-xs relative shadow-xs"
        >
          {step === 1 && activeContent.step1.bubble}
          {step === 2 && activeContent.step2.bubble}
          {step === 3 && activeContent.step3.bubble}
          
          {/* Little bubble triangle arrow */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-50/70 border-t border-l border-amber-100 rotate-45" />
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center min-h-[140px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${step}-${lang}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-3.5 text-center"
          >
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5 leading-none">
              {step === 3 && <Sparkles size={18} className="text-amber-500 animate-pulse" />}
              <span>
                {step === 1 && activeContent.step1.title}
                {step === 2 && activeContent.step2.title}
                {step === 3 && activeContent.step3.title}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
              {step === 1 && activeContent.step1.text}
              {step === 2 && activeContent.step2.text}
              {step === 3 && activeContent.step3.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stepper Dots & Navigation Footer */}
      <div className="mt-8 pt-4 border-t border-slate-50 flex justify-between items-center">
        {/* Step dots */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i ? 'w-6 bg-emerald-600' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={lang === 'darija' ? `Doz l-marhala ${i}` : `Aller à l'étape ${i}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
            step === 3
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 active:scale-95'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <span>{step === 3 ? activeContent.step3.button : activeContent.next}</span>
          <ArrowRight size={14} className={step === 3 ? 'animate-bounce-horizontal' : ''} />
        </button>
      </div>
    </div>
  );
}
