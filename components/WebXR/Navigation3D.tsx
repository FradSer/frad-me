import { useFrame } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { springConfigToLerpSpeed, useSimpleLerp } from '@/hooks/useSimpleLerp';
import { measureChunkLoad } from '@/utils/performance';
import { WEBXR_ANIMATION_CONFIG } from '@/utils/webxr/animationConfig';
import { NAVIGATION_POSITIONS } from '@/utils/webxr/animationConstants';

const Text = dynamic(
  () =>
    measureChunkLoad('Text', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Text })),
    ),
  { ssr: false },
);

const TEXT_CONFIG = {
  fontSize: 0.6,
  font: '/fonts/GT-Eesti-Display-Bold-Trial.woff',
  anchorX: 'center' as const,
  anchorY: 'middle' as const,
} as const;

const TEXT_COLORS = {
  active: '#ffffff',
  hovered: '#d1d5db',
  default: '#9ca3af',
} as const;

interface NavItemProps {
  position: [number, number, number];
  text: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = memo<NavItemProps>(function NavItem({ position, text, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [hasBeenInteracted, setHasBeenInteracted] = useState(false);
  const textRef = useRef<THREE.Mesh>(null);

  const lerpSpeed = springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.fast);
  const scaleSpring = useSimpleLerp(1, { speed: lerpSpeed });

  const { scales, timing } = WEBXR_ANIMATION_CONFIG;

  useEffect(() => {
    if (hasBeenInteracted) return;

    const breathingAnimation = setInterval(() => {
      scaleSpring.set(scales.breathing);
      setTimeout(() => scaleSpring.set(scales.default), timing.delays.breathingDuration);
    }, timing.delays.breathingInterval);

    return () => clearInterval(breathingAnimation);
  }, [hasBeenInteracted, scaleSpring, scales.breathing, scales.default, timing.delays]);

  useEffect(() => {
    const targetScale =
      hovered || isActive ? scales.hover : hasBeenInteracted ? scales.default : scaleSpring.value;

    if (hovered || isActive || hasBeenInteracted) {
      scaleSpring.set(targetScale);
    }
  }, [hovered, isActive, hasBeenInteracted, scaleSpring, scales]);

  useFrame(() => {
    const mesh = textRef.current;
    if (mesh) {
      mesh.scale.setScalar(scaleSpring.value);
    }
  });

  const handleClick = useCallback(() => {
    setHasBeenInteracted(true);
    onClick();
  }, [onClick]);

  const handlePointerOver = useCallback(() => {
    setHasBeenInteracted(true);
    setHovered(true);
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
  }, []);

  const textColor = isActive
    ? TEXT_COLORS.active
    : hovered
      ? TEXT_COLORS.hovered
      : TEXT_COLORS.default;

  return (
    <Text
      ref={textRef}
      position={position}
      color={textColor}
      anchorX={TEXT_CONFIG.anchorX}
      anchorY={TEXT_CONFIG.anchorY}
      fontSize={TEXT_CONFIG.fontSize}
      font={TEXT_CONFIG.font}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {text}
    </Text>
  );
});

const ZERO_POSITION: [number, number, number] = [0, 0, 0];

const Navigation3D = memo(function Navigation3D() {
  const { currentView, navigateToView } = useWebXRView();

  const navText = currentView === 'home' ? 'work' : 'home';
  const targetView = currentView === 'home' ? 'work' : 'home';

  const handleNavigate = useCallback(() => {
    navigateToView(targetView);
  }, [navigateToView, targetView]);

  return (
    <group position={NAVIGATION_POSITIONS.navigationGroup}>
      <group position={NAVIGATION_POSITIONS.navigationButton}>
        <NavItem
          position={ZERO_POSITION}
          text={navText}
          isActive={false}
          onClick={handleNavigate}
        />
      </group>
    </group>
  );
});

export default Navigation3D;
