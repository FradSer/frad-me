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

  // Hydrate from localStorage / system on mount — mirrors next-themes logic
  // but without rendering a <script> inside the Client Component tree
  // (which React 19 + Next 16 flags as
  // "Encountered a script tag while rendering React component").
  // The FOUC-prevention inline script lives in <ThemeScript> (Server Component).
  useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
      } catch {
        return null;
      }
    })();
    const initial = stored ?? DEFAULT_THEME;
    setThemeState(initial);
    const resolved = initial === 'system' ? getSystemTheme() : (initial as ResolvedTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    setIsMounted(true);
  }, []);

  // Keep document class in sync when theme/resolved changes after mount
  useEffect(() => {
    if (!isMounted) return;
    applyTheme(resolvedTheme);
  }, [resolvedTheme, isMounted]);

  // React to system theme changes when preference is "system"
  useEffect(() => {
    if (theme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const next = getSystemTheme();
      setResolvedTheme(next);
    };
    // addEventListener is modern; fallback to addListener for older
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
  }, [theme]);

  // Cross-tab sync via storage event
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      const next = (e.newValue as ThemePreference | null) ?? DEFAULT_THEME;
      setThemeState(next);
      setResolvedTheme(next === 'system' ? getSystemTheme() : (next as ResolvedTheme));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleSetTheme = useCallback((value: ThemePreference) => {
    setThemeState(value);
    const resolved = value === 'system' ? getSystemTheme() : (value as ResolvedTheme);
    setResolvedTheme(resolved);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch {
      // ignore
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
