// Enhanced spring configurations for more dynamic animations
export const SPRING_CONFIGS = {
  slow: { tension: 180, friction: 20 },     // Enhanced gentle animations with more spring
  normal: { tension: 280, friction: 28 },   // Enhanced standard animations with bouncy feel
  fast: { tension: 450, friction: 35 },     // Enhanced quick responses with strong spring
  bouncy: { tension: 320, friction: 22 },   // New config for extra bouncy effects
  elastic: { tension: 400, friction: 25 },  // New config for elastic entrance effects
} as const

// Utility function to combine positions
const addPositions = (
  a: [number, number, number], 
  b: [number, number, number]
): [number, number, number] => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

// Base navigation positions
const NAVIGATION_BASE = {
  group: [0, 0, -3] as [number, number, number],
  buttonOffset: [2.5, 2.8, 2] as [number, number, number], // Right-aligned with hero + distance
} as const

// Navigation positions (computed)
export const NAVIGATION_POSITIONS = {
  navigationGroup: NAVIGATION_BASE.group,
  navigationButton: NAVIGATION_BASE.buttonOffset,
  // Computed absolute position
  navigationButtonAbsolute: addPositions(NAVIGATION_BASE.group, NAVIGATION_BASE.buttonOffset),
} as const

// Camera positions for different views
export const CAMERA_POSITIONS = {
  home: {
    position: [0, 0, 5] as [number, number, number], 
    lookAt: [0, 0, 0] as [number, number, number]
  },
  work: {
    position: [0, 2, 8] as [number, number, number], 
    lookAt: [0, 0, 0] as [number, number, number]
  }
} as const

// Base positions for related elements
const FOOTER_BASE = {
  group: [0, 0, -4] as [number, number, number],
  linksOffset: [2.4, -2.5, 2] as [number, number, number], // Right-aligned with hero + distance
} as const

// Footer positions (computed)
export const FOOTER_POSITIONS = {
  footerGroup: FOOTER_BASE.group,
  externalLinks: FOOTER_BASE.linksOffset,
  // Could add computed absolute positions if needed
} as const

// Work grid and lighting positions
export const WORK_GRID_POSITIONS = {
  title: [0, 5, 0] as [number, number, number],
  directionalLight: [5, 5, 5] as [number, number, number],
  pointLight: [-5, 3, 2] as [number, number, number],
} as const

// Base card dimensions and spacing
const CARD_BASE = {
  geometry: [3, 2, 1] as [number, number, number], // planeGeometry args
  titleOffset: -1.5,    // Distance below card center for title
  badgeOffset: [1.3, 0.8] as [number, number], // Badge position from center
  layerSpacing: 0.1,    // Z-spacing between elements
} as const

// WorkCard3D positions (computed)
export const WORK_CARD_POSITIONS = {
  cardGeometry: CARD_BASE.geometry,
  titleGroup: [0, CARD_BASE.titleOffset, CARD_BASE.layerSpacing] as [number, number, number],
  descriptionGroup: [0, CARD_BASE.titleOffset - 0.6, CARD_BASE.layerSpacing] as [number, number, number],
  wipBadgeGroup: [CARD_BASE.badgeOffset[0], CARD_BASE.badgeOffset[1], CARD_BASE.layerSpacing] as [number, number, number],
  wipBadgeBackground: [0, 0, -CARD_BASE.layerSpacing] as [number, number, number],
} as const

// Immersive button positioning
export const IMMERSIVE_BUTTON_POSITIONS = {
  button: [0, -2, -3] as [number, number, number],
  textGroup: [0, 0, 0.001] as [number, number, number],
} as const

export const ENTRANCE_POSITIONS = {
  workDefault: [0, 0, -8] as [number, number, number],  // Push work section further back
  heroDefault: [0, 0, -5] as [number, number, number], // Hero text at comfortable distance
} as const

export const ANIMATION_DELAYS = {
  cardStagger: 0.15,  // Increased for more noticeable staggered effect
  sectionTransition: 0.3,
  cardEntranceDelay: 0.4,  // Increased base delay for better visual impact
  cardAnimationDuration: 1200,  // Extended animation duration in ms
} as const