// Cloak backend origins behind relative '/api' reverse-proxy on dev & platforms with proxy support (Vercel/Netlify),
// and auto-fallback to live Railway backend when hosted on static services like GitHub Pages (*.github.io).
const isStaticGitHubPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (isStaticGitHubPages ? 'https://jennie-your-2nd-love-music-app-production.up.railway.app/api' : '/api')
).replace(/\/+$/, '');

/**
 * Checks username format & uniqueness on the backend
 */
export async function checkUsernameApi(username) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/check-username`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, available: true, message: 'Could not verify username with server.' };
  }
}

/**
 * Checks IP rate limiting status before attempting Firebase Auth sign-in
 */
export async function preLoginCheckApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/pre-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      return { status: res.status, success: true, allowed: true, requireCaptcha: false };
    }
    const json = await res.json();
    return { status: res.status, ...json };
  } catch (err) {
    return { status: 200, success: true, allowed: true, requireCaptcha: false };
  }
}

/**
 * Records login attempt result (success/failure) for IP rate limiter & security audit logs
 */
export async function recordLoginResultApi(success, email) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/record-login-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success, email }),
    });
    if (!res.ok) {
      return { status: res.status, success: true };
    }
    const json = await res.json();
    return { status: res.status, ...json };
  } catch (err) {
    return { status: 200, success: true };
  }
}

/**
 * Registers backend user profile with AES-256-GCM encrypted DOB and COPPA age gating
 */
export async function registerProfileApi({ uid, email, username, dateOfBirth, gender }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email, username, dateOfBirth, gender }),
    });
    const json = await res.json();
    return { status: res.status, ...json };
  } catch (err) {
    return { status: 500, success: false, message: 'Profile registration failed due to network error.' };
  }
}

/**
 * Retrieves sanitized user profile by Firebase UID (never exposes raw or encrypted DOB)
 */
export async function fetchUserProfileApi(uid) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile/${encodeURIComponent(uid)}`);
    const json = await res.json();
    return { status: res.status, ...json };
  } catch (err) {
    return { status: 500, success: false, message: err.message };
  }
}

/**
 * Safely parses response without crashing if server returns HTML (e.g., 404, 502)
 */
async function safeParseResponse(res, fallbackMessage = 'Request failed') {
  try {
    const contentType = res.headers?.get?.('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: res.status === 404 ? 'Service temporarily syncing' : `${fallbackMessage} (${res.status})`,
        nonJson: true,
      };
    }
    return { success: true, nonJson: true };
  } catch (err) {
    return { success: false, message: err.message, nonJson: true };
  }
}

/**
 * Records explicit user approval under DPDP Act 2023 for personal data processing
 */
export async function recordDpdpConsentApi(uid) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/dpdp-consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    });
    return await safeParseResponse(res, 'Consent record failed');
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Updates user profile details on backend
 */
export async function updateUserProfileApi(uid, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile/${encodeURIComponent(uid)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await safeParseResponse(res, 'Profile sync');
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Permanently deletes user account and personal data from backend
 */
export async function deleteUserAccountApi(uid) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile/${encodeURIComponent(uid)}`, {
      method: 'DELETE',
    });
    return await safeParseResponse(res, 'Account deletion');
  } catch (err) {
    return { success: false, message: err.message };
  }
}



