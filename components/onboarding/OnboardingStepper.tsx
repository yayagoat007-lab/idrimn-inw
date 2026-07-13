import React from 'react';
import { Check } from 'lucide-react';
import { Language } from '../../lib/i18n';

interface OnboardingStepperProps {
  currentStep: number;
  language: Language;
}

export function OnboardingStepper({ currentStep, language }: OnboardingStepperProps) {
  const stepsFr = [
    { title: 'Langue', desc: 'Choix' },
    { title: 'Profil', desc: 'Identité' },
    { title: 'Revenus', desc: 'Budget' },
    { title: 'Enveloppes', desc: 'Répartition' }
  ];

  const stepsDarija = [
    { title: 'اللوغة', desc: 'اللغة' },
    { title: 'الحساب', desc: 'المعلومات' },
    { title: 'الخلصة', desc: 'الميزانية' },
    { title: 'الظروفة', desc: 'التفريق' }
  ];

  const steps = language === 'darija' ? stepsDarija : stepsFr;

  return (
    <div className="w-full py-4 px-2 font-sans select-none">
      <div className="flex items-center justify-between relative max-w-xl mx-auto">
        {/* Horizontal background connector line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        {/* Active connector fill */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500 ease-out" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((s, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <div key={index} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/15' 
                    : isActive 
                    ? 'bg-white border-2 border-emerald-600 text-emerald-600 shadow-md ring-4 ring-emerald-50' 
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? <Check size={14} className="stroke-[3]" /> : stepNumber}
              </div>
              <span className={`text-[9px] font-black mt-1.5 transition-colors duration-300 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default OnboardingStepper;
