import { WalletBalance, WalletMovement, P2PTransfer, BillPayment, MobileRecharge, RoundUpSettings, MicroChallenge } from '../types';

// Helper to get current user ID or fallback
export function getWalletUserId(): string {
  if (typeof window === 'undefined') return 'mock-user-id-9999';
  const userStr = localStorage.getItem('floussi_auth_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.id) return user.id;
    } catch (_) {}
  }
  return 'mock-user-id-9999';
}

// Default Balance
const DEFAULT_BALANCE = (userId: string): WalletBalance => ({
  userId,
  balance: 1500, // Starts with some free play money
  currency: 'DH',
  dailyLimit: 500,
  kycVerified: false,
  updatedAt: new Date().toISOString()
});

// DEFAULT Micro challenges
const DEFAULT_CHALLENGES = (userId: string): MicroChallenge[] => [
  {
    id: `chal-coffee-${userId}`,
    userId,
    type: 'no_coffee',
    active: false,
    savedAmount: 0,
    streakDays: 0
  },
  {
    id: `chal-taxi-${userId}`,
    userId,
    type: 'no_taxi',
    active: false,
    savedAmount: 0,
    streakDays: 0
  }
];

// Helper to check transactions
export function canTransact(
  amount: number,
  dailyTotal: number,
  kycVerified: boolean
): { allowed: boolean; reason?: string } {
  const limit = kycVerified ? 5000 : 500;
  if (amount <= 0) {
    return { allowed: false, reason: 'Le montant doit être supérieur à 0 DH.' };
  }
  if (dailyTotal + amount > limit) {
    return {
      allowed: false,
      reason: `Plafond journalier dépassé. Limite actuelle : ${limit} DH. ${
        !kycVerified ? 'Veuillez activer le "KYC" simulé dans les paramètres pour passer à 5000 DH/jour.' : ''
      }`
    };
  }
  return { allowed: true };
}

// 1. Get & Set Wallet Balance
export function getWalletBalance(userId: string): WalletBalance {
  if (typeof window === 'undefined') return DEFAULT_BALANCE(userId);
  const data = localStorage.getItem(`floussi_wallet_balance_${userId}`);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      // Ensure we have correct fields
      return {
        ...DEFAULT_BALANCE(userId),
        ...parsed,
        userId // enforce matching id
      };
    } catch (_) {}
  }
  const defaultVal = DEFAULT_BALANCE(userId);
  localStorage.setItem(`floussi_wallet_balance_${userId}`, JSON.stringify(defaultVal));
  return defaultVal;
}

export function saveWalletBalance(userId: string, balanceObj: WalletBalance) {
  if (typeof window === 'undefined') return;
  // Prevent floating point representation errors
  balanceObj.balance = Math.round(balanceObj.balance * 100) / 100;
  // Make sure limits match KYC status
  balanceObj.dailyLimit = balanceObj.kycVerified ? 5000 : 500;
  balanceObj.updatedAt = new Date().toISOString();
  localStorage.setItem(`floussi_wallet_balance_${userId}`, JSON.stringify(balanceObj));
}

// 2. Wallet Movements (History)
export function getWalletMovements(userId: string): WalletMovement[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`floussi_wallet_movements_${userId}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (_) {}
  }
  // Initialize with some dummy initial movements
  const initialMovements: WalletMovement[] = [
    {
      id: `mov-init-${userId}`,
      userId,
      type: 'add_funds',
      amount: 1500,
      description: 'Solde de bienvenue Floussi (Simulation)',
      status: 'completed',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    }
  ];
  localStorage.setItem(`floussi_wallet_movements_${userId}`, JSON.stringify(initialMovements));
  return initialMovements;
}

export function saveWalletMovements(userId: string, movements: WalletMovement[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`floussi_wallet_movements_${userId}`, JSON.stringify(movements));
}

export function addWalletMovement(userId: string, movement: Omit<WalletMovement, 'id' | 'userId' | 'createdAt'>) {
  const list = getWalletMovements(userId);
  const newMovement: WalletMovement = {
    ...movement,
    id: `mov-${Math.floor(Math.random() * 1000000)}`,
    userId,
    createdAt: new Date().toISOString()
  };
  list.unshift(newMovement);
  saveWalletMovements(userId, list);
  return newMovement;
}

// Calculate total spent today for daily limits
export function getDailySpentTotal(userId: string): number {
  const movements = getWalletMovements(userId);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const total = movements
    .filter((m) => {
      const mDate = new Date(m.createdAt);
      return (
        mDate >= startOfDay &&
        m.status === 'completed' &&
        ['transfer_out', 'bill_payment', 'recharge', 'round_up'].includes(m.type)
      );
    })
    .reduce((sum, m) => sum + m.amount, 0);
    
  return Math.round(total * 100) / 100;
}

// 3. P2P, Bills, Recharges Lists
export function getP2PTransfers(userId: string): P2PTransfer[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`floussi_p2p_transfers_${userId}`);
  return data ? JSON.parse(data) : [];
}

export function saveP2PTransfers(userId: string, transfers: P2PTransfer[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`floussi_p2p_transfers_${userId}`, JSON.stringify(transfers));
}

export function getBillPayments(userId: string): BillPayment[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`floussi_bill_payments_${userId}`);
  return data ? JSON.parse(data) : [];
}

export function saveBillPayments(userId: string, payments: BillPayment[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`floussi_bill_payments_${userId}`, JSON.stringify(payments));
}

export function getMobileRecharges(userId: string): MobileRecharge[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`floussi_mobile_recharges_${userId}`);
  return data ? JSON.parse(data) : [];
}

export function saveMobileRecharges(userId: string, recharges: MobileRecharge[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`floussi_mobile_recharges_${userId}`, JSON.stringify(recharges));
}

// 4. Round Up settings & Micro challenges
export function getRoundUpSettings(userId: string): RoundUpSettings {
  if (typeof window === 'undefined') {
    return { userId, enabled: false, threshold: 10, totalSaved: 0, targetBucketId: null };
  }
  const data = localStorage.getItem(`floussi_round_up_${userId}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (_) {}
  }
  const defaultVal: RoundUpSettings = {
    userId,
    enabled: false,
    threshold: 10,
    totalSaved: 0,
    targetBucketId: null
  };
  localStorage.setItem(`floussi_round_up_${userId}`, JSON.stringify(defaultVal));
  return defaultVal;
}

export function saveRoundUpSettings(userId: string, settings: RoundUpSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`floussi_round_up_${userId}`, JSON.stringify(settings));
}

export function getMicroChallenges(userId: string): MicroChallenge[] {
  if (typeof window === 'undefined') return DEFAULT_CHALLENGES(userId);
  const data = localStorage.getItem(`floussi_micro_challenges_${userId}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (_) {}
  }
  const defaultVal = DEFAULT_CHALLENGES(userId);
  localStorage.setItem(`floussi_micro_challenges_${userId}`, JSON.stringify(defaultVal));
  return defaultVal;
}

export function saveMicroChallenges(userId: string, challenges: MicroChallenge[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`floussi_micro_challenges_${userId}`, JSON.stringify(challenges));
}
