import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Disc, Play, Pause } from 'lucide-react';
import { MOCK_TRACKS, GENRES } from '../data/mockTracks';
import { TrackTable } from '../components/tracks';
import { GenreTile } from '../components/common';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchTracks } from '../services/api';

export const Search = () => {
  const searchQuery = useLibraryStore((state) => state.searchQuery);
  const setSearchQuery = useLibraryStore((state) => state.setSearchQuery);
  const searchFilter = useLibraryStore((state) => state.searchFilter);
  const setSearchFilter = useLibraryStore((state) => state.setSearchFilter);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const togglePlay = usePlayerStore((state) => state.togglePlay);

  const [liveTracks, setLiveTracks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [source, setSource] = useState('all'); // 'all' | 'youtube' | 'audius' | 'jamendo'

  const query = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (!query) {
      setLiveTracks([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchTracks(query, searchFilter, source)
        .then((tracks) => {
          setLiveTracks(tracks || []);
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [query, searchFilter, source]);

  const filteredTracks = liveTracks;
  const topResult = filteredTracks.length > 0 ? filteredTracks[0] : null;
  const isTopResultPlaying = topResult && currentTrack?.id === topResult.id && isPlaying;
  const isSongsFilter = searchFilter === 'songs';
  const popularTags = ['Lo-Fi', 'Synthwave', 'Ambient', 'Acoustic', 'Deep House', 'Classical'];

  const handleTopResultPlay = () => {
    if (!topResult) return;
    if (currentTrack?.id === topResult.id) {
      togglePlay();
    } else {
      playTrack(topResult, filteredTracks);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Search Bar & Filters Section */}
      <div className="space-y-3.5">
        {/* Main Search Input */}
        <div className="relative max-w-2xl">
          <label htmlFor="main-search-input" className="sr-only">
            Search songs, artists, or genres
          </label>
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" aria-hidden="true" />
          <input
            id="main-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search royalty-free artists, songs, or genres..."
            autoFocus
            className="w-full pl-11 pr-10 py-3 bg-[#161616] hover:bg-[#1C1C1C] focus:bg-[#202020] focus-visible:ring-2 focus-visible:ring-white rounded-2xl text-white text-sm placeholder:text-neutral-500 focus:outline-none transition-all shadow-inner border border-white/5"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              title="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-white bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Unified Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs" role="toolbar" aria-label="Search Filters">
          {/* Content Type Filter */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {['all', 'songs', 'artists', 'genres'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSearchFilter(f)}
                aria-pressed={searchFilter === f}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-300 active:opacity-75 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  searchFilter === f
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-[#141414] text-neutral-300 hover:text-white hover:bg-[#1E1E1E] border border-white/[0.06]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-white/10 flex-shrink-0 mx-1" aria-hidden="true" />

          {/* Engine Source Selector */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {[
              { id: 'all', label: 'All Sources' },
              { id: 'jamendo', label: 'Jamendo (CC)' },
              { id: 'audius', label: 'Audius' },
              { id: 'youtube', label: 'YouTube Embeds' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSource(s.id)}
                aria-pressed={source === s.id}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  source === s.id
                    ? 'bg-neutral-800 text-white font-semibold border-white/20 shadow-sm'
                    : 'bg-[#141414] text-neutral-400 hover:text-white border-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* When Search Query is Active */}
      {query ? (
        <div className="space-y-6 animate-luxury-fade">
          {/* Loading Indicator */}
          {isSearching && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 py-1" role="status">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
              <span className="font-medium tracking-wide">Searching master recordings...</span>
            </div>
          )}

          {/* Search Results */}
          {filteredTracks.length > 0 ? (
            <div className="space-y-6">
              {/* Pure Songs View (when Songs tab is selected) */}
              {isSongsFilter ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Songs ({filteredTracks.length})
                  </h3>
                  <div className="bg-[#121212] rounded-2xl p-2 border border-white/5 shadow-xl">
                    <TrackTable tracks={filteredTracks} queue={filteredTracks} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Spotify View (>= lg) */}
                  <div className="hidden lg:block space-y-6">
                    <div className="grid grid-cols-3 gap-5 items-stretch">
                      {/* Top Match Card */}
                      {topResult && (
                        <div className="col-span-1 space-y-2 flex flex-col">
                          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Top Match</h3>
                          <div
                            onClick={handleTopResultPlay}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleTopResultPlay();
                              }
                            }}
                            aria-label={`Play top match: ${topResult.title} by ${topResult.artist}`}
                            className="group relative p-5 rounded-2xl bg-[#141414] hover:bg-[#181818] transition-all duration-300 cursor-pointer border border-white/[0.06] hover:border-white/15 shadow-xl flex flex-col justify-between flex-grow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          >
                            <div>
                              <img
                                src={topResult.coverUrl}
                                alt={`Album cover artwork for ${topResult.title} by ${topResult.artist}`}
                                className="w-24 h-24 rounded-xl object-cover shadow-2xl mb-4 bg-neutral-900 group-hover:scale-[1.02] transition-transform duration-500"
                              />
                              <h4 className="text-2xl font-bold text-white tracking-tight leading-tight line-clamp-2">
                                {topResult.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-400 font-medium">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-black">
                                  Song
                                </span>
                                <span className="text-white hover:underline truncate max-w-[140px]">
                                  {topResult.artist}
                                </span>
                                {topResult.genre && (
                                  <>
                                    <span className="text-neutral-600">•</span>
                                    <span className="text-neutral-400 truncate">{topResult.genre}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Floating Circular Play / Pause Action Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTopResultPlay();
                              }}
                              aria-label={isTopResultPlaying ? `Pause ${topResult.title}` : `Play ${topResult.title}`}
                              className={`absolute right-5 bottom-5 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                                isTopResultPlaying
                                  ? 'opacity-100 translate-y-0'
                                  : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                              }`}
                            >
                              {isTopResultPlaying ? (
                                <Pause size={20} className="fill-black" />
                              ) : (
                                <Play size={20} className="fill-black ml-0.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Top Songs Table */}
                      <div className={`${topResult ? 'col-span-2' : 'col-span-3'} space-y-2`}>
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                          Songs ({Math.min(filteredTracks.length, 4)})
                        </h3>
                        <div className="bg-[#121212] rounded-2xl p-2 border border-white/5 shadow-xl h-[calc(100%-24px)] flex flex-col justify-center">
                          <TrackTable tracks={filteredTracks.slice(0, 4)} queue={filteredTracks} />
                        </div>
                      </div>
                    </div>

                    {/* Remaining Songs in Full Line-by-Line Table */}
                    {filteredTracks.length > 4 && (
                      <div className="space-y-2 pt-2">
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                          More Songs ({filteredTracks.length - 4})
                        </h3>
                        <div className="bg-[#121212] rounded-2xl p-2 border border-white/5 shadow-xl">
                          <TrackTable
                            tracks={filteredTracks.slice(4)}
                            queue={filteredTracks}
                            startIndex={4}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile & Tablet Spotify View (< lg) */}
                  <div className="lg:hidden space-y-4">
                    {/* Compact Spotify Mobile Top Result */}
                    {topResult && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Top Match</h3>
                        <div
                          onClick={handleTopResultPlay}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleTopResultPlay();
                            }
                          }}
                          aria-label={`Play top match: ${topResult.title} by ${topResult.artist}`}
                          className="p-3 rounded-xl bg-[#141414] hover:bg-[#181818] transition-all duration-300 border border-white/[0.06] flex items-center gap-3.5 cursor-pointer active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-lg"
                        >
                          <img
                            src={topResult.coverUrl}
                            alt={`Album cover artwork for ${topResult.title} by ${topResult.artist}`}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-md bg-neutral-900"
                          />
                          <div className="min-w-0 flex-grow">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-white px-1.5 py-0.5 rounded-sm inline-block mb-1">
                              Top Result
                            </span>
                            <h4 className="text-sm font-bold text-white truncate leading-snug">
                              {topResult.title}
                            </h4>
                            <p className="text-xs text-neutral-400 truncate mt-0.5">
                              Song • <span className="text-neutral-300">{topResult.artist}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTopResultPlay();
                            }}
                            aria-label={isTopResultPlaying ? `Pause ${topResult.title}` : `Play ${topResult.title}`}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md flex-shrink-0 active:scale-95 transition-transform"
                          >
                            {isTopResultPlaying ? (
                              <Pause size={16} className="fill-black" />
                            ) : (
                              <Play size={16} className="fill-black ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Continuous All Songs Line-by-Line List on Mobile */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Songs ({filteredTracks.length})
                      </h3>
                      <div className="bg-[#121212] rounded-2xl p-1.5 border border-white/5 shadow-xl">
                        <TrackTable tracks={filteredTracks} queue={filteredTracks} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : !isSearching ? (
            /* No Results Found */
            <div className="text-center py-16 bg-[#121212] rounded-2xl p-6 border border-white/5" role="status">
              <Disc size={32} className="text-neutral-500 mx-auto mb-2.5 opacity-60" aria-hidden="true" />
              <h3 className="text-base font-bold text-white">No results found for &quot;{searchQuery}&quot;</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                Try searching for another song, artist, or explore one of the popular tags below.
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        /* Empty Query: Popular suggestions & Full Genre Grid */
        <div className="space-y-6">
          {/* Quick Tags */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Popular Tags</h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(tag)}
                  className="px-3.5 py-1.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-xs font-medium text-neutral-300 hover:text-white transition-all duration-300 border border-white/[0.06] active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Browse Genres Grid */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
              Browse All Genres
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
              {GENRES.map((genre) => (
                <GenreTile key={genre.id} genre={genre} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
