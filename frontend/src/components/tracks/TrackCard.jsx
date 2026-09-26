import React from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { LikeButton } from '../common/LikeButton';

export const TrackCard = ({ track, queue = null, showGenre = true }) => {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const togglePlay = usePlayerStore((state) => state.togglePlay);

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queue);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePlayClick(e);
        }
      }}
      aria-label={`${track.title} by ${track.artist}`}
      className={`group relative p-3 rounded-2xl bg-[#141414] hover:bg-[#1A1A1A] transition-all duration-500 cursor-pointer flex flex-col justify-between hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/[0.05] hover:border-white/15 ${
        isCurrent ? 'bg-[#1C1C1C] border-white/20' : ''
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#0C0C0C] mb-3">
        <img
          src={track.coverUrl}
          alt={`Album cover artwork for ${track.title} by ${track.artist}`}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          loading="lazy"
        />

        {/* CC License Badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md uppercase tracking-wider">
            {track.license || 'CC-BY'}
          </span>
        </div>

        {/* Floating Like Button */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/60 backdrop-blur-md rounded-full">
            <LikeButton trackId={track.id} size={16} />
          </div>
        </div>

        {/* Gradient dark overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Floating Play / Pause Action Button */}
        <button
          onClick={handlePlayClick}
          aria-label={isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          title={isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          className={`absolute right-3 bottom-3 w-11 h-11 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center shadow-xl transition-all duration-300 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            isCurrentPlaying
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          {isCurrentPlaying ? (
            <Pause size={18} className="fill-black" />
          ) : (
            <Play size={18} className="fill-black ml-0.5" />
          )}
        </button>

        {/* Soundwave Animation when actively playing */}
        {isCurrentPlaying && (
          <div className="absolute left-3 bottom-3 flex items-end gap-1 px-2 py-1 rounded-md bg-black/80 backdrop-blur-md" aria-hidden="true">
            <span className="w-1 bg-white rounded-full animate-equalizer-1" />
            <span className="w-1 bg-neutral-300 rounded-full animate-equalizer-2" />
            <span className="w-1 bg-white rounded-full animate-equalizer-3" />
            <span className="w-1 bg-neutral-300 rounded-full animate-equalizer-4" />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-grow">
        <h4
          className={`text-sm font-semibold truncate transition-colors ${
            isCurrent ? 'text-white font-bold' : 'text-neutral-200 group-hover:text-white'
          }`}
          title={track.title}
        >
          {track.title}
        </h4>
        <p className="text-xs text-neutral-400 truncate mt-0.5 font-medium" title={track.artist}>
          {track.artist}
        </p>

        {/* Footer info: Genre / Mood */}
        {showGenre && (
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-white/5">
            <span className="font-medium text-neutral-300">{track.genre}</span>
            <span>{track.plays ? `${track.plays} plays` : 'Free Stream'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
