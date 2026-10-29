'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { QuoteModal } from '@/components/quote/QuoteModal';
import { 
  History, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Cpu
} from 'lucide-react';

export default function AgedAccountsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSeasoning, setSelectedSeasoning] = useState('3-6 Months Seasoned');
  const [geography, setGeography] = useState('Tier 1 Global (US/UK/CA)');

  const agedFeatures = [
    {
      title: 'Established Billing Resilience',
      desc: 'Seasoned accounts have completed initial warming cycles, minimizing false-positive payment friction when scaling aggressively.',
      icon: TrendingUp
    },
    {
      title: 'Higher Daily Spend Ceilings',
      desc: 'Bypass early-stage platform throttling with pre-established threshold allowances suitable for rapid campaign testing.',
      icon: Sparkles
    },
    {
      title: 'Dedicated Static IP Profiles',
      desc: 'Handover includes dedicated, non-rotating residential proxy profiles matching the account registration locale.',
      icon: Cpu
    },
    {
      title: 'Compliance-Hardened Framework',
      desc: 'All accounts undergo strict internal KYC and policy verification prior to agency allocation.',
      icon: ShieldCheck
    }
  ];

  const benefits = [
    'No restrictive $50/day new-account spending caps',
    'Pre-warmed pixel and business center linkage readiness',
    'Tested with compliant e-commerce and app-install campaigns',
    'Integrated with ScaleMint automated treasury replenishment',
    'Immediate replacement guarantee for unexpected platform errors'
  ];

  return (
    <div className="py-12 bg-grid-pattern relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radial-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Aged Accounts' }]} />
        </div>

        {/* Hero Section */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <History className="w-3.5 h-3.5" />
            <span>Seasoned Ad Infrastructure</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Aged TikTok Ad Accounts for Uninterrupted Scaling
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Eliminate new-account warmup delays and payment velocity holds. ScaleMint provides seasoned, warmed advertising accounts equipped with mature billing profiles and verified history.
          </p>
        </div>

        {/* Seasoning Selector & Quote Calculator Box */}
        <div className="mb-20 rounded-2xl bg-[#090f1d] border border-white/10 p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-white/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Seasoned Inventory Inquiry
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Select Your Aged Account Specifications
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Our seasoned account availability changes dynamically based on warming cycles. Inquire for current batch availability and tailored pricing.
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm hover:from-emerald-400 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/25 shrink-0"
            >
              <span>Request a Quote for Aged Accounts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
            <div className="p-4 rounded-xl bg-[#0e1629] border border-white/5">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Seasoning Maturity Level
              </label>
              <select
                value={selectedSeasoning}
                onChange={(e) => setSelectedSeasoning(e.target.value)}
                className="w-full bg-[#070c17] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="1-3 Months Seasoned">1 - 3 Months (Standard Warmup)</option>
                <option value="3-6 Months Seasoned">3 - 6 Months (Established Maturity)</option>
                <option value="6-12+ Months Mature">6 - 12+ Months (Enterprise Seasoned)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-2">
                Higher seasoning provides greater resilience during auction spikes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0e1629] border border-white/5">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Target Platform Region
              </label>
              <select
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
                className="w-full bg-[#070c17] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Tier 1 Global (US/UK/CA)">United States / United Kingdom / Canada</option>
                <option value="European Union (DE/FR/IT/ES)">European Union (Eurozone Rails)</option>
                <option value="Asia Pacific & Oceania (AU/SG)">Australia, Singapore & Asia Pacific</option>
                <option value="Latin America (BR/MX)">Latin America (Brazil / Mexico)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-2">
                Provisioned with matched residential proxy fingerprints.
              </p>
            </div>
          </div>

          {/* Key Advantages list */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Included with Every Aged Account Package:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          {agedFeatures.map((f, i) => {
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

        {/* Compliance & Authenticity Disclosure */}
        <div className="p-6 rounded-2xl bg-[#0d1424] border border-amber-500/30 mb-20 text-slate-300 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Compliance & Ethical Infrastructure Disclosure</span>
          </div>
          <p>
            ScaleMint strictly prohibits fraudulent activity, hijacked assets, and illicit black-hat operations. All aged ad accounts are legally initialized, verified business assets maintained in structured warming routines. We do not provide or broker unauthorized third-party credentials. Clients must adhere to TikTok Advertising Guidelines.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0c1428] to-[#070b16] border border-emerald-500/30 p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Need immediate aged account access?</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-lg mx-auto">
            Speak with an onboarding specialist to verify current inventory status and receive a formal rate card.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Request a Quote
          </button>
        </div>
      </div>

      <QuoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedTier="enterprise"
      />
    </div>
  );
}
