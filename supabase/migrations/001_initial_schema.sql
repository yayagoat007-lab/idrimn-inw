-- Floussi - Initial Schema Migration
-- Database: Supabase PostgreSQL (auth-ready)

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =========================================================================
-- 1. PROFILES Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- references auth.users (handled via foreign key implicitly or explicitly if auth schema exists)
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    city TEXT,
    preferred_language VARCHAR(10) DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'darija')),
    currency VARCHAR(10) DEFAULT 'MAD',
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'family', 'analyse', 'elite')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 2. ACCOUNTS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('checking', 'savings', 'cash', 'investment', 'debt')),
    balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    currency VARCHAR(10) DEFAULT 'MAD' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    color VARCHAR(10) DEFAULT '#059669',
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 3. BUCKETS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS buckets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    allocated_amount NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    spent_amount NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    color VARCHAR(10) DEFAULT '#3B82F6',
    icon TEXT,
    is_essential BOOLEAN DEFAULT false NOT NULL,
    auto_allocate_percent NUMERIC(5, 2) DEFAULT 0.00 CHECK (auto_allocate_percent >= 0 AND auto_allocate_percent <= 100),
    order_index INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_buckets_updated_at BEFORE UPDATE ON buckets
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 4. TRANSACTIONS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    bucket_id UUID REFERENCES buckets(id) ON DELETE SET NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT,
    merchant TEXT,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    receipt_url TEXT,
    is_recurring BOOLEAN DEFAULT false NOT NULL,
    recurring_frequency TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 5. MONTHLY_INCOMES Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS monthly_incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    frequency VARCHAR(20) DEFAULT 'monthly' NOT NULL CHECK (frequency IN ('monthly', 'weekly', 'biweekly')),
    pay_day INT DEFAULT 1 CHECK (pay_day >= 1 AND pay_day <= 31),
    auto_allocate_rules JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_monthly_incomes_updated_at BEFORE UPDATE ON monthly_incomes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 6. GOALS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    current_amount NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    deadline DATE,
    bucket_id UUID REFERENCES buckets(id) ON DELETE SET NULL,
    color VARCHAR(10) DEFAULT '#8B5CF6',
    icon TEXT,
    auto_contribute_amount NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 7. NET_WORTH_ITEMS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS net_worth_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('asset', 'liability')),
    category TEXT NOT NULL,
    current_value NUMERIC(15, 2) NOT NULL,
    original_value NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2),
    institution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_net_worth_items_updated_at BEFORE UPDATE ON net_worth_items
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 8. TONTINES Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS tontines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    contribution_amount NUMERIC(15, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'weekly', 'biweekly')),
    total_members INT NOT NULL CHECK (total_members > 0),
    current_round INT DEFAULT 1 NOT NULL CHECK (current_round >= 1),
    start_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'paused', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_tontines_updated_at BEFORE UPDATE ON tontines
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 9. TONTINE_MEMBERS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS tontine_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tontine_id UUID NOT NULL REFERENCES tontines(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    total_contributed NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    total_received NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    position_in_queue INT CHECK (position_in_queue >= 1),
    status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'left', 'banned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE (tontine_id, user_id)
);

