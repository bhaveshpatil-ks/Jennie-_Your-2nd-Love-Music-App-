import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Sparkles, User, Music2, Shield, LogOut, Mail, CheckCircle2, AlertTriangle, Trash2, Sliders } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAuthStore } from '../../store/useAuthStore';

export const TopHeader = () => {
  const activeView = useLibraryStore((state) => state.activeView);
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const searchQuery = useLibraryStore((state) => state.searchQuery);
  const setSearchQuery = useLibraryStore((state) => state.setSearchQuery);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);

  const { user, profile, isEmailVerified, openAuthModal, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const displayName = profile?.username || user?.displayName || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

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

      {/* Right User Badge & Auth State */}
      <div className="flex items-center gap-2.5">
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
          <Sparkles size={12} className="text-zinc-400" aria-hidden="true" />
          <span>Jennie Cloud</span>
        </div>

        {/* User Auth Section (Desktop only - mobile has dedicated bottom nav tab) */}
        {!user ? (
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <User size={13} className="stroke-[2.5]" />
            <span>Sign In</span>
          </button>
        ) : (
          <div className="relative hidden md:block" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="User Account Menu"
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#181818] hover:bg-[#222222] border border-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-700 via-zinc-800 to-zinc-900 text-white font-bold text-xs flex items-center justify-center border border-zinc-600 shadow-sm">
                {initial}
              </div>
              <span className="text-xs font-medium text-white max-w-[90px] truncate hidden sm:inline">
                {displayName}
              </span>
              {!isEmailVerified && (
                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-ping" title="Verification Pending" />
              )}
            </button>

            {/* Account Popover Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#121214] border border-zinc-800 shadow-2xl p-3 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 via-zinc-800 to-zinc-900 text-white font-bold text-sm flex items-center justify-center border border-zinc-600 shadow-sm">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                      <p className="text-[11px] text-white/50 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    {profile?.age_bracket && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                        {profile.age_bracket} Tier
                      </span>
                    )}
                    {profile?.is_minor ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                        <Shield size={10} /> Safe Mode
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Full Fidelity
                      </span>
                    )}
                  </div>
                </div>

                {/* Email Verification Action */}
                {!isEmailVerified && (
                  <div className="p-2.5 my-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[11px]">Unverified Email</p>
                        <p className="text-[10px] text-amber-300/80">Confirm ownership to secure your playlist data.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        openAuthModal('verify_notice');
                      }}
                      className="mt-2 w-full py-1 text-center bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-[11px] font-semibold rounded-lg transition-colors"
                    >
                      Verify Now
                    </button>
                  </div>
                )}

                {/* Menu items */}
                <div className="py-1 space-y-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveView('settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Sliders size={14} className="text-zinc-300" />
                    <span>Settings &amp; Audio Quality</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveView('settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <User size={14} className="text-zinc-300" />
                    <span>Edit Profile &amp; Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveView('business');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Shield size={14} />
                    <span>Account &amp; Operator Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      openAuthModal('delete_account_confirm');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    <span>Delete Account Permanently</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-white/5 mt-1 pt-2"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

