import React, { useState, useEffect } from 'react';
import { Play, Shuffle, Trash2 } from 'lucide-react';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { MOCK_TRACKS } from '../data/mockTracks';
import { TrackTable } from '../components/tracks';
import { fetchGenreTracks } from '../services/api';
import { formatDuration } from '../utils/formatters';

export const PlaylistDetail = ({ playlist, isGenre = false }) => {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const deletePlaylist = useLibraryStore((state) => state.deletePlaylist);
  const setActiveView = useLibraryStore((state) => state.setActiveView);

  const [liveTracks, setLiveTracks] = useState([]);

  useEffect(() => {
    if (!playlist) return;

    if (isGenre) {
      fetchGenreTracks(playlist.id || playlist.name).then((res) => {
        if (res && res.length > 0) {
          setLiveTracks(res);
        }
      });
    } else if (playlist.tracks && playlist.tracks.length > 0) {
      setLiveTracks(playlist.tracks);
    } else if (playlist.trackIds) {
      const resolved = MOCK_TRACKS.filter((t) => playlist.trackIds.includes(t.id));
      setLiveTracks(resolved);
    } else {
      setLiveTracks(MOCK_TRACKS.slice(0, 5));
    }
  }, [playlist, isGenre]);

  if (!playlist) {
    return (
      <div className="py-20 text-center text-neutral-400">
        <p>No playlist or genre selected.</p>
        <button
          type="button"
          onClick={() => setActiveView('home')}
          className="mt-3 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Fallback track resolution if liveTracks is still loading
  let tracks = liveTracks.length > 0 ? liveTracks : [];
  if (tracks.length === 0) {
    if (isGenre) {
      tracks = MOCK_TRACKS.filter(
        (t) =>
          t.genre.toLowerCase() === (playlist.id || '').toLowerCase() ||
          t.genre.toLowerCase().includes((playlist.name || '').toLowerCase())
      );
      if (tracks.length === 0) tracks = MOCK_TRACKS.slice(0, 6);
    } else if (playlist.tracks && playlist.tracks.length > 0) {
      tracks = playlist.tracks;
    } else if (playlist.trackIds) {
      tracks = MOCK_TRACKS.filter((t) => playlist.trackIds.includes(t.id));
    } else {
      tracks = MOCK_TRACKS.slice(0, 5);
    }
  }

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      toggleShuffle();
      playTrack(tracks[Math.floor(Math.random() * tracks.length)], tracks);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
      deletePlaylist(playlist.id);
      setActiveView('library');
    }
  };

  const title = playlist.title || playlist.name;
  const description = playlist.description || 'Curated music collection.';
  const coverUrl = playlist.coverUrl;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner with Backdrop */}
      <div className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-r from-[#1E1E1E] via-[#161616] to-[#101010] shadow-2xl flex flex-col sm:flex-row items-center sm:items-end gap-6 overflow-hidden border border-white/5">
        {/* Ambient background glow */}
        <div 
          style={{ background: playlist.gradient || '#333333' }}
          className="absolute -top-10 -left-10 w-96 h-96 rounded-full blur-[130px] opacity-20 pointer-events-none" 
        />

        {/* Artwork */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group bg-[#141414] border border-white/[0.08]">
          <img
            src={coverUrl}
            alt={`Cover artwork for ${title}`}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-30" />
        </div>

        {/* Info */}
        <div className="relative z-10 space-y-2 text-center sm:text-left flex-grow">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 text-[11px] font-bold uppercase tracking-wider">
            {isGenre ? 'Genre Catalog' : 'Curated Playlist'}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {title}
          </h1>

          <p className="text-xs md:text-sm text-neutral-300 max-w-xl line-clamp-2">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-neutral-400 pt-1">
            <span className="font-semibold text-white">Jennie Cloud Catalog</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            aria-label={`Play all songs in ${title}`}
            className="px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-sm flex items-center gap-2 transition-all duration-300 active:opacity-80 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Play size={18} className="fill-black ml-0.5" />
            <span>Play</span>
          </button>

          <button
            type="button"
            onClick={handleShufflePlay}
            disabled={tracks.length === 0}
            className="p-3 rounded-full bg-[#1A1A1A] hover:bg-[#242424] text-white transition-colors disabled:opacity-50 border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title="Shuffle"
            aria-label={`Shuffle play ${title}`}
          >
            <Shuffle size={18} />
          </button>
        </div>

        {/* Delete Playlist (for user playlists) */}
        {!isGenre && playlist.id?.startsWith('pl-') && (
          <button
            type="button"
            onClick={handleDelete}
            className="p-2.5 rounded-full text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title="Delete Playlist"
            aria-label={`Delete playlist ${title}`}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Track List */}
      <div className="bg-[#121212] rounded-xl p-2 md:p-4 border border-white/5">
        <TrackTable
          tracks={tracks}
          emptyMessage="No tracks in this playlist yet."
        />
      </div>
    </div>
  );
};
