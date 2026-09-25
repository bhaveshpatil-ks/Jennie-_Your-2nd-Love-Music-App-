import React, { useRef, useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Headphones, 
  Moon, 
  Zap, 
  Music4
} from 'lucide-react';
import { MOCK_TRACKS, GENRES, FEATURED_MIXES } from '../data/mockTracks';
import { TrackCard } from '../components/tracks';
import { GenreTile } from '../components/common';
import { useLibraryStore } from '../store/useLibraryStore';
import { fetchHomeFeed } from '../services/api';

export const Home = () => {
  const setActiveView = useLibraryStore((state) => state.setActiveView);

  const [feed, setFeed] = useState({
    featured: MOCK_TRACKS.find((t) => t.featured) || MOCK_TRACKS[0],
    trending: MOCK_TRACKS.slice(0, 6),
    lofi: MOCK_TRACKS.filter((t) => t.genre === 'Lo-Fi'),
    synthwave: MOCK_TRACKS.filter((t) => t.genre === 'Synthwave'),
    ambient: MOCK_TRACKS.filter((t) => t.genre === 'Ambient'),
    house: MOCK_TRACKS.filter((t) => t.genre === 'Deep House'),
    acoustic: MOCK_TRACKS.filter((t) => t.genre === 'Acoustic' || t.genre === 'Classical'),
  });

  useEffect(() => {
    let mounted = true;
    fetchHomeFeed().then((data) => {
      if (mounted && data) {
        setFeed((prev) => ({
          ...prev,
          ...data,
          featured: data.featured || prev.featured,
        }));
      }
    });
    return () => { mounted = false; };
  }, []);

  const lofiTracks = feed.lofi?.length ? feed.lofi : MOCK_TRACKS.filter((t) => t.genre === 'Lo-Fi');
  const synthTracks = feed.synthwave?.length ? feed.synthwave : MOCK_TRACKS.filter((t) => t.genre === 'Synthwave');
  const ambientTracks = feed.ambient?.length ? feed.ambient : MOCK_TRACKS.filter((t) => t.genre === 'Ambient');
  const acousticTracks = feed.acoustic?.length ? feed.acoustic : MOCK_TRACKS.filter((t) => t.genre === 'Acoustic' || t.genre === 'Classical');
  const trendingTracks = feed.trending?.length ? feed.trending : MOCK_TRACKS.slice(0, 6);

  // Horizontal scroll shelf helper
  const ShelfRow = ({ title, icon: Icon, tracks, id }) => {
    const rowRef = useRef(null);

    const scroll = (direction) => {
      if (rowRef.current) {
        const scrollAmount = direction === 'left' ? -380 : 380;
        rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    return (
      <section className="space-y-3.5 my-8" aria-label={title}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon size={20} className="text-white" aria-hidden="true" />}
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#252525] text-neutral-300 hover:text-white flex items-center justify-center transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={`Scroll ${title} carousel left`}
              title="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#252525] text-neutral-300 hover:text-white flex items-center justify-center transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={`Scroll ${title} carousel right`}
              title="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={rowRef}
          data-lenis-prevent
          className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tracks.map((track) => (
            <div key={track.id} className="w-44 md:w-52 flex-shrink-0">
              <TrackCard track={track} queue={tracks} />
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Quick Curated Mixes Row */}
      <section aria-label="Curated Mood Mixes">
        <h2 className="text-lg font-bold text-white mb-3 tracking-tight">Curated Mood Mixes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {FEATURED_MIXES.map((mix) => (
            <div
              key={mix.id}
              onClick={() => setActiveView('playlist', mix)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveView('playlist', mix);
                }
              }}
              aria-label={`Open curated playlist ${mix.title}`}
              className="group flex items-center gap-3.5 p-3 rounded-2xl bg-[#161616] hover:bg-[#202020] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <img
                src={mix.coverUrl}
                alt={`Playlist artwork for ${mix.title}`}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow"
              />
              <div className="min-w-0 flex-grow">
                <h3 className="text-sm font-bold text-white group-hover:text-neutral-100 transition-colors truncate">
                  {mix.title}
                </h3>
                <p className="text-xs text-neutral-400 truncate mt-0.5 line-clamp-1">{mix.description}</p>
                <span className="text-[10px] text-neutral-400 font-medium mt-1 inline-block">
                  Royalty-free curated mix
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Horizontal Shelves */}
      <ShelfRow
        title="Trending & Popular"
        icon={Flame}
        tracks={trendingTracks}
        id="trending"
      />

      <ShelfRow
        title="Lo-Fi & Cozy Beats"
        icon={Headphones}
        tracks={lofiTracks}
        id="lofi"
      />

      <ShelfRow
        title="Synthwave & Cyber Energy"
        icon={Zap}
        tracks={synthTracks}
        id="synth"
      />

      {/* Genre Grid Exploration */}
      <section className="space-y-4 pt-4" aria-label="Explore All Genres">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Explore All Genres & Moods
          </h2>
          <button
            type="button"
            onClick={() => setActiveView('search')}
            className="text-xs font-semibold text-neutral-400 hover:text-white hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          >
            See all
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {GENRES.map((genre) => (
            <GenreTile key={genre.id} genre={genre} />
          ))}
        </div>
      </section>

      <ShelfRow
        title="Ambient Soundscapes for Sleep & Focus"
        icon={Moon}
        tracks={ambientTracks}
        id="ambient"
      />

      <ShelfRow
        title="Acoustic & Classical Expressions"
        icon={Music4}
        tracks={acousticTracks}
        id="acoustic"
      />
    </div>
  );
};
