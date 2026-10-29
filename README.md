# ScaleMint &bull; Enterprise Ad Operations, Client Dashboard & Automated Treasury

ScaleMint is an enterprise-grade SaaS platform engineered for advertising account orchestration, financial ledger integrity, and automated funding workflows, designed specifically for high-velocity agencies, performance media buyers, and affiliate growth teams managing TikTok advertising at scale.

---

## 🚀 Key Platform Capabilities

- **Client Dashboard Console:** Responsive agency console with deep navy, warm off-white, and electric mint styling.
- **Owner Command Center:** High-privilege management portal for cross-client liquidity monitoring, client provisioning, fee configuration, and manual audit reviews.
- **Double-Entry Financial Ledger:** Minor-unit integer cents (`BIGINT`) accounting with immutable transaction logs, atomic debits/credits, and Half-Up rounding for 7.5% platform fees.
- **Controlled 7-State Funding Lifecycle:** Deterministic state machine (`pending` &rarr; `approved` &rarr; `processing` &rarr; `completed` / `rejected` / `failed` / `cancelled`) strictly forbidding unconfirmed external allocations.
- **External Portal Integration Adapter:** Pluggable adapter architecture with default **Mock Mode** (simulated with explicit tags) and production-ready **TikTok Marketing API v1.3** integration.
- **Background Automation Worker:** Daemon and cron-compatible job processor featuring exponential backoff retries ($1000 \times 2^{\text{attempt}}\,\text{ms}$, capped at 5 minutes) and quarantine queues for reconciliation.
- **Enterprise Team RBAC & Supabase Auth:** Multi-tenant PostgreSQL Row-Level Security (RLS) preventing client data leakage and blocking unauthorized privilege escalation.
- **Production Health & Security Hardening:** Comprehensive health check endpoint (`/api/health`), HTTP security headers (CSP, HSTS, X-Frame-Options), and webhook HMAC-SHA256 signature verification.

---

## 🎨 Design System & Aesthetics

- **Color Palette:**
  - **Backgrounds:** Deep Navy & Near-Black (`#04060d`, `#060913`, `#070b16`, `#090f1d`, `#0b1120`)
  - **Panels & Cards:** Glassmorphic slate-navy with subtle borders (`rgba(255, 255, 255, 0.08)`)
  - **Accents:** Electric Mint Green (`#10B981`, `#00F5A0`, `#34D399`)
  - **Typography:** High-readability sans-serif (Inter via Google Fonts)
- **Branding:** Original geometric vector emblem featuring faceted scaling prisms and an interlocking growth core.
- **Interactive Polish:** Subtle ambient glows, grid backgrounds, responsive drawers, and polished hover states.

---

## 🗺️ Application Routes & Sitemap

### Public Marketing Pages
| Route | Page Name | Description |
|---|---|---|
| `/` | **Home** | Sticky nav, hero section ("Manage TikTok Ad Accounts at Scale"), breadcrumbs, trust strip, 3 pricing tiers, 4-step workflow, Why ScaleMint grid, and CTA banner. |
| `/bulk-accounts` | **Bulk Accounts** | Batch provisioning specifications, interactive volume & geo estimator, batch quote modal trigger, and deployment FAQs. |
| `/aged-accounts` | **Aged Accounts** | Seasoned account inventory breakdown, warmup maturity levels, compliance disclosures, and custom quote inquiry. |
| `/why-scalemint` | **Why ScaleMint** | Side-by-side architectural comparison table, liquidity engine breakdown, and security pillars. |
| `/about` | **About** | Company mission, engineering standards, decoupled financial rail philosophy, and full-stack technical roadmap. |
| `/contact` | **Contact** | Talk to Sales form with field validation, dedicated Telegram desk information, and SLA guarantees (&lt; 4 business hours). |
| `/login` | **Client Login** | Agency portal sign-in interface supporting Supabase Auth, Magic Links, and Enterprise SSO with sandbox preview access. |
| `/signup` | **Agency Sign Up** | Client registration creating user credentials and initial organization profile. |
| `/open-account` | **Open Account** | Full agency onboarding application capturing organization profile, ad spend tier, and account requirements. |

