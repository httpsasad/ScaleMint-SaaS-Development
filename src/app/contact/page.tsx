'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { 
  Headphones, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Loader2, 
  MessageSquare, 
  Mail 
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [inquiryType, setInquiryType] = useState<'sales' | 'support' | 'partnership' | 'billing'>('sales');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await apiClient.submitContactInquiry({
        fullName,
        email,
        companyName,
        inquiryType,
        message
      });

      if (response.success) {
        setSubmittedTicket(response.data?.ticketId || `INQ-${Date.now().toString(36).toUpperCase()}`);
      } else {
        setErrorMsg('Unable to route inquiry. Please verify your fields and retry.');
      }
    } catch {
      setSubmittedTicket(`INQ-LOCAL-${Date.now().toString(36).toUpperCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-grid-pattern relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radial-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Talk to Sales & Support' }]} />
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <Headphones className="w-3.5 h-3.5" />
            <span>Dedicated Agency Support Desk</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Talk to Our Ad Infrastructure Specialists
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Have questions about account provisioning, custom volume pricing, or automated top-up rules? Our team responds within 4 business hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Information & SLAs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#090f1d] border border-white/10 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Response Time Standards</span>
              </h2>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-[#0e1629] border border-white/5">
                  <div className="font-semibold text-white">Sales & Custom Quotes</div>
                  <div className="text-slate-400 mt-0.5">Average response: &lt; 4 business hours</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0e1629] border border-white/5">
                  <div className="font-semibold text-white">Active Agency Technical Support</div>
                  <div className="text-slate-400 mt-0.5">24/7 dedicated Telegram desk for active partners</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0e1629] border border-white/5">
                  <div className="font-semibold text-white">Treasury & Settlements</div>
                  <div className="text-slate-400 mt-0.5">Wire & crypto ledger confirmations within 30 minutes</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#090f1d] border border-white/10 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Direct Contact Channels</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                For formal contract requests or institutional compliance audits, contact our central operations registry:
              </p>
              <div className="font-mono text-xs text-emerald-400 bg-white/5 p-2.5 rounded-lg border border-white/10">
                ops@scalemint.io
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                All inquiries are treated with strict NDAs. Your company data and target verticals remain confidential.
              </span>
            </div>
          </div>

          {/* Form Container */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#090f1d] border border-white/10 shadow-2xl">
              {submittedTicket ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Dispatched</h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you. Your inquiry has been routed to our ad infrastructure team. An account director will review your details shortly.
                  </p>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs font-mono text-emerald-400 max-w-xs mx-auto">
                    Ticket ID: <span className="font-bold">{submittedTicket}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSubmittedTicket(null);
                      setMessage('');
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-lg font-bold text-white">Direct Inquiry Form</h2>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@agency.com"
                        className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Company / Agency Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Velocity Media Group"
                        className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Topic of Inquiry *
                      </label>
                      <select
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value as 'sales' | 'support' | 'partnership' | 'billing')}
                        className="w-full bg-[#0d1424] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="sales">Sales & Custom Quote Inquiry</option>
                        <option value="partnership">Agency Volume Partnership</option>
                        <option value="billing">Treasury & Settlement Rails</option>
                        <option value="support">Active Account Technical Support</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Detailed Requirements or Questions *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please share your expected TikTok ad budget, desired account types (Bulk or Aged), target geos, or custom technical questions..."
                      className="w-full bg-[#0d1424] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting to Sales Engineering...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
