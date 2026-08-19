/**
 * engine.js
 * Core state management, tick calculations, economic formulas, and milestone unlock engine.
 */

import { ERAS, GENERATORS, MILESTONES, PARADIGMS, SINGULARITY_EVENT } from './historyData.js';

export const SAVE_STORAGE_KEY = 'incremental_ai_save_v1';
export const SAVE_SCHEMA_VERSION = 1;

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

    // Replayability & AI Paradigm Focus (v1.7.0)
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

    this.lastTickTime = performance.now();
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
  // ECONOMIC & MULTIPLIER CALCULATIONS
  // ==========================================

  getClickPower() {
    let baseClick = 1;
    let multiplier = 1;

    // Cybernetics Paradigm: 8x active Think click power
    if (this.activeParadigmId === 'paradigm_cybernetic') {
      multiplier *= 8;
    }

    for (const msId of this.unlockedMilestones) {
      const ms = MILESTONES.find(m => m.id === msId);
      if (ms && ms.effects && ms.effects.clickMultiplier) {
        multiplier *= ms.effects.clickMultiplier;
      }
    }

    return baseClick * multiplier;
  }

  getGlobalMultiplier() {
    let globalMult = 1;

    // Paradigm Global Modifiers
    if (this.activeParadigmId === 'paradigm_probabilistic') {
      // Compounding 4% per unlocked milestone
      globalMult *= Math.pow(1.04, this.unlockedMilestones.size);
    } else if (this.activeParadigmId === 'paradigm_connectionist') {
      globalMult *= 1.35;
    } else if (this.activeParadigmId === 'paradigm_symbolic') {
      globalMult *= 1.25;
    }

    for (const msId of this.unlockedMilestones) {
      const ms = MILESTONES.find(m => m.id === msId);
      if (ms && ms.effects && ms.effects.globalMultiplier) {
        globalMult *= ms.effects.globalMultiplier;
      }
    }
    return globalMult;
  }

  getGeneratorMultiplier(generatorId) {
    let genMult = 1;
    const gen = GENERATORS.find(g => g.id === generatorId);

    // Symbolic Paradigm: +150% output (2.5x) for Epochs 1-3
    if (this.activeParadigmId === 'paradigm_symbolic' && gen && gen.eraId <= 3) {
      genMult *= 2.5;
    }

    // Cybernetics Paradigm: Active click burst grants +50% (1.5x) to hardware
    if (this.activeParadigmId === 'paradigm_cybernetic' && this.cyberneticBoostTimer > 0) {
      genMult *= 1.5;
    }

    for (const msId of this.unlockedMilestones) {
      const ms = MILESTONES.find(m => m.id === msId);
      if (ms && ms.effects && ms.effects.generatorBonus) {
        if (ms.effects.generatorBonus.generatorId === generatorId) {
          let factor = ms.effects.generatorBonus.factor;
          // Connectionist Paradigm: 40% boosted milestone synergies
          if (this.activeParadigmId === 'paradigm_connectionist') {
            factor *= 1.4;
          }
          genMult *= factor;
        }
      }
    }
    return genMult;
  }

  getGeneratorRate(generatorId) {
    const gen = GENERATORS.find(g => g.id === generatorId);
    if (!gen) return 0;
    const count = this.generators[generatorId] || 0;
    if (count === 0) return 0;

    const baseOutput = gen.baseRate * count;
    const specificMult = this.getGeneratorMultiplier(generatorId);
    const globalMult = this.getGlobalMultiplier();

    return baseOutput * specificMult * globalMult;
  }

  getTotalRate() {
    let total = 0;
    for (const gen of GENERATORS) {
      total += this.getGeneratorRate(gen.id);
    }
    return total;
  }

  getGeneratorBaseCost(generatorId) {
    const gen = GENERATORS.find(g => g.id === generatorId);
    if (!gen) return Infinity;

    let baseCost = gen.baseCost;

    // Cybernetics Paradigm: 25% discount across all generators
    if (this.activeParadigmId === 'paradigm_cybernetic') {
      baseCost *= 0.75;
    }
    // Connectionist Paradigm: 30% discount for mid-to-late Epochs 4-7
    else if (this.activeParadigmId === 'paradigm_connectionist' && gen.eraId >= 4) {
      baseCost *= 0.70;
    }

    return Math.floor(baseCost);
  }

  getGeneratorCost(generatorId, amount = 1) {
    const gen = GENERATORS.find(g => g.id === generatorId);
    if (!gen) return Infinity;

    const baseCost = this.getGeneratorBaseCost(generatorId);
    const currentCount = this.generators[generatorId] || 0;

    if (amount === 1) {
      return Math.floor(baseCost * Math.pow(1.15, currentCount));
    }

    if (typeof amount === 'number' && amount > 1) {
      let totalCost = 0;
      for (let i = 0; i < amount; i++) {
        totalCost += Math.floor(baseCost * Math.pow(1.15, currentCount + i));
      }
      return totalCost;
    }

    if (amount === 'max') {
      let maxAffordable = 0;
      let totalCost = 0;
      let tempInsights = this.insights;

      while (true) {
        const nextCost = Math.floor(baseCost * Math.pow(1.15, currentCount + maxAffordable));
        if (tempInsights >= nextCost) {
          tempInsights -= nextCost;
          totalCost += nextCost;
          maxAffordable++;
        } else {
          break;
        }
      }

      return { count: Math.max(1, maxAffordable), cost: totalCost, canAffordAny: maxAffordable > 0 };
    }

    return Infinity;
  }

  getMilestoneCost(milestoneId) {
    const ms = MILESTONES.find(m => m.id === milestoneId);
    if (!ms) return Infinity;

    let cost = ms.cost;

    // Symbolic Paradigm: 35% discount on early Epochs 1-3 milestones
    if (this.activeParadigmId === 'paradigm_symbolic' && ms.eraId <= 3) {
      cost *= 0.65;
    }
    // Probabilistic Paradigm: 20% discount on all milestones throughout history
    else if (this.activeParadigmId === 'paradigm_probabilistic') {
      cost *= 0.80;
    }

    return Math.floor(cost);
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
  // SERIALIZATION & PERSISTENCE
  // ==========================================

  serializeState() {
    return {
      saveVersion: SAVE_SCHEMA_VERSION,
      timestamp: Date.now(),
      meta: {
        replayCount: this.replayCount || 0,
        completedParadigms: Array.from(this.completedParadigms || []),
        hasEverUnlockedSingularity: !!this.hasEverUnlockedSingularity,
        hasAchievedSingularity: !!this.hasAchievedSingularity
      },
      run: {
        insights: typeof this.insights === 'number' && !isNaN(this.insights) ? this.insights : 0,
        totalInsightsEarned: typeof this.totalInsightsEarned === 'number' && !isNaN(this.totalInsightsEarned) ? this.totalInsightsEarned : 0,
        currentEraId: this.currentEraId || 1,
        generators: { ...this.generators },
        unlockedMilestones: Array.from(this.unlockedMilestones || []),
        bulkBuyMode: this.bulkBuyMode || 1,
        selectedMilestoneId: this.selectedMilestoneId || "ms_talos",
        activeParadigmId: this.activeParadigmId || null,
        cyberneticBoostTimer: typeof this.cyberneticBoostTimer === 'number' ? Math.max(0, this.cyberneticBoostTimer) : 0
      }
    };
  }

  loadState(saveData) {
    if (!saveData || typeof saveData !== 'object') return false;

    try {
      // 1. Meta Heritage Restoration (persists across runs/clears)
      if (saveData.meta && typeof saveData.meta === 'object') {
        this.replayCount = Number(saveData.meta.replayCount) || 0;
        this.completedParadigms = new Set(
          Array.isArray(saveData.meta.completedParadigms)
            ? saveData.meta.completedParadigms.filter(id => PARADIGMS.some(p => p.id === id))
            : []
        );
        this.hasEverUnlockedSingularity = !!saveData.meta.hasEverUnlockedSingularity;
        this.hasAchievedSingularity = !!saveData.meta.hasAchievedSingularity;
      }

      // 2. Active Run State Restoration
      if (saveData.run && typeof saveData.run === 'object') {
        const run = saveData.run;
        this.insights = typeof run.insights === 'number' && !isNaN(run.insights) ? Math.max(0, run.insights) : 0;
        this.totalInsightsEarned = typeof run.totalInsightsEarned === 'number' && !isNaN(run.totalInsightsEarned) ? Math.max(0, run.totalInsightsEarned) : 0;
        this.currentEraId = typeof run.currentEraId === 'number' ? Math.max(1, Math.min(run.currentEraId, 7)) : 1;

        // Restore generators
        GENERATORS.forEach(g => {
          const count = run.generators && typeof run.generators[g.id] === 'number' ? Math.max(0, Math.floor(run.generators[g.id])) : 0;
          this.generators[g.id] = count;
        });

        // Restore milestones
        this.unlockedMilestones = new Set(
          Array.isArray(run.unlockedMilestones)
            ? run.unlockedMilestones.filter(id => MILESTONES.some(m => m.id === id))
            : []
        );

        this.bulkBuyMode = [1, 10, 'max'].includes(run.bulkBuyMode) ? run.bulkBuyMode : 1;
        this.selectedMilestoneId = typeof run.selectedMilestoneId === 'string' && MILESTONES.some(m => m.id === run.selectedMilestoneId)
          ? run.selectedMilestoneId
          : "ms_talos";
        this.activeParadigmId = typeof run.activeParadigmId === 'string' && PARADIGMS.some(p => p.id === run.activeParadigmId)
          ? run.activeParadigmId
          : null;
        this.cyberneticBoostTimer = typeof run.cyberneticBoostTimer === 'number' ? Math.max(0, run.cyberneticBoostTimer) : 0;
      }

      this.emit('stateChange');
      return true;
    } catch (e) {
      console.warn('Could not deserialize save state:', e);
      return false;
    }
  }

  saveToStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const serialized = JSON.stringify(this.serializeState());
      window.localStorage.setItem(SAVE_STORAGE_KEY, serialized);
      return true;
    } catch (e) {
      console.warn('Auto-save to localStorage failed:', e);
      return false;
    }
  }

  loadFromStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return this.loadState(parsed);
    } catch (e) {
      console.warn('Auto-load from localStorage failed:', e);
      return false;
    }
  }

  purgeAllData() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(SAVE_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Purge localStorage failed:', e);
    }

    // Reset all runtime state to clean initial defaults
    this.insights = 0;
    this.totalInsightsEarned = 0;
    this.currentEraId = 1;
    this.unlockedMilestones.clear();
    this.completedParadigms.clear();
    this.activeParadigmId = null;
    this.replayCount = 0;
    this.hasAchievedSingularity = false;
    this.hasEverUnlockedSingularity = false;
    this.cyberneticBoostTimer = 0;
    this.selectedMilestoneId = "ms_talos";
    this.bulkBuyMode = 1;

    GENERATORS.forEach(g => {
      this.generators[g.id] = 0;
    });

    this.initStartingEra();
    this.emit('stateChange');
    return true;
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

