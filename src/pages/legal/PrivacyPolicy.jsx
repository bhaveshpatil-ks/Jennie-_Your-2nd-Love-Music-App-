import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, AlertTriangle, ArrowLeft, Mail, MapPin, Building, Globe } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';

export const PrivacyPolicy = () => {
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
          <ShieldCheck size={14} />
          <span>DPDP Act 2023 & GDPR Compliant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-neutral-400">
          Last updated: September 25, 2026 • Effective Date: September 25, 2026
        </p>
      </div>

      {/* Summary Box */}
      <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Lock size={16} className="text-white" />
          <span>Our Privacy Commitment & Data Minimization</span>
        </h2>
        <p className="text-sm leading-relaxed text-neutral-300">
          At Jennie Music (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we operate under a strict principle of <strong>Data Minimization</strong>. We do not require account registration, do not sell your personal data, do not profile you for behavioral advertising, and only store what is strictly necessary to enable your audio playback, playlists, and user preferences.
        </p>
      </div>

      {/* Section 1: Data Fiduciary Details */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">1. Identification of Data Fiduciary</h2>
        <p className="text-sm leading-relaxed">
          Under the <strong>Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;)</strong> of India and global data privacy standards, the Data Fiduciary responsible for processing any data on this platform is:
        </p>
        <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-1.5 text-xs text-neutral-300">
          <p><strong className="text-white">Entity Name:</strong> Jennie Music Streaming Platform</p>
          <p><strong className="text-white">Nature of Service:</strong> Free and Open-License Music Web Player</p>
          <p><strong className="text-white">Operating Location:</strong> Bengaluru, Karnataka, India</p>
          <p><strong className="text-white">Official Contact Email:</strong> <a href="mailto:privacy@jenniemusic.org" className="text-white underline hover:text-neutral-200">privacy@jenniemusic.org</a></p>
          <p><strong className="text-white">Grievance Officer:</strong> Appointed Grievance Redressal Officer (Details in Section 10)</p>
        </div>
      </section>

      {/* Section 2: What Data We Collect */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">2. Information We Collect (Only Necessary Data)</h2>
        <p className="text-sm leading-relaxed">
          We strictly adhere to the principle that only data essential for service delivery is collected:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm pl-2">
          <li>
            <strong className="text-white">Client-side Preferences & State:</strong> Your custom playlist names, playlist descriptions, liked track identifiers, player volume level, and repeat/shuffle settings are saved directly in your browser&apos;s local storage (<code className="text-xs bg-white/10 px-1 py-0.5 rounded text-neutral-200">localStorage</code>).
          </li>
          <li>
            <strong className="text-white">Sync Data (Optional):</strong> When backend database persistence is active, playlist titles, descriptions, and favorite track IDs are processed by our secure API to ensure cross-session preservation. No email, name, phone number, or government identifier is tied to these entries.
          </li>
          <li>
            <strong className="text-white">Technical Network Logs:</strong> Our hosting servers (e.g., Netlify / Node.js) automatically log standard HTTP requests (IP address, browser user-agent, timestamp) strictly for DDoS mitigation, rate limiting (300 requests / 15 minutes), and system stability. These server logs are transient and not used to identify individuals.
          </li>
        </ul>
      </section>

      {/* Section 3: Third-Party Embeds and Services */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">3. Third-Party Embeds & External APIs</h2>
        <p className="text-sm leading-relaxed">
          To provide diverse catalog coverage, our platform interacts with reputable third-party content providers:
        </p>
        <div className="space-y-3 pt-1">
          <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-1.5">
            <h3 className="text-sm font-semibold text-white">A. YouTube IFrame Player API (Google LLC)</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              When playing YouTube-hosted audio and video, our player utilizes the official YouTube IFrame Player. Interaction with this player is governed by the{' '}
              <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-white underline">
                YouTube Terms of Service
              </a>{' '}
              and the{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white underline">
                Google Privacy Policy
              </a>.
              YouTube may set third-party cookies or capture playback telemetry in accordance with their privacy policies.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-1.5">
            <h3 className="text-sm font-semibold text-white">B. Jamendo Music API & Audius</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Royalty-free catalog search and audio streaming requests are routed via Jamendo&apos;s API under Creative Commons licenses and Audius decentralized protocol. These queries transmit search parameters and receive track metadata without passing any personal profile data.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-1.5">
            <h3 className="text-sm font-semibold text-white">C. Google Fonts & Unsplash Images</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Typography is loaded via Google Fonts and cover art is delivered through Unsplash CDN under their respective permissible open licenses.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Analytics and Tracking */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">4. Analytics & Tracking Policy</h2>
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Zero Third-Party Advertising Trackers</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            We do NOT load Google Analytics, Meta Pixel, TikTok Pixel, Hotjar, or cross-site tracking beacons. We do not participate in advertising networks or data broker exchanges. Any platform performance telemetry is strictly anonymized and aggregated.
          </p>
        </div>
      </section>

      {/* Section 5: India's DPDP Act 2023 Rights */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          5. Rights of Data Principals under India&apos;s DPDP Act, 2023
        </h2>
        <p className="text-sm leading-relaxed">
          If you are accessing this service in India or your personal data is subject to the Digital Personal Data Protection Act, 2023, you hold the following statutory rights as a &quot;Data Principal&quot;:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
            <strong className="text-white text-sm block">1. Right to Access Information (Sec 11)</strong>
            <p className="text-neutral-400">
              You have the right to obtain a summary of personal data being processed, processing activities undertaken, and identities of all entities with whom data is shared.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
            <strong className="text-white text-sm block">2. Right to Correction & Erasure (Sec 12)</strong>
            <p className="text-neutral-400">
              You can request correction of inaccurate data, updating of incomplete records, or immediate erasure of personal data that is no longer required for the purpose for which it was collected.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
            <strong className="text-white text-sm block">3. Right to Grievance Redressal (Sec 13)</strong>
            <p className="text-neutral-400">
              You have the right to register grievances with our designated Grievance Officer and receive formal resolution within 15 days.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
            <strong className="text-white text-sm block">4. Right to Nominate (Sec 14)</strong>
            <p className="text-neutral-400">
              You possess the right to nominate any individual who, in the event of death or incapacity, shall exercise your rights as a Data Principal.
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-400">
          To exercise any of these rights, email our Grievance Officer at{' '}
          <a href="mailto:grievance@jenniemusic.org" className="text-white underline">grievance@jenniemusic.org</a>.
        </p>
      </section>

      {/* Section 6: Children's Data Protection */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">6. Children&apos;s Privacy (DPDP Act Section 9)</h2>
        <p className="text-sm leading-relaxed">
          In strict compliance with Section 9 of the DPDP Act 2023, Jennie Music does NOT conduct tracking, behavioral monitoring, or targeted advertising directed at individuals under 18 years of age. The platform does not collect age or child identification data.
        </p>
      </section>

      {/* Section 7: Data Retention & Security */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">7. Security Safeguards & Retention (Sec 8(5))</h2>
        <p className="text-sm leading-relaxed">
          We maintain reasonable security safeguards to prevent personal data breaches, including HTTPS/TLS encryption in transit, strict rate-limiting against automated abuse, and local storage containment. Your locally stored playlists and likes remain on your device until you manually clear your browser storage or click delete in the app.
        </p>
      </section>

      {/* Section 8: Cookie and Storage Consent */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">8. Consent Mechanism & Withdrawal</h2>
        <p className="text-sm leading-relaxed">
          Your consent to data processing is requested via our Cookie & Data Consent Banner and form consent checkboxes. In accordance with Section 6(4) of the DPDP Act 2023, you have the right to withdraw your consent at any time as easily as giving it, by clearing your cookies/localStorage or clicking &quot;Cookie Settings&quot; in our footer.
        </p>
      </section>

      {/* Section 9: International Transfers */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">9. Cross-Border Data Transfers</h2>
        <p className="text-sm leading-relaxed">
          Audio stream CDN delivery and external API queries may be processed via global cloud networks in accordance with applicable Indian Central Government transfer regulations and standard contractual privacy clauses.
        </p>
      </section>

      {/* Section 10: Grievance Officer Details */}
      <section className="space-y-3 p-5 rounded-2xl bg-[#141414] border border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Building size={18} className="text-white" />
          <span>10. Grievance Redressal Officer (Mandated under DPDP Act & IT Rules 2021)</span>
        </h2>
        <p className="text-xs text-neutral-400">
          In terms of Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Section 8(10) of the DPDP Act 2023, the details of the Grievance Redressal Officer are:
        </p>
        <div className="pt-2 text-xs space-y-1.5 text-neutral-300">
          <p><strong className="text-white">Designation:</strong> Data Protection & Grievance Redressal Officer</p>
          <p><strong className="text-white">Entity:</strong> Jennie Music Web Platform</p>
          <p><strong className="text-white">Address:</strong> Bengaluru Tech Hub, Bengaluru 560001, Karnataka, India</p>
          <p><strong className="text-white">Email:</strong> <a href="mailto:grievance@jenniemusic.org" className="text-white underline">grievance@jenniemusic.org</a></p>
          <p><strong className="text-white">Acknowledgment Timeline:</strong> Within 24 hours of receipt</p>
          <p><strong className="text-white">Resolution Timeline:</strong> Within 15 business days</p>
        </div>
      </section>
    </div>
  );
};
