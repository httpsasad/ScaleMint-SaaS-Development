'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  Loader2,
  DollarSign
} from 'lucide-react';
import { DEMO_ACCOUNTS, DEMO_FUNDING_REQUESTS, DEMO_WALLET } from '@/lib/supabase/demo-data';
import { submitFundingRequest } from '@/actions/funding';
import { FundingRequest } from '@/types/dashboard';

const PLATFORM_FEE_RATE = 0.075; // 7.5%

function FundingRequestContent() {
  const searchParams = useSearchParams();
  const preselectedAccountId = searchParams.get('accountId') || '';

  const accounts = DEMO_ACCOUNTS;
  const [selectedAccountId, setSelectedAccountId] = useState(preselectedAccountId || accounts[0]?.id || '');
  const [amountInput, setAmountInput] = useState('500.00');
  const [referenceNotes, setReferenceNotes] = useState('');
  
  // Derived fee preview calculations (strictly informational on client)
  const parsedAmount = parseFloat(amountInput);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const validationError = isAmountValid ? '' : 'Please enter a valid amount greater than $0.00';
  const feePreview = isAmountValid ? Math.round(parsedAmount * PLATFORM_FEE_RATE * 100) / 100 : 0;
  const netPreview = isAmountValid ? Math.round((parsedAmount - feePreview) * 100) / 100 : 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Existing requests list
  const [requestsList, setRequestsList] = useState<FundingRequest[]>(DEMO_FUNDING_REQUESTS);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionSuccess(null);
    setSubmissionError(null);

    if (!isAmountValid) {
      setSubmissionError('Please enter a valid amount greater than $0.00');
      return;
    }

    setIsSubmitting(true);

    try {
      // NOTE: We only send accountId, requestedAmount, and referenceNotes to the server.
      // The server independently recalculates the 7.5% fee. Client-submitted fees are NEVER trusted.
      const result = await submitFundingRequest({
        accountId: selectedAccountId,
        requestedAmount: parsedAmount,
        referenceNotes
      });

      if (result.success && result.data) {
        setSubmissionSuccess(result.message);
        const selectedAcc = accounts.find(a => a.id === selectedAccountId);
        const enrichedRequest: FundingRequest = {
          ...result.data,
          account_name: selectedAcc?.account_name || 'TikTok Ad Account'
        };
        setRequestsList([enrichedRequest, ...requestsList]);
        setReferenceNotes('');
      } else {
        setSubmissionError(result.message || 'Unable to submit funding request.');
      }
    } catch (err) {
      console.error(err);
      setSubmissionError('Network error while transmitting request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ArrowUpRight className="w-6 h-6 text-emerald-400" />
          <span>Ad Account Funding Requests</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Stage funding allocations to assigned TikTok ad accounts. All requests undergo automated server-side fee validation.
        </p>
      </div>

      {/* Main Grid: Form on Left, Guidelines on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-[#090f1d] border border-white/10 p-6 sm:p-8 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>New Funding Allocation Request</span>
              </h2>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Treasury Pool: ${DEMO_WALLET.balance.toFixed(2)}
              </span>
            </div>

            {submissionSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Request Staged Successfully</span>
                </div>
                <p className="leading-relaxed">{submissionSuccess}</p>
              </div>
            )}

            {submissionError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submissionError}</span>
              </div>
            )}

            {/* Account Selection */}
            <div>
              <label htmlFor="target-account-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Advertising Account *
              </label>
              <select
                id="target-account-select"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                required
                className="w-full bg-[#0d1424] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name} ({acc.account_id}) &bull; Current Balance: ${acc.balance.toFixed(2)}
                  </option>
                ))}
              </select>
              {selectedAccount && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Status: <span className="capitalize text-emerald-400 font-semibold">{selectedAccount.status}</span> &bull; Proxy: {selectedAccount.proxy_cluster_id || 'Isolated Residential'}
                </p>
              )}
            </div>

            {/* Requested Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="funding-amount-input" className="block text-xs font-semibold text-slate-300">
                  Total Requested Amount (USD) *
                </label>
                <span className="text-[10px] text-slate-400">
                  Min: $50.00 &bull; Max: $100,000.00
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  $
                </span>
                <input
                  id="funding-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="500.00"
                  className="w-full bg-[#0d1424] border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              {validationError && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{validationError}</span>
                </p>
              )}
            </div>

            {/* Automatic 7.5% Fee Preview Card */}
            <div className="p-4 rounded-xl bg-[#0e1629] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/5">
                <span>Fee Breakdown (Informational Preview)</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Fixed Rate: 7.5%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Total Requested Amount:</span>
                <span className="font-mono font-semibold text-white">
                  ${(parseFloat(amountInput) || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Platform Allocation Fee (7.5%):</span>
                <span className="font-mono text-amber-400">
                  -${feePreview.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-sm font-bold">
                <span className="text-white">Estimated Net Funding to Ad Balance:</span>
                <span className="font-mono text-emerald-400">
                  ${netPreview.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Reference or Notes */}
            <div>
              <label htmlFor="reference-notes-input" className="block text-xs font-semibold text-slate-300 mb-1">
                Optional Reference or Campaign Notes
              </label>
              <input
                id="reference-notes-input"
                type="text"
                value={referenceNotes}
                onChange={(e) => setReferenceNotes(e.target.value)}
                placeholder="E.g., TikTok Flash Sale Scaling / Ref: Q4-CAMP-09"
                className="w-full bg-[#0d1424] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting || Boolean(validationError)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Treasury Desk...</span>
                </>
              ) : (
                <>
                  <span>Submit Funding Request</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Explainer: Compliance & Verification Standards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#090f1d] border border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Critical Security Guardrail</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Server-Side Recalculation:</strong> The 7.5% fee preview displayed in this form is purely informational for your operational planning. The trusted server recalculates the exact fee and net funding upon transmission.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>No Automated Immediate Charge:</strong> Submitting a funding request stages the transaction into <code className="text-amber-400">pending_review</code> status. It does not automatically debit your external bank account or claim successful platform transfers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090f1d] border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Funding Workflow Steps</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <span className="font-mono text-emerald-400 font-bold">1.</span>
                <span>Request staged and verified against available treasury limits.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-emerald-400 font-bold">2.</span>
                <span>Compliance review verifies target account status and TikTok pixel binding.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-emerald-400 font-bold">3.</span>
                <span>Net liquidity allocated directly into ad account spend balance.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History of Funding Requests */}
      <div className="rounded-2xl bg-[#090f1d] border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Funding Request Log ({requestsList.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Status Updates Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Target Account</th>
                <th className="py-3 px-4">Requested</th>
                <th className="py-3 px-4">Fee (7.5%)</th>
                <th className="py-3 px-4">Net Allocation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Staged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {requestsList.map((req) => (
                <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                    {req.id}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-white font-medium">
                    {req.account_name || req.account_id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    ${req.requested_amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-amber-400">
                    ${req.fee_amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-300 font-bold">
                    ${req.net_amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : req.status === 'processing'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : req.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-400 text-[11px]">
                    {new Date(req.created_at).toLocaleDateString()}
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

export default function FundingRequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading funding interface...</div>}>
      <FundingRequestContent />
    </Suspense>
  );
}
