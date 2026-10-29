'use client';

import React, { useState } from 'react';
import { 
  Percent, 
  ShieldAlert, 
  CheckCircle2, 
  History, 
  Loader2, 
  Calculator 
} from 'lucide-react';
import { DEMO_FEE_CONFIGS } from '@/lib/supabase/admin-demo-data';
import { FeeConfiguration } from '@/types/admin';
import { updateFeeConfiguration } from '@/actions/admin';

export default function AdminFeeSettingsPage() {
  const [configs, setConfigs] = useState<FeeConfiguration[]>(DEMO_FEE_CONFIGS);
  const activeConfig = configs.find(c => c.is_active) || configs[0];

  const [inputPercentage, setInputPercentage] = useState(activeConfig.rate_percentage.toString());
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Real-time calculator simulator for previewing calculations
  const [simAmount, setSimAmount] = useState('500.00');

  const parsedSimAmount = parseFloat(simAmount) || 0;
  const currentRateNum = parseFloat(inputPercentage) || activeConfig.rate_percentage;
  const simFee = Math.round(parsedSimAmount * (currentRateNum / 100) * 100) / 100;
  const simNet = Math.round((parsedSimAmount - simFee) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotice(null);
    setErrorMsg(null);

    const num = parseFloat(inputPercentage);
    if (isNaN(num) || num < 1.0 || num > 25.0) {
      setErrorMsg('Fee rate must be between 1.00% and 25.00%.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await updateFeeConfiguration(num, reason);
      if (res.success && res.data) {
        setConfigs([
          res.data,
          ...configs.map(c => ({ ...c, is_active: false }))
        ]);
        setNotice(res.message);
        setReason('');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error committing fee configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Percent className="w-6 h-6 text-amber-400" />
          <span>Platform Fee Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Owner-exclusive fee structure governance. Configures the platform rate applied to all client ad funding requests.
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Current Active Fee Card & Update Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-7 rounded-2xl bg-[#080d1a] border border-white/10 p-6 sm:p-8 shadow-xl space-y-6 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base font-bold text-white">Adjust Platform Fee Rate</h2>
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Active: {activeConfig.rate_percentage.toFixed(2)}%
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                New Platform Fee Percentage (1.00% &ndash; 25.00%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1.00"
                  max="25.00"
                  required
                  value={inputPercentage}
                  onChange={(e) => setInputPercentage(e.target.value)}
                  className="w-full bg-[#0d1424] border border-white/10 rounded-xl p-3 pr-10 font-mono text-base font-bold text-white focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                  %
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Default: 7.50%. Standard agency range is 5.00% to 10.00%.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Owner Justification & Audit Memo (Required) *
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the strategic, liquidity, or holiday scaling rationale for adjusting the platform fee..."
                className="w-full bg-[#0d1424] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Committing Fee Change to Vault...</span>
                </>
              ) : (
                <span>Update Active Platform Fee</span>
              )}
            </button>
          </form>
        </div>

        {/* Right: Simulation & Snapshot Explainer */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          {/* Real-time Math Simulator */}
          <div className="p-5 rounded-2xl bg-[#080d1a] border border-white/10 space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Server Arithmetic Verification</span>
            </h3>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Test Request Amount (USD)
              </label>
              <input
                type="number"
                step="10"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
                className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2 font-mono text-white text-xs"
              />
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>Requested Amount:</span>
                <span className="font-bold text-white">${parsedSimAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Fee ({currentRateNum.toFixed(2)}%):</span>
                <span>-${simFee.toFixed(2)}</span>
              </div>
              <div className="pt-1.5 border-t border-white/10 flex justify-between text-emerald-400 font-bold text-xs">
                <span>Net Credited to Ad Account:</span>
                <span>${simNet.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Historical Snapshot Rule */}
          <div className="p-5 rounded-2xl bg-[#080d1a] border border-white/10 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Snapshot Immobility Rule</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              When a client creates a funding request, the active fee rate is snapshotted directly into that record (<code className="text-emerald-400 font-mono">fee_rate</code> column).
            </p>
            <p className="text-slate-400 leading-relaxed">
              Future owner adjustments never alter past or currently pending funding requests.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Fee Configuration Audit Log */}
      <div className="rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl text-xs">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Fee Structure Revision History ({configs.length})</span>
          </h2>
          <span className="text-slate-400 text-[11px]">Audit Stamped</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Rate %</th>
                <th className="py-3 px-4">Decimal Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4">Operational Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {configs.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white text-xs">
                    {c.rate_percentage.toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-4 text-amber-300">
                    {c.fee_rate.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {c.is_active ? 'ACTIVE' : 'SUPERSEDED'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-sans">
                    {new Date(c.effective_from).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-sans">
                    {c.changed_by_email || c.changed_by || 'Root Owner'}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-400 italic">
                    &ldquo;{c.reason}&rdquo;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
