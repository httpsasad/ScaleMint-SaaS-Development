import { 
  FeeConfiguration, 
  SyncLog, 
  AuditLog, 
  AutomationHealth, 
  ClientWithMetrics,
  AdminSummaryStats
} from '@/types/admin';
import { DEMO_PROFILE, DEMO_ACCOUNTS, DEMO_FUNDING_REQUESTS, DEMO_WALLET } from './demo-data';

export const DEMO_CLIENTS: ClientWithMetrics[] = [
  {
    ...DEMO_PROFILE,
    accounts_count: 4,
    active_accounts_count: 2,
    total_spend_allocated: 4770.50,
    pending_funding_count: 2,
    wallet: DEMO_WALLET
  },
  {
    id: 'demo-client-002',
    company_name: 'Nexus Ecom Direct (Demo Client)',
    contact_name: 'Samantha Li',
    email: 'samantha@nexusecom.demo',
    role: 'client_owner',
    status: 'active',
    created_at: '2026-10-12T09:00:00Z',
    updated_at: '2026-10-26T17:00:00Z',
    accounts_count: 6,
    active_accounts_count: 5,
    total_spend_allocated: 12450.00,
    pending_funding_count: 0,
    wallet: {
      id: 'wallet-demo-002',
      user_id: 'demo-client-002',
      balance: 6200.00,
      currency: 'USD',
      created_at: '2026-10-12T09:00:00Z',
      updated_at: '2026-10-27T01:00:00Z'
    }
  },
  {
    id: 'demo-client-003',
    company_name: 'Vanguard Gaming Network (Demo Client)',
    contact_name: 'David Ortiz',
    email: 'david@vanguardgaming.demo',
    role: 'client_owner',
    status: 'pending_kyc',
    created_at: '2026-10-24T14:30:00Z',
    updated_at: '2026-10-24T14:30:00Z',
    accounts_count: 2,
    active_accounts_count: 0,
    total_spend_allocated: 0.00,
    pending_funding_count: 1,
    wallet: {
      id: 'wallet-demo-003',
      user_id: 'demo-client-003',
      balance: 1500.00,
      currency: 'USD',
      created_at: '2026-10-24T14:30:00Z',
      updated_at: '2026-10-25T11:00:00Z'
    }
  },
  {
    id: 'demo-client-004',
    company_name: 'HyperScale Affiliate Desk (Demo Client)',
    contact_name: 'Elena Rostova',
    email: 'elena@hyperscale.demo',
    role: 'client_owner',
    status: 'suspended',
    created_at: '2026-09-18T10:00:00Z',
    updated_at: '2026-10-20T19:00:00Z',
    accounts_count: 3,
    active_accounts_count: 0,
    total_spend_allocated: 8900.00,
    pending_funding_count: 0,
    wallet: {
      id: 'wallet-demo-004',
      user_id: 'demo-client-004',
      balance: 0.00,
      currency: 'USD',
      created_at: '2026-09-18T10:00:00Z',
      updated_at: '2026-10-20T19:00:00Z'
    }
  }
];

export const DEMO_FEE_CONFIGS: FeeConfiguration[] = [
  {
    id: 'fee-cfg-001',
    rate_percentage: 7.50,
    fee_rate: 0.0750,
    effective_from: '2026-10-01T00:00:00Z',
    changed_by: 'owner-root-001',
    changed_by_email: 'owner@scalemint.io',
    reason: 'Initial platform standard fee configuration',
    is_active: true,
    created_at: '2026-10-01T00:00:00Z'
  },
  {
    id: 'fee-cfg-002',
    rate_percentage: 8.00,
    fee_rate: 0.0800,
    effective_from: '2026-09-01T00:00:00Z',
    changed_by: 'owner-root-001',
    changed_by_email: 'owner@scalemint.io',
    reason: 'Early alpha testing rate',
    is_active: false,
    created_at: '2026-09-01T00:00:00Z'
  }
];

