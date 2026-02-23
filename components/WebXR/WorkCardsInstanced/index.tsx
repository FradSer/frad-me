'use client';

import { useFrame } from '@react-three/fiber';
import { memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { springConfigToLerpSpeed, useSimpleLerp } from '@/hooks/useSimpleLerp';
import { WEBXR_ANIMATION_CONFIG } from '@/utils/webxr/animationConfig';
import { ENTRANCE_POSITIONS } from '@/utils/webxr/animationConstants';
import { applyOpacityToObject } from '@/utils/webxr/materialUtils';
import { FRAGMENT_SHADER, VERTEX_SHADER } from '@/utils/webxr/shaders/loadShader';
import {
  setOpacity,
  setHoveredIndex as setShaderHoveredIndex,
  setTime,
  setViewMode,
  updateUniform,
  workLinkToInstanceData,
} from '@/utils/webxr/shaders/shaderMaterialUtils';
import {
  DEFAULT_UNIFORMS,
  type InstanceData,
  OPACITY_THRESHOLDS,
  SHADER_DEFINES,
} from '@/utils/webxr/shaders/shaderTypes';
import {
  type AtlasResult,
  createTextureAtlas,
  disposeAtlas,
  getAtlasConfigForCount,
} from '@/utils/webxr/textureAtlas';
import { WORK_GRID_CONFIG } from '@/utils/webxr/workGridConstants';
import { calculateCardPosition } from '@/utils/webxr/workGridUtils';

export interface WorkCardsInstancedProps {
  works: Array<{
    title: string;
    subTitle: string;
    slug: string;
    cover: string;
    isCenter?: boolean;
    isFullScreen?: boolean;
    isWIP?: boolean;
  }>;
  maxCapacity?: number;
  visible?: boolean;
  onCardClick?: (slug: string) => void;
  onHover?: (index: number, hovered: boolean) => void;
}

const useWorkCardsAnimation = () => {
  const elasticSpeed = springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.elastic);
  const bouncySpeed = springConfigToLerpSpeed(WEBXR_ANIMATION_CONFIG.springs.bouncy);

  const opacitySpring = useSimpleLerp(0, { speed: elasticSpeed });
  const scaleSpring = useSimpleLerp(0.8, { speed: bouncySpeed });
  const positionYSpring = useSimpleLerp(0, { speed: elasticSpeed });

  return { opacitySpring, scaleSpring, positionYSpring };
};

const ENTRANCE_Y_OFFSET = 2;

