'use client';

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Building, 
  Coins, 
  CheckCircle2, 
  X, 
  Check 
} from 'lucide-react';
import { DEMO_DEPOSITS } from '@/lib/supabase/demo-data';
import { DEMO_CLIENTS } from '@/lib/supabase/admin-demo-data';
import { Deposit } from '@/types/dashboard';
import { reconcileDepositAction } from '@/actions/admin';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>(DEMO_DEPOSITS);
  const [search, setSearch] = useState('');
  const [confirmModalDeposit, setConfirmModalDeposit] = useState<Deposit | null>(null);
  const [reconcileNotes, setReconcileNotes] = useState('Bank wire verified against banking ledger');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleOpenConfirm = (dep: Deposit) => {
    setConfirmModalDeposit(dep);
    setReconcileNotes(`Confirmed settlement receipt for ${dep.payment_method.toUpperCase()} trace ${dep.tx_hash_or_ref || ''}`);
  };

  const handleConfirmDeposit = async (dep: Deposit) => {
    setIsSubmitting(true);
    try {
      const res = await reconcileDepositAction(dep.id, reconcileNotes, dep.tx_hash_or_ref);
      if (res.success) {
        setDeposits(deposits.map(d => d.id === dep.id ? {
          ...d,
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        } : d));
        setConfirmModalDeposit(null);
        setNotice(res.message);
      } else {
        alert(res.message);
      }
    } catch {
      alert('Failed to execute deposit reconciliation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = deposits.filter(d => 
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    (d.tx_hash_or_ref && d.tx_hash_or_ref.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" />
            <span>Master Inbound Deposit Reconciliation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconcile inbound commercial wire transfers and blockchain stablecoin deposits against client treasury wallets.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by deposit ID or trace..."
          className="w-full bg-[#080d1a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Deposits Table */}
      <div className="rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Deposit ID</th>
                <th className="py-3.5 px-4 font-sans">Client Agency</th>
                <th className="py-3.5 px-4 font-sans">Channel</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Trace / Tx Hash</th>
                <th className="py-3.5 px-4 font-sans">Status</th>
                <th className="py-3.5 px-4 font-sans">Initiated</th>
                <th className="py-3.5 px-5 text-right font-sans">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((dep) => {
                const client = DEMO_CLIENTS.find(c => c.id === dep.user_id);
                return (
                  <tr key={dep.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 text-emerald-400 font-bold">
                      {dep.id}
                    </td>
                    <td className="py-4 px-4 font-sans text-white font-semibold">
                      {client?.company_name || 'Client Agency'}
                    </td>
                    <td className="py-4 px-4 font-sans capitalize">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        {dep.payment_method === 'bank_wire' ? (
                          <Building className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Coins className="w-3.5 h-3.5 text-teal-400" />
                        )}
                        <span>{dep.payment_method.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-white text-sm">
                      ${dep.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {dep.currency}
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-[11px] truncate max-w-xs">
                      {dep.tx_hash_or_ref || 'Pending'}
                    </td>
                    <td className="py-4 px-4 font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          dep.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {dep.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-sans text-slate-400 text-[11px]">
                      {new Date(dep.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right font-sans">
                      {dep.status === 'pending_confirmation' || dep.status === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenConfirm(dep)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                        >
                          Confirm & Credit
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-mono">Credited</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#080d1a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Reconcile Inbound Deposit</h2>
              <button
                type="button"
                onClick={() => setConfirmModalDeposit(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300">
              Confirm bank wire or on-chain settlement receipt of <strong>${confirmModalDeposit.amount.toFixed(2)} USD</strong> for deposit <strong>#{confirmModalDeposit.id}</strong>.
            </p>

            <div className="p-3 bg-white/5 rounded-xl font-mono text-[11px] space-y-1">
              <div>Trace: {confirmModalDeposit.tx_hash_or_ref}</div>
              <div>Method: {confirmModalDeposit.payment_method}</div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Treasury Audit & Compliance Rationale (Required) *
              </label>
              <textarea
                rows={2}
                value={reconcileNotes}
                onChange={(e) => setReconcileNotes(e.target.value)}
                placeholder="E.g. Bank wire verified on Chase commercial portal..."
                className="w-full bg-[#04060c] border border-white/10 rounded-lg p-2 text-white font-sans text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalDeposit(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || reconcileNotes.trim().length < 5}
                onClick={() => handleConfirmDeposit(confirmModalDeposit)}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Posting Ledger...' : 'Confirm Ledger Credit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
