/**
 * headerRenderer.js
 * Renders header statistics, current epoch pill, progress bar, and unified paradigm badge.
 */

import { MILESTONES } from '../../data/index.js';
import { formatNumber } from '../utils/formatters.js';
import { i18n } from '../../locales/index.js';

export function updateEraProgressBar(ui) {
  if (!ui.dom.eraProgressBarFill || !ui.dom.eraProgressText) return;
  const currentEraMilestones = MILESTONES.filter(m => m.eraId === ui.engine.currentEraId);
  const totalInEra = currentEraMilestones.length;
  const unlockedInEra = currentEraMilestones.filter(m => ui.engine.unlockedMilestones.has(m.id)).length;
  const pct = totalInEra > 0 ? (unlockedInEra / totalInEra) * 100 : 100;
  const hasNextEpoch = ui.engine.currentEraId < 7;

  if (hasNextEpoch) {
    ui.dom.eraProgressBarFill.style.width = `${pct.toFixed(1)}%`;
    ui.dom.eraProgressText.innerText = i18n.t('ui.milestoneProgress', {
      unlocked: unlockedInEra,
      total: totalInEra,
      pct: pct.toFixed(0)
    });
  } else {
    ui.dom.eraProgressBarFill.style.width = `100%`;
    ui.dom.eraProgressText.innerText = i18n.t('ui.milestonesComplete', {
      total: totalInEra
    });
  }
}

export function renderHeader(ui) {
  const epoch = i18n.getEpoch(ui.engine.currentEraId) || i18n.getEpoch(1);
  if (ui.dom.eraPillNumber) ui.dom.eraPillNumber.innerText = i18n.t('ui.epoch', { number: epoch.id });
  if (ui.dom.eraPillName) ui.dom.eraPillName.innerText = epoch.name;
  if (ui.dom.eraPillDates) ui.dom.eraPillDates.innerText = epoch.timeSpan;

  if (ui.dom.statInsights) ui.dom.statInsights.innerText = formatNumber(ui.engine.insights);
  if (ui.dom.statRate) ui.dom.statRate.innerText = `+${formatNumber(ui.engine.getTotalRate())} / s`;
  if (ui.dom.clickGainBadge) ui.dom.clickGainBadge.innerText = i18n.t('ui.clickGain', { amount: formatNumber(ui.engine.getClickPower()) });

  // Unified Active Paradigm & Restart Header Button
  if (ui.dom.activeParadigmBadge) {
    ui.dom.activeParadigmBadge.style.display = 'inline-flex';
    const activeParadigmRaw = ui.engine.getActiveParadigm();
    const activeParadigm = activeParadigmRaw ? i18n.getParadigm(activeParadigmRaw.id) : null;

    if (ui.engine.hasEverUnlockedSingularity) {
      // Post-Clear State: Paradigm Shift Unlocked & Available
      ui.dom.activeParadigmBadge.classList.add('paradigm-shift-ready');
      ui.dom.activeParadigmBadge.classList.remove('pre-clear-restart');

      if (activeParadigm) {
        if (ui.dom.paradigmBadgeIcon) ui.dom.paradigmBadgeIcon.textContent = activeParadigm.icon;
        if (ui.dom.paradigmBadgeLabel) ui.dom.paradigmBadgeLabel.textContent = i18n.t('ui.activeFocusRestart');
        if (ui.dom.paradigmBadgeName) ui.dom.paradigmBadgeName.textContent = `${activeParadigm.name} ▾`;
      } else if (ui.engine.replayCount > 0) {
        if (ui.dom.paradigmBadgeIcon) ui.dom.paradigmBadgeIcon.textContent = '📜';
        if (ui.dom.paradigmBadgeLabel) ui.dom.paradigmBadgeLabel.textContent = i18n.t('ui.activeFocusRestart');
        if (ui.dom.paradigmBadgeName) ui.dom.paradigmBadgeName.textContent = `${i18n.t('ui.standardReplay')} ▾`;
      } else {
        // Cleared epoch 7 in current initial run, hasn't shifted yet
        if (ui.dom.paradigmBadgeIcon) ui.dom.paradigmBadgeIcon.textContent = '🌌';
        if (ui.dom.paradigmBadgeLabel) ui.dom.paradigmBadgeLabel.textContent = i18n.t('ui.paradigmShiftLabel');
        if (ui.dom.paradigmBadgeName) ui.dom.paradigmBadgeName.textContent = `${i18n.t('ui.singularityReady')} ▾`;
      }
    } else {
      // Pre-Clear State: Standard Restart Action Button
      ui.dom.activeParadigmBadge.classList.remove('paradigm-shift-ready');
      ui.dom.activeParadigmBadge.classList.add('pre-clear-restart');
      if (ui.dom.paradigmBadgeIcon) ui.dom.paradigmBadgeIcon.textContent = '🔄';
      if (ui.dom.paradigmBadgeLabel) ui.dom.paradigmBadgeLabel.textContent = i18n.t('ui.restartTimeline');
      if (ui.dom.paradigmBadgeName) ui.dom.paradigmBadgeName.textContent = `${i18n.t('ui.epoch1Reset')} ▾`;
    }
    ui.dom.activeParadigmBadge.removeAttribute('title');
  }

  updateEraProgressBar(ui);
}

