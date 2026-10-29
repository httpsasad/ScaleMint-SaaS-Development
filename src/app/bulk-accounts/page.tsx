'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { QuoteModal } from '@/components/quote/QuoteModal';
import { 
  Layers, 
  ShieldCheck, 
  RefreshCw, 
  Sliders, 
  ArrowRight, 
  Zap, 
  Check, 
  HelpCircle,
  Network
} from 'lucide-react';

export default function BulkAccountsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [batchSize, setBatchSize] = useState('10 Accounts');
  const [targetGeo, setTargetGeo] = useState('North America (US/CA)');
  const [monthlySpend, setMonthlySpend] = useState('$50,000 - $100,000');

  const bulkFeatures = [
    {
      title: 'Batch Account Provisioning',
      desc: 'Deploy clusters of 5 to 50+ TikTok ad accounts in synchronized batches configured with individual billing parameters.',
      icon: Layers
    },
    {
      title: 'Isolated Fingerprint Subnets',
      desc: 'Each batch is provisioned with unique residential proxy configurations to guarantee zero cross-account correlation.',
      icon: Network
    },
    {
      title: 'Simultaneous Liquidity Rebalancing',
      desc: 'Top up one master treasury balance and distribute funds dynamically across the entire batch with zero manual card inputs.',
      icon: RefreshCw
    },
    {
      title: 'Campaign Pacing Safeguards',
      desc: 'Automated threshold triggers ensure that no account pauses during peak holiday or flash-sale scaling windows.',
      icon: Zap
    }
  ];

  const faqs = [
    {
      q: 'How quickly are bulk account clusters delivered?',
      a: 'Standard bulk clusters are provisioned within 4 to 12 hours after organization review and verification.'
    },
    {
      q: 'Can our media buyers log in from different locations?',
      a: 'Yes. Each account cluster includes isolated proxy credentials and session management profiles so distributed agency teams can access accounts safely without triggering security location locks.'
    },
    {
      q: 'How does funding work across 20+ accounts?',
      a: 'ScaleMint provides a centralized treasury dashboard. You deposit capital into your main treasury wallet (via wire or crypto), and our automated allocation rules route balances to each account in seconds.'
    },
    {
      q: 'What happens if a creative triggers an ad policy flag?',
      a: 'Because our accounts operate under isolated proxy and billing profiles, a policy flag on one account does not affect other accounts in your batch. Furthermore, our Agency and Enterprise packages maintain standby warm reserves.'
    }
  ];

  return (
    <div className="py-12 bg-grid-pattern relative">
      {/* Glow highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radial-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Bulk Accounts' }]} />
        </div>

        {/* Hero Banner */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>High-Velocity Ad Infrastructure</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Bulk TikTok Ad Accounts for Growing Agencies
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Eliminate operational drag. Deploy, fund, and manage multiple isolated TikTok ad accounts through a unified treasury workflow designed for high-spend media buyers.
          </p>
        </div>

        {/* Interactive Batch Configuration & Quote Requester */}
        <div className="mb-20 rounded-2xl bg-[#090f1d] border border-white/10 p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-white/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Batch Configurator
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Estimate Your Bulk Account Deployment
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Configure your required batch size and target geographies. Every deployment is custom-tailored with transparent fees and dedicated billing rails.
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm hover:from-emerald-400 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/25 shrink-0"
            >
              <span>Request a Quote for this Batch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="p-4 rounded-xl bg-[#0e1629] border border-white/5">
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cluster Batch Size</span>
              </label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                className="w-full bg-[#070c17] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="5 Accounts">5 Accounts (Testing Batch)</option>
                <option value="10 Accounts">10 Accounts (Growth Cluster)</option>
                <option value="25 Accounts">25 Accounts (Performance Fleet)</option>
                <option value="50+ Accounts">50+ Accounts (Enterprise Scale)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-2">
                Full fingerprint isolation per container.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0e1629] border border-white/5">
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Geography / Currency</span>
              </label>
              <select
                value={targetGeo}
                onChange={(e) => setTargetGeo(e.target.value)}
                className="w-full bg-[#070c17] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="North America (US/CA)">North America (USD Billing)</option>
                <option value="Europe (UK/EU)">Europe (EUR / GBP Billing)</option>
                <option value="LATAM (BR/MX)">LATAM (Multi-Currency)</option>
                <option value="Global Multi-Region">Global Multi-Region Fleet</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-2">
                Aligned with regional compliance requirements.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0e1629] border border-white/5">
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Monthly Ad Budget Range</span>
              </label>
              <select
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(e.target.value)}
                className="w-full bg-[#070c17] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="$10,000 - $50,000">$10,000 - $50,000 / month</option>
                <option value="$50,000 - $100,000">$50,000 - $100,000 / month</option>
                <option value="$100,000 - $300,000">$100,000 - $300,000 / month</option>
                <option value="$300,000+">$300,000+ / month (High Velocity)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-2">
                Automated liquidity triggers calibrated to daily velocity.
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Includes Dedicated Account Manager & Proxy Credentials</span>
            </div>
            <div className="text-emerald-400 font-mono">
              Selected: {batchSize} &bull; {targetGeo}
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Engineered for Enterprise Volume
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              ScaleMint eliminates the manual friction of juggling dozens of isolated logins and payment cards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bulkFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#090f1d] border border-white/10 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Bulk Account Management Details
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-[#0a0f1d] border border-white/10">
                <h3 className="text-sm font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0c1428] to-[#070b16] border border-emerald-500/30 p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to order your bulk account fleet?</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-lg mx-auto">
            Our onboarding team prepares customized quotes based on your account volume and spend velocity.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Request a Bulk Quote
          </button>
        </div>
      </div>

      <QuoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedTier="agency"
      />
    </div>
  );
}
