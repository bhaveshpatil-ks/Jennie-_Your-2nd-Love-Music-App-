import React from 'react';
import { ShieldCheck, Scale, Cookie, CreditCard, Building2, ExternalLink } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';

export const Footer = ({ onOpenCookieSettings }) => {
  const setActiveView = useLibraryStore((state) => state.setActiveView);

  return (
    <footer
      role="contentinfo"
      className="mt-16 pt-8 pb-10 border-t border-white/[0.08] text-xs text-neutral-400 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Brand & Purpose */}
        <div className="space-y-1.5 max-w-sm">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <span>Jennie Music</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
              Open Stream
            </span>
          </div>
          <p className="text-neutral-400 leading-relaxed text-[11px]">
            A non-commercial client for royalty-free and open-access music. Content streamed under Creative Commons and official third-party embed licenses.
          </p>
          <p className="text-neutral-400 text-[10px]">
            Bengaluru, Karnataka, India • Grievance Officer: <a href="mailto:grievance@jenniemusic.org" className="text-neutral-300 underline">grievance@jenniemusic.org</a>
          </p>
        </div>

        {/* Legal Navigation Links */}
        <nav aria-label="Legal and Compliance Navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <button
            onClick={() => setActiveView('privacy')}
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-0.5"
          >
            Privacy Policy (DPDP)
          </button>
          <button
            onClick={() => setActiveView('terms')}
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-0.5"
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => setActiveView('cookies')}
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-0.5"
          >
            Cookie Policy
          </button>
          <button
            onClick={onOpenCookieSettings}
            className="hover:text-white transition-colors text-amber-400/90 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-0.5"
          >
            Cookie Settings
          </button>
          <button
            onClick={() => setActiveView('refund')}
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-0.5"
          >
            Refund Policy
          </button>
          <button
            onClick={() => setActiveView('business')}
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-0.5"
          >
            Business Details
          </button>
        </nav>
      </div>

      {/* Disclaimers & Copyright Notice */}
      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-neutral-400">
        <div>
          <span>© 2026 Jennie Music. All rights to respective music artists and sound recordings are reserved under their specific CC licenses.</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-300 flex items-center gap-1"
          >
            <span>YouTube Terms</span>
            <ExternalLink size={10} />
          </a>
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-300 flex items-center gap-1"
          >
            <span>Google Privacy</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </footer>
  );
};
