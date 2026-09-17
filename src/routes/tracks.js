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
    const query = req.query.q || '';
    const filter = req.query.filter || 'all';
    const source = req.query.source || 'all';
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);

    if (!query.trim()) {
      return res.json({ success: true, count: 0, data: [] });
    }

    if (source === 'youtube') {
      const ytResults = await searchYouTubeSongs(query, limit);
      return res.json({ success: true, source: 'youtube', count: ytResults.length, data: ytResults });
    }

    if (source === 'jamendo') {
      const jamendoResults = await searchJamendo({ query, filter, limit, offset });
      return res.json({ success: true, source: 'jamendo', count: jamendoResults.length, data: jamendoResults });
    }

    // Default 'all': Search YouTube Official Hits FIRST + Audius + Jamendo
    const [ytResults, jamendoResults, audiusResults] = await Promise.all([
      searchYouTubeSongs(query, limit),
      searchJamendo({ query, filter, limit: 6, offset }),
      searchAudiusTracks(query, 4),
    ]);

    // Priority order: YouTube Hits -> Audius -> Jamendo
    const combined = [...ytResults, ...audiusResults, ...jamendoResults];

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
    const { genre } = req.params;
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
 * GET /api/tracks/:id
 */
tracksRouter.get('/:id', async (req, res) => {
  try {
    const track = await getTrackById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.json({ success: true, data: track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
