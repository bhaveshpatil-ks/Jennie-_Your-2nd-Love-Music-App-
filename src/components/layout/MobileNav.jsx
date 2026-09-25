import React from 'react';
import { Home, Search, Library, Heart } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';

export const MobileNav = () => {
  const activeView = useLibraryStore((state) => state.activeView);
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const likedTrackIds = useLibraryStore((state) => state.likedTrackIds);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'favorites', label: 'Liked', icon: Heart, badge: likedTrackIds.length },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[58px] bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-white/[0.08] px-3 flex items-center justify-around shadow-2xl"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveView(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-xl transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isActive ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} aria-hidden="true" />
              {item.badge > 0 && item.id === 'favorites' && (
                <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-white ring-2 ring-[#0A0A0A]" aria-hidden="true" />
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
