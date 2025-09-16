'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Torus } from '@react-three/drei';
import type {
  FloatingShape,
  TextPlane,
  PlatformElement,
  QualityConfig
} from '@/utils/webxr/fallbackConstants';

// Lazy import constants - only loaded when this component renders
const loadConstants = () => import('@/utils/webxr/fallbackConstants');

// Individual shape components
const FloatingShapeComponent = ({ shape }: { shape: FloatingShape }) => {
  const { geometry, position, rotation, material } = shape;

  const ShapeElement = () => {
    switch (geometry.type) {
      case 'box':
        return <Box args={geometry.args as [number, number, number]} />;
      case 'sphere':
        return <Sphere args={geometry.args as [number, number, number]} />;
      case 'torus':
        return <Torus args={geometry.args as [number, number, number, number]} />;
      default:
        return <Box args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh position={position} rotation={rotation}>
      <ShapeElement />
      <meshStandardMaterial
        color={material.color}
        transparent={material.transparent}
        opacity={material.opacity}
        wireframe={material.wireframe}
      />
    </mesh>
  );
};

const TextPlaneComponent = ({ plane }: { plane: TextPlane }) => {
  return (
    <Text
      position={plane.position}
      fontSize={plane.fontSize}
      color={plane.color}
      maxWidth={plane.maxWidth}
      font={`/fonts/gt-eesti/${plane.font?.toLowerCase().replace(/\s+/g, '-') || 'gt-eesti'}.woff2`}
      anchorX="center"
      anchorY="middle"
    >
      {plane.text}
    </Text>
  );
};

const PlatformComponent = ({ platform }: { platform: PlatformElement }) => {
  return (
    <Box position={platform.position} args={platform.dimensions}>
      <meshStandardMaterial
        color={platform.material.color}
        roughness={platform.material.roughness}
        metalness={platform.material.metalness}
      />
    </Box>
  );
};

// Loading component for async constant loading
const FallbackLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-black text-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
      <p className="text-sm">Loading 3D fallback...</p>
    </div>
  </div>
);

// Main scene content component
const SceneContent = ({
  floatingShapes,
  textPlanes,
  platformElements,
  qualityConfig
}: {
  floatingShapes: FloatingShape[];
  textPlanes: TextPlane[];
  platformElements: PlatformElement[];
  qualityConfig: QualityConfig;
}) => {
  return (
    <>
      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
        target={[0, 1, -2]}
      />

      {/* Lighting setup */}
      <ambientLight intensity={0.3} />
      <pointLight
        position={[5, 5, 5]}
        intensity={qualityConfig.shadows ? 1 : 0.7}
        castShadow={qualityConfig.shadows}
      />
      <pointLight
        position={[-5, 2, -2]}
        intensity={0.5}
        color="#4F46E5"
      />

      {/* Platform elements (ground, walls, ceiling) */}
      {platformElements.map((platform, index) => (
        <PlatformComponent key={`platform-${index}`} platform={platform} />
      ))}

      {/* Floating shapes */}
      {floatingShapes.map((shape, index) => (
        <FloatingShapeComponent key={`shape-${index}`} shape={shape} />
      ))}

      {/* Text planes */}
      {textPlanes.map((plane, index) => (
        <TextPlaneComponent key={`text-${index}`} plane={plane} />
      ))}
    </>
  );
};

// Async constants loader component
const AsyncSceneContent = () => {
  const [constants, setConstants] = React.useState<{
    floatingShapes: FloatingShape[];
    textPlanes: TextPlane[];
    platformElements: PlatformElement[];
    qualityConfig: QualityConfig;
  } | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    let loadingPromise: Promise<any> | null = null;

    const loadConstantsAsync = async () => {
      try {
        loadingPromise = loadConstants();
        const {
          FLOATING_SHAPES,
          TEXT_PLANES,
          PLATFORM_ELEMENTS,
          getQualityConfig
        } = await loadingPromise;

        if (isMounted) {
          setConstants({
            floatingShapes: FLOATING_SHAPES,
            textPlanes: TEXT_PLANES,
            platformElements: PLATFORM_ELEMENTS,
            qualityConfig: getQualityConfig()
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load fallback constants:', error);
          // Provide minimal fallback data
          setConstants({
            floatingShapes: [],
            textPlanes: [{
              text: 'Fallback Loading Error',
              position: [0, 0, -2],
              fontSize: 0.5,
              color: '#FF6B6B',
              maxWidth: 200
            }],
            platformElements: [],
            qualityConfig: {
              antialias: false,
              shadows: false,
              pixelRatio: 1,
              powerPreference: 'low-power' as const
            }
          });
        }
      } finally {
        loadingPromise = null;
      }
    };

    loadConstantsAsync();

    return () => {
      isMounted = false;
      // Cancel any pending promises if possible
      if (loadingPromise) {
        loadingPromise = null;
      }
    };
  }, []);

  if (!constants) {
    return <FallbackLoading />;
  }

  return (
    <Canvas
      camera={{
        position: [0, 2, 5],
        fov: 60
      }}
      gl={{
        antialias: constants.qualityConfig.antialias,
        pixelRatio: constants.qualityConfig.pixelRatio,
        powerPreference: constants.qualityConfig.powerPreference
      }}
      shadows={constants.qualityConfig.shadows}
    >
      <SceneContent
        floatingShapes={constants.floatingShapes}
        textPlanes={constants.textPlanes}
        platformElements={constants.platformElements}
        qualityConfig={constants.qualityConfig}
      />
    </Canvas>
  );
};

// Main Fallback3D Scene component
const Fallback3DScene = () => {
  return (
    <div className="h-full w-full">
      <Suspense fallback={<FallbackLoading />}>
        <AsyncSceneContent />
      </Suspense>
    </div>
  );
};

export default Fallback3DScene;