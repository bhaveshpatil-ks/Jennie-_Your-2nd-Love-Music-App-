import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, MoreHorizontal, Plus, Check, ShieldCheck } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { LikeButton } from '../common/LikeButton';
import { formatDuration } from '../../data/mockTracks';

export const TrackListRow = ({ track, index, queue = null }) => {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const togglePlay = usePlayerStore((state) => state.togglePlay);

  const customPlaylists = useLibraryStore((state) => state.customPlaylists);
  const addTrackToPlaylist = useLibraryStore((state) => state.addTrackToPlaylist);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const menuRef = useRef(null);

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queue);
    }
  };

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleAddToPlaylist = (playlistId) => {
    addTrackToPlaylist(playlistId, track.id, track);
    setMenuOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
      aria-label={`${track.title} by ${track.artist}, duration ${formatDuration(track.duration)}`}
      className={`group grid grid-cols-[20px_1fr_auto] sm:grid-cols-[24px_4fr_3fr_minmax(80px,1fr)] md:grid-cols-[28px_4fr_3fr_2fr_120px] items-center gap-2.5 md:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all duration-300 cursor-pointer text-xs sm:text-sm active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white border border-transparent ${
        isCurrent ? 'bg-white/[0.06] text-white border-white/[0.08]' : 'text-neutral-300'
      }`}
    >
      {/* Col 1: Index Number / Play Icon / Equalizer */}
      <div className="flex items-center justify-center relative w-5">
        {isCurrentPlaying ? (
          <div className="flex items-end gap-0.5 h-3 group-hover:hidden" aria-hidden="true">
            <span className="w-0.5 bg-white rounded-full animate-equalizer-1" />
            <span className="w-0.5 bg-neutral-300 rounded-full animate-equalizer-2" />
            <span className="w-0.5 bg-white rounded-full animate-equalizer-3" />
          </div>
        ) : (
          <span
            className={`text-[11px] sm:text-xs font-mono font-medium group-hover:hidden ${
              isCurrent ? 'text-white font-bold' : 'text-neutral-400'
            }`}
          >
            {index + 1}
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick();
          }}
          aria-label={isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          title={isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          className="hidden group-hover:flex items-center justify-center text-white hover:text-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
        >
          {isCurrentPlaying ? <Pause size={13} className="fill-current" /> : <Play size={13} className="fill-current ml-0.5" />}
        </button>
      </div>

      {/* Col 2: Thumbnail, Title, Artist */}
      <div className="flex items-center gap-2.5 min-w-0 pr-1">
        <img
          src={track.coverUrl}
          alt={`Cover art for ${track.title} by ${track.artist}`}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0 bg-[#161616] shadow-sm"
          loading="lazy"
        />
        <div className="min-w-0 flex-grow">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-semibold truncate transition-colors text-xs sm:text-sm ${
                isCurrent ? 'text-white font-bold' : 'text-neutral-200 group-hover:text-white'
              }`}
            >
              {track.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] sm:text-xs text-neutral-400 truncate">{track.artist}</span>
            <span className="hidden md:inline-block text-[9px] font-semibold text-neutral-300 bg-neutral-800 px-1.5 py-0.2 rounded">
              {track.license || 'Free'}
            </span>
          </div>
        </div>
      </div>

      {/* Col 3: Album (Desktop & Tablet) */}
      <div className="hidden sm:block truncate text-xs text-neutral-400 font-medium pr-2">
        {track.album || 'Single'}
      </div>

      {/* Col 4: Mood / Genre (Desktop) */}
      <div className="hidden md:block truncate text-xs text-neutral-400 font-medium">
        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300">
          {track.mood || track.genre}
        </span>
      </div>

      {/* Col 5: Actions + Duration */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 relative flex-shrink-0">
        <LikeButton trackId={track.id} size={15} />

        <span className="text-[11px] sm:text-xs font-mono text-neutral-400 text-right min-w-[34px]">
          {formatDuration(track.duration)}
        </span>

        {/* More Menu Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            aria-label={`Options for ${track.title}`}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors opacity-70 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title="More options"
          >
            <MoreHorizontal size={15} />
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              role="menu"
              aria-label="Playlist Options"
              className="absolute right-0 top-7 w-44 py-1.5 glass-dropdown rounded-xl z-50 text-xs shadow-2xl animate-luxury-fade border border-white/10 bg-[#141414]/95 backdrop-blur-2xl"
            >
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-neutral-400 border-b border-white/5">
                Add to Playlist
              </div>
              {customPlaylists.length === 0 ? (
                <div className="px-3 py-2 text-neutral-400 italic text-[11px]">No playlists created yet</div>
              ) : (
                customPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    role="menuitem"
                    onClick={() => handleAddToPlaylist(pl.id)}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-white flex items-center justify-between focus-visible:bg-white/10 focus-visible:outline-none"
                  >
                    <span className="truncate">{pl.title}</span>
                    <Plus size={12} className="text-neutral-400" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
