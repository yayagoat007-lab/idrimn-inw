// Referral code manager for Floussi

export interface Referral {
  id: string;
  code: string;
  friendName: string;
  emailOrPhone: string;
  date: string;
  status: 'pending' | 'completed' | 'expired';
  rewardDays: number;
}

export function generateReferralCode(userName: string): string {
  const cleanName = userName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `FLOUSSI-${cleanName || 'MOROCCO'}-${randomStr}`;
}

export function validateReferralCode(code: string): boolean {
  if (!code) return false;
  const parts = code.toUpperCase().split('-');
  return parts[0] === 'FLOUSSI' && parts.length >= 3;
}

export const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'ref-1',
    code: 'FLOUSSI-HAMID-8219',
    friendName: 'Hamid El Idrissi',
    emailOrPhone: 'hamid.idrissi@gmail.com',
    date: '2026-06-12',
    status: 'completed',
    rewardDays: 30
  },
  {
    id: 'ref-2',
    code: 'FLOUSSI-FATIMA-3192',
    friendName: 'Fatima-Zahra Alaoui',
    emailOrPhone: '+212675920192',
    date: '2026-07-02',
    status: 'pending',
    rewardDays: 30
  },
  {
    id: 'ref-3',
    code: 'FLOUSSI-YASSIN-1122',
    friendName: 'Yassine Belkhayat',
    emailOrPhone: 'yassine.belk@gmail.com',
    date: '2026-07-10',
    status: 'pending',
    rewardDays: 30
  }
];
