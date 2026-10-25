import { store } from '../store/store.js';
import { showToast } from '../store/uiSlice.js';

// Track recent service failure toasts to prevent toast flooding
const recentFailureToasts = new Map();

/**
 * Fetch wrapper with exponential backoff retry and global error toast dispatch.
 * 
 * @param {string} url - Target URL to fetch
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @param {number} [retries=2] - Number of retry attempts before surfacing error
 * @param {number} [backoff=500] - Initial delay before retry (ms)
 * @param {string} [serviceName='Telemetry API'] - Friendly name of the service for toast notifications
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options = {}, retries = 2, backoff = 500, serviceName = 'Telemetry API') {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res;
  } catch (err) {
    // If request was explicitly aborted by caller (e.g. cleanup), don't retry or toast
    if (options.signal?.aborted || err.name === 'AbortError') {
      throw err;
    }

    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 3, serviceName);
    }

    // Retries exhausted — dispatch user-facing toast notification once per window
    const now = Date.now();
    const lastToast = recentFailureToasts.get(serviceName) || 0;
    if (now - lastToast > 8000) {
      recentFailureToasts.set(serviceName, now);
      store.dispatch(
        showToast({
          message: `${serviceName} connection retried and failed. Displaying cached/fallback data.`,
          type: 'sale',
          duration: 4000,
        })
      );
    }

    throw err;
  }
}
