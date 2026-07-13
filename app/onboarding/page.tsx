"use client";

import React, { useState } from 'react';
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper';
import { Step1Language } from '../../components/onboarding/Step1Language';
import { Step2Account } from '../../components/onboarding/Step2Account';
import { Step3Income } from '../../components/onboarding/Step3Income';
import { Step4Buckets } from '../../components/onboarding/Step4Buckets';
import { useOnboardingStep, useCompleteOnboarding, useSkipOnboarding } from '../../hooks/use-onboarding';
import { useAuth } from '../../hooks/use-auth';
import { Language } from '../../lib/i18n';
import { Sparkles, HelpCircle } from 'lucide-react';

interface OnboardingPageProps {
  onComplete: () => void;
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { profile } = useAuth();
  const { step, setStep, nextStep, prevStep } = useOnboardingStep();
  const { mutateAsync: completeOnboarding, isLoading: completing } = useCompleteOnboarding();
  const { mutateAsync: skipOnboarding, isLoading: skipping } = useSkipOnboarding();

  // Central state for collecting onboarding data
  const [language, setLanguage] = useState<Language>((profile?.preferred_language as Language) || 'fr');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [incomeAmount, setIncomeAmount] = useState(8000);
  const [incomeSource, setIncomeSource] = useState('salaire');
  const [payDay, setPayDay] = useState(25);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const handleFinish = async (bucketAllocations: any) => {
    try {
      // 1. Submit Profile fields to backend
      await completeOnboarding({
        fullName,
        phone,
        city,
        language,
        incomeAmount,
        incomeSource,
        payDay
      });

      // 2. Also simulate writing the initial buckets to localStorage or offline DB
      localStorage.setItem('floussi_initial_buckets', JSON.stringify(bucketAllocations));
      
      // 3. Callback redirect
      onComplete();
    } catch (err) {
      console.error('[Onboarding Finish] Error:', err);
    }
  };

  const handleSkip = async () => {
    try {
      await skipOnboarding();
      onComplete();
    } catch (err) {
      console.error('[Onboarding Skip] Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative Traditional Moroccan pattern backgrounds */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 text-white w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-lg shadow-md">
              F
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Floussi<span className="text-emerald-600">.</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            disabled={completing || skipping}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            Passer l'étape
          </button>
        </div>

        {/* Stepper progress */}
        <div className="bg-white rounded-2xl border border-slate-100 p-2 shadow-xs mb-4">
          <OnboardingStepper currentStep={step} language={language} />
        </div>

        {/* Main Content card */}
        <div className="bg-white py-6 px-5 sm:py-8 sm:px-6 shadow-xl shadow-slate-100/85 rounded-3xl border border-slate-100 relative">
          {step === 1 && (
            <Step1Language
              selectedLanguage={language}
              onSelectLanguage={handleSelectLanguage}
              onNext={nextStep}
            />
          )}

          {step === 2 && (
            <Step2Account
              fullName={fullName}
              setFullName={setFullName}
              phone={phone}
              setPhone={setPhone}
              city={city}
              setCity={setCity}
              language={language}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {step === 3 && (
            <Step3Income
              incomeAmount={incomeAmount}
              setIncomeAmount={setIncomeAmount}
              incomeSource={incomeSource}
              setIncomeSource={setIncomeSource}
              payDay={payDay}
              setPayDay={setPayDay}
              language={language}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {step === 4 && (
            <Step4Buckets
              incomeAmount={incomeAmount}
              language={language}
              onPrev={prevStep}
              onFinish={handleFinish}
              submitting={completing || skipping}
            />
          )}
        </div>
        
        <div className="mt-8 text-center text-[10px] text-slate-400 font-medium">
          Vos données budgétaires Floussi sont cryptées en local (IndexedDB) et synchronisées de manière sécurisée hors-ligne.
        </div>
      </div>
    </div>
  );
}
