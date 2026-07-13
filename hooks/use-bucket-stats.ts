import { useState, useEffect, useCallback } from 'react';
import { Bucket, Transaction } from '../types';
import { OfflineDB } from '../lib/offline-db';

export interface BucketStat {
  bucketId: string;
  averageDailySpent: number;
  remainingDays: number; // days until exhausted
  exhaustionDate: string | null;
  speedStatus: 'under' | 'normal' | 'fast' | 'depleted';
  trendPercent: number; // comparing this week vs last week
  historicalMonthly: { month: string; allocated: number; spent: number }[];
}

export function useBucketStats(userId: string = "mock-user-id-9999") {
  const [stats, setStats] = useState<Record<string, BucketStat>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const calculateStats = useCallback(async () => {
    setLoading(true);
    const buckets = await OfflineDB.get<Bucket[]>('buckets') || [];
    const transactions = await OfflineDB.get<Transaction[]>('transactions') || [];

    const today = new Date();
    const currentDay = today.getDate(); // e.g. 12
    const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    const computedStats: Record<string, BucketStat> = {};

    buckets.forEach(b => {
      const bucketTransactions = transactions.filter(t => t.bucket_id === b.id && t.type === 'expense');
      
      // Calculate daily average
      const spent = b.spent_amount || 0;
      const averageDailySpent = currentDay > 0 ? Math.round((spent / currentDay) * 100) / 100 : 0;

      // Projection: remaining days
      const remaining = Math.max(0, b.allocated_amount - spent);
      let remainingDays = 999;
      let exhaustionDate: string | null = null;

      if (spent > 0 && averageDailySpent > 0) {
        remainingDays = Math.ceil(remaining / averageDailySpent);
        const exhaustion = new Date();
        exhaustion.setDate(today.getDate() + remainingDays);
        exhaustionDate = exhaustion.toISOString().split('T')[0];
      }

      // Speed status: compare current usage percentage vs month completion percentage
      const monthProgressPercent = (currentDay / totalDaysInMonth) * 100;
      const bucketProgressPercent = b.allocated_amount > 0 ? (spent / b.allocated_amount) * 100 : 0;
      
      let speedStatus: 'under' | 'normal' | 'fast' | 'depleted' = 'normal';
      if (bucketProgressPercent >= 100) {
        speedStatus = 'depleted';
      } else if (bucketProgressPercent > monthProgressPercent + 15) {
        speedStatus = 'fast';
      } else if (bucketProgressPercent < monthProgressPercent - 15) {
        speedStatus = 'under';
      }

      // Calculate trend (spent this week vs spent last week)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      const spentThisWeek = bucketTransactions
        .filter(t => new Date(t.transaction_date) >= oneWeekAgo)
        .reduce((sum, t) => sum + t.amount, 0);

      const spentLastWeek = bucketTransactions
        .filter(t => {
          const d = new Date(t.transaction_date);
          return d >= twoWeeksAgo && d < oneWeekAgo;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      let trendPercent = 0;
      if (spentLastWeek > 0) {
        trendPercent = Math.round(((spentThisWeek - spentLastWeek) / spentLastWeek) * 100);
      } else if (spentThisWeek > 0) {
        trendPercent = 100; // went up from 0
      }

      // Simulated clean historical 6 months chart
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
      const historicalMonthly = months.map((m, idx) => {
        // Base numbers roughly matching seed data scale
        const randSpentFactor = 0.7 + Math.random() * 0.4;
        return {
          month: m,
          allocated: b.allocated_amount,
          spent: Math.round(b.allocated_amount * (idx === 6 ? (spent / (b.allocated_amount || 1)) : randSpentFactor))
        };
      });

      computedStats[b.id] = {
        bucketId: b.id,
        averageDailySpent,
        remainingDays,
        exhaustionDate,
        speedStatus,
        trendPercent,
        historicalMonthly
      };
    });

    setStats(computedStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return {
    stats,
    loading,
    refreshStats: calculateStats
  };
}
