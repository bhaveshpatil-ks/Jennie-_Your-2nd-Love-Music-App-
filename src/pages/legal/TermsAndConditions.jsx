import React from 'react';
import { FileText, ShieldAlert, Scale, AlertOctagon, CheckCircle2, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';

export const TermsAndConditions = () => {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Scale size={14} />
          <span>Legally Binding Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms and Conditions</h1>
        <p className="text-sm text-neutral-400">
          Last revised: September 25, 2026 • Effective Date: September 25, 2026
        </p>
      </div>

      {/* Overview Note */}
      <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-2">
        <p className="text-sm leading-relaxed text-neutral-300">
          Please read these Terms and Conditions (&quot;Terms&quot;, &quot;Agreement&quot;) carefully before utilizing the Jennie Music web application (&quot;Service&quot;, &quot;Platform&quot;). By accessing or using the Platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these terms, you must discontinue use immediately.
        </p>
      </div>

      {/* Section 1: Nature of the Platform */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">1. Nature of the Service & Licensing</h2>
        <p className="text-sm leading-relaxed">
          Jennie Music is a royalty-free and open-license music streaming client. We index and stream publicly available audio tracks licensed under Creative Commons (CC-BY, CC-BY-NC, CC-BY-SA) via verified public APIs (including Jamendo Music and Audius), as well as official embedded streams powered by the YouTube IFrame API.
        </p>
        <p className="text-sm leading-relaxed">
          We do not claim ownership of any third-party sound recordings, compositions, trademarks, or artwork displayed. All rights reside with their respective creators, publishers, and copyright holders.
        </p>
      </section>

      {/* Section 2: Permitted Use and Prohibitions */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">2. Permitted Use & Code of Conduct</h2>
        <p className="text-sm leading-relaxed">
          The Platform is made available strictly for personal, non-commercial enjoyment and listening. You explicitly agree NOT to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm pl-2">
          <li>Extract, rip, download, capture, or redistribute raw audio streams without author license permission.</li>
          <li>Circumvent, disable, or tamper with security features, rate limits, or digital rights management mechanisms.</li>
          <li>Deploy automated scrapers, spiders, bots, or crawlers that generate excessive API traffic or degrade service reliability.</li>
          <li>Use the Service for any unlawful, infringing, fraudulent, or defamatory purpose.</li>
          <li>Separate audio from video streams in violation of the YouTube API Services Developer Policies.</li>
        </ul>
      </section>

      {/* Section 3: Third-Party Embedded Content */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">3. YouTube API & Third-Party Service Compliance</h2>
        <p className="text-sm leading-relaxed">
          By playing content originating from YouTube on Jennie Music, you acknowledge and agree that:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm pl-2">
          <li>
            Playback utilizes the official YouTube Embedded Player in accordance with the{' '}
            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-white underline">
              YouTube Terms of Service
            </a>.
          </li>
          <li>
            Data processing by Google/YouTube is governed by the{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white underline">
              Google Privacy Policy
            </a>.
          </li>
          <li>Jennie Music is an independent software application and is not sponsored, endorsed by, or affiliated with YouTube LLC or Google LLC.</li>
        </ul>
      </section>

      {/* Section 4: Intermediary Safe Harbor & DMCA Takedown */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          4. Intermediary Status & Copyright Infringement Notice (DMCA / IT Act Sec 79)
        </h2>
        <p className="text-sm leading-relaxed">
          Jennie Music qualifies as an intermediary under <strong>Section 79 of the Information Technology Act, 2000 (India)</strong> and complies with the <strong>Digital Millennium Copyright Act (&quot;DMCA&quot;, 17 U.S.C. § 512)</strong>. We do not curate or host unauthorized recordings on our servers.
        </p>
        <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-2 text-xs">
          <strong className="text-white text-sm block">How to Submit a Takedown Notice:</strong>
          <p className="text-neutral-400">
            If you are a copyright owner or an agent authorized to act on their behalf and believe that content accessible on Jennie infringes your intellectual property, please submit a written notice containing:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-neutral-300 pl-1">
            <li>Physical or electronic signature of the authorized copyright owner.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Exact URL or track identifier identifying the material on Jennie.</li>
            <li>Your contact info (name, address, telephone number, and email).</li>
            <li>A statement of good faith belief that the use is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement made under penalty of perjury that the notification is accurate.</li>
          </ol>
          <p className="pt-1">
            Email notices to:{' '}
            <a href="mailto:copyright@jenniemusic.org" className="text-white underline font-semibold">copyright@jenniemusic.org</a>{' '}
            or our Grievance Officer at <a href="mailto:grievance@jenniemusic.org" className="text-white underline font-semibold">grievance@jenniemusic.org</a>.
          </p>
        </div>
      </section>

      {/* Section 5: Disclaimer of Warranties */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">5. Disclaimer of Warranties (&quot;As-Is&quot;)</h2>
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 space-y-2 text-xs text-neutral-300">
          <p className="uppercase font-semibold tracking-wider text-neutral-400">Legal Disclaimer</p>
          <p className="leading-relaxed">
            THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, OR UNINTERRUPTED AVAILABILITY. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE ERROR-FREE, SECURE, OR FREE FROM THIRD-PARTY OUTAGES.
          </p>
        </div>
      </section>

      {/* Section 6: Limitation of Liability */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">6. Limitation of Liability</h2>
        <p className="text-sm leading-relaxed">
          To the maximum extent permitted by applicable law, in no event shall Jennie Music, its developers, operators, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, goodwill, or audio availability resulting from your use of or inability to use the Platform.
        </p>
      </section>

      {/* Section 7: Governing Law and Jurisdiction */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">7. Governing Law & Dispute Resolution</h2>
        <p className="text-sm leading-relaxed">
          These Terms and any disputes arising out of or related to them shall be governed by and construed in accordance with the laws of <strong>India</strong>, without regard to its conflict of law principles. You consent to the exclusive jurisdiction of the competent civil courts located in <strong>Bengaluru, Karnataka, India</strong> for resolution of any claims.
        </p>
      </section>

      {/* Section 8: Amendments */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">8. Changes to Terms</h2>
        <p className="text-sm leading-relaxed">
          We reserve the right to modify these Terms at any time. When modifications are published, the &quot;Last revised&quot; date will be updated. Your continued use of the Platform after changes are posted constitutes your acceptance of the updated terms.
        </p>
      </section>
    </div>
  );
};
