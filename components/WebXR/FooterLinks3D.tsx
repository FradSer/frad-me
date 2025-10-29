import dynamic from 'next/dynamic';
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

const ExternalLinks = ({
  position,
  show,
}: {
  position: [number, number, number];
  show: boolean;
}) => {
  if (!show) return null;

  return (
    <Html position={position} transform occlude={false} distanceFactor={8} style={{ zIndex: 1000 }}>
      <div className="flex space-x-6 text-base">
        <a
          href="https://read.cv/fradser"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white transition-colors duration-300"
        >
          resume
        </a>
        <a
          href="https://calendly.com/fradser"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white transition-colors duration-300"
        >
          calendly
        </a>
      </div>
    </Html>
  );
};

function FooterLinks3D() {
  const { currentView } = useWebXRView();

  return (
    <group position={FOOTER_POSITIONS.footerGroup}>
      {/* External Links - More accessible position for visionOS */}
      <ExternalLinks position={FOOTER_POSITIONS.externalLinks} show={currentView === 'home'} />
    </group>
  );
}

export default FooterLinks3D;
