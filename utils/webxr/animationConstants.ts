export const SPRING_CONFIGS = {
  gentle: { tension: 120, friction: 14 },
  navScale: { tension: 300, friction: 30 },
  workOpacity: { tension: 280, friction: 60 },
  cardHover: { tension: 400, friction: 30 },
  cardPosition: { tension: 200, friction: 25 },
} as const

export const ENTRANCE_POSITIONS = {
  workDefault: [0, 0, -8] as [number, number, number],  // Push work section further back
  heroDefault: [0, 0, -5] as [number, number, number], // Hero text at comfortable distance
} as const

export const ANIMATION_DELAYS = {
  cardStagger: 0.1,
  sectionTransition: 0.3,
} as const