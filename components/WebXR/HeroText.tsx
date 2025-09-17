import type React from 'react';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { measureChunkLoad } from '@/utils/performance';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { useSimpleLerp, springConfigToLerpSpeed } from '@/hooks/useSimpleLerp';
import { useAnimationState } from '@/hooks/useAnimationState';
import type { TransformValues } from '@/hooks/useGroupTransform';
import { WEBXR_ANIMATION_CONFIG } from '@/utils/webxr/animationConfig';
import {
  INTERACTION_CONSTANTS,
  GEOMETRY_CONSTANTS,
  LIGHT_CONSTANTS,
  FONT_CONSTANTS,
  PERFORMANCE_CONSTANTS,
} from '@/utils/constants/animation';

const Text = dynamic(
  () =>
    measureChunkLoad('Text', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Text })),
    ),
  { ssr: false },
);

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

// Enhanced interactive mesh with spring animations
const useInteractiveMesh = (rotationAxis: RotationAxis, rotationSpeed?: number) => {
  const actualRotationSpeed = rotationSpeed ?? INTERACTION_CONSTANTS.DEFAULT_ROTATION_SPEED;
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  // Enhanced springs for interactive elements
  const scaleSpring = useSimpleLerp(1, {
    speed: springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.bouncy),
  });
  const rotationSpring = useSimpleLerp(0, {
    speed: springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.fast),
  });

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Base rotation
      meshRef.current.rotation[rotationAxis] += delta / actualRotationSpeed;

      // Apply spring scale and additional rotation
      meshRef.current.scale.setScalar(scaleSpring.value);

      // Add spring-based secondary rotation on different axes
      if (rotationAxis !== 'y')
        meshRef.current.rotation.y += rotationSpring.value * delta;
      if (rotationAxis !== 'x')
        meshRef.current.rotation.x += rotationSpring.value * delta * INTERACTION_CONSTANTS.SECONDARY_ROTATION_FACTOR;
    }
  });

  const handlers = {
    onClick: () => {
      setActive(!active);
      // Spring bounce effect on click
      scaleSpring.set(active ? INTERACTION_CONSTANTS.DEFAULT_SCALE : INTERACTION_CONSTANTS.ACTIVE_SCALE);
      rotationSpring.set(active ? 0 : INTERACTION_CONSTANTS.ACTIVE_ROTATION);
    },
    onPointerOver: () => {
      setHovered(true);
      scaleSpring.set(INTERACTION_CONSTANTS.HOVER_SCALE);
      rotationSpring.set(INTERACTION_CONSTANTS.HOVER_ROTATION);
    },
    onPointerOut: () => {
      setHovered(false);
      if (!active) {
        scaleSpring.set(INTERACTION_CONSTANTS.DEFAULT_SCALE);
        rotationSpring.set(0);
      }
    },
  };

  return { meshRef, hovered, active, handlers };
};

const Line = ({ position, color, text }: LineProps) => (
  <Text
    color={color}
    anchorX="center"
    anchorY="middle"
    fontSize={FONT_CONSTANTS.DEFAULT_FONT_SIZE}
    position={position}
    rotation={[0, 0, 0]}
    font={FONT_CONSTANTS.HERO_FONT_PATH}
    onClick={() => {
      /* Handle click event */
    }}
  >
    {text}
  </Text>
);

const InteractiveShape = ({
  children,
  rotationAxis,
  rotationSpeed,
  ...props
}: ShapeProps & {
  children: React.ReactNode;
  rotationAxis: RotationAxis;
  rotationSpeed?: number;
}) => {
  const { meshRef, hovered, handlers } = useInteractiveMesh(
    rotationAxis,
    rotationSpeed,
  );

  return (
    <mesh {...props} ref={meshRef} {...handlers}>
      {children}
      <meshStandardMaterial color={hovered ? 'gray' : 'white'} />
    </mesh>
  );
};

const Box = (props: ShapeProps) => (
  <InteractiveShape {...props} rotationAxis="x">
    <boxGeometry args={GEOMETRY_CONSTANTS.BOX_DIMENSIONS} />
  </InteractiveShape>
);

