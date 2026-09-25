import React, { useState } from 'react';
import { 
  Plus, 
  Heart, 
  Music, 
  UserCheck
} from 'lucide-react';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { MOCK_TRACKS } from '../data/mockTracks';

export const Library = ({ onOpenCreatePlaylist }) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'playlists' | 'artists'
  const customPlaylists = useLibraryStore((state) => state.customPlaylists);
  const likedTrackIds = useLibraryStore((state) => state.likedTrackIds);
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const playTrack = usePlayerStore((state) => state.playTrack);

  // Derive unique artists
  const artists = Array.from(new Set(MOCK_TRACKS.map((t) => t.artist))).map((artistName) => {
    const artistTracks = MOCK_TRACKS.filter((t) => t.artist === artistName);
    return {
      name: artistName,
      trackCount: artistTracks.length,
      coverUrl: artistTracks[0]?.coverUrl,
      genre: artistTracks[0]?.genre,
      tracks: artistTracks
    };
  });

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Your Library</h1>
          <p className="text-xs md:text-sm text-neutral-400 mt-0.5">Manage your saved playlists, likes, and favorite artists</p>
        </div>

        <button
          type="button"
          onClick={onOpenCreatePlaylist}
          aria-label="Create new playlist"
          className="self-start sm:self-auto px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-2 transition-all duration-300 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Plus size={16} />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2" role="tablist" aria-label="Library Content Filter">
        {['all', 'playlists', 'artists'].map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={filter === tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-300 active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              filter === tab
                ? 'bg-white text-black font-bold shadow-sm'
                : 'bg-[#141414] text-neutral-400 hover:text-white border border-white/[0.05]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      {(filter === 'all' || filter === 'playlists') && (
        <section className="space-y-4" aria-label="Playlists and Collections">
          <h2 className="text-base font-bold text-white tracking-tight">Playlists & Collections</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Special Liked Songs Card */}
            <div
              onClick={() => setActiveView('favorites')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveView('favorites'); }}
              aria-label={`Liked Songs collection containing ${likedTrackIds.length} tracks`}
              className="group relative p-5 rounded-2xl bg-gradient-to-br from-[#202020] via-[#161616] to-[#121212] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl flex flex-col justify-between h-56 border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <Heart size={24} className="fill-white" aria-hidden="true" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Playlist</span>
                <h3 className="text-lg font-bold text-white group-hover:text-neutral-200 transition-colors">Liked Songs</h3>
                <p className="text-xs text-neutral-300 mt-1 font-medium">{likedTrackIds.length} tracks saved</p>
              </div>
            </div>

            {/* Create New Playlist Card */}
            <div
              onClick={onOpenCreatePlaylist}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenCreatePlaylist(); }}
              aria-label="Create a new playlist"
              className="group p-5 rounded-2xl bg-[#141414] hover:bg-[#1A1A1A] border-2 border-dashed border-white/10 hover:border-white/25 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center h-56 gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-white/10 text-neutral-400 group-hover:text-white flex items-center justify-center transition-colors">
                <Plus size={22} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-neutral-200 transition-colors">
                  Create Playlist
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Add custom royalty-free mixes</p>
              </div>
            </div>

            {/* Custom Playlists */}
            {customPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => setActiveView('playlist', pl)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveView('playlist', pl); }}
                aria-label={`Open playlist ${pl.title}`}
                className="group relative p-4 rounded-2xl bg-[#141414] hover:bg-[#1A1A1A] transition-all duration-500 cursor-pointer flex flex-col justify-between h-56 hover:shadow-2xl border border-white/[0.05] hover:border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#0C0C0C] mb-3">
                  <img
                    src={pl.coverUrl}
                    alt={`Cover artwork for custom playlist ${pl.title}`}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-neutral-200 transition-colors">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">{pl.description || 'Personal playlist'}</p>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-1 border-t border-white/5">
                    <span>{pl.trackIds?.length || 0} tracks</span>
                    <span>{pl.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Artists Section */}
      {(filter === 'all' || filter === 'artists') && (
        <section className="space-y-4 pt-4" aria-label="Featured Artists">
          <h2 className="text-base font-bold text-white tracking-tight">Featured Artists</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.map((artist) => (
              <div
                key={artist.name}
                onClick={() => {
                  playTrack(artist.tracks[0], artist.tracks);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    playTrack(artist.tracks[0], artist.tracks);
                  }
                }}
                aria-label={`Play tracks by artist ${artist.name}`}
                className="group p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1A1A1A] transition-all duration-500 cursor-pointer text-center flex flex-col items-center border border-white/[0.05] hover:border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 shadow-md">
                  <img
                    src={artist.coverUrl}
                    alt={`Artist photo for ${artist.name}`}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate w-full group-hover:text-neutral-200 transition-colors">
                  {artist.name}
                </h3>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">{artist.genre} • {artist.trackCount} songs</p>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
