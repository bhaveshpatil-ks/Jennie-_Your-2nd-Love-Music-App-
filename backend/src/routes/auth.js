import { Router } from 'express';
import { User } from '../models/User.js';
import { SecurityLog } from '../models/SecurityLog.js';
import { isDbConnected } from '../config/db.js';
import { encryptData } from '../utils/crypto.js';
import { evaluateAge } from '../utils/ageGating.js';
import {
  extractClientIp,
  checkIpRateLimit,
  recordFailedAttempt,
  recordSuccessfulLogin,
} from '../services/authSecurityService.js';

export const authRouter = Router();

// Reserved words that cannot be used as usernames
const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'root',
  'system',
  'jennie',
  'support',
  'moderator',
  'mod',
  'official',
  'security',
  'api',
  'auth',
  'guest',
  'null',
  'undefined',
]);

/**
 * POST /api/auth/check-username
 * Validates format and checks uniqueness BEFORE Firebase Auth account creation
 */
authRouter.post('/check-username', async (req, res) => {
  try {
    const rawUsername = typeof req.body?.username === 'string' ? req.body.username.trim().toLowerCase() : '';

    if (!rawUsername) {
      return res.status(400).json({ success: false, available: false, message: 'Username is required.' });
    }

    // 3–20 chars, alphanumeric + underscore
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(rawUsername)) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Username must be 3–20 characters long and contain only letters, numbers, and underscores (_).',
      });
    }

    // Check reserved words
    if (RESERVED_USERNAMES.has(rawUsername)) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'This username is reserved and cannot be claimed.',
      });
    }

    // Check database uniqueness
    if (isDbConnected()) {
      const existing = await User.findOne({ username: rawUsername }).lean();
      if (existing) {
        return res.json({
          success: true,
          available: false,
          message: 'Username is already taken. Please choose another.',
        });
      }
    }

    res.json({
      success: true,
      available: true,
      message: 'Username is available.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/auth/pre-login
 * IP-Based Rate Limiting check before calling Firebase Auth (3 attempts per 5-min window)
 */
authRouter.post('/pre-login', async (req, res) => {
  try {
    const ip = extractClientIp(req);
    const rateCheck = await checkIpRateLimit(ip);

    if (!rateCheck.allowed) {
      // Generic error response per spec (do NOT reveal IP or account detail)
      return res.status(429).json({
        success: false,
        blocked: true,
        message: 'Too many attempts. Please try again in a few minutes.',
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      });
    }

    res.json({
      success: true,
      allowed: true,
      remainingAttempts: rateCheck.remainingAttempts,
      // Require CAPTCHA challenge after the 1st failed attempt
      requireCaptcha: rateCheck.remainingAttempts < 3,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/auth/record-login-result
 * Increments rate limit counter on failure and resets on success
 */
authRouter.post('/record-login-result', async (req, res) => {
  try {
    const ip = extractClientIp(req);
    const { success, email } = req.body || {};

    if (success) {
      await recordSuccessfulLogin(ip, email);
      return res.json({ success: true, message: 'Login recorded.' });
    }

    const failedRecord = await recordFailedAttempt(ip, email);

    if (failedRecord.isBlocked) {
      return res.status(429).json({
        success: false,
        blocked: true,
        message: 'Too many attempts. Please try again in a few minutes.',
      });
    }

    // Generic error per spec (prevent user enumeration)
    res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
      remainingAttempts: failedRecord.remainingAttempts,
      requireCaptcha: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/auth/register-profile
 * Validates age, encrypts DOB with AES-256-GCM, and creates secure user profile
 */
authRouter.post('/register-profile', async (req, res) => {
  try {
    const ip = extractClientIp(req);
    const { uid, email, username, dateOfBirth, gender } = req.body || {};

    if (!uid || !email || !username || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'All fields (UID, email, username, date of birth) are required.',
      });
    }

    // 1. Evaluate Age & COPPA compliance
    const ageResult = evaluateAge(dateOfBirth);
    if (!ageResult.valid) {
      if (isDbConnected()) {
        await SecurityLog.create({
          ip_address: ip,
          attempted_email: email,
          action: 'signup_blocked_coppa',
          timestamp: new Date(),
          details: `Signup blocked: Under-13 user (${ageResult.age} yrs old).`,
        });
      }
      return res.status(403).json({
        success: false,
        blocked: true,
        message: ageResult.error,
      });
    }

    // 2. Validate Gender
    const validGenders = ['male', 'female', 'other', 'prefer_not_to_say', null];
    const sanitizedGender = validGenders.includes(gender) ? gender : null;

    // 3. Encrypt Date of Birth at Rest with AES-256-GCM (Server-Side Only)
    const encryptedDob = encryptData(dateOfBirth);

    // 4. Persist User Document
    const userDoc = {
      uid,
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      date_of_birth_encrypted: encryptedDob,
      age_bracket: ageResult.ageBracket,
      is_minor: ageResult.isMinor,
      gender: sanitizedGender,
      email_verified: false,
      dpdp_consent: {
        accepted: true,
        accepted_at: new Date(),
        version: 'DPDP-2023-v1',
        ip_address: ip,
      },
    };

    if (isDbConnected()) {
      await User.findOneAndUpdate({ uid }, { $set: userDoc }, { upsert: true, new: true });
      await SecurityLog.create({
        ip_address: ip,
        attempted_email: email,
        action: 'signup_success',
        timestamp: new Date(),
        details: `Account created. Bracket: ${ageResult.ageBracket}, Minor: ${ageResult.isMinor}, DPDP Consent: Granted.`,
      });
    }

    // 5. Return safe client profile (NEVER returns raw DOB or encrypted DOB to client)
    res.json({
      success: true,
      user: {
        uid,
        email: userDoc.email,
        username: userDoc.username,
        age_bracket: userDoc.age_bracket,
        is_minor: userDoc.is_minor,
        gender: userDoc.gender,
        email_verified: userDoc.email_verified,
        dpdp_consent: userDoc.dpdp_consent,
        contentPolicy: ageResult.contentPolicy,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/auth/dpdp-consent
 * Records explicit user approval for personal data processing under DPDP Act 2023
 */
authRouter.post('/dpdp-consent', async (req, res) => {
  try {
    const ip = extractClientIp(req);
    const { uid } = req.body || {};

    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID is required.' });
    }

    const consentRecord = {
      accepted: true,
      accepted_at: new Date(),
      version: 'DPDP-2023-v1',
      ip_address: ip,
    };

    if (isDbConnected()) {
      await User.findOneAndUpdate(
        { uid },
        { $set: { dpdp_consent: consentRecord } },
        { new: true }
      );
      await SecurityLog.create({
        ip_address: ip,
        action: 'dpdp_consent_granted',
        timestamp: new Date(),
        details: `DPDP Consent affirmed by UID: ${uid}.`,
      });
    }

    res.json({
      success: true,
      message: 'DPDP consent recorded successfully.',
      dpdp_consent: consentRecord,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/auth/profile/:uid
 * Fetch sanitized user profile (derives age_bracket, raw DOB is never exposed)
 */
authRouter.get('/profile/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID required.' });
    }

    if (isDbConnected()) {
      const user = await User.findOne({ uid }).lean();
      if (user) {
        return res.json({
          success: true,
          user: {
            uid: user.uid,
            email: user.email,
            username: user.username,
            age_bracket: user.age_bracket,
            is_minor: user.is_minor,
            gender: user.gender,
            email_verified: user.email_verified,
            dpdp_consent: user.dpdp_consent || { accepted: false },
          },
        });
      }
    }

    res.status(404).json({ success: false, message: 'User profile not found.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/auth/profile/:uid
 * Update user profile details (username, gender, dateOfBirth)
 */
authRouter.put('/profile/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { username, gender, dateOfBirth } = req.body || {};
    const ip = extractClientIp(req);

    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID required.' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database unavailable.' });
    }

    const existingUser = await User.findOne({ uid });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updates = {};

    // Validate and update username if provided
    if (typeof username === 'string' && username.trim()) {
      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername !== existingUser.username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(cleanUsername)) {
          return res.status(400).json({
            success: false,
            message: 'Username must be 3–20 characters and contain only letters, numbers, and underscores (_).',
          });
        }
        if (RESERVED_USERNAMES.has(cleanUsername)) {
          return res.status(400).json({ success: false, message: 'This username is reserved.' });
        }
        const duplicate = await User.findOne({ username: cleanUsername, uid: { $ne: uid } }).lean();
        if (duplicate) {
          return res.status(400).json({ success: false, message: 'Username is already taken.' });
        }
        updates.username = cleanUsername;
      }
    }

    // Gender update
    if (typeof gender === 'string') {
      const validGenders = ['male', 'female', 'non-binary', 'prefer-not-to-say'];
      const sanitized = gender.trim().toLowerCase();
      if (validGenders.includes(sanitized)) {
        updates.gender = sanitized;
      }
    }

    // Date of Birth update (re-calculates age gating and re-encrypts)
    if (typeof dateOfBirth === 'string' && dateOfBirth.trim()) {
      const ageResult = evaluateAge(dateOfBirth);
      if (!ageResult.isValidFormat) {
        return res.status(400).json({ success: false, message: 'Invalid Date of Birth format (YYYY-MM-DD).' });
      }
      if (ageResult.age < 13) {
        return res.status(403).json({ success: false, message: 'Users under 13 cannot use this platform under COPPA/DPDP Act.' });
      }
      const encryptedDob = encryptData(dateOfBirth.trim());
      updates.date_of_birth_encrypted = encryptedDob;
      updates.age_bracket = ageResult.ageBracket;
      updates.is_minor = ageResult.isMinor;
    }

    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { $set: updates },
      { new: true }
    ).lean();

    await SecurityLog.create({
      ip_address: ip,
      action: 'profile_updated',
      timestamp: new Date(),
      details: `Profile updated for UID: ${uid}. Fields: ${Object.keys(updates).join(', ')}`,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        username: updatedUser.username,
        age_bracket: updatedUser.age_bracket,
        is_minor: updatedUser.is_minor,
        gender: updatedUser.gender,
        email_verified: updatedUser.email_verified,
        dpdp_consent: updatedUser.dpdp_consent,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/auth/profile/:uid
 * Permanently delete user record and personal data (Right to Erasure under DPDP Act 2023)
 */
authRouter.delete('/profile/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const ip = extractClientIp(req);

    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID required.' });
    }

    if (isDbConnected()) {
      const deleted = await User.findOneAndDelete({ uid });
      await SecurityLog.create({
        ip_address: ip,
        action: 'account_deleted',
        timestamp: new Date(),
        details: `Account permanently deleted for UID: ${uid} under Right to Erasure.`,
      });
    }

    res.json({
      success: true,
      message: 'Your account and personal data have been permanently deleted.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
