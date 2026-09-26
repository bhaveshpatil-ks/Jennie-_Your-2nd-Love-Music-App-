import React, { useEffect } from 'react';
import { X, ListMusic } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { TrackListRow } from '../tracks/TrackListRow';

export const QueueDrawer = () => {
  const isQueueOpen = usePlayerStore((state) => state.isQueueOpen);
  const setQueueOpen = usePlayerStore((state) => state.setQueueOpen);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isQueueOpen) {
        setQueueOpen(false);
      }
    };
    if (isQueueOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQueueOpen, setQueueOpen]);

  if (!isQueueOpen) return null;

  const nextTracks = queue.slice(currentIndex + 1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Play Queue"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 glass-panel bg-[#0C0C0C]/95 border-l border-white/[0.07] shadow-[0_0_60px_rgba(0,0,0,0.9)] p-5 flex flex-col justify-between animate-luxury-slide-right backdrop-blur-3xl text-neutral-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ListMusic size={18} className="text-white" aria-hidden="true" />
          <h2 className="font-bold text-base text-white">Play Queue</h2>
        </div>
        <button
          type="button"
          onClick={() => setQueueOpen(false)}
          aria-label="Close play queue"
          className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Queue Content */}
      <div data-lenis-prevent className="flex-grow overflow-y-auto py-4 space-y-6">
        {/* Now Playing Section */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Now Playing
          </span>
          {currentTrack && (
            <div className="p-2.5 rounded-2xl bg-white/[0.04] flex items-center gap-3 border border-white/5">
              <img
                src={currentTrack.coverUrl}
                alt={`Now playing artwork for ${currentTrack.title} by ${currentTrack.artist}`}
                className="w-12 h-12 rounded-xl object-cover shadow"
              />
              <div className="min-w-0 flex-grow">
                <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-neutral-400 truncate">{currentTrack.artist}</p>
                <span className="text-[10px] text-neutral-400 font-medium">{currentTrack.license || 'Free Stream'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Next Up Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Next Up ({nextTracks.length})
            </span>
          </div>

          {nextTracks.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-4">No upcoming tracks in queue</p>
          ) : (
            <div className="space-y-1">
              {nextTracks.map((track, idx) => (
                <div key={track.id} className="group/rec">
                  <TrackListRow
                    track={track}
                    index={currentIndex + 1 + idx}
                    queue={queue}
                  />
                  {track.recommendationReason && (
                    <div className="pl-11 pr-3 pb-1 -mt-1 flex items-center justify-between text-[10px] text-neutral-400">
                      <span className="truncate max-w-[200px] sm:max-w-[240px]">
                        ✨ {track.recommendationReason}
                      </span>
                      {track.recommendationConfidence && (
                        <span className="font-mono text-neutral-300 font-medium bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                          {Math.round(track.recommendationConfidence * 100)}% match
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-white/5 text-[11px] text-neutral-400 flex items-center justify-between">
        <span>Jennie Queue Manager</span>
        <span>Auto-loop stream</span>
      </div>
    </div>
  );
};
