import { ReactNode, useState } from 'react'

import { MouseContext } from './MouseContext'

type MouseContextProps = {
  children: ReactNode
}

export default function MouseContextProvider({ children }: MouseContextProps) {
  const [cursorType, setCursorType] = useState<string>('default')

  const cursorChangeHandler = (cursorType: string) => {
    setCursorType(cursorType)
  }

  const value = {
    cursorType: cursorType,
    cursorChangeHandler: cursorChangeHandler,
  }

  return <MouseContext.Provider value={value}>{children}</MouseContext.Provider>
}
