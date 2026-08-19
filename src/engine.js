/**
 * engine.js
 * Core state management, tick calculations, economic formulas, and milestone unlock engine.
 */

import { ERAS, GENERATORS, MILESTONES } from './historyData.js';

export const VERSION = '1.0.0';

export class GameEngine {
  constructor() {
    this.version = VERSION;
    this.insights = 0;
    this.totalInsightsEarned = 0;
    this.currentEraId = 1;
    this.generators = {}; // generatorId -> count
    this.unlockedMilestones = new Set(); // milestoneId
    this.bulkBuyMode = 1; // 1, 10, or 'max'
    this.selectedMilestoneId = "ms_talos"; // Default selected milestone for Codex

    // Event listeners
    this.listeners = {
      stateChange: [],
      eraUnlock: [],
      milestoneUnlock: []
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
  // ECONOMIC & MULTIPLIER CALCULATIONS
  // ==========================================

  getClickPower() {
    let baseClick = 1;
    let multiplier = 1;

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
    for (const msId of this.unlockedMilestones) {
      const ms = MILESTONES.find(m => m.id === msId);
      if (ms && ms.effects && ms.effects.generatorBonus) {
        if (ms.effects.generatorBonus.generatorId === generatorId) {
          genMult *= ms.effects.generatorBonus.factor;
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

  getGeneratorCost(generatorId, amount = 1) {
    const gen = GENERATORS.find(g => g.id === generatorId);
    if (!gen) return Infinity;

    const currentCount = this.generators[generatorId] || 0;

    if (amount === 1) {
      return Math.floor(gen.baseCost * Math.pow(1.15, currentCount));
    }

    if (typeof amount === 'number' && amount > 1) {
      let totalCost = 0;
      for (let i = 0; i < amount; i++) {
        totalCost += Math.floor(gen.baseCost * Math.pow(1.15, currentCount + i));
      }
      return totalCost;
    }

    if (amount === 'max') {
      let maxAffordable = 0;
      let totalCost = 0;
      let tempInsights = this.insights;

      while (true) {
        const nextCost = Math.floor(gen.baseCost * Math.pow(1.15, currentCount + maxAffordable));
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

  // ==========================================
  // GAME ACTIONS
  // ==========================================

  clickInsight() {
    const clickGain = this.getClickPower();
    this.insights += clickGain;
    this.totalInsightsEarned += clickGain;
    this.checkEraProgression();
    this.emit('stateChange');
    return clickGain;
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

    if (this.insights >= ms.cost) {
      this.insights -= ms.cost;
      this.unlockedMilestones.add(milestoneId);
      this.selectedMilestoneId = milestoneId;
      this.checkEraProgression();
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
    if (nextEra && this.totalInsightsEarned >= nextEra.unlockThreshold) {
      // Check if player has at least unlocked 2 milestones of current era to encourage educational reading
      const currentEraMilestones = MILESTONES.filter(m => m.eraId === this.currentEraId);
      const unlockedCount = currentEraMilestones.filter(m => this.unlockedMilestones.has(m.id)).length;

      // Era transition
      if (unlockedCount >= Math.min(2, currentEraMilestones.length) || this.totalInsightsEarned >= nextEra.unlockThreshold * 2) {
        this.currentEraId = nextEra.id;
        this.emit('eraUnlock', nextEra);
      }
    }
  }

  // ==========================================
  // TICK LOOP
  // ==========================================

  tick(currentTime) {
    const deltaMs = currentTime - this.lastTickTime;
    this.lastTickTime = currentTime;

    // Clamp delta time to max 1.0s to prevent explosion if tab was backgrounded
    const deltaSeconds = Math.min(deltaMs / 1000, 1.0);

    if (deltaSeconds > 0) {
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