CREATE TRIGGER update_tontine_members_updated_at BEFORE UPDATE ON tontine_members
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 10. TONTINE_PAYMENTS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS tontine_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tontine_id UUID NOT NULL REFERENCES tontines(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES tontine_members(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    round_number INT NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'paid', 'late')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_tontine_payments_updated_at BEFORE UPDATE ON tontine_payments
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 11. MOROCCAN_EVENTS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS moroccan_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('ramadan', 'aid_al_fitr', 'aid_al_adha', 'wedding', 'birth', 'hajj', 'custom')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_allocated NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    budget_spent NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_moroccan_events_updated_at BEFORE UPDATE ON moroccan_events
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 12. THEMES Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    identifier TEXT UNIQUE NOT NULL,
    colors JSONB NOT NULL, -- schema: {primary, secondary, background, surface, text, accent}
    is_premium BOOLEAN DEFAULT false NOT NULL,
    preview_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- =========================================================================
-- 13. USER_THEMES Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS user_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT false NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_user_themes_updated_at BEFORE UPDATE ON user_themes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 14. REPORTS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('monthly', 'quarterly', 'annual', 'custom')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    pdf_url TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- =========================================================================
-- 15. EXPERT_TIPS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS expert_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    min_subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (min_subscription_tier IN ('free', 'premium', 'family', 'analyse', 'elite')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_expert_tips_updated_at BEFORE UPDATE ON expert_tips
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 16. FAMILY_GROUPS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS family_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    max_members INT DEFAULT 6 NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'family' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TRIGGER update_family_groups_updated_at BEFORE UPDATE ON family_groups
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 17. FAMILY_MEMBERS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(10) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE(family_group_id, user_id)
);

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 18. NOTIFICATIONS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('alert', 'reminder', 'tip', 'tontine', 'family')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- =========================================================================
-- 19. AD_IMPRESSIONS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS ad_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ad_unit_id TEXT NOT NULL,
    impression_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    clicked BOOLEAN DEFAULT false NOT NULL,
    revenue_share NUMERIC(10, 4) DEFAULT 0.0000 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- =========================================================================
-- 20. SUBSCRIPTION_PAYMENTS Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'MAD' NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    transaction_id TEXT UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- =========================================================================
-- TRIGGERS FOR AUTO-CALCULATING VALUES
-- =========================================================================

-- Trigger function 1: Auto-update bucket spent_amount based on transactions
CREATE OR REPLACE FUNCTION update_bucket_spent_amount()
RETURNS TRIGGER AS $$
DECLARE
    target_bucket_id UUID;
BEGIN
    -- Determine which bucket_id needs updating
    IF TG_OP = 'INSERT' THEN
        target_bucket_id := NEW.bucket_id;
    ELSIF TG_OP = 'UPDATE' THEN
        target_bucket_id := NEW.bucket_id;
        -- If bucket changed, update the old one as well
        IF OLD.bucket_id IS DISTINCT FROM NEW.bucket_id AND OLD.bucket_id IS NOT NULL THEN
            UPDATE buckets
            SET spent_amount = COALESCE((
                SELECT SUM(amount)
                FROM transactions
                WHERE bucket_id = OLD.bucket_id AND type = 'expense'
            ), 0)
            WHERE id = OLD.bucket_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        target_bucket_id := OLD.bucket_id;
    END IF;

    -- Update the specified bucket
    IF target_bucket_id IS NOT NULL THEN
        UPDATE buckets
        SET spent_amount = COALESCE((
            SELECT SUM(amount)
            FROM transactions
            WHERE bucket_id = target_bucket_id AND type = 'expense'
        ), 0)
        WHERE id = target_bucket_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_bucket_spent_calc
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE PROCEDURE update_bucket_spent_amount();


-- Trigger function 2: Auto-update goal current_amount based on transactions or goal bucket
CREATE OR REPLACE FUNCTION update_goal_current_amount()
RETURNS TRIGGER AS $$
DECLARE
    target_bucket_id UUID;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        target_bucket_id := NEW.bucket_id;
    ELSIF TG_OP = 'DELETE' THEN
        target_bucket_id := OLD.bucket_id;
    END IF;

    -- If there's a goal tied to this bucket, update the goal's current_amount
    -- For savings bucket, the balance increases, so the goal progress increases.
    -- Let's say current_amount equals total bucket allocations - total spent.
    IF target_bucket_id IS NOT NULL THEN
        UPDATE goals g
        SET current_amount = COALESCE((
            SELECT allocated_amount - spent_amount
            FROM buckets
            WHERE id = target_bucket_id
        ), 0)
        WHERE g.bucket_id = target_bucket_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goal_bucket_progress_calc
    AFTER INSERT OR UPDATE OR DELETE ON buckets
    FOR EACH ROW EXECUTE PROCEDURE update_goal_current_amount();

-- =========================================================================
-- RLS (Row Level Security) ENABLE & POLICIES
-- =========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tontines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tontine_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tontine_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE moroccan_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view and edit their own profiles."
    ON profiles FOR ALL USING (auth.uid() = id);

-- Accounts policies
CREATE POLICY "Users can manage their own accounts."
    ON accounts FOR ALL USING (user_id = auth.uid());

-- Buckets policies
CREATE POLICY "Users can manage their own buckets."
    ON buckets FOR ALL USING (user_id = auth.uid());

-- Transactions policies
CREATE POLICY "Users can manage their own transactions."
    ON transactions FOR ALL USING (user_id = auth.uid());

-- Monthly Incomes policies
CREATE POLICY "Users can manage their own monthly incomes."
    ON monthly_incomes FOR ALL USING (user_id = auth.uid());

-- Goals policies
CREATE POLICY "Users can manage their own goals."
    ON goals FOR ALL USING (user_id = auth.uid());

-- Net Worth policies
CREATE POLICY "Users can manage their own net worth items."
    ON net_worth_items FOR ALL USING (user_id = auth.uid());

-- Tontines policies
CREATE POLICY "Everyone can read tontines they are part of, only creators can update."
    ON tontines FOR SELECT USING (
        creator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tontine_members tm
            WHERE tm.tontine_id = tontines.id AND tm.user_id = auth.uid()
        )
    );
