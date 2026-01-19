import { useFrame } from '@react-three/fiber';
import { type RefObject, useEffect, useRef } from 'react';
import type * as THREE from 'three';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { springConfigToLerpSpeed, useSimpleLerp } from '@/hooks/useSimpleLerp';
import { WEBXR_ANIMATION_CONFIG } from '@/utils/webxr/animationConfig';
import { workCardPositions } from '@/utils/webxr/animationHelpers';
import { applyOpacityToObject } from '@/utils/webxr/materialUtils';

interface UseCardAnimationProps {
  groupRef: RefObject<THREE.Group | null>;
  visible: boolean;
  hovered: boolean;
  position: [number, number, number];
  index: number;
  onOpacityChange?: (opacity: number) => void;
}

interface AnimationState {
  isInitialized: boolean;
  startTime: number;
}

const OPACITY_THRESHOLD = 0.01;

const createSpringConfig = (preset: keyof typeof WEBXR_ANIMATION_CONFIG.springs) => ({
  speed: springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs[preset]),
});

export function useCardAnimation({
  groupRef,
  visible: _visible,
  hovered,
  position,
  index,
  onOpacityChange,
}: UseCardAnimationProps) {
  const { currentView } = useWebXRView();
  const animationState = useRef<AnimationState>({
    isInitialized: false,
    startTime: 0,
  });

  const shouldShowCards = currentView === 'work';
  const lastOpacityRef = useRef(-1);

  const springScale = useSimpleLerp(
    WEBXR_ANIMATION_CONFIG.scales.entrance,
    createSpringConfig('fast'),
  );
  const springOpacity = useSimpleLerp(
    WEBXR_ANIMATION_CONFIG.opacity.hidden,
    createSpringConfig('elastic'),
  );
  const springRotation = useSimpleLerp(0, createSpringConfig('fast'));

  const springPosX = useSimpleLerp(workCardPositions.entrance.x, createSpringConfig('elastic'));
  const springPosY = useSimpleLerp(workCardPositions.entrance.y, createSpringConfig('elastic'));
  const springPosZ = useSimpleLerp(workCardPositions.entrance.z, createSpringConfig('elastic'));

  useEffect(() => {
    const { scales, opacity, timing } = WEBXR_ANIMATION_CONFIG;
    const { entrance } = workCardPositions;

    if (shouldShowCards && groupRef.current) {
      springScale.set(scales.entrance);
      springOpacity.set(opacity.hidden);
      springRotation.set(0);

      springPosX.set(entrance.x);
      springPosY.set(entrance.y);
      springPosZ.set(entrance.z);

      animationState.current.isInitialized = true;
      animationState.current.startTime =
        Date.now() + (timing.delays.cardEntranceDelay + index * timing.delays.cardStagger);

      applyOpacityToObject(groupRef.current, opacity.hidden);
      groupRef.current.visible = false;
    } else if (!shouldShowCards) {
      springScale.set(scales.entrance);
      springOpacity.set(opacity.hidden);
      springRotation.set(0);

      springPosX.set(entrance.x);
      springPosY.set(entrance.y);
      springPosZ.set(entrance.z);

      animationState.current.isInitialized = false;
      animationState.current.startTime = 0;

      if (groupRef.current) {
        applyOpacityToObject(groupRef.current, opacity.hidden);
        groupRef.current.visible = false;
      }
    }
  }, [
    shouldShowCards,
    index,
    springOpacity,
    springPosX,
    springPosY,
    springPosZ,
    springRotation,
    springScale,
    groupRef,
  ]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    if (shouldShowCards) {
      const currentTime = Date.now();
      const shouldAnimate = currentTime >= animationState.current.startTime;

      if (!shouldAnimate) {
        group.visible = false;
        group.position.set(springPosX.value, springPosY.value, springPosZ.value);
        group.scale.setScalar(springScale.value);
        group.rotation.y = springRotation.value;

        const targetRotation = hovered
          ? WEBXR_ANIMATION_CONFIG.positions.workCards.rotation.hover
          : WEBXR_ANIMATION_CONFIG.positions.workCards.rotation.idle;
        springRotation.set(targetRotation);

        const hiddenOpacity = WEBXR_ANIMATION_CONFIG.opacity.hidden;
        if (Math.abs(hiddenOpacity - lastOpacityRef.current) > 0.001) {
          applyOpacityToObject(group, hiddenOpacity);
          onOpacityChange?.(hiddenOpacity);
          lastOpacityRef.current = hiddenOpacity;
        }
        return;
      }

      group.visible = true;

      const targetScale = hovered
        ? WEBXR_ANIMATION_CONFIG.scales.hover
        : WEBXR_ANIMATION_CONFIG.scales.default;
      const targetOpacity = WEBXR_ANIMATION_CONFIG.opacity.visible;
      const targetRotation = hovered
        ? WEBXR_ANIMATION_CONFIG.positions.workCards.rotation.hover
        : WEBXR_ANIMATION_CONFIG.positions.workCards.rotation.idle;

      const floatingOffset = Math.sin(state.clock.elapsedTime + index) * 0.1;
      const [finalX, finalY, finalZ] = position;
      const adjustedY = finalY + (hovered ? workCardPositions.hover.y : floatingOffset);
      const adjustedZ = finalZ + (hovered ? workCardPositions.hover.z : 0);

      springPosX.set(finalX);
      springPosY.set(adjustedY);
      springPosZ.set(adjustedZ);

      group.position.set(springPosX.value, springPosY.value, springPosZ.value);

      springScale.set(targetScale);
      springOpacity.set(targetOpacity);
      springRotation.set(targetRotation);

      group.scale.setScalar(springScale.value);
      group.rotation.y = springRotation.value;

      const currentOpacity = springOpacity.value;
      if (Math.abs(currentOpacity - lastOpacityRef.current) > 0.001) {
        applyOpacityToObject(group, currentOpacity);
        onOpacityChange?.(currentOpacity);
        lastOpacityRef.current = currentOpacity;
      }
    } else {
      springScale.set(WEBXR_ANIMATION_CONFIG.scales.entrance);
      springOpacity.set(WEBXR_ANIMATION_CONFIG.opacity.hidden);
      springRotation.set(0);

      springPosX.set(workCardPositions.entrance.x);
      springPosY.set(workCardPositions.entrance.y);
      springPosZ.set(workCardPositions.entrance.z);

      const currentOpacity = springOpacity.value;
      group.visible = currentOpacity > OPACITY_THRESHOLD;

      if (group.visible) {
        group.position.set(springPosX.value, springPosY.value, springPosZ.value);
        group.scale.setScalar(springScale.value);
        group.rotation.y = springRotation.value;

        if (Math.abs(currentOpacity - lastOpacityRef.current) > 0.001) {
          applyOpacityToObject(group, currentOpacity);
          lastOpacityRef.current = currentOpacity;
        }
      }

      // Always report opacity change even if we didn't update the object (it might be invisible)
      if (Math.abs(currentOpacity - lastOpacityRef.current) > 0.001) {
        onOpacityChange?.(currentOpacity);
      }
    }
  });

  return {
    isAnimated: animationState.current.isInitialized,
  };
}
