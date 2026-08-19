/**
 * offline.js
 * "While You Were Away" offline progression calculations and 4-hour cap enforcement.
 */

import { MAX_OFFLINE_SECONDS } from './constants.js';

export function calculateOfflineProgress(engine, savedTimestamp = engine.lastSaveTimestamp) {
  if (!savedTimestamp || typeof savedTimestamp !== 'number' || isNaN(savedTimestamp)) {
    return { offlineGain: 0, elapsedSeconds: 0, rawElapsedSeconds: 0, isCapped: false, rate: 0 };
  }

  const now = Date.now();
  const rawElapsedSeconds = Math.max(0, (now - savedTimestamp) / 1000);

  // Ignore micro gaps (< 5s, e.g. quick page refresh) to avoid noisy notifications
  if (rawElapsedSeconds < 5) {
    return {
      offlineGain: 0,
      elapsedSeconds: rawElapsedSeconds,
      rawElapsedSeconds,
      isCapped: false,
      rate: engine.getTotalRate()
    };
  }

  const elapsedSeconds = Math.min(rawElapsedSeconds, MAX_OFFLINE_SECONDS);
  const rate = engine.getTotalRate();
  const offlineGain = rate * elapsedSeconds;

  return {
    offlineGain: Math.max(0, offlineGain),
    elapsedSeconds,
    rawElapsedSeconds,
    isCapped: rawElapsedSeconds > MAX_OFFLINE_SECONDS,
    rate
  };
}
