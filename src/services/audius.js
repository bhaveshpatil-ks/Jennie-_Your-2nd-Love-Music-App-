import axios from 'axios';
import NodeCache from 'node-cache';
import { generateWaveform } from '../utils/waveform.js';

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const APP_NAME = 'JENNIE_MUSIC_STREAMING';

// List of Audius discovery nodes with fallback
const DISCOVERY_NODES = [
  'https://discoveryprovider.audius.co',
  'https://audius-discovery-1.cultur3stake.com',
  'https://audius-discovery-2.cultur3stake.com',
  'https://discoveryprovider.mumbaistudios.com',
];

let activeNode = DISCOVERY_NODES[0];

const apiClient = axios.create({
  timeout: 8000,
});

/**
 * Format Audius track to Jennie schema
 */
export function normalizeAudiusTrack(track) {
  if (!track || !track.id) return null;

  const artwork = track.artwork;
  const coverUrl = artwork?.['1000x1000'] || artwork?.['480x480'] || artwork?.['150x150'] || 
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

  const streamUrl = `${activeNode}/v1/tracks/${track.id}/stream?app_name=${APP_NAME}`;

  return {
    id: `aud-${track.id}`,
    title: track.title || 'Untitled',
    artist: track.user?.name || 'Unknown Artist',
    album: track.album_name || track.title || 'Single',
    duration: Math.round(Number(track.duration) || 180),
    audioUrl: streamUrl,
    coverUrl,
    genre: track.genre || 'Electronic',
    mood: track.mood || 'Groovy',
    license: 'Audius Free Stream',
    source: 'audius',
    waveform: generateWaveform(48, 0.4),
  };
}

/**
 * Search Audius for any track, artist, remix or song
 */
export async function searchAudiusTracks(query, limit = 20) {
  if (!query.trim()) return [];

  const cacheKey = `aud_search_${query.trim().toLowerCase()}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  for (const node of DISCOVERY_NODES) {
    try {
      const response = await apiClient.get(`${node}/v1/tracks/search`, {
        params: {
          query: query.trim(),
          app_name: APP_NAME,
          limit,
        },
      });

      const results = response.data?.data || [];
      activeNode = node; // update active healthy node
      const normalized = results.map(normalizeAudiusTrack).filter(Boolean);

      cache.set(cacheKey, normalized, 300);
      return normalized;
    } catch (err) {
      console.warn(`Node ${node} failed for Audius search, trying next...`);
    }
  }

  return [];
}

/**
 * Get Trending tracks from Audius
 */
export async function getTrendingAudiusTracks(limit = 20) {
  const cacheKey = `aud_trending_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  for (const node of DISCOVERY_NODES) {
    try {
      const response = await apiClient.get(`${node}/v1/tracks/trending`, {
        params: {
          app_name: APP_NAME,
          limit,
        },
      });

      const results = response.data?.data || [];
      activeNode = node;
      const normalized = results.map(normalizeAudiusTrack).filter(Boolean);

      cache.set(cacheKey, normalized, 600);
      return normalized;
    } catch (err) {
      console.warn(`Node ${node} failed for Audius trending, trying next...`);
    }
  }

  return [];
}
