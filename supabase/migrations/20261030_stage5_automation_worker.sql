-- ==============================================================================
-- ScaleMint Stage 5: External Portal Integration & Automation Worker Migration
-- Tables: integration_configs, automation_jobs, automation_job_attempts,
--         external_operation_refs, reconciliation_records
-- ==============================================================================

-- 1. INTEGRATION CONFIGURATIONS TABLE
-- Stores mode (mock vs live), masked credential references, and portal status
CREATE TABLE IF NOT EXISTS public.integration_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_id TEXT NOT NULL UNIQUE, -- e.g. 'tiktok_marketing_api'
    platform_name TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('mock', 'live')) DEFAULT 'mock',
    status TEXT NOT NULL CHECK (status IN ('active', 'degraded', 'disabled')) DEFAULT 'active',
    api_endpoint TEXT NOT NULL DEFAULT 'https://business-api.tiktok.com/open_api/v1.3/',
    client_id_masked TEXT, -- e.g. '7391****4912'
    credential_reference_key TEXT, -- Encrypted vault pointer or env reference (NEVER plaintext)
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 600,
    last_health_check_at TIMESTAMPTZ,
    last_error TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default TikTok integration config in 'mock' mode (clearly labeled simulated sandbox)
INSERT INTO public.integration_configs (platform_id, platform_name, mode, status, client_id_masked, credential_reference_key)
VALUES (
    'tiktok_marketing_api',
    'TikTok Marketing API (Business Center)',
    'mock',
    'active',
    'TT-BC-8931****9912',
    'ENV_TIKTOK_APP_SECRET_VAULT'
) ON CONFLICT (platform_id) DO NOTHING;

-- 2. AUTOMATION JOBS QUEUE
-- Manages background orchestration for sync, funding, verification, and retries
CREATE TABLE IF NOT EXISTS public.automation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type TEXT NOT NULL CHECK (job_type IN ('account_sync', 'funding_processing', 'funding_verification', 'transaction_reconciliation', 'failed_job_retry')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'requires_reconciliation')) DEFAULT 'pending',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    related_account_id UUID REFERENCES public.advertising_accounts(id) ON DELETE SET NULL,
    related_request_id UUID REFERENCES public.funding_requests(id) ON DELETE SET NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMPTZ,
    last_error_message TEXT,
    last_error_category TEXT, -- 'api_timeout', 'rate_limit', 'auth_expired', 'invalid_response', 'network_error'
    is_retry_eligible BOOLEAN NOT NULL DEFAULT true,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 3. AUTOMATION JOB ATTEMPTS
-- Detailed execution traces for every job attempt with latency and error reports
CREATE TABLE IF NOT EXISTS public.automation_job_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.automation_jobs(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'retrying')),
    error_message TEXT,
    error_category TEXT,
    execution_duration_ms INTEGER,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    finished_at TIMESTAMPTZ
);

-- 4. EXTERNAL OPERATION REFERENCES
-- Binds internal funding requests to verified external portal transaction hashes
CREATE TABLE IF NOT EXISTS public.external_operation_refs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_request_id UUID NOT NULL REFERENCES public.funding_requests(id) ON DELETE CASCADE,
    portal_name TEXT NOT NULL DEFAULT 'tiktok',
    external_reference TEXT NOT NULL,
    external_status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'confirmed', 'rejected', 'pending_confirmation'
    idempotency_key TEXT UNIQUE,
    raw_response_hash TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. RECONCILIATION RECORDS
-- Owner-level discrepancy records requiring human verification or adjustment
CREATE TABLE IF NOT EXISTS public.reconciliation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    related_request_id UUID REFERENCES public.funding_requests(id) ON DELETE SET NULL,
    related_job_id UUID REFERENCES public.automation_jobs(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    discrepancy_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('unresolved', 'reconciled', 'dismissed')) DEFAULT 'unresolved',
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

-- 6. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_automation_jobs_status ON public.automation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_type ON public.automation_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_next_retry ON public.automation_jobs(next_retry_at) WHERE status = 'failed' AND is_retry_eligible = true;
CREATE INDEX IF NOT EXISTS idx_automation_jobs_req ON public.automation_jobs(related_request_id);
CREATE INDEX IF NOT EXISTS idx_automation_job_attempts_job ON public.automation_job_attempts(job_id);
CREATE INDEX IF NOT EXISTS idx_external_ops_request ON public.external_operation_refs(internal_request_id);
CREATE INDEX IF NOT EXISTS idx_external_ops_ref ON public.external_operation_refs(external_reference);
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON public.reconciliation_records(status);

-- 7. ROW-LEVEL SECURITY POLICIES
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_job_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_operation_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_records ENABLE ROW LEVEL SECURITY;

-- Integration Configurations: Owner only
CREATE POLICY "Owners can view integration configs"
    ON public.integration_configs FOR SELECT
    USING (public.is_scalemint_owner_or_admin());

CREATE POLICY "Owners can update integration configs"
    ON public.integration_configs FOR ALL
    USING (public.is_scalemint_owner_or_admin())
    WITH CHECK (public.is_scalemint_owner_or_admin());

-- Automation Jobs: Owner full control, clients read-only on their own jobs
CREATE POLICY "Owners can manage all automation jobs"
    ON public.automation_jobs FOR ALL
    USING (public.is_scalemint_owner_or_admin())
    WITH CHECK (public.is_scalemint_owner_or_admin());

CREATE POLICY "Clients can view their own funding jobs"
    ON public.automation_jobs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.funding_requests fr
            WHERE fr.id = related_request_id AND fr.user_id = auth.uid()
        )
    );

-- Job Attempts: Owner only
CREATE POLICY "Owners can view job attempts"
    ON public.automation_job_attempts FOR SELECT
    USING (public.is_scalemint_owner_or_admin());

-- External Operation Refs: Owner full control, clients read own
CREATE POLICY "Owners can manage external operation refs"
    ON public.external_operation_refs FOR ALL
    USING (public.is_scalemint_owner_or_admin())
    WITH CHECK (public.is_scalemint_owner_or_admin());

CREATE POLICY "Clients can view external refs for own requests"
    ON public.external_operation_refs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.funding_requests fr
            WHERE fr.id = internal_request_id AND fr.user_id = auth.uid()
        )
    );

-- Reconciliation Records: Owner only
CREATE POLICY "Owners can manage reconciliation records"
    ON public.reconciliation_records FOR ALL
    USING (public.is_scalemint_owner_or_admin())
    WITH CHECK (public.is_scalemint_owner_or_admin());
