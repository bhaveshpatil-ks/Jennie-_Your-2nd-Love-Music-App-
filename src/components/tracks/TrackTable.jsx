import React from 'react';
import { TrackListRow } from './TrackListRow';
import { Clock3, Music } from 'lucide-react';

export const TrackTable = ({
  tracks = [],
  queue = null,
  emptyMessage = 'No tracks found.',
  startIndex = 0,
  showHeader = true,
}) => {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center text-muted">
        <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mb-2.5">
          <Music size={20} className="text-muted/60" />
        </div>
        <p className="text-sm font-medium text-white/80">{emptyMessage}</p>
        <p className="text-xs text-muted/60 mt-0.5">Try exploring other genres or search queries</p>
      </div>
    );
  }

  const effectiveQueue = queue || tracks;

  return (
    <div className="w-full">
      {/* Table Header */}
      {showHeader && (
        <div className="grid grid-cols-[20px_1fr_auto] sm:grid-cols-[24px_4fr_3fr_minmax(80px,1fr)] md:grid-cols-[28px_4fr_3fr_2fr_120px] items-center gap-2.5 md:gap-3 px-3 py-2 text-[10px] sm:text-[11px] font-semibold text-muted uppercase tracking-wider border-b border-white/[0.04] mb-1 select-none">
          <div className="text-center">#</div>
          <div>Title</div>
          <div className="hidden sm:block">Album</div>
          <div className="hidden md:block">Mood / Genre</div>
          <div className="flex items-center justify-end pr-2 md:pr-4">
            <Clock3 size={13} />
          </div>
        </div>
      )}

      {/* Table Rows */}
      <div className="space-y-0.5 sm:space-y-1">
        {tracks.map((track, idx) => (
          <TrackListRow
            key={track.id || idx}
            track={track}
            index={startIndex + idx}
            queue={effectiveQueue}
          />
        ))}
      </div>
    </div>
  );
};
