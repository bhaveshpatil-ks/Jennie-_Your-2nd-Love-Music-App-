import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Video, X, ExternalLink } from 'lucide-react';

export const YouTubePlayerEmbed = () => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const timePollInterval = useRef(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const isVideoMode = usePlayerStore((state) => state.isVideoMode);
  const toggleVideoMode = usePlayerStore((state) => state.toggleVideoMode);
  const registerYouTubeController = usePlayerStore((state) => state.registerYouTubeController);
  const nextTrack = usePlayerStore((state) => state.nextTrack);

  const isYouTubeTrack = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);

  // Initialize YouTube IFrame API
  useEffect(() => {
    let isMounted = true;

    function initPlayer() {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('yt-player-target', {
        height: '100%',
        width: '100%',
        host: 'https://www.youtube.com',
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          html5: 1,
          iv_load_policy: 3,
          suggestedQuality: 'hd1080',
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            // Register controller methods into player store
            registerYouTubeController({
              play: () => {
                try {
                  event.target.unMute();
                  event.target.setVolume(Math.round(usePlayerStore.getState().volume * 100));
                  event.target.playVideo();
                } catch (e) {}
              },
              pause: () => {
                try {
                  event.target.pauseVideo();
                } catch (e) {}
              },
              loadVideo: (videoId) => {
                try {
                  event.target.loadVideoById({
                    videoId,
                    suggestedQuality: 'hd1080',
                  });
                  event.target.unMute();
                  const targetVol = Math.round(usePlayerStore.getState().volume * 100);
                  event.target.setVolume(targetVol);
                  event.target.setPlaybackQuality('hd1080');
                  event.target.playVideo();
                } catch (e) {
                  try {
                    event.target.loadVideoById(videoId);
                    event.target.unMute();
                    event.target.setVolume(Math.round(usePlayerStore.getState().volume * 100));
                    event.target.setPlaybackQuality('hd1080');
                    event.target.playVideo();
                  } catch (err) {}
                }
              },
              seekTo: (seconds) => {
                try {
                  event.target.seekTo(seconds, true);
                } catch (e) {}
              },
              setVolume: (vol) => {
                try {
                  const rawVal = typeof vol === 'number' ? vol : 1;
                  const scaled = rawVal <= 1 ? Math.round(rawVal * 100) : Math.round(rawVal);
                  event.target.setVolume(scaled);
                } catch (e) {}
              },
              mute: () => {
                try {
                  event.target.mute();
                } catch (e) {}
              },
              unMute: () => {
                try {
                  event.target.unMute();
                } catch (e) {}
              },
              stop: () => {
                try {
                  event.target.stopVideo();
                } catch (e) {}
              },
            });

            // If current track is already youtube, load and play it at full studio fidelity
            const current = usePlayerStore.getState().currentTrack;
            if (current?.youtubeId && usePlayerStore.getState().isPlaying) {
              try {
                event.target.loadVideoById({
                  videoId: current.youtubeId,
                  suggestedQuality: 'hd1080',
                });
                event.target.unMute();
                event.target.setVolume(Math.round(usePlayerStore.getState().volume * 100));
                event.target.setPlaybackQuality('hd1080');
                event.target.playVideo();
              } catch (e) {
                try {
                  event.target.loadVideoById(current.youtubeId);
                  event.target.unMute();
                  event.target.setVolume(Math.round(usePlayerStore.getState().volume * 100));
                  event.target.playVideo();
                } catch (err) {}
              }
            }
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            const state = event.data;
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            if (state === 0) {
              // Video ended -> next track
              const repeat = usePlayerStore.getState().repeatMode;
              if (repeat === 'one') {
                event.target.seekTo(0, true);
                event.target.playVideo();
              } else {
                nextTrack();
              }
            } else if (state === 1) {
              // Playing: Enforce maximum high-definition audio bitrate
              try {
                event.target.setPlaybackQuality('hd1080');
              } catch (e) {}
              usePlayerStore.setState({ isPlaying: true });
              try {
                const duration = Math.floor(event.target.getDuration());
                if (duration > 0) {
                  usePlayerStore.setState({ duration });
                }
              } catch (e) {}
            } else if (state === 2) {
              // Paused
              usePlayerStore.setState({ isPlaying: false });
            }
          },
          onError: (err) => {
            console.warn('YouTube Player Event Error:', err);
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.getElementById('yt-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    // Time ticker for YouTube playback syncing
    timePollInterval.current = setInterval(() => {
      const storeState = usePlayerStore.getState();
      if (
        storeState.isPlaying &&
        !storeState.isScrubbing &&
        (storeState.currentTrack?.source === 'youtube' || storeState.currentTrack?.youtubeId) &&
        playerRef.current &&
        typeof playerRef.current.getCurrentTime === 'function'
      ) {
        try {
          const currentTime = Math.floor(playerRef.current.getCurrentTime());
          const duration = Math.floor(playerRef.current.getDuration()) || storeState.duration;
          usePlayerStore.setState({ currentTime, duration });
        } catch (e) {}
      }
    }, 500);

    return () => {
      isMounted = false;
      if (timePollInterval.current) clearInterval(timePollInterval.current);
    };
  }, [nextTrack, registerYouTubeController]);

  // Sync volume with YouTube player
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        if (isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(Math.round(volume * 100));
        }
      } catch (e) {}
    }
  }, [volume, isMuted]);

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 transition-all duration-300 ${
        isVideoMode && isYouTubeTrack
          ? 'bottom-24 right-4 md:right-8 w-72 sm:w-80 md:w-96 aspect-video bg-black/95 rounded-2xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-md'
          : 'fixed -left-[99999px] -top-[99999px] w-[1280px] h-[720px] pointer-events-none'
      }`}
    >
      {/* Video Header when expanded */}
      {isVideoMode && isYouTubeTrack && (
        <div className="absolute top-0 left-0 right-0 p-2.5 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium truncate pr-2">
            <Video size={14} className="text-red-500 flex-shrink-0" />
            <span className="truncate">{currentTrack?.title}</span>
          </div>
          <button
            onClick={toggleVideoMode}
            className="p-1 rounded-full bg-black/60 hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title="Close Video Mode"
            aria-label="Close Video Mode"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Embedded YouTube Iframe Host */}
      <div className="w-full h-full">
        <div id="yt-player-target" className="w-full h-full" />
      </div>
    </div>
  );
};
