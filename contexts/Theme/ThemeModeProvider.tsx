'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AVAILABLE_THEMES, DEFAULT_THEME, THEME_STORAGE_KEY } from './constants';
import { ThemeModeContext } from './ThemeModeContext';
import type { ResolvedTheme, ThemeModeContextValue, ThemePreference } from './types';

type ThemeModeProviderProps = {
  children: React.ReactNode;
};

export default function ThemeModeProvider({ children }: Readonly<ThemeModeProviderProps>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={DEFAULT_THEME}
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      <ThemeContextBridge>{children}</ThemeContextBridge>
    </NextThemesProvider>
  );
}

const ThemeContextBridge = ({ children }: ThemeModeProviderProps) => {
  const { theme, resolvedTheme, themes, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const safeTheme = (theme ?? DEFAULT_THEME) as ThemePreference;
  const safeResolvedTheme = (resolvedTheme ?? 'light') as ResolvedTheme;

  const availableThemes = useMemo(
    () => (themes?.length ? (themes as ThemePreference[]) : AVAILABLE_THEMES),
    [themes],
  );

  const handleSetTheme = useCallback(
    (value: ThemePreference) => {
      setTheme(value);
    },
    [setTheme],
  );

  const toggleTheme = useCallback(() => {
    handleSetTheme(safeResolvedTheme === 'dark' ? 'light' : 'dark');
  }, [handleSetTheme, safeResolvedTheme]);

  const contextValue = useMemo<ThemeModeContextValue>(
    () => ({
      theme: safeTheme,
      resolvedTheme: safeResolvedTheme,
      themes: availableThemes,
      setTheme: handleSetTheme,
      toggleTheme,
      isMounted,
    }),
    [availableThemes, handleSetTheme, isMounted, safeResolvedTheme, safeTheme, toggleTheme],
  );

  return <ThemeModeContext.Provider value={contextValue}>{children}</ThemeModeContext.Provider>;
};
