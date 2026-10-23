'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AVAILABLE_THEMES, DEFAULT_THEME, THEME_STORAGE_KEY } from './constants';
import { ThemeModeContext } from './ThemeModeContext';
import type { ResolvedTheme, ThemeModeContextValue, ThemePreference } from './types';

type ThemeModeProviderProps = {
  children: React.ReactNode;
};

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}

function parseThemePreference(value: string | null): ThemePreference {
  return AVAILABLE_THEMES.find((theme) => theme === value) ?? DEFAULT_THEME;
}

function readStoredTheme(): ThemePreference {
  try {
    return parseThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

export default function ThemeModeProvider({ children }: Readonly<ThemeModeProviderProps>) {
  const [theme, setThemeState] = useState<ThemePreference>(DEFAULT_THEME);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [isMounted, setIsMounted] = useState(false);

  // Hydrate from localStorage / system on mount — mirrors the inline script
  // in <ThemeScript> but without rendering a <script> inside the Client
  // Component tree (React 19 + Next 16 reject that).
  useEffect(() => {
    const initial = readStoredTheme();
    setThemeState(initial);
    setResolvedTheme(resolveTheme(initial));
    setIsMounted(true);
  }, []);

  // Keep document class in sync when the resolved theme changes after mount.
  useEffect(() => {
    if (!isMounted) return;
    applyTheme(resolvedTheme);
  }, [resolvedTheme, isMounted]);

  // React to system theme changes when preference is "system".
  useEffect(() => {
    if (theme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolvedTheme(getSystemTheme());
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme]);

  // Cross-tab sync via storage event.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = parseThemePreference(event.newValue);
      setThemeState(next);
      setResolvedTheme(resolveTheme(next));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleSetTheme = useCallback((value: ThemePreference) => {
    setThemeState(value);
    setResolvedTheme(resolveTheme(value));
    try {
      localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch {
      // Ignore storage failures (private mode, quota).
    }
  }, []);

  const toggleTheme = useCallback(() => {
    handleSetTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [handleSetTheme, resolvedTheme]);

  const contextValue = useMemo<ThemeModeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      themes: AVAILABLE_THEMES,
      setTheme: handleSetTheme,
      toggleTheme,
      isMounted,
    }),
    [theme, resolvedTheme, handleSetTheme, toggleTheme, isMounted],
  );

  return <ThemeModeContext.Provider value={contextValue}>{children}</ThemeModeContext.Provider>;
}
