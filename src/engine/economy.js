/**
 * economy.js
 * Economic formulas, compound multiplier calculations, and generator/milestone pricing.
 */

import { GENERATORS, MILESTONES } from '../data/index.js';

export function calculateClickPower(engine) {
  let baseClick = 1;
  let multiplier = 1;

  // Cybernetics Paradigm: 8x active Think click power
  if (engine.activeParadigmId === 'paradigm_cybernetic') {
    multiplier *= 8;
  }

  for (const msId of engine.unlockedMilestones) {
    const ms = MILESTONES.find(m => m.id === msId);
    if (ms && ms.effects && ms.effects.clickMultiplier) {
      multiplier *= ms.effects.clickMultiplier;
    }
  }

  return baseClick * multiplier;
}

export function calculateGlobalMultiplier(engine) {
  let globalMult = 1;

  // Paradigm Global Modifiers
  if (engine.activeParadigmId === 'paradigm_probabilistic') {
    // Compounding 4% per unlocked milestone
    globalMult *= Math.pow(1.04, engine.unlockedMilestones.size);
  } else if (engine.activeParadigmId === 'paradigm_connectionist') {
    globalMult *= 1.35;
  } else if (engine.activeParadigmId === 'paradigm_symbolic') {
    globalMult *= 1.25;
  }

  for (const msId of engine.unlockedMilestones) {
    const ms = MILESTONES.find(m => m.id === msId);
    if (ms && ms.effects && ms.effects.globalMultiplier) {
      globalMult *= ms.effects.globalMultiplier;
    }
  }
  return globalMult;
}

export function calculateGeneratorMultiplier(engine, generatorId) {
  let genMult = 1;
  const gen = GENERATORS.find(g => g.id === generatorId);

  // Symbolic Paradigm: +150% output (2.5x) for Epochs 1-3
  if (engine.activeParadigmId === 'paradigm_symbolic' && gen && gen.eraId <= 3) {
    genMult *= 2.5;
  }

  // Cybernetics Paradigm: Active click burst grants +50% (1.5x) to hardware
  if (engine.activeParadigmId === 'paradigm_cybernetic' && engine.cyberneticBoostTimer > 0) {
    genMult *= 1.5;
  }

  for (const msId of engine.unlockedMilestones) {
    const ms = MILESTONES.find(m => m.id === msId);
    if (ms && ms.effects && ms.effects.generatorBonus) {
      if (ms.effects.generatorBonus.generatorId === generatorId) {
        let factor = ms.effects.generatorBonus.factor;
        // Connectionist Paradigm: 40% boosted milestone synergies
        if (engine.activeParadigmId === 'paradigm_connectionist') {
          factor *= 1.4;
        }
        genMult *= factor;
      }
    }
  }
  return genMult;
}

export function calculateGeneratorRate(engine, generatorId) {
  const gen = GENERATORS.find(g => g.id === generatorId);
  if (!gen) return 0;
  const count = engine.generators[generatorId] || 0;
  if (count === 0) return 0;

  const baseOutput = gen.baseRate * count;
  const specificMult = calculateGeneratorMultiplier(engine, generatorId);
  const globalMult = calculateGlobalMultiplier(engine);

  return baseOutput * specificMult * globalMult;
}

export function calculateTotalRate(engine) {
  let total = 0;
  for (const gen of GENERATORS) {
    total += calculateGeneratorRate(engine, gen.id);
  }
  return total;
}

export function calculateGeneratorBaseCost(engine, generatorId) {
  const gen = GENERATORS.find(g => g.id === generatorId);
  if (!gen) return Infinity;

  let baseCost = gen.baseCost;

  // Cybernetics Paradigm: 25% discount across all generators
  if (engine.activeParadigmId === 'paradigm_cybernetic') {
    baseCost *= 0.75;
  }
  // Connectionist Paradigm: 30% discount for mid-to-late Epochs 4-7
  else if (engine.activeParadigmId === 'paradigm_connectionist' && gen.eraId >= 4) {
    baseCost *= 0.70;
  }

  return Math.floor(baseCost);
}

export function calculateGeneratorCost(engine, generatorId, amount = 1) {
  const gen = GENERATORS.find(g => g.id === generatorId);
  if (!gen) return Infinity;

  const baseCost = calculateGeneratorBaseCost(engine, generatorId);
  const currentCount = engine.generators[generatorId] || 0;

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
    let tempInsights = engine.insights;

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

export function calculateMilestoneCost(engine, milestoneId) {
  const ms = MILESTONES.find(m => m.id === milestoneId);
  if (!ms) return Infinity;

  let cost = ms.cost;

  // Symbolic Paradigm: 35% discount on early Epochs 1-3 milestones
  if (engine.activeParadigmId === 'paradigm_symbolic' && ms.eraId <= 3) {
    cost *= 0.65;
  }
  // Probabilistic Paradigm: 20% discount on all milestones throughout history
  else if (engine.activeParadigmId === 'paradigm_probabilistic') {
    cost *= 0.80;
  }

  return Math.floor(cost);
}
