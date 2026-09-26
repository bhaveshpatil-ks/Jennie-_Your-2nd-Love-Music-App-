import { QuotaTracker } from '../models/QuotaTracker.js';
import { isDbConnected } from '../config/db.js';

const DAILY_LIMIT = 10000;
const CIRCUIT_BREAKER_THRESHOLD = 9500; // Trigger when < 500 units remaining
const LAYER_1_MAX_BUDGET = 3000; // Max 30 search.list calls (100 units each)
const LAYER_2_MAX_BUDGET = 4000; // Max 4000 cheap enrichment calls

// In-memory fallback ledger (keeps quota state synchronized even if DB is offline)
let inMemoryQuota = {
  date: getTodayDateString(),
  searchListUnits: 0,
  videosListUnits: 0,
  playlistItemsListUnits: 0,
  totalUnitsUsed: 0,
  circuitBreakerTripped: false,
};

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Ensures ledger is refreshed at midnight UTC
 */
function checkMidnightRollover() {
  const today = getTodayDateString();
  if (inMemoryQuota.date !== today) {
    console.log(`🔄 [QuotaManager] Midnight UTC rollover: Resetting quota ledger for ${today}`);
    inMemoryQuota = {
      date: today,
      searchListUnits: 0,
      videosListUnits: 0,
      playlistItemsListUnits: 0,
      totalUnitsUsed: 0,
      circuitBreakerTripped: false,
    };
  }
}

/**
 * Get current quota usage summary
 */
export async function getQuotaStatus() {
  checkMidnightRollover();
  const today = getTodayDateString();

  if (isDbConnected()) {
    try {
      let record = await QuotaTracker.findOne({ date: today });
      if (!record) {
        record = await QuotaTracker.create({
          date: today,
          totalBudget: DAILY_LIMIT,
          totalUnitsUsed: inMemoryQuota.totalUnitsUsed,
          searchListUnits: inMemoryQuota.searchListUnits,
          videosListUnits: inMemoryQuota.videosListUnits,
          playlistItemsListUnits: inMemoryQuota.playlistItemsListUnits,
          circuitBreakerTripped: inMemoryQuota.circuitBreakerTripped,
        });
      }
      return {
        date: record.date,
        totalBudget: record.totalBudget,
        usedUnits: record.totalUnitsUsed,
        remainingUnits: Math.max(0, record.totalBudget - record.totalUnitsUsed),
        breakdown: {
          searchList: record.searchListUnits,
          videosList: record.videosListUnits,
          playlistItemsList: record.playlistItemsListUnits,
          liveRecommendations: 0, // STRICTLY ZERO
        },
        circuitBreakerTripped: record.circuitBreakerTripped || record.totalUnitsUsed >= CIRCUIT_BREAKER_THRESHOLD,
      };
    } catch (err) {
      console.warn('[QuotaManager] DB query failed, using in-memory tracker:', err.message);
    }
  }

  return {
    date: inMemoryQuota.date,
    totalBudget: DAILY_LIMIT,
    usedUnits: inMemoryQuota.totalUnitsUsed,
    remainingUnits: Math.max(0, DAILY_LIMIT - inMemoryQuota.totalUnitsUsed),
    breakdown: {
      searchList: inMemoryQuota.searchListUnits,
      videosList: inMemoryQuota.videosListUnits,
      playlistItemsList: inMemoryQuota.playlistItemsListUnits,
      liveRecommendations: 0,
    },
    circuitBreakerTripped: inMemoryQuota.circuitBreakerTripped || inMemoryQuota.totalUnitsUsed >= CIRCUIT_BREAKER_THRESHOLD,
  };
}

/**
 * HARD RULE #1 ENFORCEMENT & QUOTA CONSUMPTION
 * 
 * @param {string} endpoint - 'search.list' | 'videos.list' | 'playlistItems.list'
 * @param {number} callerLayer - 1 (Catalog Building), 2 (Metadata Enrichment), 3 (Live Recommendations)
 * @param {number} callsCount - Number of API calls (defaults to 1)
 */
