/**
 * engine.js
 * Core state management, tick loop, and game action orchestrator.
 * Delegates economic formulas, persistence, and offline progression to modular helpers.
 */

import { ERAS, GENERATORS, MILESTONES, PARADIGMS, SINGULARITY_EVENT } from './data/index.js';
import {
  SAVE_STORAGE_KEY,
  SAVE_SCHEMA_VERSION,
  MAX_OFFLINE_SECONDS,
  calculateClickPower,
  calculateGlobalMultiplier,
  calculateGeneratorMultiplier,
  calculateGeneratorRate,
  calculateTotalRate,
  calculateGeneratorBaseCost,
  calculateGeneratorCost,
  calculateMilestoneCost,
  serializeEngineState,
  deserializeEngineState,
  saveEngineToStorage,
  loadEngineFromStorage,
  purgeEngineStorage,
  calculateOfflineProgress as computeOfflineProgress
} from './engine/index.js';

export { SAVE_STORAGE_KEY, SAVE_SCHEMA_VERSION, MAX_OFFLINE_SECONDS };

export class GameEngine {
  constructor() {
    this.version = null;
    this.insights = 0;
    this.totalInsightsEarned = 0;
    this.currentEraId = 1;
    this.generators = {}; // generatorId -> count
    this.unlockedMilestones = new Set(); // milestoneId
    this.bulkBuyMode = 1; // 1, 10, or 'max'
    this.selectedMilestoneId = "ms_talos"; // Default selected milestone for Codex
    this.lastSaveTimestamp = null; // Timestamp of loaded save for offline earnings calculation

    // Replayability & AI Paradigm Focus
    this.activeParadigmId = null; // null for Standard Run, or paradigm_* id
    this.completedParadigms = new Set();
    this.replayCount = 0;
    this.hasAchievedSingularity = false;
    this.hasEverUnlockedSingularity = false; // Remains true permanently once cleared
    this.cyberneticBoostTimer = 0; // seconds remaining for cybernetic click burst

    // Event listeners
    this.listeners = {
      stateChange: [],
      eraUnlock: [],
      milestoneUnlock: [],
      singularityReached: [],
      paradigmShift: []
    };

    // Initialize generators
    GENERATORS.forEach(g => {
      this.generators[g.id] = 0;
    });

    this.lastTickTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  }

  // Subscribe to engine events
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // ==========================================
  // PARADIGM & DOCTRINE ACCESSORS
  // ==========================================

  getActiveParadigm() {
    if (!this.activeParadigmId) return null;
    return PARADIGMS.find(p => p.id === this.activeParadigmId) || null;
  }

  canTriggerParadigmShift() {
    return this.hasEverUnlockedSingularity || this.hasAchievedSingularity || this.replayCount > 0 || this.completedParadigms.size > 0;
  }

  // ==========================================
  // ECONOMIC & MULTIPLIER ACCESSORS (DELEGATED)
  // ==========================================

  getClickPower() {
    return calculateClickPower(this);
  }

  getGlobalMultiplier() {
    return calculateGlobalMultiplier(this);
  }

  getGeneratorMultiplier(generatorId) {
    return calculateGeneratorMultiplier(this, generatorId);
  }

  getGeneratorRate(generatorId) {
    return calculateGeneratorRate(this, generatorId);
  }

  getTotalRate() {
    return calculateTotalRate(this);
  }

  getGeneratorBaseCost(generatorId) {
    return calculateGeneratorBaseCost(this, generatorId);
  }

  getGeneratorCost(generatorId, amount = 1) {
    return calculateGeneratorCost(this, generatorId, amount);
  }

  getMilestoneCost(milestoneId) {
    return calculateMilestoneCost(this, milestoneId);
  }

  // ==========================================
  // GAME ACTIONS
  // ==========================================

