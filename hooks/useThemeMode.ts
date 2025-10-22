'use client';

import { useContext } from 'react';

import { ThemeModeContext } from '@/contexts/Theme/ThemeModeContext';

export default function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (context === null) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }

  return context;
}
