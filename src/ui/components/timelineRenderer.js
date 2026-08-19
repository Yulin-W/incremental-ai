/**
 * timelineRenderer.js
 * Renders historical timeline milestone cards and handles unlock affordance updates.
 */

import { MILESTONES } from '../../data/index.js';
import { formatNumber } from '../utils/formatters.js';

export function renderTimeline(ui) {
  if (!ui.dom.milestoneGrid) return;
  const visibleMilestones = MILESTONES.filter(m => m.eraId <= ui.engine.currentEraId + 1);

  ui.dom.milestoneGrid.innerHTML = '';

  visibleMilestones.forEach(ms => {
    const isUnlocked = ui.engine.unlockedMilestones.has(ms.id);
    const isAvailable = ui.engine.isMilestoneAvailable(ms.id);
    const isSelected = ui.engine.selectedMilestoneId === ms.id;
    const cost = ui.engine.getMilestoneCost(ms.id);
    const canAfford = ui.engine.insights >= cost;

    let statusClass = 'locked';
    let actionControl = '<span class="ms-state-btn status-locked">🔒 Locked</span>';

    if (isUnlocked) {
      statusClass = 'unlocked';
      actionControl = '<span class="ms-state-btn status-unlocked">✓ Discovered</span>';
    } else if (isAvailable) {
      statusClass = 'available';
      actionControl = `<button class="btn-unlock-ms" ${!canAfford ? 'disabled' : ''}>Unlock: ${formatNumber(cost)} 💡</button>`;
    }

    const card = document.createElement('div');
    card.className = `milestone-card ${statusClass} ${isSelected ? 'selected' : ''}`;
    card.innerHTML = `
      <div class="ms-header">
        <div class="ms-title-group">
          <span class="ms-year">${ms.year}</span>
          <span class="ms-title">${ms.title}</span>
        </div>
        ${actionControl}
      </div>
      <div class="ms-flavor">${ms.paradigmShift}</div>
      <div class="ms-effect-preview">⚡ ${ms.effects.description}</div>
    `;

    // Select for Codex viewing
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-unlock-ms')) {
        ui.engine.selectMilestone(ms.id);
      }
    });

    // Unlock button
    const unlockBtn = card.querySelector('.btn-unlock-ms');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ui.engine.buyMilestone(ms.id);
      });
    }

    ui.dom.milestoneGrid.appendChild(card);
  });
}

export function updateMilestoneAffordances(ui) {
  if (!ui.dom.milestoneGrid) return;
  const milestoneCards = ui.dom.milestoneGrid.querySelectorAll('.milestone-card');
  const visibleMilestones = MILESTONES.filter(m => m.eraId <= ui.engine.currentEraId + 1);

  milestoneCards.forEach((card, idx) => {
    const ms = visibleMilestones[idx];
    if (ms) {
      const unlockBtn = card.querySelector('.btn-unlock-ms');
      if (unlockBtn) {
        const cost = ui.engine.getMilestoneCost(ms.id);
        const canAfford = ui.engine.insights >= cost;
        unlockBtn.disabled = !canAfford;
      }
    }
  });
}
