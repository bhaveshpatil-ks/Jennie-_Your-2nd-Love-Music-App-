import React from 'react';
import { Home, Search, Library, Heart, User } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useAuthStore } from '../../store/useAuthStore';

export const MobileNav = () => {
  const activeView = useLibraryStore((state) => state.activeView);
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const likedTrackIds = useLibraryStore((state) => state.likedTrackIds);

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const isAuthModalOpen = useAuthStore((state) => state.isAuthModalOpen);
  const modalMode = useAuthStore((state) => state.modalMode);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  const handleAccountClick = () => {
    if (user) {
      setActiveView('settings');
    } else {
      openAuthModal('login');
    }
  };

  const isAccountActive = activeView === 'settings' || (isAuthModalOpen && (modalMode === 'profile' || modalMode === 'login' || modalMode === 'register'));

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      onClick: () => setActiveView('home'),
      isActive: activeView === 'home' && !isAuthModalOpen,
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      onClick: () => setActiveView('search'),
      isActive: activeView === 'search' && !isAuthModalOpen,
    },
    {
      id: 'library',
      label: 'Library',
      icon: Library,
      onClick: () => setActiveView('library'),
      isActive: activeView === 'library' && !isAuthModalOpen,
    },
    {
      id: 'favorites',
      label: 'Liked',
      icon: Heart,
      badge: likedTrackIds.length,
      onClick: () => setActiveView('favorites'),
      isActive: activeView === 'favorites' && !isAuthModalOpen,
    },
    {
      id: 'account',
      label: user ? 'Account' : 'Sign In',
      icon: User,
      onClick: handleAccountClick,
      isActive: isAccountActive,
      customIcon: user ? (
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-zinc-700 via-zinc-800 to-zinc-900 text-white font-bold text-[10px] flex items-center justify-center border border-zinc-600 shadow-sm">
          {(profile?.username || user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
        </div>
      ) : null,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[58px] bg-black/95 backdrop-blur-2xl border-t border-zinc-800/80 px-2 flex items-center justify-around shadow-2xl"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.isActive;
        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
              isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              {item.customIcon ? (
                item.customIcon
              ) : (
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} aria-hidden="true" />
              )}
              {item.badge > 0 && item.id === 'favorites' && (
                <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-zinc-300 ring-2 ring-black" aria-hidden="true" />
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
