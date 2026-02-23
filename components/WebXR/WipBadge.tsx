'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { measureChunkLoad } from '@/utils/performance';
import { WORK_CARD_POSITIONS } from '@/utils/webxr/animationConstants';

const _Html = dynamic(
  () =>
    measureChunkLoad('Html', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Html })),
    ),
  { ssr: false },
);

const BADGE_CONFIG = {
  position: [WORK_CARD_POSITIONS.wipBadgeGroup[0], WORK_CARD_POSITIONS.wipBadgeGroup[1], 0.2] as [
    number,
    number,
    number,
  ],
  distanceFactor: 8,
  zIndex: 1000,
} as const;

const BADGE_CLASSES = 'rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-lg';

interface WipBadgeProps {
  show: boolean;
}

const WipBadge = memo<WipBadgeProps>(function WipBadge({ show }) {
  const { currentView } = useWebXRView();

  if (!show || currentView !== 'work') return null;

  return (
    <_Html
      position={BADGE_CONFIG.position}
      transform
      occlude={false}
      distanceFactor={BADGE_CONFIG.distanceFactor}
      style={{ zIndex: BADGE_CONFIG.zIndex }}
    >
      <div className={BADGE_CLASSES}>WIP</div>
    </_Html>
  );
});

export default WipBadge;
