import { useState, useEffect } from 'react';

export interface AdminStats {
  totalUsers: number;
  monthlyActiveUsers: number;
  monthlyRecurringRevenue: number; // in DH
  churnRate: number; // in %
  conversionRate: number; // in %
  activeTontines: number;
  activeFamilies: number;
  plansBreakdown: { name: string; value: number; color: string }[];
  revenueTimeline: { month: string; revenue: number; users: number }[];
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 14520,
        monthlyActiveUsers: 8430,
        monthlyRecurringRevenue: 124900, // DH
        churnRate: 2.4,
        conversionRate: 8.7,
        activeTontines: 450,
        activeFamilies: 890,
        plansBreakdown: [
          { name: 'Gratuit', value: 12500, color: '#94a3b8' },
          { name: 'Premium (29 DH)', value: 1420, color: '#f59e0b' },
          { name: 'Famille (49 DH)', value: 430, color: '#10b981' },
          { name: 'Analyse (150 DH)', value: 110, color: '#3b82f6' },
          { name: 'Elite (200 DH)', value: 60, color: '#8b5cf6' }
        ],
        revenueTimeline: [
          { month: 'Jul 25', revenue: 65000, users: 8000 },
          { month: 'Aug 25', revenue: 72000, users: 8500 },
          { month: 'Sep 25', revenue: 79000, users: 9200 },
          { month: 'Oct 25', revenue: 84000, users: 9800 },
          { month: 'Nov 25', revenue: 90000, users: 10400 },
          { month: 'Dec 25', revenue: 95000, users: 11000 },
          { month: 'Jan 26', revenue: 101000, users: 11800 },
          { month: 'Feb 26', revenue: 105000, users: 12200 },
          { month: 'Mar 26', revenue: 110000, users: 12900 },
          { month: 'Apr 26', revenue: 115000, users: 13500 },
          { month: 'May 26', revenue: 120000, users: 14000 },
          { month: 'Jun 26', revenue: 124900, users: 14520 }
        ]
      });
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return { stats, loading };
}
