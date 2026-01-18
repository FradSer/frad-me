import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { measureChunkLoad } from '@/utils/performance';
import { FOOTER_POSITIONS } from '@/utils/webxr/animationConstants';

const Html = dynamic(
  () =>
    measureChunkLoad('Html', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Html })),
    ),
  { ssr: false },
);

const EXTERNAL_LINKS = {
  resume: 'https://read.cv/fradser',
  calendly: 'https://calendly.com/fradser',
} as const;

const HTML_CONFIG = {
  distanceFactor: 8,
  zIndex: 1000,
} as const;

const LINK_CLASSES = {
  container: 'flex space-x-6 text-base',
  link: 'text-gray-300 hover:text-white transition-colors duration-300',
} as const;

interface ExternalLinksProps {
  position: [number, number, number];
  show: boolean;
}

const ExternalLinks = memo<ExternalLinksProps>(function ExternalLinks({ position, show }) {
  if (!show) return null;

  return (
    <Html
      position={position}
      transform
      occlude={false}
      distanceFactor={HTML_CONFIG.distanceFactor}
      style={{ zIndex: HTML_CONFIG.zIndex }}
    >
      <div className={LINK_CLASSES.container}>
        <a
          href={EXTERNAL_LINKS.resume}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASSES.link}
        >
          resume
        </a>
        <a
          href={EXTERNAL_LINKS.calendly}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASSES.link}
        >
          calendly
        </a>
      </div>
    </Html>
  );
});

const FooterLinks3D = memo(function FooterLinks3D() {
  const { currentView } = useWebXRView();

  return (
    <group position={FOOTER_POSITIONS.footerGroup}>
      <ExternalLinks position={FOOTER_POSITIONS.externalLinks} show={currentView === 'home'} />
    </group>
  );
});

export default FooterLinks3D;