### Authenticated Client Dashboard (`/dashboard/*`)
| Route | Page Name | Description |
|---|---|---|
| `/dashboard` | **Overview** | Available treasury balance, total assigned accounts, pending requests count, ledger events, and real-time activity stream. |
| `/dashboard/accounts` | **Advertising Accounts** | Assigned TikTok ad accounts with live balances, status, and proxy cluster IDs. |
| `/dashboard/wallet` | **Wallet & Treasury** | Central liquidity pool, multi-currency balances, and wire/stablecoin deposit instructions. |
| `/dashboard/funding-requests` | **Funding Requests** | Account selector, amount input with real-time 7.5% fee preview, server-verified submission, and status log. |
| `/dashboard/transactions` | **Transactions** | Immutable audit ledger of all deposits, allocations, and fee deductions with CSV export. |
| `/dashboard/deposits` | **Deposit History** | History of wire transfers and on-chain stablecoin deposits with inbound notification modal. |
| `/dashboard/notifications` | **Notifications** | In-app notification center for account compliance alerts, sync notices, and funding approvals. |
| `/dashboard/settings` | **Settings** | Organization details, profile metadata, RLS status, and webhook configuration. |

### Authenticated Owner Command Center (`/admin/*`)
| Route | Page Name | Description |
|---|---|---|
| `/admin` | **Overview** | Platform-wide master liquidity stats, active client counts, and recent synchronization events. |
| `/admin/clients` | **Clients** | Master client directory with status controls (active, suspended, pending KYC) and spend tiers. |
| `/admin/accounts` | **Advertising Accounts** | Global ad account fleet manager with status, proxy tags, and assignment tools. |
| `/admin/funding-requests` | **Funding Requests** | Privileged queue to approve, reject, or process funding requests with fee snapshots. |
| `/admin/wallets` | **Wallets** | Real-time liquidity monitor across all client wallets. |
| `/admin/transactions` | **Transactions** | Complete double-entry platform ledger with cryptographic reference checks. |
| `/admin/deposits` | **Deposits** | Bank wire and crypto deposit verification console with manual reconciliation modal. |
| `/admin/fee-settings` | **Fee Settings** | Platform fee rate configuration (default 7.50%) with audit trail. |
| `/admin/automation-status` | **Automation Status** | Integration health, worker job queue monitor, funding pipeline, and discrepancy reconciliation. |
| `/admin/sync-logs` | **Sync Logs** | Real-time ad account telemetry and external API sync history. |
| `/admin/audit-logs` | **Audit Logs** | Immutable security log recording every administrative action. |
| `/admin/settings` | **Settings** | Global system configuration, proxy clusters, and platform master controls. |

### API & Webhook Endpoints
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/health` | `GET` | Public | System uptime, database connectivity, integration mode, and service health. |
| `/api/wallet` | `GET` | Authenticated | Retrieves caller's wallet balance and ledger summary. |
| `/api/funding-requests` | `GET, POST` | Authenticated | Lists or creates authoritative funding requests with server-side 7.5% fee calculation. |
| `/api/funding-requests/[id]/review` | `POST` | Owner Only | Transition funding request state (`approved`, `rejected`, `processing`, `completed`). |
| `/api/deposits` | `GET, POST` | Authenticated | Lists or records inbound client deposits. |
| `/api/deposits/[id]/reconcile` | `POST` | Owner Only | Reconciles and credits verified deposits to client wallet. |
| `/api/transactions` | `GET` | Authenticated | Queries client's immutable transaction ledger entries. |
| `/api/automation/status` | `GET` | Authenticated | Returns portal adapter health, integration mode, and background queue metrics. |
| `/api/automation/test-connection` | `POST` | Owner Only | Runs live connection diagnostic against external portal. |
| `/api/automation/sync-account` | `POST` | Owner Only | Dispatches immediate balance sync job for an external ad account. |
| `/api/automation/worker/run` | `POST` | Internal / Owner | Executes one batch cycle of pending and retry-eligible jobs. |
| `/api/webhooks/deposits` | `POST` | External Provider | Ingests deposit confirmations validated by HMAC-SHA256 signature. |

---

## 🛠️ Complete Production Deployment Guide

Follow this guide to deploy ScaleMint to production.

### 1. Prerequisites
- **Node.js**: `v20.x` or higher (tested with `v24.16.0`)
- **Package Manager**: npm `v10.x` or higher
- **Supabase Project**: Production PostgreSQL instance with Supabase Auth enabled ([supabase.com](https://supabase.com))
- **Hosting Platform**: Vercel (recommended for Next.js 16), AWS ECS, or standard Node.js server
- **TikTok Developer Portal Access** (Optional): Only required when switching from `mock` to `live` mode

---

### 2. Local Development Setup
```bash
# 1. Clone repository
git clone https://github.com/your-org/scalemint.git
cd scalemint

