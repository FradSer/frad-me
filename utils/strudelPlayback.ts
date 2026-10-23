import { STRUDEL_PIECE } from '@/content/strudelPiece';

type StrudelModule = typeof import('@strudel/web');

let modulePromise: Promise<StrudelModule> | null = null;
let runtime: StrudelModule | null = null;
let audioContext: AudioContext | null = null;
let initialization: Promise<void> | null = null;
let initialized = false;
let evaluation: Promise<void> = Promise.resolve();

function loadStrudel(): Promise<StrudelModule> {
  modulePromise ??= import('@strudel/web')
    .then((module) => {
      runtime = module;
      return module;
    })
    .catch((error: unknown) => {
      modulePromise = null;
      throw error;
    });
  return modulePromise;
}

export function prefetchStrudel(): void {
  // Prefetch code on intent, but leave audio creation to the actual click.
  void loadStrudel().catch(() => {});
}

function initialize(strudel: StrudelModule, context: AudioContext): Promise<void> {
  initialization ??= (async () => {
    await strudel.initStrudel({
      audioContext: context,
      // The runtime catches evaluation errors unless this callback rethrows.
      onEvalError: (error: unknown) => {
        throw error;
      },
    });
    initialized = true;
    await strudel.initAudio();
  })().catch((error: unknown) => {
    initialization = null;
    initialized = false;
    throw error;
  });
  return initialization;
}

export function stopStrudel(): void {
  if (!initialized) return;
  try {
    runtime?.hush();
  } catch {
    // Cleanup can also run while the runtime is recovering from a failure.
  }
}

async function evaluate(strudel: StrudelModule, isCancelled: () => boolean): Promise<void> {
  // A previous page may still be finishing evaluation during navigation.
  // Finish its cleanup before a newly mounted player can start another score.
  const pending = evaluation.then(async () => {
    if (isCancelled()) return;
    try {
      await strudel.evaluate(STRUDEL_PIECE);
      if (isCancelled()) stopStrudel();
    } catch (error) {
      stopStrudel();
      throw error;
    }
  });
  evaluation = pending.catch(() => {});
  await pending;
}

export async function startStrudel(isCancelled: () => boolean): Promise<void> {
  // Unlock audio synchronously within the click, before importing the runtime.
  // Strudel 1.3 only installs a future mousedown listener and does not reliably
  // resume its own context. Passing this context also covers touch and keyboard.
  audioContext ??= new window.AudioContext();
  const context = audioContext;
  const resumed = context.resume();
  const [strudel] = await Promise.all([loadStrudel(), resumed]);
  if (isCancelled()) return;
  if (context.state !== 'running') throw new Error('Audio playback was not enabled');

  await initialize(strudel, context);
  if (isCancelled()) return;
  if (context.state !== 'running') throw new Error('Audio playback was interrupted');
  await evaluate(strudel, isCancelled);
}
