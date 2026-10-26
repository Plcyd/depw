import React from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { APP_THEMES } from '../utils/workflowRules.js';

export default function ThemeSwitcher({ themeId, onThemeChange, showToast }) {
  const currentThemeObj = APP_THEMES.find((t) => t.id === themeId) || APP_THEMES[0];
  const isLightMode = Boolean(currentThemeObj?.isLight);

  const applyAndPersistTheme = (nextThemeId) => {
    try {
      localStorage.setItem('depw_theme_id', nextThemeId);
      localStorage.setItem('theme', nextThemeId);
    } catch {
      // ignore storage errors
    }
    document.documentElement.setAttribute('data-theme', nextThemeId);
    if (document.body) {
      document.body.setAttribute('data-theme', nextThemeId);
    }
    if (onThemeChange) {
      onThemeChange(nextThemeId);
    }
    const selected = APP_THEMES.find((t) => t.id === nextThemeId);
    if (selected && showToast) {
      showToast(
        `Theme switched to ${selected.name} (${selected.badge}) — Saved to browser`,
        'info'
      );
    }
  };

  const handleQuickToggleDayNight = () => {
    const nextThemeId = isLightMode ? 'navy-glass' : 'daylight-civic';
    applyAndPersistTheme(nextThemeId);
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--bg-navy-elevated)',
        border: '1px solid var(--glass-border)',
        borderRadius: '10px',
        padding: '3px 6px',
      }}
    >
      {/* 1-Click Quick Toggle between Navy Glass and Daylight Civic */}
      <button
        type="button"
        onClick={handleQuickToggleDayNight}
        aria-label={
          isLightMode
            ? 'Switch to Navy Glass Dark Theme'
            : 'Switch to Daylight Civic Light Theme'
        }
        title={
          isLightMode
            ? 'Pindutin para sa Madilim na Kulay (Navy Glass)'
            : 'Pindutin para sa Maliwanag na Kulay (Daylight Civic)'
        }
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 9px',
          borderRadius: '7px',
          border: '1px solid var(--glass-border)',
          background: isLightMode
            ? 'rgba(2, 132, 199, 0.14)'
            : 'rgba(56, 189, 248, 0.16)',
          color: 'var(--text-primary)',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 150ms ease',
        }}
      >
        {isLightMode ? (
          <>
            <Sun size={13} style={{ color: '#d97706' }} />
            <span>Daylight</span>
          </>
        ) : (
          <>
            <Moon size={13} style={{ color: '#38bdf8' }} />
            <span>Navy Dark</span>
          </>
        )}
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
          value={themeId}
          onChange={(e) => applyAndPersistTheme(e.target.value)}
          style={{
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '12px',
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
