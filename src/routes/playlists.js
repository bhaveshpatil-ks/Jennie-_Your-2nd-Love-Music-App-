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
    const { title, description, coverUrl, trackIds, tracks } = req.body;
    const newPlaylist = {
      id: `pl-${Date.now()}`,
      title: title || 'New Playlist',
      description: description || 'Personal curated music collection.',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      trackIds: trackIds || [],
      tracks: tracks || [],
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
    const { id } = req.params;
    if (isDbConnected()) {
      const pl = await Playlist.findOne({ id });
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
    const { id } = req.params;
    const update = req.body;

    if (isDbConnected()) {
      const updated = await Playlist.findOneAndUpdate({ id }, update, { new: true });
      if (updated) return res.json({ success: true, data: updated });
    }

    const idx = memoryPlaylists.findIndex((p) => p.id === id);
    if (idx !== -1) {
      memoryPlaylists[idx] = { ...memoryPlaylists[idx], ...update };
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
    const { id } = req.params;

    if (isDbConnected()) {
      await Playlist.findOneAndDelete({ id });
    }

    memoryPlaylists = memoryPlaylists.filter((p) => p.id !== id);
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
