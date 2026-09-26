import { MissedQuery } from '../models/MissedQuery.js';
import { isDbConnected } from '../config/db.js';

// In-memory fallback map if MongoDB is offline
const inMemoryMissed = new Map();

/**
 * Log a user query that had 0 or low-confidence results in the local catalog.
 * Increments request count to prioritize real user demand during Layer 1 discovery.
 */
export async function logMissedQuery(query) {
  if (!query || typeof query !== 'string') return;
  const clean = query.trim().toLowerCase().slice(0, 100);
  if (clean.length < 2) return;

  // In-memory record
  const current = inMemoryMissed.get(clean) || { count: 0, lastRequestedAt: new Date(), processed: false };
  current.count += 1;
  current.lastRequestedAt = new Date();
  inMemoryMissed.set(clean, current);

  // MongoDB record
  if (isDbConnected()) {
    try {
      await MissedQuery.findOneAndUpdate(
        { query: clean },
        {
          $inc: { count: 1 },
          $set: { lastRequestedAt: new Date(), processed: false },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[CatalogGrowth] Error logging missed query to DB:', err.message);
    }
  }
}

/**
 * Get top unfulfilled search queries to feed into Layer 1 offline discovery
 */
export async function getTopMissedQueries(limit = 25) {
  if (isDbConnected()) {
    try {
      const topFromDb = await MissedQuery.find({ processed: false })
        .sort({ count: -1, lastRequestedAt: -1 })
        .limit(limit)
        .lean();
      if (topFromDb && topFromDb.length > 0) {
        return topFromDb.map((m) => ({ query: m.query, count: m.count }));
      }
    } catch (err) {
      console.warn('[CatalogGrowth] DB query failed, falling back to memory:', err.message);
    }
  }

  // Fallback to in-memory
  const sorted = Array.from(inMemoryMissed.entries())
    .filter(([_, data]) => !data.processed)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([q, data]) => ({ query: q, count: data.count }));

  return sorted;
}

/**
 * Mark a missed query as resolved once songs have been imported into the catalog
 */
export async function markQueryResolved(query, resolvedVideoId = null) {
  const clean = query.trim().toLowerCase();
  if (inMemoryMissed.has(clean)) {
    const item = inMemoryMissed.get(clean);
    item.processed = true;
    item.resolvedVideoId = resolvedVideoId;
  }

  if (isDbConnected()) {
    try {
      await MissedQuery.findOneAndUpdate(
        { query: clean },
        {
          $set: {
            processed: true,
            resolvedVideoId,
          },
        }
      );
    } catch (err) {
      console.warn('[CatalogGrowth] Failed to mark query resolved in DB:', err.message);
    }
  }
}
