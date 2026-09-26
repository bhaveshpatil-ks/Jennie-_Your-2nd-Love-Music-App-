import { MOCK_TRACKS } from '../data/mockTracks';

// Cloak backend origins behind relative '/api' reverse-proxy on dev & platforms with proxy support (Vercel/Netlify),
// and auto-fallback to live Railway backend when hosted on static services like GitHub Pages (*.github.io).
const isStaticGitHubPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (isStaticGitHubPages ? 'https://jennie-your-2nd-love-music-app-production.up.railway.app/api' : '/api')
).replace(/\/+$/, '');

/**
 * Safe fetch helper with automatic fallback to mock data and security headers
 */
async function fetchWithFallback(endpoint, fallbackData, options = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Jennie-Client': 'web-app',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    // Only log in development mode; never leak endpoint errors or paths in production console
    if (import.meta.env.DEV) {
      console.warn(`[Jennie API] Fetch failed for ${endpoint}:`, err.message);
    }
    return fallbackData;
  }
}

/**
 * Fetch Home Screen aggregate feed
 */
export async function fetchHomeFeed() {
  const fallback = {
    featured: MOCK_TRACKS.find((t) => t.featured) || MOCK_TRACKS[0],
    trending: MOCK_TRACKS.slice(0, 8),
    lofi: MOCK_TRACKS.filter((t) => t.genre === 'Lo-Fi'),
    synthwave: MOCK_TRACKS.filter((t) => t.genre === 'Synthwave'),
    ambient: MOCK_TRACKS.filter((t) => t.genre === 'Ambient'),
    house: MOCK_TRACKS.filter((t) => t.genre === 'Deep House'),
    acoustic: MOCK_TRACKS.filter((t) => t.genre === 'Acoustic' || t.genre === 'Classical'),
  };

  return fetchWithFallback('/tracks/home-feed', fallback);
}

/**
 * Search tracks with live query, filter & source (all | youtube | audius | jamendo)
 */
export async function searchTracks(query, filter = 'all', source = 'all') {
  if (!query || typeof query !== 'string') return [];
  const cleanQuery = query.trim().slice(0, 100);
  if (!cleanQuery) return [];

  const safeFilter = ['all', 'songs', 'artists', 'genres'].includes(filter) ? filter : 'all';
  const safeSource = ['all', 'youtube', 'audius', 'jamendo'].includes(source) ? source : 'all';

  const fallbackResults = MOCK_TRACKS.filter((t) => {
    const q = cleanQuery.toLowerCase();
    const matchTitle = t.title.toLowerCase().includes(q);
    const matchArtist = t.artist.toLowerCase().includes(q);
    const matchGenre = t.genre.toLowerCase().includes(q);
    if (safeFilter === 'artists') return matchArtist;
    if (safeFilter === 'genres') return matchGenre;
    return matchTitle || matchArtist || matchGenre;
  });

  return fetchWithFallback(
    `/tracks/search?q=${encodeURIComponent(cleanQuery)}&filter=${encodeURIComponent(safeFilter)}&source=${encodeURIComponent(safeSource)}`,
    fallbackResults
  );
}

/**
 * Fetch tracks for a specific genre / mood tag
 */
export async function fetchGenreTracks(genre) {
  const fallback = MOCK_TRACKS.filter(
    (t) => t.genre.toLowerCase() === genre.toLowerCase() || t.genre.toLowerCase().includes(genre.toLowerCase())
  );

  return fetchWithFallback(`/tracks/genre/${encodeURIComponent(genre)}`, fallback.length ? fallback : MOCK_TRACKS.slice(0, 6));
}

/**
 * Fetch trending tracks list
 */
export async function fetchTrendingTracks(limit = 20) {
  return fetchWithFallback(`/tracks/trending?limit=${limit}`, MOCK_TRACKS);
}

// ----------------- MongoDB Playlists API -----------------

export async function fetchPlaylistsApi() {
  return fetchWithFallback('/playlists', null);
}

export async function createPlaylistApi(playlist) {
  return fetchWithFallback('/playlists', playlist, {
    method: 'POST',
    body: JSON.stringify(playlist),
  });
}

export async function updatePlaylistApi(playlistId, updates) {
  return fetchWithFallback(`/playlists/${playlistId}`, null, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deletePlaylistApi(playlistId) {
  return fetchWithFallback(`/playlists/${playlistId}`, null, {
    method: 'DELETE',
  });
}

// ----------------- MongoDB Favorites API -----------------

export async function fetchFavoritesApi() {
  return fetchWithFallback('/favorites', []);
}

export async function toggleFavoriteApi(track) {
  return fetchWithFallback('/favorites/toggle', null, {
    method: 'POST',
    body: JSON.stringify({ track }),
  });
}

// ----------------- Recommendations & Catalog Growth API -----------------

export async function fetchTrackRecommendations(trackId) {
  return fetchWithFallback(`/tracks/${encodeURIComponent(trackId)}/recommendations`, null);
}

export async function logMissedQueryApi(query) {
  if (!query || typeof query !== 'string') return;
  return fetchWithFallback('/catalog/missed-query', null, {
    method: 'POST',
    body: JSON.stringify({ query: query.trim() }),
  });
}

export async function fetchCatalogStatusApi() {
  return fetchWithFallback('/catalog/status', null);
}

