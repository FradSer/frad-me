import type { ThemePreference } from './types';

export const THEME_STORAGE_KEY = 'theme';

export const DEFAULT_THEME: ThemePreference = 'system';

export const AVAILABLE_THEMES: ThemePreference[] = ['light', 'dark', 'system'];
