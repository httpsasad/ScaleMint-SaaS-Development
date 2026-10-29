'use client';

import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, Sparkles, Building2 } from 'lucide-react';
import { QuoteModal } from '@/components/quote/QuoteModal';

export const PricingSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'starter' | 'agency' | 'enterprise'>('agency');

  const handleOpenQuote = (tier: 'starter' | 'agency' | 'enterprise') => {
    setSelectedTier(tier);
    setModalOpen(true);
  };

  const tiers = [
    {
      id: 'starter' as const,
      name: 'Starter',
      badge: 'Agencies & Media Teams',
      summary: 'Ideal for scaling teams entering high-volume TikTok ad operations with dedicated accounts.',
      icon: Zap,
      popular: false,
      features: [
        'Dedicated isolated ad account provisioning',
        'Multi-currency balance support (USD, EUR, GBP)',
        'Automated top-up threshold alerts',
        'Standard residential proxy environment',
        'Standard agency review queue',
        'Centralized replenishment ledger',
      ],
      customQuoteNote: 'Custom rate based on monthly volume & spend'
    },
    {
      id: 'agency' as const,
      name: 'Agency',
      badge: 'Most Popular',
      summary: 'Engineered for high-spend growth marketing agencies managing multiple brands simultaneously.',
      icon: Sparkles,
      popular: true,
      features: [
        'Batch account allocation (Bulk & Aged)',
        'Zero-latency automated balance rebalancing',
        'Pre-warmed reserve accounts on standby',
        'Multi-seat team RBAC & permission gates',
        'Dedicated account manager & priority Telegram desk',
        'Custom webhook telemetry & spend reporting',
        'Priority incident replacement guarantee'
      ],
      customQuoteNote: 'Tailored fee model aligned with agency scale'
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      badge: 'Large Scale Operations',
      summary: 'Custom infrastructure for global conglomerates, trading desks, and 8-figure monthly spenders.',
      icon: Building2,
      popular: false,
      features: [
        'Bespoke multi-geography account farm architecture',
        'Dedicated high-limit billing corridors & banking rails',
        'Private proxy subnet isolation',
        'Custom Python FastAPI & REST webhook integrations',
        '24/7 dedicated engineering and compliance incident squad',
        'Custom SLAs and institutional billing arrangements',
        'Comprehensive audit logs & security reviews'
      ],
      customQuoteNote: 'Institutional contract with SLA guarantee'
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-[#060913] relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Honest, Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Flexible Tiers for Every Stage of Scale
          </h2>
          <p className="text-slate-400 mt-4 text-sm sm:text-base leading-relaxed">
            Every business has distinct spend velocity, target geos, and account requirements. We provide tailored, transparent fee structures with zero surprise charges.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                  tier.popular
                    ? 'bg-[#0c1326] border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 lg:-translate-y-2'
                    : 'bg-[#090e1d] border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Popular Pill */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-full shadow-md shadow-emerald-500/30">
                    {tier.badge}
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{tier.badge}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed min-h-[36px] mb-6">
                    {tier.summary}
                  </p>

                  {/* Pricing Display: STRICTLY displaying "Request a Quote" instead of invented numbers */}
                  <div className="py-4 px-4 rounded-xl bg-white/5 border border-white/5 mb-6 text-center">
                    <div className="text-2xl font-black text-white tracking-tight">
                      Request a Quote
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium mt-1">
                      {tier.customQuoteNote}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      What&apos;s Included:
                    </p>
                    <ul className="space-y-2.5">
                      {tier.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Button */}
                <div className="p-6 sm:p-8 pt-0">
                  <button
                    onClick={() => handleOpenQuote(tier.id)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/25'
                        : 'bg-white/10 text-white hover:bg-white/15 border border-white/10 hover:border-emerald-500/40'
                    }`}
                  >
                    <span>Request a Quote</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    No credit card required to request consultation
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quote Modal */}
      <QuoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedTier={selectedTier}
      />
    </section>
  );
};
