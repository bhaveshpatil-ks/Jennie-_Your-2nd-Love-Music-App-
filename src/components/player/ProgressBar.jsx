import React, { useState, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatDuration } from '../../data/mockTracks';

export const ProgressBar = ({ showTimes = true, className = '' }) => {
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration) || 180;
  const seekTo = usePlayerStore((state) => state.seekTo);
  const setIsScrubbing = usePlayerStore((state) => state.setIsScrubbing);

  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(0);
  const barRef = useRef(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMouseMove = (e) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPos(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const handleSliderChange = (e) => {
    const newTime = parseFloat(e.target.value);
    seekTo(newTime);
  };

  return (
    <div className={`flex items-center gap-2.5 w-full select-none ${className}`}>
      {showTimes && (
        <span className="text-[11px] font-mono text-muted/80 w-8 text-right tabular-nums">
          {formatDuration(currentTime)}
        </span>
      )}

      {/* Progress Track Container */}
      <div
        ref={barRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative group flex-grow h-3 flex items-center cursor-pointer"
      >
        {/* Hover Tooltip */}
        {hoverTime !== null && (
          <div
            style={{ left: `${hoverPos}%` }}
            className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#252525] border border-white/10 text-[10px] font-mono text-white shadow-lg pointer-events-none z-30"
          >
            {formatDuration(hoverTime)}
          </div>
        )}

        {/* Background Track */}
        <div className="w-full h-1 group-hover:h-1.5 rounded-full bg-white/15 overflow-hidden transition-all duration-150 relative">
          {/* Active Fill Bar */}
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-white group-hover:bg-white rounded-full transition-colors duration-150 relative"
          />
        </div>

        {/* Hidden Range Input overlay for accessible dragging */}
        <input
          type="range"
          min={0}
          max={duration}
          step={0.5}
          value={currentTime}
          onChange={handleSliderChange}
          onMouseDown={() => setIsScrubbing(true)}
          onMouseUp={() => setIsScrubbing(false)}
          onTouchStart={() => setIsScrubbing(true)}
          onTouchEnd={() => setIsScrubbing(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          aria-label="Seek track position"
        />

        {/* Custom Visible Thumb on Hover */}
        <div
          style={{ left: `${progressPercent}%` }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        />
      </div>

      {showTimes && (
        <span className="text-[11px] font-mono text-muted/80 w-8 tabular-nums">
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
};
