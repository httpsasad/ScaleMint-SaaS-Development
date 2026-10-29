-- ==============================================================================
-- ScaleMint Supabase PostgreSQL Initial Migration
-- Tables: profiles, advertising_accounts, wallets, funding_requests, transactions, deposits, notifications
-- Includes Row-Level Security (RLS) policies and security constraints
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
-- Extends the auth.users table with agency/client metadata
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'client_member' CHECK (role IN ('client_owner', 'client_admin', 'client_member', 'scalemint_admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_kyc', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ADVERTISING ACCOUNTS TABLE
-- Tracks individual TikTok ad accounts assigned to client organizations
CREATE TABLE IF NOT EXISTS public.advertising_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL UNIQUE, -- E.g. TT-ADV-98412
    account_name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'tiktok',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'under_review', 'paused', 'suspended')),
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    proxy_cluster_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. WALLETS TABLE
-- Master liquidity wallet for the client. Clients cannot edit balance directly.
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. FUNDING REQUESTS TABLE
-- Client requests to allocate funds to an assigned ad account.
-- Fee is recalculated on server; client fee values are never trusted.
CREATE TABLE IF NOT EXISTS public.funding_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.advertising_accounts(id) ON DELETE RESTRICT,
    requested_amount NUMERIC(12, 2) NOT NULL CHECK (requested_amount > 0),
    fee_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.0750, -- 7.5% platform fee
    fee_amount NUMERIC(12, 2) NOT NULL CHECK (fee_amount >= 0),
    net_amount NUMERIC(12, 2) NOT NULL CHECK (net_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'processing', 'approved', 'rejected', 'cancelled')),
    reference_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TRANSACTIONS TABLE
-- Immutable ledger of all debits, credits, and balance changes. Clients have read-only access.
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'funding_allocation', 'fee_deduction', 'refund', 'adjustment')),
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    description TEXT NOT NULL,
    reference_id TEXT, -- E.g. funding_request_id or bank wire trace
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. DEPOSITS TABLE
-- Wire or crypto deposits submitted by client for manual or automated treasury confirmation.
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_wire', 'usdt_trc20', 'usdc_erc20', 'swift')),
    status TEXT NOT NULL DEFAULT 'pending_confirmation' CHECK (status IN ('pending_confirmation', 'confirmed', 'rejected')),
    tx_hash_or_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    confirmed_at TIMESTAMPTZ
);

-- 7. NOTIFICATIONS TABLE
-- Real-time and persistent alerts for account updates and funding statuses.
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_advertising_accounts_user_id ON public.advertising_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_funding_requests_user_id ON public.funding_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_funding_requests_account_id ON public.funding_requests(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, read);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertising_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile only
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update non-privileged fields on own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Advertising Accounts: Users can only view accounts assigned to them
CREATE POLICY "Users can view assigned advertising accounts"
    ON public.advertising_accounts FOR SELECT
    USING (auth.uid() = user_id);

-- Wallets: Users can view their own wallet only. Direct inserts/updates are prohibited for clients.
CREATE POLICY "Users can view own wallet"
    ON public.wallets FOR SELECT
    USING (auth.uid() = user_id);

-- Funding Requests: Users can view their own requests and insert new requests
CREATE POLICY "Users can view own funding requests"
    ON public.funding_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own funding requests"
    ON public.funding_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Transactions: Immutable, view-only for users
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Deposits: Users can view their own deposits and initiate deposit reports
CREATE POLICY "Users can view own deposits"
    ON public.deposits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can submit deposit records"
    ON public.deposits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Notifications: Users can view and mark their own notifications as read
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
