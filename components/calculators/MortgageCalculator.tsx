import React, { useState } from 'react';
import { useCalculator } from '../../hooks/use-calculator';
import { Landmark, ArrowLeft, RefreshCw, BarChart2 } from 'lucide-react';

export function MortgageCalculator({ onBack }: { onBack?: () => void }) {
  const [loan, setLoan] = useState(1000000); // 1,000,000 DH
  const [down, setDown] = useState(200000); // 200,000 DH
  const [rate, setRate] = useState(5.5); // 5.5% (défaut Maroc)
  const [years, setYears] = useState(20); // 20 ans
  const [income, setIncome] = useState(15000); // 15,000 DH monthly

  const { mortgageResult, runMortgage } = useCalculator();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    runMortgage(loan, down, rate, years, income);
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
              <Landmark className="text-emerald-600" size={18} />
              <span>Simulateur de Crédit Immobilier</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Estimez vos mensualités d'après les barèmes marocains</p>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Prix d'achat du bien :</span>
                  <span className="text-emerald-600 font-extrabold">{loan.toLocaleString('fr-FR')} DH</span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={5000000}
                  step={50000}
                  value={loan}
                  onChange={(e) => setLoan(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Apport personnel :</span>
                  <span className="text-emerald-600 font-extrabold">{down.toLocaleString('fr-FR')} DH</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={loan}
                  step={20000}
                  value={down}
                  onChange={(e) => setDown(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Taux d'intérêt annuel (%)</label>
                  <input
                    type="number"
                    step={0.1}
                    min={1}
                    max={15}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durée (années)</label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Revenu net mensuel du foyer (DH)</label>
                <input
                  type="number"
                  min={1000}
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Calculer ma mensualité
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          {mortgageResult ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Résultats de la simulation</span>
                
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Mensualité estimée :</p>
                    <p className="text-xl font-black text-emerald-400 mt-1">{mortgageResult.monthlyPayment.toLocaleString('fr-FR')} DH</p>
                  </div>

                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Taux d'endettement :</p>
                    <p className={`text-xl font-black mt-1 ${mortgageResult.debtRatio > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {mortgageResult.debtRatio}%
                    </p>
                  </div>

                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total des intérêts :</p>
                    <p className="text-sm font-extrabold mt-1">{mortgageResult.totalInterest.toLocaleString('fr-FR')} DH</p>
                  </div>

                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Coût total du crédit :</p>
                    <p className="text-sm font-extrabold mt-1">{mortgageResult.totalCost.toLocaleString('fr-FR')} DH</p>
                  </div>
                </div>

                {/* Info alert */}
                {mortgageResult.debtRatio > 45 ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl p-3 text-[10px] font-semibold mt-4">
                    ⚠️ Attention : Votre taux d'endettement dépasse 40%. La plupart des banques marocaines (CIH, Attijari, BCP) exigent un ratio d'endettement maximal inférieur à 45% pour approuver un crédit immobilier.
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-3 text-[10px] font-semibold mt-4">
                    ✓ Ratio d'endettement sain. Votre dossier est solide pour entamer des démarches auprès des banques partenaires.
                  </div>
                )}
              </div>

              {/* Sample Amortization */}
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <BarChart2 size={12} />
                  <span>Jalons d'amortissement (Exemple)</span>
                </p>
                <div className="max-h-24 overflow-y-auto divide-y divide-slate-800 text-[10px] font-bold text-slate-300">
                  {mortgageResult.amortizationTable.slice(0, 5).map((row, i) => (
                    <div key={i} className="py-1 flex justify-between">
                      <span>Mois {row.month}</span>
                      <span>Principal: {row.principal.toLocaleString('fr-FR')} DH · Intérêts: {row.interest.toLocaleString('fr-FR')} DH</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-12 text-slate-400 font-bold">
              <RefreshCw size={36} className="animate-spin text-slate-600 mb-2" />
              <p className="text-xs">Cliquez sur le bouton pour évaluer vos options de financement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default MortgageCalculator;
