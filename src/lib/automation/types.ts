/**
 * ScaleMint Automation & External Portal Integration Types
 */

export type IntegrationMode = 'mock' | 'live';

export type AutomationJobType = 
  | 'account_sync'
  | 'funding_processing'
  | 'funding_verification'
  | 'transaction_reconciliation'
  | 'failed_job_retry';

export type AutomationJobStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'requires_reconciliation';

export type AutomationErrorCategory = 
  | 'api_timeout'
  | 'rate_limit'
  | 'auth_expired'
  | 'connection_failure'
  | 'network_error'
  | 'invalid_response'
  | 'insufficient_funds'
  | 'account_not_found'
  | 'unknown_external_status'
  | 'reconciliation_mismatch';

export interface ConnectionHealthResult {
  connected: boolean;
  mode: IntegrationMode;
  portalName: string;
  latencyMs: number;
  message: string;
  isSimulated: boolean;
  timestamp: string;
}

export interface AccountSyncResult {
  success: boolean;
  accountId: string;
  externalAccountId: string;
  accountName: string;
  status: 'active' | 'under_review' | 'paused' | 'suspended';
  balanceCents: number;
  balanceDollars: number;
  currency: string;
  syncedAt: string;
  isSimulated: boolean;
  error?: string;
  errorCategory?: AutomationErrorCategory;
}

export interface FundingOperationPayload {
  internalRequestId: string;
  accountId: string;
  externalAccountId: string;
  amountCents: number;
  amountDollars: number;
  currency: string;
  idempotencyKey: string;
}

export interface FundingOperationResult {
  success: boolean;
  internalRequestId: string;
  externalReference: string;
  externalStatus: 'submitted' | 'processing' | 'confirmed' | 'rejected' | 'unknown';
  message: string;
  isSimulated: boolean;
  confirmedAt?: string;
  error?: string;
  errorCategory?: AutomationErrorCategory;
}

export interface ExternalStatusResult {
  externalReference: string;
  status: 'confirmed' | 'processing' | 'rejected' | 'not_found' | 'unknown';
  settledAmountCents?: number;
  settledCurrency?: string;
  confirmedAt?: string;
  reconciliationRequired?: boolean;
  isSimulated: boolean;
  error?: string;
}

/**
 * Standard Portal Adapter Interface
 * All external ad network implementations (TikTok Marketing API, Meta Ads, Google Ads)
 * must conform to this contract.
 */
export interface PortalAdapter {
  readonly mode: IntegrationMode;
  readonly portalName: string;

  /** Validate external connection and API token health */
  validateConnection(): Promise<ConnectionHealthResult>;

  /** Retrieve account details from external platform */
  getAccountInfo(externalAccountId: string): Promise<AccountSyncResult>;

  /** Retrieve verified external account balance */
  getAccountBalance(externalAccountId: string): Promise<{
    externalAccountId: string;
    balanceCents: number;
    balanceDollars: number;
    currency: string;
    isSimulated: boolean;
  }>;

  /** Submit an authorized funding allocation to the external portal */
  submitFundingOperation(payload: FundingOperationPayload): Promise<FundingOperationResult>;

  /** Query external portal for transaction verification */
  getFundingOperationStatus(externalReference: string): Promise<ExternalStatusResult>;

  /** Reconcile external transaction reference against banking or ad ledger */
  reconcileExternalTransaction(externalReference: string): Promise<{
    reconciled: boolean;
    discrepancyCents: number;
    details: string;
  }>;
}

export interface AutomationJobRecord {
  id: string;
  job_type: AutomationJobType;
  status: AutomationJobStatus;
  payload: Record<string, unknown>;
  related_account_id?: string;
  related_request_id?: string;
  attempt_count: number;
  max_attempts: number;
  next_retry_at?: string;
  last_error_message?: string;
  last_error_category?: AutomationErrorCategory;
  is_retry_eligible: boolean;
  idempotency_key?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}
