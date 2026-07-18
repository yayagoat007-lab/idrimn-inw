import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Utensils, 
  Car, 
  GraduationCap, 
  Phone, 
  PiggyBank, 
  Heart, 
  TrendingUp, 
  Sparkles, 
  Receipt, 
  ShieldAlert, 
  Coins, 
  Plane, 
  Stethoscope, 
  Globe, 
  Users, 
  Briefcase,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { Language } from '../../lib/i18n';
import { BucketPreview } from './BucketPreview';
import { applyPersonaToOnboardingState, getPersonaTemplate } from '../../lib/persona-templates';

const IconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Home,
  Utensils,
  Car,
  GraduationCap,
  Phone,
  PiggyBank,
  Heart,
  TrendingUp,
  Sparkles,
  Receipt,
  ShieldAlert,
  Coins,
  Plane,
  Stethoscope,
  Globe,
  Users,
  Briefcase
};

interface Step4BucketsProps {
  incomeAmount: number;
  language: Language;
  personaId?: string | null;
  onPrev: () => void;
  onFinish: (bucketAllocations: any) => void;
  submitting: boolean;
}

export function Step4Buckets({
  incomeAmount,
  language,
  personaId = 'salarie',
  onPrev,
  onFinish,
  submitting
}: Step4BucketsProps) {
  const [allocations, setAllocations] = useState<any[]>([]);

  // Initialize allocations from selected persona template or fallback to salarie
  useEffect(() => {
    const activePersona = personaId || 'salarie';
    const { suggestedBuckets } = applyPersonaToOnboardingState(activePersona, incomeAmount);
    setAllocations(suggestedBuckets);
  }, [personaId, incomeAmount]);

  const totalPct = allocations.reduce((sum, b) => sum + b.percentage, 0);
  const isSumValid = totalPct === 100;

  // Map allocations to full buckets with React icons
  const buckets = allocations.map(b => {
    const IconComponent = IconMap[b.icon] || Home;
    return {
      id: b.id,
      name: language === 'darija' ? b.name.darija : b.name.fr,
      percentage: b.percentage,
      amount: Math.round((incomeAmount * b.percentage) / 100),
      color: b.color,
      icon: IconComponent,
      isEssential: b.isEssential
    };
  });

  const handlePctChange = (id: string, value: number) => {
    setAllocations(prev =>
      prev.map(b => {
        if (b.id === id) {
          return {
            ...b,
            percentage: value,
            amount: Math.round((incomeAmount * value) / 100)
          };
        }
        return b;
      })
    );
  };

  const handleResetToDefaults = () => {
    const activePersona = personaId || 'salarie';
    const { suggestedBuckets } = applyPersonaToOnboardingState(activePersona, incomeAmount);
    setAllocations(suggestedBuckets);
  };

  const handleFinish = () => {
    if (!isSumValid) return;
    onFinish(buckets);
  };

  // Get current persona info for tips
  const personaTemplate = getPersonaTemplate(personaId || 'salarie');
  const personaName = language === 'darija' ? personaTemplate.label.darija : personaTemplate.label.fr;
  const tipMessage = language === 'darija' ? personaTemplate.tipMessage.darija : personaTemplate.tipMessage.fr;

  return (
    <div className="space-y-5 font-sans">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">
          {language === 'darija' ? 'توزيع الظروفة المخصصة' : 'Vos enveloppes personnalisées'}
        </h3>
        <p className="text-xs font-semibold text-slate-400">
          {language === 'darija'
            ? `تعديل التقسيم المقترح لبروفايل ${personaName}. المجموع كخاصو يكون 100%.`
            : `Ajustez la répartition suggérée pour le profil ${personaName}. Le total doit faire 100%.`}
        </p>
      </div>

      {/* Persona Tip Box */}
      {tipMessage && (
        <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl flex gap-2.5 text-xs">
          <Lightbulb className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
          <div className="space-y-0.5">
            <span className="font-extrabold text-amber-900">
              {language === 'darija' ? 'نصيحة سيدي :' : 'Conseil de Sidi :'}
            </span>
            <p className="text-amber-800 font-semibold leading-relaxed">
              {tipMessage}
            </p>
          </div>
        </div>
      )}

      {/* Sum validation alert */}
      <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-bold transition-all ${
        isSumValid 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
          : 'bg-rose-50 border-rose-100 text-rose-800'
      }`}>
        <AlertCircle size={16} className={isSumValid ? 'text-emerald-600 flex-shrink-0' : 'text-rose-600 flex-shrink-0'} />
        <div className="flex-1">
          {isSumValid ? (
            <span>
              {language === 'darija'
                ? 'مزيان بزاف! التقسيم ديالك متوازن (100%).'
                : 'Parfait ! Votre répartition est équilibrée (100%).'}
            </span>
          ) : (
            <div className="space-y-0.5">
              <span>
                {language === 'darija'
                  ? `المجموع الحالي هو ${totalPct}%. كخاصو يكون 100% بالضبط.`
                  : `Le total actuel est de ${totalPct}%. Il doit faire exactement 100%.`}
              </span>
              <p className="text-[10px] font-medium text-rose-700">
                {language === 'darija' ? 'عدل المؤشرات أو اضغط على ' : 'Ajustez les curseurs ou cliquez sur '}
                <button type="button" onClick={handleResetToDefaults} className="underline font-bold text-rose-800">
                  {language === 'darija' ? 'إعادة التعيين' : 'Réinitialiser'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Sliders container */}
      <div className="space-y-4 bg-white p-3.5 border border-slate-100 rounded-2xl">
        {allocations.map((b) => {
          const IconComponent = IconMap[b.icon] || Home;
          const labelText = language === 'darija' ? b.name.darija : b.name.fr;
          
          return (
            <div key={b.id} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 min-w-0 truncate">
                  <IconComponent size={14} className="text-slate-500 flex-shrink-0" />
                  <span className="truncate">{labelText}</span>
                  {b.isEssential && (
                    <span className="text-[8px] px-1 bg-rose-50 border border-rose-100 text-rose-600 rounded font-bold uppercase flex-shrink-0">
                      {language === 'darija' ? 'أساسي' : 'Fixe'}
                    </span>
                  )}
                </span>
                <span className="text-slate-900 ml-2 flex-shrink-0">{b.percentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={b.percentage}
                onChange={(e) => handlePctChange(b.id, parseInt(e.target.value, 10))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          );
        })}
      </div>

      {/* Visual Preview */}
      <BucketPreview buckets={buckets} incomeAmount={incomeAmount} />

      <div className="flex gap-3 pt-2">
        <button
          onClick={onPrev}
          disabled={submitting}
          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft size={14} />
          <span>{language === 'darija' ? 'رجوع' : 'Retour'}</span>
        </button>
        <button
          onClick={handleFinish}
          disabled={!isSumValid || submitting}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:pointer-events-none"
        >
          {submitting ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>{language === 'darija' ? 'تحميل...' : 'Création...'}</span>
            </>
          ) : (
            <span>{language === 'darija' ? 'إنهاء' : 'Terminer'}</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default Step4Buckets;
