/**
 * codexRenderer.js
 * Renders detailed historical codex entries, academic citations, and gameplay impact cards.
 */

import { MILESTONES } from '../../data/index.js';
import { i18n } from '../../locales/index.js';

export function renderCodex(ui) {
  if (!ui.dom.codexContainer) return;
  const selectedId = ui.engine.selectedMilestoneId;
  const ms = i18n.getMilestone(selectedId) || i18n.getMilestone('ms_talos') || MILESTONES[0];
  const isUnlocked = ui.engine.unlockedMilestones.has(ms.id);

  const statusPillText = isUnlocked ? i18n.t('ui.unlockedArchived') : i18n.t('ui.lockedEntry');
  const bonusTitle = isUnlocked ? i18n.t('ui.activeBonus') : i18n.t('ui.inactiveBonus');

  ui.dom.codexContainer.innerHTML = `
    <div class="codex-detail">
      <!-- Compact Header Card with Status Indicator -->
      <div class="codex-header-card ${isUnlocked ? 'is-unlocked' : 'is-locked'}">
        <div class="codex-header-top">
          <span class="codex-epoch-tag">EPOCH ${ms.eraId} • ${ms.year}</span>
          <span class="codex-status-pill ${isUnlocked ? 'pill-unlocked' : 'pill-locked'}">
            ${statusPillText}
          </span>
        </div>
        <div class="codex-title">${ms.title}</div>
        <div class="codex-figure">👤 ${ms.quoteOrFigure}</div>
      </div>

      <!-- Paradigm Shift -->
      <div class="codex-section">
        <div class="codex-section-label">${i18n.t('ui.paradigmShiftLabel')}</div>
        <div class="paradigm-box">${ms.paradigmShift}</div>
      </div>

      <!-- Educational Lore -->
      <div class="codex-section">
        <div class="codex-section-label">${i18n.t('ui.historicalLoreLabel')}</div>
        <div class="lore-body">${ms.educationalLore}</div>
      </div>

      <!-- Primary Academic Citation -->
      <div class="codex-section">
        <div class="codex-section-label">${i18n.t('ui.academicCitationLabel')}</div>
        <div class="citation-card">
          📖 ${ms.citation}
        </div>
      </div>

      <!-- Gameplay Economic Impact -->
      <div class="codex-section">
        <div class="codex-section-label">${i18n.t('ui.gameplayImpactLabel')}</div>
        <div class="gameplay-impact-card ${isUnlocked ? 'bonus-active' : 'bonus-inactive'}">
          <span class="bonus-icon">${isUnlocked ? '⚡' : '⏳'}</span>
          <div class="bonus-info">
            <span class="bonus-title">${bonusTitle}:</span>
            <span class="bonus-desc">${ms.effects.description}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

