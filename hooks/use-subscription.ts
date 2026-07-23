import { useState } from 'react';
import { SubscriptionTier } from '../types';
import { supabase } from '../lib/supabase';
import { OfflineDB } from '../lib/offline-db';
import { unlockGlobalBadge } from '../lib/gamification';

export interface CheckoutDetails {
  planId: SubscriptionTier;
  fullName: string;
  email: string;
  phone: string;
  method: 'card' | 'mobile' | 'cash' | 'paypal';
}

export async function upgradeUserSubscription(
  userId: string,
  newTier: 'premium' | 'famille' | 'family' | 'analyse' | 'elite',
  billingCycle: 'monthly' | 'annual',
  paymentMethod: string = 'card',
  customAmount?: number
) {
  const mappedTier = newTier === 'famille' ? 'family' : newTier;
  const now = new Date();
  if (billingCycle === 'annual') {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  const expiresAt = now.toISOString();

  // Calculate amount if not provided
  let amount = customAmount;
  if (amount === undefined) {
    const basePrices: Record<string, number> = {
      premium: 29,
      family: 49,
      analyse: 150,
      elite: 200,
    };
    const monthlyPrice = basePrices[mappedTier] || 0;
    amount = billingCycle === 'annual' ? monthlyPrice * 10 : monthlyPrice; // 2 months free for annual
  }

  // Update profile in Supabase
  const profileUpdates = {
    subscription_tier: mappedTier,
    subscription_expires_at: expiresAt,
    updated_at: new Date().toISOString()
  };
  await supabase.from('profiles').update(profileUpdates).eq('id', userId);

  // Keep local IndexedDB (OfflineDB) in sync too
  const cachedProfile = await OfflineDB.get<any>('user_profile');
  if (cachedProfile && cachedProfile.id === userId) {
    const updatedProfile = {
      ...cachedProfile,
      ...profileUpdates
    };
    await OfflineDB.set('user_profile', updatedProfile);
  }

  // Create subscription payment record
  const transactionId = `tx-${paymentMethod}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const paymentRecord = {
    user_id: userId,
    tier: mappedTier,
    amount,
    currency: 'MAD',
    payment_method: paymentMethod,
    transaction_id: transactionId,
    status: 'paid',
    paid_at: new Date().toISOString(),
    expires_at: expiresAt
  };
  await supabase.from('subscription_payments').insert(paymentRecord);

  // Unlock corresponding badge in gamification state
  let badgeId = '';
  if (mappedTier === 'premium') {
    badgeId = 'premium_member';
  } else if (mappedTier === 'family') {
    badgeId = 'famille_member';
  } else if (mappedTier === 'analyse') {
    badgeId = 'analyste_member';
  } else if (mappedTier === 'elite') {
    badgeId = 'elite_tier'; // matches existing elite_tier id in ALL_BADGES
  }

  if (badgeId) {
    unlockGlobalBadge(userId, badgeId);
  }

  return {
    success: true,
    tier: mappedTier,
    expiresAt,
    amount
  };
}

export function useSubscription() {
  const [loading, setLoading] = useState(false);

  const applyPromoCode = async (code: string): Promise<number> => {
    // Return discount percentage
    return new Promise((resolve) => {
      setTimeout(() => {
        if (code.toUpperCase().includes('FLOUSSI')) {
          resolve(20); // 20% discount
        } else {
          resolve(0);
        }
      }, 500);
    });
  };

  const processPayment = async (details: CheckoutDetails): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        resolve(true); // Always succeed for mock demonstration
      }, 2000);
    });
  };

  return {
    loading,
    applyPromoCode,
    processPayment,
    upgradeUserSubscription
  };
}

