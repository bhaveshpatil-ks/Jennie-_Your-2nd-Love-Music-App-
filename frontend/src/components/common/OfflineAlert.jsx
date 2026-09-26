import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';

export const OfflineAlert = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (dismissed && !showReconnected) return null;
  if (!isOffline && !showReconnected) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-auto max-w-lg transition-all duration-300"
    >
      {isOffline ? (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-[#121216]/95 border border-amber-500/40 text-neutral-200 shadow-2xl backdrop-blur-xl animate-luxury-fade">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <div className="text-left min-w-0 pr-1">
              <p className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span>You are currently offline</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
              </p>
              <p className="text-[11px] text-neutral-400 truncate">
                Playback will continue from cached tracks. Reconnect to stream.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-neutral-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
            aria-label="Dismiss offline notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : showReconnected ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#101913]/95 border border-emerald-500/40 text-neutral-200 shadow-2xl backdrop-blur-xl animate-luxury-fade">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wifi className="w-3.5 h-3.5" />
          </span>
          <div className="text-left">
            <p className="text-xs font-semibold text-emerald-300 tracking-tight">
              Connection Restored
            </p>
            <p className="text-[11px] text-neutral-400">
              Streaming resumed at full studio master quality.
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  );
};

export default OfflineAlert;
