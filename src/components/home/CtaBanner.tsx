import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Headphones, Zap } from 'lucide-react';

export const CtaBanner: React.FC = () => {
  return (
    <section className="py-20 bg-[#04060d] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-subtle pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-gradient-to-b from-[#0b1224] to-[#070b16] border border-emerald-500/30 p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl shadow-emerald-500/10">
          {/* Subtle decorative grid inside the card */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-6">
              <Zap className="w-3.5 h-3.5" />
              <span>Agency Account Allocation Open</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to scale your TikTok advertising footprint?
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join leading media teams operating with zero funding bottlenecks, isolated agency account clusters, and real-time treasury management.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/open-account"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 transition-all duration-200 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                <span>Open Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-emerald-500/40 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Headphones className="w-4 h-4 text-emerald-400" />
                <span>Talk to Sales</span>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                No Invented Lock-in Contracts
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Same-Day Account Setup
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Dedicated Account Specialist
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
