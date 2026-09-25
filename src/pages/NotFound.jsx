import React from 'react';
import { Home, Search, Compass, Disc3, ArrowLeft } from 'lucide-react';
import { useLibraryStore } from '../store/useLibraryStore';

export const NotFound = () => {
  const setActiveView = useLibraryStore((state) => state.setActiveView);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 animate-luxury-fade relative overflow-hidden">
      {/* Ambient background glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-amber-500/10 via-neutral-700/10 to-transparent rounded-full blur-3xl pointer-events-none" 
      />

      {/* Decorative spinning vinyl motif */}
      <div className="relative mb-8">
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-neutral-800 bg-[#0E0E12] flex items-center justify-center shadow-2xl relative">
          <Disc3 className="w-14 h-14 sm:w-16 sm:h-16 text-neutral-600 animate-spin-slow" />
          <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-pulse pointer-events-none" />
        </div>
        <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 text-[10px] tracking-widest font-mono uppercase bg-neutral-900 border border-neutral-700 text-neutral-300 rounded-full shadow-lg">
          Lost Track
        </span>
      </div>

      {/* Numerical Badge */}
      <p className="text-xs uppercase tracking-[0.3em] font-mono text-amber-400/80 mb-2">
        Error 404 • Frequency Not Found
      </p>

      {/* Headline */}
      <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
        Silence on This Frequency
      </h1>

      {/* Description */}
      <p className="text-neutral-400 max-w-md text-sm sm:text-base leading-relaxed mb-8">
        The destination or song you are seeking does not exist, has been archived, or slipped past our catalog radar.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-all shadow-xl active:scale-95 cursor-pointer"
          aria-label="Return to Jennie Music Home"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>

        <button
          onClick={() => setActiveView('search')}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm font-medium hover:bg-neutral-800 hover:border-neutral-700 transition-all active:scale-95 cursor-pointer"
          aria-label="Open search to find tracks and artists"
        >
          <Search className="w-4 h-4 text-neutral-400" />
          Explore Search
        </button>

        <button
          onClick={() => setActiveView('library')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer w-full mt-2"
          aria-label="Go to Your Music Library"
        >
          <Compass className="w-3.5 h-3.5" />
          Go to Your Library
        </button>
      </div>

      {/* Minimal Footer Note */}
      <div className="mt-16 pt-6 border-t border-neutral-900/80 text-[11px] text-neutral-500 font-mono tracking-wider">
        JENNIE ARCHITECTURE • HTTP STATUS 404
      </div>
    </div>
  );
};

export default NotFound;
