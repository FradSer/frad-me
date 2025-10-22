'use client';

import { createContext } from 'react';

import type { ThemeModeContextValue } from './types';

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(
  null,
);
