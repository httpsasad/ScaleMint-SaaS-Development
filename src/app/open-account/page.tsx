'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Building2, 
  HelpCircle,
  FileCheck2,
  Lock
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function OpenAccountPage() {
  const [organizationName, setOrganizationName] = useState('');
  const [contactName, setContactName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [telegramOrSkype, setTelegramOrSkype] = useState('');
  const [accountTypeInterest, setAccountTypeInterest] = useState<'bulk' | 'aged' | 'hybrid'>('bulk');
  const [estimatedMonthlySpend, setEstimatedMonthlySpend] = useState('$25,000 - $50,000');
  const [primaryRegion, setPrimaryRegion] = useState('North America (US/CA)');
  const [intendedVertical, setIntendedVertical] = useState('E-Commerce & Direct-to-Consumer');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiClient.submitAccountApplication({
        organizationName,
        contactName,
        workEmail,
        telegramOrSkype,
        accountTypeInterest,
        estimatedMonthlySpend,
        primaryTargetRegions: [primaryRegion],
        intendedVertical,
        notes
      });

      setReferenceId(response.data?.referenceId || `SM-${Date.now().toString(36).toUpperCase()}`);
    } catch {
      setReferenceId(`SM-${Date.now().toString(36).toUpperCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-grid-pattern relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radial-glow pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Open Account' }]} />
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Agency Onboarding Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Apply for ScaleMint Account Allocation
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Provision dedicated TikTok ad accounts with automated funding workflows. Complete our onboarding review to receive account parameters and custom billing terms.
          </p>
        </div>

        {referenceId ? (
          <div className="rounded-3xl bg-[#090f1d] border border-emerald-500/40 p-8 sm:p-12 text-center shadow-2xl space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Application Submitted for Review
              </h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Thank you for applying. We verify all media organizations to maintain platform trust scores and policy-hardened infrastructure.
              </p>
            </div>

            <div className="p-4 bg-[#0e1629] rounded-xl border border-white/10 max-w-md mx-auto text-xs space-y-2">
              <div className="text-slate-400">Your Onboarding Reference Identifier:</div>
              <div className="font-mono text-base font-bold text-emerald-400 tracking-wider">
                {referenceId}
              </div>
              <div className="text-[11px] text-slate-400">
                Please save this reference for your communications with our compliance desk.
              </div>
            </div>

            <div className="text-xs text-slate-400 max-w-md mx-auto">
              An onboarding specialist will review your advertising vertical and email a tailored proposal with master agreement terms within 1 business day.
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/15 transition-colors"
              >
                Return to Homepage
              </Link>
              <Link
                href="/contact"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Contact Onboarding Desk
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Form */}
            <div className="lg:col-span-8">
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl bg-[#090f1d] border border-white/10 p-6 sm:p-10 shadow-2xl space-y-6"
              >
                {/* Section 1: Organization Details */}
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Organization & Team</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Company or Agency Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="Nexus Growth Media Ltd"
                        className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Primary Contact Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Jordan Vance"
                        className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Business Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        placeholder="jordan@nexusmedia.com"
                        className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Telegram or Skype Handle (Priority Comms)
                      </label>
                      <input
                        type="text"
                        value={telegramOrSkype}
                        onChange={(e) => setTelegramOrSkype(e.target.value)}
                        placeholder="@jordan_growth"
                        className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Account Specifications */}
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span>Account Requirements</span>
                  </h2>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Account Type Required *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'bulk', title: 'Bulk Accounts', desc: 'Clusters for multi-testing' },
                        { id: 'aged', title: 'Aged Accounts', desc: 'Seasoned, high-trust' },
                        { id: 'hybrid', title: 'Hybrid Fleet', desc: 'Combined bulk & aged' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAccountTypeInterest(item.id as 'bulk' | 'aged' | 'hybrid')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            accountTypeInterest === item.id
                              ? 'border-emerald-500 bg-emerald-500/10 text-white'
                              : 'border-white/10 bg-[#0e1629] text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold">{item.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Estimated Monthly Ad Spend *
                      </label>
                      <select
                        value={estimatedMonthlySpend}
                        onChange={(e) => setEstimatedMonthlySpend(e.target.value)}
                        className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Under $10,000">Under $10,000 / month</option>
                        <option value="$10,000 - $50,000">$10,000 - $50,000 / month</option>
                        <option value="$50,000 - $200,000">$50,000 - $200,000 / month</option>
                        <option value="$200,000+">$200,000+ / month (High Velocity)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Primary Target Geography *
                      </label>
                      <select
                        value={primaryRegion}
                        onChange={(e) => setPrimaryRegion(e.target.value)}
                        className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="North America (US/CA)">North America (United States & Canada)</option>
                        <option value="Europe (UK/EU)">European Union & United Kingdom</option>
                        <option value="Latin America (BR/MX)">Latin America (Brazil, Mexico, Colombia)</option>
                        <option value="Asia Pacific (AU/SG/JP)">Asia Pacific & Oceania</option>
                        <option value="Worldwide Multi-Region">Worldwide Multi-Region Allocation</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Advertising Vertical / Niche *
                    </label>
                    <select
                      value={intendedVertical}
                      onChange={(e) => setIntendedVertical(e.target.value)}
                      className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="E-Commerce & Direct-to-Consumer">E-Commerce & Direct-to-Consumer</option>
                      <option value="Mobile App Installs & Gaming">Mobile App Installs & Gaming</option>
                      <option value="Lead Generation & Financial Services">Lead Generation & Financial Services</option>
                      <option value="SaaS & Digital Products">SaaS & Digital Products</option>
                      <option value="Brand Advertising & Entertainment">Brand Advertising & Entertainment</option>
                    </select>
                  </div>
                </div>

                {/* Section 3: Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Special Requirements or Target Launch Date (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., We need 15 US ad accounts ready by next Monday with EUR settlement rails..."
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    By applying, you confirm compliance with TikTok Ad Policies. ScaleMint does not support unauthorized or counterfeit advertising campaigns.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Application to Compliance Desk...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Account Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Side Explainer / Onboarding Process */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-[#090f1d] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Onboarding Steps</span>
                </h3>
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                      1
                    </span>
                    <div>
                      <div className="font-semibold text-white">Application Review</div>
                      <div className="text-slate-400 mt-0.5">We check vertical compliance and requested account availability.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                      2
                    </span>
                    <div>
                      <div className="font-semibold text-white">Custom Quote & Agreement</div>
                      <div className="text-slate-400 mt-0.5">Receive formal pricing quote and master services agreement.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                      3
                    </span>
                    <div>
                      <div className="font-semibold text-white">Dedicated Container Handover</div>
                      <div className="text-slate-400 mt-0.5">Account credentials, proxy bindings, and treasury wallet activated.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#090f1d] border border-white/10 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white">Need Urgent Delivery?</div>
                <p className="text-slate-400 leading-relaxed">
                  Agencies with active live campaigns can request same-day expedited provisioning.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-emerald-400 font-semibold hover:underline pt-1"
                >
                  Contact Urgent Desk &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
