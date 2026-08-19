/**
 * formatters.js
 * Number formatting, duration humanization, and debug environment detection.
 */

export function isDebugModeActive() {
  if (typeof window === 'undefined') return false;
  const isLocal = ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
  const urlParams = new URLSearchParams(window.location.search);
  const hasDebugParam = urlParams.get('debug') === 'true' || urlParams.get('debug') === '1' || window.location.hash === '#debug';
  return isLocal && hasDebugParam;
}

export function formatNumber(num, decimals = 1) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  if (num < 1000) {
    return Number.isInteger(num) ? num.toString() : num.toFixed(decimals);
  }

  const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
  const i = Math.floor(Math.log10(num) / 3);
  const suffixIndex = Math.min(i, suffixes.length - 1);

  const formatted = (num / Math.pow(10, suffixIndex * 3)).toFixed(decimals);
  return `${formatted} ${suffixes[suffixIndex]}`;
}

export function formatDuration(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '0s';
  const s = Math.floor(totalSeconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const remS = s % 60;
  if (m < 60) {
    return remS > 0 ? `${m}m ${remS}s` : `${m}m`;
  }
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return remM > 0 ? `${h}h ${remM}m` : `${h}h`;
}

/**
 * Dispatch a custom telemetry event to Google Analytics (GA4) if available.
 * Fails safely in offline, sandboxed, or test environments.
 * @param {string} eventName
 * @param {Object} [params={}]
 */
export function trackAnalyticsEvent(eventName, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (_err) {
    // Fail silently
  }
}

