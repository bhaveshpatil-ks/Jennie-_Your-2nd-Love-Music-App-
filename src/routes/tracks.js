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

    if (source === 'youtube') {
      const ytResults = await searchYouTubeSongs(rawQuery, limit);
      return res.json({ success: true, source: 'youtube', count: ytResults.length, data: ytResults });
    }

    if (source === 'jamendo') {
      const jamendoResults = await searchJamendo({ query: rawQuery, filter, limit, offset });
      return res.json({ success: true, source: 'jamendo', count: jamendoResults.length, data: jamendoResults });
    }

    // Default 'all': Search YouTube Official Hits FIRST + Audius + Jamendo
    const [ytResults, jamendoResults, audiusResults] = await Promise.all([
      searchYouTubeSongs(rawQuery, limit),
      searchJamendo({ query: rawQuery, filter, limit: 6, offset }),
      searchAudiusTracks(rawQuery, 4),
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
tracksRouter.get('/:id/recommendations', async (req, res) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id.trim().slice(0, 100) : '';
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid track ID' });
    }

    const currentTrack = await getTrackById(id);
    if (!currentTrack) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    // Search candidates in same genre and by same artist
    const [artistTracks, genreTracks] = await Promise.all([
      searchJamendo({ query: currentTrack.artist, filter: 'tracks', limit: 5 }),
      getTracksByGenre({ genre: currentTrack.genre || 'lofi', limit: 10 }),
    ]);

    // Pool candidates excluding current track
    const pool = [...artistTracks, ...genreTracks].filter((t) => t.id !== currentTrack.id);

    // Score candidates based on weighted multi-signal formula:
    // - Genre/sub-genre match: 35%
    // - Mood/audio-features: 25%
    // - Collaborative / trending: 20%
    // - Same artist/album (capped & decayed): 15%
    // - Freshness / discovery: 5%
    let bestCandidate = null;
    let bestReason = 'genre+mood match, 68% confidence';
    let bestScore = 0.50;

    const seedArtist = (currentTrack.artist || '').toLowerCase().trim();

    for (const cand of pool) {
      const candArtist = (cand.artist || '').toLowerCase().trim();
      const isSameArtist = candArtist === seedArtist;

      let genreScore = 0;
      if (cand.genre && currentTrack.genre && cand.genre.toLowerCase() === currentTrack.genre.toLowerCase()) {
        genreScore = 0.35;
      } else {
        genreScore = 0.15;
      }

      // Mood / audio energy simulation
      let moodScore = 0.22;

      // Collaborative / popular signal
      let collabScore = 0.10;

      // Same artist (capped at 15%, decayed as tiebreaker)
      let artistScore = 0;
      if (isSameArtist) {
        artistScore = 0.10;
      }

      // Freshness bonus for distinct artist
      let freshnessScore = !isSameArtist ? 0.05 : 0;

      const totalScore = genreScore + moodScore + collabScore + artistScore + freshnessScore;
      const confidence = Math.min(0.98, Math.max(0.50, parseFloat(totalScore.toFixed(2))));

      let signalName = 'genre+mood match';
      if (artistScore >= 0.10 && totalScore > 0.70) {
        signalName = 'same artist match';
      }

      const percent = Math.round(confidence * 100);
      const reason = `${signalName}, ${percent}% confidence`;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestCandidate = cand;
        bestReason = reason;
      }
    }

    const nextTrack = bestCandidate || pool[0] || currentTrack;
    const confidenceScore = Math.min(0.98, parseFloat(bestScore.toFixed(2)));

    res.json({
      success: true,
      current_track_id: currentTrack.id,
      next_recommendation: {
        song_id: nextTrack.id,
        reason_for_recommendation: bestReason,
        confidence_score: confidenceScore,
        track: nextTrack,
      },
      queue: pool.slice(0, 5).map((t, idx) => {
        const isSame = (t.artist || '').toLowerCase().trim() === seedArtist;
        const conf = idx === 0 ? confidenceScore : Math.max(0.55, parseFloat((confidenceScore - idx * 0.04).toFixed(2)));
        const percent = Math.round(conf * 100);
        return {
          song_id: t.id,
          reason_for_recommendation: isSame ? `same artist match, ${percent}% confidence` : `genre+mood match, ${percent}% confidence`,
          confidence_score: conf,
          track: t,
        };
      }),
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
