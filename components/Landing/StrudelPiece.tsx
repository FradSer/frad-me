'use client';

import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { CursorProvider, CursorType } from '@/components/common/CursorProvider';
import { STRUDEL_COMPOSER, STRUDEL_PERFORMER_URL, STRUDEL_PIECE } from '@/content/strudelPiece';

type PlayerState = 'idle' | 'loading' | 'playing' | 'error';

// Local type alias for the @strudel/web namespace we touch — see
// types/strudel.d.ts for the declared shape.
type StrudelModule = typeof import('@strudel/web');

// strudel.cc's REPL preloads several packs from this CDN. We mirror just the
// `tidal-drum-machines` pack because the piece uses .bank('RolandTR909') —
// that bank lives in this pack, not in tidalcycles/dirt-samples. Without it,
// evaluate() succeeds but every `s("bd hh sd rim")` resolves to silence.
const STRUDEL_CDN = 'https://strudel.b-cdn.net';
const DRUM_MACHINES_JSON = `${STRUDEL_CDN}/tidal-drum-machines.json`;
const DRUM_MACHINES_BASE = `${STRUDEL_CDN}/tidal-drum-machines/machines/`;

// Cache the dynamic import so a second play doesn't re-fetch the bundle,
// and so prefetch + click converge on the same Promise.
let strudelModulePromise: Promise<StrudelModule> | null = null;
function getStrudelModule(): Promise<StrudelModule> {
  if (!strudelModulePromise) {
    // Dynamic import keeps the ~1MB Strudel runtime out of the initial bundle.
    strudelModulePromise = import('@strudel/web');
  }
  return strudelModulePromise;
}

// Wait one animation frame so the browser actually paints the new state
// before we hand the main thread to a multi-hundred-ms bundle parse.
function yieldForPaint(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

// Kick off the dynamic import without blocking — bundle ends up in the
// browser cache so the click→play path skips the download.
function prefetchStrudel() {
  void getStrudelModule().catch(() => {
    // swallow — the real error surface is the click handler.
  });
}

export default function StrudelPiece() {
  const [state, setState] = useState<PlayerState>('idle');
  const initRef = useRef(false);
  const moduleRef = useRef<StrudelModule | null>(null);

  const stop = useCallback(() => {
    try {
      moduleRef.current?.hush();
    } catch {
      // best-effort — module may not be ready yet
    }
  }, []);

  useEffect(() => {
    return () => {
      if (initRef.current) stop();
    };
  }, [stop]);

  // Prefetch the strudel runtime on browser idle so the bundle is already
  // in cache by the time the user clicks play. Sample download still
  // happens after the click (it needs an AudioContext from the gesture)
  // but the JS parse no longer waits on a cold network fetch.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as IdleWindow;
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(prefetchStrudel, { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(prefetchStrudel, 2000);
    return () => window.clearTimeout(id);
  }, []);

  const handleToggle = useCallback(async () => {
    if (state === 'playing') {
      stop();
      setState('idle');
      return;
    }
    if (state === 'loading') return;

    // flushSync + a one-frame yield guarantees the play→loading swap
    // paints BEFORE the dynamic import parses ~850KB of strudel runtime
    // on the main thread — otherwise the "play" label visibly lingers
    // until parse finishes and then snaps straight to "pause".
    flushSync(() => setState('loading'));
    await yieldForPaint();

    try {
      const strudel = await getStrudelModule();
      moduleRef.current = strudel;

      if (!initRef.current) {
        // Must await — initStrudel returns the `initDone` Promise that
        // resolves after default + user prebake finish (synth sounds and
        // the tidal-drum-machines pack registered). evaluate() does NOT
        // await this on our behalf, so calling it earlier produces silence.
        await strudel.initStrudel({
          prebake: () => strudel.samples(DRUM_MACHINES_JSON, DRUM_MACHINES_BASE),
        });
        initRef.current = true;
      }
      await strudel.evaluate(STRUDEL_PIECE);
      setState('playing');
    } catch (err) {
      console.error('[StrudelPiece] failed to play', err);
      setState('error');
    }
  }, [state, stop]);

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
        <h2 className="mb-8 text-[7rem] hover:cursor-default lg:text-[10rem] xl:text-[13rem] 2xl:text-[16rem]">
          sonics
        </h2>

        <div className="flex w-full flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
          <CursorProvider targetCursorType={CursorType.buttonHovered}>
            <button
              type="button"
              onClick={handleToggle}
              onPointerEnter={prefetchStrudel}
              onFocus={prefetchStrudel}
              disabled={state === 'loading'}
              aria-pressed={state === 'playing'}
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
