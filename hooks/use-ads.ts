import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

export interface AdConfig {
  unitId: string;
  slot: string;
  format: 'auto' | 'fluid' | 'rectangle';
}

export function useAds() {
  const { profile } = useAuth();
  const subscriptionTier = profile?.subscription_tier || 'free';
  const shouldShowAds = subscriptionTier === 'free';

  const [impressions, setImpressions] = useState<number>(0);

  const trackImpression = (unitId: string) => {
    if (!shouldShowAds) return;
    setImpressions(prev => prev + 1);
    console.log(`[useAds] Ad impression tracked for slot ${unitId}. Total: ${impressions + 1}`);
    
    // Increment local counter or log to database
    const totalImpressionsKey = 'floussi_ad_impressions_count';
    const current = parseInt(localStorage.getItem(totalImpressionsKey) || '0', 10);
    localStorage.setItem(totalImpressionsKey, (current + 1).toString());
  };

  return {
    shouldShowAds,
    subscriptionTier,
    trackImpression,
    impressions
  };
}
