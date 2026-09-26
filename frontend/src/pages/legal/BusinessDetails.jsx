import React from 'react';
import { Building2, Mail, MapPin, ShieldCheck, Scale, Clock, ArrowLeft, PhoneCall } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';

export const BusinessDetails = () => {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-white/10 text-neutral-200 text-xs font-semibold">
          <Building2 size={14} />
          <span>Entity & Transparency Disclosures</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Business & Legal Disclosures</h1>
        <p className="text-sm text-neutral-400">
          Statutory compliance information under Information Technology Act, 2000 & DPDP Act, 2023
        </p>
      </div>

      {/* Core Entity Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Building2 size={18} className="text-white" />
            <span>Platform Operator Details</span>
          </div>
          <div className="space-y-2 text-xs text-neutral-300">
            <p><strong className="text-white">Platform Name:</strong> Jennie Music Web Application</p>
            <p><strong className="text-white">Operator Classification:</strong> Intermediary / Independent Web Platform</p>
            <p><strong className="text-white">Primary Purpose:</strong> Non-commercial audio streaming client for royalty-free & open-license music</p>
            <p><strong className="text-white">Hosting Infrastructure:</strong> Global Edge CDN (Netlify) & Node.js API Service</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <MapPin size={18} className="text-white" />
            <span>Operational Address & Location</span>
          </div>
          <div className="space-y-2 text-xs text-neutral-300">
            <p><strong className="text-white">Country:</strong> India</p>
            <p><strong className="text-white">State:</strong> Karnataka</p>
            <p><strong className="text-white">City:</strong> Bengaluru (560001)</p>
            <p><strong className="text-white">Operating Timezone:</strong> Indian Standard Time (IST, UTC +05:30)</p>
          </div>
        </div>
      </div>

      {/* Grievance Redressal Mechanism */}
      <section className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Scale size={20} className="text-emerald-400" />
          <span>Statutory Grievance Redressal Mechanism</span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Section 8(10) of the Digital Personal Data Protection Act, 2023, the designated Grievance Officer details are published below:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#101010] border border-white/5 space-y-2 text-xs text-neutral-300">
            <p><strong className="text-white">Designation:</strong> Chief Grievance Redressal Officer</p>
            <p><strong className="text-white">Entity:</strong> Jennie Music Operations</p>
            <p><strong className="text-white">Jurisdiction:</strong> Republic of India</p>
            <p><strong className="text-white">Direct Email:</strong> <a href="mailto:grievance@jenniemusic.org" className="text-white underline">grievance@jenniemusic.org</a></p>
          </div>

          <div className="p-4 rounded-xl bg-[#101010] border border-white/5 space-y-2 text-xs text-neutral-300">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Clock size={14} className="text-emerald-400" />
              <span>Response Turnaround Commitments</span>
            </div>
            <p>• Acknowledgment of ticket receipt: <strong>Within 24 hours</strong></p>
            <p>• Full inquiry and formal grievance resolution: <strong>Within 15 business days</strong></p>
          </div>
        </div>
      </section>

      {/* Departments & Contact Directory */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">Official Contact Directory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-1">
            <strong className="text-white block text-sm">Privacy & DPDP</strong>
            <p className="text-neutral-400">Data principal requests, erasure, and access:</p>
            <a href="mailto:privacy@jenniemusic.org" className="text-white underline font-mono text-[11px] block pt-1">
              privacy@jenniemusic.org
            </a>
          </div>

          <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-1">
            <strong className="text-white block text-sm">Copyright & DMCA</strong>
            <p className="text-neutral-400">Intellectual property notices and takedowns:</p>
            <a href="mailto:copyright@jenniemusic.org" className="text-white underline font-mono text-[11px] block pt-1">
              copyright@jenniemusic.org
            </a>
          </div>

          <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-1">
            <strong className="text-white block text-sm">General Support</strong>
            <p className="text-neutral-400">Feedback, bug reports, and assistance:</p>
            <a href="mailto:support@jenniemusic.org" className="text-white underline font-mono text-[11px] block pt-1">
              support@jenniemusic.org
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
