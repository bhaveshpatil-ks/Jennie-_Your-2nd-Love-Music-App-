import { create } from 'zustand';
import { MOCK_TRACKS } from '../data/mockTracks';
import { shuffleArray } from '../utils/formatters';
import { decideNextSong, buildRecommendedQueue } from '../services/recommendationEngine';
import { useAuthStore } from './useAuthStore';

// Singleton HTML5 Audio instance for real audio streaming (Jamendo & Audius)
let globalAudio = null;
if (typeof window !== 'undefined') {
  globalAudio = new Audio();
  globalAudio.preload = 'auto';
}

// Silent Audio Carrier: plays an inaudible looping audio signal on the main document
// This signals to Chromium/Edge that the tab is an "Active Audio Producer",
// preventing tab throttling, freezing, or pausing when the window is minimized or backgrounded.
const SILENT_AUDIO_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let silentCarrierAudio = null;
if (typeof window !== 'undefined') {
  try {
    silentCarrierAudio = new Audio(SILENT_AUDIO_URI);
    silentCarrierAudio.loop = true;
    silentCarrierAudio.volume = 0.001;
  } catch (_) {}
}

let audioCtxKeepAlive = null;

const startSilentCarrier = () => {
  if (silentCarrierAudio) {
    try {
      silentCarrierAudio.play().catch(() => {});
    } catch (_) {}
  }

  // Web Audio Context Keep-Alive (guarantees Chromium marks tab as audio-active)
  try {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxKeepAlive) {
          audioCtxKeepAlive = new AudioCtx();
          const osc = audioCtxKeepAlive.createOscillator();
          const gain = audioCtxKeepAlive.createGain();
          gain.gain.value = 0.00001; // Inaudible sub-threshold
          osc.connect(gain);
          gain.connect(audioCtxKeepAlive.destination);
          osc.start();
        } else if (audioCtxKeepAlive.state === 'suspended') {
          audioCtxKeepAlive.resume();
        }
      }
    }
  } catch (_) {}
};

const stopSilentCarrier = () => {
  if (silentCarrierAudio) {
    try {
      silentCarrierAudio.pause();
    } catch (_) {}
  }
  if (audioCtxKeepAlive && audioCtxKeepAlive.state === 'running') {
    try {
      audioCtxKeepAlive.suspend();
    } catch (_) {}
  }
};

// Synchronize browser MediaSession API (native OS lock screen & background controls)
const syncMediaSession = (track, isPlaying) => {
  if (typeof window === 'undefined' || !('mediaSession' in navigator) || !track) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Unknown Track',
      artist: track.artist || 'Jennie Music',
      album: track.album || 'Jennie Music',
      artwork: track.artwork
        ? [
            { src: track.artwork, sizes: '96x96', type: 'image/jpeg' },
            { src: track.artwork, sizes: '128x128', type: 'image/jpeg' },
            { src: track.artwork, sizes: '192x192', type: 'image/jpeg' },
            { src: track.artwork, sizes: '256x256', type: 'image/jpeg' },
            { src: track.artwork, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [],
    });
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  } catch (_) {}
};

