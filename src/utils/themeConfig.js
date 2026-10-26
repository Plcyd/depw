/**
 * Pure Theme Configuration & CSS Custom Property Definitions
 * Supports toggling between 'navy-glass', 'daylight-civic', and 'emerald-hydro'
 * (as well as extended civic/ops palettes defined in src/index.css).
 */

export const CORE_THEME_IDS = ['navy-glass', 'daylight-civic', 'emerald-hydro'];

export const THEME_CSS_VARIABLES = {
  'navy-glass': {
    '--bg-navy-deep': '#060d1f',
    '--bg-navy-mid': '#0a1633',
    '--bg-navy-elevated': 'rgba(15, 31, 68, 0.82)',
    '--glass-surface': 'rgba(16, 34, 74, 0.75)',
    '--glass-surface-hover': 'rgba(24, 49, 102, 0.88)',
    '--glass-border': 'rgba(125, 211, 252, 0.32)',
    '--glass-highlight': 'rgba(255, 255, 255, 0.18)',
    '--text-primary': '#ffffff',
    '--text-secondary': '#e2e8f0',
    '--text-muted': '#cbd5e1',
    '--accent-cyan': '#38bdf8',
    '--accent-royal': '#2563eb',
    '--accent-orange': '#f97316',
    '--status-emerald': '#10b981',
    '--status-amber': '#f59e0b',
    '--status-rose': '#f43f5e',
  },
  'daylight-civic': {
    '--bg-navy-deep': '#f1f5f9',
    '--bg-navy-mid': '#e2e8f0',
    '--bg-navy-elevated': 'rgba(255, 255, 255, 0.92)',
    '--glass-surface': 'rgba(255, 255, 255, 0.85)',
    '--glass-surface-hover': 'rgba(255, 255, 255, 0.98)',
    '--glass-border': 'rgba(148, 163, 184, 0.45)',
    '--glass-highlight': 'rgba(255, 255, 255, 0.95)',
    '--text-primary': '#0f172a',
    '--text-secondary': '#334155',
    '--text-muted': '#64748b',
    '--accent-cyan': '#0284c7',
    '--accent-royal': '#1d4ed8',
    '--accent-orange': '#f97316',
    '--status-emerald': '#059669',
    '--status-amber': '#d97706',
    '--status-rose': '#e11d48',
  },
  'emerald-hydro': {
    '--bg-navy-deep': '#041d1b',
    '--bg-navy-mid': '#08332e',
    '--bg-navy-elevated': 'rgba(10, 56, 50, 0.76)',
    '--glass-surface': 'rgba(9, 50, 45, 0.68)',
    '--glass-surface-hover': 'rgba(14, 71, 64, 0.82)',
    '--glass-border': 'rgba(52, 211, 153, 0.3)',
    '--glass-highlight': 'rgba(167, 243, 208, 0.16)',
    '--text-primary': '#f0fdf4',
    '--text-secondary': '#ccfbf1',
    '--text-muted': '#99f6e4',
    '--accent-cyan': '#10b981',
    '--accent-royal': '#059669',
    '--accent-orange': '#f97316',
    '--status-emerald': '#10b981',
    '--status-amber': '#f59e0b',
    '--status-rose': '#f43f5e',
  },
  'light-sky': {
    '--bg-navy-deep': '#e0f2fe',
    '--bg-navy-mid': '#bae6fd',
    '--bg-navy-elevated': 'rgba(255, 255, 255, 0.9)',
    '--glass-surface': 'rgba(255, 255, 255, 0.82)',
    '--glass-surface-hover': 'rgba(255, 255, 255, 0.96)',
    '--glass-border': 'rgba(56, 189, 248, 0.45)',
    '--glass-highlight': 'rgba(255, 255, 255, 0.95)',
    '--text-primary': '#0c4a6e',
    '--text-secondary': '#0369a1',
    '--text-muted': '#0284c7',
    '--accent-cyan': '#0284c7',
    '--accent-royal': '#1d4ed8',
    '--accent-orange': '#ea580c',
    '--status-emerald': '#059669',
    '--status-amber': '#d97706',
    '--status-rose': '#e11d48',
  },
  'light-emerald': {
    '--bg-navy-deep': '#ecfdf5',
    '--bg-navy-mid': '#d1fae5',
    '--bg-navy-elevated': 'rgba(255, 255, 255, 0.9)',
    '--glass-surface': 'rgba(255, 255, 255, 0.82)',
    '--glass-surface-hover': 'rgba(255, 255, 255, 0.96)',
    '--glass-border': 'rgba(16, 185, 129, 0.4)',
    '--glass-highlight': 'rgba(255, 255, 255, 0.95)',
    '--text-primary': '#064e3b',
    '--text-secondary': '#047857',
    '--text-muted': '#059669',
    '--accent-cyan': '#059669',
    '--accent-royal': '#047857',
    '--accent-orange': '#ea580c',
    '--status-emerald': '#059669',
    '--status-amber': '#d97706',
    '--status-rose': '#e11d48',
  },
  'amber-ops': {
    '--bg-navy-deep': '#1c1206',
    '--bg-navy-mid': '#2e1d09',
    '--bg-navy-elevated': 'rgba(54, 33, 10, 0.78)',
    '--glass-surface': 'rgba(48, 29, 9, 0.68)',
    '--glass-surface-hover': 'rgba(71, 43, 14, 0.82)',
    '--glass-border': 'rgba(251, 191, 36, 0.32)',
    '--glass-highlight': 'rgba(254, 243, 199, 0.16)',
    '--text-primary': '#fffbeb',
    '--text-secondary': '#fde68a',
    '--text-muted': '#fcd34d',
    '--accent-cyan': '#f59e0b',
    '--accent-royal': '#d97706',
    '--accent-orange': '#ea580c',
    '--status-emerald': '#10b981',
    '--status-amber': '#f59e0b',
    '--status-rose': '#f43f5e',
  },
  'royal-violet': {
    '--bg-navy-deep': '#0f0a26',
    '--bg-navy-mid': '#1a1142',
    '--bg-navy-elevated': 'rgba(34, 22, 82, 0.76)',
    '--glass-surface': 'rgba(29, 19, 71, 0.68)',
    '--glass-surface-hover': 'rgba(46, 30, 107, 0.82)',
    '--glass-border': 'rgba(167, 139, 250, 0.3)',
    '--glass-highlight': 'rgba(221, 214, 254, 0.16)',
    '--text-primary': '#f5f3ff',
    '--text-secondary': '#ddd6fe',
    '--text-muted': '#c4b5fd',
    '--accent-cyan': '#a78bfa',
    '--accent-royal': '#7c3aed',
    '--accent-orange': '#f97316',
    '--status-emerald': '#10b981',
    '--status-amber': '#f59e0b',
    '--status-rose': '#f43f5e',
  },
};

