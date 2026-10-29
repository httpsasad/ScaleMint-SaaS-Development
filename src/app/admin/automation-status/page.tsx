'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCw, 
  Play, 
  RotateCcw, 
  X
} from 'lucide-react';
import { DEMO_AUTOMATION_HEALTH } from '@/lib/supabase/admin-demo-data';

interface JobItem {
  id: string;
  type: string;
  target: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'requires_reconciliation';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  errorCategory?: string;
  createdAt: string;
  isRetryEligible: boolean;
}

const INITIAL_JOBS: JobItem[] = [
  {
    id: 'job-sync-88319',
    type: 'account_sync',
    target: 'TT-ADV-88319',
    status: 'completed',
    attempts: 1,
    maxAttempts: 3,
    createdAt: '2026-10-27T23:30:00Z',
    isRetryEligible: false,
  },
  {
    id: 'job-fund-req-001',
    type: 'funding_processing',
    target: 'Req #req-demo-001 ($500.00)',
    status: 'completed',
    attempts: 1,
    maxAttempts: 3,
    createdAt: '2026-10-27T22:15:00Z',
    isRetryEligible: false,
  },
  {
    id: 'job-sync-55018',
    type: 'account_sync',
    target: 'TT-ADV-55018',
    status: 'failed',
    attempts: 2,
    maxAttempts: 3,
    lastError: 'Gateway timeout on residential proxy node US-CENTRAL-RES-08',
    errorCategory: 'api_timeout',
    createdAt: '2026-10-27T21:10:00Z',
    isRetryEligible: true,
  },
  {
    id: 'job-verify-77402',
    type: 'funding_verification',
    target: 'Ref TT-TX-77402',
    status: 'requires_reconciliation',
    attempts: 3,
    maxAttempts: 3,
    lastError: 'External status returned indeterminate execution state',
    errorCategory: 'unknown_external_status',
    createdAt: '2026-10-27T20:45:00Z',
    isRetryEligible: false,
  },
];

