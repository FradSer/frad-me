import { createContext } from 'react'

// https://stackoverflow.com/questions/54127650/nextjs-and-context-api
// https://dev.to/shareef/context-api-with-typescript-and-next-js-2m25

type mouseContextType = {
  cursorType: string
  cursorChangeHandler: (cursorType: string) => void
  attractorPosition: { x: number; y: number } | null
  setAttractorPosition: (position: { x: number; y: number } | null) => void
}

const mouseContextDefaultValues: mouseContextType = {
  cursorType: 'default',
  cursorChangeHandler: () => {},
  attractorPosition: null,
  setAttractorPosition: () => {},
}

export const MouseContext = createContext<mouseContextType>(
  mouseContextDefaultValues,
)
