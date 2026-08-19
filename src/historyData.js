/**
 * historyData.js
 * Central historical database and schema aggregator for Incremental AI.
 * Re-exports modular datasets from ./data/ for clean architecture and 100% backward compatibility.
 */

export { EPOCHS, ERAS } from './data/epochs.js';
export { GENERATORS } from './data/generators.js';
export { MILESTONES } from './data/milestones.js';
export { EPOCH_EVENTS, ERA_EVENTS, SINGULARITY_EVENT } from './data/events.js';
export { PARADIGMS } from './data/paradigms.js';
