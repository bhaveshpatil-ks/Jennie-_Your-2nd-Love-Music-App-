import { Router } from 'express';
import { tracksRouter } from './tracks.js';
import { playlistsRouter } from './playlists.js';
import { favoritesRouter } from './favorites.js';
import { catalogRouter } from './catalog.js';
import { authRouter } from './auth.js';

export const apiRouter = Router();

apiRouter.use('/tracks', tracksRouter);
apiRouter.use('/playlists', playlistsRouter);
apiRouter.use('/favorites', favoritesRouter);
apiRouter.use('/catalog', catalogRouter);
apiRouter.use('/auth', authRouter);


