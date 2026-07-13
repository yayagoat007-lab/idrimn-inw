import { useState } from 'react';
import { SubscriptionTier } from '../types';

export interface CheckoutDetails {
  planId: SubscriptionTier;
  fullName: string;
  email: string;
  phone: string;
  method: 'card' | 'mobile' | 'cash' | 'paypal';
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
    processPayment
  };
}
