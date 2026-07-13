import React, { useState } from 'react';
import { formatCurrency } from '../../lib/utils';
import { Calculator, HelpCircle, Check, DollarSign } from 'lucide-react';

export interface RepaymentSimulatorProps {
  selectedLiability?: {
    name: string;
    value: number;
    interest_rate?: number;
    monthly_payment?: number;
  } | null;
}

export function RepaymentSimulator({ selectedLiability }: RepaymentSimulatorProps) {
  const [balance, setBalance] = useState<number>(300000);
  const [interestRate, setInterestRate] = useState<number>(4.25);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(3500);
  const [prepayment, setPrepayment] = useState<number>(50000);
  const [strategy, setStrategy] = useState<'duration' | 'payment'>('duration');

  React.useEffect(() => {
    if (selectedLiability) {
      setBalance(selectedLiability.value);
      if (selectedLiability.interest_rate) {
        setInterestRate(selectedLiability.interest_rate);
      }
      if (selectedLiability.monthly_payment) {
        setMonthlyPayment(selectedLiability.monthly_payment);
      }
    }
  }, [selectedLiability]);

  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  // Math simulation calculations
  const simulate = () => {
    // 1. Calculate remaining duration under current terms
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate === 0 || monthlyPayment <= balance * monthlyRate) {
      return { interestSaved: 0, monthsSaved: 0, newPayment: monthlyPayment, currentMonths: 0, currentInterests: 0 };
    }

    // Number of months = -log(1 - (balance * monthlyRate) / monthlyPayment) / log(1 + monthlyRate)
    const currentMonths = -Math.log(1 - (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate);
    const currentTotalPaid = monthlyPayment * currentMonths;
    const currentInterests = currentTotalPaid - balance;

    // 2. Prepayment calculations
    const remainingBalance = Math.max(0, balance - prepayment);
    
    if (remainingBalance === 0) {
      // Total repayment
      return {
        interestSaved: Math.round(currentInterests),
        monthsSaved: Math.round(currentMonths),
        newPayment: 0,
        currentMonths: Math.round(currentMonths),
        currentInterests: Math.round(currentInterests)
      };
    }

    if (strategy === 'duration') {
      // Keep same monthly payment, reduce duration
      const newMonths = -Math.log(1 - (remainingBalance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate);
      const newTotalPaid = (monthlyPayment * newMonths) + prepayment;
      const interestSaved = currentTotalPaid - newTotalPaid;
      const monthsSaved = currentMonths - newMonths;

      return {
        interestSaved: Math.round(Math.max(0, interestSaved)),
        monthsSaved: Math.round(Math.max(0, monthsSaved)),
        newPayment: monthlyPayment,
        currentMonths: Math.round(currentMonths),
        currentInterests: Math.round(currentInterests)
      };
    } else {
      // Keep same duration, reduce monthly payment
      // newMonthlyPayment = remainingBalance * monthlyRate / (1 - (1 + monthlyRate)^-currentMonths)
      const newPayment = (remainingBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -currentMonths));
      const newTotalPaid = (newPayment * currentMonths) + prepayment;
      const interestSaved = currentTotalPaid - newTotalPaid;

      return {
        interestSaved: Math.round(Math.max(0, interestSaved)),
        monthsSaved: 0,
        newPayment: Math.round(newPayment),
        currentMonths: Math.round(currentMonths),
        currentInterests: Math.round(currentInterests)
      };
    }
  };

  const results = simulate();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm max-w-2xl">
      <div className="mb-5">
        <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-emerald-600" />
          <span>Simulateur de Remboursement Anticipé</span>
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold">
          Estimez l'impact financier de l'injection d'un capital exceptionnel sur votre crédit immobilier ou consommation marocain.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Input variables panel */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase text-slate-400">Capital Restant Dû (DH)</label>
            <input
              type="number"
              value={balance || ''}
              onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono border border-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase text-slate-400">Taux Nominal (%)</label>
              <input
                type="number"
                step="0.05"
                value={interestRate || ''}
                onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono border border-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase text-slate-400">Mensualité (DH)</label>
              <input
                type="number"
                value={monthlyPayment || ''}
                onChange={(e) => setMonthlyPayment(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono border border-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase text-slate-400">Apport Anticipé (DH)</label>
            <input
              type="number"
              value={prepayment || ''}
              onChange={(e) => setPrepayment(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono border border-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Strategy choices */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[10px] font-black uppercase text-slate-400">Stratégie d'allègement</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStrategy('duration')}
                className={`flex-1 text-center py-2 text-[10px] font-black rounded-lg border transition-all ${strategy === 'duration' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'}`}
              >
                Réduire la durée
              </button>
              <button
                type="button"
                onClick={() => setStrategy('payment')}
                className={`flex-1 text-center py-2 text-[10px] font-black rounded-lg border transition-all ${strategy === 'payment' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'}`}
              >
                Réduire la mensualité
              </button>
            </div>
          </div>
        </div>

        {/* Results visualization panel */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Bilan de l'opération
            </span>

            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-500">Économie brute d'intérêts estimée</span>
              <span className="text-xl font-black text-emerald-600 font-mono">
                {formatMAD(results.interestSaved)}
              </span>
            </div>

            {strategy === 'duration' ? (
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-500">Temps de remboursement économisé</span>
                <span className="text-sm font-extrabold text-slate-700 font-mono">
                  {results.monthsSaved} mois ({Math.round(results.monthsSaved / 12 * 10) / 10} ans)
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-500">Nouvelle mensualité estimée</span>
                <span className="text-sm font-extrabold text-slate-700 font-mono">
                  {formatMAD(results.newPayment)} <span className="text-[10px] text-slate-400">/ mois</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-1.5 bg-white border border-slate-100 rounded-xl p-3 mt-4 text-[10px] text-slate-500 font-semibold leading-relaxed">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <p>
              Note : La banque peut appliquer des indemnités de remboursement anticipé (IRA) d'environ 1 à 2% du capital remboursé. Pensez à vérifier vos CGV.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
