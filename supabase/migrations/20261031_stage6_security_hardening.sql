-- ==============================================================================
-- ScaleMint Stage 6: Security Hardening & Production RLS Verification
-- Implements:
--   1. Role self-escalation prevention trigger on public.profiles
--   2. Strict financial immutability policies (client wallets and ledgers)
--   3. Owner-only isolation on automation_jobs, external_refs, and reconciliations
--   4. Numeric integrity and bounds constraints
-- ==============================================================================

-- 1. PREVENT PROFILE ROLE SELF-ESCALATION
-- Ensures clients can never escalate their own role to 'scalemint_owner' or 'scalemint_admin'
CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- If role is changing, verify that the current acting user is already a verified owner/admin
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF NOT public.is_scalemint_owner_or_admin() THEN
            RAISE EXCEPTION 'Security Violation: Users cannot elevate their own platform role.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_prevent_profile_role_self_escalation ON public.profiles;
CREATE TRIGGER trigger_prevent_profile_role_self_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_role_self_escalation();

-- 2. FINANCIAL IMMUTABILITY FOR CLIENTS
-- Revoke direct table mutation permissions on wallets and ledger from anon and authenticated roles
REVOKE INSERT, UPDATE, DELETE ON public.wallets FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.wallet_ledger FROM anon, authenticated;

-- Allow authenticated users to SELECT their own wallet and ledger entries
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet"
    ON public.wallets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own ledger" ON public.wallet_ledger;
CREATE POLICY "Users can view own ledger"
    ON public.wallet_ledger FOR SELECT
    USING (auth.uid() = user_id);

-- 3. AUTOMATION & EXTERNAL PORTAL SECURITY POLICIES
-- Automation tables must be strictly invisible to standard clients
ALTER TABLE IF EXISTS public.automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.automation_job_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.external_operation_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reconciliation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integration_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage automation jobs" ON public.automation_jobs;
CREATE POLICY "Owners manage automation jobs"
    ON public.automation_jobs FOR ALL
    USING (public.is_scalemint_owner_or_admin())
    WITH CHECK (public.is_scalemint_owner_or_admin());

DROP POLICY IF EXISTS "Owners manage automation attempts" ON public.automation_job_attempts;
CREATE POLICY "Owners manage automation attempts"
    ON public.automation_job_attempts FOR ALL
    USING (public.is_scalemint_owner_or_admin())
    WITH CHECK (public.is_scalemint_owner_or_admin());

DROP POLICY IF EXISTS "Owners manage external refs" ON public.external_operation_refs;
CREATE POLICY "Owners manage external refs"
    ON public.external_operation_refs FOR ALL
    USING (public.is_scalemint_owner_or_admin())
    WITH CHECK (public.is_scalemint_owner_or_admin());

DROP POLICY IF EXISTS "Owners manage reconciliation records" ON public.reconciliation_records;
CREATE POLICY "Owners manage reconciliation records"
    ON public.reconciliation_records FOR ALL
    USING (public.is_scalemint_owner_or_admin())
    WITH CHECK (public.is_scalemint_owner_or_admin());

DROP POLICY IF EXISTS "Owners manage integration configs" ON public.integration_configs;
CREATE POLICY "Owners manage integration configs"
    ON public.integration_configs FOR ALL
    USING (public.is_scalemint_owner_or_admin())
    WITH CHECK (public.is_scalemint_owner_or_admin());

-- 4. STRICT NUMERIC CONSTRAINTS
DO $$
BEGIN
    -- Ensure wallet balance cannot be negative
    ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS wallets_balance_cents_check;
    ALTER TABLE public.wallets ADD CONSTRAINT wallets_balance_cents_check CHECK (balance_cents >= 0);

    -- Ensure funding request amounts are positive
    ALTER TABLE public.funding_requests DROP CONSTRAINT IF EXISTS funding_requests_requested_amount_cents_check;
    ALTER TABLE public.funding_requests ADD CONSTRAINT funding_requests_requested_amount_cents_check CHECK (requested_amount_cents > 0);

    -- Ensure deposits amounts are positive
    ALTER TABLE public.deposits DROP CONSTRAINT IF EXISTS deposits_amount_cents_check;
    ALTER TABLE public.deposits ADD CONSTRAINT deposits_amount_cents_check CHECK (amount_cents > 0);
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
