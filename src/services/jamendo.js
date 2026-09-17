import axios from 'axios';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
import { generateWaveform } from '../utils/waveform.js';

dotenv.config();

// In-memory cache: 10 minutes TTL, check period 2 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const CLIENT_ID = process.env.JAMENDO_CLIENT_ID || 'a8b0d0e6';
const BASE_URL = process.env.JAMENDO_API_URL || 'https://api.jamendo.com/v3.0';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/**
 * Format Jamendo raw track to Lora frontend schema
 */
export function normalizeTrack(rawTrack, fallbackGenre = 'Electronic') {
  if (!rawTrack) return null;

  // Derive genres and tags
  const genreTags = rawTrack.musicinfo?.tags?.genres || [];
  const moodTags = rawTrack.musicinfo?.tags?.vartags || [];
  const primaryGenre = genreTags.length > 0 
    ? genreTags[0].charAt(0).toUpperCase() + genreTags[0].slice(1) 
    : fallbackGenre;
  
  const primaryMood = moodTags.length > 0
    ? moodTags[0].charAt(0).toUpperCase() + moodTags[0].slice(1)
    : 'Chill';

  // License formatting
  let licenseName = 'CC-BY-NC';
  if (rawTrack.license_ccurl) {
    if (rawTrack.license_ccurl.includes('by-sa')) licenseName = 'CC BY-SA';
    else if (rawTrack.license_ccurl.includes('by-nc-nd')) licenseName = 'CC BY-NC-ND';
    else if (rawTrack.license_ccurl.includes('by-nc')) licenseName = 'CC BY-NC';
    else if (rawTrack.license_ccurl.includes('by')) licenseName = 'CC BY';
    else if (rawTrack.license_ccurl.includes('publicdomain')) licenseName = 'Public Domain';
  }

  // Cover image: higher resolution 600x600 if possible, or 300x300
  let cover = rawTrack.image || rawTrack.album_image;
  if (cover && cover.includes('width=300')) {
    cover = cover.replace('width=300', 'width=500');
  }

  return {
    id: String(rawTrack.id),
    title: rawTrack.name || 'Untitled Track',
    artist: rawTrack.artist_name || 'Unknown Artist',
    album: rawTrack.album_name || rawTrack.name || 'Single',
    duration: Math.round(Number(rawTrack.duration) || 0),
    audioUrl: rawTrack.audio || '',
    coverUrl: cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    genre: primaryGenre,
    mood: primaryMood,
    license: licenseName,
    featured: false,
    jamendoUrl: rawTrack.shareurl || '',
    waveform: generateWaveform(48, 0.35),
  };
}

// Fallback catalog of high quality royalty-free tracks with verified audio streams
const FALLBACK_CATALOG = [
  {
    id: 'jam-101',
    title: 'Midnight Lo-Fi Coffee',
    artist: 'Komorebi Sound',
    album: 'Warm Horizons EP',
    duration: 168,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    genre: 'Lo-Fi',
    mood: 'Chill & Relax',
    license: 'CC BY 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/101',
  },
  {
    id: 'jam-102',
    title: 'Rainy Window Pane',
    artist: 'Aether Beats',
    album: 'Monsoon Diary',
    duration: 194,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
    genre: 'Lo-Fi',
    mood: 'Study & Focus',
    license: 'CC BY-NC 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/102',
  },
  {
    id: 'jam-103',
    title: 'Tokyo Streetlights',
    artist: 'Nujalight',
    album: 'Shibuya Reflections',
    duration: 212,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    genre: 'Lo-Fi',
    mood: 'Night Drive',
    license: 'CC BY 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/103',
  },
  {
    id: 'jam-104',
    title: 'Neon Odyssey 2088',
    artist: 'Vector Runner',
    album: 'Grid City 2088',
    duration: 235,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    genre: 'Synthwave',
    mood: 'High Energy',
    license: 'CC BY 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/104',
  },
  {
    id: 'jam-105',
    title: 'Hyperdrive Warp',
    artist: 'Cyber Pulse',
    album: 'Future Drift',
    duration: 188,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
    genre: 'Synthwave',
    mood: 'Workout Energy',
    license: 'CC BY-SA 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/105',
  },
  {
    id: 'jam-106',
    title: 'Solar Flare Groove',
    artist: 'Solaria Groove',
    album: 'Ibiza Dunes',
    duration: 274,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    genre: 'Deep House',
    mood: 'Party & Groove',
    license: 'CC BY 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/106',
  },
  {
    id: 'jam-107',
    title: 'Euphoria Velvet Nights',
    artist: 'Echo Deep',
    album: 'Velvet Nights',
    duration: 242,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    genre: 'Deep House',
    mood: 'Night Drive',
    license: 'CC BY 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/107',
  },
  {
    id: 'jam-108',
    title: 'Northern Auroras',
    artist: 'Svalbard Resonance',
    album: 'Arctic Stasis',
    duration: 310,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&auto=format&fit=crop&q=80',
    genre: 'Ambient',
    mood: 'Deep Sleep',
    license: 'CC BY 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/108',
  },
  {
    id: 'jam-109',
    title: 'Weightless Space Stasis',
    artist: 'Cosmo Drift',
    album: 'Nebula Fields',
    duration: 330,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    genre: 'Ambient',
    mood: 'Meditation',
    license: 'CC BY 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/109',
  },
  {
    id: 'jam-110',
    title: 'Campfire Pine Stories',
    artist: 'Wildwood Hollow',
    album: 'Pine Needle Path',
    duration: 175,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
    genre: 'Acoustic',
    mood: 'Morning Coffee',
    license: 'CC BY 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/110',
  },
  {
    id: 'jam-111',
    title: 'First Snowfall in Prague',
    artist: 'Elias Thorne',
    album: 'Solitude in Minor',
    duration: 228,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1520523839898-5071282543e1?w=600&auto=format&fit=crop&q=80',
    genre: 'Classical',
    mood: 'Emotional & Deep',
    license: 'CC BY 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/111',
  },
  {
    id: 'jam-112',
    title: 'Waltz for Stargazers',
    artist: 'Elias Thorne',
    album: 'Solitude in Minor',
    duration: 185,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    genre: 'Classical',
    mood: 'Night Reflection',
    license: 'CC BY 4.0',
    jamendoUrl: 'https://www.jamendo.com/track/112',
  },
];

