import { useState, useEffect } from 'react';
import { SubscriptionTier } from '../types';

export interface ExpertTip {
  id: string;
  title: string;
  content: string;
  category: string;
  minTier: SubscriptionTier;
  isActive: boolean;
}

const INITIAL_TIPS: ExpertTip[] = [
  { id: 'tip-1', title: 'Booster d\'Épargne Dakira', content: 'Épargnez 150 DH chaque fin de semaine pour anticiper les dépenses de l\'Aïd El Adha sans stress.', category: 'Épargne', minTier: 'free', isActive: true },
  { id: 'tip-2', title: 'Optimisation de Masrouf L3aila', content: 'Votre budget alimentation montre un pic de 20% les samedis. Privilégiez les marchés locaux (Souk) pour économiser.', category: 'Budget', minTier: 'family', isActive: true },
  { id: 'tip-3', title: 'Alerte Zakat Imminente', content: 'Votre sandoq de réserve a franchi le Nisab de l\'argent. Pensez à calculer votre Zakat Al Maal (2.5%).', category: 'Zakat', minTier: 'family', isActive: true }
];

export function useAdminTips() {
  const [tips, setTips] = useState<ExpertTip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('floussi_expert_tips');
    if (saved) {
      setTips(JSON.parse(saved));
    } else {
      setTips(INITIAL_TIPS);
      localStorage.setItem('floussi_expert_tips', JSON.stringify(INITIAL_TIPS));
    }
    setLoading(false);
  }, []);

  const saveTips = (updated: ExpertTip[]) => {
    setTips(updated);
    localStorage.setItem('floussi_expert_tips', JSON.stringify(updated));
  };

  const createTip = (data: Omit<ExpertTip, 'id' | 'isActive'>) => {
    const newTip: ExpertTip = {
      ...data,
      id: `tip-${Date.now()}`,
      isActive: true
    };
    saveTips([newTip, ...tips]);
  };

  const updateTip = (id: string, updates: Partial<ExpertTip>) => {
    const updated = tips.map(t => t.id === id ? { ...t, ...updates } : t);
    saveTips(updated);
  };

  const deleteTip = (id: string) => {
    const updated = tips.filter(t => t.id !== id);
    saveTips(updated);
  };

  return { tips, loading, createTip, updateTip, deleteTip };
}
