import en from './en.js';
import fr from './fr.js';
import it from './it.js';
import de from './de.js';
import es from './es.js';
import zh from './zh.js';
import ja from './ja.js';
import ko from './ko.js';
import el from './el.js';

import { EPOCHS } from '../data/epochs.js';
import { GENERATORS } from '../data/generators.js';
import { MILESTONES } from '../data/milestones.js';
import { PARADIGMS } from '../data/paradigms.js';

export const LOCALES = { en, fr, it, de, es, zh, ja, ko, el };

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' }
];

export const STORAGE_KEY = 'incremental_ai_lang';

class I18n {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.listeners = new Map();
    this.updateDocumentLang();
  }

  detectLanguage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && LOCALES[saved]) {
          return saved;
        }
      } catch (e) {
        // localStorage may be disabled
      }
    }

    if (typeof navigator !== 'undefined') {
      const browserLanguages = navigator.languages || [navigator.language || 'en'];
      for (const rawLang of browserLanguages) {
        if (!rawLang) continue;
        const normalized = rawLang.toLowerCase();
        const base = normalized.split('-')[0];

        // Exact match
        if (LOCALES[normalized]) {
          return normalized;
        }
        // Base prefix match (e.g. 'fr-FR' -> 'fr', 'zh-CN' -> 'zh', 'el-GR' -> 'el')
        if (LOCALES[base]) {
          return base;
        }
      }
    }

    return 'en';
  }

  setLanguage(langCode) {
    if (!LOCALES[langCode]) {
      console.warn(`[i18n] Unsupported language: ${langCode}, falling back to 'en'`);
      langCode = 'en';
    }

    if (this.currentLang === langCode) return;

    this.currentLang = langCode;

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, langCode);
      } catch (e) {
        // ignore
      }
    }

    this.updateDocumentLang();
    this.emit('languageChange', { lang: langCode });
  }

  updateDocumentLang() {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = this.currentLang;
    }
  }

  getLanguage() {
    return this.currentLang;
  }

  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  t(path, params = {}) {
    const langDict = LOCALES[this.currentLang] || LOCALES.en;
    let val = this._resolvePath(langDict, path);

    if (val === undefined && this.currentLang !== 'en') {
      val = this._resolvePath(LOCALES.en, path);
    }

    if (val === undefined) {
      return path;
    }

    if (typeof val === 'string' && params && typeof params === 'object') {
      return val.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
      });
    }

    return val;
  }

  _resolvePath(obj, path) {
    if (!obj || typeof path !== 'string') return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }

  // --- Localized Domain Getters ---

  getEpoch(id) {
    const numId = Number(id);
    const base = EPOCHS.find(e => e.id === numId);
    if (!base) return null;
    const loc = this.t(`epochs.${numId}`) || {};
    return {
      ...base,
      name: loc.name || base.name,
      subtitle: loc.subtitle || base.subtitle,
      timeSpan: loc.timeSpan || base.timeSpan,
      flavor: loc.flavor || base.flavor
    };
  }

  getEpochs() {
    return EPOCHS.map(e => this.getEpoch(e.id));
  }

  getGenerator(id) {
    const base = GENERATORS.find(g => g.id === id);
    if (!base) return null;
    const loc = this.t(`generators.${id}`) || {};
    return {
      ...base,
      name: loc.name || base.name,
      description: loc.description || base.description
    };
  }

  getGenerators() {
    return GENERATORS.map(g => this.getGenerator(g.id));
  }

  getMilestone(id) {
    const base = MILESTONES.find(m => m.id === id);
    if (!base) return null;
    const loc = this.t(`milestones.${id}`) || {};
    return {
      ...base,
      title: loc.title || base.title,
      quoteOrFigure: loc.quoteOrFigure || base.quoteOrFigure,
      paradigmShift: loc.paradigmShift || base.paradigmShift,
      educationalLore: loc.educationalLore || base.educationalLore,
      citation: loc.citation || base.citation,
      effects: {
        ...base.effects,
        description: loc.effectsDescription || (base.effects && base.effects.description) || ''
      }
    };
  }

  getMilestones() {
    return MILESTONES.map(m => this.getMilestone(m.id));
  }

  getParadigm(id) {
    const base = PARADIGMS.find(p => p.id === id);
    if (!base) return null;
    const loc = this.t(`paradigms.${id}`) || {};
    return {
      ...base,
      name: loc.name || base.name,
      subtitle: loc.subtitle || base.subtitle,
      historicalRoots: loc.historicalRoots || base.historicalRoots,
      quote: loc.quote ? { ...base.quote, ...loc.quote } : base.quote,
      flavor: loc.flavor || base.flavor,
      effectsSummary: loc.effectsSummary || base.effectsSummary,
      speedRating: loc.speedRating || base.speedRating
    };
  }

  getParadigms() {
    return PARADIGMS.map(p => this.getParadigm(p.id));
  }

  getEvent(epochIdOrSingularity) {
    return this.t(`events.${epochIdOrSingularity}`) || {};
  }

  // --- Simple Event Emitter ---

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (err) {
          console.error(`[i18n] Error in listener for ${event}:`, err);
        }
      }
    }
  }
}

export const i18n = new I18n();
export default i18n;

