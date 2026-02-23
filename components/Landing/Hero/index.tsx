'use client';

import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { PlayIcon, StopIcon } from '@/components/common/Icons';
import ScrollLink from '@/components/common/ScrollLink';
import DotCircle from '@/components/Landing/Hero/DotCircle';
import Rectangle from '@/components/Landing/Hero/Rectangle';
import Triangle from '@/components/Landing/Hero/Triangle';
import { CursorType } from '@/contexts/Mouse/MouseContext';
import useMouseContext from '@/hooks/useMouseContext';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface IHeroProps {
  isWebXR?: boolean;
}

// Combine the text content for speaking
const heroText = `
Frad LEE is a self-taught craftier
who is eager to learn for advancement. Whether it's
coding in a new language,
design with any tool whatsoever
or building a startup.
`;

const trianglePositionClass =
  'absolute -left-12 bottom-10 z-30 sm:-left-16 sm:bottom-12 lg:-left-24 lg:bottom-16 2xl:-left-28 2xl:bottom-20';
const mutedTextClass = 'text-gray-400';

function Hero({ isWebXR = false }: Readonly<IHeroProps>) {
  const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis();
  const { cursorChangeHandler } = useMouseContext();

  const heroH1 = clsx(
    'text-left text-2xl font-bold hover:cursor-default sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl',
  );

  const handleButtonHoverStart = () => {
    cursorChangeHandler(CursorType.headerLinkHovered);
  };

  const handleButtonHoverEnd = () => {
    cursorChangeHandler(CursorType.default);
  };

  return (
    <section className="m-auto flex h-auto min-h-screen w-screen items-center justify-center">
      <h1 className={clsx('relative flex flex-col items-start justify-center', heroH1)}>
        {isSupported && (
          <motion.button
            type="button"
            onClick={isSpeaking ? stop : () => speak(heroText, 'Fred')}
            onHoverStart={handleButtonHoverStart}
            onHoverEnd={handleButtonHoverEnd}
            className="absolute -left-10 top-1 z-10 cursor-pointer rounded bg-gray-200 p-1 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            aria-label={isSpeaking ? 'Stop speaking' : 'Speak text'}
          >
            {isSpeaking ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          </motion.button>
        )}
        <div className="relative">
          <div className={trianglePositionClass}>
            <Triangle />
          </div>
          Frad LEE
          <span className={mutedTextClass}> is a self-taught craftier</span>
        </div>
        <div className="flex w-full">
          <span className={mutedTextClass}>who is eager to learn for</span>
          <Rectangle />
        </div>
        <span className={mutedTextClass}>advancement. Whether it&apos;s </span>
        <div>
          coding
          <span className={mutedTextClass}> in a new language,</span>
        </div>
        <div>
          design
          <span className={mutedTextClass}> with any tool whatsoever</span>
        </div>
        <div className="relative">
          <span className={mutedTextClass}>or building a </span>
          startup
          <ScrollLink destination="work">
            <DotCircle isInteractive={!isWebXR} />
          </ScrollLink>
        </div>
      </h1>
    </section>
  );
}

export default Hero;
