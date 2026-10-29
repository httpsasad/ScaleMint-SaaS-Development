import React from 'react';
import { Shield, Cpu, RefreshCw, Key, Network, CheckCircle } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const trustFeatures = [
    {
      icon: Network,
      title: 'Dedicated Proxy Isolation',
      desc: 'Individual fingerprint environment per account cluster to eliminate cross-contamination.'
    },
    {
      icon: RefreshCw,
      title: 'Automated Treasury Routing',
      desc: 'Centralized funding pool dynamically rebalances sub-accounts based on real-time burn.'
    },
    {
      icon: Key,
      title: 'Zero-Privilege Vaulting',
      desc: 'No shared credentials or loose password spreadsheets; encrypted team access roles.'
    },
    {
      icon: Shield,
      title: 'Warm Reserve Safeguards',
      desc: 'Pre-provisioned backup ad containers ready to activate in under 30 minutes.'
    },
    {
      icon: Cpu,
      title: 'API & Webhook Telemetry',
      desc: 'Real-time billing event dispatch to integrate with internal agency dashboards.'
    },
    {
      icon: CheckCircle,
      title: 'Policy Compliance Guardrails',
      desc: 'Proactive creative and vertical verification to protect infrastructure longevity.'
    }
  ];

  return (
    <section className="py-12 bg-[#050811] border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
            Infrastructure Standards
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for High-Velocity Media Buyers
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Built from the ground up to solve the operational bottlenecks of large-scale TikTok advertising campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFeatures.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-5 rounded-xl bg-[#090f1d] border border-white/5 hover:border-emerald-500/30 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5 flex items-center gap-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
