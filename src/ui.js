/**
 * ui.js
 * User Interface controller, DOM renderer, event bindings, and animation orchestrator.
 */

import { GameEngine } from './engine.js';
import { ERAS, GENERATORS, MILESTONES } from './historyData.js';

export class GameUI {
  constructor() {
    this.engine = new GameEngine();
    this.activeMobileTab = 'timeline'; // 'production', 'timeline', 'codex'
    this.dom = {};

    this.initDOMReferences();
    this.bindEvents();
    this.setupEngineSubscriptions();
    this.loadVersion();
    
    // Initial Render
    this.renderAll();
    
    // Start Animation / Game Loop
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  // ==========================================
  // VERSION LOADER
  // ==========================================
  async loadVersion() {
    try {
      const response = await fetch('./VERSION');
      if (response.ok) {
        const version = (await response.text()).trim();
        if (version) {
          this.engine.version = version;
          if (this.dom.versionTag) {
            this.dom.versionTag.textContent = `v${version}`;
          }
        }
      }
    } catch (err) {
      console.warn('Could not load VERSION file:', err);
    }
  }

  // ==========================================
  // DOM ELEMENT CACHING
  // ==========================================
  initDOMReferences() {
    this.dom = {
      body: document.body,
      // Header
      versionTag: document.querySelector('.version-tag'),
      eraPillNumber: document.getElementById('era-pill-number'),
      eraPillName: document.getElementById('era-pill-name'),
      eraPillDates: document.getElementById('era-pill-dates'),
      statInsights: document.getElementById('stat-insights'),
      statRate: document.getElementById('stat-rate'),

      // Left Panel (Production Hub)
      btnContemplate: document.getElementById('btn-contemplate'),
      clickGainBadge: document.getElementById('click-gain-badge'),
      bulkButtons: document.querySelectorAll('.btn-bulk'),
      generatorList: document.getElementById('generator-list'),

      // Center Panel (Timeline)
      eraBannerTitle: document.getElementById('era-banner-title'),
      eraBannerDates: document.getElementById('era-banner-dates'),
      eraBannerFlavor: document.getElementById('era-banner-flavor'),
      milestoneGrid: document.getElementById('milestone-grid'),

      // Right Panel (Codex)
      codexContainer: document.getElementById('codex-container'),

      // Mobile Tabs & Panels
      mobileTabButtons: document.querySelectorAll('.btn-tab'),
      panelProduction: document.getElementById('panel-production'),
      panelTimeline: document.getElementById('panel-timeline'),
      panelCodex: document.getElementById('panel-codex'),

      // Toast Container
      toastContainer: document.getElementById('toast-container')
    };
  }

  // ==========================================
  // NUMBER FORMATTING UTILITIES
  // ==========================================
  static formatNumber(num, decimals = 1) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    if (num < 1000) {
      return Number.isInteger(num) ? num.toString() : num.toFixed(decimals);
    }

    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    const i = Math.floor(Math.log10(num) / 3);
    const suffixIndex = Math.min(i, suffixes.length - 1);
    
    const formatted = (num / Math.pow(10, suffixIndex * 3)).toFixed(decimals);
    return `${formatted} ${suffixes[suffixIndex]}`;
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  bindEvents() {
    // Contemplate Button Click
    this.dom.btnContemplate.addEventListener('click', (e) => {
      const gain = this.engine.clickInsight();
      this.spawnClickParticle(e, `+${GameUI.formatNumber(gain)}`);
    });

    // Bulk Buy Mode Buttons
    this.dom.bulkButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode === 'max' ? 'max' : parseInt(btn.dataset.mode, 10);
        this.engine.setBulkBuyMode(mode);
        this.dom.bulkButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderGenerators();
      });
    });

    // Mobile Tabs
    this.dom.mobileTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchMobileTab(tab);
      });
    });
  }

  switchMobileTab(tab) {
    this.activeMobileTab = tab;
    this.dom.mobileTabButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    this.dom.panelProduction.classList.toggle('active-mobile-panel', tab === 'production');
    this.dom.panelTimeline.classList.toggle('active-mobile-panel', tab === 'timeline');
    this.dom.panelCodex.classList.toggle('active-mobile-panel', tab === 'codex');
  }

  // Floating text animation for clicks
  spawnClickParticle(e, text) {
    const particle = document.createElement('div');
    particle.className = 'click-particle';
    particle.innerText = text;

    const rect = this.dom.btnContemplate.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);

    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      color: var(--accent-primary);
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 0.95rem;
      pointer-events: none;
      z-index: 10000;
      animation: float-up 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 750);
  }

  // ==========================================
  // ENGINE SUBSCRIPTIONS & TOASTS
  // ==========================================
  setupEngineSubscriptions() {
    this.engine.on('stateChange', () => {
      this.renderHeader();
      this.renderGenerators();
      this.renderTimeline();
      this.renderCodex();
    });

    this.engine.on('milestoneUnlock', (milestone) => {
      this.showToast('✨ Breakthrough Unlocked!', milestone.title, '🔬');
    });

    this.engine.on('eraUnlock', (era) => {
      this.showToast(`🏛️ Entering ${era.name}`, era.subtitle, '⏳');
      this.updateTheme(era.themeClass);
    });
  }

  showToast(title, message, icon = '💡') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    this.dom.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  updateTheme(themeClass) {
    // Strip old theme classes and apply new one
    ERAS.forEach(e => this.dom.body.classList.remove(e.themeClass));
    this.dom.body.classList.add(themeClass);
  }

  // ==========================================
  // RENDERING METHODS
  // ==========================================

  renderAll() {
    this.renderHeader();
    this.renderGenerators();
    this.renderTimeline();
    this.renderCodex();
    
    const currentEra = ERAS.find(e => e.id === this.engine.currentEraId);
    if (currentEra) {
      this.updateTheme(currentEra.themeClass);
    }
  }

  renderHeader() {
    const era = ERAS.find(e => e.id === this.engine.currentEraId) || ERAS[0];
    this.dom.eraPillNumber.innerText = `Era ${era.id}`;
    this.dom.eraPillName.innerText = era.name;
    this.dom.eraPillDates.innerText = era.timeSpan;

    this.dom.statInsights.innerText = GameUI.formatNumber(this.engine.insights);
    this.dom.statRate.innerText = `+${GameUI.formatNumber(this.engine.getTotalRate())} / s`;
    this.dom.clickGainBadge.innerText = `+${GameUI.formatNumber(this.engine.getClickPower())} / click`;
  }

  renderGenerators() {
    const currentEraId = this.engine.currentEraId;
    // Show generators up to the current era
    const availableGenerators = GENERATORS.filter(g => g.eraId <= currentEraId);

    this.dom.generatorList.innerHTML = '';

    availableGenerators.forEach(gen => {
      const count = this.engine.generators[gen.id] || 0;
      const rate = this.engine.getGeneratorRate(gen.id);
      
      let costText = '';
      let canAfford = false;
      let buyCount = 1;

      if (this.engine.bulkBuyMode === 'max') {
        const maxInfo = this.engine.getGeneratorCost(gen.id, 'max');
        buyCount = maxInfo.count;
        costText = `${GameUI.formatNumber(maxInfo.cost)} (x${buyCount})`;
        canAfford = maxInfo.canAffordAny && this.engine.insights >= maxInfo.cost;
      } else {
        buyCount = this.engine.bulkBuyMode;
        const cost = this.engine.getGeneratorCost(gen.id, buyCount);
        costText = `${GameUI.formatNumber(cost)} (x${buyCount})`;
        canAfford = this.engine.insights >= cost;
      }

      const card = document.createElement('div');
      card.className = 'generator-card';
      card.innerHTML = `
        <div class="gen-top-row">
          <div class="gen-identity">
            <span class="gen-icon">${gen.icon}</span>
            <div>
              <div class="gen-name">${gen.name}</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">${gen.description}</div>
            </div>
          </div>
          <div class="gen-owned">${count}</div>
        </div>
        <div class="gen-stats-row">
          <span>Output: +${GameUI.formatNumber(rate)}/s</span>
          <span>Base: +${gen.baseRate}/s</span>
        </div>
        <button class="btn-buy-gen" ${!canAfford ? 'disabled' : ''}>
          <span>Invest in Research</span>
          <span>${costText} 💡</span>
        </button>
      `;

      const buyBtn = card.querySelector('.btn-buy-gen');
      buyBtn.addEventListener('click', () => {
        this.engine.buyGenerator(gen.id);
      });

      this.dom.generatorList.appendChild(card);
    });
  }

  renderTimeline() {
    const currentEra = ERAS.find(e => e.id === this.engine.currentEraId) || ERAS[0];
    
    // Era Banner
    this.dom.eraBannerTitle.innerText = `${currentEra.name} (${currentEra.timeSpan})`;
    this.dom.eraBannerDates.innerText = `Era ${currentEra.id} of 7`;
    this.dom.eraBannerFlavor.innerText = currentEra.flavor;

    // Milestones List (Show all milestones up to currentEra + 1 to show what's ahead)
    const visibleMilestones = MILESTONES.filter(m => m.eraId <= this.engine.currentEraId + 1);

    this.dom.milestoneGrid.innerHTML = '';

    visibleMilestones.forEach(ms => {
      const isUnlocked = this.engine.unlockedMilestones.has(ms.id);
      const isAvailable = this.engine.isMilestoneAvailable(ms.id);
      const isSelected = this.engine.selectedMilestoneId === ms.id;
      const canAfford = this.engine.insights >= ms.cost;

      let statusClass = 'locked';
      let statusBadge = '<span class="ms-status-badge status-locked">🔒 Locked</span>';

      if (isUnlocked) {
        statusClass = 'unlocked';
        statusBadge = '<span class="ms-status-badge status-unlocked">✓ Discovered</span>';
      } else if (isAvailable) {
        statusClass = 'available';
        statusBadge = '<span class="ms-status-badge status-available">⚡ Ready to Unlock</span>';
      }

      const card = document.createElement('div');
      card.className = `milestone-card ${statusClass} ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="ms-header">
          <div class="ms-title-group">
            <span class="ms-year">${ms.year}</span>
            <span class="ms-title">${ms.title}</span>
          </div>
          ${statusBadge}
        </div>
        <div class="ms-summary">${ms.paradigmShift}</div>
        <div class="ms-actions">
          <span class="ms-effect-preview">${ms.effects.description}</span>
          ${
            !isUnlocked && isAvailable
              ? `<button class="btn-unlock-ms" ${!canAfford ? 'disabled' : ''}>Unlock: ${GameUI.formatNumber(ms.cost)} 💡</button>`
              : isUnlocked
              ? `<span style="font-size:0.75rem; color:var(--success); font-weight:700;">Recorded in Codex</span>`
              : `<span style="font-size:0.72rem; color:var(--text-dim);">Prerequisites required</span>`
          }
        </div>
      `;

      // Select for Codex viewing
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-unlock-ms')) {
          this.engine.selectMilestone(ms.id);
        }
      });

      // Unlock button
      const unlockBtn = card.querySelector('.btn-unlock-ms');
      if (unlockBtn) {
        unlockBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.engine.buyMilestone(ms.id);
        });
      }

      this.dom.milestoneGrid.appendChild(card);
    });
  }

  renderCodex() {
    const selectedId = this.engine.selectedMilestoneId;
    const ms = MILESTONES.find(m => m.id === selectedId) || MILESTONES[0];
    const isUnlocked = this.engine.unlockedMilestones.has(ms.id);

    this.dom.codexContainer.innerHTML = `
      <div class="codex-detail">
        <div class="codex-header-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="codex-year-badge">EPOCH ${ms.eraId} • ${ms.year}</span>
            <span style="font-size:0.75rem; font-weight:700; color:${isUnlocked ? 'var(--success)' : 'var(--warning)'};">
              ${isUnlocked ? '✓ UNLOCKED & ARCHIVED' : '⏳ THEORETICAL PREVIEW'}
            </span>
          </div>
          <div class="codex-title">${ms.title}</div>
          <div class="codex-figure">👤 Key Figure(s): ${ms.quoteOrFigure}</div>
        </div>

        <div class="codex-section">
          <div class="codex-section-label">Paradigm Shift & Core Discovery</div>
          <div class="paradigm-box">${ms.paradigmShift}</div>
        </div>

        <div class="codex-section">
          <div class="codex-section-label">Historical Lore & Scientific Context</div>
          <div class="lore-body">${ms.educationalLore}</div>
        </div>

        <div class="codex-section">
          <div class="codex-section-label">Primary Academic Citation</div>
          <div class="citation-card">📖 ${ms.citation}</div>
        </div>

        <div class="codex-section">
          <div class="codex-section-label">In-Game Gameplay Bonus</div>
          <div class="gameplay-impact-card">
            <span>⚡</span>
            <span>${ms.effects.description}</span>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // MAIN GAME LOOP (requestAnimationFrame)
  // ==========================================
  gameLoop(timestamp) {
    this.engine.tick(timestamp);
    
    // Smooth header tick updates
    this.dom.statInsights.innerText = GameUI.formatNumber(this.engine.insights);
    this.dom.statRate.innerText = `+${GameUI.formatNumber(this.engine.getTotalRate())} / s`;
    
    // Periodically update buy button affordabilities without full re-render
    const buyButtons = this.dom.generatorList.querySelectorAll('.btn-buy-gen');
    const availableGenerators = GENERATORS.filter(g => g.eraId <= this.engine.currentEraId);
    
    buyButtons.forEach((btn, idx) => {
      const gen = availableGenerators[idx];
      if (gen) {
        let canAfford = false;
        if (this.engine.bulkBuyMode === 'max') {
          const maxInfo = this.engine.getGeneratorCost(gen.id, 'max');
          canAfford = maxInfo.canAffordAny && this.engine.insights >= maxInfo.cost;
        } else {
          const cost = this.engine.getGeneratorCost(gen.id, this.engine.bulkBuyMode);
          canAfford = this.engine.insights >= cost;
        }
        btn.disabled = !canAfford;
      }
    });

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
}

// Bootstrap UI once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new GameUI();
});
