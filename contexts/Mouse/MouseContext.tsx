import { createContext } from 'react'

// https://stackoverflow.com/questions/54127650/nextjs-and-context-api
// https://dev.to/shareef/context-api-with-typescript-and-next-js-2m25

type mouseContextType = {
  cursorType: string
  cursorChangeHandler: (cursorType: string) => void
}

const mouseContextDefaultValues: mouseContextType = {
  cursorType: 'default',
  cursorChangeHandler: () => {},
}

export const MouseContext = createContext<mouseContextType>(
  mouseContextDefaultValues,
)
