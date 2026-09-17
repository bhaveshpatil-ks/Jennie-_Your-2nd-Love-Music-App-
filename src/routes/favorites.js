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
    if (!track || !track.id) {
      return res.status(400).json({ success: false, message: 'Track object with id is required' });
    }

    const trackId = String(track.id);

    if (isDbConnected()) {
      const existing = await Favorite.findOne({ trackId });
      if (existing) {
        await Favorite.deleteOne({ trackId });
        return res.json({ success: true, liked: false, trackId });
      } else {
        await Favorite.create({ trackId, track });
        return res.json({ success: true, liked: true, trackId });
      }
    }

    const idx = memoryFavorites.findIndex((f) => f.trackId === trackId);
    if (idx !== -1) {
      memoryFavorites.splice(idx, 1);
      return res.json({ success: true, liked: false, trackId });
    } else {
      memoryFavorites.unshift({ trackId, track, addedAt: new Date() });
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
    const { trackId } = req.params;

    if (isDbConnected()) {
      await Favorite.deleteOne({ trackId });
    }

    memoryFavorites = memoryFavorites.filter((f) => f.trackId !== trackId);
    res.json({ success: true, message: 'Track removed from favorites', trackId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
