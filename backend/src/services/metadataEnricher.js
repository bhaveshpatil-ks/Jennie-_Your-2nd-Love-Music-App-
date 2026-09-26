import axios from 'axios';
import { TrackCatalog } from '../models/TrackCatalog.js';
import { isDbConnected } from '../config/db.js';
import { consumeQuota, isCircuitBreakerTripped } from './quotaManager.js';
import { cleanTitle } from '../utils/cleaners.js';

// Curated official music playlist IDs for cheap 1-unit related song discovery
const CURATED_OFFICIAL_PLAYLISTS = [
  { id: 'PLFgquLnL59alGJcdc0BEZJb2U7Igk-0VU', genre: 'Pop / Global' }, // Global Pop Hits
  { id: 'PLDIoUOhQQPlXr63I_vwF9GD8sAKh77dWU', genre: 'Lo-Fi' },        // Lo-Fi Beats
  { id: 'PLyQj_i4gRjZ6L_hWc5wV8L9Y1p7V9g2wz', genre: 'Synthwave' },   // Synthwave / Cyberpunk
  { id: 'PLw-VjHDlEOgs658kAHR_LAa429-nWJ4PC', genre: 'Bollywood Romantic' }, // Bollywood Hits
  { id: 'PL4fGSIF837XkV5Z7W9X7Z5r3x6P0qX9K3', genre: 'Punjabi Hip-Hop' },    // Punjabi Anthems
];

/**
 * Parses ISO 8601 duration (PT3M45S) to integer seconds
 */
function parseISO8601Duration(isoString) {
  if (!isoString) return 180;
  const match = isoString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 180;
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Enrich existing catalog songs in batches of 50 using videos.list (1 unit per 50 songs)
 */
export async function enrichCatalogWithVideosList(batchLimit = 20) {
  if (isCircuitBreakerTripped()) return { success: false, reason: 'circuit_breaker_active' };

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    console.log('ℹ️ [Layer 2] Skipping videos.list: YOUTUBE_API_KEY not set.');
    return { success: true, enrichedCount: 0 };
  }

  try {
    // Find up to 50 tracks in DB that haven't been enriched recently
    if (!isDbConnected()) return { success: false, reason: 'no_db' };

    const tracksToEnrich = await TrackCatalog.find({
      $or: [{ lastEnrichedAt: null }, { lastEnrichedAt: { $lt: new Date(Date.now() - 7 * 86400000) } }],
    })
      .limit(50)
      .lean();

    if (!tracksToEnrich || tracksToEnrich.length === 0) {
      return { success: true, enrichedCount: 0 };
    }

    const videoIds = tracksToEnrich.map((t) => t.videoId).join(',');

    // Consume 1 unit for videos.list (batches 50 items for 1 unit!)
    await consumeQuota('videos.list', 2, 1);

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
    const resp = await axios.get(url, { timeout: 8000 });
    const items = resp.data.items || [];

    for (const item of items) {
      const vId = item.id;
      const views = parseInt(item.statistics?.viewCount || '0', 10);
      const likes = parseInt(item.statistics?.likeCount || '0', 10);
      const duration = parseISO8601Duration(item.contentDetails?.duration);
      
      // Calculate popularity/quality score from real engagement signals
      let qualityScore = 70;
      if (views > 10000000) qualityScore = 95;
      else if (views > 1000000) qualityScore = 88;
      else if (views > 100000) qualityScore = 80;

      await TrackCatalog.updateOne(
        { videoId: vId },
        {
          $set: {
            views,
            likes,
            duration,
            qualityScore,
            lastEnrichedAt: new Date(),
          },
        }
      );
    }

    console.log(`✨ [Layer 2] Enriched ${items.length} tracks using videos.list (Cost: 1 unit).`);
    return { success: true, enrichedCount: items.length, unitsUsed: 1 };
  } catch (err) {
    console.warn('[Layer 2] videos.list enrichment error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Harvest tracks from known official music playlists using playlistItems.list (1 unit per 50 songs)
 * Cheap alternative to search.list for finding related tracks
 */
export async function harvestFromPlaylists(maxPlaylists = 5) {
  if (isCircuitBreakerTripped()) return { success: false, reason: 'circuit_breaker_active' };

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    return { success: true, harvestedCount: 0 };
  }

  let totalHarvested = 0;
  let callsMade = 0;

  for (const pl of CURATED_OFFICIAL_PLAYLISTS.slice(0, maxPlaylists)) {
    if (isCircuitBreakerTripped()) break;

    try {
      // 1 unit for playlistItems.list
      await consumeQuota('playlistItems.list', 2, 1);
      callsMade += 1;

      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${pl.id}&key=${apiKey}`;
      const resp = await axios.get(url, { timeout: 8000 });
      const items = resp.data.items || [];

      for (const item of items) {
        const videoId = item.snippet?.resourceId?.videoId;
        if (!videoId) continue;

        const rawTitle = item.snippet?.title || '';
        if (rawTitle === 'Private video' || rawTitle === 'Deleted video') continue;

        const title = cleanTitle(rawTitle);
        const artist = item.snippet?.videoOwnerChannelTitle?.replace(/ - Topic$/i, '') || 'Artist';

        const record = {
          videoId,
          title,
          artist,
          album: `${artist} (Playlist Master)`,
          duration: 210,
          genreTags: [pl.genre],
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
          publishDate: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : null,
          discoveredVia: 'playlistItems.list',
          qualityScore: 85,
          source: 'youtube',
          lastEnrichedAt: new Date(),
        };

        if (isDbConnected()) {
          await TrackCatalog.findOneAndUpdate(
            { videoId },
            { $set: record },
            { upsert: true }
          );
        }
        totalHarvested += 1;
      }
    } catch (err) {
      console.warn(`[Layer 2] Playlist harvest failed for ${pl.id}:`, err.message);
    }
  }

  console.log(`🎶 [Layer 2] Harvested ${totalHarvested} songs from ${callsMade} playlists (Cost: ${callsMade} units).`);
  return { success: true, harvestedCount: totalHarvested, unitsUsed: callsMade };
}
