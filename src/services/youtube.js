import yts from 'yt-search';
import NodeCache from 'node-cache';
import { generateWaveform } from '../utils/waveform.js';
import { cleanTitle } from '../utils/cleaners.js';

// Cache search queries for 10 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

/**
 * Normalize yt-search video result to standard Track Schema
 */
export function normalizeYouTubeTrack(video) {
  if (!video || !video.videoId) return null;

  const duration = Math.round(Number(video.seconds || 180));
  const rawTitle = video.title || 'Untitled Track';
  let title = cleanTitle(rawTitle);
  let artist = video.author?.name?.replace(/ - Topic$/i, '') || 'YouTube Artist';

  if (rawTitle.includes(' - ') && !title.includes(' - ')) {
    // Already cleaned
  } else if (rawTitle.includes(' - ')) {
    const parts = rawTitle.split(' - ');
    if (parts.length >= 2) {
      artist = cleanTitle(parts[0]);
      title = cleanTitle(parts.slice(1).join(' - '));
    }
  }

  const coverUrl = video.image || video.thumbnail || 
    `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;

  return {
    id: `yt-${video.videoId}`,
    youtubeId: video.videoId,
    title: title || rawTitle,
    artist: artist || 'YouTube Artist',
    album: video.author?.name || 'YouTube Music',
    duration: duration > 0 ? duration : 180,
    audioUrl: '', // YouTube tracks play via official YouTube IFrame Player
    coverUrl,
    genre: 'Pop / Global',
    mood: 'Official Master',
    license: 'YouTube Official Embed',
    source: 'youtube',
    views: video.views || 0,
    timestamp: video.timestamp || '3:30',
    waveform: generateWaveform(48, 0.45),
  };
}

/**
 * Search YouTube for songs, artists, soundtracks
 */
export async function searchYouTubeSongs(query, limit = 20) {
  if (!query || !query.trim()) return [];

  const cleanQuery = query.trim().toLowerCase();
  const cacheKey = `yt_search_${cleanQuery}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const searchResults = await yts({
      query: `${cleanQuery} song`,
      category: 'music',
      pages: 1,
    });

    const videos = searchResults?.videos || [];
    const normalized = videos
      .filter((v) => v.seconds && v.seconds < 1200)
      .slice(0, limit)
      .map(normalizeYouTubeTrack)
      .filter(Boolean);

    cache.set(cacheKey, normalized, 300);
    return normalized;
  } catch (err) {
    console.error(`YouTube search failed for "${query}":`, err.message);
    return [];
  }
}

/**
 * Get Trending / Top Hits on YouTube
 */
export async function getTrendingYouTubeSongs(limit = 20) {
  const cacheKey = `yt_trending_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const trendingQueries = [
      'Top Hits 2024 Global Pop',
      'Trending Music Billboard',
      'Global Top Songs 2024',
      'Trending Hindi Punjabi Pop Songs',
    ];
    const chosenQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
    const tracks = await searchYouTubeSongs(chosenQuery, limit);

    if (tracks.length > 0) {
      cache.set(cacheKey, tracks, 600);
      return tracks;
    }
  } catch (err) {
    console.error('Failed to fetch YouTube trending:', err.message);
  }

  return [];
}
