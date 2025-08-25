import type React from 'react';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { measureChunkLoad } from '@/utils/performance';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { heroAnimationStates } from '@/utils/webxr/animationHelpers';
import { useSimpleLerp, springConfigToLerpSpeed } from '@/hooks/useSimpleLerp';
import { SPRING_CONFIGS } from '@/utils/webxr/animationConstants';

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
const useInteractiveMesh = (rotationAxis: RotationAxis, rotationSpeed = 10) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  // Enhanced springs for interactive elements
  const scaleSpring = useSimpleLerp(1, {
    speed: springConfigToLerpSpeed(SPRING_CONFIGS.bouncy),
  });
  const rotationSpring = useSimpleLerp(0, {
    speed: springConfigToLerpSpeed(SPRING_CONFIGS.fast),
  });

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Base rotation
      meshRef.current.rotation[rotationAxis] += delta / rotationSpeed;

      // Apply spring scale and additional rotation
      meshRef.current.scale.setScalar(scaleSpring.value);

      // Add spring-based secondary rotation on different axes
      if (rotationAxis !== 'y')
        meshRef.current.rotation.y += rotationSpring.value * delta;
      if (rotationAxis !== 'x')
        meshRef.current.rotation.x += rotationSpring.value * delta * 0.5;
    }
  });

  const handlers = {
    onClick: () => {
      setActive(!active);
      // Spring bounce effect on click
      scaleSpring.set(active ? 1 : 1.3);
      rotationSpring.set(active ? 0 : 2);
    },
    onPointerOver: () => {
      setHovered(true);
      scaleSpring.set(1.1);
      rotationSpring.set(1);
    },
    onPointerOut: () => {
      setHovered(false);
      if (!active) {
        scaleSpring.set(1);
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
    fontSize={1}
    position={position}
    rotation={[0, 0, 0]}
    font="fonts/GT-Eesti-Display-Bold-Trial.woff"
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
    <boxGeometry args={[3, 1, 1]} />
  </InteractiveShape>
);

const Triangle = (props: ShapeProps) => (
  <InteractiveShape {...props} scale={1.5} rotationAxis="z">
    <coneGeometry args={[1, 1.4, 3, 1]} />
  </InteractiveShape>
);

const Sphere = (props: ShapeProps) => (
  <InteractiveShape {...props} scale={1.5} rotationAxis="y" rotationSpeed={5}>
    <sphereGeometry args={[0.65, 16, 16]} />
  </InteractiveShape>
);

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
  const groupRef = useRef<THREE.Group>(null);

  // Enhanced spring configuration for more dynamic hero transitions
  const springConfig = SPRING_CONFIGS.elastic;

  // Initialize all lerp values consistently with home state to avoid race conditions
  const initialState = heroAnimationStates.home;
  const lerpConfig = { speed: springConfigToLerpSpeed(springConfig) };
  const positionX = useSimpleLerp(initialState.position.x, lerpConfig);
  const positionY = useSimpleLerp(initialState.position.y, lerpConfig);
  const positionZ = useSimpleLerp(initialState.position.z, lerpConfig);
  const scaleX = useSimpleLerp(initialState.scale.x, lerpConfig);
  const scaleY = useSimpleLerp(initialState.scale.y, lerpConfig);
  const scaleZ = useSimpleLerp(initialState.scale.z, lerpConfig);
  const opacity = useSimpleLerp(initialState.opacity, lerpConfig);

  // Track current view for consistent spring target updates
  const currentViewRef = useRef(currentView);

  // Use frame for consistent spring target setting and animation updates
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Update spring targets when view changes (in frame for consistent timing)
    if (currentViewRef.current !== currentView) {
      const targetState =
        currentView === 'work'
          ? heroAnimationStates.hidden
          : heroAnimationStates.home;

      positionX.set(targetState.position.x);
      positionY.set(targetState.position.y);
      positionZ.set(targetState.position.z);
      scaleX.set(targetState.scale.x);
      scaleY.set(targetState.scale.y);
      scaleZ.set(targetState.scale.z);
      opacity.set(targetState.opacity);

      currentViewRef.current = currentView;
    }

    // Lerp values are automatically updated via useFrame in useSimpleLerp hook

    // Apply transforms
    groupRef.current.position.set(
      positionX.value,
      positionY.value,
      positionZ.value,
    );
    groupRef.current.scale.set(scaleX.value, scaleY.value, scaleZ.value);

    const currentOpacity = opacity.value;

    // Hide completely when opacity is near zero for performance
    groupRef.current.visible = currentOpacity > 0.01;

    // Apply opacity to all materials
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            if (
              material instanceof THREE.MeshStandardMaterial ||
              material instanceof THREE.MeshBasicMaterial
            ) {
              material.opacity = currentOpacity;
              material.transparent = true;
            }
          });
        } else {
          const material = child.material;
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshBasicMaterial
          ) {
            material.opacity = currentOpacity;
            material.transparent = true;
          }
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={Math.PI / 10} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <group>{heroContent.map(renderElement)}</group>
    </group>
  );
}

export default HeroText;
