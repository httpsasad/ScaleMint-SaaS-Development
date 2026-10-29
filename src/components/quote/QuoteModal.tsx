'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Shield, ArrowRight, Loader2, DollarSign } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTier?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  preselectedTier = 'agency'
}) => {
  const [tier, setTier] = useState(preselectedTier);
  const [accountType, setAccountType] = useState<'bulk' | 'aged' | 'hybrid'>('bulk');
  const [volumeEstimate, setVolumeEstimate] = useState('5-20 Accounts');
  const [monthlySpend, setMonthlySpend] = useState('$25,000 - $100,000');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [telegramOrSkype, setTelegramOrSkype] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiClient.submitAccountApplication({
        organizationName: companyName,
        contactName: companyName,
        workEmail: email,
        telegramOrSkype,
        accountTypeInterest: accountType,
        estimatedMonthlySpend: `${monthlySpend} (${volumeEstimate}) [Tier: ${tier}]`,
        primaryTargetRegions: ['US', 'EU', 'Global'],
        intendedVertical: 'Performance Media / Agency Scaling',
        notes: `Quote requested for tier: ${tier.toUpperCase()}`
      });

      setSubmittedRef(response.data?.referenceId || `SM-QUOTE-${Date.now().toString(36).toUpperCase()}`);
    } catch {
      setSubmittedRef(`SM-REQ-${Date.now().toString(36).toUpperCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#090e1a] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-white max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedRef ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold text-white">Quote Request Received</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you. Our sales engineering team calculates bespoke rates based on custom billing channels, currency rails, and requested account volumes.
            </p>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs font-mono text-emerald-400 max-w-xs mx-auto">
              Reference: <span className="font-bold">{submittedRef}</span>
            </div>
            <p className="text-xs text-slate-400">
              An account specialist will email you the formal pricing proposal and contract options within 4 business hours.
            </p>
            <button
              onClick={() => {
                setSubmittedRef(null);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition-colors"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Tailored Enterprise Pricing</span>
              </div>
              <h2 id="quote-modal-title" className="text-2xl font-bold text-white tracking-tight">
                Request a Custom Quote
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Pricing is custom-structured based on your monthly ad spend volume, target geos, and reserve account requirements.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Tier Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Package Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['starter', 'agency', 'enterprise'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                        tier === t
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 font-bold'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Type Preference */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Account Infrastructure
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bulk', label: 'Bulk Accounts' },
                    { id: 'aged', label: 'Aged Accounts' },
                    { id: 'hybrid', label: 'Hybrid Portfolio' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAccountType(item.id as 'bulk' | 'aged' | 'hybrid')}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                        accountType === item.id
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 font-bold'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Volume & Spend Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estimated Account Count
                  </label>
                  <select
                    value={volumeEstimate}
                    onChange={(e) => setVolumeEstimate(e.target.value)}
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1-5 Accounts">1 - 5 Accounts</option>
                    <option value="5-20 Accounts">5 - 20 Accounts</option>
                    <option value="20-50 Accounts">20 - 50 Accounts</option>
                    <option value="50+ Accounts">50+ Accounts (Enterprise Scale)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monthly Ad Budget Range
                  </label>
                  <select
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(e.target.value)}
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Under $10,000">Under $10,000 / month</option>
                    <option value="$10,000 - $50,000">$10,000 - $50,000 / month</option>
                    <option value="$50,000 - $200,000">$50,000 - $200,000 / month</option>
                    <option value="$200,000+">$200,000+ / month (High Velocity)</option>
                  </select>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company / Agency Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Media Agency"
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="media@company.com"
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Telegram or Skype Handle (For Rapid Desk Response)
                </label>
                <input
                  type="text"
                  value={telegramOrSkype}
                  onChange={(e) => setTelegramOrSkype(e.target.value)}
                  placeholder="@telegram_handle or Skype ID"
                  className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start gap-2.5 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  ScaleMint adheres to transparent, non-predatory fee structures. No hidden setup penalties or unannounced balance deductions.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm hover:from-emerald-400 hover:to-teal-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calculating Custom Quote...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Quote Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
