'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  ShieldCheck, 
  Building, 
  Coins, 
  Copy, 
  Check 
} from 'lucide-react';
import { DEMO_WALLET } from '@/lib/supabase/demo-data';

export default function WalletPage() {
  const wallet = DEMO_WALLET;
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Treasury & Liquidity Wallet</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Master capital pool used to dynamically disburse ad balance allocations across your advertising account fleet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/deposits"
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>Deposit History</span>
          </Link>

          <Link
            href="/dashboard/funding-requests"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Allocate to Ad Account</span>
          </Link>
        </div>
      </div>

      {/* Main Balance Hero Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0b1328] to-[#070b16] border border-emerald-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <span>Primary Settlement Pool</span>
          </div>

          <div className="text-xs text-slate-400">Total Available Liquidity</div>
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-1 mb-6">
            ${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className="text-sm font-mono text-emerald-400 ml-2 font-normal">
              {wallet.currency}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-slate-400">Status</div>
              <div className="text-emerald-400 font-semibold mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Liquid & Unlocked</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-slate-400">Settlement Currency</div>
              <div className="text-white font-mono font-semibold mt-0.5">
                USD / Multi-Currency Rails
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Channels & Settlement Rails */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">
          Treasury Funding Channels
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Channel 1: Commercial Bank Wire */}
          <div className="p-6 rounded-2xl bg-[#090f1d] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Commercial Bank Wire (SWIFT / Fedwire)</h3>
                  <p className="text-[11px] text-slate-400">Same-day settlement for USD/EUR deposits</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                &gt; $5,000
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0d1424] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Beneficiary Bank:</span>
                <span className="font-semibold text-white">JPMorgan Chase N.A. (Commercial)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Routing Number (ABA):</span>
                <span className="font-mono text-emerald-400">021000021</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reference memo required:</span>
                <span className="font-mono text-amber-300">SM-CLIENT-ACME</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Wire confirmations are reconciled to your treasury balance within 2 business hours of banking ledger credit.
            </p>
          </div>

          {/* Channel 2: Stablecoin Settlement Rails */}
          <div className="p-6 rounded-2xl bg-[#090f1d] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Digital Stablecoin Rails (USDT / USDC)</h3>
                  <p className="text-[11px] text-slate-400">Instant on-chain confirmation 24/7/365</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                Instant 24/7
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0d1424] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">USDT (TRC-20) Address:</span>
                <button
                  type="button"
                  onClick={() => handleCopy('TX7vK9L2M4pQ8nJ3yR1wZ5tS6uB0xV9aF4', 'usdt')}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                >
                  {copiedKey === 'usdt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'usdt' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-300 break-all bg-black/30 p-2 rounded">
                TX7vK9L2M4pQ8nJ3yR1wZ5tS6uB0xV9aF4
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Deposit transactions are staged under Deposit History. Treasury agents verify blockchain confirmation before crediting the balance.
            </p>
          </div>
        </div>
      </div>

      {/* Authoritative Ledger Entries Section */}
      <div className="rounded-2xl bg-[#090f1d] border border-white/10 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Immutable Treasury Ledger Records</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Auditable double-entry history. Every balance increment, allocation debit, or reversal is recorded in minor units (cents).
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Append-Only Integrity
          </span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Entry Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Running Balance</th>
                <th className="py-3 px-4">Description / Reference</th>
                <th className="py-3 px-5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Credit (+)
                  </span>
                </td>
                <td className="py-3 px-4 text-emerald-400 font-bold">
                  +$2,500.00 <span className="text-[9px] text-slate-500">(250,000¢)</span>
                </td>
                <td className="py-3 px-4 text-white font-bold">
                  $2,500.00
                </td>
                <td className="py-3 px-4 font-sans text-slate-300 text-xs">
                  Initial verified treasury deposit (Wire ref: WIRE-99318)
                </td>
                <td className="py-3 px-5 text-right text-slate-500 font-mono text-[10px]">
                  2026-10-25 14:30 UTC
                </td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    Debit (-)
                  </span>
                </td>
                <td className="py-3 px-4 text-rose-400 font-bold">
                  -$500.00 <span className="text-[9px] text-slate-500">(50,000¢)</span>
                </td>
                <td className="py-3 px-4 text-white font-bold">
                  $2,000.00
                </td>
                <td className="py-3 px-4 font-sans text-slate-300 text-xs">
                  Funding allocation for ad account: TT-ADV-88319 (Req #req-demo-001)
                </td>
                <td className="py-3 px-5 text-right text-slate-500 font-mono text-[10px]">
                  2026-10-26 11:15 UTC
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Rule Warning */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          <strong>Financial Security Rule:</strong> Wallet balances and financial transactions can never be edited directly from browser clients. All increments and debits are enforced strictly via server-side PostgreSQL triggers and authenticated treasury desks.
        </span>
      </div>
    </div>
  );
}
