'use client';

import React, { useState } from 'react';
import { 
  History, 
  Plus, 
  CheckCircle2, 
  Building, 
  Coins 
} from 'lucide-react';
import { DEMO_DEPOSITS } from '@/lib/supabase/demo-data';
import { Deposit } from '@/types/dashboard';

export default function DepositHistoryPage() {
  const [deposits, setDeposits] = useState<Deposit[]>(DEMO_DEPOSITS);
  const [showNewModal, setShowNewModal] = useState(false);
  const [amount, setAmount] = useState('2500.00');
  const [method, setMethod] = useState<'bank_wire' | 'usdt_trc20' | 'usdc_erc20'>('usdt_trc20');
  const [txRef, setTxRef] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleCreateDepositNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const newDep: Deposit = {
      id: `dep-client-${Date.now().toString(36)}`,
      user_id: 'demo-user-001',
      wallet_id: 'demo-wallet-001',
      amount: parseFloat(amount) || 1000,
      currency: 'USD',
      payment_method: method,
      status: 'pending_confirmation',
      tx_hash_or_ref: txRef || 'Trace Pending',
      created_at: new Date().toISOString()
    };

    setDeposits([newDep, ...deposits]);
    setShowNewModal(false);
    setTxRef('');
    setNotice('Deposit notification staged. Treasury team reconciles incoming wires and blockchain transfers every 30 minutes.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" />
            <span>Deposit History & Settlement</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track bank wires, SWIFT instructions, and digital asset deposits credited to your primary treasury pool.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Notify New Deposit</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      {/* Modal for notifying a new deposit */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#090f1d] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Notify Treasury of Inbound Deposit</h2>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateDepositNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Settlement Rail / Method *
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as 'bank_wire' | 'usdt_trc20' | 'usdc_erc20')}
                  className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="bank_wire">Commercial Bank Wire (USD / EUR)</option>
                  <option value="usdt_trc20">USDT Stablecoin (TRC-20)</option>
                  <option value="usdc_erc20">USDC Stablecoin (ERC-20)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Deposited Amount (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="50"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2500.00"
                  className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Bank Wire Reference or Blockchain Tx Hash *
                </label>
                <input
                  type="text"
                  required
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="E.g., FED-TRACE-99014 or 0x4f8a..."
                  className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-2.5 font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-white/5 rounded-xl text-[11px] text-slate-400">
                Notice: Submitting a deposit trace alerts our treasury desk to reconcile incoming funds. Balance is credited once verified.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
              >
                Submit Deposit Notification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposits Table */}
      <div className="rounded-2xl bg-[#090f1d] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Deposit ID</th>
                <th className="py-3.5 px-4">Method / Channel</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Tx Hash / Reference</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Initiated</th>
                <th className="py-3.5 px-5 text-right">Confirmed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {deposits.map((dep) => (
                <tr key={dep.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 text-emerald-400 font-semibold">
                    {dep.id}
                  </td>
                  <td className="py-4 px-4 font-sans text-white font-medium capitalize">
                    <div className="flex items-center gap-2">
                      {dep.payment_method === 'bank_wire' ? (
                        <Building className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Coins className="w-4 h-4 text-teal-400" />
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
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        dep.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        dep.status === 'confirmed' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      {dep.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-sans text-slate-400 text-[11px]">
                    {new Date(dep.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-5 text-right font-sans text-slate-400 text-[11px]">
                    {dep.confirmed_at ? new Date(dep.confirmed_at).toLocaleString() : 'Awaiting Ledger Match'}
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
