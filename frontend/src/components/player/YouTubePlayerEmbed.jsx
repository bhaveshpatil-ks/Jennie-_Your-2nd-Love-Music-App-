import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Video, X } from 'lucide-react';

export const YouTubePlayerEmbed = () => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const isIframeReadyRef = useRef(false);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const isVideoMode = usePlayerStore((state) => state.isVideoMode);
  const toggleVideoMode = usePlayerStore((state) => state.toggleVideoMode);
  const registerYouTubeController = usePlayerStore((state) => state.registerYouTubeController);
  const nextTrack = usePlayerStore((state) => state.nextTrack);

  const cleanYoutubeId =
    currentTrack?.youtubeId ||
    (typeof currentTrack?.id === 'string' && currentTrack.id.startsWith('yt-')
      ? currentTrack.id.replace('yt-', '')
      : null);

  const isYouTubeTrack = currentTrack?.source === 'youtube' || Boolean(cleanYoutubeId);

  // Active YouTube video ID driving the iframe
  const [activeVideoId, setActiveVideoId] = useState(cleanYoutubeId || 'jfKfPfyJRdk');

  // Convert volume from 0..1 to YouTube 0..100
  const getScaledVolume = useCallback(() => {
    const vol = usePlayerStore.getState().volume;
    const rawVal = typeof vol === 'number' ? vol : 1.0;
    const scaled = rawVal <= 1 ? Math.round(rawVal * 100) : Math.round(rawVal);
    return Math.max(0, Math.min(100, scaled));
  }, []);

  // Send raw postMessage command to YouTube iframe safely
  const sendIframeCommand = useCallback((func, args = []) => {
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    } catch (_) {}
  }, []);

  // When iframe loads, announce listener and sync initial state
  const handleIframeLoad = () => {
    isIframeReadyRef.current = true;
    try {
      // Register postMessage listening with YouTube embed
      sendIframeCommand('listening', []);
      sendIframeCommand('addEventListener', ['onStateChange']);
      sendIframeCommand('unMute', []);
      sendIframeCommand('setVolume', [isMuted ? 0 : getScaledVolume()]);
      if (usePlayerStore.getState().isPlaying) {
        sendIframeCommand('playVideo', []);
      }
    } catch (_) {}
  };

  // Register YouTube controller methods into player store
  useEffect(() => {
    registerYouTubeController({
      play: () => {
        sendIframeCommand('unMute', []);
        sendIframeCommand('setVolume', [getScaledVolume()]);
        sendIframeCommand('playVideo', []);
      },
      pause: () => {
        sendIframeCommand('pauseVideo', []);
      },
      loadVideo: (videoId) => {
        if (!videoId) return;
        setActiveVideoId(videoId);
        sendIframeCommand('loadVideoById', [videoId, 0]);
        sendIframeCommand('unMute', []);
        sendIframeCommand('setVolume', [getScaledVolume()]);
        sendIframeCommand('playVideo', []);
      },
      seekTo: (seconds) => {
        sendIframeCommand('seekTo', [seconds, true]);
      },
      setVolume: (vol) => {
        const rawVal = typeof vol === 'number' ? vol : 1.0;
        const scaled = rawVal <= 1 ? Math.round(rawVal * 100) : Math.round(rawVal);
        const clamped = Math.max(0, Math.min(100, scaled));
        sendIframeCommand('setVolume', [clamped]);
      },
      mute: () => {
        sendIframeCommand('mute', []);
      },
      unMute: () => {
        sendIframeCommand('unMute', []);
        sendIframeCommand('setVolume', [getScaledVolume()]);
      },
      stop: () => {
        sendIframeCommand('stopVideo', []);
      },
    });
  }, [registerYouTubeController, sendIframeCommand, getScaledVolume]);

  // Synchronize currentTrack changes with the YouTube iframe
  useEffect(() => {
    if (!cleanYoutubeId) return;

    if (activeVideoId !== cleanYoutubeId) {
      setActiveVideoId(cleanYoutubeId);
      sendIframeCommand('loadVideoById', [cleanYoutubeId, 0]);
      sendIframeCommand('unMute', []);
      sendIframeCommand('setVolume', [isMuted ? 0 : getScaledVolume()]);
      if (isPlaying) {
        sendIframeCommand('playVideo', []);
      }
    } else if (isPlaying) {
      sendIframeCommand('unMute', []);
      sendIframeCommand('setVolume', [isMuted ? 0 : getScaledVolume()]);
      sendIframeCommand('playVideo', []);
    }
  }, [cleanYoutubeId, isPlaying, isMuted, activeVideoId, sendIframeCommand, getScaledVolume]);

  // Handle play / pause store state
  useEffect(() => {
    if (!isYouTubeTrack) return;
    if (isPlaying) {
      sendIframeCommand('unMute', []);
      sendIframeCommand('setVolume', [isMuted ? 0 : getScaledVolume()]);
      sendIframeCommand('playVideo', []);
    } else {
      sendIframeCommand('pauseVideo', []);
    }
  }, [isPlaying, isMuted, isYouTubeTrack, sendIframeCommand, getScaledVolume]);

  // Handle volume / mute store state
  useEffect(() => {
    if (!isYouTubeTrack) return;
    if (isMuted) {
      sendIframeCommand('mute', []);
    } else {
      sendIframeCommand('unMute', []);
      sendIframeCommand('setVolume', [getScaledVolume()]);
    }
  }, [volume, isMuted, isYouTubeTrack, sendIframeCommand, getScaledVolume]);

  // Direct postMessage listener to capture YouTube playback ticks & state updates
  useEffect(() => {
    const handleWindowMessage = (event) => {
      if (!event.data) return;
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (_) {
            return;
          }
        }

        if (data && data.event === 'onReady') {
          isIframeReadyRef.current = true;
          sendIframeCommand('unMute', []);
          sendIframeCommand('setVolume', [getScaledVolume()]);
          if (usePlayerStore.getState().isPlaying) {
            sendIframeCommand('playVideo', []);
          }
          return;
        }

        if (data && data.event === 'infoDelivery' && data.info) {
          const store = usePlayerStore.getState();
          const { currentTime, duration, playerState } = data.info;

          if (typeof playerState === 'number') {
            // YouTube PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            if (playerState === 1 && !store.isPlaying) {
              usePlayerStore.setState({ isPlaying: true });
            } else if (playerState === 2) {
              // Resilient auto-resume: if YouTube pauses due to tab minimize or focus loss while store expects playing
              if (store.isPlaying) {
                setTimeout(() => {
                  if (usePlayerStore.getState().isPlaying) {
                    sendIframeCommand('unMute', []);
                    sendIframeCommand('playVideo', []);
                  }
                }, 120);
              }
            } else if (playerState === 5 || playerState === -1) {
              if (store.isPlaying) {
                sendIframeCommand('unMute', []);
                sendIframeCommand('setVolume', [getScaledVolume()]);
                sendIframeCommand('playVideo', []);
              }
            } else if (playerState === 0) {
              if (store.repeatMode === 'one') {
                sendIframeCommand('seekTo', [0, true]);
                sendIframeCommand('playVideo', []);
              } else {
                store.nextTrack();
              }
            }
          }

          if (typeof currentTime === 'number' && !store.isScrubbing && currentTime > 0) {
            const updates = { currentTime: Math.floor(currentTime) };
            if (typeof duration === 'number' && duration > 0) {
              updates.duration = Math.floor(duration);
            }
            usePlayerStore.setState(updates);
          }
        }
      } catch (_) {}
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [sendIframeCommand, getScaledVolume]);

  // Background Tab & Minimize Resilience:
  // When browser tab is minimized or hidden, Chromium may throttle video elements.
  // This listener immediately re-asserts audio playback so music never stops!
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      const store = usePlayerStore.getState();
      const isYt = store.currentTrack?.source === 'youtube' || Boolean(store.currentTrack?.youtubeId);
      if (store.isPlaying && isYt) {
        sendIframeCommand('unMute', []);
        sendIframeCommand('playVideo', []);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('blur', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('blur', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [sendIframeCommand]);

  // Background Watchdog: every 600ms, if document is hidden and isPlaying is true,
  // enforce playback so YouTube never stays paused when minimized!
  useEffect(() => {
    const watchdogInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        const store = usePlayerStore.getState();
        const isYt = store.currentTrack?.source === 'youtube' || Boolean(store.currentTrack?.youtubeId);
        if (store.isPlaying && isYt) {
          sendIframeCommand('unMute', []);
          sendIframeCommand('playVideo', []);
        }
      }
    }, 600);

    return () => clearInterval(watchdogInterval);
  }, [sendIframeCommand]);

  const iframeSrc = `https://www.youtube-nocookie.com/embed/${activeVideoId}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1&controls=0`;

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 ${
        isVideoMode && isYouTubeTrack
          ? 'fixed bottom-24 right-4 md:right-8 w-72 sm:w-80 md:w-96 aspect-video bg-black/95 rounded-2xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-md z-50 pointer-events-auto opacity-100'
          : 'fixed -top-[9999px] -left-[9999px] w-[320px] h-[180px] pointer-events-none opacity-100 overflow-hidden'
      }`}
      aria-hidden={!isVideoMode}
    >
      {/* Video Header when expanded in luxury picture-in-picture mode */}
      {isVideoMode && isYouTubeTrack && (
        <div className="absolute top-0 left-0 right-0 p-2.5 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-20">
          <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium truncate pr-2">
            <Video size={14} className="text-red-500 flex-shrink-0" />
            <span className="truncate">{currentTrack?.title}</span>
          </div>
          <button
            type="button"
            onClick={toggleVideoMode}
            className="p-1 rounded-full bg-black/60 hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white pointer-events-auto"
            title="Close Video Mode"
            aria-label="Close Video Mode"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Native YouTube Embed IFrame (Standards-compliant postMessage controlled) */}
      <iframe
        id="yt-player-frame"
        ref={iframeRef}
        key={activeVideoId}
        src={iframeSrc}
        allow="autoplay; encrypted-media; picture-in-picture"
        className="w-full h-full border-0 pointer-events-auto"
        title="Jennie Audio Engine"
        onLoad={handleIframeLoad}
      />
    </div>
  );
};

export default YouTubePlayerEmbed;
