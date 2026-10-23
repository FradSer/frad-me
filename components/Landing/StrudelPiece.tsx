'use client';

import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { CursorProvider, CursorType } from '@/components/common/CursorProvider';
import SectionHeading from '@/components/common/SectionHeading';
import { STRUDEL_COMPOSER, STRUDEL_PERFORMER_URL } from '@/content/strudelPiece';
import { prefetchStrudel, startStrudel, stopStrudel } from '@/utils/strudelPlayback';

type PlayerState = 'idle' | 'loading' | 'playing' | 'error';

export default function StrudelPiece() {
  const [state, setState] = useState<PlayerState>('idle');
  const mountedRef = useRef(true);
  const busyRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopStrudel();
    };
  }, []);

  const handleToggle = useCallback(async () => {
    if (state === 'playing') {
      stopStrudel();
      setState('idle');
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;
    flushSync(() => setState('loading'));

    try {
      await startStrudel(() => !mountedRef.current);
      if (mountedRef.current) setState('playing');
    } catch (err) {
      console.error('[StrudelPiece] failed to play', err);
      if (mountedRef.current) setState('error');
    } finally {
      busyRef.current = false;
    }
  }, [state]);

  const label =
    state === 'loading'
      ? 'loading'
      : state === 'playing'
        ? 'pause'
        : state === 'error'
          ? 'retry'
          : 'play';

  const ariaLabel =
    state === 'playing' ? 'Pause music' : state === 'loading' ? 'Loading' : 'Play music';

  return (
    <section id="sonics" className="layout-wrapper my-20 scroll-mt-24 md:my-24 lg:my-32">
      <div className="flex flex-col items-start">
        <SectionHeading className="mb-8">sonics</SectionHeading>

        <div className="flex w-full flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
          <CursorProvider targetCursorType={CursorType.buttonHovered}>
            <button
              type="button"
              onClick={handleToggle}
              onPointerEnter={prefetchStrudel}
              onFocus={prefetchStrudel}
              disabled={state === 'loading'}
              aria-pressed={state === 'playing'}
              aria-busy={state === 'loading'}
              aria-label={ariaLabel}
              className="group flex items-center gap-5 text-left text-4xl font-bold text-black transition-opacity disabled:opacity-60 dark:text-white sm:text-5xl md:text-6xl"
            >
              <PlayPauseIcon state={state} />
              <span className="tabular-nums">{label}</span>
            </button>
          </CursorProvider>

          <p className="max-w-xs text-base leading-relaxed text-gray-500 dark:text-gray-400 md:text-right md:text-lg">
            <span className="block">
              composed by{' '}
              <span className="font-bold text-black dark:text-white">{STRUDEL_COMPOSER}</span>
            </span>
            <span className="block">
              performed by{' '}
              <a
                href={STRUDEL_PERFORMER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-black underline-offset-4 hover:underline dark:text-white"
              >
                strudel.cc
              </a>
            </span>
          </p>
        </div>
        <p
          role="status"
          className={
            state === 'error' ? 'mt-4 text-base text-gray-600 dark:text-gray-400' : 'sr-only'
          }
        >
          {state === 'error' ? "Music couldn't start. Please try again." : ''}
        </p>
      </div>
    </section>
  );
}

function PlayPauseIcon({ state }: { state: PlayerState }) {
  const isPlaying = state === 'playing';
  const isLoading = state === 'loading';

  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-current sm:h-20 sm:w-20"
    >
      {isLoading ? (
        <span className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-1.5 w-1.5 rounded-full bg-current"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{
                duration: 1.1,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.18,
              }}
            />
          ))}
        </span>
      ) : isPlaying ? (
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="currentColor"
          className="sm:h-7 sm:w-7"
        >
          <rect x="4" y="3" width="5" height="16" rx="1" />
          <rect x="13" y="3" width="5" height="16" rx="1" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="currentColor"
          className="ml-1 sm:h-7 sm:w-7"
        >
          <path d="M5 3.5 L18 11 L5 18.5 Z" />
        </svg>
      )}
      {isPlaying && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-current"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.45, opacity: 0 }}
          transition={{
            duration: 1.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeOut',
          }}
        />
      )}
    </span>
  );
}
