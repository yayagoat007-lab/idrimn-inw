import React, { useState } from 'react';
import { FileText, CheckSquare, Download, Sparkles, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from '../../hooks/use-translation';

interface ReportGeneratorProps {
  onGenerate: (config: {
    type: 'monthly' | 'quarterly' | 'annual';
    periodName: string;
    sections: string[];
    format: 'pdf' | 'excel' | 'csv';
  }) => void;
  isGenerating: boolean;
}

export function ReportGenerator({ onGenerate, isGenerating }: ReportGeneratorProps) {
  const { lang } = useTranslation();
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [period, setPeriod] = useState(lang === 'darija' ? 'Yulyuz 2026' : 'Juillet 2026');
  const [sections, setSections] = useState<string[]>(['overview', 'net_worth', 'benchmarks', 'ai_insights']);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  const handleToggleSection = (section: string) => {
    setSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onGenerate({
      type: reportType,
      periodName: period,
      sections,
      format
    });
    setStep(1); // reset step
  };

  return (
    <div className="border border-slate-150 rounded-2xl bg-white p-6 shadow-xs relative">
      {/* Progress Indicators */}
      <div className="flex justify-between items-center mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border transition-all ${
                step >= i 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              {i}
            </div>
            {i < 5 && (
              <div 
                className={`h-0.5 flex-1 mx-2 transition-all ${
                  step > i ? 'bg-emerald-500' : 'bg-slate-100'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Type selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'darija' ? "Marhala 1 : Périodicité d l-Rapport" : "Étape 1 : Périodicité du Rapport"}
            </span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            {lang === 'darija'
              ? "Khtar chhal d l-merrat t-sowweb l-audit d l-flouss dyalk f Floussi."
              : "Sélectionnez la fréquence de génération de l'audit de patrimoine Floussi."}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {(['monthly', 'quarterly', 'annual'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setReportType(type)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  reportType === type 
                    ? 'border-emerald-500 bg-emerald-50/10 text-emerald-800 font-bold' 
                    : 'border-slate-150 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="text-[10px] block uppercase tracking-wide">
                  {type === 'monthly'
                    ? (lang === 'darija' ? 'Dyal l-chhar' : 'Mensuel')
                    : type === 'quarterly'
                    ? (lang === 'darija' ? 'Dyal 3 chhour' : 'Trimestriel')
                    : (lang === 'darija' ? 'Dyal l-aam' : 'Annuel')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Period date */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'darija' ? "Marhala 2 : Khtar l-Waqt" : "Étape 2 : Sélection de la Période"}
            </span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            {lang === 'darija'
              ? "Smi l-waqt wella khtar l-période d had l-audit l-mali dyalk."
              : "Donnez un libellé ou choisissez la période cible pour cet audit financier."}
          </p>
          <input 
            type="text" 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 outline-none"
            placeholder={lang === 'darija' ? "Mathalan: Yulyuz 2026, Q2 2026..." : "Ex: Juillet 2026, Q2 2026..."}
          />
        </div>
      )}

      {/* Step 3: Sections checklist */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'darija' ? "Marhala 3 : Chnou bghiti fih" : "Étape 3 : Sections à Inclure"}
            </span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            {lang === 'darija'
              ? "Khtar l-briques lli bghiti t-khrej f l-warqa l-khra."
              : "Cochez les briques analytiques que vous désirez exporter dans le document final."}
          </p>

          <div className="space-y-2 text-xs font-semibold text-slate-700">
            {[
              {
                id: 'overview',
                name: lang === 'darija' ? "Moulakhass l-masrouf o s-snhirates" : "Résumé budgétaire & sandoqs"
              },
              {
                id: 'net_worth',
                name: lang === 'darija' ? "Ziyadat d l-iddikhar o net worth" : "Évolution d'épargne & net worth"
              },
              {
                id: 'benchmarks',
                name: lang === 'darija' ? "Moyenne l-wataniya dyal HCP" : "Comparaison nationale HCP"
              },
              {
                id: 'ai_insights',
                name: lang === 'darija' ? "Tawaqo3at o nasayih d l-IA" : "Analyses & prévisions prédictives"
              }
            ].map((sec) => (
              <label key={sec.id} className="flex items-center gap-2.5 p-2 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sections.includes(sec.id)}
                  onChange={() => handleToggleSection(sec.id)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>{sec.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Export Format */}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Download className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'darija' ? "Marhala 4 : l-Format d l-Khroj" : "Étape 4 : Format de Sortie"}
            </span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            {lang === 'darija' ? "Kifach bghiti t-ched l-m3loumat dyalk ?" : "Sous quel format préférez-vous recevoir vos données ?"}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {(['pdf', 'excel', 'csv'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  format === fmt 
                    ? 'border-emerald-500 bg-emerald-50/10 text-emerald-800 font-bold' 
                    : 'border-slate-150 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="text-[10px] block uppercase tracking-wide font-extrabold">{fmt.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Final compiler trigger */}
      {step === 5 && (
        <div className="text-center py-4 space-y-3">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
          <h4 className="text-xs font-black text-slate-800">
            {lang === 'darija' ? "Wajed l-Takhraj" : "Prêt pour Compilation"}
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold max-w-xs mx-auto">
            {lang === 'darija'
              ? "Koulchi l-mouchirate mhsoubin. Klike f l-bouton lli l-teht bch t-ched r-rapport dyalk."
              : "Tous les indicateurs sont calculés. Appuyez sur le bouton ci-dessous pour compiler et recevoir votre rapport de performance."}
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isGenerating}
            className="w-full max-w-xs mx-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {isGenerating 
                ? (lang === 'darija' ? "Kat-Sowweb..." : "Génération...") 
                : (lang === 'darija' ? "Sowweb r-Rapport" : "Générer le Rapport")}
            </span>
          </button>
        </div>
      )}

      {/* Navigation Footer */}
      {step < 5 && (
        <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-black flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{lang === 'darija' ? "Rje3" : "Retour"}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>{lang === 'darija' ? "Zid l-gdam" : "Suivant"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
export default ReportGenerator;

