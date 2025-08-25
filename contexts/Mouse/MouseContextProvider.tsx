import { type ReactNode, useState, useMemo, useCallback } from 'react';

import type { Position } from '@/types/common';
import { MouseContext, type CursorType } from '@/contexts/Mouse/MouseContext';

type MouseContextProps = {
  children: ReactNode;
};

export default function MouseContextProvider({
  children,
}: Readonly<MouseContextProps>) {
  const [cursorType, setCursorType] = useState<CursorType>('default');
  const [attractorPosition, setAttractorPosition] = useState<Position | null>(
    null,
  );

  const cursorChangeHandler = useCallback((newCursorType: CursorType) => {
    setCursorType(newCursorType);
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

  return (
    <MouseContext.Provider value={value}>{children}</MouseContext.Provider>
  );
}