CREATE POLICY "Creators can manage tontines."
    ON tontines FOR ALL USING (creator_id = auth.uid());

-- Tontine Members policies
CREATE POLICY "Members can view other members of the same tontine."
    ON tontine_members FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tontines t
            WHERE t.id = tontine_members.tontine_id AND t.creator_id = auth.uid()
        )
    );
CREATE POLICY "Creators or users themselves can manage tontine memberships."
    ON tontine_members FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tontines t
            WHERE t.id = tontine_members.tontine_id AND t.creator_id = auth.uid()
        )
    );

-- Tontine Payments policies
CREATE POLICY "Members can read payments, creators can record."
    ON tontine_payments FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tontine_members tm
            WHERE tm.id = tontine_payments.member_id AND tm.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM tontines t
            WHERE t.id = tontine_payments.tontine_id AND t.creator_id = auth.uid()
        )
    );
CREATE POLICY "Tontine creators can record and update payments."
    ON tontine_payments FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tontines t
            WHERE t.id = tontine_payments.tontine_id AND t.creator_id = auth.uid()
        )
    );

-- Moroccan Events policies
CREATE POLICY "Users can manage their own Moroccan events."
    ON moroccan_events FOR ALL USING (user_id = auth.uid());

-- Themes policies
CREATE POLICY "Themes are readable by all users."
    ON themes FOR SELECT USING (true);

-- User Themes policies
CREATE POLICY "Users can manage their own active themes."
    ON user_themes FOR ALL USING (user_id = auth.uid());

-- Reports policies
CREATE POLICY "Users can manage their own reports."
    ON reports FOR ALL USING (user_id = auth.uid());

-- Expert Tips policies
CREATE POLICY "Expert tips are readable by all users."
    ON expert_tips FOR SELECT USING (true);

-- Family Groups policies
CREATE POLICY "Family group members can view their group."
    ON family_groups FOR SELECT USING (
        admin_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM family_members fm
            WHERE fm.family_group_id = family_groups.id AND fm.user_id = auth.uid()
        )
    );
CREATE POLICY "Only admin can manage family groups."
    ON family_groups FOR ALL USING (admin_id = auth.uid());

-- Family Members policies
CREATE POLICY "Members can view other family group members."
    ON family_members FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM family_groups fg
            WHERE fg.id = family_members.family_group_id AND fg.admin_id = auth.uid()
        )
    );
CREATE POLICY "Only family admin can manage family memberships."
    ON family_members FOR ALL USING (
        EXISTS (
            SELECT 1 FROM family_groups fg
            WHERE fg.id = family_members.family_group_id AND fg.admin_id = auth.uid()
        )
    );

-- Notifications policies
CREATE POLICY "Users can manage their own notifications."
    ON notifications FOR ALL USING (user_id = auth.uid());

-- Ad Impressions policies
CREATE POLICY "Users can view and record their own ad impressions."
    ON ad_impressions FOR ALL USING (user_id = auth.uid());

-- Subscription Payments policies
CREATE POLICY "Users can view their own payments."
    ON subscription_payments FOR SELECT USING (user_id = auth.uid());

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_buckets_user ON buckets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_bucket ON transactions(bucket_id);
CREATE INDEX IF NOT EXISTS idx_tontines_creator ON tontines(creator_id);
CREATE INDEX IF NOT EXISTS idx_tontine_members_tontine ON tontine_members(tontine_id);
CREATE INDEX IF NOT EXISTS idx_tontine_payments_member ON tontine_payments(member_id);
CREATE INDEX IF NOT EXISTS idx_moroccan_events_user ON moroccan_events(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
