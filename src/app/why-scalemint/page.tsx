import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { 
  XCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Coins 
} from 'lucide-react';

export default function WhyScaleMintPage() {
  const comparisonData = [
    {
      criterion: 'Account Provisioning',
      adhoc: 'Fragmented manual setups with high risk of initial profile ban.',
      scalemint: 'Pre-isolated enterprise containers with dedicated residential proxy pairing.'
    },
    {
      criterion: 'Balance Replenishment',
      adhoc: 'Manual credit card swipes causing frequent card processor blocks and campaign stalls.',
      scalemint: 'Central multi-currency treasury with autonomous top-up thresholds.'
    },
    {
      criterion: 'Credential Security',
      adhoc: 'Shared plaintext passwords in spreadsheets with zero access tracking.',
      scalemint: 'Encrypted Role-Based Access Control (RBAC); media buyers never see raw payment cards.'
    },
    {
      criterion: 'Incident Recovery',
      adhoc: 'Capital trapped for weeks in flagged accounts while waiting on customer support.',
      scalemint: 'Standby warm reserve accounts ready for instant traffic redirection; instant balance rebalancing.'
    },
    {
      criterion: 'Currency Flexibility',
      adhoc: 'Heavy forex exchange markups and bank cross-border transaction fees.',
      scalemint: 'Direct multi-currency rails (USD, EUR, GBP) with zero hidden currency penalty spreads.'
    },
    {
      criterion: 'Spend Telemetry',
      adhoc: 'Messy manual receipts, delayed exports, and missing client invoices.',
      scalemint: 'Audit-ready itemized ledger with penny-precision exports and webhook support.'
    }
  ];

  return (
    <div className="py-12 bg-grid-pattern relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radial-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Why ScaleMint' }]} />
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>The ScaleMint Advantage</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Why Leading Media Teams Choose ScaleMint
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            In media buying, operational latency kills profitability. Compare traditional ad-hoc account operations with ScaleMint&apos;s institutional advertising infrastructure.
          </p>
        </div>

        {/* Architectural Comparison Matrix */}
        <div className="mb-20 rounded-2xl bg-[#090f1d] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Direct Architectural Comparison
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              How our dedicated platform protects cash flow, campaign momentum, and team efficiency.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#0e1629] text-xs font-bold uppercase tracking-wider text-slate-300">
                  <th className="py-4 px-6">Operational Vector</th>
                  <th className="py-4 px-6 text-rose-400/90 bg-rose-950/10">Ad-Hoc Manual Management</th>
                  <th className="py-4 px-6 text-emerald-400 bg-emerald-950/20">ScaleMint Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">
                      {row.criterion}
                    </td>
                    <td className="py-4 px-6 text-slate-400 bg-rose-950/5">
                      <div className="flex items-start gap-2.5">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{row.adhoc}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-200 bg-emerald-950/10 font-medium">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{row.scalemint}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deep Dive Pillars */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Engineered with Institutional Standards
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Our core infrastructure pillars are built to withstand high spend volatility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#090f1d] border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Capital Liquidity Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We bridge international banking rails, payment corridors, and advertising billing systems so your media spend is continuously liquid and ready to deploy.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090f1d] border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero-Trust Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access tokens, proxy networks, and billing credentials are fully partitioned. Media buyers perform work in secure environments with strictly governed rights.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090f1d] border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero Platform Halts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When ad sets are converting at maximum return, balance exhaustion is inexcusable. Automated top-up thresholds preserve your winning campaign trajectories.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0c1428] to-[#070b16] border border-emerald-500/30 p-8 sm:p-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Upgrade Your Agency Ad Operations Today</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
            Stop losing thousands in halted auctions and fragmented payment management.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/open-account"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <span>Open an Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/15 border border-white/10 transition-colors"
            >
              <span>Schedule Architecture Review</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
