export interface DashboardWidget {
  id: string;
  componentName: string;
  category: 'financial' | 'social' | 'progress' | 'info';
  defaultVisible: boolean;
  defaultOrder: number;
  minSubscriptionTier?: 'free' | 'premium' | 'famille' | 'analyse' | 'elite';
  isResizable: boolean;
  sizeOptions: ('compact' | 'normal' | 'large')[];
}

export const DASHBOARD_WIDGETS_REGISTRY: DashboardWidget[] = [
  {
    id: 'solde',
    componentName: 'HeroHeader',
    category: 'financial',
    defaultVisible: true,
    defaultOrder: 0,
    isResizable: false,
    sizeOptions: ['large']
  },
  {
    id: 'score',
    componentName: 'FloussiScoreWidget',
    category: 'progress',
    defaultVisible: true,
    defaultOrder: 1,
    isResizable: false,
    sizeOptions: ['normal']
  },
  {
    id: 'free_to_spend',
    componentName: 'FreeToSpendGrid',
    category: 'financial',
    defaultVisible: true,
    defaultOrder: 2,
    isResizable: false,
    sizeOptions: ['large']
  },
  {
    id: 'buckets',
    componentName: 'BucketsGrid',
    category: 'financial',
    defaultVisible: true,
    defaultOrder: 3,
    isResizable: true,
    sizeOptions: ['normal', 'large']
  },
  {
    id: 'events',
    componentName: 'EventsGrid',
    category: 'social',
    defaultVisible: true,
    defaultOrder: 4,
    isResizable: true,
    sizeOptions: ['normal', 'large']
  },
  {
    id: 'tontine',
    componentName: 'TontineCard',
    category: 'social',
    defaultVisible: true,
    defaultOrder: 5,
    minSubscriptionTier: 'premium',
    isResizable: false,
    sizeOptions: ['normal']
  },
  {
    id: 'goals',
    componentName: 'GoalsCard',
    category: 'progress',
    defaultVisible: true,
    defaultOrder: 6,
    isResizable: false,
    sizeOptions: ['normal']
  },
  {
    id: 'transactions',
    componentName: 'RecentTransactions',
    category: 'financial',
    defaultVisible: true,
    defaultOrder: 7,
    isResizable: false,
    sizeOptions: ['normal']
  },
  {
    id: 'alertes',
    componentName: 'AlertBanner',
    category: 'info',
    defaultVisible: true,
    defaultOrder: 8,
    isResizable: false,
    sizeOptions: ['normal']
  }
];