const Triangle = (props: ShapeProps) => (
  <InteractiveShape {...props} scale={GEOMETRY_CONSTANTS.TRIANGLE_SCALE} rotationAxis="z">
    <coneGeometry args={[
      GEOMETRY_CONSTANTS.CONE_RADIUS,
      GEOMETRY_CONSTANTS.CONE_HEIGHT,
      GEOMETRY_CONSTANTS.CONE_SEGMENTS,
      GEOMETRY_CONSTANTS.CONE_TAPER
    ]} />
  </InteractiveShape>
);

const Sphere = (props: ShapeProps) => (
  <InteractiveShape {...props} scale={GEOMETRY_CONSTANTS.SPHERE_SCALE} rotationAxis="y" rotationSpeed={INTERACTION_CONSTANTS.FAST_ROTATION_SPEED}>
    <sphereGeometry args={[
      GEOMETRY_CONSTANTS.SPHERE_RADIUS,
      GEOMETRY_CONSTANTS.SPHERE_WIDTH_SEGMENTS,
      GEOMETRY_CONSTANTS.SPHERE_HEIGHT_SEGMENTS
    ]} />
  </InteractiveShape>
);

// Content configuration for cleaner management
const heroContent = [
  {
    type: 'triangle',
    position: [-9, 4, 0] as [number, number, number],
    rotation: [0.1, 0.2, 0.1] as [number, number, number],
    scale: GEOMETRY_CONSTANTS.MINI_TRIANGLE_SCALE,
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
    case 'line':
      return (
        <Line
          key={key}
          position={element.position}
          color={element.color!}
          text={element.text!}
        />
      );
    case 'box':
      return <Box key={key} position={element.position} />;
    case 'triangle':
      return (
        <Triangle
          key={key}
          position={element.position}
          rotation={element.rotation}
          scale={element.scale}
        />
      );
    case 'sphere':
      return <Sphere key={key} position={element.position} />;
    default:
      return null;
  }
};

function HeroText() {
  const { currentView } = useWebXRView();

  // Use extracted animation hooks for cleaner separation of concerns
  const { values: animationValues, handleViewChange } = useAnimationState(currentView);

  // Use a single ref for both hooks
  const groupRef = useRef<THREE.Group>(null);

  // Apply transforms and opacity to the same group
  const applyTransformToGroup = (values: TransformValues) => {
    if (!groupRef.current) return;

    groupRef.current.position.set(
      values.position.x,
      values.position.y,
      values.position.z
    );
    groupRef.current.scale.set(
      values.scale.x,
      values.scale.y,
      values.scale.z
    );
  };

  const applyOpacityToGroup = (opacity: number, shouldBeVisible: boolean) => {
    if (!groupRef.current) return;

    groupRef.current.visible = shouldBeVisible;

    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            updateMaterialOpacity(material, opacity);
          });
        } else {
          updateMaterialOpacity(child.material, opacity);
        }
      }
    });
  };

  const updateMaterialOpacity = (material: THREE.Material, opacity: number) => {
    if (
      material instanceof THREE.MeshStandardMaterial ||
      material instanceof THREE.MeshBasicMaterial
    ) {
      material.opacity = opacity;
      material.transparent = true;
    }
  };

  // Simplified frame loop focusing only on coordination
  useFrame(() => {
    handleViewChange();

    applyTransformToGroup({
      position: animationValues.position,
      scale: animationValues.scale,
    });

    const shouldBeVisible = animationValues.opacity > PERFORMANCE_CONSTANTS.VISIBILITY_THRESHOLD;
    applyOpacityToGroup(animationValues.opacity, shouldBeVisible);
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={LIGHT_CONSTANTS.AMBIENT_INTENSITY} />
      <pointLight
        position={LIGHT_CONSTANTS.POINT_LIGHT_POSITION}
        decay={0}
        intensity={LIGHT_CONSTANTS.POINT_LIGHT_INTENSITY}
      />
      <group>{heroContent.map(renderElement)}</group>
    </group>
  );
}

export default HeroText;
