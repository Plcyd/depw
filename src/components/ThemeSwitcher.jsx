import React from 'react';
import { Sun, Moon, Palette, Droplets, RefreshCw } from 'lucide-react';
import { APP_THEMES } from '../utils/workflowRules.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeSwitcher({ themeId: propThemeId, onThemeChange, showToast }) {
  const {
    themeId: contextThemeId,
    selectTheme,
    toggleTheme,
    coreThemes,
  } = useTheme();

  const activeThemeId = propThemeId || contextThemeId || 'navy-glass';

  const applyAndPersistTheme = (nextThemeId) => {
    const resolved = selectTheme(nextThemeId);
    if (onThemeChange) {
      onThemeChange(resolved);
    }
    const selected = APP_THEMES.find((t) => t.id === resolved);
    if (selected && showToast) {
      showToast(
        `Theme switched to ${selected.name} (${selected.badge}) — CSS variables updated`,
        'info'
      );
    }
  };

  const handleCycleCoreThemes = () => {
    const nextId = toggleTheme();
    if (onThemeChange) {
      onThemeChange(nextId);
    }
    const selected = APP_THEMES.find((t) => t.id === nextId);
    if (selected && showToast) {
      showToast(
        `Cycled theme to ${selected.name} (${nextId})`,
        'info'
      );
    }
  };

  const getCoreIcon = (id) => {
    if (id === 'daylight-civic') return <Sun size={12} style={{ color: '#d97706' }} />;
    if (id === 'emerald-hydro') return <Droplets size={12} style={{ color: '#10b981' }} />;
    return <Moon size={12} style={{ color: '#38bdf8' }} />;
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: 'var(--bg-navy-elevated)',
        border: '1px solid var(--glass-border)',
        borderRadius: '10px',
        padding: '3px 6px',
        flexWrap: 'wrap',
      }}
    >
      {/* 3-Way Segmented Quick Pills for 'navy-glass', 'daylight-civic', and 'emerald-hydro' */}
      <div
        role="group"
        aria-label="Core Theme Switcher"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
        }}
      >
        {coreThemes.map((t) => {
          const isActive = activeThemeId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => applyAndPersistTheme(t.id)}
              aria-pressed={isActive}
              aria-label={`Switch to ${t.name} (${t.id}) Theme`}
              title={`${t.name} (${t.id})`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '7px',
                border: isActive
                  ? '1px solid var(--accent-cyan)'
                  : '1px solid transparent',
                background: isActive
                  ? 'rgba(56, 189, 248, 0.18)'
                  : 'transparent',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {getCoreIcon(t.id)}
              <span>{t.id === 'navy-glass' ? 'Navy' : t.id === 'daylight-civic' ? 'Daylight' : 'Emerald'}</span>
            </button>
          );
        })}
      </div>

      {/* 1-Click Cycle Button across 'navy-glass' -> 'daylight-civic' -> 'emerald-hydro' */}
      <button
        type="button"
        onClick={handleCycleCoreThemes}
        aria-label="Toggle Theme (Cycle Navy Glass, Daylight Civic, Emerald Hydro)"
        title="Cycle between 'navy-glass', 'daylight-civic', and 'emerald-hydro'"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 7px',
          borderRadius: '7px',
          border: '1px solid var(--glass-border)',
          background: 'rgba(255, 255, 255, 0.06)',
          color: 'var(--text-secondary)',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <RefreshCw size={11} />
      </button>

      {/* Full Data-Theme Selector Dropdown */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <Palette size={13} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
        <label htmlFor="theme-selector" className="sr-only">
          Select Visual Theme
        </label>
        <select
          id="theme-selector"
          aria-label="Select Visual Theme"
          value={activeThemeId}
          onChange={(e) => applyAndPersistTheme(e.target.value)}
          style={{
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '11.5px',
            fontWeight: 600,
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            paddingRight: '4px',
          }}
        >
          {APP_THEMES.map((t) => (
            <option
              key={t.id}
              value={t.id}
              style={{
                background: '#0f172a',
                color: '#ffffff',
              }}
            >
              {t.isLight ? '☀️ ' : '🌙 '} {t.name} ({t.badge})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
