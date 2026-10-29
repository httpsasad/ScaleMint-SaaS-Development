'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowUpRight, 
  Search, 
  CheckCircle2, 
  ShieldAlert, 
  X 
} from 'lucide-react';
import { DEMO_FUNDING_REQUESTS } from '@/lib/supabase/demo-data';
import { DEMO_CLIENTS } from '@/lib/supabase/admin-demo-data';
import { FundingRequest, FundingRequestStatus } from '@/types/dashboard';
import { reviewFundingRequest } from '@/actions/admin';

function AdminFundingContent() {
  const searchParams = useSearchParams();
  const highlightReviewId = searchParams.get('reviewId') || '';

  const [requests, setRequests] = useState<FundingRequest[]>(DEMO_FUNDING_REQUESTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | FundingRequestStatus>('all');

  // Decision Modal
  const [selectedRequest, setSelectedRequest] = useState<FundingRequest | null>(
    requests.find(r => r.id === highlightReviewId) || null
  );
  const [decision, setDecision] = useState<'processing' | 'approved' | 'rejected'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const openDecisionModal = (req: FundingRequest, defaultDecision: 'processing' | 'approved' | 'rejected') => {
    setSelectedRequest(req);
    setDecision(defaultDecision);
    setReviewNotes('');
  };

  const handleConfirmDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsSubmitting(true);
    setActionNotice(null);

    try {
      const res = await reviewFundingRequest(selectedRequest.id, decision, reviewNotes);
      if (res.success) {
        setRequests(requests.map(r => r.id === selectedRequest.id ? {
          ...r,
          status: decision,
          reference_notes: reviewNotes,
          reviewed_at: new Date().toISOString()
        } : r));
        setActionNotice(res.message);
        setSelectedRequest(null);
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error recording review decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = requests.filter((r) => {
    const matchesSearch = 
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      (r.account_name && r.account_name.toLowerCase().includes(search.toLowerCase())) ||
      (r.reference_notes && r.reference_notes.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-amber-400" />
            <span>Funding Request Approvals & Review</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Validate ad account allocation requests, inspect server-recalculated fees, and authorize liquidity releases.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Security Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong className="text-white">External Settlement Rule:</strong> Approving a funding request authorizes platform ledger deduction and stages the allocation. It does not claim that external TikTok ad center funding has completed until confirmed by sync telemetry.
          </p>
          <p className="text-[11px] text-amber-300/70">
            Idempotency controls prevent double-processing or conflicting concurrent decisions.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request ID, account, notes..."
            className="w-full bg-[#080d1a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
          {(['all', 'pending_review', 'processing', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                filterStatus === s
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {s === 'all' ? 'All Requests' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Request ID</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Target Ad Account</th>
                <th className="py-3.5 px-4">Requested</th>
                <th className="py-3.5 px-4">Fee (7.5%)</th>
                <th className="py-3.5 px-4">Net Allocation</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-5 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filtered.map((req) => {
                const client = DEMO_CLIENTS.find(c => c.id === req.user_id);
                return (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 text-amber-400 font-bold">
                      {req.id}
                    </td>
                    <td className="py-4 px-4 font-sans">
                      <div className="font-semibold text-white">{client?.company_name || 'Client Agency'}</div>
                      <div className="text-[11px] text-slate-400">{client?.contact_name}</div>
                    </td>
                    <td className="py-4 px-4 font-sans text-white font-medium">
                      {req.account_name}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      ${req.requested_amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-amber-400">
                      ${req.fee_amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-emerald-400 font-bold">
                      ${req.net_amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 font-sans">
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
                    <td className="py-4 px-4 font-sans text-slate-400 text-[11px]">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right font-sans space-x-1.5">
                      {req.status === 'pending_review' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openDecisionModal(req, 'approved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openDecisionModal(req, 'rejected')}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs hover:bg-rose-500/30"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openDecisionModal(req, req.status === 'approved' ? 'processing' : 'approved')}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                        >
                          Modify Decision
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Decision Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#080d1a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Record Review Decision</h2>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1 font-mono">
              <div className="text-slate-400">Request: <strong className="text-white font-sans">{selectedRequest.id}</strong></div>
              <div className="text-white">Amount: ${selectedRequest.requested_amount.toFixed(2)} &bull; Net: ${selectedRequest.net_amount.toFixed(2)}</div>
              <div className="text-emerald-400">Target: {selectedRequest.account_name}</div>
            </div>

            <form onSubmit={handleConfirmDecision} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Selected State Transition *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['processing', 'approved', 'rejected'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDecision(s)}
                      className={`py-2 px-3 rounded-lg border font-bold capitalize text-xs transition-all ${
                        decision === s
                          ? s === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                            : s === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                            : 'bg-cyan-500/20 text-cyan-400 border-cyan-500'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Compliance / Operational Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record review notes, treasury authorization trace, or rejection reasons..."
                  className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  {isSubmitting ? 'Recording Decision...' : 'Commit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminFundingRequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading funding management queue...</div>}>
      <AdminFundingContent />
    </Suspense>
  );
}