# 2. Install dependencies
npm install

# 3. Create local environment configuration
cp .env.example .env.local

# 4. Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

### 3. Environment Variable Configuration

Configure separate values for Development and Production:

```env
# -----------------------------------------------------------------------------
# Public Application Configuration
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SITE_URL=https://app.scalemint.io
NEXT_PUBLIC_APP_ENV=production

# -----------------------------------------------------------------------------
# Supabase PostgreSQL & Auth (Required)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres

# -----------------------------------------------------------------------------
# Automation Worker & Integration Mode (Required)
# -----------------------------------------------------------------------------
# Set to 'mock' for sandbox/testing or 'live' for real TikTok API
INTEGRATION_MODE=mock

# Background Worker Settings
WORKER_POLL_INTERVAL_MS=5000
WORKER_BATCH_SIZE=10
WORKER_MAX_RETRIES=5
WORKER_AUTH_TOKEN=generate-a-strong-32-char-random-token

# -----------------------------------------------------------------------------
# Server-Side Secrets & Webhook Verification (Required in Production)
# -----------------------------------------------------------------------------
SECRETS_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
DEPOSIT_WEBHOOK_SECRET=your-inbound-payment-webhook-signing-secret

# -----------------------------------------------------------------------------
# External Advertising Portal: TikTok Marketing API (Optional: Live Mode Only)
# -----------------------------------------------------------------------------
TIKTOK_API_ENDPOINT=https://business-api.tiktok.com/open_api/v1.3
TIKTOK_APP_ID=your-tiktok-app-id
TIKTOK_APP_SECRET=your-tiktok-app-secret
TIKTOK_ACCESS_TOKEN=your-tiktok-oauth-access-token
TIKTOK_BUSINESS_CENTER_ID=your-tiktok-business-center-id
```

> [!WARNING]
> Never commit `.env.local` or any production secrets to source control. In production platforms like Vercel, inject these through the platform Environment Variables console.

---

### 4. Supabase Project Setup & Database Migrations

Apply the migrations in sequential order using the Supabase SQL Editor or Supabase CLI:

```bash
# Apply migrations sequentially:
1. supabase/migrations/20261027_initial_schema.sql             # Core tables & initial RLS
2. supabase/migrations/20261028_admin_schema.sql               # Owner console, audit logs, fee settings
3. supabase/migrations/20261029_stage4_secure_ledger.sql       # Minor-unit cents ledger & 7-state machine
4. supabase/migrations/20261030_stage5_automation_worker.sql   # Automation jobs, external refs, reconciliation
5. supabase/migrations/20261031_stage6_security_hardening.sql  # Role self-escalation trigger & RLS lockdown
```

---

### 5. Authentication & Owner Account Provisioning

1. Have the platform administrator sign up normally via `/signup` using their corporate email (e.g. `owner@scalemint.io`).
2. Promote the user account to `scalemint_owner` directly in the Supabase SQL Editor using service-role privileges:
```sql
UPDATE public.profiles
SET role = 'scalemint_owner', status = 'active'
WHERE email = 'owner@scalemint.io';
```
3. Once promoted, the user gains unrestricted access to the Owner Command Center (`/admin/*`). The database trigger `trigger_prevent_profile_role_self_escalation` prevents regular clients from executing this update on their own.

---

### 6. Frontend Deployment (Vercel)