export async function consumeQuota(endpoint, callerLayer, callsCount = 1) {
  checkMidnightRollover();
  const today = getTodayDateString();

  // 🚨 HARD RULE #1 CHECK: Absolutely NO YouTube API calls from Layer 3 (Live Serving)
  if (callerLayer === 3) {
    const errorMsg = `[SECURITY FATAL] HARD RULE #1 VIOLATION: Calling YouTube Data API (${endpoint}) is strictly FORBIDDEN in Layer 3 Live Recommendation Serving! Recommendations must be computed from the local database at 0 quota units.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Determine cost per endpoint
  let costPerCall = 1;
  if (endpoint === 'search.list') costPerCall = 100;
  if (endpoint === 'videos.list') costPerCall = 1;
  if (endpoint === 'playlistItems.list') costPerCall = 1;

  const totalCost = costPerCall * callsCount;

  // Layer-specific budget checks
  if (endpoint === 'search.list') {
    if (inMemoryQuota.searchListUnits + totalCost > LAYER_1_MAX_BUDGET) {
      throw new Error(`[QuotaManager] Layer 1 budget exceeded: search.list is capped at ${LAYER_1_MAX_BUDGET} units/day (used: ${inMemoryQuota.searchListUnits}, requested: ${totalCost}).`);
    }
  } else {
    if (inMemoryQuota.videosListUnits + inMemoryQuota.playlistItemsListUnits + totalCost > LAYER_2_MAX_BUDGET) {
      throw new Error(`[QuotaManager] Layer 2 budget exceeded: Enrichment calls capped at ${LAYER_2_MAX_BUDGET} units/day.`);
    }
  }

  // Circuit Breaker check (< 500 units remaining)
  if (inMemoryQuota.totalUnitsUsed + totalCost >= CIRCUIT_BREAKER_THRESHOLD) {
    inMemoryQuota.circuitBreakerTripped = true;
    throw new Error(`[QuotaManager] CIRCUIT BREAKER TRIPPED! Daily quota drops below 500 units reserve (${inMemoryQuota.totalUnitsUsed}/${DAILY_LIMIT} used). Layer 1 & Layer 2 disabled for the rest of today.`);
  }

  // Update in-memory
  inMemoryQuota.totalUnitsUsed += totalCost;
  if (endpoint === 'search.list') inMemoryQuota.searchListUnits += totalCost;
  if (endpoint === 'videos.list') inMemoryQuota.videosListUnits += totalCost;
  if (endpoint === 'playlistItems.list') inMemoryQuota.playlistItemsListUnits += totalCost;

  // Persist to MongoDB if connected
  if (isDbConnected()) {
    try {
      await QuotaTracker.findOneAndUpdate(
        { date: today },
        {
          $inc: {
            totalUnitsUsed: totalCost,
            ...(endpoint === 'search.list' ? { searchListUnits: totalCost } : {}),
            ...(endpoint === 'videos.list' ? { videosListUnits: totalCost } : {}),
            ...(endpoint === 'playlistItems.list' ? { playlistItemsListUnits: totalCost } : {}),
          },
          $set: {
            circuitBreakerTripped: inMemoryQuota.totalUnitsUsed >= CIRCUIT_BREAKER_THRESHOLD,
          },
          $push: {
            history: {
              $each: [
                {
                  timestamp: new Date(),
                  endpoint,
                  cost: totalCost,
                  callerLayer,
                  remaining: Math.max(0, DAILY_LIMIT - inMemoryQuota.totalUnitsUsed),
                },
              ],
              $slice: -100, // Keep last 100 events
            },
          },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[QuotaManager] Failed to persist quota usage to MongoDB:', err.message);
    }
  }

  console.log(`📊 [QuotaManager] Consumed ${totalCost} units for ${endpoint} (Layer ${callerLayer}). Remaining today: ${DAILY_LIMIT - inMemoryQuota.totalUnitsUsed} units.`);
  return {
    success: true,
    cost: totalCost,
    remaining: DAILY_LIMIT - inMemoryQuota.totalUnitsUsed,
  };
}

export function isCircuitBreakerTripped() {
  checkMidnightRollover();
  return inMemoryQuota.circuitBreakerTripped || inMemoryQuota.totalUnitsUsed >= CIRCUIT_BREAKER_THRESHOLD;
}
