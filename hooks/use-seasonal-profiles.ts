import { useState, useEffect } from 'react';
import { useBuckets } from './use-buckets';
import { OfflineDB } from '../lib/offline-db';

export interface SeasonalProfile {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  isActive: boolean;
  adjustments: {
    category: string;
    multiplier: number; // e.g. 1.5 for food, 0.2 for restaurant
    absoluteAddition?: number; // e.g. +3000 DH for Eid Mouton
  }[];
}

const DEFAULT_PROFILES: SeasonalProfile[] = [
  {
    id: "profile-ramadan",
    name: "Profil Ramadan",
    nameFr: "Profil Ramadan",
    description: "Alimentation +50% (plus de courses, Ftour copieux), Restaurant -80% (jeûne), Dons/Zakat +100%.",
    descriptionFr: "Augmente l'alimentation de 50%, réduit les restaurants de 80%, double le budget Zakat/Dons.",
    isActive: false,
    adjustments: [
      { category: "Alimentation", multiplier: 1.5 },
      { category: "Loisirs & Café", multiplier: 0.2 },
      { category: "Transport", multiplier: 0.8 },
      { category: "Événements & Cadeaux", multiplier: 2.0 }
    ]
  },
  {
    id: "profile-aid-adha",
    name: "Profil Aïd Al-Adha",
    nameFr: "Profil Aïd Al-Adha",
    description: "Ajoute le budget Mouton (+3 000 DH) et double le budget cadeaux et réunions familiales.",
    descriptionFr: "Ajoute le budget Mouton (+3 000 DH d'achat direct) et double le budget cadeaux familiaux.",
    isActive: false,
    adjustments: [
      { category: "Alimentation", multiplier: 1.2 },
      { category: "Événements & Cadeaux", multiplier: 2.0, absoluteAddition: 3000 }
    ]
  },
  {
    id: "profile-wedding",
    name: "Profil Mariage / Fêtes",
    nameFr: "Profil Mariage / Fêtes",
    description: "Préparez un mariage ou grand baptême (Tenue traditionnelle Neggafa, cadeaux de fiançailles).",
    descriptionFr: "Budget Cadeaux +150%, Beauté/Tenue +100% et transport de voyage.",
    isActive: false,
    adjustments: [
      { category: "Événements & Cadeaux", multiplier: 2.5, absoluteAddition: 1500 },
      { category: "Shopping", multiplier: 1.8 }
    ]
  }
];

export function useSeasonalProfiles() {
  const [profiles, setProfiles] = useState<SeasonalProfile[]>([]);
  const [history, setHistory] = useState<{ id: string; activatedAt: string; profileName: string }[]>([]);
  const { buckets, updateBucket } = useBuckets();

  useEffect(() => {
    async function loadProfiles() {
      let activeList = await OfflineDB.get<SeasonalProfile[]>('seasonal_profiles');
      let localHistory = await OfflineDB.get<{ id: string; activatedAt: string; profileName: string }[]>('seasonal_profiles_history') || [];
      
      if (!activeList || activeList.length === 0) {
        activeList = DEFAULT_PROFILES;
        await OfflineDB.set('seasonal_profiles', activeList);
      }
      setProfiles(activeList);
      setHistory(localHistory);
    }
    loadProfiles();
  }, []);

  const activateProfile = async (profileId: string) => {
    const updatedProfiles = profiles.map(p => {
      if (p.id === profileId) {
        return { ...p, isActive: true };
      }
      // Only one active at a time to avoid compound budget mutations
      return { ...p, isActive: false };
    });

    setProfiles(updatedProfiles);
    await OfflineDB.set('seasonal_profiles', updatedProfiles);

    const target = profiles.find(p => p.id === profileId);
    if (target) {
      // Log history
      const newHistory = [
        { id: `hist-${Date.now()}`, activatedAt: new Date().toISOString(), profileName: target.nameFr },
        ...history
      ];
      setHistory(newHistory);
      await OfflineDB.set('seasonal_profiles_history', newHistory);

      // Perform real automatic budget allocations
      for (const adj of target.adjustments) {
        const matchedBuckets = buckets.filter(b => b.category === adj.category || b.name.includes(adj.category));
        for (const bucket of matchedBuckets) {
          let newValue = bucket.allocated_amount * adj.multiplier;
          if (adj.absoluteAddition) {
            newValue += adj.absoluteAddition;
          }
          await updateBucket(bucket.id, {
            allocated_amount: Math.round(newValue)
          });
        }
      }
    }
  };

  const deactivateAllProfiles = async () => {
    const updated = profiles.map(p => ({ ...p, isActive: false }));
    setProfiles(updated);
    await OfflineDB.set('seasonal_profiles', updated);
  };

  const getPreviewAdjustments = (profileId: string) => {
    const target = profiles.find(p => p.id === profileId);
    if (!target) return [];

    return buckets.map(b => {
      const adj = target.adjustments.find(a => b.category === a.category || b.name.includes(a.category));
      if (!adj) return { bucketName: b.name, original: b.allocated_amount, adjusted: b.allocated_amount };
      
      let adjusted = b.allocated_amount * adj.multiplier;
      if (adj.absoluteAddition) {
        adjusted += adj.absoluteAddition;
      }
      return {
        bucketName: b.name,
        original: b.allocated_amount,
        adjusted: Math.round(adjusted)
      };
    });
  };

  return {
    profiles,
    history,
    activateProfile,
    deactivateAllProfiles,
    getPreviewAdjustments
  };
}
