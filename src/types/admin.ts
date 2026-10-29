import { Profile, Wallet } from './dashboard';

export interface FeeConfiguration {
  id: string;
  rate_percentage: number; // e.g. 7.50
  fee_rate: number; // e.g. 0.0750
  effective_from: string;
  changed_by?: string;
  changed_by_email?: string;
  reason: string;
  is_active: boolean;
  created_at: string;
}

export interface SyncLog {
  id: string;
  account_id?: string;
  account_code?: string;
  platform: 'tiktok';
  status: 'success' | 'failed' | 'retrying' | 'warning';
  message: string;
  error_details?: string;
  duration_ms?: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface AutomationHealth {
  id: string;
  service_name: string;
  display_name: string;
  status: 'operational' | 'degraded' | 'offline' | 'simulated_dev';
  last_heartbeat: string;
  latency_ms?: number;
  consecutive_failures: number;
  details?: string;
  is_simulated: boolean;
}

export interface ClientWithMetrics extends Profile {
  wallet?: Wallet;
  accounts_count: number;
  active_accounts_count: number;
  total_spend_allocated: number;
  pending_funding_count: number;
}

export interface AdminSummaryStats {
  totalClients: number;
  activeClients: number;
  totalAssignedAccounts: number;
  pendingFundingRequests: number;
  totalRecordedTransactions: number;
  totalTreasuryLiquidity: number;
}