const WorkCardsInstanced = memo<WorkCardsInstancedProps>(function WorkCardsInstanced({
  works,
  maxCapacity = 10,
  visible = true,
  onCardClick,
  onHover,
}) {
  const { currentView } = useWebXRView();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const pointerRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const atlasRef = useRef<AtlasResult | null>(null);

  const { opacitySpring, scaleSpring, positionYSpring } = useWorkCardsAnimation();
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);

  const isWorkView = currentView === 'work';
  const displayWorks = works.slice(0, WORK_GRID_CONFIG.MAX_DISPLAY_WORKS);

  const atlasConfig = useMemo(
    () => getAtlasConfigForCount(displayWorks.length),
    [displayWorks.length],
  );

  const instanceData = useMemo(() => {
    const data: InstanceData[] = [];
    const [baseX, baseY, baseZ] = ENTRANCE_POSITIONS.workDefault;

    displayWorks.forEach((work, index) => {
      const workIndex = index + 1;
      const isFullScreen = work.isFullScreen || false;
      const totalCards = displayWorks.length;

      const position = calculateCardPosition(workIndex, isFullScreen, totalCards);

      data.push(
        workLinkToInstanceData(
          index,
          [position[0] - baseX, position[1] - baseY + ENTRANCE_Y_OFFSET, position[2] - baseZ],
          [position[0] - baseX, position[1] - baseY, position[2] - baseZ],
          displayWorks.length,
        ),
      );
    });

    return data;
  }, [displayWorks]);

  const meshConfig = useMemo(
    () => ({
      count: Math.min(maxCapacity, displayWorks.length),
      instances: instanceData,
      geometry: new THREE.PlaneGeometry(4.5, 3),
      material: {
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          ...DEFAULT_UNIFORMS,
          uHoverScale: { value: SHADER_DEFINES.HOVER_SCALE },
        },
      },
    }),
    [maxCapacity, displayWorks.length, instanceData],
  );

  useEffect(() => {
    const loadAtlas = async () => {
      try {
        const imageUrls = displayWorks.map((work) => work.cover);
        const atlas = await createTextureAtlas(imageUrls, atlasConfig);

        atlasRef.current = atlas;

        if (materialRef.current) {
          updateUniform(materialRef.current, 'uTextureAtlas', atlas.texture);
        }

        setIsLoaded(true);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load texture atlas:', error);
        }
        setIsLoaded(true);
      }
    };

    loadAtlas();

    return () => {
      if (atlasRef.current) {
        disposeAtlas(atlasRef.current);
        atlasRef.current = null;
      }
    };
  }, [displayWorks, atlasConfig]);

  useEffect(() => {
    const targetOpacity = isWorkView ? 1 : 0;
    const targetScale = isWorkView ? 1 : 0.8;
    const targetY = isWorkView ? 0 : -2;

    opacitySpring.set(targetOpacity);
    scaleSpring.set(targetScale);
    positionYSpring.set(targetY);

    if (materialRef.current) {
      setViewMode(materialRef.current, isWorkView ? 'work' : 'home');
    }
  }, [isWorkView, opacitySpring, scaleSpring, positionYSpring]);

  useFrame((state, _delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;

    if (!mesh || !material || !isLoaded) return;

    if (material.uniforms.uTime) {
      setTime(material, state.clock.elapsedTime);
    }

    const currentOpacity = opacitySpring.value;
    const currentScale = scaleSpring.value;

    if (Math.abs(currentOpacity - (material.uniforms.uOpacity?.value ?? 0)) > 0.001) {
      setOpacity(material, currentOpacity);
    }

    mesh.scale.setScalar(currentScale);

    const shouldHide = currentOpacity < OPACITY_THRESHOLDS.minimum;
    mesh.visible = isWorkView && !shouldHide;

    if (isWorkView && !shouldHide) {
      applyOpacityToObject(mesh, currentOpacity);
    }
  });

  const handlePointerMove = useCallback(
    (event: THREE.Event) => {
      if (!isWorkView || !meshRef.current) return;

      const threeEvent = event as unknown as {
        clientX: number;
        clientY: number;
        camera: THREE.Camera;
      };
      pointerRef.current.x = (threeEvent.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(threeEvent.clientY / window.innerHeight) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, threeEvent.camera);

      const mesh = meshRef.current;
      const intersections = raycasterRef.current.intersectObject(mesh);

      const newHoveredIndex = intersections.length > 0 ? (intersections[0].instanceId ?? -1) : -1;

      if (newHoveredIndex !== hoveredIndex) {
        setHoveredIndex(newHoveredIndex);

        if (materialRef.current) {
          setShaderHoveredIndex(materialRef.current, newHoveredIndex);
        }

        onHover?.(newHoveredIndex, newHoveredIndex >= 0);
      }
    },
    [isWorkView, hoveredIndex, onHover],
  );

  const handlePointerLeave = useCallback(() => {
    if (hoveredIndex >= 0) {
      setHoveredIndex(-1);

      if (materialRef.current) {
        setShaderHoveredIndex(materialRef.current, -1);
      }

      onHover?.(-1, false);
    }
  }, [hoveredIndex, onHover]);

  const handleClick = useCallback(
    (_event: THREE.Event) => {
      if (!isWorkView || hoveredIndex < 0 || hoveredIndex >= displayWorks.length) return;

      const work = displayWorks[hoveredIndex];
      onCardClick?.(work.slug);
    },
    [isWorkView, hoveredIndex, displayWorks, onCardClick],
  );

  if (!visible) {
    return null;
  }

  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 3, 2]} intensity={0.6} color="#60a5fa" />

      <Suspense fallback={null}>
        <instancedMesh
          ref={meshRef}
          args={[undefined, undefined, meshConfig.count]}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
        >
          <planeGeometry args={[4.5, 3]} />
          <shaderMaterial
            ref={materialRef}
            vertexShader={meshConfig.material?.vertexShader}
            fragmentShader={meshConfig.material?.fragmentShader}
            uniforms={meshConfig.material?.uniforms}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
            depthTest
            blending={THREE.NormalBlending}
          />
        </instancedMesh>
      </Suspense>
    </group>
  );
});

export default WorkCardsInstanced;
