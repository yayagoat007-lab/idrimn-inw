export type SubscriptionTier = 'free' | 'premium' | 'family' | 'analyse' | 'elite';
export type AccountType = 'checking' | 'savings' | 'cash' | 'investment' | 'debt';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type FrequencyType = 'monthly' | 'weekly' | 'biweekly';
export type TontineStatus = 'active' | 'paused' | 'completed';
export type TontineMemberStatus = 'active' | 'left' | 'banned';
export type TontinePaymentStatus = 'pending' | 'paid' | 'late';
export type MoroccanEventType = 'ramadan' | 'aid_al_fitr' | 'aid_al_adha' | 'mawlid' | 'hijri_new_year' | 'wedding' | 'birth' | 'hajj' | 'custom';
export type FamilyRole = 'admin' | 'member' | 'viewer';
export type NotificationType = 'alert' | 'reminder' | 'tip' | 'tontine' | 'family';
export type ReportType = 'monthly' | 'quarterly' | 'annual' | 'custom';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  preferred_language: 'fr' | 'darija';
  currency: 'MAD';
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  is_active: boolean;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Bucket {
  id: string;
  user_id: string;
  name: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  color: string;
  icon: string;
  is_essential: boolean;
  auto_allocate_percent: number;
  order_index: number;
  parent_id?: string | null;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  bucket_id: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  merchant: string | null;
  category: string;
  tags: string[];
  receipt_url: string | null;
  is_recurring: boolean;
  recurring_frequency: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyIncome {
  id: string;
  user_id: string;
  source: string;
  amount: number;
  frequency: FrequencyType;
  pay_day: number;
  auto_allocate_rules: Record<string, number>; // bucket_id -> percentage
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  bucket_id: string | null;
  color: string;
  icon: string;
  auto_contribute_amount: number;
  created_at: string;
  updated_at: string;
}

export interface NetWorthItem {
  id: string;
  user_id: string;
  name: string;
  type: 'asset' | 'liability';
  category: string;
  current_value: number;
  original_value: number;
  interest_rate: number | null;
  institution: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tontine {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  contribution_amount: number;
  frequency: FrequencyType;
  total_members: number;
  current_round: number;
  start_date: string;
  status: TontineStatus;
  created_at: string;
  updated_at: string;
}

export interface TontineMember {
  id: string;
  tontine_id: string;
  user_id: string;
  joined_at: string;
  total_contributed: number;
  total_received: number;
  position_in_queue: number;
  status: TontineMemberStatus;
  created_at: string;
  updated_at: string;
}

export interface TontinePayment {
  id: string;
  tontine_id: string;
  member_id: string;
  amount: number;
  round_number: number;
  payment_date: string;
  status: TontinePaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface MoroccanEvent {
  id: string;
  user_id: string;
  name: string;
  type: MoroccanEventType;
  start_date: string;
  end_date: string;
  budget_allocated: number;
  budget_spent: number;
  notes: string | null;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
}

export interface Theme {
  id: string;
  name: string;
  identifier: string;
  colors: ThemeColors;
  is_premium: boolean;
  preview_image_url: string | null;
  created_at: string;
}

export interface UserTheme {
  id: string;
  user_id: string;
  theme_id: string;
  is_active: boolean;
  purchased_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  type: ReportType;
  period_start: string;
  period_end: string;
  data: Record<string, any>;
  pdf_url: string | null;
  generated_at: string;
  created_at: string;
}

export interface ExpertTip {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  min_subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  admin_id: string;
  max_members: number;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_group_id: string;
  user_id: string;
  role: FamilyRole;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface AdImpression {
  id: string;
  user_id: string;
  ad_unit_id: string;
  impression_date: string;
  clicked: boolean;
  revenue_share: number;
  created_at: string;
}

export interface SubscriptionPayment {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  paid_at: string;
  expires_at: string;
  created_at: string;
}

export interface WalletBalance {
  userId: string;
  balance: number;
  currency: string;
  dailyLimit: number;
  kycVerified: boolean;
  updatedAt: string;
}

export interface WalletMovement {
  id: string;
  userId: string;
  type: 'add_funds' | 'transfer_out' | 'transfer_in' | 'bill_payment' | 'recharge' | 'round_up';
  amount: number;
  description: string;
  status: 'completed' | 'failed' | 'pending';
  createdAt: string;
}

export interface P2PTransfer {
  id: string;
  fromUserId: string;
  toUserId?: string;
  toPhone: string;
  amount: number;
  note: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export type BillProvider = 'ONEE' | 'RADEEMA' | 'AMENDIS' | 'IAM' | 'INWI' | 'Orange' | 'Lydec' | 'Redal';

export interface BillPayment {
  id: string;
  userId: string;
  provider: BillProvider;
  accountReference: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paidAt: string;
}

export type MobileOperator = 'IAM' | 'INWI' | 'Orange';

export interface MobileRecharge {
  id: string;
  userId: string;
  operator: MobileOperator;
  phoneNumber: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface RoundUpSettings {
  userId: string;
  enabled: boolean;
  threshold: 5 | 10 | 20 | 50;
  totalSaved: number;
  targetBucketId: string | null;
}

export interface MicroChallenge {
  id: string;
  userId: string;
  type: 'no_coffee' | 'no_taxi' | 'custom';
  active: boolean;
  savedAmount: number;
  streakDays: number;
}

export interface CommunityPost {
  id: string;
  authorAlias: string;
  authorCity: string;
  content: string;
  type: 'achievement' | 'tip' | 'question';
  relatedGoalName?: string;
  reactions: Record<string, number>;
  commentsCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorAlias: string;
  content: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'savings' | 'no_spend' | 'ocr_scan';
  targetValue: number;
  startDate: string;
  endDate: string;
  participantsCount: number;
  xpReward?: number;
}

export interface ChallengeParticipation {
  userId: string;
  challengeId: string;
  currentValue: number;
  joinedAt: string;
  completed: boolean;
}

export interface SavingsGroup {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  memberIds: string[];
  createdBy: string;
}

export interface GroupContribution {
  groupId: string;
  userId: string;
  amount: number;
  date: string;
}

export interface PartnerOffer {
  id: string;
  partnerName: string;
  title: string;
  description: string;
  promoCode: string;
  discountValue: string;
  category: string;
  imageUrl?: string;
  logoUrl?: string;
  linkUrl: string;
  isFeatured?: boolean;
}


