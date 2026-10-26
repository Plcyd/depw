import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  CORE_THEME_IDS,
  CORE_THEMES_METADATA,
  THEME_CSS_VARIABLES,
  resolveValidThemeId,
  getThemeVariables,
  getNextThemeId,
  applyThemeVariablesToRoot,
} from '../utils/themeConfig.js';
import { APP_THEMES } from '../utils/workflowRules.js';

export const ThemeContext = createContext({
  themeId: 'navy-glass',
  setThemeId: () => {},
  selectTheme: () => {},
  toggleTheme: () => {},
  toggleDaylightTheme: () => {},
  themeVariables: THEME_CSS_VARIABLES['navy-glass'],
  currentTheme: APP_THEMES[0],
  coreThemes: CORE_THEMES_METADATA,
  allThemes: APP_THEMES,
  isLightTheme: false,
});

export function ThemeProvider({ children, initialTheme }) {
  const [themeId, setThemeIdState] = useState(() => {
    if (initialTheme) {
      return resolveValidThemeId(initialTheme);
    }
    try {
      const saved =
        localStorage.getItem('depw_theme_id') ||
        localStorage.getItem('theme') ||
        'navy-glass';
      return resolveValidThemeId(saved);
    } catch {
      return 'navy-glass';
    }
  });

  const selectTheme = useCallback((nextThemeId) => {
    const validId = resolveValidThemeId(nextThemeId);
    setThemeIdState(validId);
    try {
      localStorage.setItem('depw_theme_id', validId);
      localStorage.setItem('theme', validId);
    } catch {
      // ignore storage errors
    }
    applyThemeVariablesToRoot(validId);
    return validId;
  }, []);

  // Cycles through the three core themes: 'navy-glass' -> 'daylight-civic' -> 'emerald-hydro'
  const toggleTheme = useCallback(() => {
    const nextId = getNextThemeId(themeId, CORE_THEME_IDS);
    return selectTheme(nextId);
  }, [themeId, selectTheme]);

  // Quick toggle between light ('daylight-civic') and dark ('navy-glass')
  const toggleDaylightTheme = useCallback(() => {
    const currentObj = APP_THEMES.find((t) => t.id === themeId);
    const nextId = currentObj?.isLight ? 'navy-glass' : 'daylight-civic';
    return selectTheme(nextId);
  }, [themeId, selectTheme]);

  useEffect(() => {
    applyThemeVariablesToRoot(themeId);
    try {
      localStorage.setItem('depw_theme_id', themeId);
      localStorage.setItem('theme', themeId);
    } catch {
      // ignore storage errors
    }
  }, [themeId]);

  const themeVariables = useMemo(() => getThemeVariables(themeId), [themeId]);
  const currentTheme = useMemo(
    () => APP_THEMES.find((t) => t.id === themeId) || APP_THEMES[0],
    [themeId]
  );
  const isLightTheme = Boolean(currentTheme?.isLight);

  const contextValue = useMemo(
    () => ({
      themeId,
      setThemeId: selectTheme,
      selectTheme,
      toggleTheme,
      toggleDaylightTheme,
      themeVariables,
      currentTheme,
      coreThemes: CORE_THEMES_METADATA,
      allThemes: APP_THEMES,
      isLightTheme,
    }),
    [
      themeId,
      selectTheme,
      toggleTheme,
      toggleDaylightTheme,
      themeVariables,
      currentTheme,
      isLightTheme,
    ]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
