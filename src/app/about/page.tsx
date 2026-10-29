import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ShieldCheck, Cpu, Code2, Users2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  const principles = [
    {
      title: 'Operational Transparency',
      desc: 'We never invent metrics, falsify customer counts, or create opaque billing markups. What you spend on advertising is tracked to the exact cent on an auditable ledger.',
      icon: ShieldCheck
    },
    {
      title: 'Engineering Resilience',
      desc: 'Ad platforms are volatile. We design automated fallback corridors, warm reserve accounts, and proxy hygiene so high-performing campaigns maintain momentum.',
      icon: Cpu
    },
    {
      title: 'Decoupled Financial Rails',
      desc: 'By separating credit card risk from active campaign runtimes, media buyers are shielded from random card processor security freezes.',
      icon: Code2
    },
    {
      title: 'Agency-Centric Partnership',
      desc: 'We operate as an infrastructure partner for media teams, giving them the backend tools, role permissions, and capital liquidity to handle 6 and 7-figure monthly budgets.',
      icon: Users2
    }
  ];

  return (
    <div className="py-12 bg-grid-pattern relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radial-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'About ScaleMint' }]} />
        </div>

        {/* Hero Section */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <span>Our Mission & Company</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Building the Financial Backbone for TikTok Advertising
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            ScaleMint was founded by performance engineers and media buying veterans who experienced firsthand the agony of frozen ad accounts, rejected payment cards, and fragmented cash flows.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Why We Built ScaleMint
            </h2>
            <p>
              When media teams scale daily TikTok ad spend from thousands to tens of thousands, the biggest bottleneck is rarely creative ideation—it is infrastructure. Standard commercial credit cards trigger false-positive anti-fraud triggers. Sudden account halts destroy TikTok machine-learning optimization curves.
            </p>
            <p>
              ScaleMint solves this with dedicated account provisioning, centralized treasury liquidity, and autonomous balance replenishment. We provide performance agencies with the stability usually reserved for Fortune 500 media conglomerates.
            </p>
            <div className="p-4 rounded-xl bg-[#090f1d] border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300">
                <span className="font-bold text-white">Our Commitment: </span>
                Every account provisioned through ScaleMint complies strictly with applicable platform policies and legal standards. We champion clean media buying and zero dark patterns.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#0a0f1e] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-4">
              ScaleMint Architecture Stack
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#0e1629] border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Frontend Presentation:</span>
                <span className="text-white font-bold">Next.js 16 + TypeScript</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0e1629] border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Backend API Services:</span>
                <span className="text-emerald-400 font-bold">Python FastAPI Engine</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0e1629] border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Database & Security Vault:</span>
                <span className="text-teal-300 font-bold">Supabase PostgreSQL</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0e1629] border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Network Isolation:</span>
                <span className="text-white font-bold">Dedicated Residential Subnets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guiding Principles Grid */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Our Core Operating Principles
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              The ethical and engineering standards that guide everything we ship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {principles.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#090f1d] border border-white/10 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0c1428] to-[#070b16] border border-emerald-500/30 p-8 sm:p-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Partner with ScaleMint</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mb-6">
            Experience what institutional advertising infrastructure feels like.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/open-account"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <span>Apply for Account Access</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/15 border border-white/10 transition-colors"
            >
              <span>Contact Our Leadership</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
