import React, { useEffect } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  ShieldCheck, 
  Video
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { LikeButton } from '../common/LikeButton';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';

export const FullscreenPlayer = () => {
  const isFullscreenOpen = usePlayerStore((state) => state.isFullscreenOpen);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const prevTrack = usePlayerStore((state) => state.prevTrack);
  const isShuffled = usePlayerStore((state) => state.isShuffled);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);
  const isVideoMode = usePlayerStore((state) => state.isVideoMode);
  const toggleVideoMode = usePlayerStore((state) => state.toggleVideoMode);

  // Keyboard accessibility: Escape minimizes the fullscreen view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreenOpen) {
        toggleFullscreen();
      }
    };
    if (isFullscreenOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, toggleFullscreen]);

  if (!isFullscreenOpen || !currentTrack) return null;
  const isYouTubeTrack = currentTrack.source === 'youtube' || Boolean(currentTrack.youtubeId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Now Playing: ${currentTrack.title} by ${currentTrack.artist}`}
      className="fixed inset-0 z-50 bg-[#070707] flex flex-col justify-between p-6 md:p-12 overflow-hidden animate-luxury-slide-up"
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 pointer-events-none bg-white/10"
        aria-hidden="true"
      />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Minimize now playing player"
          className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronDown size={22} />
          <span>Minimize</span>
        </button>

        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
            Playing from {(currentTrack.source || 'CATALOG').toUpperCase()}
          </span>
          <span className="text-xs font-semibold text-white/90">{currentTrack.album || 'Single'}</span>
        </div>

        {isYouTubeTrack ? (
          <button
            type="button"
            onClick={toggleVideoMode}
            aria-label={isVideoMode ? 'Hide music video' : 'Watch music video'}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isVideoMode
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Video size={14} />
            <span>{isVideoMode ? 'Video ON' : 'Watch Video'}</span>
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Main Center: Artwork & Track Details */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto max-w-lg mx-auto w-full">
        {/* Cover Artwork Container */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl mb-8 group">
          <img
            src={currentTrack.coverUrl}
            alt={`Album cover artwork for ${currentTrack.title} by ${currentTrack.artist}`}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105' : 'scale-100'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 pointer-events-none" />
        </div>

        {/* Track Title, Artist, Like */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="min-w-0 pr-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white truncate tracking-tight">
              {currentTrack.title}
            </h1>
            <p className="text-base text-neutral-300 font-medium truncate mt-1">
              {currentTrack.artist}
            </p>
          </div>
          <LikeButton trackId={currentTrack.id} size={24} />
        </div>

        {/* Studio Master HD Audio & Vocal Clarity Quality Badge */}
        <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] text-xs mb-6 border border-white/5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-neutral-300">
              <strong className="text-white">Studio Master Sound</strong> • Vocal Clarity & Loudness
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold tracking-wider">
            1080p HD BITRATE
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-6">
          <ProgressBar showTimes={true} />
        </div>

        {/* Large Playback Controls */}
        <div className="flex items-center justify-center gap-6 md:gap-8 w-full" role="toolbar" aria-label="Fullscreen Controls">
          <button
            type="button"
            onClick={toggleShuffle}
            aria-label={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
            aria-pressed={isShuffled}
            className={`p-2 rounded-full hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isShuffled ? 'text-white' : 'text-neutral-400'
            }`}
          >
            <Shuffle size={20} />
          </button>

          <button
            type="button"
            onClick={prevTrack}
            aria-label="Previous Track"
            className="p-3 rounded-full text-neutral-300 hover:text-white transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <SkipBack size={26} />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? `Pause ${currentTrack.title}` : `Play ${currentTrack.title}`}
            className="w-16 h-16 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center shadow-xl transition-all duration-300 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {isPlaying ? (
              <Pause size={28} className="fill-black" />
            ) : (
              <Play size={28} className="fill-black ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={nextTrack}
            aria-label="Next Track"
            className="p-3 rounded-full text-neutral-300 hover:text-white transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <SkipForward size={26} />
          </button>

          <button
            type="button"
            onClick={toggleRepeat}
            aria-label={`Toggle repeat mode, currently ${repeatMode}`}
            className={`p-2 rounded-full hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              repeatMode !== 'off' ? 'text-white' : 'text-neutral-400'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>
      </div>

      {/* Bottom Volume & Actions */}
      <div className="relative z-10 flex items-center justify-center max-w-sm mx-auto w-full">
        <VolumeControl className="w-full justify-center" />
      </div>
    </div>
  );
};