export const usePlayerStore = create((set, get) => {
  let tickerInterval = null;

  // Universal Live Timekeeper: runs continuously whenever isPlaying is true
  // Guarantees timeline NEVER gets stuck at 0:00 under any circumstances!
  const startTicker = () => {
    if (tickerInterval) clearInterval(tickerInterval);
    tickerInterval = setInterval(() => {
      const state = get();
      if (!state.isPlaying || state.isScrubbing || !state.currentTrack) return;

      // Priority 1: If YouTube controller reports a live time, synchronize with it
      const ytTime = state.ytController?.getCurrentTime?.();
      if (typeof ytTime === 'number' && !isNaN(ytTime) && ytTime > 0) {
        const ytDuration = state.ytController?.getDuration?.();
        set({
          currentTime: Math.floor(ytTime),
          duration: typeof ytDuration === 'number' && ytDuration > 0 ? Math.floor(ytDuration) : state.duration,
        });
        return;
      }

      // Priority 2: If HTML5 Audio is actively playing and has a valid currentTime, use it
      if (globalAudio && !globalAudio.paused && !isNaN(globalAudio.currentTime) && globalAudio.currentTime > 0) {
        set({
          currentTime: Math.floor(globalAudio.currentTime),
          duration: Math.floor(globalAudio.duration) || state.duration,
        });
        return;
      }

      // Priority 3: Resilient progressive increment so timeline NEVER stays stuck at 0:00!
      const trackDuration = state.duration || state.currentTrack.duration || 180;
      const nextTime = state.currentTime + 1;
      if (nextTime >= trackDuration) {
        if (state.repeatMode === 'one') {
          set({ currentTime: 0 });
          state.seekTo(0);
        } else {
          state.nextTrack();
        }
      } else {
        set({ currentTime: nextTime });
      }
    }, 1000);
  };

  const stopTicker = () => {
    if (tickerInterval) {
      clearInterval(tickerInterval);
      tickerInterval = null;
    }
  };

  // Setup HTML5 Audio event listeners
  if (globalAudio) {
    globalAudio.addEventListener('timeupdate', () => {
      const { isScrubbing, isPlaying, currentTrack } = get();
      if (!isScrubbing && isPlaying && globalAudio.duration && currentTrack?.audioUrl) {
        set({
          currentTime: Math.floor(globalAudio.currentTime),
          duration: Math.floor(globalAudio.duration) || get().duration,
        });
      }
    });

    globalAudio.addEventListener('loadedmetadata', () => {
      if (globalAudio.duration && !isNaN(globalAudio.duration)) {
        set({ duration: Math.floor(globalAudio.duration) });
      }
    });

    globalAudio.addEventListener('ended', () => {
      const { repeatMode, currentTrack } = get();
      if (repeatMode === 'one' && currentTrack?.audioUrl) {
        globalAudio.currentTime = 0;
        globalAudio.play().catch(() => {});
      } else {
        get().nextTrack();
      }
    });

    globalAudio.addEventListener('error', () => {
      const current = get().currentTrack;
      if (current?.audioUrl) {
        console.warn('Audio playback error, falling back to simulated ticker.');
        startTicker();
      }
    });
  }

  return {
    // Current Playback State (Default: No track loaded - user chooses their own music)
    currentTrack: null,
    isPlaying: false,
    queue: [],
    originalQueue: [],
    currentIndex: -1,
    history: [],
    consecutiveSkips: 0,
    recommendationDecision: null,

    // YouTube Controller reference
    ytController: null,
    registerYouTubeController: (controller) => set({ ytController: controller }),

    // Video Mode Toggle
    isVideoMode: false,
    toggleVideoMode: () => set((state) => ({ isVideoMode: !state.isVideoMode })),
    setVideoMode: (val) => set({ isVideoMode: val }),

    // Timing
    currentTime: 0,
    duration: 0,
    isScrubbing: false,

    // Controls
    volume: 1.0,
    isMuted: false,
    previousVolume: 1.0,
    isShuffled: false,
    repeatMode: 'off', // 'off' | 'all' | 'one'
    vocalClarity: true, // Studio Vocal Clarity & Loudness Enhancement
    toggleVocalClarity: () => set((state) => ({ vocalClarity: !state.vocalClarity })),

    // UI Modals / Drawers
    isFullscreenOpen: false,
    isQueueOpen: false,

    // Actions
    playTrack: (track, newQueue = null) => {
      if (!track) return;

      // Require user authentication to play songs
      const authState = useAuthStore.getState();
      if (!authState.user) {
        authState.openAuthModal('login', 'Please sign in or create an account to stream music on Jennie!');
        return;
      }

      const currentQueue = newQueue || get().queue;
      let targetIndex = currentQueue.findIndex((t) => t.id === track.id);
      let updatedQueue = currentQueue;

      // Build deduplicated candidate pool from current queue, original queue, and catalog
      const poolMap = new Map();
      [...(newQueue || []), ...(get().queue || []), ...(get().originalQueue || []), ...MOCK_TRACKS].forEach((t) => {
        if (t && t.id) poolMap.set(t.id, t);
      });
      const candidatePool = Array.from(poolMap.values());

      // If user plays a standalone track or empty queue, generate cohesive radio queue
      if (targetIndex === -1 || !newQueue || newQueue.length <= 1) {
        const recommended = buildRecommendedQueue(track, 10, {
          history: get().history,
          consecutiveSkips: get().consecutiveSkips,
        }, candidatePool).map((r) => ({
          ...r.track,
          recommendationReason: r.reason_for_recommendation,
          recommendationConfidence: r.confidence_score,
          recommendationCategory: r.category,
        }));
        updatedQueue = [track, ...recommended.filter((r) => r.id !== track.id)];
        targetIndex = 0;
      }

      const prevTrack = get().currentTrack;
      const history = prevTrack ? [prevTrack, ...get().history.slice(0, 19)] : get().history;

      // Extract youtubeId reliably from youtubeId property or yt- ID prefix
      const youtubeId = track.youtubeId || (typeof track.id === 'string' && track.id.startsWith('yt-') ? track.id.replace('yt-', '') : null);
      const isYouTube = track.source === 'youtube' || Boolean(youtubeId);
      const normalizedTrack = {
        ...track,
        youtubeId: youtubeId || track.youtubeId,
        source: isYouTube ? 'youtube' : (track.source || 'jamendo'),
      };

      // Evaluate single next-song decision
      const nextDecision = decideNextSong(normalizedTrack, {
        history,
        consecutiveSkips: get().consecutiveSkips,
        queuePosition: targetIndex + 1,
      }, candidatePool);

      set({
        currentTrack: normalizedTrack,
        queue: updatedQueue,
        originalQueue: newQueue ? newQueue : updatedQueue,
        currentIndex: targetIndex,
        isPlaying: true,
        currentTime: 0,
        duration: normalizedTrack.duration || 180,
        history,
        recommendationDecision: nextDecision,
      });

      stopTicker();

      if (isYouTube && youtubeId) {
        // Pause HTML5 audio engine and activate background keep-alive carrier
        if (globalAudio) {
          globalAudio.pause();
          globalAudio.src = '';
        }
        startSilentCarrier();
        const { ytController } = get();
        if (ytController) {
          if (ytController.loadVideo) {
            ytController.loadVideo(youtubeId);
          }
          if (!get().isMuted && ytController.unMute) {
            ytController.unMute();
            ytController.setVolume(get().volume);
          }
          if (ytController.play) {
            ytController.play();
          }
        }
      } else if (normalizedTrack.audioUrl && globalAudio) {
        stopSilentCarrier();
        // Stop YouTube player if playing
        const { ytController } = get();
        if (ytController?.pause) {
          ytController.pause();
        }

        globalAudio.src = normalizedTrack.audioUrl;
        globalAudio.currentTime = 0;
        globalAudio.volume = get().isMuted ? 0 : get().volume;
        globalAudio.play().catch((err) => {
          console.warn('Audio play prevented or errored:', err.message);
        });
      }

      syncMediaSession(normalizedTrack, true);

      // Always start universal live timekeeper for guaranteed smooth progression
      startTicker();
    },

    togglePlay: () => {
      const { isPlaying, currentTrack, ytController } = get();
      if (!currentTrack) {
        if (get().queue.length > 0) {
          get().playTrack(get().queue[0]);
        }
        return;
      }

      const isYouTube = currentTrack.source === 'youtube' || Boolean(currentTrack.youtubeId);

      if (isPlaying) {
        stopSilentCarrier();
        if (isYouTube) {
          ytController?.pause();
        } else if (globalAudio && currentTrack.audioUrl) {
          globalAudio.pause();
        }
        stopTicker();
        set({ isPlaying: false });
        syncMediaSession(currentTrack, false);
      } else {
        // Require user authentication to play songs
        const authState = useAuthStore.getState();
        if (!authState.user) {
          authState.openAuthModal('login', 'Please sign in or create an account to stream music on Jennie!');
          return;
        }

        if (isYouTube) {
          startSilentCarrier();
          const ytId = currentTrack.youtubeId || (typeof currentTrack.id === 'string' && currentTrack.id.startsWith('yt-') ? currentTrack.id.replace('yt-', '') : null);
          if (ytController?.play) {
            if (!get().isMuted) {
              ytController.unMute();
              ytController.setVolume(get().volume);
            }
            ytController.play();
          } else if (ytController?.loadVideo && ytId) {
            ytController.loadVideo(ytId);
            ytController.play();
          }
        } else if (globalAudio && currentTrack.audioUrl) {
          stopSilentCarrier();
          globalAudio.play().catch(() => {});
        }
        startTicker();
        set({ isPlaying: true });
        syncMediaSession(currentTrack, true);
      }
    },

    pause: () => {
      stopSilentCarrier();
      const { currentTrack, ytController } = get();
      const isYouTube = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);
      if (isYouTube) {
        ytController?.pause();
      } else if (globalAudio && currentTrack?.audioUrl) {
        globalAudio.pause();
      }
      stopTicker();
      set({ isPlaying: false });
      syncMediaSession(currentTrack, false);
    },

    resume: () => {
      const authState = useAuthStore.getState();
      if (!authState.user) {
        authState.openAuthModal('login', 'Please sign in or create an account to stream music on Jennie!');
        return;
      }

      const { currentTrack, ytController } = get();
      const isYouTube = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);
      if (isYouTube) {
        startSilentCarrier();
        if (!get().isMuted) {
          ytController?.unMute();
          ytController?.setVolume(get().volume);
        }
        ytController?.play();
      } else if (globalAudio && currentTrack?.audioUrl) {
        stopSilentCarrier();
        globalAudio.play().catch(() => startTicker());
      } else {
        startTicker();
      }
      set({ isPlaying: true });
      syncMediaSession(currentTrack, true);
    },

    nextTrack: (isExplicitSkip = false) => {
      const { queue, currentIndex, repeatMode, currentTime, consecutiveSkips, currentTrack, history } = get();
      if (!currentTrack && queue.length === 0) return;

      // Track skip fatigue signal: If skipped within 15 seconds, increment consecutive skips
      let newSkips = consecutiveSkips;
      if (isExplicitSkip || (currentTime > 0 && currentTime < 15)) {
        newSkips = consecutiveSkips + 1;
      } else if (currentTime >= 30) {
        newSkips = 0;
      }
      set({ consecutiveSkips: newSkips });

      let nextIndex = currentIndex + 1;

      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          // Infinite cohesive radio: Ask recommendation engine for next song
          const poolMap = new Map();
          [...queue, ...(get().originalQueue || []), ...MOCK_TRACKS].forEach((t) => {
            if (t && t.id) poolMap.set(t.id, t);
          });
          const candidatePool = Array.from(poolMap.values());

          const nextDecision = decideNextSong(currentTrack, {
            history: [currentTrack, ...history],
            consecutiveSkips: newSkips,
            queuePosition: queue.length + 1,
          }, candidatePool);

          if (nextDecision && nextDecision.track) {
            const nextSong = {
              ...nextDecision.track,
              recommendationReason: nextDecision.reason_for_recommendation,
              recommendationConfidence: nextDecision.confidence_score,
            };
            const extendedQueue = [...queue, nextSong];
            get().playTrack(nextSong, extendedQueue);
            return;
          }

          if (globalAudio) globalAudio.pause();
          get().ytController?.pause();
          stopTicker();
          set({ isPlaying: false, currentTime: 0 });
          return;
        }
      }

      const nextSong = queue[nextIndex];
      get().playTrack(nextSong, queue);
    },

    prevTrack: () => {
      const { queue, currentIndex, currentTime } = get();
      if (currentTime > 3) {
        get().seekTo(0);
        return;
      }

      if (queue.length === 0) return;
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1;
      }

      const prevSong = queue[prevIndex];
      get().playTrack(prevSong, queue);
    },

    seekTo: (seconds) => {
      const { currentTrack, ytController } = get();
      const targetTime = Math.max(0, Math.min(seconds, get().duration));
      const isYouTube = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);

      if (isYouTube) {
        ytController?.seekTo(targetTime);
      } else if (globalAudio && currentTrack?.audioUrl) {
        globalAudio.currentTime = targetTime;
      }
      set({ currentTime: targetTime });
    },

    setIsScrubbing: (isScrubbing) => {
      set({ isScrubbing });
    },

    setVolume: (val) => {
      const clamped = Math.max(0, Math.min(1, val));
      const { ytController } = get();
      if (globalAudio) {
        globalAudio.volume = clamped;
      }
      if (ytController) {
        ytController.setVolume(clamped);
      }
      set({
        volume: clamped,
        isMuted: clamped === 0,
        previousVolume: clamped > 0 ? clamped : get().previousVolume,
      });
    },

    toggleMute: () => {
      const { isMuted, volume, previousVolume, ytController } = get();
      if (isMuted) {
        const targetVol = previousVolume || 1.0;
        if (globalAudio) globalAudio.volume = targetVol;
        if (ytController) {
          ytController.unMute();
          ytController.setVolume(targetVol);
        }
        set({
          isMuted: false,
          volume: targetVol,
        });
      } else {
        if (globalAudio) globalAudio.volume = 0;
        if (ytController) {
          ytController.mute();
        }
        set({
          isMuted: true,
          previousVolume: volume,
          volume: 0,
        });
      }
    },

    toggleShuffle: () => {
      const { isShuffled, queue, originalQueue, currentTrack } = get();
      if (isShuffled) {
        const currentIdx = originalQueue.findIndex((t) => t.id === currentTrack?.id);
        set({
          isShuffled: false,
          queue: originalQueue,
          currentIndex: currentIdx >= 0 ? currentIdx : 0,
        });
      } else {
        const remaining = queue.filter((t) => t.id !== currentTrack?.id);
        const shuffled = currentTrack ? [currentTrack, ...shuffleArray(remaining)] : shuffleArray(queue);
        set({
          isShuffled: true,
          queue: shuffled,
          currentIndex: 0,
        });
      }
    },

    toggleRepeat: () => {
      const modes = ['off', 'all', 'one'];
      const current = get().repeatMode;
      const nextMode = modes[(modes.indexOf(current) + 1) % modes.length];
      set({ repeatMode: nextMode });
    },

    toggleFullscreen: () => {
      set((state) => ({ isFullscreenOpen: !state.isFullscreenOpen }));
    },

    toggleQueue: () => {
      set((state) => ({ isQueueOpen: !state.isQueueOpen }));
    },

    setQueueOpen: (isOpen) => {
      set({ isQueueOpen: isOpen });
    },
  };
});

// Setup OS hardware multimedia keys & native lock screen MediaSession listeners
if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
  try {
    navigator.mediaSession.setActionHandler('play', () => {
      usePlayerStore.getState().resume();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      usePlayerStore.getState().pause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      usePlayerStore.getState().prevTrack();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      usePlayerStore.getState().nextTrack(true);
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') {
        usePlayerStore.getState().seekTo(details.seekTime);
      }
    });
  } catch (_) {}
}
