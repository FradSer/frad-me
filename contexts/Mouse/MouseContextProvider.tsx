import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CursorType, MouseContext } from '@/contexts/Mouse/MouseContext';
import type { Position } from '@/types/common';

type MouseContextProps = {
  children: ReactNode;
};

const WORK_CARD_RESET_DEBOUNCE_MS = 50;

export default function MouseContextProvider({ children }: Readonly<MouseContextProps>) {
  const [cursorType, setCursorType] = useState<CursorType>(CursorType.default);
  const [attractorPosition, setAttractorPosition] = useState<Position | null>(null);
  const cursorTypeRef = useRef<CursorType>(CursorType.default);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cursorChangeHandler = useCallback((newCursorType: CursorType) => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    const current = cursorTypeRef.current;
    if (
      (current === CursorType.workCardHovered || current === CursorType.workCardHoveredWIP) &&
      newCursorType === CursorType.default
    ) {
      resetTimeoutRef.current = setTimeout(() => {
        cursorTypeRef.current = CursorType.default;
        setCursorType(CursorType.default);
      }, WORK_CARD_RESET_DEBOUNCE_MS);
    } else {
      cursorTypeRef.current = newCursorType;
      setCursorType(newCursorType);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      cursorType,
      cursorChangeHandler,
      attractorPosition,
      setAttractorPosition,
    }),
    [cursorType, attractorPosition, cursorChangeHandler],
  );

  return <MouseContext.Provider value={value}>{children}</MouseContext.Provider>;
}
