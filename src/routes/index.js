import { Router } from 'express';
import { tracksRouter } from './tracks.js';
import { playlistsRouter } from './playlists.js';
import { favoritesRouter } from './favorites.js';

export const apiRouter = Router();

apiRouter.use('/tracks', tracksRouter);
apiRouter.use('/playlists', playlistsRouter);
apiRouter.use('/favorites', favoritesRouter);
