import React from 'react';
import { Cookie, Settings, CheckCircle2, Shield, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';

export const CookiePolicy = ({ onOpenCookieSettings }) => {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Cookie size={14} />
          <span>Transparent Storage & Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Cookie & Storage Policy</h1>
        <p className="text-sm text-neutral-400">
          Last updated: September 25, 2026
        </p>
      </div>

      {/* Settings Action Banner */}
      <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">Manage Your Preferences</h2>
          <p className="text-xs text-neutral-400">
            You can review or change your cookie and local storage preferences at any time.
          </p>
        </div>
        <button
          onClick={onOpenCookieSettings}
          className="px-4 py-2 rounded-pill bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-2 transition-all active:scale-95 self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Settings size={14} />
          <span>Open Cookie Settings</span>
        </button>
      </div>

      {/* Section 1: What is a cookie / local storage? */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">1. What are Cookies and Local Storage?</h2>
        <p className="text-sm leading-relaxed">
          Cookies are small text files stored on your browser when visiting websites. Similar modern web technologies include <strong>HTML5 Local Storage</strong> and <strong>Session Storage</strong>, which allow web applications to store information directly in your browser without transmitting it to an ad server with every network packet.
        </p>
        <p className="text-sm leading-relaxed">
          Jennie Music primarily utilizes <strong>browser Local Storage</strong> to remember your music selections, playlists, and audio settings locally on your machine.
        </p>
      </section>

      {/* Section 2: Storage Categories */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">2. Storage Categories We Use</h2>

        {/* Essential Storage */}
        <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>A. Strictly Necessary & Essential Storage (Always Active)</span>
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Required
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            These storage keys are essential to provide core player functionality. Without them, your custom playlists and playback state cannot be maintained:
          </p>
          <ul className="text-xs space-y-1 font-mono text-neutral-300 pl-2">
            <li>• <code className="text-neutral-200 bg-white/5 px-1 py-0.5 rounded">jennie_liked_tracks</code>: Stores the track IDs of songs you have favorited.</li>
            <li>• <code className="text-neutral-200 bg-white/5 px-1 py-0.5 rounded">jennie_custom_playlists</code>: Stores your customized playlist names and songs.</li>
            <li>• <code className="text-neutral-200 bg-white/5 px-1 py-0.5 rounded">jennie_cookie_consent</code>: Stores your cookie preference decisions so the banner does not repeatedly bother you.</li>
          </ul>
        </div>

        {/* Functional & Third-Party Embeds */}
        <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield size={16} className="text-blue-400" />
              <span>B. Third-Party Embedded Media Storage (YouTube IFrame)</span>
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
              User-Controlled
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            When streaming tracks hosted via YouTube, the embedded player may set cookies associated with the <code className="text-neutral-200 bg-white/5 px-1 py-0.5 rounded">youtube.com</code> or <code className="text-neutral-200 bg-white/5 px-1 py-0.5 rounded">youtube-nocookie.com</code> domains to ensure proper playback buffering, video quality choices, and bandwidth optimization.
          </p>
        </div>

        {/* Analytics & Marketing */}
        <div className="p-4 rounded-xl bg-[#121212] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw size={16} className="text-purple-400" />
              <span>C. Analytics & Marketing Trackers</span>
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
              None Active
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            We do not use any third-party behavioral analytics or commercial retargeting cookies.
          </p>
        </div>
      </section>

      {/* Section 3: How to manage & delete cookies */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white tracking-tight">3. How Can You Control or Clear Local Data?</h2>
        <p className="text-sm leading-relaxed">
          You have full sovereignty over your browser storage:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm pl-2">
          <li>
            <strong className="text-white">Through Jennie Music:</strong> You can click the &quot;Open Cookie Settings&quot; button above or in the footer to modify your storage permissions.
          </li>
          <li>
            <strong className="text-white">Through Your Browser:</strong> Most web browsers allow you to view, manage, and delete cookies and local storage through browser settings (e.g. Chrome Settings &gt; Privacy and Security &gt; Cookies and other site data).
          </li>
          <li>
            <strong className="text-white">In Private / Incognito Mode:</strong> If you use Private/Incognito browsing, all local storage data is automatically purged when you close the session.
          </li>
        </ul>
      </section>
    </div>
  );
};
