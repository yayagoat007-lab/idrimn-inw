import { DASHBOARD_WIDGETS_REGISTRY } from './dashboard-widgets-registry';

export interface UserWidgetLayout {
  id: string;
  visible: boolean;
  order: number;
  size: 'compact' | 'normal' | 'large';
}

export const PRESET_LAYOUTS: Record<string, Omit<UserWidgetLayout, 'id'>[]> = {
  etudiant: [
    { id: 'solde', visible: true, order: 0, size: 'large' },
    { id: 'buckets', visible: true, order: 1, size: 'normal' },
    { id: 'goals', visible: true, order: 2, size: 'normal' },
    { id: 'score', visible: true, order: 3, size: 'normal' },
    { id: 'free_to_spend', visible: true, order: 4, size: 'large' },
    { id: 'alertes', visible: true, order: 5, size: 'normal' },
    { id: 'transactions', visible: true, order: 6, size: 'normal' },
    { id: 'events', visible: false, order: 7, size: 'normal' },
    { id: 'tontine', visible: false, order: 8, size: 'normal' },
  ],
  freelance: [
    { id: 'solde', visible: true, order: 0, size: 'large' },
    { id: 'score', visible: true, order: 1, size: 'normal' },
    { id: 'free_to_spend', visible: true, order: 2, size: 'large' },
    { id: 'buckets', visible: true, order: 3, size: 'large' }, // Provisions & CNSS highlight
    { id: 'goals', visible: true, order: 4, size: 'normal' },
    { id: 'transactions', visible: true, order: 5, size: 'normal' },
    { id: 'alertes', visible: true, order: 6, size: 'normal' },
    { id: 'events', visible: false, order: 7, size: 'normal' },
    { id: 'tontine', visible: false, order: 8, size: 'normal' },
  ],
  parent_famille: [
    { id: 'solde', visible: true, order: 0, size: 'large' },
    { id: 'tontine', visible: true, order: 1, size: 'normal' }, // Tontine / Daret high up
    { id: 'goals', visible: true, order: 2, size: 'normal' }, // Family goals
    { id: 'buckets', visible: true, order: 3, size: 'large' }, // Household / scolarité large grid
    { id: 'events', visible: true, order: 4, size: 'large' }, // Aïd / Ramadan
    { id: 'score', visible: true, order: 5, size: 'normal' },
    { id: 'free_to_spend', visible: true, order: 6, size: 'large' },
    { id: 'transactions', visible: true, order: 7, size: 'normal' },
    { id: 'alertes', visible: true, order: 8, size: 'normal' },
  ],
  mre: [
    { id: 'solde', visible: true, order: 0, size: 'large' },
    { id: 'goals', visible: true, order: 1, size: 'normal' }, // Investments in Morocco
    { id: 'tontine', visible: true, order: 2, size: 'normal' }, // Money transfers & support
    { id: 'buckets', visible: true, order: 3, size: 'large' }, // Support buckets
    { id: 'score', visible: true, order: 4, size: 'normal' },
    { id: 'free_to_spend', visible: true, order: 5, size: 'large' },
    { id: 'events', visible: true, order: 6, size: 'normal' },
    { id: 'transactions', visible: true, order: 7, size: 'normal' },
    { id: 'alertes', visible: true, order: 8, size: 'normal' },
  ],
  retraite: [
    { id: 'solde', visible: true, order: 0, size: 'large' },
    { id: 'buckets', visible: true, order: 1, size: 'large' }, // Healthcare & living cost focus
    { id: 'score', visible: true, order: 2, size: 'normal' },
    { id: 'free_to_spend', visible: true, order: 3, size: 'large' },
    { id: 'goals', visible: true, order: 4, size: 'normal' }, // Omra / gifts
    { id: 'transactions', visible: true, order: 5, size: 'normal' },
    { id: 'alertes', visible: true, order: 6, size: 'normal' },
    { id: 'events', visible: false, order: 7, size: 'normal' },
    { id: 'tontine', visible: false, order: 8, size: 'normal' },
  ]
} as any;

export function getPresetLayoutForPersona(personaId: string): UserWidgetLayout[] {
  const preset = PRESET_LAYOUTS[personaId];
  if (!preset) {
    // Standard default from registry
    return DASHBOARD_WIDGETS_REGISTRY.map(reg => ({
      id: reg.id,
      visible: reg.defaultVisible,
      order: reg.defaultOrder,
      size: (reg.sizeOptions[0] || 'normal') as 'compact' | 'normal' | 'large'
    })).sort((a, b) => a.order - b.order);
  }

  return preset.map((item: any) => ({
    id: item.id,
    visible: item.visible,
    order: item.order,
    size: item.size
  })).sort((a: any, b: any) => a.order - b.order);
}
