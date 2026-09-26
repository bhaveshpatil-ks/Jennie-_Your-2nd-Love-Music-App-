import { create } from 'zustand';
import { MOCK_TRACKS, GENRES, FEATURED_MIXES } from '../data/mockTracks';
import {
  fetchPlaylistsApi,
  createPlaylistApi,
  updatePlaylistApi,
  deletePlaylistApi,
  fetchFavoritesApi,
  toggleFavoriteApi,
} from '../services/api';

// Load initial liked from localStorage
const getInitialLikes = () => {
  try {
    const saved = localStorage.getItem('jennie_liked_tracks') || localStorage.getItem('lora_liked_tracks') || localStorage.getItem('aura_liked_tracks');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return ['track-1', 'track-5', 'track-9', 'track-12', 'track-18'];
};

const getInitialLikedTrackObjects = () => {
  try {
    const saved = localStorage.getItem('jennie_liked_track_objects');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [];
};

const getInitialPlaylists = () => {
  try {
    const saved = localStorage.getItem('jennie_custom_playlists') || localStorage.getItem('lora_custom_playlists');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [
    {
      id: 'pl-coding',
      title: 'Late Night Coding',
      description: 'Zero lyrics, pure flow state synth and ambient waves.',
      coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      trackIds: ['track-8', 'track-5', 'track-6', 'track-14'],
      createdAt: '2024-03-01',
    },
    {
      id: 'pl-morning',
      title: 'Morning Acoustic & Coffee',
      description: 'Peaceful guitar notes and gentle acoustic melodies to start the day.',
      coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
      trackIds: ['track-1', 'track-15', 'track-16', 'track-17'],
      createdAt: '2024-03-02',
    },
  ];
};

export const useLibraryStore = create((set, get) => ({
  // Navigation
  activeView: 'home', // 'home' | 'search' | 'library' | 'favorites' | 'genre' | 'playlist'
  selectedItem: null, // Holds genre object or playlist object when on detail pages
  
  // Search
  searchQuery: '',
  searchFilter: 'all', // 'all' | 'songs' | 'artists' | 'genres'

  // Liked Tracks (IDs and full track objects)
  likedTrackIds: getInitialLikes(),
  likedTracks: getInitialLikedTrackObjects(),

  // User Playlists
  customPlaylists: getInitialPlaylists(),

  // Sync with MongoDB backend on initial startup
  syncWithBackend: async () => {
    try {
      // 1. Fetch playlists from MongoDB
      const remotePlaylists = await fetchPlaylistsApi();
      if (Array.isArray(remotePlaylists) && remotePlaylists.length > 0) {
        set({ customPlaylists: remotePlaylists });
        try {
          localStorage.setItem('jennie_custom_playlists', JSON.stringify(remotePlaylists));
        } catch (e) {}
      }

      // 2. Fetch favorites from MongoDB
      const remoteFavorites = await fetchFavoritesApi();
      if (Array.isArray(remoteFavorites) && remoteFavorites.length > 0) {
        const ids = remoteFavorites.map((f) => String(f.trackId || f.track?.id)).filter(Boolean);
        const fullTracks = remoteFavorites.map((f) => {
          const t = f.track || {};
          const ytId = t.youtubeId || (typeof t.id === 'string' && t.id.startsWith('yt-') ? t.id.replace('yt-', '') : undefined);
          return { ...t, youtubeId: ytId };
        }).filter((t) => t.id);

        set({ likedTrackIds: ids, likedTracks: fullTracks });
        try {
          localStorage.setItem('jennie_liked_tracks', JSON.stringify(ids));
          localStorage.setItem('jennie_liked_track_objects', JSON.stringify(fullTracks));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Backend sync failed, running in local mode:', err.message);
    }
  },

  // Navigation actions
  setActiveView: (view, selectedItem = null) => {
    set({ activeView: view, selectedItem });
    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setSearchFilter: (filter) => {
    set({ searchFilter: filter });
  },

  // Liked tracks actions
  toggleLike: (trackId, trackObject = null) => {
    const { likedTrackIds, likedTracks } = get();
    const strId = String(trackId);
    const exists = likedTrackIds.includes(strId);
    let updatedIds;
    let updatedTracks;

    if (exists) {
      updatedIds = likedTrackIds.filter((id) => id !== strId);
      updatedTracks = likedTracks.filter((t) => String(t.id) !== strId);
    } else {
      updatedIds = [...likedTrackIds, strId];
      const targetTrack = trackObject || MOCK_TRACKS.find((t) => t.id === strId) || { id: strId, title: 'Saved Track' };
      const ytId = targetTrack.youtubeId || (typeof targetTrack.id === 'string' && targetTrack.id.startsWith('yt-') ? targetTrack.id.replace('yt-', '') : undefined);
      const enrichedTrack = {
        ...targetTrack,
        youtubeId: ytId,
        source: ytId ? 'youtube' : (targetTrack.source || 'jamendo'),
      };
      updatedTracks = [enrichedTrack, ...likedTracks.filter((t) => String(t.id) !== strId)];
    }

    set({ likedTrackIds: updatedIds, likedTracks: updatedTracks });
    try {
      localStorage.setItem('jennie_liked_tracks', JSON.stringify(updatedIds));
      localStorage.setItem('jennie_liked_track_objects', JSON.stringify(updatedTracks));
    } catch (e) {}

    // Async MongoDB sync
    const target = trackObject || MOCK_TRACKS.find((t) => t.id === strId) || { id: strId };
    toggleFavoriteApi(target).catch(() => {});
  },

  isLiked: (trackId) => {
    return get().likedTrackIds.includes(String(trackId));
  },

  getLikedTracks: () => {
    const { likedTrackIds, likedTracks } = get();
    const map = new Map();
    // 1. Add locally saved full objects with enriched youtubeId
    likedTracks.forEach((t) => {
      if (t && t.id) {
        const ytId = t.youtubeId || (typeof t.id === 'string' && t.id.startsWith('yt-') ? t.id.replace('yt-', '') : undefined);
        map.set(String(t.id), {
          ...t,
          youtubeId: ytId,
          source: ytId ? 'youtube' : (t.source || 'jamendo'),
        });
      }
    });

    // 2. Add fallback mock tracks if not yet populated
    MOCK_TRACKS.forEach((t) => {
      const sId = String(t.id);
      if (likedTrackIds.includes(sId) && !map.has(sId)) {
        map.set(sId, t);
      }
    });

    return Array.from(map.values());
  },

  // Custom playlists
  createPlaylist: (title, description = '') => {
    const newPlaylist = {
      id: `pl-${Date.now()}`,
      title: title || 'New Playlist',
      description: description || 'Personal curated music collection.',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      trackIds: [],
      tracks: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    set((state) => {
      const updated = [newPlaylist, ...state.customPlaylists];
      try {
        localStorage.setItem('jennie_custom_playlists', JSON.stringify(updated));
      } catch (e) {}
      return { customPlaylists: updated };
    });

    // Async MongoDB sync
    createPlaylistApi(newPlaylist).catch(() => {});

    return newPlaylist;
  },

  deletePlaylist: (playlistId) => {
    set((state) => {
      const updated = state.customPlaylists.filter((p) => p.id !== playlistId);
      try {
        localStorage.setItem('jennie_custom_playlists', JSON.stringify(updated));
      } catch (e) {}
      return {
        customPlaylists: updated,
        activeView: state.selectedItem?.id === playlistId ? 'library' : state.activeView,
      };
    });

    // Async MongoDB sync
    deletePlaylistApi(playlistId).catch(() => {});
  },

  addTrackToPlaylist: (playlistId, trackId, trackObject = null) => {
    set((state) => {
      const updated = state.customPlaylists.map((p) => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          const newTrackIds = [...p.trackIds, trackId];
          const newTracks = trackObject ? [...(p.tracks || []), trackObject] : (p.tracks || []);
          return { ...p, trackIds: newTrackIds, tracks: newTracks };
        }
        return p;
      });

      try {
        localStorage.setItem('jennie_custom_playlists', JSON.stringify(updated));
      } catch (e) {}

      const pl = updated.find((p) => p.id === playlistId);
      if (pl) {
        updatePlaylistApi(playlistId, { trackIds: pl.trackIds, tracks: pl.tracks }).catch(() => {});
      }

      return { customPlaylists: updated };
    });
  },

  removeTrackFromPlaylist: (playlistId, trackId) => {
    set((state) => {
      const updated = state.customPlaylists.map((p) => {
        if (p.id === playlistId) {
          const newTrackIds = p.trackIds.filter((id) => id !== trackId);
          const newTracks = (p.tracks || []).filter((t) => t.id !== trackId);
          return { ...p, trackIds: newTrackIds, tracks: newTracks };
        }
        return p;
      });

      try {
        localStorage.setItem('jennie_custom_playlists', JSON.stringify(updated));
      } catch (e) {}

      const pl = updated.find((p) => p.id === playlistId);
      if (pl) {
        updatePlaylistApi(playlistId, { trackIds: pl.trackIds, tracks: pl.tracks }).catch(() => {});
      }

      return { customPlaylists: updated };
    });
  },
}));
