import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  ListMusic, 
  Maximize2, 
  ShieldCheck, 
  Video
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { LikeButton } from '../common/LikeButton';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';

export const PlayerBar = () => {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const prevTrack = usePlayerStore((state) => state.prevTrack);
  const isShuffled = usePlayerStore((state) => state.isShuffled);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);
  const isQueueOpen = usePlayerStore((state) => state.isQueueOpen);
  const toggleQueue = usePlayerStore((state) => state.toggleQueue);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);
  const isVideoMode = usePlayerStore((state) => state.isVideoMode);
  const toggleVideoMode = usePlayerStore((state) => state.toggleVideoMode);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);

  if (!currentTrack) return null;
  const isYouTubeTrack = currentTrack.source === 'youtube' || Boolean(currentTrack.youtubeId);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Mobile Spotify-Style Mini Player Bar (< 768px, sits right above bottom nav) */}
      <div
        role="region"
        aria-label="Mobile Mini Player"
        className="md:hidden fixed bottom-[64px] left-2 right-2 z-40 bg-[#111111]/95 backdrop-blur-3xl border border-white/[0.08] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2.5 flex flex-col overflow-hidden animate-luxury-slide-up"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Tappable track info to expand fullscreen player */}
          <div
            onClick={toggleFullscreen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleFullscreen(); }}
            aria-label={`Open now playing for ${currentTrack.title}`}
            className="flex items-center gap-3 min-w-0 flex-grow cursor-pointer"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#222] shadow">
              <img
                src={currentTrack.coverUrl}
                alt={`Artwork for ${currentTrack.title}`}
                className="w-full h-full object-cover"
              />
              {isYouTubeTrack && (
                <div className="absolute top-1 left-1 p-0.5 rounded bg-black/70">
                  <Video size={10} className="text-red-500" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-grow pr-1">
              <p className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                {currentTrack.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[11px] text-neutral-400 truncate">
                  {currentTrack.artist}
                </p>
                {isYouTubeTrack && (
                  <span className="text-[9px] text-red-400 bg-red-500/10 px-1 py-0.2 rounded font-medium">
                    YouTube
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions: Video toggle, Like, Play/Pause */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isYouTubeTrack && (
              <button
                type="button"
                onClick={toggleVideoMode}
                aria-label={isVideoMode ? "Close video mode" : "Watch music video"}
                className={`p-2 rounded-full transition-colors ${
                  isVideoMode ? 'text-red-500 bg-red-500/10' : 'text-neutral-300 hover:text-white'
                }`}
                title="Toggle Video Player"
              >
                <Video size={17} />
              </button>
            )}

            <div className="p-1">
              <LikeButton trackId={currentTrack.id} size={18} />
            </div>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transition-all duration-300 hover:bg-neutral-200 active:opacity-75 shadow-md ml-0.5"
            >
              {isPlaying ? (
                <Pause size={18} className="fill-black" />
              ) : (
                <Play size={18} className="fill-black ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar line along bottom of mini card */}
        <div className="w-full h-[2.5px] bg-white/10 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop Audio Player (>= 768px) */}
      <footer
        role="region"
        aria-label="Desktop Audio Player"
        className="hidden md:block fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-xl border-t border-white/[0.08] px-6 py-2.5 shadow-2xl transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Track Information & Attribution */}
          <div className="flex items-center gap-3 min-w-0 w-[30%] max-w-[320px]">
            <div 
              onClick={toggleFullscreen}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleFullscreen(); }}
              aria-label={`Open now playing for ${currentTrack.title}`}
              className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#1A1A1A] cursor-pointer group shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <img
                src={currentTrack.coverUrl}
                alt={`Currently playing album art for ${currentTrack.title}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity" aria-hidden="true">
                <Maximize2 size={14} className="text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-grow">
              <div className="flex items-center gap-1.5">
                <h4 
                  onClick={toggleFullscreen}
                  className="text-sm font-semibold text-white truncate hover:underline cursor-pointer"
                  title={currentTrack.title}
                >
                  {currentTrack.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-neutral-400 truncate" title={currentTrack.artist}>
                  {currentTrack.artist}
                </p>
                <span 
                  className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-neutral-300 bg-neutral-800 px-1.5 py-0.2 rounded-full"
                  title={`License (${currentTrack.license})`}
                >
                  <ShieldCheck size={10} aria-hidden="true" />
                  {currentTrack.license || 'Free Stream'}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <LikeButton trackId={currentTrack.id} size={18} />
            </div>
          </div>

          {/* Center: Playback Controls & Progress Bar */}
          <div className="flex flex-col items-center w-full max-w-[520px] px-2">
            <div className="flex items-center gap-5 mb-1" role="toolbar" aria-label="Playback Controls">
              {/* Shuffle */}
              <button
                type="button"
                onClick={toggleShuffle}
                aria-label={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
                aria-pressed={isShuffled}
                className={`p-1.5 rounded-full hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isShuffled ? 'text-white' : 'text-neutral-400'
                }`}
                title={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
              >
                <Shuffle size={16} />
              </button>

              {/* Prev Track */}
              <button
                type="button"
                onClick={prevTrack}
                aria-label="Play previous track"
                className="p-1.5 rounded-full text-neutral-300 hover:text-white transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                title="Previous Track"
              >
                <SkipBack size={18} />
              </button>

              {/* Play / Pause Main CTA */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? `Pause ${currentTrack.title}` : `Play ${currentTrack.title}`}
                title={isPlaying ? 'Pause' : 'Play'}
                className="w-10 h-10 rounded-full bg-white text-black hover:bg-neutral-200 transition-all flex items-center justify-center shadow-md active:opacity-80 duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {isPlaying ? (
                  <Pause size={18} className="fill-black" />
                ) : (
                  <Play size={18} className="fill-black ml-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                type="button"
                onClick={nextTrack}
                aria-label="Play next track"
                className="p-1.5 rounded-full text-neutral-300 hover:text-white transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                title="Next Track"
              >
                <SkipForward size={18} />
              </button>

              {/* Repeat Mode */}
              <button
                type="button"
                onClick={toggleRepeat}
                aria-label={`Toggle repeat, currently ${repeatMode}`}
                className={`p-1.5 rounded-full hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  repeatMode !== 'off' ? 'text-white' : 'text-neutral-400'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>

            {/* Draggable Progress Bar */}
            <ProgressBar showTimes={true} className="w-full flex" />
          </div>

          {/* Right: Auxiliary Controls (Queue, Volume, Video, Fullscreen) */}
          <div className="flex items-center justify-end gap-2.5 w-[30%] max-w-[280px]">
            {/* Video Mode Toggle (Active for YouTube tracks) */}
            {isYouTubeTrack && (
              <button
                type="button"
                onClick={toggleVideoMode}
                aria-label={isVideoMode ? 'Hide Music Video' : 'Watch Music Video'}
                className={`p-2 rounded-full transition-all flex items-center gap-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isVideoMode
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
                title={isVideoMode ? 'Hide Music Video' : 'Watch Music Video'}
              >
                <Video size={17} />
                <span className="hidden xl:inline text-[11px]">{isVideoMode ? 'Video ON' : 'Video'}</span>
              </button>
            )}

            {/* Queue Drawer Button */}
            <button
              type="button"
              onClick={toggleQueue}
              aria-label={isQueueOpen ? 'Close queue drawer' : 'Open queue drawer'}
              aria-expanded={isQueueOpen}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isQueueOpen ? 'text-white bg-white/10' : 'text-neutral-300 hover:text-white'
              }`}
              title="Current Queue"
            >
              <ListMusic size={18} />
            </button>

            {/* Fullscreen Player Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Expand fullscreen player"
              className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="Expand View"
            >
              <Maximize2 size={17} />
            </button>

            {/* Volume Control */}
            <div className="hidden lg:block">
              <VolumeControl />
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};
