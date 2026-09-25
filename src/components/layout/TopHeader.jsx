import React from 'react';
import { ChevronLeft, ChevronRight, Search, Sparkles, User, Music2 } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { usePlayerStore } from '../../store/usePlayerStore';

export const TopHeader = () => {
  const activeView = useLibraryStore((state) => state.activeView);
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const searchQuery = useLibraryStore((state) => state.searchQuery);
  const setSearchQuery = useLibraryStore((state) => state.setSearchQuery);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);

  const handleSearchFocus = () => {
    if (activeView !== 'search') {
      setActiveView('search');
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'home': return 'Home';
      case 'search': return 'Search';
      case 'library': return 'Your Library';
      case 'favorites': return 'Liked Songs';
      case 'privacy': return 'Privacy Policy';
      case 'terms': return 'Terms & Conditions';
      case 'cookies': return 'Cookie Policy';
      case 'refund': return 'Refund Policy';
      case 'business': return 'Business Details';
      default: return 'Jennie Music';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-8 py-3 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Mobile Branding / Title */}
      <div className="flex md:hidden items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center shadow-md">
          <Music2 size={16} className="text-white" aria-hidden="true" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white">{getPageTitle()}</span>
      </div>

      {/* Desktop Navigation History Controls */}
      <div className="hidden md:flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="Go back in browsing history"
          className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          title="Go Back"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => window.history.forward()}
          aria-label="Go forward in browsing history"
          className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          title="Go Forward"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Global Search Input (Desktop Only - Search Page has its own on mobile) */}
      <div className="hidden md:block relative flex-grow max-w-md mx-4">
        <div className="relative flex items-center">
          <label htmlFor="global-search-input" className="sr-only">
            Search songs, artists, or genres
          </label>
          <Search size={15} className="absolute left-3.5 text-neutral-400 pointer-events-none" aria-hidden="true" />
          <input
            id="global-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            placeholder="Search royalty-free songs, artists, or genres..."
            className="w-full pl-10 pr-10 py-2 bg-[#161616] hover:bg-[#1E1E1E] focus:bg-[#202020] rounded-full text-xs md:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all shadow-inner border border-white/5"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search input"
              className="absolute right-3 text-xs text-neutral-400 hover:text-white bg-white/10 w-4 h-4 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right User Badge & Jennie Status */}
      <div className="flex items-center gap-2">
        {currentTrack && (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={`Open now playing for ${currentTrack.title}`}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium max-w-[130px] truncate transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/5"
            title="Now Playing"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-400'}`} aria-hidden="true" />
            <span className="truncate text-[11px] font-semibold">{currentTrack.title}</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181818] border border-white/5 text-neutral-300 text-[11px] md:text-xs font-semibold">
          <Sparkles size={12} className="text-white" aria-hidden="true" />
          <span>Jennie Cloud</span>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('business')}
          aria-label="Platform and Operator Details"
          title="Operator Details"
          className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#181818] hover:bg-[#222222] cursor-pointer flex items-center justify-center text-neutral-400 hover:text-white transition-colors border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <User size={14} />
        </button>
      </div>
    </header>
  );
};
