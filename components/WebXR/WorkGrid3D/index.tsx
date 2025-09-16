import type React from 'react';
import { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { useSimpleLerp, springConfigToLerpSpeed } from '@/hooks/useSimpleLerp';
import { calculateCardPosition } from '@/utils/webxr/workGridUtils';
import { measureChunkLoad } from '@/utils/performance';
import {
  WEBXR_ANIMATION_CONFIG,
} from '@/utils/webxr/animationConfig';
import {
  ENTRANCE_POSITIONS,
  WORK_GRID_POSITIONS,
} from '@/utils/webxr/animationConstants';
import {
  WORK_GRID_CONFIG,
  WORK_GRID_INITIAL_STATE,
  WORK_GRID_ACTIVE_STATE,
  WORK_GRID_LIGHTING,
} from '@/utils/webxr/workGridConstants';
import {
  applyOpacityToObject,
  forceInitializeTransparency,
} from '@/utils/webxr/materialUtils';
import WorkCard3D from '../WorkCard3D';
import workLinks from '@/content/workLinks';

const Html = dynamic(
  () =>
    measureChunkLoad('Html', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Html })),
    ),
  { ssr: false },
);

const Text = dynamic(
  () =>
    measureChunkLoad('Text', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Text })),
    ),
  { ssr: false },
);


interface WorkGrid3DProps {
  visible?: boolean;
}

// Helper function to initialize animation springs
const useWorkGridAnimation = () => {
  const opacitySpring = useSimpleLerp(WORK_GRID_INITIAL_STATE.OPACITY, {
    speed: springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.elastic),
  });
  const scaleSpring = useSimpleLerp(WORK_GRID_INITIAL_STATE.SCALE, {
    speed: springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.bouncy),
  });
  const positionYSpring = useSimpleLerp(WORK_GRID_INITIAL_STATE.POSITION_Y_OFFSET, {
    speed: springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.elastic),
  });

  return { opacitySpring, scaleSpring, positionYSpring };
};

const WorkGrid3D: React.FC<WorkGrid3DProps> = ({ visible = true }) => {
  const { currentView } = useWebXRView();
  const groupRef = useRef<THREE.Group>(null);
  const { opacitySpring, scaleSpring, positionYSpring } = useWorkGridAnimation();

  // Simplified animation state management
  useEffect(() => {
    if (currentView === 'work') {
      // Set active state values
      opacitySpring.set(WORK_GRID_ACTIVE_STATE.OPACITY);
      scaleSpring.set(WORK_GRID_ACTIVE_STATE.SCALE);
      positionYSpring.set(WORK_GRID_ACTIVE_STATE.POSITION_Y_OFFSET);
    } else {
      // Set initial/hidden state values
      opacitySpring.set(WORK_GRID_INITIAL_STATE.OPACITY);
      scaleSpring.set(WORK_GRID_INITIAL_STATE.SCALE);
      positionYSpring.set(WORK_GRID_INITIAL_STATE.POSITION_Y_OFFSET);
    }
  }, [currentView, opacitySpring, scaleSpring, positionYSpring]);

  // Force initialize complete transparency on mount for WebXR best practices
  useEffect(() => {
    if (groupRef.current) {
      forceInitializeTransparency(groupRef.current);
    }
  }, []);

  // Ensure work grid starts completely transparent
  useEffect(() => {
    if (groupRef.current && currentView !== 'work') {
      applyOpacityToObject(groupRef.current, 0);
    }
  }, [currentView]);

  // Simplified frame update logic
  useFrame(() => {
    if (!groupRef.current) return;

    // Apply spring-based position with Y offset
    const basePosition = ENTRANCE_POSITIONS.workDefault;
    groupRef.current.position.set(
      basePosition[0],
      basePosition[1] + positionYSpring.value,
      basePosition[2],
    );

    // Apply spring-based scale
    groupRef.current.scale.setScalar(scaleSpring.value);

    // Handle visibility using configuration constant
    const currentOpacity = opacitySpring.value;
    const shouldBeVisible =
      currentOpacity > WORK_GRID_CONFIG.VISIBILITY_THRESHOLD &&
      currentView === 'work';
    groupRef.current.visible = shouldBeVisible;

    // Apply opacity when visible
    if (shouldBeVisible) {
      applyOpacityToObject(groupRef.current, currentOpacity);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Enhanced lighting for work section */}
      <ambientLight intensity={WORK_GRID_LIGHTING.AMBIENT_INTENSITY} />
      <directionalLight
        position={WORK_GRID_POSITIONS.directionalLight}
        intensity={WORK_GRID_LIGHTING.DIRECTIONAL_INTENSITY}
      />
      <pointLight
        position={WORK_GRID_POSITIONS.pointLight}
        intensity={WORK_GRID_LIGHTING.POINT_INTENSITY}
        color={WORK_GRID_LIGHTING.POINT_COLOR}
      />

      {/* Work Cards */}
      {workLinks.slice(0, WORK_GRID_CONFIG.MAX_DISPLAY_WORKS).map((work, index) => {
        const position = calculateCardPosition(
          index + 1,
          work.isFullScreen || false,
          workLinks.length, // Pass total number of works
        );
        return (
          <WorkCard3D
            key={work.slug}
            work={work}
            position={position}
            index={index}
            visible={true} // Always render cards, transparency controlled by animation
          />
        );
      })}
    </group>
  );
};

export default WorkGrid3D;
