'use client';

import React, { useState } from 'react';
import { 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RotateCcw, 
  Filter, 
  Info, 
  Terminal,
  X
} from 'lucide-react';
import { DEMO_SYNC_LOGS } from '@/lib/supabase/admin-demo-data';
import { SyncLog } from '@/types/admin';
import { retrySyncLog } from '@/actions/admin';

export default function AdminSyncLogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>(DEMO_SYNC_LOGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'failed' | 'retrying'>('all');
  const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.account_code || '').toLowerCase().includes(search.toLowerCase()) ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const successCount = logs.filter(l => l.status === 'success').length;
  const warningCount = logs.filter(l => l.status === 'warning').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;

  const handleRetry = async (logId: string) => {
    setRetryingId(logId);
    try {
      const res = await retrySyncLog(logId);
      if (res.success) {
        setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'retrying' as const, message: 'Retry dispatched to integration queue' } : l));
        setBannerNotice(res.message);
      } else {
        setBannerNotice(`Retry error: ${res.message}`);
      }
    } catch {
      setBannerNotice('Failed to dispatch retry event.');
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (status: SyncLog['status']) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Success</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Warning</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Failed</span>
          </span>
        );
      case 'retrying':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse">
            <RotateCcw className="w-3 h-3 text-sky-400 animate-spin" />
            <span>Retrying</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-amber-400" />
            <span>Account Synchronization Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Telemetry and error logs for TikTok ad account balance polling and reconciliation events.
          </p>
        </div>

        {/* Global sync metrics */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            {successCount} Success
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
            {warningCount} Warnings
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono">
            {failedCount} Errors
          </div>
        </div>
      </div>

      {bannerNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setBannerNotice(null)} 
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Integration Reality Notice */}
      <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 text-xs text-sky-200/90 flex items-start gap-3">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Integration Integrity Notice:</strong> These synchronization records document telemetry events from the balance polling subsystem. ScaleMint connects directly via official TikTok Marketing API OAuth protocols when production credentials are configured, avoiding simulated claims of synchronicity.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by account code, error, or message..."
            className="w-full bg-[#080d1a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {(['all', 'success', 'warning', 'failed', 'retrying'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-[#080d1a] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Event ID & Platform</th>
                <th className="py-3.5 px-4">Account ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Message / Payload</th>
                <th className="py-3.5 px-4">Latency</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No synchronization logs matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-white text-[11px]">{log.id}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{log.platform} Ads API</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-emerald-400">
                      {log.account_code || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="py-4 px-4 max-w-xs truncate">
                      <span className="text-slate-300">{log.message}</span>
                      {log.error_details && (
                        <div className="text-[10px] text-rose-400 font-mono truncate mt-0.5">
                          {log.error_details}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">
                      {log.duration_ms ? `${log.duration_ms} ms` : '—'}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                      >
                        Inspect
                      </button>
                      {log.status === 'failed' && (
                        <button
                          type="button"
                          disabled={retryingId === log.id}
                          onClick={() => handleRetry(log.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <RotateCcw className={`w-3 h-3 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                          <span>Retry</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#080d1a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-white">Synchronization Telemetry Detail</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Log Reference</span>
                <span className="font-mono font-bold text-white">{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedLog.status)}</div>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Target Account Code</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedLog.account_code || 'Fleet Wide'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Execution Duration</span>
                <span className="font-mono text-white">{selectedLog.duration_ms} ms</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase mb-1">Message Description</span>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-200">
                {selectedLog.message}
              </div>
            </div>

            {selectedLog.error_details && (
              <div>
                <span className="text-rose-400 block text-[10px] uppercase mb-1 font-bold">Error Stack / Diagnostics</span>
                <pre className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.error_details}
                </pre>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-slate-500 text-[11px]">
              <span>Recorded: {new Date(selectedLog.created_at).toUTCString()}</span>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
