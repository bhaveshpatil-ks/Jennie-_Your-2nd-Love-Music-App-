import { Router } from 'express';
import {
  getTrendingTracks as getJamendoTrending,
  searchTracks as searchJamendo,
  getTracksByGenre,
  getFeaturedTrack,
  getTrackById,
} from '../services/jamendo.js';
import {
  searchAudiusTracks,
  getTrendingAudiusTracks,
} from '../services/audius.js';
import {
  searchYouTubeSongs,
  getTrendingYouTubeSongs,
} from '../services/youtube.js';
import { getLiveRecommendations } from '../services/recommendationService.js';
import { logMissedQuery } from '../services/catalogGrowth.js';
import { TrackCatalog } from '../models/TrackCatalog.js';
import { isDbConnected } from '../config/db.js';

export const tracksRouter = Router();

/**
 * GET /api/tracks/trending?source=all|youtube|jamendo|audius
 */
tracksRouter.get('/trending', async (req, res) => {
  try {
    const source = req.query.source || 'all';
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);

    if (source === 'youtube') {
      const ytTracks = await getTrendingYouTubeSongs(limit);
      return res.json({ success: true, source: 'youtube', count: ytTracks.length, data: ytTracks });
    }

    if (source === 'jamendo') {
      const jamendoTracks = await getJamendoTrending(limit, offset);
      return res.json({ success: true, source: 'jamendo', count: jamendoTracks.length, data: jamendoTracks });
    }

    // Combined trending: YouTube Hits first, followed by Jamendo
    const [ytTracks, jamendoTracks] = await Promise.all([
      getTrendingYouTubeSongs(Math.ceil(limit * 0.7)),
      getJamendoTrending(Math.ceil(limit * 0.3), offset),
    ]);

    const combined = [...ytTracks, ...jamendoTracks];
    res.json({ success: true, source: 'all', count: combined.length, data: combined.slice(0, limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/tracks/featured
 */
tracksRouter.get('/featured', async (req, res) => {
  try {
    const ytTrending = await getTrendingYouTubeSongs(5);
    if (ytTrending.length > 0) {
      return res.json({ success: true, data: { ...ytTrending[0], featured: true } });
    }

    const track = await getFeaturedTrack();
    if (!track) {
      return res.status(404).json({ success: false, message: 'Featured track not found' });
    }
    res.json({ success: true, data: track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/tracks/search?q=...&source=all|youtube|jamendo|audius&filter=all|songs|artists|genres
 */
tracksRouter.get('/search', async (req, res) => {
  try {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120) : '';
    const validFilters = ['all', 'songs', 'artists', 'genres'];
    const validSources = ['all', 'youtube', 'jamendo', 'audius'];
    
    const filter = validFilters.includes(req.query.filter) ? req.query.filter : 'all';
    const source = validSources.includes(req.query.source) ? req.query.source : 'all';
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);

    if (!rawQuery) {
      return res.json({ success: true, count: 0, data: [] });
    }

    // Search local database catalog first (Zero Quota)
    let dbMatches = [];
    if (isDbConnected()) {
      try {
        const found = await TrackCatalog.find({
          $or: [
            { title: { $regex: rawQuery, $options: 'i' } },
            { artist: { $regex: rawQuery, $options: 'i' } },
            { genreTags: { $regex: rawQuery, $options: 'i' } },
          ],
        })
          .limit(limit)
          .lean();

        if (found && found.length > 0) {
          dbMatches = found.map((t) => ({
            id: `yt-${t.videoId}`,
            youtubeId: t.videoId,
            title: t.title,
            artist: t.artist,
            album: t.album || `${t.artist} (Official)`,
            duration: t.duration || 180,
            audioUrl: '',
            coverUrl: t.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
            genre: t.genreTags?.[0] || 'Pop / Global',
            genreTags: t.genreTags || [],
            source: 'youtube',
            views: t.views || 0,
            qualityScore: t.qualityScore || 80,
          }));
        }
      } catch (_) {}
    }

    if (source === 'youtube') {
      const ytResults = await searchYouTubeSongs(rawQuery, limit);
      const merged = [...dbMatches, ...ytResults.filter((y) => !dbMatches.some((d) => d.youtubeId === y.youtubeId))];
      if (merged.length < 3) {
        logMissedQuery(rawQuery).catch(() => {});
      }
      return res.json({ success: true, source: 'youtube', count: merged.length, data: merged.slice(0, limit) });
    }

    if (source === 'jamendo') {
      const jamendoResults = await searchJamendo({ query: rawQuery, filter, limit, offset });
      if (jamendoResults.length < 3) {
        logMissedQuery(rawQuery).catch(() => {});
      }
      return res.json({ success: true, source: 'jamendo', count: jamendoResults.length, data: jamendoResults });
    }

    // Default 'all': Local Catalog + YouTube Hits + Audius + Jamendo
    const [ytResults, jamendoResults, audiusResults] = await Promise.all([
      searchYouTubeSongs(rawQuery, limit),
      searchJamendo({ query: rawQuery, filter, limit: 6, offset }),
      searchAudiusTracks(rawQuery, 4),
    ]);

    // Priority order: Local DB Catalog -> YouTube Hits -> Audius -> Jamendo
    const combined = [
      ...dbMatches,
      ...ytResults.filter((y) => !dbMatches.some((d) => d.youtubeId === y.youtubeId)),
      ...audiusResults,
      ...jamendoResults,
    ];

    if (combined.length < 3) {
      logMissedQuery(rawQuery).catch(() => {});
    }

    res.json({ success: true, source: 'all', count: combined.length, data: combined.slice(0, limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/tracks/genre/:genre?limit=...
 */
tracksRouter.get('/genre/:genre', async (req, res) => {
  try {
    const genre = typeof req.params.genre === 'string' ? req.params.genre.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) : '';
    if (!genre) {
      return res.status(400).json({ success: false, message: 'Invalid genre parameter' });
    }

    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);

    // Try YouTube genre query first, fall back to Jamendo
    const ytGenre = await searchYouTubeSongs(`${genre} hit songs`, limit);
    if (ytGenre.length > 0) {
      return res.json({ success: true, genre, count: ytGenre.length, data: ytGenre });
    }

    const tracks = await getTracksByGenre({ genre, limit, offset });
    res.json({ success: true, genre, count: tracks.length, data: tracks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/tracks/home-feed
 * Fast aggregate feed for Home screen
 */
tracksRouter.get('/home-feed', async (req, res) => {
  try {
    const [ytTrending, lofi, synthwave, ambient, house, acoustic] = await Promise.all([
      getTrendingYouTubeSongs(10),
      getTracksByGenre({ genre: 'lofi', limit: 8 }),
      getTracksByGenre({ genre: 'synthwave', limit: 8 }),
      getTracksByGenre({ genre: 'ambient', limit: 8 }),
      getTracksByGenre({ genre: 'deephouse', limit: 8 }),
      getTracksByGenre({ genre: 'acoustic', limit: 8 }),
    ]);

    const featured = ytTrending.length > 0 ? { ...ytTrending[0], featured: true } : null;

    res.json({
      success: true,
      data: {
        featured,
        trending: ytTrending,
        lofi,
        synthwave,
        ambient,
        house,
        acoustic,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/tracks/:id/recommendations
 * Algorithmic recommendations following priority order and mood continuity
 */
/**
 * GET /api/tracks/:id/recommendations
 * Layer 3 Live Recommendation Serving: Zero YouTube API calls, 100% computed from local database.
 */
tracksRouter.get('/:id/recommendations', async (req, res) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id.trim().slice(0, 100) : '';
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid track ID' });
    }

    const cleanId = id.replace(/^yt-/, '');
    let currentTrack = null;

    if (isDbConnected()) {
      currentTrack = await TrackCatalog.findOne({
        $or: [{ videoId: cleanId }, { videoId: id }],
      }).lean();
    }

    if (!currentTrack) {
      currentTrack = await getTrackById(id);
    }

    if (!currentTrack) {
      currentTrack = {
        id,
        youtubeId: cleanId,
        title: 'Playing Track',
        artist: 'Various Artists',
        genre: 'Pop / Global',
        genreTags: ['Pop / Global'],
      };
    }

    let history = [];
    try {
      if (req.query.history) history = JSON.parse(req.query.history);
    } catch (_) {}

    const consecutiveSkips = parseInt(req.query.skips) || 0;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));

    // Execute Layer 3 Zero-Quota Live Recommendation
    const recommendations = await getLiveRecommendations(currentTrack, {
      history,
      consecutiveSkips,
      limit,
    });

    const primaryDecision = recommendations[0] || null;

    res.json({
      success: true,
      source: 'database_layer_3',
      quotaUnitsUsed: 0, // HARD RULE #1 VERIFIED: 0 Units
      current_track_id: currentTrack.id || currentTrack.videoId,
      currentTrack,
      decision: primaryDecision
        ? {
            track: primaryDecision,
            reason_for_recommendation: primaryDecision.recommendationReason,
            confidence_score: (primaryDecision.recommendationScore || 75) / 100,
          }
        : null,
      next_recommendation: primaryDecision
        ? {
            song_id: primaryDecision.id,
            reason_for_recommendation: primaryDecision.recommendationReason,
            confidence_score: (primaryDecision.recommendationScore || 75) / 100,
            track: primaryDecision,
          }
        : null,
      queue: recommendations.map((t) => ({
        song_id: t.id,
        reason_for_recommendation: t.recommendationReason,
        confidence_score: (t.recommendationScore || 75) / 100,
        track: t,
      })),
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/tracks/:id
 */
tracksRouter.get('/:id', async (req, res) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id.trim().slice(0, 100) : '';
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid track ID' });
    }
    const track = await getTrackById(id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.json({ success: true, data: track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
