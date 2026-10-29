'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Layers, RefreshCw, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-6 pb-20 md:pt-10 md:pb-28 overflow-hidden bg-grid-pattern">
      {/* Background ambient mint radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-radial-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb section on hero as requested */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Agency Platform' },
              { label: 'TikTok Ad Account Operations' }
            ]}
          />
        </div>

        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Automated Capital Allocation & High-Velocity Ad Infrastructure</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </div>

        {/* Heading & Subheading */}
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Manage TikTok Ad Accounts{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
              at Scale
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
            Eliminate billing freezes, account suspensions, and fragmented manual top-ups. ScaleMint provides agency-grade TikTok ad accounts, automated funding workflows, and resilient reserve infrastructure.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/open-account"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 transition-all duration-200 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5"
          >
            <span>Open Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-white/15 hover:border-emerald-500/40 transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>Talk to Sales</span>
          </Link>

          <div className="flex items-center gap-4 text-xs text-slate-400 pl-1 sm:pl-3">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Isolated Billing Profiles
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Automated Balance Top-Ups
            </span>
          </div>
        </div>

        {/* High-Fidelity Platform Architecture Dashboard Preview */}
        <div className="mt-14 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent rounded-2xl blur-xl opacity-70 pointer-events-none" />

          <div className="relative rounded-2xl bg-[#0a0f1d] border border-white/10 shadow-2xl overflow-hidden">
            {/* Window Top Bar */}
            <div className="px-4 py-3 bg-[#060913] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">scalemint.internal // unified-tiktok-orchestrator</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-Liquidity Engine: ACTIVE
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Isolated Tenancy
                </span>
              </div>
            </div>

            {/* Dashboard Content Interior */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Header metrics bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0e1629] p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-400">Allocated Ad Accounts</div>
                  <div className="text-xl font-bold text-white mt-1 flex items-center justify-between">
                    <span>18 Active</span>
                    <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      +4 Queued
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Multi-region TikTok Business Centers</div>
                </div>

                <div className="bg-[#0e1629] p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-400">Central Liquidity Pool</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center justify-between">
                    <span>Multi-Currency</span>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">USD, EUR, GBP auto-converted rails</div>
                </div>

                <div className="bg-[#0e1629] p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-400">Auto Top-Up Thresholds</div>
                  <div className="text-xl font-bold text-white mt-1 flex items-center justify-between">
                    <span>Active Guards</span>
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Zero pause when spend spikes</div>
                </div>

                <div className="bg-[#0e1629] p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-400">Profile Isolation</div>
                  <div className="text-xl font-bold text-teal-300 mt-1 flex items-center justify-between">
                    <span>100% Partitioned</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Dedicated residential proxy fingerprints</div>
                </div>
              </div>

              {/* Mock accounts table preview */}
              <div className="bg-[#0e1629] rounded-xl border border-white/5 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">Live Ad Account Orchestration Stream</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Real-time sync</span>
                </div>

                <div className="divide-y divide-white/5 text-xs">
                  {[
                    { name: 'US-Ecom-Scale-01', type: 'Aged Enterprise', status: 'Healthy', balance: 'Auto-Refill On', region: 'North America (US)' },
                    { name: 'EU-Performance-04', type: 'Bulk Tier A', status: 'Healthy', balance: 'Auto-Refill On', region: 'Europe (DE/UK/FR)' },
                    { name: 'LATAM-Growth-09', type: 'Aged Seasoned', status: 'Active Guard', balance: 'Scheduled', region: 'LATAM (BR/MX)' },
                  ].map((row, i) => (
                    <div key={i} className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div>
                          <div className="font-semibold text-slate-100">{row.name}</div>
                          <div className="text-[11px] text-slate-400">{row.region}</div>
                        </div>
                      </div>
                      <div className="text-slate-300">{row.type}</div>
                      <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-mono border border-emerald-500/20">
                        {row.balance}
                      </div>
                      <div className="text-slate-400 text-[11px]">Audit: Verified Profile</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
