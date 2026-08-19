/**
 * headerRenderer.js
 * Renders header statistics, current epoch pill, progress bar, and unified paradigm badge.
 */

import { ERAS, MILESTONES } from '../../data/index.js';
import { formatNumber } from '../utils/formatters.js';

export function updateEraProgressBar(ui) {
  if (!ui.dom.eraProgressBarFill || !ui.dom.eraProgressText) return;
  const currentEraMilestones = MILESTONES.filter(m => m.eraId === ui.engine.currentEraId);
  const totalInEra = currentEraMilestones.length;
  const unlockedInEra = currentEraMilestones.filter(m => ui.engine.unlockedMilestones.has(m.id)).length;
  const pct = totalInEra > 0 ? (unlockedInEra / totalInEra) * 100 : 100;
  const nextEra = ERAS.find(e => e.id === ui.engine.currentEraId + 1);

  if (nextEra) {
    ui.dom.eraProgressBarFill.style.width = `${pct.toFixed(1)}%`;
    ui.dom.eraProgressText.innerText = `${unlockedInEra} / ${totalInEra} Milestones (${pct.toFixed(0)}%)`;
  } else {
    ui.dom.eraProgressBarFill.style.width = `100%`;
    ui.dom.eraProgressText.innerText = `All ${totalInEra}/${totalInEra} Milestones Complete`;
  }
}

export function renderHeader(ui) {
  const era = ERAS.find(e => e.id === ui.engine.currentEraId) || ERAS[0];
  if (ui.dom.eraPillNumber) ui.dom.eraPillNumber.innerText = `Epoch ${era.id}`;
  if (ui.dom.eraPillName) ui.dom.eraPillName.innerText = era.name;
  if (ui.dom.eraPillDates) ui.dom.eraPillDates.innerText = era.timeSpan;

  if (ui.dom.statInsights) ui.dom.statInsights.innerText = formatNumber(ui.engine.insights);
  if (ui.dom.statRate) ui.dom.statRate.innerText = `+${formatNumber(ui.engine.getTotalRate())} / s`;
  if (ui.dom.clickGainBadge) ui.dom.clickGainBadge.innerText = `+${formatNumber(ui.engine.getClickPower())} / click`;

  // Unified Active Paradigm & Restart Header Button
  if (ui.dom.activeParadigmBadge) {
    ui.dom.activeParadigmBadge.style.display = 'inline-flex';
    const activeParadigm = ui.engine.getActiveParadigm();

    if (ui.engine.hasEverUnlockedSingularity) {
      // Post-Clear State: Paradigm Shift Unlocked & Available
      ui.dom.activeParadigmBadge.classList.add('paradigm-shift-ready');
      ui.dom.activeParadigmBadge.classList.remove('pre-clear-restart');

      if (activeParadigm) {
        if (ui.dom.paradigmBadgeIcon) ui.dom.paradigmBadgeIcon.textContent = activeParadigm.icon;
        if (ui.dom.paradigmBadgeLabel) ui.dom.paradigmBadgeLabel.textContent = 'Active Focus • Restart';
        if (ui.dom.paradigmBadgeName) ui.dom.paradigmBadgeName.textContent = `${activeParadigm.name} ▾`;
      } else if (ui.engine.replayCount > 0) {
        if (ui.dom.paradigmBadgeIcon) ui.dom.paradigmBadgeIcon.textContent = '📜';
        if (ui.dom.paradigmBadgeLabel) ui.dom.paradigmBadgeLabel.textContent = 'Active Focus • Restart';
        if (ui.dom.paradigmBadgeName) ui.dom.paradigmBadgeName.textContent = 'Standard Replay ▾';
      } else {
        // Cleared epoch 7 in current initial run, hasn't shifted yet
        if (ui.dom.paradigmBadgeIcon) ui.dom.paradigmBadgeIcon.textContent = '🌌';
        if (ui.dom.paradigmBadgeLabel) ui.dom.paradigmBadgeLabel.textContent = 'Paradigm Shift • Restart';
        if (ui.dom.paradigmBadgeName) ui.dom.paradigmBadgeName.textContent = 'Singularity Ready ▾';
      }
    } else {
      // Pre-Clear State: Standard Restart Action Button
      ui.dom.activeParadigmBadge.classList.remove('paradigm-shift-ready');
      ui.dom.activeParadigmBadge.classList.add('pre-clear-restart');
      if (ui.dom.paradigmBadgeIcon) ui.dom.paradigmBadgeIcon.textContent = '🔄';
      if (ui.dom.paradigmBadgeLabel) ui.dom.paradigmBadgeLabel.textContent = 'Restart Timeline';
      if (ui.dom.paradigmBadgeName) ui.dom.paradigmBadgeName.textContent = 'Epoch 1 (Reset) ▾';
    }
    ui.dom.activeParadigmBadge.removeAttribute('title');
  }

  updateEraProgressBar(ui);
}