  clickInsight() {
    const clickGain = this.getClickPower();
    this.insights += clickGain;
    this.totalInsightsEarned += clickGain;

    // Cybernetics active boost refresh
    if (this.activeParadigmId === 'paradigm_cybernetic') {
      this.cyberneticBoostTimer = 15.0; // 15 seconds boost refreshed on click
    }

    this.checkEraProgression();
    this.emit('stateChange');
    return clickGain;
  }

  multiplyInsights(factor = 10) {
    // If current insights is 0, give an initial boost of 10 for rapid test start
    const gain = this.insights > 0 ? this.insights * (factor - 1) : 10;
    this.insights += gain;
    this.totalInsightsEarned += gain;
    this.checkEraProgression();
    this.emit('stateChange');
    return this.insights;
  }

  doubleInsights() {
    return this.multiplyInsights(10);
  }

  setBulkBuyMode(mode) {
    this.bulkBuyMode = mode;
    this.emit('stateChange');
  }

  buyGenerator(generatorId) {
    const gen = GENERATORS.find(g => g.id === generatorId);
    if (!gen) return false;

    if (this.bulkBuyMode === 'max') {
      const maxInfo = this.getGeneratorCost(generatorId, 'max');
      if (maxInfo.canAffordAny && this.insights >= maxInfo.cost) {
        this.insights -= maxInfo.cost;
        this.generators[generatorId] = (this.generators[generatorId] || 0) + maxInfo.count;
        this.saveToStorage();
        this.emit('stateChange');
        return true;
      }
      return false;
    }

    const buyCount = typeof this.bulkBuyMode === 'number' ? this.bulkBuyMode : 1;
    const cost = this.getGeneratorCost(generatorId, buyCount);

    if (this.insights >= cost) {
      this.insights -= cost;
      this.generators[generatorId] = (this.generators[generatorId] || 0) + buyCount;
      this.saveToStorage();
      this.emit('stateChange');
      return true;
    }

    return false;
  }

  isMilestoneAvailable(milestoneId) {
    const ms = MILESTONES.find(m => m.id === milestoneId);
    if (!ms) return false;
    if (this.unlockedMilestones.has(milestoneId)) return false;

    // Check prerequisites
    for (const prereqId of ms.prerequisites) {
      if (!this.unlockedMilestones.has(prereqId)) {
        return false;
      }
    }

    // Must be in the era of the milestone or past it
    return this.currentEraId >= ms.eraId;
  }

  buyMilestone(milestoneId) {
    const ms = MILESTONES.find(m => m.id === milestoneId);
    if (!ms) return false;
    if (!this.isMilestoneAvailable(milestoneId)) return false;

    const cost = this.getMilestoneCost(milestoneId);
    if (this.insights >= cost) {
      this.insights -= cost;
      this.unlockedMilestones.add(milestoneId);
      this.selectedMilestoneId = milestoneId;
      this.checkEraProgression();
      this.saveToStorage();
      this.emit('milestoneUnlock', ms);
      this.emit('stateChange');
      return true;
    }

    return false;
  }

  selectMilestone(milestoneId) {
    this.selectedMilestoneId = milestoneId;
    this.emit('stateChange');
  }

  checkEraProgression() {
    const nextEra = ERAS.find(e => e.id === this.currentEraId + 1);
    if (nextEra) {
      // Era advances strictly when all milestones of the current era are discovered
      const currentEraMilestones = MILESTONES.filter(m => m.eraId === this.currentEraId);
      const allMilestonesUnlocked = currentEraMilestones.length > 0 && currentEraMilestones.every(m => this.unlockedMilestones.has(m.id));

      if (allMilestonesUnlocked) {
        this.currentEraId = nextEra.id;
        this.emit('eraUnlock', nextEra);
        // Recursively check in case subsequent era milestones were already satisfied
        this.checkEraProgression();
      }
    }

    // Check for Technological Singularity (All 28 Milestones Unlocked / Epoch 7 complete)
    const finalEraMilestones = MILESTONES.filter(m => m.eraId === 7);
    const allFinalUnlocked = finalEraMilestones.length > 0 && finalEraMilestones.every(m => this.unlockedMilestones.has(m.id));

    if (allFinalUnlocked && !this.hasAchievedSingularity) {
      this.hasAchievedSingularity = true;
      this.hasEverUnlockedSingularity = true;
      this.emit('singularityReached', SINGULARITY_EVENT);
    }
  }

