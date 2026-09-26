import axios from 'axios';
import { TrackCatalog } from '../models/TrackCatalog.js';
import { isDbConnected } from '../config/db.js';
import { consumeQuota, isCircuitBreakerTripped } from './quotaManager.js';
import { getTopMissedQueries, markQueryResolved } from './catalogGrowth.js';
import { searchYouTubeSongs } from './youtube.js';
import { cleanTitle } from '../utils/cleaners.js';

// Core curated queries used if user missed queries are fewer than target batch
const CORE_DISCOVERY_QUERIES = [
  'Bollywood Romantic official audio',
  'Punjabi Hit Songs official audio',
  'Lo-Fi Beats for study chill',
  'Synthwave Retrowave night drive',
  'Deep House Club Melodic',
  'Ambient Meditation Soundscape',
  'Acoustic Fingerstyle Folk',
  'Top Global Pop 2024 hits',
];

/**
 * Infer audio features and genre tags from title/query metadata
 */
function inferMetadata(title, artist, query) {
  const t = (title + ' ' + query).toLowerCase();
  let genre = 'Pop / Global';
  let tempo = 100;
  let energy = 0.55;
  let valence = 0.5;
  let danceability = 0.6;
  let acousticness = 0.3;

  if (t.includes('lofi') || t.includes('lo-fi') || t.includes('chill') || t.includes('study')) {
    genre = 'Lo-Fi';
    tempo = 80;
    energy = 0.3;
    valence = 0.5;
    danceability = 0.55;
    acousticness = 0.75;
  } else if (t.includes('synthwave') || t.includes('cyberpunk') || t.includes('retrowave')) {
    genre = 'Synthwave';
    tempo = 125;
    energy = 0.85;
    valence = 0.7;
    danceability = 0.75;
    acousticness = 0.08;
  } else if (t.includes('house') || t.includes('club') || t.includes('techno') || t.includes('edm')) {
    genre = 'Deep House';
    tempo = 124;
    energy = 0.82;
    valence = 0.75;
    danceability = 0.85;
    acousticness = 0.12;
  } else if (t.includes('ambient') || t.includes('sleep') || t.includes('meditation') || t.includes('drone')) {
    genre = 'Ambient';
    tempo = 65;
    energy = 0.15;
    valence = 0.3;
    danceability = 0.2;
    acousticness = 0.92;
  } else if (t.includes('acoustic') || t.includes('unplugged') || t.includes('piano') || t.includes('guitar')) {
    genre = 'Acoustic';
    tempo = 90;
    energy = 0.35;
    valence = 0.55;
    danceability = 0.5;
    acousticness = 0.88;
  } else if (t.includes('punjabi') || t.includes('aujla') || t.includes('dhillon') || t.includes('diljit')) {
    genre = 'Punjabi Hip-Hop';
    tempo = 98;
    energy = 0.88;
    valence = 0.75;
    danceability = 0.85;
    acousticness = 0.2;
  } else if (t.includes('bollywood') || t.includes('arijit') || t.includes('pritam') || t.includes('hindi')) {
    genre = 'Bollywood Romantic';
    tempo = 92;
    energy = 0.6;
    valence = 0.65;
    danceability = 0.6;
    acousticness = 0.45;
  }

  return {
    genreTags: [genre],
    moodTags: energy > 0.7 ? ['High Energy', 'Party'] : ['Chill & Relax', 'Soulful'],
    audioFeatures: { tempo, energy, valence, danceability, acousticness },
  };
}

/**
 * Execute Layer 1 Offline Catalog Discovery Batch (Runs once/day)
 * Max 20-30 searches total = 2,000-3,000 units max.
 * 
 * NEVER CALLED IN LIVE USER SESSIONS.
 */
export async function runOfflineCatalogDiscovery(maxSearches = 25) {
  if (isCircuitBreakerTripped()) {
    console.warn('⚠️ [Layer 1] Aborted: Quota circuit breaker is active (< 500 units remaining).');
    return { success: false, reason: 'circuit_breaker_active', importedCount: 0 };
  }

  console.log(`🚀 [Layer 1] Starting Offline Catalog Building (Cap: ${maxSearches} search.list calls = ${maxSearches * 100} units)...`);

  // 1. Gather queries prioritizing real user missed queries first
  const missed = await getTopMissedQueries(maxSearches);
  const missedQueryStrings = missed.map((m) => m.query);
  const candidateQueries = [...missedQueryStrings];

  for (const core of CORE_DISCOVERY_QUERIES) {
    if (candidateQueries.length >= maxSearches) break;
    if (!candidateQueries.includes(core.toLowerCase())) {
      candidateQueries.push(core);
    }
  }

  let totalSearchesExecuted = 0;
  let totalImported = 0;
  const apiKey = process.env.YOUTUBE_API_KEY;

  for (const query of candidateQueries.slice(0, maxSearches)) {
    if (isCircuitBreakerTripped()) break;

    try {
      // Deduct 100 units for search.list (Layer 1)
      await consumeQuota('search.list', 1, 1);
      totalSearchesExecuted += 1;

      let discoveredItems = [];

      if (apiKey && !apiKey.includes('your_')) {
        // Official YouTube Data API v3 search.list
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=10&q=${encodeURIComponent(query)}&key=${apiKey}`;
        const resp = await axios.get(url, { timeout: 8000 });
        discoveredItems = (resp.data.items || []).map((item) => ({
          videoId: item.id?.videoId,
          title: cleanTitle(item.snippet?.title || ''),
          artist: item.snippet?.channelTitle || 'Artist',
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
          publishDate: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : null,
          duration: 210,
        })).filter((x) => Boolean(x.videoId));
      } else {
        // High-fidelity fallback scraper (respecting exact 100 units quota accounting)
        const scraped = await searchYouTubeSongs(query, 10);
        discoveredItems = scraped.map((t) => ({
          videoId: t.youtubeId,
          title: t.title,
          artist: t.artist,
          album: t.album,
          thumbnail: t.coverUrl,
          duration: t.duration || 180,
          publishDate: new Date(),
        })).filter((x) => Boolean(x.videoId));
      }

      // Upsert into persistent TrackCatalog
      for (const item of discoveredItems) {
        const meta = inferMetadata(item.title, item.artist, query);
        const record = {
          videoId: item.videoId,
          title: item.title,
          artist: item.artist,
          album: item.album || `${item.artist} - Single`,
          duration: item.duration || 180,
          genreTags: meta.genreTags,
          moodTags: meta.moodTags,
          thumbnail: item.thumbnail,
          publishDate: item.publishDate,
          audioFeatures: meta.audioFeatures,
          discoveredVia: 'search.list',
          qualityScore: 80,
          source: 'youtube',
        };

        if (isDbConnected()) {
          await TrackCatalog.findOneAndUpdate(
            { videoId: item.videoId },
            { $set: record },
            { upsert: true }
          );
        }
        totalImported += 1;
      }

      // Mark user query resolved if applicable
      await markQueryResolved(query, discoveredItems[0]?.videoId || null);
    } catch (err) {
      console.warn(`[Layer 1] Discovery failed for query "${query}":`, err.message);
    }
  }

  console.log(`✅ [Layer 1] Finished offline catalog discovery: ${totalSearchesExecuted} search.list calls (${totalSearchesExecuted * 100} units), ${totalImported} tracks added/updated.`);
  return {
    success: true,
    searchesExecuted: totalSearchesExecuted,
    unitsUsed: totalSearchesExecuted * 100,
    importedCount: totalImported,
  };
}