export const CORE_THEMES_METADATA = [
  {
    id: 'navy-glass',
    name: 'Navy Glass',
    shortLabel: 'Navy Glass',
    badge: 'Dark • Default',
    isLight: false,
    accent: '#38bdf8',
    bgPreview: '#060d1f',
  },
  {
    id: 'daylight-civic',
    name: 'Daylight Civic',
    shortLabel: 'Daylight Civic',
    badge: 'Light • High Visibility',
    isLight: true,
    accent: '#0284c7',
    bgPreview: '#f1f5f9',
  },
  {
    id: 'emerald-hydro',
    name: 'Emerald Hydro',
    shortLabel: 'Emerald Hydro',
    badge: 'Dark • Waterway Ops',
    isLight: false,
    accent: '#10b981',
    bgPreview: '#041d1b',
  },
];

/**
 * Resolves a valid theme ID, falling back to 'navy-glass' if unknown.
 */
export function resolveValidThemeId(themeId) {
  if (themeId && Object.prototype.hasOwnProperty.call(THEME_CSS_VARIABLES, themeId)) {
    return themeId;
  }
  return 'navy-glass';
}

/**
 * Returns the map of CSS custom properties for a given theme ID.
 */
export function getThemeVariables(themeId) {
  const validId = resolveValidThemeId(themeId);
  return { ...THEME_CSS_VARIABLES[validId] };
}

/**
 * Deterministic toggle function cycling through the three core themes:
 * 'navy-glass' -> 'daylight-civic' -> 'emerald-hydro' -> 'navy-glass'
 */
export function getNextThemeId(currentThemeId, sequence = CORE_THEME_IDS) {
  const list = Array.isArray(sequence) && sequence.length > 0 ? sequence : CORE_THEME_IDS;
  const idx = list.indexOf(currentThemeId);
  if (idx === -1) {
    return list[0];
  }
  return list[(idx + 1) % list.length];
}

/**
 * Applies a theme's data-theme attribute and CSS custom properties to the DOM root element.
 */
export function applyThemeVariablesToRoot(themeId, doc = typeof document !== 'undefined' ? document : null) {
  const validId = resolveValidThemeId(themeId);
  const variables = getThemeVariables(validId);

  if (doc && doc.documentElement) {
    doc.documentElement.setAttribute('data-theme', validId);
    if (doc.body) {
      doc.body.setAttribute('data-theme', validId);
    }
    const isHighContrast = doc.documentElement.getAttribute('data-contrast') === 'high';
    if (!isHighContrast && doc.documentElement.style && typeof doc.documentElement.style.setProperty === 'function') {
      for (const [propName, propVal] of Object.entries(variables)) {
        doc.documentElement.style.setProperty(propName, propVal);
      }
    } else if (isHighContrast && doc.documentElement.style && typeof doc.documentElement.style.removeProperty === 'function') {
      for (const propName of Object.keys(variables)) {
        doc.documentElement.style.removeProperty(propName);
      }
    }
  }

  return {
    themeId: validId,
    variables,
  };
}
