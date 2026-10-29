export type UserRole = 'client_owner' | 'client_admin' | 'client_member' | 'scalemint_admin' | 'scalemint_owner';
export type UserStatus = 'active' | 'pending_kyc' | 'suspended';
export type AccountStatus = 'active' | 'under_review' | 'paused' | 'suspended';
export type FundingRequestStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed' | 'cancelled' | 'pending_review';
export type TransactionType = 'deposit' | 'funding_allocation' | 'fee_deduction' | 'refund' | 'adjustment' | 'adjustment_credit' | 'adjustment_debit';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type DepositMethod = 'bank_wire' | 'usdt_trc20' | 'usdc_erc20' | 'swift';
export type DepositStatus = 'pending' | 'confirmed' | 'failed' | 'reversed' | 'pending_confirmation' | 'rejected';
export type NotificationType = 'info' | 'success' | 'warning' | 'alert';

export interface Profile {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface AdvertisingAccount {
  id: string;
  user_id: string;
  account_id: string;
  account_name: string;
  platform: 'tiktok';
  status: AccountStatus;
  balance: number;
  currency: string;
  last_synced_at: string;
  proxy_cluster_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface FundingRequest {
  id: string;
  user_id: string;
  account_id: string;
  account_name?: string;
  requested_amount: number;
  fee_rate: number; // e.g. 0.075 (7.5%)
  fee_amount: number;
  net_amount: number;
  status: FundingRequestStatus;
  reference_notes?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  reference_id?: string;
  created_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  currency: string;
  payment_method: DepositMethod;
  status: DepositStatus;
  tx_hash_or_ref?: string;
  created_at: string;
  confirmed_at?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export interface FeeCalculation {
  requestedAmount: number;
  feeRate: number; // 0.075
  feeAmount: number;
  netAmount: number;
}
