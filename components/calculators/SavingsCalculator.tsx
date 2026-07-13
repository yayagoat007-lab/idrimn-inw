import React, { useState } from 'react';
import { useCalculator } from '../../hooks/use-calculator';
import { ArrowLeft, RefreshCw, PiggyBank, Award } from 'lucide-react';

export function SavingsCalculator({ onBack }: { onBack?: () => void }) {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(3.5); // 3.5% default compound return
  const [years, setYears] = useState(5);

  const { savingsResult, runSavings } = useCalculator();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    runSavings(initial, monthly, rate, years);
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
              <PiggyBank className="text-emerald-600" size={18} />
              <span>Calculateur d'Épargne & de Capitalisation</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Estimez la croissance de votre sandoq d'épargne d'intérêt</p>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Montant initial (DH)</label>
                <input
                  type="number"
                  min={0}
                  value={initial}
                  onChange={(e) => setInitial(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Versement périodique mensuel (DH)</label>
                <input
                  type="number"
                  min={0}
                  value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Taux de rendement annuel (%)</label>
                  <input
                    type="number"
                    step={0.1}
                    min={0.1}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durée du placement (années)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Simuler l'épargne
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          {savingsResult ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Compounding Capital</span>
                
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="border-b border-slate-800 pb-3 col-span-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Capital Final estimé :</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{savingsResult.finalBalance.toLocaleString('fr-FR')} DH</p>
                  </div>

                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Cotisations :</p>
                    <p className="text-sm font-extrabold mt-1">{savingsResult.totalContributed.toLocaleString('fr-FR')} DH</p>
                  </div>

                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Intérêts composés générés :</p>
                    <p className="text-sm font-extrabold mt-1 text-emerald-400">+{savingsResult.totalInterest.toLocaleString('fr-FR')} DH</p>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-3 text-[10px] font-semibold mt-4">
                  <Award size={14} className="inline mr-1" />
                  Grâce aux intérêts composés, vous gagnez {savingsResult.totalInterest.toLocaleString('fr-FR')} DH supplémentaires uniquement grâce à la capitalisation sur {years} ans !
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Progression annuelle estimée :</p>
                <div className="max-h-24 overflow-y-auto divide-y divide-slate-800 text-[10px] font-bold text-slate-300">
                  {savingsResult.projection.map((row, i) => (
                    <div key={i} className="py-1 flex justify-between">
                      <span>Année {row.year}</span>
                      <span>{row.balance.toLocaleString('fr-FR')} DH (Versé: {row.contributed.toLocaleString('fr-FR')} DH)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-12 text-slate-400 font-bold">
              <RefreshCw size={36} className="animate-spin text-slate-600 mb-2" />
              <p className="text-xs">Visualisez la projection de croissance financière cumulée en exécutant le calcul.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default SavingsCalculator;
