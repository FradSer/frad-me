const addPositions = (
  a: [number, number, number],
  b: [number, number, number],
): [number, number, number] => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const NAVIGATION_BASE = {
  group: [0, 0, -1] as [number, number, number],
  buttonOffset: [2.5, 2.5, 0] as [number, number, number],
} as const;

export const NAVIGATION_POSITIONS = {
  navigationGroup: NAVIGATION_BASE.group,
  navigationButton: NAVIGATION_BASE.buttonOffset,
  navigationButtonAbsolute: addPositions(NAVIGATION_BASE.group, NAVIGATION_BASE.buttonOffset),
} as const;

export const CAMERA_POSITIONS = {
  home: {
    position: [0, 0, 5] as [number, number, number],
    lookAt: [0, 0, 0] as [number, number, number],
  },
  work: {
    position: [0, 2, 8] as [number, number, number],
    lookAt: [0, 0, 0] as [number, number, number],
  },
} as const;

const FOOTER_BASE = {
  group: [0, 0, -4] as [number, number, number],
  linksOffset: [3.5, -3, 0] as [number, number, number],
} as const;

export const FOOTER_POSITIONS = {
  footerGroup: FOOTER_BASE.group,
  externalLinks: FOOTER_BASE.linksOffset,
} as const;

export const WORK_GRID_POSITIONS = {
  title: [0, 5, 0] as [number, number, number],
  directionalLight: [5, 5, 5] as [number, number, number],
  pointLight: [-5, 3, 2] as [number, number, number],
} as const;

const CARD_BASE = {
  geometry: [4.5, 3, 1] as [number, number, number],
  titleOffset: -2,
  badgeOffset: [2, 1.2] as [number, number],
  layerSpacing: 0.1,
} as const;

export const WORK_CARD_POSITIONS = {
  cardGeometry: CARD_BASE.geometry,
  titleGroup: [0, CARD_BASE.titleOffset, CARD_BASE.layerSpacing] as [number, number, number],
  descriptionGroup: [0, CARD_BASE.titleOffset - 0.8, CARD_BASE.layerSpacing] as [
    number,
    number,
    number,
  ],
  wipBadgeGroup: [CARD_BASE.badgeOffset[0], CARD_BASE.badgeOffset[1], CARD_BASE.layerSpacing] as [
    number,
    number,
    number,
  ],
  wipBadgeBackground: [0, 0, -CARD_BASE.layerSpacing] as [number, number, number],
} as const;

export const IMMERSIVE_BUTTON_POSITIONS = {
  button: [0, -2, -3] as [number, number, number],
  textGroup: [0, 0, 0.001] as [number, number, number],
} as const;

export const ENTRANCE_POSITIONS = {
  workDefault: [0, 0, -8] as [number, number, number],
  heroDefault: [0, 0, -5] as [number, number, number],
} as const;

export const ANIMATION_DELAYS = {
  cardStagger: 0.15,
  sectionTransition: 0.3,
  cardEntranceDelay: 0.4,
  cardAnimationDuration: 1200,
} as const;
