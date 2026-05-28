// @strudel/web ships no type declarations of its own.
// We declare just the surface our StrudelPiece component relies on; the
// runtime exposes much more (re-exports from @strudel/core, /mini, /tonal,
// /webaudio), but typing only what we touch keeps drift small.

declare module '@strudel/web' {
  type PrebakeFn = () => void | Promise<void>;

  export function initStrudel(opts?: {
    prebake?: PrebakeFn;
    miniAllStrings?: boolean;
  }): Promise<unknown>;

  export function evaluate(code: string, autoplay?: boolean): Promise<void>;

  export function hush(): void;

  export function samples(
    source: string | Record<string, unknown>,
    base?: string,
    opts?: Record<string, unknown>,
  ): Promise<void> | void;
}