1. Connect your Git repository to [Vercel](https://vercel.com).
2. Configure Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Add all production environment variables from Step 3.
4. Deploy the project. The build compiles all 42 routes with Turbopack and static optimization.

---

### 7. Background Worker & Queue Deployment

The automation worker processes pending account synchronizations, funding dispatch jobs, and retries. Deploy using one of two methods:

#### Option A: Dedicated Server Process (Recommended for high volume)
Run the worker daemon alongside the application using a process manager such as PM2:
```bash
npm run worker
```
Or with PM2:
```bash
pm2 start "npm run worker" --name "scalemint-worker"
```

#### Option B: Scheduled Serverless Cron (Vercel Cron / GitHub Actions)
Trigger the worker batch execution endpoint every minute:
```bash
curl -X POST https://app.scalemint.io/api/automation/worker/run \
  -H "Authorization: Bearer <WORKER_AUTH_TOKEN>"
```

---

### 8. External Portal Integration Configuration

ScaleMint ships with a fully functional **Mock Adapter** for development and automated testing:

- **Mock Mode (`INTEGRATION_MODE=mock`)**:
  - All balance retrievals and funding operations are simulated.
  - Transparent simulation tags (`isSimulated: true`, `[Simulated Sandbox]`) are stamped on all records.
  - Safe for demos, staging environments, and integration tests.

- **Live Mode (`INTEGRATION_MODE=live`)**:
  - Requires approved TikTok Developer credentials.
  - Connects to TikTok Marketing API v1.3 endpoints.
  - Token secrets are kept server-side and never exposed to clients.

---

### 9. Testing & Smoke Checks

Run the automated test suite covering financial precision, automation workers, and security audits:

```bash
# Run all 43 automated tests
npm test

# Run code style & linting checks (0 errors, 0 warnings)
npm run lint

# Run production build validation (42 routes)
npm run build
```

Verify system health via the production endpoint:
```bash
curl https://app.scalemint.io/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": { "status": "connected", "mode": "live_supabase" },
    "integration": { "mode": "mock", "name": "TikTok Marketing API (Simulated Sandbox)" },
    "financialLedger": { "precision": "integer_minor_units_cents", "defaultFeeRateBps": 750 }
  }
}
```

---

### 10. Monitoring, Backups, Troubleshooting & Rollback

- **Health Monitoring**: Monitor `/api/health` with your uptime provider (e.g. BetterStack, Datadog).
- **Database Backups**: Supabase automatically creates daily point-in-time recovery (PITR) backups. For manual backup before major migrations:
  ```bash
  supabase db dump -f scalemint_backup_$(date +%Y%m%d).sql
  ```
- **Discrepancy Quarantine**: If external portal API calls return unknown status codes or network timeouts, the worker automatically routes records to `reconciliation_records` visible on `/admin/automation-status` for owner inspection.
- **Rollback Procedure**:
  - **Application**: Roll back to the previous deployment commit in Vercel with zero downtime.
  - **Database**: Restore point-in-time snapshot via Supabase dashboard or re-apply reverse migration SQL.

---

## 🔒 Security Best Practices Implemented

1. **Integer Minor Units**: Balances and transactions are stored as integer cents (`BIGINT`), completely eliminating floating-point rounding drift.
2. **Server-Side Fee Calculations**: Platform fee of 7.5% ($500 &rarr; $37.50 fee, $462.50 net) is calculated strictly on the server with deterministic Half-Up rounding.
3. **Double-Entry Ledger**: Master treasury and client wallet balances are backed by an append-only ledger (`wallet_ledger`).
4. **Owner-Only Privilege Enforcement**: Administrative actions, fee updates, and funding reviews require explicit `scalemint_owner` or `scalemint_admin` roles checked server-side.
5. **Anti-Escalation Database Triggers**: Postgres trigger `trigger_prevent_profile_role_self_escalation` strictly forbids clients from updating their own role column.
6. **HMAC-SHA256 Webhooks**: Inbound payment notifications must match authentic HMAC cryptographic signatures with timing-safe comparisons.
7. **Production Secret Redaction**: Portal API tokens, service keys, and database passwords are never logged, exposed in client bundles, or returned in error responses.
