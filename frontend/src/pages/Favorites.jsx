import React from 'react';
import { Heart, Play, Shuffle } from 'lucide-react';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { TrackTable } from '../components/tracks';
import { formatDuration } from '../utils/formatters';

export const Favorites = () => {
  const getLikedTracks = useLibraryStore((state) => state.getLikedTracks);
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);

  const likedTracks = getLikedTracks();

  const totalDuration = likedTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (likedTracks.length > 0) {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  const handleShufflePlay = () => {
    if (likedTracks.length > 0) {
      toggleShuffle();
      playTrack(likedTracks[Math.floor(Math.random() * likedTracks.length)], likedTracks);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-r from-neutral-900 via-[#181818] to-[#101010] shadow-2xl flex flex-col sm:flex-row items-center sm:items-end gap-6 border border-white/5">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/[0.03] rounded-full blur-[100px] pointer-events-none" />

        {/* Big Heart Icon Box */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-[#141414] border border-white/[0.08] shadow-2xl flex items-center justify-center flex-shrink-0 group">
          <Heart size={64} className="fill-white text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.25)] transition-all duration-500 group-hover:scale-[1.03]" aria-hidden="true" />
        </div>

        {/* Info */}
        <div className="relative z-10 space-y-2 text-center sm:text-left flex-grow">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Liked Songs
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-neutral-300 pt-1">
            <span className="font-semibold text-white">Your Personal Favorites</span>
            <span>•</span>
            <span>{likedTracks.length} songs</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)} total length</span>
          </div>
        </div>
      </div>

      {/* Play Actions Bar */}
      {likedTracks.length > 0 && (
        <div className="flex items-center gap-4 py-2">
          <button
            type="button"
            onClick={handlePlayAll}
            aria-label="Play all liked songs"
            className="px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-sm flex items-center gap-2 transition-all duration-300 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Play size={18} className="fill-black ml-0.5" />
            <span>Play All</span>
          </button>

          <button
            type="button"
            onClick={handleShufflePlay}
            aria-label="Shuffle play liked songs"
            className="p-3 rounded-full bg-[#1A1A1A] hover:bg-[#242424] text-white transition-colors border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
        </div>
      )}

      {/* Track List */}
      <div className="bg-[#121212] rounded-xl p-2 md:p-4 border border-white/5">
        <TrackTable
          tracks={likedTracks}
          emptyMessage="No liked songs yet."
        />
      </div>

      {likedTracks.length === 0 && (
        <div className="text-center pt-6">
          <button
            type="button"
            onClick={() => setActiveView('home')}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Discover Music
          </button>
        </div>
      )}
    </div>
  );
};
