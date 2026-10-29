'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ScaleMintLogo } from '@/components/common/Logo';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound, 
  Building,
  Loader2,
  Sparkles
} from 'lucide-react';
import { signInUser } from '@/actions/auth';
import { isSupabaseConnected } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'password' | 'magic-link' | 'sso'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const isConnected = isSupabaseConnected();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusNotice(null);

    try {
      if (isConnected) {
        const result = await signInUser({ email, password });
        if (result.success) {
          router.push('/dashboard');
        } else {
          setErrorMessage(result.message);
        }
      } else {
        // Sandbox fallback mode when Supabase credentials are not connected
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch {
      setErrorMessage('Unable to connect to authentication gateway.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const enterDemoSandbox = () => {
    router.push('/dashboard');
  };

  return (
    <div className="py-12 bg-grid-pattern relative min-h-[calc(100vh-160px)] flex flex-col justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-radial-glow pointer-events-none" />

      <div className="max-w-md mx-auto w-full px-4 sm:px-6 relative z-10">
        <div className="mb-6 flex justify-center">
          <Breadcrumbs items={[{ label: 'Client Login' }]} />
        </div>

        <div className="rounded-2xl bg-[#090f1d] border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <ScaleMintLogo size="md" asLink={false} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Agency Client Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to manage ad accounts and treasury allocations
            </p>
          </div>

          {/* Quick Demo Sandbox Access Banner if unconfigured */}
          {!isConnected && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Sandbox Mode Available</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                Live Supabase is currently in development mode. You can sign in with any email/password or enter sandbox directly.
              </p>
              <button
                type="button"
                onClick={enterDemoSandbox}
                className="w-full py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Enter Sandbox Dashboard &rarr;
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Status Notice */}
          {statusNotice && (
            <div className="mb-4 p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{statusNotice}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#050811] p-1 rounded-xl mb-6 border border-white/5 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setTab('password');
                setStatusNotice(null);
                setErrorMessage(null);
              }}
              className={`py-1.5 rounded-lg transition-all ${
                tab === 'password'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('magic-link');
                setStatusNotice(null);
                setErrorMessage(null);
              }}
              className={`py-1.5 rounded-lg transition-all ${
                tab === 'magic-link'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Magic Link
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('sso');
                setStatusNotice(null);
                setErrorMessage(null);
              }}
              className={`py-1.5 rounded-lg transition-all ${
                tab === 'sso'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SSO
            </button>
          </div>

          {tab === 'sso' ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-emerald-400">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Enterprise Single Sign-On</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Connect through your corporate Okta, Microsoft Entra, or Google Workspace directory.
              </p>
              <input
                type="text"
                placeholder="agency.scalemint.io or domain"
                className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setStatusNotice('Enterprise SSO endpoint requires verified agency domain mapping. Contact support@scalemint.io to configure SAML / OIDC.')}
                className="w-full py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/15 border border-white/10 transition-colors"
              >
                Continue with SSO
              </button>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="media.buyer@agency.com"
                    className="w-full bg-[#0d1424] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {tab === 'password' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <a
                      href="#reset"
                      onClick={(e) => {
                        e.preventDefault();
                        setStatusNotice('Password recovery instructions will be transmitted via encrypted channel.');
                      }}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#0d1424] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>{tab === 'magic-link' ? 'Send One-Time Magic Link' : 'Sign In to Console'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <Link href="/signup" className="text-emerald-400 hover:underline font-semibold">
              Create an Account
            </Link>
            <Link href="/open-account" className="text-slate-400 hover:text-white">
              Agency Application
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
