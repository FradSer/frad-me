'use client';

import { useFrame } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { memo, useRef } from 'react';
import * as THREE from 'three';
import ShapesInstanced, { type ShapeData } from '@/components/WebXR/HeroText/ShapesInstanced';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { springConfigToLerpSpeed, useSimpleLerp } from '@/hooks/useSimpleLerp';
import { measureChunkLoad } from '@/utils/performance';
import { WEBXR_ANIMATION_CONFIG } from '@/utils/webxr/animationConfig';
import { heroAnimationStates } from '@/utils/webxr/animationHelpers';

const Text = dynamic(
  () =>
    measureChunkLoad('Text', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Text })),
    ),
  { ssr: false },
);

const FONTS = {
  display: 'fonts/GT-Eesti-Display-Bold-Trial.woff',
} as const;

const TEXT_CONFIG = {
  fontSize: 1,
  anchorX: 'center' as const,
  anchorY: 'middle' as const,
} as const;

const LIGHTING = {
  ambientIntensity: Math.PI / 10,
  pointIntensity: Math.PI,
  pointPosition: [-10, -10, -10] as [number, number, number],
} as const;

interface LineProps {
  position: [number, number, number];
  color: string;
  text: string;
}

const Line = memo<LineProps>(function Line({ position, color, text }) {
  return (
    <Text
      color={color}
      anchorX={TEXT_CONFIG.anchorX}
      anchorY={TEXT_CONFIG.anchorY}
      fontSize={TEXT_CONFIG.fontSize}
      position={position}
      rotation={[0, 0, 0]}
      font={FONTS.display}
    >
      {text}
    </Text>
  );
});

// Content configuration for cleaner management
const heroContent: Array<
  | {
      type: 'triangle';
      position: [number, number, number];
      rotation: [number, number, number];
      scale: number;
    }
  | { type: 'box'; position: [number, number, number] }
  | { type: 'sphere'; position: [number, number, number] }
  | { type: 'line'; position: [number, number, number]; color: string; text: string }
> = [
  {
    type: 'triangle',
    position: [-9, 4, 0] as [number, number, number],
    rotation: [0.1, 0.2, 0.1] as [number, number, number],
    scale: 0.5,
  },
  {
    type: 'line',
    position: [-5.3, 3, 0] as [number, number, number],
    color: 'white',
    text: 'Frad LEE',
  },
  {
    type: 'line',
    position: [2, 3, 0] as [number, number, number],
    color: 'gray',
    text: 'is a self-taught craftier',
  },
  {
    type: 'line',
    position: [-1.8, 1.8, 0] as [number, number, number],
    color: 'gray',
    text: 'who is eager to learn for',
  },
  { type: 'box', position: [5.7, 1.8, 0] as [number, number, number] },
  {
    type: 'line',
    position: [-1, 0.6, 0] as [number, number, number],
    color: 'gray',
    text: 'advancement. Whether it is',
  },
  {
    type: 'line',
    position: [-1.3, -0.6, 0] as [number, number, number],
    color: 'gray',
    text: 'coding in a new language,',
  },
  {
    type: 'line',
    position: [0.1, -1.8, 0] as [number, number, number],
    color: 'gray',
    text: 'design with any tool whatsoever',
  },
  {
    type: 'line',
    position: [-2.5, -3, 0] as [number, number, number],
    color: 'gray',
    text: 'or building a startup',
  },
  { type: 'sphere', position: [3.2, -4, 0] as [number, number, number] },
];

// Extract shape data for ShapesInstanced component
const heroShapesData: ShapeData[] = heroContent.filter(
  (item): item is Extract<(typeof heroContent)[number], { type: 'box' | 'triangle' | 'sphere' }> =>
    item.type === 'box' || item.type === 'triangle' || item.type === 'sphere',
);

const renderElement = (element: (typeof heroContent)[0], index: number) => {
  const key = `${element.type}-${index}`;

  switch (element.type) {
    case 'line': {
      const lineElement = element as {
        type: 'line';
        position: [number, number, number];
        color: string;
        text: string;
      };
      return (
        <Line
          key={key}
          position={lineElement.position}
          color={lineElement.color}
          text={lineElement.text}
        />
      );
    }
    case 'box':
    case 'triangle':
    case 'sphere':
      // Shapes are handled by ShapesInstanced component
      return null;
    default:
      return null;
  }
};

const applyMaterialOpacity = (material: THREE.Material, opacity: number): void => {
  if (
    material instanceof THREE.MeshStandardMaterial ||
    material instanceof THREE.MeshBasicMaterial
  ) {
    material.opacity = opacity;
    material.transparent = true;
  }
};

const updateChildOpacity = (child: THREE.Object3D, opacity: number): void => {
  if (!(child instanceof THREE.Mesh) || !child.material) return;

  if (Array.isArray(child.material)) {
    for (const mat of child.material) {
      applyMaterialOpacity(mat, opacity);
    }
  } else {
    applyMaterialOpacity(child.material, opacity);
  }
};

const HeroText = memo(function HeroText() {
  const { currentView } = useWebXRView();
  const groupRef = useRef<THREE.Group>(null);
  const currentViewRef = useRef(currentView);

  const springConfig = WEBXR_ANIMATION_CONFIG.springs.elastic;
  const initialState = heroAnimationStates.home;
  const lerpConfig = { speed: springConfigToLerpSpeed(springConfig) };

  const positionX = useSimpleLerp(initialState.position.x, lerpConfig);
  const positionY = useSimpleLerp(initialState.position.y, lerpConfig);
  const positionZ = useSimpleLerp(initialState.position.z, lerpConfig);
  const scaleX = useSimpleLerp(initialState.scale.x, lerpConfig);
  const scaleY = useSimpleLerp(initialState.scale.y, lerpConfig);
  const scaleZ = useSimpleLerp(initialState.scale.z, lerpConfig);
  const opacity = useSimpleLerp(initialState.opacity, lerpConfig);
  const lastOpacityRef = useRef(-1);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    if (currentViewRef.current !== currentView) {
      const targetState =
        currentView === 'work' ? heroAnimationStates.hidden : heroAnimationStates.home;

      positionX.set(targetState.position.x);
      positionY.set(targetState.position.y);
      positionZ.set(targetState.position.z);
      scaleX.set(targetState.scale.x);
      scaleY.set(targetState.scale.y);
      scaleZ.set(targetState.scale.z);
      opacity.set(targetState.opacity);

      currentViewRef.current = currentView;
    }

    group.position.set(positionX.value, positionY.value, positionZ.value);
    group.scale.set(scaleX.value, scaleY.value, scaleZ.value);

    const currentOpacity = opacity.value;
    group.visible = currentOpacity > WEBXR_ANIMATION_CONFIG.performance.hideThreshold;

    // Performance optimization: only update materials if opacity changed significantly
    if (Math.abs(currentOpacity - lastOpacityRef.current) > 0.001) {
      group.traverse((child) => updateChildOpacity(child, currentOpacity));
      lastOpacityRef.current = currentOpacity;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={LIGHTING.ambientIntensity} />
      <pointLight position={LIGHTING.pointPosition} decay={0} intensity={LIGHTING.pointIntensity} />
      <group>
        <ShapesInstanced shapes={heroShapesData} />
        {heroContent.map(renderElement)}
      </group>
    </group>
  );
});

export default HeroText;
