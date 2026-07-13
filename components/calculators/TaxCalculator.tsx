import React, { useState } from 'react';
import { useCalculator } from '../../hooks/use-calculator';
import { ArrowLeft, RefreshCw, Calculator, Percent } from 'lucide-react';

export function TaxCalculator({ onBack }: { onBack?: () => void }) {
  const [salary, setSalary] = useState(12000); // 12,000 DH/month
  const [familyCount, setFamilyCount] = useState(2); // e.g. wife + 1 kid
  const [otherDeductions, setOtherDeductions] = useState(500); // e.g. housing credit interest

  const { irResult, runIR } = useCalculator();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    runIR(salary, familyCount, otherDeductions);
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
              <Calculator className="text-emerald-600" size={18} />
              <span>Calculateur d'Impôt sur le Revenu (IR Maroc)</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Estimez vos retenues fiscales salariales mensuelles</p>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Salaire mensuel brut (DH)</label>
                <input
                  type="number"
                  min={1000}
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Charges de famille (max 6)</label>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={familyCount}
                    onChange={(e) => setFamilyCount(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Déductions mensuelles (DH)</label>
                  <input
                    type="number"
                    min={0}
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Calculer l'IR
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          {irResult ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Calcul IR 2026</span>
                
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Impôt Mensuel Dû (IR) :</p>
                    <p className="text-xl font-black text-rose-400 mt-1">{irResult.irDue.toLocaleString('fr-FR')} DH</p>
                  </div>

                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Salaire net après impôt :</p>
                    <p className="text-xl font-black text-emerald-400 mt-1">{irResult.netSalary.toLocaleString('fr-FR')} DH</p>
                  </div>

                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Taux d'imposition effectif :</p>
                    <p className="text-sm font-extrabold mt-1 flex items-center gap-0.5">
                      <Percent size={12} />
                      <span>{irResult.effectiveRate}%</span>
                    </p>
                  </div>

                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total abattements & déductions :</p>
                    <p className="text-sm font-extrabold mt-1">{irResult.deductionAmount.toLocaleString('fr-FR')} DH</p>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl p-3 text-[10px] font-semibold mt-4">
                  ✓ Calcul basé sur l'abattement forfaitaire professionnel de 20% (plafonné à 30 000 DH annuel) et une déduction de 30 DH par personne à charge.
                </div>
              </div>

              <div className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                * Note administrative : Les taux d'IR réels peuvent varier d'après vos cotisations CNSS / AMO et la nature exacte de vos primes.
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-12 text-slate-400 font-bold">
              <RefreshCw size={36} className="animate-spin text-slate-600 mb-2" />
              <p className="text-xs">Lancez le calculateur pour obtenir votre impôt mensuel net d'après les tranches du barème marocain.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default TaxCalculator;
