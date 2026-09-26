import React from 'react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { Play } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { MOCK_TRACKS } from '../../data/mockTracks';

export const GenreTile = ({ genre }) => {
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const playTrack = usePlayerStore((state) => state.playTrack);

  const handleClick = () => {
    setActiveView('genre', genre);
  };

  const handleQuickPlay = (e) => {
    e.stopPropagation();
    const genreTracks = MOCK_TRACKS.filter(
      (t) => t.genre.toLowerCase() === genre.id.toLowerCase() || t.genre.toLowerCase().includes(genre.id.toLowerCase())
    );
    if (genreTracks.length > 0) {
      playTrack(genreTracks[0], genreTracks);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Explore ${genre.name} genre (${genre.trackCount} tracks)`}
      style={{ background: genre.gradient || '#1C1C1C' }}
      className="group relative h-40 md:h-44 p-4 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/5"
    >
      {/* Background Cover Overlay with tilt */}
      <img
        src={genre.coverUrl}
        alt={`Genre artwork for ${genre.name}`}
        className="absolute -right-4 -bottom-4 w-28 h-28 md:w-32 md:h-32 object-cover rounded-lg shadow-2xl rotate-[22deg] group-hover:rotate-[15deg] group-hover:scale-110 transition-transform duration-300 opacity-80"
        loading="lazy"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md inline-block mb-1.5">
            {genre.trackCount} Tracks
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight leading-tight line-clamp-1 group-hover:text-white">
            {genre.name}
          </h3>
          <p className="text-xs text-white/90 mt-1 line-clamp-2 max-w-[65%] font-medium">
            {genre.description}
          </p>
        </div>

        {/* Quick Play Button on Hover */}
        <button
          type="button"
          onClick={handleQuickPlay}
          aria-label={`Play ${genre.name} genre tracks`}
          className="self-start w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:opacity-100 focus-visible:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          title={`Play ${genre.name}`}
        >
          <Play size={16} className="fill-black ml-0.5" />
        </button>
      </div>
    </div>
  );
};
