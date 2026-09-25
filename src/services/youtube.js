import axios from 'axios';
import https from 'https';
import dns from 'dns';
import NodeCache from 'node-cache';
import yts from 'yt-search';
import { generateWaveform } from '../utils/waveform.js';
import { cleanTitle } from '../utils/cleaners.js';

// Fix DNS on systems where OS lookup fails
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Cache search queries for 10 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Resilient HTTPS Agent for cross-platform DNS resolution
function customLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      // Fallback to default lookup if resolve4 fails
      return dns.lookup(hostname, options, callback);
    }
    if (options && options.all) {
      return callback(null, addresses.map((a) => ({ address: a, family: 4 })));
    }
    callback(null, addresses[0], 4);
  });
}

const httpsAgent = new https.Agent({
  lookup: customLookup,
  keepAlive: true,
  timeout: 10000,
});

const youtubeHttp = axios.create({
  httpsAgent,
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  },
});

/**
 * Helper to parse duration string like "3:45" or "1:02:15" to seconds
 */
function parseDurationToSeconds(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return 180;
  const parts = durationStr.split(':').map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 180;
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 180;
}

/**
 * Direct YouTube Search Scraper
 */
async function directYouTubeSearch(query, limit = 20) {
  try {
    // Search prioritizing official audio/music release
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' official audio')}&sp=EgIQAQ%253D%253D`;
    const res = await youtubeHttp.get(searchUrl);
    const html = res.data || '';

    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    if (!match) return [];

    const json = JSON.parse(match[1]);
    const contents =
      json.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

    const candidates = [];
    for (const item of contents) {
      const v = item.videoRenderer;
      if (!v || !v.videoId) continue;

      const rawTitle = v.title?.runs?.[0]?.text || '';
      const durationText = v.lengthText?.simpleText || '3:30';
      const duration = parseDurationToSeconds(durationText);

      // Skip long podcasts/streams > 20 mins or ultra short snippets < 30s
      if (duration > 1200 || duration < 30) continue;

      const rawArtist = v.ownerText?.runs?.[0]?.text || 'YouTube Artist';
      let title = cleanTitle(rawTitle);
      let artist = rawArtist.replace(/ - Topic$/i, '').trim();

      if (rawTitle.includes(' - ') && !title.includes(' - ')) {
        // already cleaned
      } else if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        if (parts.length >= 2) {
          artist = cleanTitle(parts[0]);
          title = cleanTitle(parts.slice(1).join(' - '));
        }
      }

      const thumbnails = v.thumbnail?.thumbnails || [];
      const coverUrl =
        thumbnails[thumbnails.length - 1]?.url ||
        `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

      // Studio quality prioritization
      const isTopic = rawArtist.includes('- Topic') || rawArtist.endsWith('- Topic');
      const isOfficial = /official\s+(audio|video|music\s+video|track)/i.test(rawTitle);
      const isLowQuality = /\b(live|concert|reaction|cover|slowed|reverb|parody|karaoke)\b/i.test(rawTitle) && !/\b(live|concert|reaction|cover)\b/i.test(query);

      let qualityScore = 0;
      if (isTopic) qualityScore += 10;
      if (isOfficial) qualityScore += 6;
      if (isLowQuality) qualityScore -= 20;

      candidates.push({
        track: {
          id: `yt-${v.videoId}`,
          youtubeId: v.videoId,
          title: title || rawTitle,
          artist: artist || 'YouTube Artist',
          album: isTopic ? `${artist} (Official Studio Master)` : (rawArtist || 'YouTube Music'),
          duration: duration > 0 ? duration : 180,
          audioUrl: '',
          coverUrl,
          genre: 'Pop / Global',
          mood: isTopic ? 'Studio Master' : 'Official Release',
          license: 'YouTube Official Embed',
          source: 'youtube',
          views: v.viewCountText?.simpleText || 'Popular',
          timestamp: durationText,
          waveform: generateWaveform(48, 0.45),
        },
        qualityScore,
      });
    }

    // Sort by audio quality score descending so official studio masters appear first
    candidates.sort((a, b) => b.qualityScore - a.qualityScore);

    return candidates.slice(0, limit).map((c) => c.track);
  } catch (err) {
    console.warn(`Direct YouTube search failed for "${query}":`, err.message);
    return [];
  }
}

