import React, { useState } from 'react';
import { useCalculator } from '../../hooks/use-calculator';
import { BookOpen, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';

export function ZakatCalculator({ onBack }: { onBack?: () => void }) {
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
  const [cash, setCash] = useState(10000);
  const [savings, setSavings] = useState(40000);
  const [commercial, setCommercial] = useState(0);
  const [debts, setDebts] = useState(0);

  // Default gold/silver prices per gram in MAD for 2026
  const goldPrice = 680;
  const silverPrice = 8.5;

  const { zakatResult, runZakat } = useCalculator();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    runZakat({
      goldGrams: gold,
      silverGrams: silver,
      cashOnHand: cash,
      bankSavings: savings,
      commercialValue: commercial,
      debtsOwed: debts,
      goldPricePerGram: goldPrice,
      silverPricePerGram: silverPrice
    });
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={16} />
          <span>Retour aux calculatrices</span>
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
              <BookOpen className="text-emerald-600" size={18} />
              <span>Calculateur de Zakat Al Maal</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Évaluez votre cotisation annuelle légale (2.5%)</p>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Or détenu (grammes)</label>
                <input
                  type="number"
                  min={0}
                  value={gold}
                  onChange={(e) => setGold(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Argent détenu (grammes)</label>
                <input
                  type="number"
                  min={0}
                  value={silver}
                  onChange={(e) => setSilver(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Espèces en main (cash)</label>
                <input
                  type="number"
                  min={0}
                  value={cash}
                  onChange={(e) => setCash(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Épargne en banque (Sandoq)</label>
                <input
                  type="number"
                  min={0}
                  value={savings}
                  onChange={(e) => setSavings(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valeur de marchandises (commerce)</label>
                <input
                  type="number"
                  min={0}
                  value={commercial}
                  onChange={(e) => setCommercial(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dettes à déduire (à court terme)</label>
                <input
                  type="number"
                  min={0}
                  value={debts}
                  onChange={(e) => setDebts(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Évaluer ma Zakat
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          {zakatResult ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Synthèse légale (Hijri 1447)</span>
                
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nisab Argent d'épargne :</p>
                    <p className="text-sm font-extrabold mt-1">{(zakatResult as any).selectedNisab.toLocaleString('fr-FR')} DH</p>
                  </div>

                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Patrimoine Net évaluable :</p>
                    <p className="text-sm font-extrabold mt-1">{(zakatResult as any).netAssets.toLocaleString('fr-FR')} DH</p>
                  </div>

                  <div className="border-b border-slate-800 pb-3 col-span-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Montant de la Zakat dû (2.5%) :</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{(zakatResult as any).zakatDue.toLocaleString('fr-FR')} DH</p>
                  </div>
                </div>

                {zakatResult.isEligible ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-3 text-[10px] font-semibold mt-4">
                    <Sparkles size={14} className="inline mr-1" />
                    Votre patrimoine net dépasse le seuil légal du Nisab. Il est obligatoire de s'acquitter de cette somme envers les ayants droit.
                  </div>
                ) : (
                  <div className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl p-3 text-[10px] font-semibold mt-4">
                    ✓ Votre patrimoine est inférieur au seuil d'éligibilité (Nisab). Vous n'êtes pas imposable de la Zakat sur cette somme cette année.
                  </div>
                )}
              </div>

              <div className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                * Note théologique : Le barème de l'or est de 85g et l'argent est de 595g. Floussi actualise passivement les cours locaux indicatifs pour plus de précision.
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-12 text-slate-400 font-bold">
              <RefreshCw size={36} className="animate-spin text-slate-600 mb-2" />
              <p className="text-xs">Renseignez vos avoirs pour évaluer si votre épargne dépasse le seuil du Nisab.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ZakatCalculator;
