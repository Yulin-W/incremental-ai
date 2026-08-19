/**
 * storage.js
 * Serialization, deserialization, data sanitization, and localStorage persistence.
 */

import { SAVE_STORAGE_KEY, SAVE_SCHEMA_VERSION } from './constants.js';
import { GENERATORS, MILESTONES, PARADIGMS } from '../data/index.js';

export function serializeEngineState(engine) {
  return {
    saveVersion: SAVE_SCHEMA_VERSION,
    timestamp: Date.now(),
    meta: {
      replayCount: engine.replayCount || 0,
      completedParadigms: Array.from(engine.completedParadigms || []),
      hasEverUnlockedSingularity: !!engine.hasEverUnlockedSingularity,
      hasAchievedSingularity: !!engine.hasAchievedSingularity
    },
    run: {
      insights: typeof engine.insights === 'number' && !isNaN(engine.insights) ? engine.insights : 0,
      totalInsightsEarned: typeof engine.totalInsightsEarned === 'number' && !isNaN(engine.totalInsightsEarned) ? engine.totalInsightsEarned : 0,
      currentEraId: engine.currentEraId || 1,
      generators: { ...engine.generators },
      unlockedMilestones: Array.from(engine.unlockedMilestones || []),
      bulkBuyMode: engine.bulkBuyMode || 1,
      selectedMilestoneId: engine.selectedMilestoneId || "ms_talos",
      activeParadigmId: engine.activeParadigmId || null,
      cyberneticBoostTimer: typeof engine.cyberneticBoostTimer === 'number' ? Math.max(0, engine.cyberneticBoostTimer) : 0
    }
  };
}

export function deserializeEngineState(engine, saveData) {
  if (!saveData || typeof saveData !== 'object') return false;

  try {
    // 1. Meta Heritage Restoration (persists across runs/clears)
    if (saveData.meta && typeof saveData.meta === 'object') {
      engine.replayCount = Number(saveData.meta.replayCount) || 0;
      engine.completedParadigms = new Set(
        Array.isArray(saveData.meta.completedParadigms)
          ? saveData.meta.completedParadigms.filter(id => PARADIGMS.some(p => p.id === id))
          : []
      );
      engine.hasEverUnlockedSingularity = !!saveData.meta.hasEverUnlockedSingularity;
      engine.hasAchievedSingularity = !!saveData.meta.hasAchievedSingularity;
    }

    // 2. Active Run State Restoration
    if (saveData.run && typeof saveData.run === 'object') {
      const run = saveData.run;
      engine.insights = typeof run.insights === 'number' && !isNaN(run.insights) ? Math.max(0, run.insights) : 0;
      engine.totalInsightsEarned = typeof run.totalInsightsEarned === 'number' && !isNaN(run.totalInsightsEarned) ? Math.max(0, run.totalInsightsEarned) : 0;
      engine.currentEraId = typeof run.currentEraId === 'number' ? Math.max(1, Math.min(run.currentEraId, 7)) : 1;

      // Restore generators
      GENERATORS.forEach(g => {
        const count = run.generators && typeof run.generators[g.id] === 'number' ? Math.max(0, Math.floor(run.generators[g.id])) : 0;
        engine.generators[g.id] = count;
      });

      // Restore milestones
      engine.unlockedMilestones = new Set(
        Array.isArray(run.unlockedMilestones)
          ? run.unlockedMilestones.filter(id => MILESTONES.some(m => m.id === id))
          : []
      );

      engine.bulkBuyMode = [1, 10, 'max'].includes(run.bulkBuyMode) ? run.bulkBuyMode : 1;
      engine.selectedMilestoneId = typeof run.selectedMilestoneId === 'string' && MILESTONES.some(m => m.id === run.selectedMilestoneId)
        ? run.selectedMilestoneId
        : "ms_talos";
      engine.activeParadigmId = typeof run.activeParadigmId === 'string' && PARADIGMS.some(p => p.id === run.activeParadigmId)
        ? run.activeParadigmId
        : null;
      engine.cyberneticBoostTimer = typeof run.cyberneticBoostTimer === 'number' ? Math.max(0, run.cyberneticBoostTimer) : 0;
    }

    // Record timestamp of loaded save state
    engine.lastSaveTimestamp = typeof saveData.timestamp === 'number' && !isNaN(saveData.timestamp)
      ? saveData.timestamp
      : null;

    engine.emit('stateChange');
    return true;
  } catch (e) {
    console.warn('Could not deserialize save state:', e);
    return false;
  }
}

export function saveEngineToStorage(engine) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const serialized = JSON.stringify(serializeEngineState(engine));
    window.localStorage.setItem(SAVE_STORAGE_KEY, serialized);
    return true;
  } catch (e) {
    console.warn('Auto-save to localStorage failed:', e);
    return false;
  }
}

export function loadEngineFromStorage(engine) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return deserializeEngineState(engine, parsed);
  } catch (e) {
    console.warn('Auto-load from localStorage failed:', e);
    return false;
  }
}

export function purgeEngineStorage(engine) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(SAVE_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Purge localStorage failed:', e);
  }

  // Reset all runtime state to clean initial defaults
  engine.insights = 0;
  engine.totalInsightsEarned = 0;
  engine.currentEraId = 1;
  engine.unlockedMilestones.clear();
  engine.completedParadigms.clear();
  engine.activeParadigmId = null;
  engine.replayCount = 0;
  engine.hasAchievedSingularity = false;
  engine.hasEverUnlockedSingularity = false;
  engine.cyberneticBoostTimer = 0;
  engine.selectedMilestoneId = "ms_talos";
  engine.bulkBuyMode = 1;
  engine.lastSaveTimestamp = null;

  GENERATORS.forEach(g => {
    engine.generators[g.id] = 0;
  });

  engine.emit('stateChange');
  return true;
}
