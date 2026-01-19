import { useFrame } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import type React from 'react';
import { memo, useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
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

const GEOMETRY_ARGS = {
  box: [3, 1, 1] as [number, number, number],
  cone: [1, 1.4, 3, 1] as [number, number, number, number],
  sphere: [0.65, 16, 16] as [number, number, number],
} as const;

const ROTATION_SPEEDS = {
  default: 10,
  sphere: 5,
} as const;

const SCALE_FACTORS = {
  triangle: 1.5,
  sphere: 1.5,
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

interface ShapeProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

type RotationAxis = 'x' | 'y' | 'z';

interface InteractiveMeshResult {
  meshRef: React.RefObject<THREE.Mesh | null>;
  hovered: boolean;
  active: boolean;
  handlers: {
    onClick: () => void;
    onPointerOver: () => void;
    onPointerOut: () => void;
  };
}

const useInteractiveMesh = (
  rotationAxis: RotationAxis,
  rotationSpeed?: number,
): InteractiveMeshResult => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  const speed = rotationSpeed ?? ROTATION_SPEEDS.default;

  const lerpSpeed = springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.bouncy);
  const fastLerpSpeed = springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.fast);

  const scaleSpring = useSimpleLerp(1, { speed: lerpSpeed });
  const rotationSpring = useSimpleLerp(0, { speed: fastLerpSpeed });

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.rotation[rotationAxis] += delta / speed;
    mesh.scale.setScalar(scaleSpring.value);

    if (rotationAxis !== 'y') mesh.rotation.y += rotationSpring.value * delta;
    if (rotationAxis !== 'x') mesh.rotation.x += rotationSpring.value * delta * 0.5;
  });

  const handlers = {
    onClick: useCallback(() => {
      setActive((prev) => {
        const newActive = !prev;
        scaleSpring.set(newActive ? 1.3 : 1);
        rotationSpring.set(newActive ? 2 : 0);
        return newActive;
      });
    }, [scaleSpring, rotationSpring]),

    onPointerOver: useCallback(() => {
      setHovered(true);
      scaleSpring.set(1.1);
      rotationSpring.set(1);
    }, [scaleSpring, rotationSpring]),

    onPointerOut: useCallback(() => {
      setHovered(false);
      setActive((currentActive) => {
        if (!currentActive) {
          scaleSpring.set(1);
          rotationSpring.set(0);
        }
        return currentActive;
      });
    }, [scaleSpring, rotationSpring]),
  };

  return { meshRef, hovered, active, handlers };
};

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

interface InteractiveShapeProps extends ShapeProps {
  children: React.ReactNode;
  rotationAxis: RotationAxis;
  rotationSpeed?: number;
}

const InteractiveShape = memo<InteractiveShapeProps>(function InteractiveShape({
  children,
  rotationAxis,
  rotationSpeed,
  ...props
}) {
  const { meshRef, hovered, handlers } = useInteractiveMesh(rotationAxis, rotationSpeed);

  return (
    <mesh {...props} ref={meshRef} {...handlers}>
      {children}
      <meshStandardMaterial color={hovered ? 'gray' : 'white'} />
    </mesh>
  );
});

const Box = memo<ShapeProps>(function Box(props) {
  return (
    <InteractiveShape {...props} rotationAxis="x">
      <boxGeometry args={GEOMETRY_ARGS.box} />
    </InteractiveShape>
  );
});

const Triangle = memo<ShapeProps>(function Triangle(props) {
  return (
    <InteractiveShape {...props} scale={SCALE_FACTORS.triangle} rotationAxis="z">
      <coneGeometry args={GEOMETRY_ARGS.cone} />
    </InteractiveShape>
  );
});

const Sphere = memo<ShapeProps>(function Sphere(props) {
  return (
    <InteractiveShape
      {...props}
      scale={SCALE_FACTORS.sphere}
      rotationAxis="y"
      rotationSpeed={ROTATION_SPEEDS.sphere}
    >
      <sphereGeometry args={GEOMETRY_ARGS.sphere} />
    </InteractiveShape>
  );
});

// Content configuration for cleaner management
const heroContent = [
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
    case 'box': {
      const boxElement = element as { type: 'box'; position: [number, number, number] };
      return <Box key={key} position={boxElement.position} />;
    }
    case 'triangle': {
      const triangleElement = element as {
        type: 'triangle';
        position: [number, number, number];
        rotation?: [number, number, number];
        scale?: number;
      };
      return (
        <Triangle
          key={key}
          position={triangleElement.position}
          rotation={triangleElement.rotation}
          scale={triangleElement.scale}
        />
      );
    }
    case 'sphere': {
      const sphereElement = element as { type: 'sphere'; position: [number, number, number] };
      return <Sphere key={key} position={sphereElement.position} />;
    }
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

    group.traverse((child) => updateChildOpacity(child, currentOpacity));
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={LIGHTING.ambientIntensity} />
      <pointLight position={LIGHTING.pointPosition} decay={0} intensity={LIGHTING.pointIntensity} />
      <group>{heroContent.map(renderElement)}</group>
    </group>
  );
});

export default HeroText;
