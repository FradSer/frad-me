import { ReactNode, useState, useMemo } from 'react'

import { MouseContext } from '@/contexts/Mouse/MouseContext'

type MouseContextProps = {
  children: ReactNode
}

export default function MouseContextProvider({
  children,
}: Readonly<MouseContextProps>) {
  const [cursorType, setCursorType] = useState<string>('default')

  const cursorChangeHandler = (cursorType: string) => {
    setCursorType(cursorType)
  }

  const value = useMemo(() => {
    return {
      cursorType: cursorType,
      cursorChangeHandler: cursorChangeHandler,
    }
  }, [cursorType])

  return <MouseContext.Provider value={value}>{children}</MouseContext.Provider>
}
