/**
 * codexRenderer.js
 * Renders detailed historical codex entries, academic citations, and gameplay impact cards.
 */

import { MILESTONES } from '../../data/index.js';

export function renderCodex(ui) {
  if (!ui.dom.codexContainer) return;
  const selectedId = ui.engine.selectedMilestoneId;
  const ms = MILESTONES.find(m => m.id === selectedId) || MILESTONES[0];
  const isUnlocked = ui.engine.unlockedMilestones.has(ms.id);

  ui.dom.codexContainer.innerHTML = `
    <div class="codex-detail">
      <!-- Compact Header Card with Status Indicator -->
      <div class="codex-header-card ${isUnlocked ? 'is-unlocked' : 'is-locked'}">
        <div class="codex-header-top">
          <span class="codex-epoch-tag">EPOCH ${ms.eraId} • ${ms.year}</span>
          <span class="codex-status-pill ${isUnlocked ? 'pill-unlocked' : 'pill-locked'}">
            ${isUnlocked ? '✓ Unlocked & Archived' : '🔒 Locked Entry'}
          </span>
        </div>
        <div class="codex-title">${ms.title}</div>
        <div class="codex-figure">👤 ${ms.quoteOrFigure}</div>
      </div>

      <!-- Paradigm Shift -->
      <div class="codex-section">
        <div class="codex-section-label">Paradigm Shift</div>
        <div class="paradigm-box">${ms.paradigmShift}</div>
      </div>

      <!-- Educational Lore -->
      <div class="codex-section">
        <div class="codex-section-label">Historical Lore & Scientific Context</div>
        <div class="lore-body">${ms.educationalLore}</div>
      </div>

      <!-- Primary Academic Citation -->
      <div class="codex-section">
        <div class="codex-section-label">Primary Academic Citation</div>
        <div class="citation-card">
          📖 ${ms.citation}
        </div>
      </div>

      <!-- Gameplay Economic Impact -->
      <div class="codex-section">
        <div class="codex-section-label">Gameplay Economic Impact</div>
        <div class="gameplay-impact-card ${isUnlocked ? 'bonus-active' : 'bonus-inactive'}">
          <span class="bonus-icon">${isUnlocked ? '⚡' : '⏳'}</span>
          <div class="bonus-info">
            <span class="bonus-title">${isUnlocked ? 'ACTIVE BONUS' : 'INACTIVE BONUS'}:</span>
            <span class="bonus-desc">${ms.effects.description}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
