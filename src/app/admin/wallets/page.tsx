'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { DEMO_CLIENTS } from '@/lib/supabase/admin-demo-data';
import { ClientWithMetrics } from '@/types/admin';

export default function AdminWalletsPage() {
  const [clients, setClients] = useState<ClientWithMetrics[]>(DEMO_CLIENTS);
  const [search, setSearch] = useState('');

  // Manual Ledger Adjustment Modal
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [targetClient, setTargetClient] = useState<ClientWithMetrics | null>(null);
  const [adjAmount, setAdjAmount] = useState('100.00');
  const [adjType, setAdjType] = useState<'credit' | 'debit'>('credit');
  const [adjReason, setAdjReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const totalLiquidity = clients.reduce((sum, c) => sum + (c.wallet?.balance || 0), 0);

  const handleOpenAdj = (c: ClientWithMetrics) => {
    setTargetClient(c);
    setAdjAmount('100.00');
    setAdjReason('');
    setShowAdjModal(true);
  };

  const handleCommitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClient) return;

    setIsSubmitting(true);
    const parsed = parseFloat(adjAmount) || 0;
    const signedAmount = adjType === 'credit' ? parsed : -parsed;

    // Simulate atomic ledger adjustment
    setTimeout(() => {
      setClients(clients.map(c => {
        if (c.id === targetClient.id && c.wallet) {
          return {
            ...c,
            wallet: {
              ...c.wallet,
              balance: Math.max(0, c.wallet.balance + signedAmount)
            }
          };
        }
        return c;
      }));

      setIsSubmitting(false);
      setShowAdjModal(false);
      setNotice(`Auditable ledger adjustment of ${signedAmount > 0 ? '+' : ''}$${signedAmount.toFixed(2)} recorded for ${targetClient.company_name}.`);
    }, 500);
  };

  const filtered = clients.filter(c => 
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Client Wallets & Treasury Inspection</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global liquidity balances, reconciliation status, and atomic auditable ledger adjustments.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-[#080d1a] border border-emerald-500/30 text-xs">
          <span className="text-slate-400">Total Pooled Client Liquidity: </span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            ${totalLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </span>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Security Rule Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong>Non-Direct-Editable Balances:</strong> In compliance with financial security standards, wallet balances cannot be directly edited via input fields. All capital changes must be executed as atomic ledger adjustment events with mandatory justifications.
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter client wallets..."
          className="w-full bg-[#080d1a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Wallets Table */}
      <div className="rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Client Organization</th>
                <th className="py-3.5 px-4">Wallet ID</th>
                <th className="py-3.5 px-4">Liquid Balance</th>
                <th className="py-3.5 px-4">Reconciliation Status</th>
                <th className="py-3.5 px-4">Active Ad Accounts</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-5 text-right">Adjustment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-white text-sm">{c.company_name}</div>
                    <div className="text-[11px] text-slate-400">{c.contact_name}</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-emerald-400">
                    {c.wallet?.id || 'Pending Creation'}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-white text-sm">
                    ${c.wallet?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'} {c.wallet?.currency || 'USD'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Reconciled</span>
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-300">
                    {c.accounts_count} accounts
                  </td>
                  <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                    {c.wallet?.updated_at ? new Date(c.wallet.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenAdj(c)}
                      className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors"
                    >
                      Audit Adjustment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ledger Adjustment Modal */}
      {showAdjModal && targetClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#080d1a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Auditable Wallet Ledger Adjustment</h2>
              <button
                type="button"
                onClick={() => setShowAdjModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="text-slate-400">Target Client: <strong className="text-white">{targetClient.company_name}</strong></div>
              <div className="text-white">Current Balance: <strong className="font-mono text-emerald-400">${targetClient.wallet?.balance.toFixed(2)} USD</strong></div>
            </div>

            <form onSubmit={handleCommitAdjustment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Adjustment Direction *
                  </label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as 'credit' | 'debit')}
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="credit">Credit Balance (+)</option>
                    <option value="debit">Debit Balance (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Amount (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(e.target.value)}
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Compliance / Ledger Justification (Required) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="E.g., Bank wire reconciliation difference resolution or goodwill compensation ref..."
                  className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  {isSubmitting ? 'Posting Ledger...' : 'Post Atomic Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