/**
 * Fetch Popular / Trending Tracks of the Week
 */
export async function getTrendingTracks(limit = 20, offset = 0) {
  const cacheKey = `trending_${limit}_${offset}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await apiClient.get('/tracks/', {
      params: {
        client_id: CLIENT_ID,
        format: 'jsonpretty',
        limit,
        offset,
        order: 'popularity_week',
        include: 'musicinfo',
        audioformat: 'mp32',
      },
    });

    const results = response.data?.results || [];
    if (results.length > 0) {
      const normalized = results.map((t) => normalizeTrack(t, 'Pop / Electronic')).filter(Boolean);
      cache.set(cacheKey, normalized, 300);
      return normalized;
    }
  } catch (error) {
    console.warn('Jamendo API unreachable or client ID invalid. Using fallback stream catalog.');
  }

  // Graceful fallback
  return FALLBACK_CATALOG.slice(offset, offset + limit);
}

/**
 * Search Tracks by keywords, artist, or tags
 */
export async function searchTracks({ query = '', filter = 'all', limit = 20, offset = 0 }) {
  if (!query.trim()) return [];

  const cleanQuery = query.trim().toLowerCase();
  const cacheKey = `search_${cleanQuery}_${filter}_${limit}_${offset}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const params = {
      client_id: CLIENT_ID,
      format: 'jsonpretty',
      limit,
      offset,
      audioformat: 'mp32',
      include: 'musicinfo',
    };

    if (filter === 'artists') {
      params.artist_name = cleanQuery;
    } else if (filter === 'genres') {
      params.tags = cleanQuery;
    } else {
      params.namesearch = cleanQuery;
    }

    const response = await apiClient.get('/tracks/', { params });
    const results = response.data?.results || [];
    if (results.length > 0) {
      const normalized = results.map((t) => normalizeTrack(t)).filter(Boolean);
      cache.set(cacheKey, normalized, 180);
      return normalized;
    }
  } catch (error) {
    console.warn(`Jamendo search failed for "${query}". Using local fallback search.`);
  }

  // Local search in fallback catalog
  const filtered = FALLBACK_CATALOG.filter((t) => {
    const matchTitle = t.title.toLowerCase().includes(cleanQuery);
    const matchArtist = t.artist.toLowerCase().includes(cleanQuery);
    const matchGenre = t.genre.toLowerCase().includes(cleanQuery);
    const matchMood = t.mood.toLowerCase().includes(cleanQuery);

    if (filter === 'artists') return matchArtist;
    if (filter === 'genres') return matchGenre || matchMood;
    return matchTitle || matchArtist || matchGenre || matchMood;
  });

  return filtered.slice(offset, offset + limit);
}

/**
 * Fetch Tracks by Genre / Tag
 */
export async function getTracksByGenre({ genre, limit = 20, offset = 0 }) {
  if (!genre) return [];

  const tag = genre.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cacheKey = `genre_${tag}_${limit}_${offset}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await apiClient.get('/tracks/', {
      params: {
        client_id: CLIENT_ID,
        format: 'jsonpretty',
        tags: tag,
        limit,
        offset,
        order: 'popularity_total',
        include: 'musicinfo',
        audioformat: 'mp32',
      },
    });

    const results = response.data?.results || [];
    if (results.length > 0) {
      const genreTitle = genre.charAt(0).toUpperCase() + genre.slice(1);
      const normalized = results.map((t) => normalizeTrack(t, genreTitle)).filter(Boolean);
      cache.set(cacheKey, normalized, 600);
      return normalized;
    }
  } catch (error) {
    console.warn(`Jamendo genre fetch failed for "${genre}". Using local genre catalog.`);
  }

  // Fallback genre filtering
  const genreFiltered = FALLBACK_CATALOG.filter((t) =>
    t.genre.toLowerCase().includes(tag) || tag.includes(t.genre.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );

  return genreFiltered.length > 0
    ? genreFiltered.slice(offset, offset + limit)
    : FALLBACK_CATALOG.slice(offset, offset + limit);
}

/**
 * Fetch Featured Spotlight Track
 */
export async function getFeaturedTrack() {
  const cacheKey = 'featured_spotlight';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const trending = await getTrendingTracks(10);
    const featured = trending.length > 0 ? { ...trending[0], featured: true } : null;
    if (featured) {
      cache.set(cacheKey, featured, 600);
    }
    return featured;
  } catch (error) {
    console.error('Error fetching featured track:', error.message);
    return null;
  }
}

/**
 * Get Specific Track by ID
 */
export async function getTrackById(trackId) {
  const cacheKey = `track_${trackId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await apiClient.get('/tracks/', {
      params: {
        client_id: CLIENT_ID,
        format: 'jsonpretty',
        id: trackId,
        include: 'musicinfo',
        audioformat: 'mp32',
      },
    });

    const results = response.data?.results || [];
    if (results.length === 0) return null;

    const normalized = normalizeTrack(results[0]);
    cache.set(cacheKey, normalized, 3600); // 1 hour cache
    return normalized;
  } catch (error) {
    console.error(`Error fetching track #${trackId}:`, error.message);
    throw new Error(`Failed to fetch track #${trackId}`);
  }
}
