import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Globe2, 
  Users, 
  LifeBuoy, 
  FileText, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

export const WhySection: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'Autonomous Balance Replenishment',
      description: 'Never lose auction momentum. Define dynamic minimum balance thresholds, and ScaleMint automatically transfers liquidity before ads exhaust.',
      highlight: 'Zero Downtime'
    },
    {
      icon: ShieldCheck,
      title: 'Rigorous Profile & Proxy Hygiene',
      description: 'Every ad account cluster runs in isolated residential browser contexts with dedicated IP subnets to prevent catastrophic chain-reaction bans.',
      highlight: 'Isolated Environments'
    },
    {
      icon: Globe2,
      title: 'Multi-Currency Settlement Rails',
      description: 'Fund your master treasury through global wires or digital currencies, and allocate seamless balances to accounts across North America, Europe, and LATAM.',
      highlight: 'Global Liquidity'
    },
    {
      icon: Users,
      title: 'Granular Agency Team RBAC',
      description: 'Assign role-based access to junior media buyers, campaign managers, and financial controllers without ever exposing direct master card details.',
      highlight: 'Security First'
    },
    {
      icon: LifeBuoy,
      title: 'Standby Warm Reserve Infrastructure',
      description: 'In the fast-moving TikTok ecosystem, unexpected compliance flags happen. We maintain hot-standby accounts so high-converting funnels never stop printing.',
      highlight: 'Rapid Replacement'
    },
    {
      icon: FileText,
      title: 'Reconciled Audit Ledger',
      description: 'Export clean, itemized CSV and webhook receipts matching TikTok ad spend to penny precision for transparent client accounting.',
      highlight: 'Institutional Precision'
    }
  ];

  return (
    <section id="why-scalemint" className="py-20 bg-[#060913] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <span>Why ScaleMint</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built to Solve Real Media Buying Bottlenecks
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base leading-relaxed">
              Traditional credit card top-ups trigger fraud false-positives and manual spreadsheets choke team productivity. ScaleMint builds the institutional rails your agency deserves.
            </p>
          </div>

          <Link
            href="/why-scalemint"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Read in-depth architectural comparison</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 sm:p-7 rounded-2xl bg-[#0a0f1d] border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {item.highlight}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-400">
                  <span>Production-Grade Protection</span>
                  <span className="text-emerald-400 font-bold">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