  initStartingEra() {
    const initialEra = ERAS.find(e => e.id === this.currentEraId) || ERAS[0];
    this.emit('eraUnlock', initialEra);
  }

  // ==========================================
  // PARADIGM SHIFT (SINGULARITY REPLAY)
  // ==========================================

  triggerParadigmShift(paradigmId = null) {
    this.insights = 0;
    this.totalInsightsEarned = 0;
    this.currentEraId = 1;
    this.unlockedMilestones.clear();

    GENERATORS.forEach(g => {
      this.generators[g.id] = 0;
    });

    this.activeParadigmId = paradigmId;
    if (paradigmId) {
      this.completedParadigms.add(paradigmId);
    }

    this.replayCount++;
    this.hasEverUnlockedSingularity = true;
    this.hasAchievedSingularity = false;
    this.cyberneticBoostTimer = 0;
    this.selectedMilestoneId = "ms_talos";

    this.emit('paradigmShift', {
      paradigmId: this.activeParadigmId,
      replayCount: this.replayCount
    });

    this.initStartingEra();
    this.saveToStorage();
    this.emit('stateChange');
    return true;
  }

  // Pre-clear standard timeline reset
  resetTimeline() {
    this.insights = 0;
    this.totalInsightsEarned = 0;
    this.currentEraId = 1;
    this.unlockedMilestones.clear();

    GENERATORS.forEach(g => {
      this.generators[g.id] = 0;
    });

    this.cyberneticBoostTimer = 0;
    this.selectedMilestoneId = "ms_talos";

    this.initStartingEra();
    this.saveToStorage();
    this.emit('stateChange');
    return true;
  }

  // ==========================================
  // SERIALIZATION & PERSISTENCE (DELEGATED)
  // ==========================================

  serializeState() {
    return serializeEngineState(this);
  }

  loadState(saveData) {
    return deserializeEngineState(this, saveData);
  }

  saveToStorage() {
    return saveEngineToStorage(this);
  }

  loadFromStorage() {
    return loadEngineFromStorage(this);
  }

  purgeAllData() {
    return purgeEngineStorage(this);
  }

  // ==========================================
  // OFFLINE PROGRESSION (DELEGATED)
  // ==========================================

  calculateOfflineProgress(savedTimestamp = this.lastSaveTimestamp) {
    return computeOfflineProgress(this, savedTimestamp);
  }

  // ==========================================
  // TICK LOOP
  // ==========================================

  tick(currentTime = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
    if (typeof currentTime !== 'number' || isNaN(currentTime)) {
      currentTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    }

    if (typeof this.lastTickTime !== 'number' || isNaN(this.lastTickTime) || this.lastTickTime <= 0) {
      this.lastTickTime = currentTime;
      return;
    }

    const deltaMs = currentTime - this.lastTickTime;
    this.lastTickTime = currentTime;

    // Clamp delta time between 0.0s and 1.0s to prevent explosion or negative drift
    const deltaSeconds = Math.max(0, Math.min(deltaMs / 1000, 1.0));

    if (deltaSeconds > 0) {
      // Decrement cybernetics boost timer if active
      if (this.cyberneticBoostTimer > 0) {
        this.cyberneticBoostTimer = Math.max(0, this.cyberneticBoostTimer - deltaSeconds);
      }

      const passiveRate = this.getTotalRate();
      const passiveGain = passiveRate * deltaSeconds;

      if (passiveGain > 0) {
        this.insights += passiveGain;
        this.totalInsightsEarned += passiveGain;
        this.checkEraProgression();
      }
    }
  }
}
