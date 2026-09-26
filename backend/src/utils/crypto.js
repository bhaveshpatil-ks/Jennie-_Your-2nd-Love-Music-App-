import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const CURRENT_KEY_VERSION = 'v1';

// Server-side secret encryption key (32 bytes / 256 bits)
function getMasterKey() {
  const envKey = process.env.ENCRYPTION_SECRET_KEY || process.env.APP_SECRET;
  if (envKey) {
    return crypto.createHash('sha256').update(String(envKey)).digest();
  }
  // Deterministic local secret seed for Jennie Music Backend (never exposed client-side)
  return crypto.createHash('sha256').update('jennie-music-app-internal-gcm-master-key-2026').digest();
}

/**
 * Encrypt sensitive text (such as raw Date of Birth) using AES-256-GCM.
 * Output format: v1:ivHex:authTagHex:encryptedHex
 * 
 * @param {string} plaintext - Plaintext data to encrypt
 * @returns {string} Encrypted bundle with version, IV, and auth tag
 */
export function encryptData(plaintext) {
  if (!plaintext || typeof plaintext !== 'string') return '';

  const masterKey = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${CURRENT_KEY_VERSION}:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM encrypted string (Server-Side Only)
 * 
 * @param {string} ciphertextBundle - Formatted as v1:ivHex:authTagHex:encryptedHex
 * @returns {string|null} Decrypted plaintext or null if tampered/invalid
 */
export function decryptData(ciphertextBundle) {
  if (!ciphertextBundle || typeof ciphertextBundle !== 'string') return null;

  try {
    const parts = ciphertextBundle.split(':');
    if (parts.length !== 4) return null;

    const [version, ivHex, authTagHex, encryptedHex] = parts;
    if (version !== 'v1') {
      console.warn(`[Crypto] Unsupported key version: ${version}`);
      return null;
    }

    const masterKey = getMasterKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.warn('[Crypto] Decryption failed (tampering or bad key):', err.message);
    return null;
  }
}
