export const SPRING_STIFFNESS = {
  primary: 100,
  secondary: 50,
} as const;

const primaryTransition = {
  type: 'spring' as const,
  stiffness: SPRING_STIFFNESS.primary,
};

const secondaryTransition = {
  type: 'spring' as const,
  stiffness: SPRING_STIFFNESS.secondary,
};

export { primaryTransition, secondaryTransition };
