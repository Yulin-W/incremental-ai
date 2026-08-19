/**
 * productionRenderer.js
 * Renders research automation generator cards and handles real-time affordance updates.
 */

import { GENERATORS } from '../../data/index.js';
import { formatNumber } from '../utils/formatters.js';
import { i18n } from '../../locales/index.js';

export function renderGenerators(ui) {
  if (!ui.dom.generatorList) return;
  const currentEraId = ui.engine.currentEraId;
  const availableGenerators = GENERATORS.filter(g => g.eraId <= currentEraId);

  ui.dom.generatorList.innerHTML = '';

  availableGenerators.forEach(genBase => {
    const gen = i18n.getGenerator(genBase.id) || genBase;
    const count = ui.engine.generators[gen.id] || 0;
    const rate = ui.engine.getGeneratorRate(gen.id);

    let costText = '';
    let canAfford = false;
    let buyCount = 1;

    if (ui.engine.bulkBuyMode === 'max') {
      const maxInfo = ui.engine.getGeneratorCost(gen.id, 'max');
      buyCount = maxInfo.count;
      costText = `${formatNumber(maxInfo.cost)} (x${buyCount})`;
      canAfford = maxInfo.canAffordAny && ui.engine.insights >= maxInfo.cost;
    } else {
      buyCount = ui.engine.bulkBuyMode;
      const cost = ui.engine.getGeneratorCost(gen.id, buyCount);
      costText = `${formatNumber(cost)} (x${buyCount})`;
      canAfford = ui.engine.insights >= cost;
    }

    const buyLabel = i18n.t('ui.buyCount', { count: buyCount });
    const baseRateText = i18n.t('ui.baseRateEach', { rate: gen.baseRate });

    const card = document.createElement('div');
    card.className = 'generator-card';
    card.innerHTML = `
      <div class="gen-top-row">
        <div class="gen-identity">
          <span class="gen-icon">${gen.icon}</span>
          <div>
            <div class="gen-name">${gen.name}</div>
            <div class="gen-flavor">${gen.description}</div>
          </div>
        </div>
        <div class="gen-owned">${count}</div>
      </div>
      <div class="gen-stats-row">
        <span class="gen-output-rate">+${formatNumber(rate)}/s</span>
        <span class="gen-base-rate">${baseRateText}</span>
      </div>
      <button class="btn-buy-gen" ${!canAfford ? 'disabled' : ''}>
        <span>${buyLabel}</span>
        <span>${costText} 💡</span>
      </button>
    `;

    const buyBtn = card.querySelector('.btn-buy-gen');
    buyBtn.addEventListener('click', () => {
      ui.engine.buyGenerator(gen.id);
    });

    ui.dom.generatorList.appendChild(card);
  });

  renderProductionFooter(ui);
}

export function renderProductionFooter(ui) {
  if (!ui.dom.productionFooter) return;
  const hasMore = ui.engine.currentEraId < 7;
  if (hasMore) {
    ui.dom.productionFooter.innerHTML = `<span class="footer-icon">🔒</span><span class="footer-msg">${i18n.t('ui.prodFooterMore')}</span>`;
  } else {
    ui.dom.productionFooter.innerHTML = `<span class="footer-icon">✨</span><span class="footer-msg">${i18n.t('ui.prodFooterComplete')}</span>`;
  }
}

export function updateGeneratorAffordances(ui) {
  if (!ui.dom.generatorList) return;
  const buyButtons = ui.dom.generatorList.querySelectorAll('.btn-buy-gen');
  const availableGenerators = GENERATORS.filter(g => g.eraId <= ui.engine.currentEraId);

  buyButtons.forEach((btn, idx) => {
    const gen = availableGenerators[idx];
    if (gen) {
      if (ui.engine.bulkBuyMode === 'max') {
        const maxInfo = ui.engine.getGeneratorCost(gen.id, 'max');
        const canAfford = maxInfo.canAffordAny && ui.engine.insights >= maxInfo.cost;
        btn.disabled = !canAfford;
        const spans = btn.querySelectorAll('span');
        if (spans.length >= 2) {
          spans[0].textContent = i18n.t('ui.buyCount', { count: maxInfo.count });
          spans[1].textContent = `${formatNumber(maxInfo.cost)} (x${maxInfo.count}) 💡`;
        }
      } else {
        const cost = ui.engine.getGeneratorCost(gen.id, ui.engine.bulkBuyMode);
        const canAfford = ui.engine.insights >= cost;
        btn.disabled = !canAfford;
      }
    }
  });
}

