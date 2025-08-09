export const SPRING_CONFIGS = {
  gentle: { tension: 120, friction: 14 },
  navScale: { tension: 300, friction: 30 },
  workOpacity: { tension: 280, friction: 60 },
  cardHover: { tension: 400, friction: 30 },
  cardPosition: { tension: 200, friction: 25 },
} as const

// Navigation and UI positions
export const NAVIGATION_POSITIONS = {
  // Navigation3D positioning
  navigationGroup: [0, 0, -3] as [number, number, number],
  navigationButton: [2.5, 2, 0] as [number, number, number],
  // Combined position: [0, 0, -3] + [2.5, 2, 0] = [2.5, 2, -3]
  navigationButtonAbsolute: [2.5, 2, -3] as [number, number, number],
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

// Footer and external links positioning
export const FOOTER_POSITIONS = {
  footerGroup: [0, 0, -4] as [number, number, number],
  externalLinks: [2, -2.5, 0] as [number, number, number],
} as const

// Work grid and lighting positions
export const WORK_GRID_POSITIONS = {
  title: [0, 5, 0] as [number, number, number],
  directionalLight: [5, 5, 5] as [number, number, number],
  pointLight: [-5, 3, 2] as [number, number, number],
} as const

// WorkCard3D internal positions
export const WORK_CARD_POSITIONS = {
  cardGeometry: [3, 2, 1] as [number, number, number], // planeGeometry args
  titleGroup: [0, -1.5, 0.1] as [number, number, number],
  descriptionGroup: [0, -2.1, 0.1] as [number, number, number],
  wipBadgeGroup: [1.3, 0.8, 0.1] as [number, number, number],
  wipBadgeBackground: [0, 0, -0.1] as [number, number, number],
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
  cardStagger: 0.1,
  sectionTransition: 0.3,
} as const