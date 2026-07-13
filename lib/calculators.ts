// Formulas and calculations for Moroccan calculators

export interface MortgageResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  debtRatio: number;
  amortizationTable: {
    month: number;
    interest: number;
    principal: number;
    remaining: number;
  }[];
}

export function calculateMortgage(
  loanAmount: number,
  downPayment: number,
  annualRate: number,
  durationYears: number,
  monthlyIncome: number
): MortgageResult {
  const principal = Math.max(0, loanAmount - downPayment);
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = durationYears * 12;

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = principal / totalMonths;
  } else {
    monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                     (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const totalCost = monthlyPayment * totalMonths;
  const totalInterest = totalCost - principal;
  const debtRatio = monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0;

  // Generate a mock or lightweight month-by-month table to avoid performance issues in lists
  const amortizationTable = [];
  let remaining = principal;
  for (let m = 1; m <= Math.min(totalMonths, 300); m++) {
    const interest = remaining * monthlyRate;
    const principalPaid = monthlyPayment - interest;
    remaining = Math.max(0, remaining - principalPaid);
    
    // Only save key milestones or sample months to avoid transferring giant payloads, e.g. every year + first few months
    if (m <= 12 || m % 12 === 0 || remaining === 0) {
      amortizationTable.push({
        month: m,
        interest: Math.round(interest * 100) / 100,
        principal: Math.round(principalPaid * 100) / 100,
        remaining: Math.round(remaining * 100) / 100
      });
    }
    if (remaining <= 0) break;
  }

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    debtRatio: Math.round(debtRatio * 10) / 10,
    amortizationTable
  };
}

export interface ZakatResult {
  isEligible: boolean;
  nisabGold: number;
  nisabSilver: number;
  totalAssets: boolean;
  zakatDue: number;
}

export function calculateZakat(inputs: {
  goldGrams: number;
  silverGrams: number;
  cashOnHand: number;
  bankSavings: number;
  commercialValue: number;
  debtsOwed: number;
  goldPricePerGram: number; // e.g. 680 DH in 2026
  silverPricePerGram: number; // e.g. 8.5 DH
}) {
  const goldValue = inputs.goldGrams * inputs.goldPricePerGram;
  const silverValue = inputs.silverGrams * inputs.silverPricePerGram;
  
  // Nisab benchmarks (85g of Gold, 595g of Silver)
  const nisabGold = 85 * inputs.goldPricePerGram;
  const nisabSilver = 595 * inputs.silverPricePerGram;

  // The lowest Nisab is silver, generally used for cash-based calculation
  const selectedNisab = nisabSilver;

  const grossAssets = inputs.cashOnHand + inputs.bankSavings + inputs.commercialValue + goldValue + silverValue;
  const netAssets = Math.max(0, grossAssets - inputs.debtsOwed);

  const isEligible = netAssets >= selectedNisab;
  const zakatDue = isEligible ? netAssets * 0.025 : 0;

  return {
    isEligible,
    nisabGold: Math.round(nisabGold),
    nisabSilver: Math.round(nisabSilver),
    selectedNisab: Math.round(selectedNisab),
    netAssets: Math.round(netAssets),
    zakatDue: Math.round(zakatDue)
  };
}

export interface IRResult {
  grossIncome: number;
  netTaxableIncome: number;
  irDue: number;
  netSalary: number;
  effectiveRate: number;
  deductionAmount: number;
}

export function calculateIRMaroc(
  monthlySalary: number,
  familyAllowancesCount: number, // up to 6 dependents, e.g. spouse + kids, each gives 30 DH deduction max 180 DH/month
  otherDeductions: number // monthly other deductions
): IRResult {
  const grossAnnual = monthlySalary * 12;
  
  // 20% professional costs deduction (frais professionnels), capped at 30,000 DH/year normally
  const professionalCosts = Math.min(grossAnnual * 0.20, 30000);
  
  let taxableAnnual = grossAnnual - professionalCosts - (otherDeductions * 12);
  taxableAnnual = Math.max(0, taxableAnnual);

  // Barème IR Maroc 2025/2026 (Annual Tranches)
  // 0 - 40,000 DH : 0%
  // 40,001 - 60,000 DH : 10% (deduction: 4,000)
  // 60,001 - 80,000 DH : 20% (deduction: 10,000)
  // 80,001 - 100,000 DH : 30% (deduction: 18,000)
  // 100,001 - 180,000 DH : 34% (deduction: 22,000)
  // Over 180,000 DH : 38% (deduction: 29,200)
  
  let irAnnualBeforeFamily = 0;
  let rate = 0;
  let abattement = 0;

  if (taxableAnnual <= 40000) {
    rate = 0;
    abattement = 0;
  } else if (taxableAnnual <= 60000) {
    rate = 0.10;
    abattement = 4000;
  } else if (taxableAnnual <= 80000) {
    rate = 0.20;
    abattement = 10000;
  } else if (taxableAnnual <= 100000) {
    rate = 0.30;
    abattement = 18000;
  } else if (taxableAnnual <= 180000) {
    rate = 0.34;
    abattement = 22000;
  } else {
    rate = 0.38;
    abattement = 29200;
  }

  irAnnualBeforeFamily = (taxableAnnual * rate) - abattement;
  irAnnualBeforeFamily = Math.max(0, irAnnualBeforeFamily);

  // Family deduction: 360 DH per dependent annually (30 DH / month), capped at 6 dependents (2,160 DH/year)
  const familyDeductionAnnual = Math.min(familyAllowancesCount, 6) * 360;
  
  const irAnnual = Math.max(0, irAnnualBeforeFamily - familyDeductionAnnual);
  const irMonthly = irAnnual / 12;
  const netMonthly = monthlySalary - irMonthly;

  return {
    grossIncome: Math.round(monthlySalary),
    netTaxableIncome: Math.round(taxableAnnual / 12),
    irDue: Math.round(irMonthly),
    netSalary: Math.round(netMonthly),
    effectiveRate: monthlySalary > 0 ? Math.round((irMonthly / monthlySalary) * 1000) / 10 : 0,
    deductionAmount: Math.round((professionalCosts / 12) + (familyDeductionAnnual / 12))
  };
}

export interface SavingsResult {
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
  projection: {
    year: number;
    balance: number;
    contributed: number;
  }[];
}

export function calculateSavings(
  initialAmount: number,
  monthlyContribution: number,
  annualInterestRate: number,
  durationYears: number
): SavingsResult {
  const r = annualInterestRate / 100 / 12;
  const totalMonths = durationYears * 12;
  
  let balance = initialAmount;
  let totalContributed = initialAmount;
  const projection = [{ year: 0, balance: Math.round(initialAmount), contributed: Math.round(initialAmount) }];

  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * (1 + r) + monthlyContribution;
    totalContributed += monthlyContribution;
    
    if (m % 12 === 0) {
      projection.push({
        year: m / 12,
        balance: Math.round(balance),
        contributed: Math.round(totalContributed)
      });
    }
  }

  const totalInterest = Math.max(0, balance - totalContributed);

  return {
    finalBalance: Math.round(balance),
    totalContributed: Math.round(totalContributed),
    totalInterest: Math.round(totalInterest),
    projection
  };
}
