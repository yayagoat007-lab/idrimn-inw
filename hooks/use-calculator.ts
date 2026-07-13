import { useState } from 'react';
import {
  calculateMortgage,
  calculateZakat,
  calculateIRMaroc,
  calculateSavings,
  MortgageResult,
  ZakatResult,
  IRResult,
  SavingsResult
} from '../lib/calculators';

export function useCalculator() {
  const [mortgageResult, setMortgageResult] = useState<MortgageResult | null>(null);
  const [zakatResult, setZakatResult] = useState<ZakatResult | null>(null);
  const [irResult, setIrResult] = useState<IRResult | null>(null);
  const [savingsResult, setSavingsResult] = useState<SavingsResult | null>(null);

  const runMortgage = (loan: number, down: number, rate: number, years: number, income: number) => {
    const res = calculateMortgage(loan, down, rate, years, income);
    setMortgageResult(res);
  };

  const runZakat = (inputs: any) => {
    const res = calculateZakat(inputs);
    setZakatResult(res as any);
  };

  const runIR = (salary: number, allowanceCount: number, otherDeductions: number) => {
    const res = calculateIRMaroc(salary, allowanceCount, otherDeductions);
    setIrResult(res);
  };

  const runSavings = (initial: number, monthly: number, rate: number, years: number) => {
    const res = calculateSavings(initial, monthly, rate, years);
    setSavingsResult(res);
  };

  return {
    mortgageResult,
    zakatResult,
    irResult,
    savingsResult,
    runMortgage,
    runZakat,
    runIR,
    runSavings
  };
}
