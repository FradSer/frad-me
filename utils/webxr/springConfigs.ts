export const springConfigs = {
  gentle: { 
    tension: 120, 
    friction: 14,
    mass: 1,
    precision: 0.01,
  },
  snappy: { 
    tension: 180, 
    friction: 12,
    mass: 1,
    precision: 0.01,
  },
  wobbly: { 
    tension: 180, 
    friction: 20,
    mass: 1,
    precision: 0.01,
  },
  heroTransition: {
    tension: 120,
    friction: 16,
    mass: 1.2,
    precision: 0.001,
  },
  cardEntrance: {
    tension: 140,
    friction: 18,
    mass: 0.8,
    precision: 0.01,
  },
  navigation: {
    tension: 200,
    friction: 10,
    mass: 0.6,
    precision: 0.01,
  },
} as const

export type SpringConfigKey = keyof typeof springConfigs

export const transitionTimings = {
  heroFade: 800,
  footerDisappear: 400,
  cardStagger: 100,
  cardEntrance: 600,
  navigationHover: 200,
} as const

export const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export const easeOut = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

export const easeIn = (t: number): number => {
  return t * t * t
}