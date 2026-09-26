import React, { useState, useEffect, useRef } from 'react';
import { Cookie, ShieldCheck, Check, X, SlidersHorizontal, ExternalLink } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';

export const CookieConsentBanner = ({ isOpenManual = false, onCloseManual }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  const [preferences, setPreferences] = useState({
    essential: true, // Always true and locked
    mediaEmbeds: true, // YouTube embed storage
    analytics: false, // Performance/telemetry
  });

  const setActiveView = useLibraryStore((state) => state.setActiveView);

  // Check stored consent on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jennie_cookie_consent');
      if (!stored) {
        setIsVisible(true);
      } else {
        const parsed = JSON.parse(stored);
        setPreferences({
          essential: true,
          mediaEmbeds: Boolean(parsed.mediaEmbeds),
          analytics: Boolean(parsed.analytics),
        });
      }
    } catch (e) {
      setIsVisible(true);
    }
  }, []);

  // Sync manual trigger from footer / cookie policy
  useEffect(() => {
    if (isOpenManual) {
      setIsModalOpen(true);
    }
  }, [isOpenManual]);

  // Handle escape key to close settings modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const saveConsent = (prefs) => {
    const consentRecord = {
      essential: true,
      mediaEmbeds: prefs.mediaEmbeds,
      analytics: prefs.analytics,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    try {
      localStorage.setItem('jennie_cookie_consent', JSON.stringify(consentRecord));
    } catch (e) {}

    setPreferences(prefs);
    setIsVisible(false);
    setIsModalOpen(false);
    if (onCloseManual) onCloseManual();
  };

  const handleAcceptAll = () => {
    saveConsent({ essential: true, mediaEmbeds: true, analytics: true });
  };

  const handleEssentialOnly = () => {
    saveConsent({ essential: true, mediaEmbeds: false, analytics: false });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseManual) onCloseManual();
  };

  return (
    <>
      {/* ---------------- FLOATING COOKIE CONSENT BANNER ---------------- */}
      {isVisible && !isModalOpen && (
        <section
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-24 md:bottom-28 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-xl z-50 p-4 sm:p-5 rounded-2xl bg-[#141414]/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-pop text-neutral-200"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
              <Cookie size={20} className="text-amber-400" />
            </div>

            <div className="space-y-2 min-w-0 flex-grow">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Cookie & Storage Consent</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">DPDP Act</span>
                </h3>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                We use browser local storage for your playlists and favorites. Third-party embeds (like the YouTube player) may set functional cookies. We do not sell your personal data or run behavioral tracking ads.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <button
                  onClick={() => setActiveView('cookies')}
                  className="text-neutral-400 hover:text-white underline"
                >
                  Cookie Policy
                </button>
                <span className="text-neutral-600">•</span>
                <button
                  onClick={() => setActiveView('privacy')}
                  className="text-neutral-400 hover:text-white underline"
                >
                  Privacy Policy
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Accept All
                </button>

                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="px-3.5 py-2 rounded-full bg-[#202020] hover:bg-[#282828] text-neutral-200 hover:text-white font-medium text-xs border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Essential Only
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 font-medium text-xs flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <SlidersHorizontal size={13} />
                  <span>Customize</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- DETAILED PREFERENCES MODAL ---------------- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
        >
          <div
            ref={modalRef}
            className="w-full max-w-lg bg-[#161616] border border-white/10 rounded-2xl p-6 shadow-2xl relative animate-pop space-y-5"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <Cookie size={18} className="text-amber-400" />
                </div>
                <div>
                  <h2 id="cookie-preferences-title" className="text-base font-bold text-white">
                    Cookie & Storage Preferences
                  </h2>
                  <p className="text-xs text-neutral-400">Custom privacy controls under India DPDP Act 2023</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close preferences"
              >
                <X size={18} />
              </button>
            </div>

            {/* Granular Options */}
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              
              {/* Essential Storage (Locked) */}
              <div className="p-3.5 rounded-xl bg-[#1F1F1F] border border-white/5 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">Essential Local Storage</strong>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Always Active
                    </span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed">
                    Necessary for storing your custom playlists, liked track IDs, volume levels, and this consent decision in your browser.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-4 h-4 mt-1 rounded text-white bg-neutral-700 cursor-not-allowed"
                  aria-label="Essential storage (Required)"
                />
              </div>

              {/* Third-Party Media Embeds */}
              <div className="p-3.5 rounded-xl bg-[#1F1F1F] border border-white/5 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">Embedded Media Cookies</strong>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      YouTube IFrame
                    </span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed">
                    Allows the YouTube Embedded Player to store functional playback cookies to optimize streaming resolution and bandwidth.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.mediaEmbeds}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, mediaEmbeds: e.target.checked }))
                    }
                    className="sr-only peer"
                    aria-label="Allow embedded media cookies"
                  />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white"></div>
                </label>
              </div>

              {/* Performance & Analytics */}
              <div className="p-3.5 rounded-xl bg-[#1F1F1F] border border-white/5 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">Anonymized Telemetry & Analytics</strong>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-700 text-neutral-300">
                      Optional
                    </span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed">
                    Helps us monitor server uptime, API rate limits, and network errors. No commercial advertising trackers are used.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                    }
                    className="sr-only peer"
                    aria-label="Allow anonymized telemetry"
                  />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white"></div>
                </label>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="px-3.5 py-2 rounded-full text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Reject Non-Essential
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Save Choices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
