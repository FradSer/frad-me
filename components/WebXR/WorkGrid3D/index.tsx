import { useFrame } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { memo, useEffect, useRef } from 'react';
import type * as THREE from 'three';
import workLinks from '@/content/workLinks';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { springConfigToLerpSpeed, useSimpleLerp } from '@/hooks/useSimpleLerp';
import { measureChunkLoad } from '@/utils/performance';
import { WEBXR_ANIMATION_CONFIG } from '@/utils/webxr/animationConfig';
import { ENTRANCE_POSITIONS, WORK_GRID_POSITIONS } from '@/utils/webxr/animationConstants';
import { applyOpacityToObject, forceInitializeTransparency } from '@/utils/webxr/materialUtils';
import {
  WORK_GRID_ACTIVE_STATE,
  WORK_GRID_CONFIG,
  WORK_GRID_INITIAL_STATE,
  WORK_GRID_LIGHTING,
} from '@/utils/webxr/workGridConstants';
import { calculateCardPosition } from '@/utils/webxr/workGridUtils';
import WorkCard3D from '../WorkCard3D';

const _Html = dynamic(
  () =>
    measureChunkLoad('Html', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Html })),
    ),
  { ssr: false },
);

const _Text = dynamic(
  () =>
    measureChunkLoad('Text', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Text })),
    ),
  { ssr: false },
);

interface WorkGrid3DProps {
  visible?: boolean;
}

const useWorkGridAnimation = () => {
  const elasticSpeed = springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.elastic);
  const bouncySpeed = springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.bouncy);

  const opacitySpring = useSimpleLerp(WORK_GRID_INITIAL_STATE.OPACITY, { speed: elasticSpeed });
  const scaleSpring = useSimpleLerp(WORK_GRID_INITIAL_STATE.SCALE, { speed: bouncySpeed });
  const positionYSpring = useSimpleLerp(WORK_GRID_INITIAL_STATE.POSITION_Y_OFFSET, {
    speed: elasticSpeed,
  });

  return { opacitySpring, scaleSpring, positionYSpring };
};

const WorkGrid3D = memo<WorkGrid3DProps>(function WorkGrid3D({ visible: _visible = true }) {
  const { currentView } = useWebXRView();
  const groupRef = useRef<THREE.Group>(null);
  const { opacitySpring, scaleSpring, positionYSpring } = useWorkGridAnimation();

  const isWorkView = currentView === 'work';

  useEffect(() => {
    const targetState = isWorkView ? WORK_GRID_ACTIVE_STATE : WORK_GRID_INITIAL_STATE;

    opacitySpring.set(targetState.OPACITY);
    scaleSpring.set(targetState.SCALE);
    positionYSpring.set(targetState.POSITION_Y_OFFSET);

    const group = groupRef.current;
    if (!group) return;

    if (!isWorkView) {
      applyOpacityToObject(group, WORK_GRID_INITIAL_STATE.OPACITY);
      group.visible = false;
    }
  }, [isWorkView, opacitySpring, scaleSpring, positionYSpring]);

  useEffect(() => {
    const group = groupRef.current;
    if (group) {
      forceInitializeTransparency(group);
    }
  }, []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const [baseX, baseY, baseZ] = ENTRANCE_POSITIONS.workDefault;
    group.position.set(baseX, baseY + positionYSpring.value, baseZ);
    group.scale.setScalar(scaleSpring.value);

    const currentOpacity = opacitySpring.value;
    const shouldBeVisible = currentOpacity > WORK_GRID_CONFIG.VISIBILITY_THRESHOLD && isWorkView;

    group.visible = shouldBeVisible;

    if (shouldBeVisible) {
      applyOpacityToObject(group, currentOpacity);
    }
  });

  const displayWorks = workLinks.slice(0, WORK_GRID_CONFIG.MAX_DISPLAY_WORKS);
  const totalWorks = workLinks.length;

  return (
    <group ref={groupRef}>
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

      {displayWorks.map((work, index) => {
        const position = calculateCardPosition(index + 1, work.isFullScreen || false, totalWorks);
        return (
          <WorkCard3D
            key={work.slug}
            work={work}
            position={position}
            index={index}
            visible={true}
          />
        );
      })}
    </group>
  );
});

export default WorkGrid3D;
