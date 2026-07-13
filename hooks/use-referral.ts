import { useState, useEffect } from 'react';
import { Referral, INITIAL_REFERRALS, generateReferralCode } from '../lib/referral';

export function useReferral(userId: string, userName: string = 'Karim') {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const savedCode = localStorage.getItem(`floussi_ref_code_${userId}`);
    const savedRefs = localStorage.getItem(`floussi_referrals_${userId}`);

    if (savedCode) {
      setReferralCode(savedCode);
    } else {
      const code = generateReferralCode(userName);
      setReferralCode(code);
      localStorage.setItem(`floussi_ref_code_${userId}`, code);
    }

    if (savedRefs) {
      setReferrals(JSON.parse(savedRefs));
    } else {
      setReferrals(INITIAL_REFERRALS);
      localStorage.setItem(`floussi_referrals_${userId}`, JSON.stringify(INITIAL_REFERRALS));
    }
    setLoading(false);
  }, [userId, userName]);

  const inviteFriend = (name: string, emailOrPhone: string) => {
    const newRef: Referral = {
      id: `ref-${Date.now()}`,
      code: referralCode,
      friendName: name,
      emailOrPhone,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      rewardDays: 30
    };

    const updated = [newRef, ...referrals];
    setReferrals(updated);
    localStorage.setItem(`floussi_referrals_${userId}`, JSON.stringify(updated));
    alert(`L'invitation a été envoyée avec succès à ${name} !`);
  };

  return {
    referralCode,
    referrals,
    loading,
    inviteFriend
  };
}