export const DEMO_SYNC_LOGS: SyncLog[] = [
  {
    id: 'sync-log-001',
    account_code: 'TT-ADV-88319',
    platform: 'tiktok',
    status: 'success',
    message: 'Ad balance reconciled successfully: $850.00 USD',
    duration_ms: 142,
    created_at: '2026-10-27T23:30:00Z'
  },
  {
    id: 'sync-log-002',
    account_code: 'TT-ADV-77402',
    platform: 'tiktok',
    status: 'success',
    message: 'Ad balance reconciled successfully: $1,420.50 USD',
    duration_ms: 118,
    created_at: '2026-10-27T23:25:00Z'
  },
  {
    id: 'sync-log-003',
    account_code: 'TT-ADV-66190',
    platform: 'tiktok',
    status: 'warning',
    message: 'Account under review in Business Center; telemetry delayed',
    error_details: 'HTTP 423 Locked: Business Center Verification Pending',
    duration_ms: 310,
    created_at: '2026-10-27T22:50:00Z'
  },
  {
    id: 'sync-log-004',
    account_code: 'TT-ADV-55018',
    platform: 'tiktok',
    status: 'failed',
    message: 'Proxy connection timeout during automated scrape',
    error_details: 'Gateway timeout on residential proxy node US-CENTRAL-RES-08',
    duration_ms: 5020,
    created_at: '2026-10-27T21:10:00Z'
  }
];

export const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    actor_email: 'owner@scalemint.io',
    action: 'funding_request.approved',
    entity_type: 'funding_request',
    entity_id: 'req-demo-001',
    reason: 'Verified treasury balance availability and compliance clearance',
    metadata: { amount: 500.00, fee: 37.50, net: 462.50, target_account: 'TT-ADV-88319' },
    ip_address: '192.168.1.100',
    created_at: '2026-10-25T16:00:00Z'
  },
  {
    id: 'audit-002',
    actor_email: 'owner@scalemint.io',
    action: 'client.status_updated',
    entity_type: 'client',
    entity_id: 'demo-client-004',
    reason: 'Suspended pending KYC re-verification on repeated ad policy flags',
    metadata: { previous_status: 'active', new_status: 'suspended' },
    ip_address: '192.168.1.100',
    created_at: '2026-10-20T19:00:00Z'
  },
  {
    id: 'audit-003',
    actor_email: 'owner@scalemint.io',
    action: 'fee_configuration.updated',
    entity_type: 'fee_configuration',
    entity_id: 'fee-cfg-001',
    reason: 'Adjusted platform rate from 8.0% to 7.5% for agency volume scaling',
    metadata: { previous_rate: 8.0, new_rate: 7.5 },
    ip_address: '192.168.1.100',
    created_at: '2026-10-01T00:00:00Z'
  }
];

export const DEMO_AUTOMATION_HEALTH: AutomationHealth[] = [
  {
    id: 'srv-001',
    service_name: 'tiktok_account_sync',
    display_name: 'TikTok Business Center Balance Poller',
    status: 'simulated_dev',
    last_heartbeat: '2026-10-27T23:45:00Z',
    latency_ms: 120,
    consecutive_failures: 0,
    details: 'Simulated sandbox mode: Real-time API worker ready for live OAuth tokens',
    is_simulated: true
  },
  {
    id: 'srv-002',
    service_name: 'treasury_reconciler',
    display_name: 'Treasury & Ledger Reconciler',
    status: 'operational',
    last_heartbeat: '2026-10-27T23:46:30Z',
    latency_ms: 45,
    consecutive_failures: 0,
    details: 'PostgreSQL atomic balance verification running cleanly',
    is_simulated: false
  },
  {
    id: 'srv-003',
    service_name: 'stablecoin_watcher',
    display_name: 'Digital Asset Deposit Reconciler',
    status: 'simulated_dev',
    last_heartbeat: '2026-10-27T23:40:00Z',
    latency_ms: 210,
    consecutive_failures: 0,
    details: 'Testnet RPC event watcher active; pending production multi-sig wallet binding',
    is_simulated: true
  },
  {
    id: 'srv-004',
    service_name: 'proxy_health_monitor',
    display_name: 'Residential Proxy Subnet Monitor',
    status: 'operational',
    last_heartbeat: '2026-10-27T23:46:00Z',
    latency_ms: 85,
    consecutive_failures: 0,
    details: '14 proxy subnets operational with < 120ms roundtrip latency',
    is_simulated: false
  }
];

export const DEMO_ADMIN_STATS: AdminSummaryStats = {
  totalClients: DEMO_CLIENTS.length,
  activeClients: DEMO_CLIENTS.filter(c => c.status === 'active').length,
  totalAssignedAccounts: DEMO_ACCOUNTS.length + 8, // total fleet count
  pendingFundingRequests: DEMO_FUNDING_REQUESTS.filter(r => r.status === 'pending_review' || r.status === 'processing').length,
  totalRecordedTransactions: 28,
  totalTreasuryLiquidity: 16150.00
};
