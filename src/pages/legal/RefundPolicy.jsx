import React from 'react';
import { CreditCard, CheckCircle2, HelpCircle, ArrowLeft, Mail } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';

export const RefundPolicy = () => {
  const setActiveView = useLibraryStore((state) => state.setActiveView);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 text-neutral-300">
      {/* Back button */}
      <div>
        <button
          onClick={() => setActiveView('home')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Return to Home"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Header */}
      <div className="border-b border-white/10 pb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 size={14} />
          <span>100% Free Service Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Refund & Billing Policy</h1>
        <p className="text-sm text-neutral-400">
          Last updated: September 25, 2026
        </p>
      </div>

      {/* Primary Free Notice */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <CreditCard size={18} className="text-emerald-400" />
          <span>No Fees or Charges for Listening</span>
        </h2>
        <p className="text-sm leading-relaxed text-neutral-300">
          Jennie Music is a <strong>free, open streaming service</strong>. We do NOT require credit card details, do NOT sell paid subscription tiers, and do NOT charge listeners for streaming music, creating playlists, or favoriting tracks.
        </p>
        <p className="text-xs text-neutral-400">
          Because no monetary charges are levied for regular use of the Platform, there are typically no charges to refund.
        </p>
      </div>

      {/* Future Services & Voluntary Donations */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">1. Voluntary Contributions & Future Features</h2>
        <p className="text-sm leading-relaxed">
          In the event that the Platform enables voluntary community contributions, patron tips, or premium features in the future, the following refund standards shall strictly apply:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm pl-2">
          <li>
            <strong className="text-white">14-Day Refund Window:</strong> Any accidental or unauthorized charge may be requested for a full refund within 14 calendar days of the transaction date.
          </li>
          <li>
            <strong className="text-white">Processing Time:</strong> Approved refunds will be credited back to the original method of payment within 5 to 7 business days, subject to the customer&apos;s bank processing schedule.
          </li>
          <li>
            <strong className="text-white">Non-Refundable Circumstances:</strong> Charges older than 14 days or accounts suspended due to verified terms violations (such as unauthorized automated scraping) may be ineligible for refunds.
          </li>
        </ul>
      </section>

      {/* Billing Inquiries & Disputes */}
      <section className="space-y-3 p-5 rounded-2xl bg-[#141414] border border-white/10">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle size={16} className="text-white" />
          <span>Billing Support & Dispute Inquiries</span>
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          If you believe you have observed an unrecognized transaction referencing Jennie Music, please contact our support desk immediately:
        </p>
        <div className="pt-1 text-xs text-neutral-300 space-y-1">
          <p><strong className="text-white">Billing Support Email:</strong> <a href="mailto:billing@jenniemusic.org" className="text-white underline">billing@jenniemusic.org</a></p>
          <p><strong className="text-white">General Support:</strong> <a href="mailto:support@jenniemusic.org" className="text-white underline">support@jenniemusic.org</a></p>
          <p><strong className="text-white">Support SLA:</strong> First response within 24 business hours</p>
        </div>
      </section>
    </div>
  );
};
