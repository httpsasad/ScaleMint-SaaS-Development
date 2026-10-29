import { 
  Profile, 
  AdvertisingAccount, 
  Wallet, 
  FundingRequest, 
  Transaction, 
  Deposit, 
  AppNotification 
} from '@/types/dashboard';

/**
 * Clearly labeled demo data used solely for visual development
 * when Supabase is not yet connected to a live database.
 */
export const DEMO_PROFILE: Profile = {
  id: 'demo-user-001',
  company_name: 'Acme Media Labs (Demo Sandbox)',
  contact_name: 'Alex Vance',
  email: 'alex.vance@demo.scalemint.io',
  role: 'client_owner',
  status: 'active',
  created_at: '2026-10-01T12:00:00Z',
  updated_at: '2026-10-25T14:30:00Z'
};

export const DEMO_WALLET: Wallet = {
  id: 'demo-wallet-001',
  user_id: 'demo-user-001',
  balance: 2450.00,
  currency: 'USD',
  created_at: '2026-10-01T12:00:00Z',
  updated_at: '2026-10-26T18:45:00Z'
};

export const DEMO_ACCOUNTS: AdvertisingAccount[] = [
  {
    id: 'acc-demo-01',
    user_id: 'demo-user-001',
    account_id: 'TT-ADV-88319',
    account_name: 'US-Direct-Ecom-01 (Demo)',
    platform: 'tiktok',
    status: 'active',
    balance: 850.00,
    currency: 'USD',
    last_synced_at: '2026-10-27T02:15:00Z',
    proxy_cluster_id: 'US-EAST-RES-12',
    created_at: '2026-10-05T08:00:00Z',
    updated_at: '2026-10-27T02:15:00Z'
  },
  {
    id: 'acc-demo-02',
    user_id: 'demo-user-001',
    account_id: 'TT-ADV-77402',
    account_name: 'EU-App-Install-Fleet (Demo)',
    platform: 'tiktok',
    status: 'active',
    balance: 1420.50,
    currency: 'USD',
    last_synced_at: '2026-10-27T01:50:00Z',
    proxy_cluster_id: 'EU-WEST-RES-04',
    created_at: '2026-10-10T11:20:00Z',
    updated_at: '2026-10-27T01:50:00Z'
  },
  {
    id: 'acc-demo-03',
    user_id: 'demo-user-001',
    account_id: 'TT-ADV-66190',
    account_name: 'LATAM-Growth-Pilot (Demo)',
    platform: 'tiktok',
    status: 'under_review',
    balance: 0.00,
    currency: 'USD',
    last_synced_at: '2026-10-26T20:10:00Z',
    proxy_cluster_id: 'BR-SAO-RES-02',
    created_at: '2026-10-22T16:00:00Z',
    updated_at: '2026-10-26T20:10:00Z'
  },
  {
    id: 'acc-demo-04',
    user_id: 'demo-user-001',
    account_id: 'TT-ADV-55018',
    account_name: 'Global-BlackFriday-Reserve (Demo)',
    platform: 'tiktok',
    status: 'paused',
    balance: 2500.00,
    currency: 'USD',
    last_synced_at: '2026-10-26T14:30:00Z',
    proxy_cluster_id: 'US-CENTRAL-RES-08',
    created_at: '2026-10-15T09:15:00Z',
    updated_at: '2026-10-26T14:30:00Z'
  }
];

