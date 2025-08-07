// Base configurations to eliminate duplication
const baseConfig = {
  mass: 1,
  precision: 0.01,
} as const

const performantConfig = {
  ...baseConfig,
  mass: 0.8,
} as const

export const springConfigs = {
  gentle: { ...baseConfig, tension: 120, friction: 14 },
  snappy: { ...baseConfig, tension: 180, friction: 12 },
  wobbly: { ...baseConfig, tension: 180, friction: 20 },
  heroTransition: { ...baseConfig, tension: 120, friction: 16, mass: 1.2, precision: 0.001 },
  cardEntrance: { ...performantConfig, tension: 140, friction: 18 },
  navigation: { ...performantConfig, tension: 200, friction: 10, mass: 0.6 },
} as const

export type SpringConfigKey = keyof typeof springConfigs

export const transitionTimings = {
  heroFade: 800,
  footerDisappear: 400,
  cardStagger: 100,
  cardEntrance: 600,
  navigationHover: 200,
} as const

// Note: These can be replaced with react-spring's built-in easing
// import { config } from '@react-spring/core'
// Use config.default, config.gentle, config.wobbly, etc. instead