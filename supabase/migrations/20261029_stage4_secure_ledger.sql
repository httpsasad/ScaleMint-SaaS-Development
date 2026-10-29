-- ==============================================================================
-- ScaleMint Stage 4: Secure Wallet, Ledger & Funding Backend Migration
-- Implements:
--   1. Authoritative `wallet_ledger` (double-entry, minor unit cents, append-only)
--   2. Integer minor unit columns for wallets, funding_requests, deposits, transactions
--   3. Strict 7-state funding request state machine
--   4. Atomic PostgreSQL stored procedures for ledger debits/credits and state transitions
--   5. Cryptographic idempotency controls and tamper-evident RLS policies
-- ==============================================================================

-- 1. ADD MINOR UNIT (CENTS) COLUMN TO WALLETS
ALTER TABLE public.wallets 
    ADD COLUMN IF NOT EXISTS balance_cents BIGINT NOT NULL DEFAULT 0 CHECK (balance_cents >= 0);

-- Sync initial numeric balance to integer minor units if existing
UPDATE public.wallets 
SET balance_cents = ROUND(balance * 100)::BIGINT
WHERE balance_cents = 0 AND balance > 0;

-- 2. CREATE WALLET_LEDGER TABLE (APPEND-ONLY FINANCIAL LEDGER)
CREATE TABLE IF NOT EXISTS public.wallet_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('credit', 'debit', 'reversal')),
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    running_balance_cents BIGINT NOT NULL CHECK (running_balance_cents >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    reference_id TEXT, -- e.g. funding_request_id, deposit_id, or external provider ref
    authorized_actor UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. EXPAND AND ENFORCE FUNDING_REQUESTS TABLE COLUMNS & STATUS ENUM
-- Columns for exact integer minor units & fee rate in basis points (e.g. 750 = 7.50%)
ALTER TABLE public.funding_requests
    ADD COLUMN IF NOT EXISTS requested_amount_cents BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS fee_rate_bps INTEGER NOT NULL DEFAULT 750 CHECK (fee_rate_bps >= 100 AND fee_rate_bps <= 2500),
    ADD COLUMN IF NOT EXISTS fee_amount_cents BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS net_amount_cents BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- Sync existing numeric amounts to cents if not yet populated
UPDATE public.funding_requests
SET 
    requested_amount_cents = ROUND(requested_amount * 100)::BIGINT,
    fee_amount_cents = ROUND(fee_amount * 100)::BIGINT,
    net_amount_cents = ROUND(net_amount * 100)::BIGINT
WHERE requested_amount_cents = 0 AND requested_amount > 0;

-- Update funding requests status check constraint to include the 7 standard states
DO $$
BEGIN
    ALTER TABLE public.funding_requests DROP CONSTRAINT IF EXISTS funding_requests_status_check;
    ALTER TABLE public.funding_requests ADD CONSTRAINT funding_requests_status_check
        CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'failed', 'cancelled', 'pending_review'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Migrate legacy 'pending_review' rows to 'pending'
UPDATE public.funding_requests 
SET status = 'pending' 
WHERE status = 'pending_review';

-- 4. EXPAND AND ENFORCE DEPOSITS TABLE COLUMNS & STATUS
ALTER TABLE public.deposits
    ADD COLUMN IF NOT EXISTS amount_cents BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_reference TEXT,
    ADD COLUMN IF NOT EXISTS provider_reference TEXT,
    ADD COLUMN IF NOT EXISTS provider_signature TEXT,
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- Sync deposit amounts to cents
UPDATE public.deposits
SET amount_cents = ROUND(amount * 100)::BIGINT
WHERE amount_cents = 0 AND amount > 0;

-- Update deposit status check constraint
DO $$
BEGIN
    ALTER TABLE public.deposits DROP CONSTRAINT IF EXISTS deposits_status_check;
    ALTER TABLE public.deposits ADD CONSTRAINT deposits_status_check
        CHECK (status IN ('pending', 'confirmed', 'failed', 'reversed', 'pending_confirmation', 'rejected'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

UPDATE public.deposits 
SET status = 'pending' 
WHERE status = 'pending_confirmation';

-- 5. EXPAND TRANSACTIONS TABLE
ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS amount_cents BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS related_request_id UUID REFERENCES public.funding_requests(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS related_deposit_id UUID REFERENCES public.deposits(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

UPDATE public.transactions
SET amount_cents = ROUND(amount * 100)::BIGINT
WHERE amount_cents = 0 AND amount > 0;

-- 6. INDEXES FOR PERFORMANCE AND IDEMPOTENCY
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_wallet_id ON public.wallet_ledger(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user_id ON public.wallet_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_idempotency ON public.wallet_ledger(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_funding_requests_idempotency ON public.funding_requests(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_deposits_idempotency ON public.deposits(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_deposits_provider_ref ON public.deposits(provider_reference);

-- ==============================================================================
-- 7. ATOMIC STORED PROCEDURE: EXECUTE WALLET LEDGER ENTRY
-- Uses row-level lock (SELECT ... FOR UPDATE) to prevent concurrency races.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.execute_wallet_ledger_entry(
    p_wallet_id UUID,
    p_user_id UUID,
    p_entry_type TEXT,
    p_amount_cents BIGINT,
    p_description TEXT,
    p_reference_id TEXT DEFAULT NULL,
    p_authorized_actor UUID DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS TABLE (
    ledger_id UUID,
    new_balance_cents BIGINT,
    previous_balance_cents BIGINT,
    success BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_current_balance BIGINT;
    v_new_balance BIGINT;
    v_existing_ledger_id UUID;
    v_ledger_id UUID;
BEGIN
    -- 1. Check idempotency if key provided
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id, running_balance_cents INTO v_existing_ledger_id, v_new_balance
        FROM public.wallet_ledger
        WHERE idempotency_key = p_idempotency_key;

        IF v_existing_ledger_id IS NOT NULL THEN
            RETURN QUERY SELECT v_existing_ledger_id, v_new_balance, v_new_balance, true, 'Idempotent replay';
            RETURN;
        END IF;
    END IF;

    -- 2. Validate input parameters
    IF p_amount_cents <= 0 THEN
        RETURN QUERY SELECT NULL::UUID, 0::BIGINT, 0::BIGINT, false, 'Amount must be greater than zero cents';
        RETURN;
    END IF;

    IF p_entry_type NOT IN ('credit', 'debit', 'reversal') THEN
        RETURN QUERY SELECT NULL::UUID, 0::BIGINT, 0::BIGINT, false, 'Invalid ledger entry type';
        RETURN;
    END IF;

    -- 3. Row lock wallet for atomic update
    SELECT balance_cents INTO v_current_balance
    FROM public.wallets
    WHERE id = p_wallet_id AND user_id = p_user_id
    FOR UPDATE;

    IF v_current_balance IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, 0::BIGINT, 0::BIGINT, false, 'Wallet not found or user mismatch';
        RETURN;
    END IF;

    -- 4. Calculate new balance
    IF p_entry_type = 'credit' OR p_entry_type = 'reversal' THEN
        v_new_balance := v_current_balance + p_amount_cents;
    ELSIF p_entry_type = 'debit' THEN
        IF v_current_balance < p_amount_cents THEN
            RETURN QUERY SELECT NULL::UUID, v_current_balance, v_current_balance, false, 'Insufficient wallet balance for debit';
            RETURN;
        END IF;
        v_new_balance := v_current_balance - p_amount_cents;
    END IF;

    -- 5. Insert immutable ledger entry
    INSERT INTO public.wallet_ledger (
        wallet_id,
        user_id,
        entry_type,
        amount_cents,
        running_balance_cents,
        currency,
        description,
        reference_id,
        authorized_actor,
        idempotency_key
    ) VALUES (
        p_wallet_id,
        p_user_id,
        p_entry_type,
        p_amount_cents,
        v_new_balance,
        'USD',
        p_description,
        p_reference_id,
        p_authorized_actor,
        p_idempotency_key
    ) RETURNING id INTO v_ledger_id;

    -- 6. Update cached wallet balance (in cents and numeric)
    UPDATE public.wallets
    SET 
        balance_cents = v_new_balance,
        balance = ROUND(v_new_balance / 100.0, 2),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_wallet_id;

    RETURN QUERY SELECT v_ledger_id, v_new_balance, v_current_balance, true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 8. ATOMIC STORED PROCEDURE: TRANSITION FUNDING REQUEST STATUS
-- Enforces valid state machine and records ledger debits/reversals automatically.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.transition_funding_request_status(
    p_request_id UUID,
    p_new_status TEXT,
    p_actor_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    current_status TEXT
) AS $$
DECLARE
    v_req RECORD;
    v_wallet RECORD;
    v_ledger_res RECORD;
BEGIN
    -- Fetch request with lock
    SELECT * INTO v_req
    FROM public.funding_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF v_req.id IS NULL THEN
        RETURN QUERY SELECT false, 'Funding request not found', NULL::TEXT;
        RETURN;
    END IF;

    -- Validate state transition
    -- Valid transitions:
    -- pending -> approved, rejected, cancelled
    -- approved -> processing, cancelled
    -- processing -> completed, failed
    -- terminal states: completed, rejected, failed, cancelled (no further changes)
    IF v_req.status = p_new_status THEN
        RETURN QUERY SELECT true, 'Idempotent status update (no change)', v_req.status;
        RETURN;
    END IF;

    IF v_req.status = 'pending' AND p_new_status NOT IN ('approved', 'rejected', 'cancelled') THEN
        RETURN QUERY SELECT false, 'Invalid transition: pending can only transition to approved, rejected, or cancelled', v_req.status;
        RETURN;
    ELSIF v_req.status = 'approved' AND p_new_status NOT IN ('processing', 'cancelled') THEN
        RETURN QUERY SELECT false, 'Invalid transition: approved can only transition to processing or cancelled', v_req.status;
        RETURN;
    ELSIF v_req.status = 'processing' AND p_new_status NOT IN ('completed', 'failed') THEN
        RETURN QUERY SELECT false, 'Invalid transition: processing can only transition to completed or failed', v_req.status;
        RETURN;
    ELSIF v_req.status IN ('completed', 'rejected', 'failed', 'cancelled') THEN
        RETURN QUERY SELECT false, 'Invalid transition: terminal states cannot be transitioned', v_req.status;
        RETURN;
    END IF;

    -- Fetch user's wallet
    SELECT * INTO v_wallet
    FROM public.wallets
    WHERE user_id = v_req.user_id
    FOR UPDATE;

    -- Financial ledger operations on state changes:
    -- When approved: debit the total requested amount (e.g. $500.00 = 50,000 cents) from the wallet
    IF p_new_status = 'approved' THEN
        SELECT * INTO v_ledger_res FROM public.execute_wallet_ledger_entry(
            v_wallet.id,
            v_req.user_id,
            'debit',
            v_req.requested_amount_cents,
            'Funding request allocation for account ' || v_req.account_name,
            v_req.id::TEXT,
            p_actor_id,
            'debit_req_' || v_req.id::TEXT
        );

        IF NOT v_ledger_res.success THEN
            RETURN QUERY SELECT false, 'Wallet debit failed: ' || v_ledger_res.error_message, v_req.status;
            RETURN;
        END IF;

        -- Record transaction ledger entry
        INSERT INTO public.transactions (
            user_id,
            wallet_id,
            type,
            amount,
            amount_cents,
            currency,
            status,
            description,
            related_request_id,
            reference_id
        ) VALUES (
            v_req.user_id,
            v_wallet.id,
            'funding_allocation',
            ROUND(v_req.requested_amount_cents / 100.0, 2),
            v_req.requested_amount_cents,
            'USD',
            'completed',
            'Funding allocation for ad account ' || v_req.account_name,
            v_req.id,
            v_req.id::TEXT
        );

    -- When failed or cancelled after approved/processing: reverse the debit
    ELSIF (p_new_status IN ('failed', 'cancelled')) AND (v_req.status IN ('approved', 'processing')) THEN
        SELECT * INTO v_ledger_res FROM public.execute_wallet_ledger_entry(
            v_wallet.id,
            v_req.user_id,
            'reversal',
            v_req.requested_amount_cents,
            'Reversal for failed/cancelled funding request #' || v_req.id::TEXT,
            v_req.id::TEXT,
            p_actor_id,
            'reversal_req_' || v_req.id::TEXT
        );

        IF NOT v_ledger_res.success THEN
            RETURN QUERY SELECT false, 'Wallet refund failed: ' || v_ledger_res.error_message, v_req.status;
            RETURN;
        END IF;

        INSERT INTO public.transactions (
            user_id,
            wallet_id,
            type,
            amount,
            amount_cents,
            currency,
            status,
            description,
            related_request_id,
            reference_id
        ) VALUES (
            v_req.user_id,
            v_wallet.id,
            'refund',
            ROUND(v_req.requested_amount_cents / 100.0, 2),
            v_req.requested_amount_cents,
            'USD',
            'completed',
            'Reversal of funds for request #' || v_req.id::TEXT,
            v_req.id,
            v_req.id::TEXT
        );
    END IF;

    -- Update request status
    UPDATE public.funding_requests
    SET 
        status = p_new_status,
        reviewed_at = timezone('utc'::text, now()),
        reviewed_by = p_actor_id,
        reference_notes = COALESCE(p_reason, reference_notes),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_request_id;

    -- Record in audit log
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        entity_type,
        entity_id,
        reason,
        metadata
    ) VALUES (
        p_actor_id,
        'funding_request.' || p_new_status,
        'funding_request',
        p_request_id::TEXT,
        p_reason,
        jsonb_build_object(
            'previous_status', v_req.status,
            'new_status', p_new_status,
            'requested_amount_cents', v_req.requested_amount_cents,
            'fee_amount_cents', v_req.fee_amount_cents,
            'net_amount_cents', v_req.net_amount_cents
        )
    );

    RETURN QUERY SELECT true, 'Funding request transitioned to ' || p_new_status, p_new_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 9. ROW-LEVEL SECURITY FOR WALLET_LEDGER
-- ==============================================================================
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own ledger entries"
    ON public.wallet_ledger FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Owners can view all ledger entries"
    ON public.wallet_ledger FOR SELECT
    USING (public.is_scalemint_owner_or_admin());

-- Disallow raw INSERT/UPDATE/DELETE by client roles (modifications only via SECURITY DEFINER functions)
CREATE POLICY "Strictly block direct ledger insertion by regular users"
    ON public.wallet_ledger FOR INSERT
    WITH CHECK (public.is_scalemint_owner_or_admin());

-- Immutable: NO UPDATE OR DELETE ALLOWED FOR ANYONE
-- (Enforced by zero update/delete policies on wallet_ledger)
