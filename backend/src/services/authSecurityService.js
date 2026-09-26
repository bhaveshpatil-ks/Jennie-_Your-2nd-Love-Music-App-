import { RateLimit } from '../models/RateLimit.js';
import { SecurityLog } from '../models/SecurityLog.js';
import { isDbConnected } from '../config/db.js';

const WINDOW_MS = 5 * 60 * 1000; // 5-minute rolling window
const MAX_ATTEMPTS = 3; // Block on 4th attempt

// In-memory fallback ledger for IP rate limiting
const inMemoryRateLimits = new Map();

/**
 * Extracts client IP address accurately behind proxies / Cloudflare
 */
export function extractClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    return ips[0];
  }
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Check if the IP is currently rate-limited (Max 3 attempts per 5-minute window)
 * 
 * @returns {Promise<{ allowed: boolean, remainingAttempts: number, retryAfterSeconds?: number }>}
 */
export async function checkIpRateLimit(ipAddress) {
  const now = Date.now();
  let record = inMemoryRateLimits.get(ipAddress);

  if (isDbConnected()) {
    try {
      const dbRec = await RateLimit.findOne({ ip_address: ipAddress });
      if (dbRec) {
        record = {
          attemptCount: dbRec.attempt_count,
          firstAttemptAt: dbRec.first_attempt_at.getTime(),
          blockedUntil: dbRec.blocked_until ? dbRec.blocked_until.getTime() : null,
        };
      }
    } catch (_) {}
  }

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Check if 5-minute window has expired -> reset counter
  if (now - record.firstAttemptAt > WINDOW_MS) {
    inMemoryRateLimits.delete(ipAddress);
    if (isDbConnected()) {
      RateLimit.deleteOne({ ip_address: ipAddress }).catch(() => {});
    }
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if attempts reached limit
  if (record.attemptCount >= MAX_ATTEMPTS) {
    const blockedUntil = record.firstAttemptAt + WINDOW_MS;
    record.blockedUntil = blockedUntil;
    inMemoryRateLimits.set(ipAddress, record);

    if (isDbConnected()) {
      RateLimit.updateOne(
        { ip_address: ipAddress },
        { $set: { blocked_until: new Date(blockedUntil) } }
      ).catch(() => {});
    }

    const retryAfterSeconds = Math.ceil((blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.attemptCount,
  };
}

/**
 * Record a failed login attempt and log security audit
 */
export async function recordFailedAttempt(ipAddress, attemptedEmail) {
  const now = Date.now();
  let record = inMemoryRateLimits.get(ipAddress);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    record = {
      attemptCount: 1,
      firstAttemptAt: now,
      blockedUntil: null,
    };
  } else {
    record.attemptCount += 1;
    if (record.attemptCount >= MAX_ATTEMPTS) {
      record.blockedUntil = record.firstAttemptAt + WINDOW_MS;
    }
  }

  inMemoryRateLimits.set(ipAddress, record);

  const isBlockedNow = record.attemptCount >= MAX_ATTEMPTS;
  const action = isBlockedNow ? 'blocked' : 'failed_login';

  // Audit log
  if (isDbConnected()) {
    try {
      await RateLimit.findOneAndUpdate(
        { ip_address: ipAddress },
        {
          $set: {
            attempt_count: record.attemptCount,
            first_attempt_at: new Date(record.firstAttemptAt),
            blocked_until: record.blockedUntil ? new Date(record.blockedUntil) : null,
          },
        },
        { upsert: true }
      );

      await SecurityLog.create({
        ip_address: ipAddress,
        attempted_email: attemptedEmail ? attemptedEmail.slice(0, 100) : '',
        action,
        timestamp: new Date(),
        details: isBlockedNow
          ? `Blocked after ${record.attemptCount} failed attempts within 5 minutes.`
          : `Failed attempt ${record.attemptCount}/${MAX_ATTEMPTS}`,
      });
    } catch (err) {
      console.warn('[AuthSecurity] Failed to write DB security log:', err.message);
    }
  }

  return {
    attemptCount: record.attemptCount,
    isBlocked: isBlockedNow,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.attemptCount),
  };
}

/**
 * Reset rate limit counter upon successful sign-in
 */
export async function recordSuccessfulLogin(ipAddress, userEmail) {
  inMemoryRateLimits.delete(ipAddress);

  if (isDbConnected()) {
    try {
      await RateLimit.deleteOne({ ip_address: ipAddress });
      await SecurityLog.create({
        ip_address: ipAddress,
        attempted_email: userEmail || '',
        action: 'success',
        timestamp: new Date(),
        details: 'User authenticated successfully. Rate limits cleared.',
      });
    } catch (_) {}
  }
}