export const DEMO_FUNDING_REQUESTS: FundingRequest[] = [
  {
    id: 'req-demo-001',
    user_id: 'demo-user-001',
    account_id: 'acc-demo-01',
    account_name: 'US-Direct-Ecom-01 (Demo)',
    requested_amount: 500.00,
    fee_rate: 0.075,
    fee_amount: 37.50,
    net_amount: 462.50,
    status: 'approved',
    reference_notes: 'Mid-week budget replenishment',
    reviewed_at: '2026-10-25T16:00:00Z',
    created_at: '2026-10-25T15:20:00Z',
    updated_at: '2026-10-25T16:00:00Z'
  },
  {
    id: 'req-demo-002',
    user_id: 'demo-user-001',
    account_id: 'acc-demo-02',
    account_name: 'EU-App-Install-Fleet (Demo)',
    requested_amount: 1000.00,
    fee_rate: 0.075,
    fee_amount: 75.00,
    net_amount: 925.00,
    status: 'pending_review',
    reference_notes: 'Weekend scaling buffer',
    created_at: '2026-10-26T22:10:00Z',
    updated_at: '2026-10-26T22:10:00Z'
  },
  {
    id: 'req-demo-003',
    user_id: 'demo-user-001',
    account_id: 'acc-demo-03',
    account_name: 'LATAM-Growth-Pilot (Demo)',
    requested_amount: 250.00,
    fee_rate: 0.075,
    fee_amount: 18.75,
    net_amount: 231.25,
    status: 'processing',
    reference_notes: 'Initial test top-up',
    created_at: '2026-10-27T01:00:00Z',
    updated_at: '2026-10-27T01:30:00Z'
  }
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-demo-001',
    user_id: 'demo-user-001',
    wallet_id: 'demo-wallet-001',
    type: 'deposit',
    amount: 5000.00,
    currency: 'USD',
    status: 'completed',
    description: 'Wire Transfer Deposit #WT-99410',
    reference_id: 'WIRE-99410',
    created_at: '2026-10-20T10:15:00Z'
  },
  {
    id: 'tx-demo-002',
    user_id: 'demo-user-001',
    wallet_id: 'demo-wallet-001',
    type: 'funding_allocation',
    amount: -500.00,
    currency: 'USD',
    status: 'completed',
    description: 'Ad Account Allocation to TT-ADV-88319',
    reference_id: 'req-demo-001',
    created_at: '2026-10-25T16:00:00Z'
  },
  {
    id: 'tx-demo-003',
    user_id: 'demo-user-001',
    wallet_id: 'demo-wallet-001',
    type: 'fee_deduction',
    amount: -37.50,
    currency: 'USD',
    status: 'completed',
    description: 'Platform Allocation Fee (7.5%) for TT-ADV-88319',
    reference_id: 'req-demo-001',
    created_at: '2026-10-25T16:00:00Z'
  }
];

export const DEMO_DEPOSITS: Deposit[] = [
  {
    id: 'dep-demo-001',
    user_id: 'demo-user-001',
    wallet_id: 'demo-wallet-001',
    amount: 5000.00,
    currency: 'USD',
    payment_method: 'bank_wire',
    status: 'confirmed',
    tx_hash_or_ref: 'CHASE-WIRE-994102',
    created_at: '2026-10-20T09:00:00Z',
    confirmed_at: '2026-10-20T10:15:00Z'
  },
  {
    id: 'dep-demo-002',
    user_id: 'demo-user-001',
    wallet_id: 'demo-wallet-001',
    amount: 2500.00,
    currency: 'USD',
    payment_method: 'usdt_trc20',
    status: 'pending_confirmation',
    tx_hash_or_ref: '0x8f93...4b12c8',
    created_at: '2026-10-26T23:45:00Z'
  }
];

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-demo-001',
    user_id: 'demo-user-001',
    title: 'Funding Request Approved',
    message: 'Your funding request of $500.00 for account US-Direct-Ecom-01 has been processed.',
    type: 'success',
    read: false,
    created_at: '2026-10-25T16:05:00Z'
  },
  {
    id: 'notif-demo-002',
    user_id: 'demo-user-001',
    title: 'Sync Notice: LATAM Pilot Under Review',
    message: 'Account TT-ADV-66190 is currently undergoing standard TikTok Business Center review.',
    type: 'warning',
    read: true,
    created_at: '2026-10-26T20:15:00Z'
  }
];
