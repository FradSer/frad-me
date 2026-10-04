import { act, renderHook } from '@testing-library/react';
import { useWebMCP, type WebMCPActions } from '../useWebMCP';

jest.mock('@mcp-b/global', () => ({}));

function createDeferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  // Keep the RED run observable even when the old hook ignores this promise.
  void promise.catch(() => {});
  return { promise, resolve, reject };
}

function createContext(registrations: Promise<void>[] = []) {
  const signals: AbortSignal[] = [];
  const registerTool = jest.fn((_tool: { name: string }, options: { signal: AbortSignal }) => {
    signals.push(options.signal);
    return registrations[signals.length - 1] ?? Promise.resolve();
  });
  return { registerTool, signals };
}

function createActions(): WebMCPActions {
  return {
    navigate: jest.fn(),
    getWorks: jest.fn(),
    readWork: jest.fn(),
    searchWorks: jest.fn(),
    getResume: jest.fn(),
  };
}

function installContext(context: ReturnType<typeof createContext>) {
  Object.defineProperty(document, 'modelContext', {
    value: context,
    configurable: true,
  });
}

describe('WebMCP registration lifecycle', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'modelContext');
    Reflect.deleteProperty(navigator, 'modelContext');
  });

  it('waits for all tool registrations before becoming ready', async () => {
    const pending = createDeferred();
    const context = createContext([
      Promise.resolve(),
      Promise.resolve(),
      Promise.resolve(),
      Promise.resolve(),
      pending.promise,
    ]);
    installContext(context);
    const actions = createActions();
    const { result } = renderHook(() => useWebMCP(actions));
    await act(async () => {});

    expect(context.registerTool).toHaveBeenCalledTimes(5);
    expect(result.current.isReady).toBe(false);

    await act(async () => pending.resolve());

    expect(result.current.isReady).toBe(true);
  });

  it('aborts every registration and reports a registration failure', async () => {
    const pending = createDeferred();
    const context = createContext([pending.promise]);
    installContext(context);
    const actions = createActions();
    const { result } = renderHook(() => useWebMCP(actions));
    await act(async () => {});

    await act(async () => pending.reject(new Error('Registration unavailable')));

    expect(result.current.isReady).toBe(false);
    expect(context.signals).toHaveLength(5);
    expect(context.signals.every((signal) => signal.aborted)).toBe(true);
    expect(result.current.logs).toContainEqual(
      expect.objectContaining({ message: expect.stringContaining('Registration unavailable') }),
    );
  });

  it('ignores late registration completion after unmount', async () => {
    const pending = createDeferred();
    const context = createContext([pending.promise]);
    installContext(context);
    const actions = createActions();
    const { result, unmount } = renderHook(() => useWebMCP(actions));
    await act(async () => {});

    unmount();
    await act(async () => pending.resolve());

    expect(context.signals.every((signal) => signal.aborted)).toBe(true);
    expect(result.current.logs.some((entry) => entry.message.startsWith('Tools registered'))).toBe(
      false,
    );
  });

  it('prefers document.modelContext to the legacy navigator context', async () => {
    const canonical = createContext();
    const legacy = createContext();
    installContext(canonical);
    Object.defineProperty(navigator, 'modelContext', { value: legacy, configurable: true });
    const actions = createActions();
    renderHook(() => useWebMCP(actions));
    await act(async () => {});

    expect(canonical.registerTool).toHaveBeenCalledTimes(5);
    expect(legacy.registerTool).not.toHaveBeenCalled();
  });

  it('waits for replacement registrations when actions change', async () => {
    const context = createContext();
    installContext(context);
    const { result, rerender } = renderHook(({ actions }) => useWebMCP(actions), {
      initialProps: { actions: createActions() },
    });
    await act(async () => {});
    expect(result.current.isReady).toBe(true);
    const originalSignals = [...context.signals];
    const pending = createDeferred();
    context.registerTool.mockReturnValue(pending.promise);

    rerender({ actions: createActions() });
    await act(async () => {});

    expect(originalSignals.every((signal) => signal.aborted)).toBe(true);
    expect(result.current.isReady).toBe(false);
    await act(async () => pending.resolve());
    expect(result.current.isReady).toBe(true);
    expect(context.registerTool).toHaveBeenCalledTimes(10);
  });
});
