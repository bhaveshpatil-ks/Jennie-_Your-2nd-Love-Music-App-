import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { Sidebar, TopHeader, MobileNav, Footer } from './index';
import { PlayerBar, QueueDrawer, FullscreenPlayer, YouTubePlayerEmbed } from '../player';
import { CreatePlaylistModal, CookieConsentBanner, OfflineAlert } from '../common';
import { AuthModal } from '../auth/AuthModal';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useAuthStore } from '../../store/useAuthStore';

// Pages
import {
  Home,
  Search,
  Library,
  Favorites,
  PlaylistDetail,
  PrivacyPolicy,
  TermsAndConditions,
  CookiePolicy,
  RefundPolicy,
  BusinessDetails,
  Settings,
  NotFound,
} from '../../pages';

export const AppLayout = () => {
  const activeView = useLibraryStore((state) => state.activeView);
  const selectedItem = useLibraryStore((state) => state.selectedItem);
  const syncWithBackend = useLibraryStore((state) => state.syncWithBackend);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);

  const mainRef = useRef(null);
  const contentRef = useRef(null);
  const lenisRef = useRef(null);

  // Initialize Firebase Auth listener
  const initAuth = useAuthStore((state) => state.initAuth);
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [initAuth]);

  // Sync library with MongoDB backend
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Initialize Lenis smooth scrolling with minimal luxury physics
  useEffect(() => {
    if (!mainRef.current) return;

    const lenis = new Lenis({
      wrapper: mainRef.current,
      content: contentRef.current,
      duration: 1.35, // Deliberate luxury momentum
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Silky exponential deceleration
      smoothWheel: true,
      wheelMultiplier: 0.88, // Soft, measured scroll rate
      touchMultiplier: 1.0,
      gestureOrientation: 'vertical',
      normalizeWheel: true,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
      window.__lenis = null;
    };
  }, []);

  // Silk glide to top on view change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: false, duration: 0.5 });
    } else if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeView, selectedItem]);

  const setActiveView = useLibraryStore((state) => state.setActiveView);

  // Sync browser URL with activeView on popstate and initial render
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      if (path === '/' || path === '') setActiveView('home');
      else if (path === '/search') setActiveView('search');
      else if (path === '/library') setActiveView('library');
      else if (path === '/favorites') setActiveView('favorites');
      else if (path === '/privacy-policy') setActiveView('privacy');
      else if (path === '/terms-and-conditions') setActiveView('terms');
      else if (path === '/cookie-policy') setActiveView('cookies');
      else if (path === '/refund-policy') setActiveView('refund');
      else if (path === '/business-details') setActiveView('business');
      else if (path === '/settings' || path === '/account') setActiveView('settings');
      else if (path === '/404') setActiveView('404');
      else setActiveView('404');
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [setActiveView]);

  // Keep browser URL updated when activeView changes
  useEffect(() => {
    const pathToView = {
      home: '/',
      search: '/search',
      library: '/library',
      favorites: '/favorites',
      privacy: '/privacy-policy',
      terms: '/terms-and-conditions',
      cookies: '/cookie-policy',
      refund: '/refund-policy',
      business: '/business-details',
      settings: '/settings',
      404: '/404',
    };
    const targetPath = pathToView[activeView];
    if (targetPath && window.location.pathname !== targetPath && activeView !== 'genre' && activeView !== 'playlist') {
      window.history.pushState(null, '', targetPath);
    }
  }, [activeView]);

  // Render current view
  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Home />;
      case 'search':
        return <Search />;
      case 'library':
        return <Library onOpenCreatePlaylist={() => setIsCreateModalOpen(true)} />;
      case 'favorites':
        return <Favorites />;
      case 'genre':
        return <PlaylistDetail playlist={selectedItem} isGenre={true} />;
      case 'playlist':
        return <PlaylistDetail playlist={selectedItem} isGenre={false} />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsAndConditions />;
      case 'cookies':
        return <CookiePolicy onOpenCookieSettings={() => setIsCookieSettingsOpen(true)} />;
      case 'refund':
        return <RefundPolicy />;
      case 'business':
        return <BusinessDetails />;
      case 'settings':
        return <Settings onOpenCookieSettings={() => setIsCookieSettingsOpen(true)} />;
      case '404':
      case 'notfound':
        return <NotFound />;
      default:
        return <NotFound />;
    }
  };

  return (
    <div className="flex h-screen bg-[#080808] text-white overflow-hidden selection:bg-neutral-700 selection:text-white relative">
      {/* Real-time Offline Device Alert */}
      <OfflineAlert />
      {/* Keyboard Accessibility: Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:font-bold focus:rounded-full focus:shadow-2xl focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar (hidden on mobile < 768px) */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar onOpenCreatePlaylist={() => setIsCreateModalOpen(true)} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow min-w-0 h-screen overflow-hidden">
        {/* Sticky Top Header */}
        <TopHeader />

        {/* Scrollable View Content with Lenis Smooth Scroll */}
        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className="flex-grow overflow-y-auto px-3.5 sm:px-6 md:px-8 py-4 sm:py-6 pb-36 md:pb-28 transition-all focus:outline-none"
        >
          <div ref={contentRef} className="max-w-7xl mx-auto">
            <div key={`${activeView}-${selectedItem?.id || ''}`} className="animate-luxury-fade">
              {renderView()}
            </div>
            {/* Accessible Compliance & Legal Footer */}
            <Footer onOpenCookieSettings={() => setIsCookieSettingsOpen(true)} />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Persistent Frosted Player Bar */}
      <PlayerBar />

      {/* Slide-out Queue Panel */}
      <QueueDrawer />

      {/* Immersive Fullscreen Now Playing Modal */}
      <FullscreenPlayer />

      {/* Official YouTube IFrame Player Host */}
      <YouTubePlayerEmbed />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Cookie Consent Banner & Granular Preferences Modal */}
      <CookieConsentBanner
        isOpenManual={isCookieSettingsOpen}
        onCloseManual={() => setIsCookieSettingsOpen(false)}
      />

      {/* Luxury Authentication Modal */}
      <AuthModal />
    </div>
  );
};
