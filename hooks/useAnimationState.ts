import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimpleLerp, springConfigToLerpSpeed } from './useSimpleLerp';
import { heroAnimationStates } from '@/utils/webxr/animationHelpers';
import { WEBXR_ANIMATION_CONFIG } from '@/utils/webxr/animationConfig';

export interface AnimationState {
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  opacity: number;
}

export interface UseAnimationStateOptions {
  initialState?: AnimationState;
  springConfig?: typeof WEBXR_ANIMATION_CONFIG.springs.elastic;
}

export const useAnimationState = (
  currentView: 'home' | 'work',
  options: UseAnimationStateOptions = {}
) => {
  const {
    initialState = heroAnimationStates.home,
    springConfig = WEBXR_ANIMATION_CONFIG.springs.elastic,
  } = options;

  const currentViewRef = useRef(currentView);
  const lerpConfig = { speed: springConfigToLerpSpeed(springConfig) };

  // Initialize all lerp values with initial state
  const positionX = useSimpleLerp(initialState.position.x, lerpConfig);
  const positionY = useSimpleLerp(initialState.position.y, lerpConfig);
  const positionZ = useSimpleLerp(initialState.position.z, lerpConfig);
  const scaleX = useSimpleLerp(initialState.scale.x, lerpConfig);
  const scaleY = useSimpleLerp(initialState.scale.y, lerpConfig);
  const scaleZ = useSimpleLerp(initialState.scale.z, lerpConfig);
  const opacity = useSimpleLerp(initialState.opacity, lerpConfig);

  // Update spring targets when view changes
  const updateTargets = (targetState: AnimationState) => {
    positionX.set(targetState.position.x);
    positionY.set(targetState.position.y);
    positionZ.set(targetState.position.z);
    scaleX.set(targetState.scale.x);
    scaleY.set(targetState.scale.y);
    scaleZ.set(targetState.scale.z);
    opacity.set(targetState.opacity);
  };

  // Handle view changes in frame for consistent timing
  const handleViewChange = () => {
    if (currentViewRef.current !== currentView) {
      const targetState =
        currentView === 'work'
          ? heroAnimationStates.hidden
          : heroAnimationStates.home;

      updateTargets(targetState);
      currentViewRef.current = currentView;
    }
  };

  return {
    values: {
      position: { x: positionX.value, y: positionY.value, z: positionZ.value },
      scale: { x: scaleX.value, y: scaleY.value, z: scaleZ.value },
      opacity: opacity.value,
    },
    handleViewChange,
  };
};