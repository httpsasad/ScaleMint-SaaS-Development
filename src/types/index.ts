export type AccountType = 'bulk' | 'aged' | 'enterprise';

export type BudgetTier = 
  | 'under-10k'
  | '10k-50k'
  | '50k-200k'
  | '200k-plus'
  | 'custom';

export interface PricingTier {
  id: 'starter' | 'agency' | 'enterprise';
  name: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  targetAudience: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface WorkflowStep {
  step: string;
  title: string;
  summary: string;
  detail: string;
  badge: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  tag?: string;
}

export interface OpenAccountRequest {
  organizationName: string;
  contactName: string;
  workEmail: string;
  telegramOrSkype?: string;
  accountTypeInterest: 'bulk' | 'aged' | 'hybrid';
  estimatedMonthlySpend: string;
  primaryTargetRegions: string[];
  intendedVertical: string;
  notes?: string;
}

export interface ContactInquiry {
  fullName: string;
  email: string;
  companyName: string;
  inquiryType: 'sales' | 'support' | 'partnership' | 'billing';
  message: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