/**
 * Fallback to yt-search package
 */
async function fallbackYtsSearch(query, limit = 20) {
  try {
    const searchResults = await yts({
      query: `${query} official audio`,
      category: 'music',
      pages: 1,
    });

    const videos = searchResults?.videos || [];
    const candidates = videos
      .filter((v) => v.seconds && v.seconds < 1200 && v.seconds > 30)
      .map((video) => {
        const duration = Math.round(Number(video.seconds || 180));
        const rawTitle = video.title || 'Untitled Track';
        let title = cleanTitle(rawTitle);
        const rawArtist = video.author?.name || 'YouTube Artist';
        let artist = rawArtist.replace(/ - Topic$/i, '').trim();

        if (rawTitle.includes(' - ') && !title.includes(' - ')) {
          // Already cleaned
        } else if (rawTitle.includes(' - ')) {
          const parts = rawTitle.split(' - ');
          if (parts.length >= 2) {
            artist = cleanTitle(parts[0]);
            title = cleanTitle(parts.slice(1).join(' - '));
          }
        }

        const coverUrl =
          video.image || video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;

        const isTopic = rawArtist.includes('- Topic') || rawArtist.endsWith('- Topic');
        const isOfficial = /official\s+(audio|video|music\s+video|track)/i.test(rawTitle);
        const isLowQuality = /\b(live|concert|reaction|cover|slowed|reverb|parody|karaoke)\b/i.test(rawTitle) && !/\b(live|concert|reaction|cover)\b/i.test(query);

        let qualityScore = 0;
        if (isTopic) qualityScore += 10;
        if (isOfficial) qualityScore += 6;
        if (isLowQuality) qualityScore -= 20;

        return {
          track: {
            id: `yt-${video.videoId}`,
            youtubeId: video.videoId,
            title: title || rawTitle,
            artist: artist || 'YouTube Artist',
            album: isTopic ? `${artist} (Official Studio Master)` : (video.author?.name || 'YouTube Music'),
            duration: duration > 0 ? duration : 180,
            audioUrl: '',
            coverUrl,
            genre: 'Pop / Global',
            mood: isTopic ? 'Studio Master' : 'Official Release',
            license: 'YouTube Official Embed',
            source: 'youtube',
            views: video.views || 0,
            timestamp: video.timestamp || '3:30',
            waveform: generateWaveform(48, 0.45),
          },
          qualityScore,
        };
      })
      .filter(Boolean);

    candidates.sort((a, b) => b.qualityScore - a.qualityScore);
    return candidates.slice(0, limit).map((c) => c.track);
  } catch (err) {
    console.warn(`yt-search fallback failed for "${query}":`, err.message);
    return [];
  }
}

/**
 * Search YouTube for songs, artists, soundtracks
 */
export async function searchYouTubeSongs(query, limit = 20) {
  if (!query || !query.trim()) return [];

  const cleanQuery = query.trim().toLowerCase();
  const cacheKey = `yt_search_${cleanQuery}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.length > 0) return cached;

  // 1. Try Direct YouTube HTML Parser
  let results = await directYouTubeSearch(cleanQuery, limit);

  // 2. Try yt-search fallback
  if (!results || results.length === 0) {
    results = await fallbackYtsSearch(cleanQuery, limit);
  }

  if (results && results.length > 0) {
    cache.set(cacheKey, results, 600);
    return results;
  }

  return [];
}

/**
 * Get Trending / Top Hits on YouTube
 */
export async function getTrendingYouTubeSongs(limit = 20) {
  const cacheKey = `yt_trending_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.length > 0) return cached;

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

  return [];
}
