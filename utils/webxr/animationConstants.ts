// Import centralized configuration
import WEBXR_ANIMATION_CONFIG, { 
  getSpringConfig, 
  getNavigationButtonPosition,
  getWorkCardPositions,
  type SpringConfigKey 
} from './animationConfig'

/**
 * @deprecated Use WEBXR_ANIMATION_CONFIG.physics.springs instead
 * This export is maintained for backward compatibility
 */
export const SPRING_CONFIGS = WEBXR_ANIMATION_CONFIG.physics.springs

/**
 * @deprecated Use WEBXR_ANIMATION_CONFIG.spatial.navigation instead
 * This export is maintained for backward compatibility
 */
export const NAVIGATION_POSITIONS = {
  navigationGroup: WEBXR_ANIMATION_CONFIG.spatial.navigation.group,
  navigationButton: WEBXR_ANIMATION_CONFIG.spatial.navigation.buttonOffset,
  navigationButtonAbsolute: getNavigationButtonPosition(),
} as const

/**
 * @deprecated Use WEBXR_ANIMATION_CONFIG.spatial.camera instead
 * This export is maintained for backward compatibility
 */
export const CAMERA_POSITIONS = WEBXR_ANIMATION_CONFIG.spatial.camera

/**
 * @deprecated Use WEBXR_ANIMATION_CONFIG.spatial.footer instead
 * This export is maintained for backward compatibility
 */
export const FOOTER_POSITIONS = {
  footerGroup: WEBXR_ANIMATION_CONFIG.spatial.footer.group,
  externalLinks: WEBXR_ANIMATION_CONFIG.spatial.footer.linksOffset,
} as const

/**
 * @deprecated Use WEBXR_ANIMATION_CONFIG.spatial.workGrid instead
 * This export is maintained for backward compatibility
 */
export const WORK_GRID_POSITIONS = {
  title: WEBXR_ANIMATION_CONFIG.spatial.workGrid.title,
  directionalLight: WEBXR_ANIMATION_CONFIG.spatial.workGrid.directionalLight,
  pointLight: WEBXR_ANIMATION_CONFIG.spatial.workGrid.pointLight,
} as const

/**
 * @deprecated Use WEBXR_ANIMATION_CONFIG.spatial.workCard and getWorkCardPositions() instead
 * This export is maintained for backward compatibility
 */
export const WORK_CARD_POSITIONS = getWorkCardPositions()

/**
 * @deprecated Use WEBXR_ANIMATION_CONFIG.spatial.immersiveButton instead
 * This export is maintained for backward compatibility
 */
export const IMMERSIVE_BUTTON_POSITIONS = WEBXR_ANIMATION_CONFIG.spatial.immersiveButton

/**
 * @deprecated Use WEBXR_ANIMATION_CONFIG.spatial.entrance instead
 * This export is maintained for backward compatibility
 */
export const ENTRANCE_POSITIONS = WEBXR_ANIMATION_CONFIG.spatial.entrance

/**
 * @deprecated Use WEBXR_ANIMATION_CONFIG.timing.transitions instead
 * This export is maintained for backward compatibility
 */
export const ANIMATION_DELAYS = {
  cardStagger: WEBXR_ANIMATION_CONFIG.timing.transitions.cardStagger / 1000, // Convert ms to seconds for backward compatibility
  sectionTransition: WEBXR_ANIMATION_CONFIG.timing.transitions.viewChange / 1000,
  cardEntranceDelay: WEBXR_ANIMATION_CONFIG.timing.transitions.cardEntrance / 1000,
  cardAnimationDuration: WEBXR_ANIMATION_CONFIG.timing.transitions.cardAnimationDuration,
} as const