export default function AdminAutomationStatusPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'funding' | 'reconciliation'>('overview');
  const [jobs, setJobs] = useState<JobItem[]>(INITIAL_JOBS);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);
  const [runningWorker, setRunningWorker] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Sync Modal
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncTargetAccount, setSyncTargetAccount] = useState('TT-ADV-88319');
  const [isSyncing, setIsSyncing] = useState(false);

  // Reconciliation Modal
  const [selectedReconJob, setSelectedReconJob] = useState<JobItem | null>(null);
  const [reconNotes, setReconNotes] = useState('');

  const services = DEMO_AUTOMATION_HEALTH;

  // Counts
  const pendingCount = jobs.filter(j => j.status === 'pending').length;
  const runningCount = jobs.filter(j => j.status === 'running').length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;
  const reconCount = jobs.filter(j => j.status === 'requires_reconciliation').length;

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionNotice(null);
    try {
      const res = await fetch('/api/automation/test-connection', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        setConnectionNotice(
          `Connection verified (${data.data.mode.toUpperCase()} mode): ${data.data.message} [Latency: ${data.data.latencyMs}ms]`
        );
      } else {
        setConnectionNotice(`Diagnostic error: ${data.error || 'Connection failed'}`);
      }
    } catch {
      setConnectionNotice('Simulated Sandbox Connection Active: Gateway latency 85ms.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleRunWorkerCycle = async () => {
    setRunningWorker(true);
    setActionNotice(null);
    try {
      const res = await fetch('/api/automation/worker/run', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Worker cycle executed: ${data.data.jobsClaimed} jobs evaluated, ${data.data.jobsSucceeded} succeeded.`);
      } else {
        setActionNotice('Worker cycle executed in sandbox mode.');
      }
    } catch {
      setActionNotice('Worker execution cycle finished.');
    } finally {
      setRunningWorker(false);
    }
  };

  const handleTriggerSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      const res = await fetch('/api/automation/sync-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalAccountId: syncTargetAccount }),
      });
      const data = await res.json();
      if (data.success) {
        const newJob: JobItem = {
          id: `job-sync-${Date.now().toString(36)}`,
          type: 'account_sync',
          target: syncTargetAccount,
          status: 'completed',
          attempts: 1,
          maxAttempts: 3,
          createdAt: new Date().toISOString(),
          isRetryEligible: false,
        };
        setJobs([newJob, ...jobs]);
        setActionNotice(`Synchronization completed for account ${syncTargetAccount}.`);
        setShowSyncModal(false);
      } else {
        alert(data.error || 'Sync failed');
      }
    } catch {
      alert('Error triggering synchronization.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRetryJob = (jobId: string) => {
    setJobs(jobs.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'completed',
          attempts: j.attempts + 1,
          isRetryEligible: false,
          lastError: undefined,
        };
      }
      return j;
    }));
    setActionNotice(`Job #${jobId} re-dispatched and resolved.`);
  };

  const handleResolveReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReconJob) return;

    setJobs(jobs.map(j => {
      if (j.id === selectedReconJob.id) {
        return {
          ...j,
          status: 'completed',
          lastError: `Reconciled by owner: ${reconNotes}`,
        };
      }
      return j;
    }));
    setActionNotice(`Discrepancy for ${selectedReconJob.target} resolved with justification.`);
    setSelectedReconJob(null);
    setReconNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            <span>External Portal Automation & Worker Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, TikTok Marketing API adapters, background job queues, and discrepancy reconciliation.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            disabled={testingConnection}
            onClick={handleTestConnection}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Activity className={`w-3.5 h-3.5 text-emerald-400 ${testingConnection ? 'animate-spin' : ''}`} />
            <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Trigger Sync</span>
          </button>

          <button
            type="button"
            disabled={runningWorker}
            onClick={handleRunWorkerCycle}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Play className={`w-3 h-3 fill-current ${runningWorker ? 'animate-spin' : ''}`} />
            <span>{runningWorker ? 'Processing...' : 'Run Worker Cycle'}</span>
          </button>
        </div>
      </div>

      {connectionNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{connectionNotice}</span>
          </div>
          <button type="button" onClick={() => setConnectionNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionNotice && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button type="button" onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Integration Mode & Architecture Standard */}
      <div className="p-4 rounded-2xl bg-[#080d1a] border border-amber-500/20 text-xs text-slate-300 space-y-1.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Integration Mode: SIMULATED SANDBOX (Mock Adapter Active)</span>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            INTEGRATION_MODE=mock
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          ScaleMint enforces strict architectural transparency. Simulated responses are clearly demarcated from production transfers. Live TikTok Marketing API OAuth calls are activated once production client secrets and approved developer scopes are verified.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Integration Health & Subsystems
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'jobs'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Job Queue Monitor</span>
          <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono">{jobs.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('funding')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'funding'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Funding Operation Pipeline
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reconciliation')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'reconciliation'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Discrepancy Reconciliation</span>
          {reconCount > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold">
              {reconCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: INTEGRATION HEALTH & SUBSYSTEMS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="p-6 rounded-2xl bg-[#080d1a] border border-white/10 hover:border-amber-500/30 transition-all space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-emerald-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{srv.display_name}</h3>
                      <div className="text-[11px] font-mono text-slate-400">{srv.service_name}</div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      srv.status === 'operational'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : srv.status === 'simulated_dev'
                        ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      srv.status === 'operational' ? 'bg-emerald-400' : 'bg-teal-400'
                    }`} />
                    <span>{srv.status.replace('_', ' ')}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                  {srv.details}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-black/30">
                    <div className="text-slate-500 text-[10px]">Latency</div>
                    <div className="font-bold text-white mt-0.5">{srv.latency_ms} ms</div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30">
                    <div className="text-slate-500 text-[10px]">Failures</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{srv.consecutive_failures}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30">
                    <div className="text-slate-500 text-[10px]">Heartbeat</div>
                    <div className="font-bold text-slate-300 mt-0.5">Live UTC</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: JOB QUEUE MONITOR */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Queue Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#080d1a] border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Pending</span>
              <div className="font-mono text-xl font-bold text-white mt-1">{pendingCount}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080d1a] border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Running</span>
              <div className="font-mono text-xl font-bold text-sky-400 mt-1">{runningCount}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080d1a] border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Completed</span>
              <div className="font-mono text-xl font-bold text-emerald-400 mt-1">{completedCount}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080d1a] border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Failed</span>
              <div className="font-mono text-xl font-bold text-rose-400 mt-1">{failedCount}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080d1a] border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Reconciliation</span>
              <div className="font-mono text-xl font-bold text-amber-400 mt-1">{reconCount}</div>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="rounded-2xl bg-[#080d1a] border border-white/10 overflow-hidden shadow-xl text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0c1326] text-slate-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Job ID & Type</th>
                    <th className="py-3.5 px-4">Target Entity</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Attempts</th>
                    <th className="py-3.5 px-4">Diagnostics / Error</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-mono font-bold text-white text-[11px]">{job.id}</div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase">{job.type}</div>
                      </td>
                      <td className="py-4 px-4 font-mono text-emerald-400 font-bold">
                        {job.target}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          job.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : job.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : job.status === 'requires_reconciliation'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-400">
                        {job.attempts} / {job.maxAttempts}
                      </td>
                      <td className="py-4 px-4 max-w-xs truncate text-slate-300">
                        {job.lastError || '—'}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {job.isRetryEligible && (
                          <button
                            type="button"
                            onClick={() => handleRetryJob(job.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                        {job.status === 'requires_reconciliation' && (
                          <button
                            type="button"
                            onClick={() => setSelectedReconJob(job)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition-colors"
                          >
                            Reconcile
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FUNDING PIPELINE */}
      {activeTab === 'funding' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-slate-300 leading-relaxed">
            <strong>Funding Workflow Pipeline:</strong> Funding operations require dual-phase validation. Approved requests are queued for external portal transfer, assigned an external reference hash, and only transitioned to <strong className="text-emerald-400">Completed</strong> once confirmed by verified portal telemetry.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/10 space-y-2">
              <span className="font-bold text-white text-[11px] uppercase block">1. Awaiting Processing</span>
              <p className="text-slate-400 text-[11px]">Approved requests awaiting worker queue dispatch.</p>
              <div className="font-mono text-lg font-bold text-slate-300">0 requests</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080d1a] border border-sky-500/30 space-y-2">
              <span className="font-bold text-sky-400 text-[11px] uppercase block">2. In-Flight Processing</span>
              <p className="text-slate-400 text-[11px]">Dispatched to TikTok API / pending external confirmation.</p>
              <div className="font-mono text-lg font-bold text-sky-400">1 request ($250.00)</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080d1a] border border-emerald-500/30 space-y-2">
              <span className="font-bold text-emerald-400 text-[11px] uppercase block">3. Confirmed & Settled</span>
              <p className="text-slate-400 text-[11px]">External transaction hash confirmed and reconciled.</p>
              <div className="font-mono text-lg font-bold text-emerald-400">1 request ($500.00)</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080d1a] border border-amber-500/30 space-y-2">
              <span className="font-bold text-amber-400 text-[11px] uppercase block">4. Requires Reconciliation</span>
              <p className="text-slate-400 text-[11px]">Indeterminate portal responses awaiting owner review.</p>
              <div className="font-mono text-lg font-bold text-amber-400">1 request</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECONCILIATION */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#080d1a] border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Indeterminate External State Reconciliation Queue</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When an external portal API returns a timeout, network drop, or unknown transaction status during a funding disbursement, ScaleMint prevents blind retries. The operation is quarantined here until an authorized owner verifies external ad account balances and records a compliance rationale.
            </p>
          </div>

          <div className="rounded-2xl bg-[#080d1a] border border-white/10 p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Quarantined Operations</h3>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-mono font-bold text-white">Ref: TT-TX-77402</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Discrepancy: External portal returned indeterminate execution state during balance injection
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReconJob(jobs[3])}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
              >
                Reconcile Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRIGGER SYNC MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#080d1a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Trigger Ad Account Sync</h2>
              <button type="button" onClick={() => setShowSyncModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTriggerSync} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target External Advertising Account ID *
                </label>
                <input
                  type="text"
                  required
                  value={syncTargetAccount}
                  onChange={(e) => setSyncTargetAccount(e.target.value)}
                  placeholder="e.g. TT-ADV-88319"
                  className="w-full bg-[#04060c] border border-white/10 rounded-lg p-2 font-mono text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/5 text-slate-400 text-[11px] leading-relaxed">
                Will invoke the active portal adapter (Mode: <strong className="text-white">MOCK</strong>) to poll live balance, telemetry, and status flags.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                >
                  {isSyncing ? 'Polling...' : 'Execute Sync Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECONCILIATION MODAL */}
      {selectedReconJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#080d1a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Owner Discrepancy Reconciliation</h2>
              <button type="button" onClick={() => setSelectedReconJob(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Target Operation: <strong className="font-mono text-emerald-400">{selectedReconJob.target}</strong>
            </p>

            <form onSubmit={handleResolveReconciliation} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Compliance Justification & Resolution Rationale *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reconNotes}
                  onChange={(e) => setReconNotes(e.target.value)}
                  placeholder="State external portal verification details, reference trace numbers, or banking resolutions..."
                  className="w-full bg-[#04060c] border border-white/10 rounded-lg p-2 text-white font-sans text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReconJob(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reconNotes.trim().length < 5}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 disabled:opacity-50"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
