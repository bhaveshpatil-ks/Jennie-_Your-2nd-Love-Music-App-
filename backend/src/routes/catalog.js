import { Router } from 'express';
import { getQuotaStatus, isCircuitBreakerTripped } from '../services/quotaManager.js';
import { logMissedQuery, getTopMissedQueries } from '../services/catalogGrowth.js';
import { runOfflineCatalogDiscovery } from '../services/catalogBuilder.js';
import { enrichCatalogWithVideosList, harvestFromPlaylists } from '../services/metadataEnricher.js';
import { TrackCatalog } from '../models/TrackCatalog.js';
import { isDbConnected } from '../config/db.js';

export const catalogRouter = Router();

/**
 * GET /api/catalog/status
 * View real-time quota accounting ledger, circuit breaker status, and catalog metrics
 */
catalogRouter.get('/status', async (req, res) => {
  try {
    const quota = await getQuotaStatus();
    let catalogCount = 0;
    if (isDbConnected()) {
      catalogCount = await TrackCatalog.countDocuments();
    }

    const missed = await getTopMissedQueries(10);

    res.json({
      success: true,
      data: {
        quotaLedger: quota,
        catalog: {
          totalTracks: catalogCount,
          topMissedQueries: missed,
        },
        circuitBreaker: {
          active: quota.circuitBreakerTripped,
          threshold: 9500,
          hardLimit: 10000,
          description:
            quota.circuitBreakerTripped
              ? 'Circuit breaker TRIPPED (< 500 units remaining). Layer 1 & 2 offline. Live recommendations (Layer 3) running 100% free from DB.'
              : 'Normal operating parameters. All 3 layers active.',
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/catalog/missed-query
 * Log unfulfilled user search to drive demand-based Layer 1 discovery
 */
catalogRouter.post('/missed-query', async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Query string required' });
    }

    await logMissedQuery(query);
    res.json({ success: true, message: 'Logged missed query for daily catalog discovery.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/catalog/build
 * Trigger Layer 1 discovery batch (max 20-30 searches = 2,000-3,000 units max)
 */
catalogRouter.post('/build', async (req, res) => {
  try {
    const maxSearches = Math.min(30, Math.max(1, parseInt(req.body?.maxSearches) || 20));
    const result = await runOfflineCatalogDiscovery(maxSearches);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/catalog/enrich
 * Trigger Layer 2 metadata enrichment (videos.list + playlistItems.list at 1 unit each)
 */
catalogRouter.post('/enrich', async (req, res) => {
  try {
    const [videosResult, playlistResult] = await Promise.all([
      enrichCatalogWithVideosList(20),
      harvestFromPlaylists(3),
    ]);
    res.json({
      success: true,
      result: {
        videosEnrichment: videosResult,
        playlistHarvesting: playlistResult,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
