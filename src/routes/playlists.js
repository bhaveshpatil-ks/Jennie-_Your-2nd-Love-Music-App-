import { Router } from 'express';
import { Playlist } from '../models/Playlist.js';
import { isDbConnected } from '../config/db.js';

export const playlistsRouter = Router();

// Fallback in-memory playlists if DB is offline
let memoryPlaylists = [
  {
    id: 'pl-coding',
    title: 'Late Night Coding',
    description: 'Zero lyrics, pure flow state synth and ambient waves.',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-8', 'track-5', 'track-6', 'track-14'],
    createdAt: '2024-03-01',
  },
  {
    id: 'pl-morning',
    title: 'Morning Acoustic & Coffee',
    description: 'Peaceful guitar notes and gentle acoustic melodies to start the day.',
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-1', 'track-15', 'track-16', 'track-17'],
    createdAt: '2024-03-02',
  },
];

/**
 * GET /api/playlists
 */
playlistsRouter.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const dbPlaylists = await Playlist.find().sort({ createdAt: -1 });
      if (dbPlaylists.length > 0) {
        return res.json({ success: true, data: dbPlaylists });
      }
      // If DB is empty, seed defaults
      for (const p of memoryPlaylists) {
        await Playlist.findOneAndUpdate({ id: p.id }, p, { upsert: true });
      }
      return res.json({ success: true, data: memoryPlaylists });
    }
    res.json({ success: true, data: memoryPlaylists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: memoryPlaylists });
  }
});

/**
 * POST /api/playlists
 */
playlistsRouter.post('/', async (req, res) => {
  try {
    const rawTitle = req.body.title ? String(req.body.title).trim().slice(0, 100) : 'New Playlist';
    const rawDesc = req.body.description ? String(req.body.description).trim().slice(0, 500) : 'Personal curated music collection.';
    const rawCover = req.body.coverUrl && typeof req.body.coverUrl === 'string' ? req.body.coverUrl.slice(0, 500) : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
    const rawTrackIds = Array.isArray(req.body.trackIds) ? req.body.trackIds.map(String).slice(0, 500) : [];
    const rawTracks = Array.isArray(req.body.tracks) ? req.body.tracks.slice(0, 500) : [];

    const newPlaylist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: rawTitle,
      description: rawDesc,
      coverUrl: rawCover,
      trackIds: rawTrackIds,
      tracks: rawTracks,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isDbConnected()) {
      const created = await Playlist.create(newPlaylist);
      return res.status(201).json({ success: true, data: created });
    }

    memoryPlaylists.unshift(newPlaylist);
    res.status(201).json({ success: true, data: newPlaylist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/playlists/:id
 */
playlistsRouter.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    if (!id || id.length > 100) {
      return res.status(400).json({ success: false, message: 'Invalid playlist ID' });
    }

    if (isDbConnected()) {
      const pl = await Playlist.findOne({ id: { $eq: id } });
      if (pl) return res.json({ success: true, data: pl });
    }

    const fallback = memoryPlaylists.find((p) => p.id === id);
    if (!fallback) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    res.json({ success: true, data: fallback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/playlists/:id
 */
playlistsRouter.put('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    if (!id || id.length > 100) {
      return res.status(400).json({ success: false, message: 'Invalid playlist ID' });
    }

    // Whitelist allowed fields to prevent arbitrary field injection
    const sanitizedUpdate = {};
    if (typeof req.body.title === 'string') sanitizedUpdate.title = req.body.title.trim().slice(0, 100);
    if (typeof req.body.description === 'string') sanitizedUpdate.description = req.body.description.trim().slice(0, 500);
    if (typeof req.body.coverUrl === 'string') sanitizedUpdate.coverUrl = req.body.coverUrl.slice(0, 500);
    if (Array.isArray(req.body.trackIds)) sanitizedUpdate.trackIds = req.body.trackIds.map(String).slice(0, 500);
    if (Array.isArray(req.body.tracks)) sanitizedUpdate.tracks = req.body.tracks.slice(0, 500);

    if (isDbConnected()) {
      const updated = await Playlist.findOneAndUpdate({ id: { $eq: id } }, { $set: sanitizedUpdate }, { new: true });
      if (updated) return res.json({ success: true, data: updated });
    }

    const idx = memoryPlaylists.findIndex((p) => p.id === id);
    if (idx !== -1) {
      memoryPlaylists[idx] = { ...memoryPlaylists[idx], ...sanitizedUpdate };
      return res.json({ success: true, data: memoryPlaylists[idx] });
    }

    res.status(404).json({ success: false, message: 'Playlist not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/playlists/:id
 */
playlistsRouter.delete('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    if (!id || id.length > 100) {
      return res.status(400).json({ success: false, message: 'Invalid playlist ID' });
    }

    if (isDbConnected()) {
      await Playlist.findOneAndDelete({ id: { $eq: id } });
    }

    memoryPlaylists = memoryPlaylists.filter((p) => p.id !== id);
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
