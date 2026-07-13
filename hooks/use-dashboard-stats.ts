import { useMemo } from 'react';
import { Transaction, Bucket } from '../types';

export interface DashboardStats {
  totalBalance: number;
  balanceByAccount: {
    checking: number;
    savings: number;
    cash: number;
    total: number;
  };
  freeToSpend: number;
  monthlyVariation: {
    amount: number;
    percent: number;
    isPositive: boolean;
  };
  projectionEndMonth: number;
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
  biggestWeeklyExpense: { amount: number; description: string; date: string } | null;
  pendingTransactionsCount: number;
}

export function useDashboardStats(
  transactions: Transaction[],
  buckets: Bucket[],
  userTier: string = 'free',
  syncQueueCount: number = 0
): DashboardStats {
  return useMemo(() => {
    // 1. Total Balance from active buckets
    const totalBalance = buckets.reduce((sum, b) => sum + (b.allocated_amount - b.spent_amount), 0);

    // 2. Solde par compte
    // Let's check accounts. Let's calculate balances by summing up income - expense
    let checking = 12500; // base seed values
    let savings = 34000;
    let cash = 3250;

    transactions.forEach(t => {
      const amt = t.amount;
      if (t.type === 'expense') {
        if (t.account_id === 'acc-checking') checking -= amt;
        else if (t.account_id === 'acc-savings') savings -= amt;
        else if (t.account_id === 'acc-cash') cash -= amt;
      } else if (t.type === 'income') {
        if (t.account_id === 'acc-checking') checking += amt;
        else if (t.account_id === 'acc-savings') savings += amt;
        else if (t.account_id === 'acc-cash') cash += amt;
      } else if (t.type === 'transfer') {
        // e.g. from acc-checking to acc-savings
        if (t.account_id === 'acc-checking') {
          checking -= amt;
          savings += amt;
        }
      }
    });

    const balanceByAccount = {
      checking: Math.max(0, checking),
      savings: Math.max(0, savings),
      cash: Math.max(0, cash),
      total: Math.max(0, checking + savings + cash)
    };

    // 3. Free To Spend (balance outside essential buckets)
    // Essential buckets are housing, bills, debt. Let's subtract their allocated_amount minus spent_amount
    const essentialCommitted = buckets
      .filter(b => b.is_essential)
      .reduce((sum, b) => sum + Math.max(0, b.allocated_amount - b.spent_amount), 0);

    const freeToSpend = Math.max(0, totalBalance - essentialCommitted);

    // 4. Variation vs last month
    // Let's compute spent this month vs spent last month or simple baseline
    const expensesThisMonth = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const baselineExpensesLastMonth = expensesThisMonth * 0.95 + 1200; // Simulated last month
    const percentChange = ((baselineExpensesLastMonth - expensesThisMonth) / baselineExpensesLastMonth) * 100;

    const monthlyVariation = {
      amount: Math.abs(baselineExpensesLastMonth - expensesThisMonth),
      percent: parseFloat(Math.abs(percentChange).toFixed(1)),
      isPositive: percentChange >= 0 // means spent less, which is good
    };

    // 5. Projection fin de mois
    // Current date progress
    const today = new Date();
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dailySpendRate = expensesThisMonth / Math.max(1, dayOfMonth);
    const projectedSpend = dailySpendRate * daysInMonth;
    const monthlyIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) || 12000; // fallback to baseline income

    const projectionEndMonth = Math.max(0, monthlyIncome - projectedSpend);

    // 6. Top categories of expenses
    const categoryTotals: Record<string, number> = {};
    let totalExpenseAmount = 0;

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        totalExpenseAmount += t.amount;
      });

    const topCategories = Object.keys(categoryTotals)
      .map(cat => ({
        category: cat,
        amount: categoryTotals[cat],
        percentage: totalExpenseAmount > 0 ? Math.round((categoryTotals[cat] / totalExpenseAmount) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    // 7. Biggest weekly expense
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyExpenses = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const tDate = new Date(t.transaction_date);
      return tDate >= sevenDaysAgo;
    });

    let biggestWeeklyExpense = null;
    if (weeklyExpenses.length > 0) {
      const biggest = weeklyExpenses.reduce((max, t) => t.amount > max.amount ? t : max, weeklyExpenses[0]);
      biggestWeeklyExpense = {
        amount: biggest.amount,
        description: biggest.description,
        date: biggest.transaction_date
      };
    }

    return {
      totalBalance,
      balanceByAccount,
      freeToSpend,
      monthlyVariation,
      projectionEndMonth,
      topCategories,
      biggestWeeklyExpense,
      pendingTransactionsCount: syncQueueCount
    };
  }, [transactions, buckets, syncQueueCount]);
}
