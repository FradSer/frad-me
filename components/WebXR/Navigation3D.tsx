import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { useSimpleLerp, springConfigToLerpSpeed } from '@/hooks/useSimpleLerp';
import { measureChunkLoad } from '@/utils/performance';
import {
  WEBXR_ANIMATION_CONFIG,
} from '@/utils/webxr/animationConfig';
import {
  NAVIGATION_POSITIONS,
} from '@/utils/webxr/animationConstants';

const Text = dynamic(
  () =>
    measureChunkLoad('Text', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Text })),
    ),
  { ssr: false },
);

interface NavItemProps {
  position: [number, number, number];
  text: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ position, text, isActive, onClick }: NavItemProps) => {
  const [hovered, setHovered] = useState(false);
  const [hasBeenInteracted, setHasBeenInteracted] = useState(false);
  const textRef = useRef<THREE.Mesh>(null);

  const scaleSpring = useSimpleLerp(1, {
    speed: springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.fast),
  });

  // Breathing effect when never interacted
  useEffect(() => {
    if (!hasBeenInteracted) {
      const breathingAnimation = setInterval(() => {
        scaleSpring.set(WEBXR_ANIMATION_CONFIG.scales.breathing);
        setTimeout(() => scaleSpring.set(WEBXR_ANIMATION_CONFIG.scales.default), 
          WEBXR_ANIMATION_CONFIG.timing.durations.breathingDuration);
      }, WEBXR_ANIMATION_CONFIG.timing.delays.breathingInterval);

      return () => clearInterval(breathingAnimation);
    }
  }, [hasBeenInteracted, scaleSpring]);

  useEffect(() => {
    if (hovered || isActive) {
      scaleSpring.set(WEBXR_ANIMATION_CONFIG.scales.hover);
    } else if (hasBeenInteracted) {
      scaleSpring.set(WEBXR_ANIMATION_CONFIG.scales.default);
    }
  }, [hovered, isActive, hasBeenInteracted, scaleSpring]);

  useFrame(() => {
    if (!textRef.current) return;
    textRef.current.scale.setScalar(scaleSpring.value);
  });

  return (
    <Text
      ref={textRef}
      position={position}
      color={isActive ? '#ffffff' : hovered ? '#d1d5db' : '#9ca3af'}
      anchorX="center"
      anchorY="middle"
      fontSize={0.6}
      font="/fonts/GT-Eesti-Display-Bold-Trial.woff"
      onClick={() => {
        setHasBeenInteracted(true);
        onClick();
      }}
      onPointerOver={() => {
        setHasBeenInteracted(true);
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {text}
    </Text>
  );
};

function Navigation3D() {
  const { currentView, navigateToView } = useWebXRView();

  return (
    <group position={NAVIGATION_POSITIONS.navigationGroup}>
      <group position={NAVIGATION_POSITIONS.navigationButton}>
        {currentView === 'home' ? (
          <NavItem
            position={[0, 0, 0]}
            text="work"
            isActive={false}
            onClick={() => navigateToView('work')}
          />
        ) : (
          <NavItem
            position={[0, 0, 0]}
            text="home"
            isActive={false}
            onClick={() => navigateToView('home')}
          />
        )}
      </group>
    </group>
  );
}

export default Navigation3D;
