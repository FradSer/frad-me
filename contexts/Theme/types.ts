export type ThemePreference = 'light' | 'dark' | 'system';

export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

export type ThemeModeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  themes: ThemePreference[];
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
  isMounted: boolean;
};
