import { createContext } from 'react';

import type { Position } from '@/types/common';

export type CursorType =
  | 'default'
  | 'header-link-hovered'
  | 'work-card-hovered'
  | 'work-card-hovered-wip'
  | 'attracted';

export type MouseContextType = {
  cursorType: CursorType;
  cursorChangeHandler: (cursorType: CursorType) => void;
  attractorPosition: Position | null;
  setAttractorPosition: (position: Position | null) => void;
};

const defaultContext: MouseContextType = {
  cursorType: 'default',
  cursorChangeHandler: () => {},
  attractorPosition: null,
  setAttractorPosition: () => {},
};

export const MouseContext = createContext<MouseContextType>(defaultContext);
