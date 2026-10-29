'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScaleMintLogo } from './Logo';
import { Shield, Lock, Activity, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const currentYear = 2026;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#04060c] border-t border-white/10 text-slate-400 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <ScaleMintLogo size="md" />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              ScaleMint delivers enterprise ad account management and automated funding workflows designed for high-velocity agencies and performance media buyers.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Infrastructure API Ready
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
                <Shield className="w-3 h-3 text-slate-400" />
                Isolated Tenancy
              </span>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Solutions
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/bulk-accounts" className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1">
                  Bulk Ad Accounts
                </Link>
              </li>
              <li>
                <Link href="/aged-accounts" className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1">
                  Aged Seasoned Accounts
                </Link>
              </li>
              <li>
                <Link href="/why-scalemint" className="hover:text-emerald-400 transition-colors">
                  Why ScaleMint
                </Link>
              </li>
              <li>
                <Link href="/open-account" className="hover:text-emerald-400 transition-colors">
                  Agency Onboarding
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Platform & Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Talk to Sales
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Client Portal
                </Link>
              </li>
              <li>
                <a
                  href="#workflow"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  Funding Architecture
                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Governance & Trust Column */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Governance
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero-Trust Credential Vault</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Audit Trail Event Logging</span>
              </li>
              <li className="text-xs text-slate-500 pt-1">
                Custom quotes calculated based on requested tier, currency routing, and volume.
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Policy Disclaimer */}
        <div className="pt-8 border-t border-white/5 text-xs text-slate-400 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p>
              &copy; {currentYear} ScaleMint Technologies. All rights reserved. Professional advertising account orchestration and treasury management.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/contact" className="hover:text-slate-300 transition-colors">
                Support
              </Link>
              <Link href="/about" className="hover:text-slate-300 transition-colors">
                Compliance Disclosures
              </Link>
              <Link href="/contact" className="hover:text-slate-300 transition-colors">
                Security Policy
              </Link>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Disclaimer: ScaleMint is an independent advertising software platform and managed infrastructure provider. TikTok and ByteDance are registered trademarks of their respective owners. ScaleMint does not claim direct affiliation or endorsement by platform owners and strictly requires clients to comply with all applicable advertising policies and terms of service.
          </p>
        </div>
      </div>
    </footer>
  );
};
