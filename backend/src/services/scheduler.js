import { runOfflineCatalogDiscovery } from './catalogBuilder.js';
import { enrichCatalogWithVideosList, harvestFromPlaylists } from './metadataEnricher.js';
import { isCircuitBreakerTripped, getQuotaStatus } from './quotaManager.js';

let dailyInterval = null;

/**
 * Initializes the background scheduled job for Layer 1 & Layer 2.
 * Runs once every 24 hours off-peak.
 * 
 * NEVER executes search.list in user sessions.
 */
export function startDailyCatalogScheduler() {
  if (dailyInterval) return;

  console.log('⏰ [Scheduler] Daily Catalog Discovery & Enrichment Scheduler initialized.');

  // Run initial lightweight cycle 10 seconds after server boot
  setTimeout(async () => {
    try {
      const status = await getQuotaStatus();
      if (!isCircuitBreakerTripped() && status.usedUnits < 2000) {
        console.log('🌅 [Scheduler] Executing daily catalog discovery & enrichment cycle...');
        await runOfflineCatalogDiscovery(10); // Start with 10 seed queries (1,000 units)
        await enrichCatalogWithVideosList(10);
        await harvestFromPlaylists(2);
      }
    } catch (err) {
      console.warn('[Scheduler] Startup catalog cycle skipped:', err.message);
    }
  }, 10000);

  // Check every 6 hours if a new day has arrived and run the daily batch
  dailyInterval = setInterval(async () => {
    try {
      const status = await getQuotaStatus();
      if (isCircuitBreakerTripped()) {
        console.warn('⚠️ [Scheduler] Skipping scheduled cycle: Quota circuit breaker tripped (< 500 units remaining).');
        return;
      }

      // If less than 3,000 units used today, run Layer 1 & 2
      if (status.usedUnits < 3000) {
        console.log('🔄 [Scheduler] Running automated daily Layer 1 discovery & Layer 2 enrichment...');
        await runOfflineCatalogDiscovery(20); // 20 searches = 2,000 units
        await enrichCatalogWithVideosList(20);
        await harvestFromPlaylists(3);
      }
    } catch (err) {
      console.warn('[Scheduler] Daily scheduled cycle error:', err.message);
    }
  }, 6 * 3600 * 1000);
}
