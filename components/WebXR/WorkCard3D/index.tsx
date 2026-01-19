import { Html, Text } from '@react-three/drei';
import { memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { useCardAnimation } from '@/hooks/useCardAnimation';
import { WORK_CARD_POSITIONS } from '@/utils/webxr/animationConstants';
import { forceInitializeTransparency } from '@/utils/webxr/materialUtils';

interface WorkLink {
  title: string;
  subTitle: string;
  slug: string;
  cover: string;
  isCenter?: boolean;
  isFullScreen?: boolean;
  isWIP?: boolean;
}

interface WorkCard3DProps {
  work: WorkLink;
  position: [number, number, number];
  index: number;
  visible?: boolean;
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
}

const FONTS = {
  bold: '/fonts/GT-Eesti-Display-Bold-Trial.woff',
  regular: '/fonts/GT-Eesti-Display-Regular-Trial.woff',
} as const;

const TEXT_CONFIG = {
  title: {
    fontSize: 0.4,
    maxWidth: 4,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 0.25,
    maxWidth: 4,
    lineHeight: 1.2,
  },
} as const;

const COLORS = {
  title: 'white',
  subtitle: 'gray',
  glow: '#4f46e5',
} as const;

const GLOW_GEOMETRY: [number, number] = [4.8, 3.3];
const GLOW_OPACITY = 0.2;

const HOVER_AREA_CONFIG = {
  geometry: [5.5, 5] as [number, number],
  position: [0, -1, -0.2] as [number, number, number],
} as const;

const RENDER_ORDER = {
  normal: 0,
  hovered: 9999,
} as const;

const createTexture = (url: string): THREE.Texture => {
  const loader = new THREE.TextureLoader();
  const texture = loader.load(url);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
};

const WorkCard3D = memo<WorkCard3DProps>(function WorkCard3D({
  work,
  position,
  index,
  visible = true,
  onHover,
  onClick,
}) {
  const { currentView } = useWebXRView();
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const coverTexture = useMemo(() => createTexture(work.cover), [work.cover]);

  useEffect(() => {
    const group = groupRef.current;
    if (group) {
      forceInitializeTransparency(group);
    }
  }, []);

  useCardAnimation({
    groupRef,
    visible,
    hovered,
    position,
    index,
  });

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    onHover?.(true);
  }, [onHover]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    onHover?.(false);
  }, [onHover]);

  const handleClick = useCallback(() => {
    onClick?.();
    if (typeof window !== 'undefined') {
      window.location.href = `/works/${work.slug}`;
    }
  }, [onClick, work.slug]);

  const renderOrder = hovered ? RENDER_ORDER.hovered : RENDER_ORDER.normal;

  return (
    <group ref={groupRef} position={position} renderOrder={renderOrder}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: mesh element is interactive in 3D context */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        position={HOVER_AREA_CONFIG.position}
      >
        <planeGeometry args={HOVER_AREA_CONFIG.geometry} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      <mesh ref={meshRef}>
        <planeGeometry args={WORK_CARD_POSITIONS.cardGeometry} />
        <meshStandardMaterial
          map={coverTexture}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          depthTest={!hovered}
        />
      </mesh>

      <group position={WORK_CARD_POSITIONS.titleGroup}>
        <Suspense fallback={null}>
          <Text
            color={COLORS.title}
            anchorX="center"
            anchorY="top"
            fontSize={TEXT_CONFIG.title.fontSize}
            fontWeight="bold"
            maxWidth={TEXT_CONFIG.title.maxWidth}
            lineHeight={TEXT_CONFIG.title.lineHeight}
            font={FONTS.bold}
          >
            {work.title}
          </Text>
        </Suspense>
      </group>

      <group position={WORK_CARD_POSITIONS.descriptionGroup}>
        <Suspense fallback={null}>
          <Text
            color={COLORS.subtitle}
            anchorX="center"
            anchorY="top"
            fontSize={TEXT_CONFIG.subtitle.fontSize}
            maxWidth={TEXT_CONFIG.subtitle.maxWidth}
            lineHeight={TEXT_CONFIG.subtitle.lineHeight}
            font={FONTS.regular}
          >
            {work.subTitle}
          </Text>
        </Suspense>
      </group>

      {work.isWIP && currentView === 'work' && hovered && (
        <group
          position={[
            WORK_CARD_POSITIONS.wipBadgeGroup[0],
            WORK_CARD_POSITIONS.wipBadgeGroup[1],
            0.2,
          ]}
        >
          <Html transform>
            <div className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-lg">
              WIP
            </div>
          </Html>
        </group>
      )}

      {hovered && (
        <mesh position={WORK_CARD_POSITIONS.wipBadgeBackground}>
          <planeGeometry args={GLOW_GEOMETRY} />
          <meshBasicMaterial
            color={COLORS.glow}
            transparent
            opacity={GLOW_OPACITY}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  );
});

export default WorkCard3D;
