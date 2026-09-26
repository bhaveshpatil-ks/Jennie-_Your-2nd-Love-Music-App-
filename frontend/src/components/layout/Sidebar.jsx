import React from 'react';
import { 
  Home, 
  Search, 
  Library, 
  Heart, 
  Plus, 
  Radio, 
  ShieldCheck, 
  Music,
  Scale,
  FileText,
  Building2
} from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useAuthStore } from '../../store/useAuthStore';

export const Sidebar = ({ onOpenCreatePlaylist }) => {
  const activeView = useLibraryStore((state) => state.activeView);
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const customPlaylists = useLibraryStore((state) => state.customPlaylists);
  const selectedItem = useLibraryStore((state) => state.selectedItem);
  const likedTrackIds = useLibraryStore((state) => state.likedTrackIds);

  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
    { 
      id: 'favorites', 
      label: 'Liked Songs', 
      icon: Heart, 
      badge: likedTrackIds.length > 0 ? likedTrackIds.length : null 
    },
  ];

  return (
    <aside
      aria-label="Main Navigation Sidebar"
      className="w-64 bg-[#080808] border-r border-white/[0.06] flex flex-col justify-between h-screen sticky top-0 p-4 select-none pb-28 text-neutral-300"
    >
      {/* Brand & Main Navigation */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveView('home')} 
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveView('home'); }}
          className="flex items-center gap-2.5 px-2 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl"
          aria-label="Jennie Music Home"
        >
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md transition-opacity group-hover:opacity-90">
            <Radio size={20} className="text-black stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              Jennie <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">v0.1</span>
            </span>
            <p className="text-[10px] text-neutral-400 font-medium -mt-0.5">Royalty-Free & Open Music</p>
          </div>
        </div>

        {/* Primary Nav Menu */}
        <nav aria-label="Primary" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.06]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-700 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="h-[1px] bg-white/[0.06] mx-2" />

        {/* Playlists Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Playlists
            </span>
            <button
              onClick={onOpenCreatePlaylist}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="Create New Playlist"
              aria-label="Create New Playlist"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Playlist List */}
          <div className="space-y-0.5 max-h-44 overflow-y-auto pr-1">
            {customPlaylists.map((pl) => {
              const isSelected = activeView === 'playlist' && selectedItem?.id === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => setActiveView('playlist', pl)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium truncate transition-colors flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    isSelected
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Music size={13} className={isSelected ? 'text-white' : 'text-neutral-500'} />
                  <span className="truncate">{pl.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compliance & Legal Section */}
      <div className="space-y-2">
        {!user && (
          <div className="p-3 rounded-2xl bg-gradient-to-b from-[#181818] to-[#101010] border border-white/5 space-y-2">
            <p className="text-xs font-semibold text-white">Join Jennie Cloud</p>
            <p className="text-[10px] text-neutral-400 leading-normal">
              Sign in to sync your playlists and access lossless high-fidelity streams.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-colors shadow-sm"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Attribution & Legal Badge */}
        <div className="p-3 rounded-2xl bg-[#141414] space-y-1.5 shadow-sm border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
              <ShieldCheck size={14} className="text-white" />
              <span>Open-License Audio</span>
            </div>
            <a
              href="https://www.jamendo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-neutral-400 hover:text-white underline"
            >
              Jamendo
            </a>
          </div>
          <p className="text-[10px] text-neutral-400 leading-relaxed">
            Powered by <strong className="text-neutral-300 font-medium">Jamendo &amp; YouTube Embeds</strong> under Creative Commons and official API terms.
          </p>
        </div>

        {/* Quick Legal Links in Sidebar */}
        <div className="flex items-center justify-between px-2 text-[11px] text-neutral-400">
          <button
            onClick={() => setActiveView('privacy')}
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
          >
            Privacy
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveView('terms')}
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
          >
            Terms
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveView('business')}
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
          >
            Contact
          </button>
        </div>
      </div>
    </aside>
  );
};
