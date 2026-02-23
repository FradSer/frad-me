import { createContext } from 'react';

import type { Position } from '@/types/common';

export enum CursorType {
  default = 'default',
  headerLinkHovered = 'header-link-hovered',
  workCardHovered = 'work-card-hovered',
  workCardHoveredWIP = 'work-card-hovered-wip',
  attracted = 'attracted',
}

export type MouseContextType = {
  cursorType: CursorType;
  cursorChangeHandler: (cursorType: CursorType) => void;
  attractorPosition: Position | null;
  setAttractorPosition: (position: Position | null) => void;
};

const defaultContext: MouseContextType = {
  cursorType: CursorType.default,
  cursorChangeHandler: () => {},
  attractorPosition: null,
  setAttractorPosition: () => {},
};

export const MouseContext = createContext<MouseContextType>(defaultContext);
