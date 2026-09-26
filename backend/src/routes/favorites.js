import { Router } from 'express';
import { Favorite } from '../models/Favorite.js';
import { isDbConnected } from '../config/db.js';

export const favoritesRouter = Router();

// In-memory fallback
let memoryFavorites = [];

/**
 * GET /api/favorites
 */
favoritesRouter.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const favorites = await Favorite.find().sort({ addedAt: -1 });
      return res.json({ success: true, count: favorites.length, data: favorites });
    }
    res.json({ success: true, count: memoryFavorites.length, data: memoryFavorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: memoryFavorites });
  }
});

/**
 * POST /api/favorites/toggle
 */
favoritesRouter.post('/toggle', async (req, res) => {
  try {
    const { track } = req.body;
    if (!track || typeof track !== 'object' || !track.id) {
      return res.status(400).json({ success: false, message: 'Track object with valid id is required' });
    }

    const trackId = String(track.id).trim().slice(0, 100);
    if (!trackId) {
      return res.status(400).json({ success: false, message: 'Invalid track ID' });
    }

    // Sanitize track payload to safe fields
    const sanitizedTrack = {
      id: trackId,
      title: String(track.title || 'Untitled').slice(0, 200),
      artist: String(track.artist || 'Unknown Artist').slice(0, 200),
      album: String(track.album || '').slice(0, 200),
      duration: Math.max(0, parseInt(track.duration) || 180),
      audioUrl: String(track.audioUrl || '').slice(0, 500),
      coverUrl: String(track.coverUrl || '').slice(0, 500),
      genre: String(track.genre || 'Music').slice(0, 50),
      youtubeId: track.youtubeId ? String(track.youtubeId).slice(0, 50) : undefined,
      source: String(track.source || 'jennie').slice(0, 50),
    };

    if (isDbConnected()) {
      const existing = await Favorite.findOne({ trackId: { $eq: trackId } });
      if (existing) {
        await Favorite.deleteOne({ trackId: { $eq: trackId } });
        return res.json({ success: true, liked: false, trackId });
      } else {
        await Favorite.create({ trackId, track: sanitizedTrack });
        return res.json({ success: true, liked: true, trackId });
      }
    }

    const idx = memoryFavorites.findIndex((f) => f.trackId === trackId);
    if (idx !== -1) {
      memoryFavorites.splice(idx, 1);
      return res.json({ success: true, liked: false, trackId });
    } else {
      memoryFavorites.unshift({ trackId, track: sanitizedTrack, addedAt: new Date() });
      return res.json({ success: true, liked: true, trackId });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/favorites/:trackId
 */
favoritesRouter.delete('/:trackId', async (req, res) => {
  try {
    const trackId = String(req.params.trackId).trim().slice(0, 100);
    if (!trackId) {
      return res.status(400).json({ success: false, message: 'Invalid track ID' });
    }

    if (isDbConnected()) {
      await Favorite.deleteOne({ trackId: { $eq: trackId } });
    }

    memoryFavorites = memoryFavorites.filter((f) => f.trackId !== trackId);
    res.json({ success: true, message: 'Track removed from favorites', trackId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
