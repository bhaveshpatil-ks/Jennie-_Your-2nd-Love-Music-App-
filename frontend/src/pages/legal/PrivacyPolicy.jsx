import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Mail, 
  Calendar, 
  ShieldAlert, 
  UserCheck, 
  Building, 
  Scale, 
  Check, 
  X 
} from 'lucide-react';
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 text-xs font-semibold">
          <ShieldCheck size={14} />
          <span>Digital Personal Data Protection (DPDP) Act, 2023 Compliant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-neutral-400">
          Last updated: September 26, 2026 &bull; Effective Date: September 26, 2026 &bull; DPDP Act Compliance Version: 2.1
        </p>
      </div>

      {/* DPDP Act Explicit Notice & Executive Summary */}
      <div className="p-6 rounded-2xl bg-[#121214] border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-zinc-300">
          <Scale size={20} />
          <h2 className="text-base font-bold tracking-wide">Notice Under Section 5 of the DPDP Act, 2023</h2>
        </div>
        <p className="text-sm leading-relaxed text-neutral-200">
          In accordance with the <strong>Digital Personal Data Protection Act, 2023 (India)</strong> and global privacy standards, Jennie Music provides this clear, transparent notice regarding the personal information we collect, the specific purpose for which it is processed, and our strict safeguards against unauthorized use.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Check size={14} className="text-emerald-400" /> What We Use Your Data For
            </span>
            <p className="text-neutral-400 leading-relaxed">
              Authenticating your account, protecting minor users, saving your playlists, and streaming high-fidelity audio.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <X size={14} className="text-red-400" /> What We Will NEVER Do
            </span>
            <p className="text-neutral-400 leading-relaxed">
              We never sell or rent your data, never display your DOB, never conduct behavioral ad tracking, and never profile minors.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Identification of Data Fiduciary */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">1. Identification of Data Fiduciary</h2>
        <p className="text-sm leading-relaxed">
          The Data Fiduciary responsible for determining the purpose and means of processing personal data on this application is:
        </p>
        <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-1.5 text-xs text-neutral-300">
          <p><strong className="text-white">Entity Name:</strong> Jennie Music Streaming Platform</p>
          <p><strong className="text-white">Nature of Service:</strong> High-Fidelity Music Web Player & Streaming Service</p>
          <p><strong className="text-white">Operational Jurisdiction:</strong> India & Global Web Services</p>
          <p><strong className="text-white">Official Contact Email:</strong> <a href="mailto:privacy@jenniemusic.org" className="text-white underline hover:text-neutral-200">privacy@jenniemusic.org</a></p>
          <p><strong className="text-white">Grievance Redressal Officer:</strong> Data Protection Officer (Section 10)</p>
        </div>
      </section>

      {/* Section 2: Detailed Personal Data Items & Purpose Specification */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          2. Personal Data We Collect &amp; Exact Purpose Specification
        </h2>
        <p className="text-sm leading-relaxed">
          We collect only the personal information strictly necessary for account security, legal age-gating compliance, and audio delivery:
        </p>

        {/* Item A: Email ID */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center gap-2.5 text-white">
            <Mail size={18} className="text-zinc-400" />
            <h3 className="text-base font-semibold">A. Email Address (Email ID)</h3>
          </div>
          <div className="space-y-2 text-xs leading-relaxed text-neutral-300">
            <p>
              <strong className="text-white">Why we want this information:</strong> Your email address serves as your unique, verified identifier for signing in, resetting forgotten passwords, and receiving vital account security alerts.
            </p>
            <p>
              <strong className="text-white">What we will USE it for:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-400">
              <li>Securing sign-in via Firebase Authentication (Email/Password only).</li>
              <li>Delivering the mandatory email verification link (<code className="bg-white/10 px-1 py-0.5 rounded text-white">sendEmailVerification</code>) to verify account ownership.</li>
              <li>Detecting and mitigating unauthorized brute-force login attempts via IP rate limiting.</li>
              <li>Allowing self-service password recovery if you forget your credentials.</li>
            </ul>
            <p>
              <strong className="text-white">What we will NOT use it for:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-red-400/90">
              <li>We will NEVER sell, lease, or distribute your email address to advertisers or commercial brokers.</li>
              <li>We will NEVER send unsolicited marketing spam or promotional third-party campaigns.</li>
              <li>Your email address is NEVER made public to other listeners on Jennie Music.</li>
            </ul>
          </div>
        </div>

        {/* Item B: Date of Birth */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center gap-2.5 text-white">
            <Calendar size={18} className="text-zinc-400" />
            <h3 className="text-base font-semibold">B. Date of Birth (Age-Gating &amp; AES-256-GCM Encryption)</h3>
          </div>
          <div className="space-y-2 text-xs leading-relaxed text-neutral-300">
            <p>
              <strong className="text-white">Why we want this information:</strong> Under <strong>Section 9 of the DPDP Act 2023</strong> (Obligations regarding processing of personal data of children) and international child protection statutes (COPPA), we have a legal obligation to verify that users are of lawful age to access digital services and to shield minors from explicit content.
            </p>
            <p>
              <strong className="text-white">What we will USE it for:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-400">
              <li>
                <strong className="text-white">Under 13 Hard Block:</strong> Accounts cannot be created for users under 13 years of age. Registration is immediately blocked.
              </li>
              <li>
                <strong className="text-white">13–15 Minor Tier:</strong> Automatically sets <code className="bg-white/10 px-1 py-0.5 rounded text-white">is_minor: true</code> and activates Minor Safe Mode (explicit track filtering, private profile, zero ad targeting).
              </li>
              <li>
                <strong className="text-white">16–17 Minor Tier:</strong> Provides safe listening with minor privacy protections.
              </li>
              <li>
                <strong className="text-white">18+ Full Fidelity Tier:</strong> Unrestricted listening access.
              </li>
            </ul>
            <p>
              <strong className="text-white">AES-256-GCM Military-Grade Encryption at Rest:</strong>
            </p>
            <p className="text-neutral-400">
              Your raw date of birth is immediately encrypted on our servers using authenticated <strong>AES-256-GCM</strong> encryption with unique 96-bit initialization vectors. <em>Raw dates of birth are NEVER stored in plaintext and are NEVER transmitted back to client browsers or exposed via any API.</em> Post-signup, only your derived age bracket (e.g., &quot;18+&quot; or &quot;13-15&quot;) is maintained.
            </p>
            <p>
              <strong className="text-white">What we will NOT use it for:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-red-400/90">
              <li>We will NEVER expose your birth date or age to other users or on public profiles.</li>
              <li>We will NEVER use your date of birth for targeted advertising or user profiling.</li>
              <li>We will NEVER sell your age data to third-party databases.</li>
            </ul>
          </div>
        </div>

        {/* Item C: Username & Optional Gender */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center gap-2.5 text-white">
            <UserCheck size={18} className="text-zinc-400" />
            <h3 className="text-base font-semibold">C. Username &amp; Optional Profile Attributes</h3>
          </div>
          <div className="space-y-1.5 text-xs text-neutral-300 leading-relaxed">
            <p>
              <strong className="text-white">Username:</strong> Chosen by you (3–20 characters) to identify your playlists and liked songs across devices.
            </p>
            <p>
              <strong className="text-white">Gender (Optional):</strong> Optional demographic preference used strictly for aggregate diversity reporting. You may select &quot;Prefer not to say&quot; without any impact on service access.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Data Processing Comparison Table */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">3. Clear Transparency: What We Do vs. What We Will NOT Do</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-white uppercase text-[11px] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-3.5">Data Category</th>
                <th className="p-3.5 text-emerald-400">What Jennie Music DOES with it</th>
                <th className="p-3.5 text-red-400">What Jennie Music NEVER does</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#121214] text-neutral-300">
              <tr>
                <td className="p-3.5 font-semibold text-white">Email Address</td>
                <td className="p-3.5">Authenticates sign-in, sends email verification, allows password recovery, and protects against unauthorized brute-force attacks.</td>
                <td className="p-3.5 text-red-300/90">Never sold, never rented, never shared with third-party marketers, zero advertising spam.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Date of Birth</td>
                <td className="p-3.5">Verifies age compliance under DPDP Section 9 &amp; COPPA; immediately encrypted at rest via AES-256-GCM. Derives safe content tier.</td>
                <td className="p-3.5 text-red-300/90">Never displayed publicly, never sent to browser post-signup, never used for ad targeting, never sold.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Custom Playlists &amp; Likes</td>
                <td className="p-3.5">Stored in your browser&apos;s localStorage and synced to your secure user account for seamless playback.</td>
                <td className="p-3.5 text-red-300/90">Never monetized, never shared with data brokers.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">IP Address &amp; Session Logs</td>
                <td className="p-3.5">Temporarily evaluated by our rate-limiting defense (max 3 login attempts per 5 minutes) to protect accounts from intrusion.</td>
                <td className="p-3.5 text-red-300/90">Never used to track user location across the web, transient TTL auto-deletion after 5 minutes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: User Approval & Explicit Consent Mechanism */}
      <section className="space-y-3 p-5 rounded-2xl bg-neutral-900/60 border border-white/10">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <CheckCircle2 size={18} className="text-zinc-400" />
          <span>4. User Approval &amp; Consent Mechanism (DPDP Act Section 6)</span>
        </h2>
        <p className="text-sm leading-relaxed">
          Under Section 6 of the DPDP Act 2023, consent must be free, specific, informed, unconditional, and unambiguous:
        </p>
        <ul className="list-disc list-inside space-y-2 text-xs text-neutral-300 pl-2">
          <li>
            <strong className="text-white">Affirmative Action at Signup:</strong> During account creation, you are presented with explicit consent checkboxes requiring your affirmative approval before personal data (Email &amp; Date of Birth) is collected.
          </li>
          <li>
            <strong className="text-white">Consent Review for Existing &amp; New Logins:</strong> When logging into Jennie Music, you are presented with our transparent DPDP Data Consent modal detailing the specific data held and your statutory rights.
          </li>
          <li>
            <strong className="text-white">Right to Withdraw Consent (Sec 6(4)):</strong> You may withdraw your consent at any time as easily as giving it. Withdrawing consent can be performed by deleting your account or contacting our Grievance Officer, upon which all associated personal data will be irreversibly erased within 72 hours.
          </li>
        </ul>
      </section>

      {/* Section 5: Rights of Data Principals under India's DPDP Act */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          5. Statutory Rights of Data Principals (DPDP Act 2023)
        </h2>
        <p className="text-sm leading-relaxed">
          As a Data Principal under Indian law, you are endowed with the following statutory rights:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
            <strong className="text-white text-sm block">1. Right to Access Information (Sec 11)</strong>
            <p className="text-neutral-400">
              Obtain a comprehensive summary of personal data being processed, identity of entities with whom data is shared, and processing purposes.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
            <strong className="text-white text-sm block">2. Right to Correction &amp; Erasure (Sec 12)</strong>
            <p className="text-neutral-400">
              Request immediate correction of inaccurate data, completion of incomplete records, or permanent erasure of personal data.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
            <strong className="text-white text-sm block">3. Right to Grievance Redressal (Sec 13)</strong>
            <p className="text-neutral-400">
              Register formal privacy complaints with our Grievance Officer and receive guaranteed acknowledgment within 24 hours and resolution within 15 days.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141414] border border-white/5 space-y-1">
            <strong className="text-white text-sm block">4. Right to Nominate (Sec 14)</strong>
            <p className="text-neutral-400">
              Nominate any individual who, in the event of death or incapacity, shall exercise your rights as a Data Principal.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Children's Data Protection & Anti-Tracking */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">6. Children&apos;s Privacy (DPDP Act Section 9)</h2>
        <p className="text-sm leading-relaxed">
          Jennie Music strictly abides by Section 9 of the DPDP Act 2023:
        </p>
        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/60 text-xs text-zinc-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-zinc-200">
            <ShieldAlert size={16} />
            <span>Strict Protection Against Profiling &amp; Targeted Ads for Minors</span>
          </div>
          <p>
            We do NOT engage in behavioral monitoring, tracking, or targeted advertising directed at individuals under 18 years of age. For users aged 13–17, content is strictly gated to age-appropriate safe streams, and all commercial tracking pixels are completely disabled.
          </p>
        </div>
      </section>

      {/* Section 7: Security & Encryption */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">7. Technical Security Safeguards</h2>
        <p className="text-sm leading-relaxed">
          We maintain state-of-the-art cryptographic and technical safeguards to prevent breaches:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-300 pl-2">
          <li><strong>Data at Rest:</strong> Application-layer AES-256-GCM authenticated encryption with key rotation capabilities for sensitive fields.</li>
          <li><strong>Data in Transit:</strong> Mandatory TLS 1.3 / HTTPS encryption for all client-server communications.</li>
          <li><strong>Brute-Force Protection:</strong> IP rate limiting restricting login attempts to 3 per 5-minute rolling window with automated challenge verification.</li>
          <li><strong>Audit Logging:</strong> Security logs record security events without storing raw passwords or sensitive credentials.</li>
        </ul>
      </section>

      {/* Section 8: Grievance Officer Details */}
      <section className="space-y-3 p-5 rounded-2xl bg-[#141414] border border-zinc-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Building size={18} className="text-zinc-400" />
          <span>8. Grievance Redressal Officer (Mandated under DPDP Act &amp; IT Rules 2021)</span>
        </h2>
        <p className="text-xs text-neutral-400">
          In terms of Rule 3(2) of the Information Technology (Intermediary Guidelines) Rules, 2021 and Section 8(10) of the DPDP Act 2023, you may contact our appointed Data Protection &amp; Grievance Officer:
        </p>
        <div className="pt-2 text-xs space-y-1.5 text-neutral-300">
          <p><strong className="text-white">Designation:</strong> Data Protection &amp; Grievance Redressal Officer</p>
          <p><strong className="text-white">Entity:</strong> Jennie Music Web Streaming Platform</p>
          <p><strong className="text-white">Address:</strong> Bengaluru Tech Hub, Bengaluru 560001, Karnataka, India</p>
          <p><strong className="text-white">Official Grievance Email:</strong> <a href="mailto:grievance@jenniemusic.org" className="text-zinc-300 hover:text-white underline">grievance@jenniemusic.org</a></p>
          <p><strong className="text-white">Privacy Inquiries:</strong> <a href="mailto:privacy@jenniemusic.org" className="text-zinc-300 hover:text-white underline">privacy@jenniemusic.org</a></p>
          <p><strong className="text-white">Acknowledgment Timeline:</strong> Within 24 hours of receipt</p>
          <p><strong className="text-white">Statutory Resolution Timeline:</strong> Within 15 business days</p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
