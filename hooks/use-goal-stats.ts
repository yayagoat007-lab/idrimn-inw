import { useState, useEffect, useCallback } from 'react';
import { Goal } from '../types';
import { OfflineDB } from '../lib/offline-db';
import { GoalContributionLog } from './use-goals';

export interface GoalStat {
  goalId: string;
  monthlySavingsVelocity: number; // average saved per month
  estimatedCompletionMonths: number;
  estimatedCompletionDate: string | null;
  onTrack: boolean;
  requiredMonthlyToMeetDeadline: number;
}

export function useGoalStats(userId: string = "mock-user-id-9999") {
  const [stats, setStats] = useState<Record<string, GoalStat>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [goals, setGoals] = useState<Goal[]>([]);

  const calculateStats = useCallback(async () => {
    setLoading(true);
    const goalsList = await OfflineDB.get<Goal[]>('goals') || [];
    setGoals(goalsList);
    const logs = await OfflineDB.get<GoalContributionLog[]>('goal_contributions') || [];

    const computedStats: Record<string, GoalStat> = {};

    goalsList.forEach(g => {
      // Find logs associated with this goal
      const goalLogs = logs.filter(l => l.goal_id === g.id);
      
      // Calculate savings velocity (e.g., average monthly savings)
      // If we don't have enough logs, we can fallback to the auto_contribute_amount or a default 500 DH/month
      let monthlySavingsVelocity = g.auto_contribute_amount || 500;
      if (goalLogs.length > 0) {
        // Group by month to see how much is saved on average per month
        const monthlySum: Record<string, number> = {};
        goalLogs.forEach(l => {
          const monthKey = l.date.substring(0, 7); // YYYY-MM
          monthlySum[monthKey] = (monthlySum[monthKey] || 0) + l.amount;
        });
        const monthsCount = Object.keys(monthlySum).length || 1;
        const totalSavedInLogs = Object.values(monthlySum).reduce((sum, val) => sum + val, 0);
        monthlySavingsVelocity = Math.round(totalSavedInLogs / monthsCount);
      }

      // Remaining amount to save
      const remainingAmount = Math.max(0, g.target_amount - g.current_amount);

      // Estimated completion time
      let estimatedCompletionMonths = 999;
      let estimatedCompletionDate: string | null = null;

      if (remainingAmount > 0 && monthlySavingsVelocity > 0) {
        estimatedCompletionMonths = remainingAmount / monthlySavingsVelocity;
        const compDate = new Date();
        compDate.setMonth(compDate.getMonth() + Math.ceil(estimatedCompletionMonths));
        estimatedCompletionDate = compDate.toISOString().split('T')[0];
      } else if (remainingAmount === 0) {
        estimatedCompletionMonths = 0;
        estimatedCompletionDate = new Date().toISOString().split('T')[0];
      }

      // Check if on track to meet deadline
      let onTrack = true;
      let requiredMonthlyToMeetDeadline = 0;

      if (g.deadline && remainingAmount > 0) {
        const today = new Date();
        const dDate = new Date(g.deadline);
        const diffMonths = (dDate.getFullYear() - today.getFullYear()) * 12 + (dDate.getMonth() - today.getMonth());
        
        if (diffMonths > 0) {
          requiredMonthlyToMeetDeadline = Math.round(remainingAmount / diffMonths);
          onTrack = monthlySavingsVelocity >= requiredMonthlyToMeetDeadline;
        } else {
          requiredMonthlyToMeetDeadline = remainingAmount;
          onTrack = false;
        }
      }

      computedStats[g.id] = {
        goalId: g.id,
        monthlySavingsVelocity: monthlySavingsVelocity || 500,
        estimatedCompletionMonths: Math.round(estimatedCompletionMonths * 10) / 10,
        estimatedCompletionDate,
        onTrack,
        requiredMonthlyToMeetDeadline
      };
    });

    setStats(computedStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  /**
   * Models what happens to a goal if user contributes an additional premium monthly amount
   * Returns estimated months remaining under this scenario
   */
  const modelScenario = (goalId: string, additionalMonthly: number): { estimatedCompletionMonths: number; estimatedCompletionDate: string | null; monthsSaved: number } => {
    const goal = goals.find(g => g.id === goalId);
    const goalStat = stats[goalId];
    if (!goal || !goalStat) return { estimatedCompletionMonths: 0, estimatedCompletionDate: null, monthsSaved: 0 };

    const remainingAmount = Math.max(0, goal.target_amount - goal.current_amount);
    const newVelocity = goalStat.monthlySavingsVelocity + additionalMonthly;

    if (remainingAmount <= 0) {
      return { estimatedCompletionMonths: 0, estimatedCompletionDate: new Date().toISOString().split('T')[0], monthsSaved: 0 };
    }

    const newMonths = remainingAmount / newVelocity;
    const compDate = new Date();
    compDate.setMonth(compDate.getMonth() + Math.ceil(newMonths));

    const monthsSaved = Math.max(0, goalStat.estimatedCompletionMonths - newMonths);

    return {
      estimatedCompletionMonths: Math.round(newMonths * 10) / 10,
      estimatedCompletionDate: compDate.toISOString().split('T')[0],
      monthsSaved: Math.round(monthsSaved * 10) / 10
    };
  };

  return {
    stats,
    loading,
    modelScenario,
    refreshStats: calculateStats
  };
}
