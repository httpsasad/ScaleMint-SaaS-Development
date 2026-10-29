import React from 'react';
import { Layers, Wallet, Rocket, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Provision & Isolate',
      tag: 'Step 1: Setup',
      icon: Layers,
      summary: 'Tailored account onboarding with hardened fingerprint isolation.',
      details: 'Select between high-volume bulk accounts or seasoned aged infrastructure. Each account is partitioned with residential proxy proxies to avoid cross-profile bans.'
    },
    {
      num: '02',
      title: 'Fund Central Treasury',
      tag: 'Step 2: Liquidity',
      icon: Wallet,
      summary: 'Deposit funds into a unified multi-currency wallet with instant ledger confirmation.',
      details: 'Top up in USD, EUR, or GBP via wire or crypto rails. Zero fragmentation—your capital is pooled in one central treasury ready for dynamic distribution.'
    },
    {
      num: '03',
      title: 'Automated Balance Top-Ups',
      tag: 'Step 3: Execution',
      icon: Rocket,
      summary: 'Smart threshold rules automatically replenish active ad balances as campaigns spend.',
      details: 'Define custom rules (e.g. "top up $2,000 whenever balance drops below $500"). Campaigns never halt mid-scale, preserving TikTok algorithm momentum.'
    },
    {
      num: '04',
      title: 'Monitor & Rebalance',
      tag: 'Step 4: Scale',
      icon: BarChart3,
      summary: 'Audit-grade spend logs and instant capital redeployment across accounts.',
      details: 'If an ad account reaches daily pacing limits, remaining liquidity immediately redirects to backup reserve accounts with zero trapped balances.'
    }
  ];

  return (
    <section id="workflow" className="py-20 bg-[#050812] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
            The ScaleMint Engine
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Four Steps to Seamless Ad Operations
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            From initial account provisioning to autonomous balance replenishment, see how our workflow eliminates friction for performance media teams.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-[#090f1e] p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Step number badge & icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-slate-700 group-hover:text-emerald-400/50 transition-colors">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mb-2">
                    {step.tag}
                  </span>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-300 font-medium mb-3">
                    {step.summary}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.details}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="w-6 h-6 rounded-full bg-[#060913] border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Flow highlight bar */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">Need a custom workflow integration?</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Our engineering team can configure custom webhook triggers and ERP reconciliation for agency pipelines.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shrink-0"
          >
            <span>Consult an Ad Ops Engineer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
