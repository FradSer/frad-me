import { ReactNode, useState, useMemo } from 'react'

import { MouseContext } from '@/contexts/Mouse/MouseContext'

type MouseContextProps = {
  children: ReactNode
}

export default function MouseContextProvider({
  children,
}: Readonly<MouseContextProps>) {
  const [cursorType, setCursorType] = useState<string>('default')
  const [attractorPosition, setAttractorPosition] = useState<{ x: number; y: number } | null>(null)

  const cursorChangeHandler = (cursorType: string) => {
    setCursorType(cursorType)
  }

  const value = useMemo(() => {
    return {
      cursorType: cursorType,
      cursorChangeHandler: cursorChangeHandler,
      attractorPosition: attractorPosition,
      setAttractorPosition: setAttractorPosition,
    }
  }, [cursorType, attractorPosition])

  return <MouseContext.Provider value={value}>{children}</MouseContext.Provider>
}
