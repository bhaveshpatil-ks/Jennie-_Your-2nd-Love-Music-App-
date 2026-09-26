import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

export const VolumeControl = ({ className = '', showPercentage = true }) => {
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const toggleMute = usePlayerStore((state) => state.toggleMute);

  const effectiveVolume = isMuted ? 0 : volume;

  const getVolumeIcon = () => {
    if (effectiveVolume === 0 || isMuted) return <VolumeX size={17} className="text-neutral-400" aria-hidden="true" />;
    if (effectiveVolume < 0.5) return <Volume1 size={17} className="text-neutral-400" aria-hidden="true" />;
    return <Volume2 size={17} className="text-neutral-300 group-hover:text-white transition-colors" aria-hidden="true" />;
  };

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
        aria-pressed={isMuted}
        className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
      </button>

      <div className="relative w-20 md:w-24 h-3 flex items-center cursor-pointer">
        {/* Track */}
        <div className="w-full h-1 group-hover:h-1.5 rounded-full bg-white/20 overflow-hidden transition-all relative">
          <div
            style={{ width: `${effectiveVolume * 100}%` }}
            className="h-full bg-white group-hover:bg-white rounded-full transition-colors"
          />
        </div>

        {/* Accessible Input */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={effectiveVolume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Volume slider"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(effectiveVolume * 100)}
          aria-valuetext={`${Math.round(effectiveVolume * 100)} percent volume`}
        />

        {/* Thumb */}
        <div
          style={{ left: `${effectiveVolume * 100}%` }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        />
      </div>

      {showPercentage && (
        <span className="text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors w-7 text-left select-none">
          {Math.round(effectiveVolume * 100)}%
        </span>
      )}
    </div>
  );
};
