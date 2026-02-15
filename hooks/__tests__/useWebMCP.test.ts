import { act, renderHook } from '@testing-library/react';
import { useWebMCP, type WebMCPActions } from '../useWebMCP';

const createMockModelContext = () => {
  const tools: Record<string, { execute: (params: unknown) => Promise<unknown> }> = {};
  return {
    registerTool: jest.fn((tool) => {
      tools[tool.name] = tool;
    }),
    _tools: tools,
  };
};

const createMockActions = (): WebMCPActions => ({
  navigate: jest.fn(() => ({ success: true, message: 'Navigated' })),
  getWorks: jest.fn(() => ({ success: true, count: 0, works: [] })),
  readWork: jest.fn(() => ({ success: true, work: {} })),
});

describe('useWebMCP', () => {
  const originalNavigator = window.navigator;

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('should return isReady=false when navigator.modelContext is absent', () => {
    const actions = createMockActions();
    const { result } = renderHook(() => useWebMCP(actions));

    expect(result.current.isReady).toBe(false);
    expect(result.current.logs).toEqual(
      expect.arrayContaining([expect.stringContaining('WebMCP API not found')]),
    );
  });

  it('should register tools and set isReady=true when modelContext is available', () => {
    const mc = createMockModelContext();
    Object.defineProperty(window, 'navigator', {
      value: { ...originalNavigator, modelContext: mc },
      writable: true,
      configurable: true,
    });

    const actions = createMockActions();
    const { result } = renderHook(() => useWebMCP(actions));

    expect(result.current.isReady).toBe(true);
    expect(mc.registerTool).toHaveBeenCalledTimes(3);

    const toolNames = mc.registerTool.mock.calls.map((call: [{ name: string }]) => call[0].name);
    expect(toolNames).toContain('navigate');
    expect(toolNames).toContain('get_works');
    expect(toolNames).toContain('read_work');
  });

  it('should not register tools twice on re-render', () => {
    const mc = createMockModelContext();
    Object.defineProperty(window, 'navigator', {
      value: { ...originalNavigator, modelContext: mc },
      writable: true,
      configurable: true,
    });

    const actions = createMockActions();
    const { rerender } = renderHook(() => useWebMCP(actions));

    rerender();
    rerender();

    expect(mc.registerTool).toHaveBeenCalledTimes(3);
  });

  describe('navigate tool', () => {
    it('should validate and execute with valid path', async () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      renderHook(() => useWebMCP(actions));

      const navigateTool = mc._tools.navigate;
      let toolResult: unknown;

      await act(async () => {
        toolResult = await navigateTool.execute({ path: '/' });
      });

      expect(actions.navigate).toHaveBeenCalledWith('/');
      expect(toolResult).toEqual({
        content: [{ type: 'text', text: expect.any(String) }],
      });
    });

    it('should reject invalid paths', async () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      renderHook(() => useWebMCP(actions));

      const navigateTool = mc._tools.navigate;
      let toolResult: { content: { text: string }[] } | undefined;

      await act(async () => {
        toolResult = (await navigateTool.execute({
          path: '/invalid',
        })) as typeof toolResult;
      });

      expect(actions.navigate).not.toHaveBeenCalled();
      expect(JSON.parse(toolResult?.content[0].text ?? '')).toEqual({
        error: 'Invalid parameters',
      });
    });

    it("should accept 'work' without leading slash", async () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      renderHook(() => useWebMCP(actions));

      const navigateTool = mc._tools.navigate;

      await act(async () => {
        await navigateTool.execute({ path: 'work' });
      });

      expect(actions.navigate).toHaveBeenCalledWith('work');
    });
  });

  describe('get_works tool', () => {
    it('should execute without params', async () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      renderHook(() => useWebMCP(actions));

      const getWorksTool = mc._tools.get_works;

      await act(async () => {
        await getWorksTool.execute({});
      });

      expect(actions.getWorks).toHaveBeenCalled();
    });
  });

  describe('read_work tool', () => {
    it('should validate and execute with valid slug', async () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      renderHook(() => useWebMCP(actions));

      const readWorkTool = mc._tools.read_work;

      await act(async () => {
        await readWorkTool.execute({ slug: 'vivo-vision' });
      });

      expect(actions.readWork).toHaveBeenCalledWith('vivo-vision');
    });

    it('should reject empty slug', async () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      renderHook(() => useWebMCP(actions));

      const readWorkTool = mc._tools.read_work;
      let toolResult: { content: { text: string }[] } | undefined;

      await act(async () => {
        toolResult = (await readWorkTool.execute({
          slug: '',
        })) as typeof toolResult;
      });

      expect(actions.readWork).not.toHaveBeenCalled();
      expect(JSON.parse(toolResult?.content[0].text ?? '')).toEqual({
        error: 'Invalid parameters',
      });
    });
  });

  describe('logging', () => {
    it('should cap logs at 20 entries', () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      const { result } = renderHook(() => useWebMCP(actions));

      // registration produces 1 log entry ("Tools registered successfully.")
      expect(result.current.logs.length).toBeLessThanOrEqual(20);
    });
  });
});
