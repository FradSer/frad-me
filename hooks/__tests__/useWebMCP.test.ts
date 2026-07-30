import { renderHook } from '@testing-library/react';
import { useWebMCP, type WebMCPActions } from '../useWebMCP';

interface MockToolResult {
  content: { type: string; text: string }[];
}

interface MockTool {
  name: string;
  execute: (params: unknown) => Promise<MockToolResult>;
}

const createMockModelContext = () => {
  const tools: Record<string, MockTool> = {};
  const signals: AbortSignal[] = [];
  return {
    registerTool: jest.fn((tool: MockTool, options?: { signal?: AbortSignal }) => {
      tools[tool.name] = tool;
      if (options?.signal) {
        signals.push(options.signal);
      }
      return Promise.resolve();
    }),
    _tools: tools,
    _signals: signals,
  };
};

const createMockActions = (): WebMCPActions => ({
  navigate: jest.fn(() => ({ success: true, message: 'Navigated' })),
  getWorks: jest.fn(() => ({ success: true, count: 0, works: [] })),
  readWork: jest.fn(() => ({ success: true, work: {} })),
  searchWorks: jest.fn(() => ({ success: true, query: '', count: 0, results: [] })),
  getResume: jest.fn(() => ({ success: true, resume: {} })),
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
      expect.arrayContaining([expect.stringContaining('WebMCP API not available')]),
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
    expect(mc.registerTool).toHaveBeenCalledTimes(5);

    const toolNames = mc.registerTool.mock.calls.map((call) => call[0].name);
    expect(toolNames).toContain('navigate');
    expect(toolNames).toContain('get_works');
    expect(toolNames).toContain('read_work');
    expect(toolNames).toContain('search_works');
    expect(toolNames).toContain('get_resume');
  });

  it('should abort all tools on unmount via AbortSignal', () => {
    const mc = createMockModelContext();
    Object.defineProperty(window, 'navigator', {
      value: { ...originalNavigator, modelContext: mc },
      writable: true,
      configurable: true,
    });
    const actions = createMockActions();
    const { unmount } = renderHook(() => useWebMCP(actions));

    expect(mc._signals).toHaveLength(5);
    for (const signal of mc._signals) {
      expect(signal.aborted).toBe(false);
    }

    unmount();

    for (const signal of mc._signals) {
      expect(signal.aborted).toBe(true);
    }
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
      const result = await navigateTool.execute({ path: '/' });

      expect(actions.navigate).toHaveBeenCalledWith('/');
      expect(result.content[0].type).toBe('text');
    });

    it('should reject invalid path', async () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      renderHook(() => useWebMCP(actions));

      const navigateTool = mc._tools.navigate;
      const result = await navigateTool.execute({ path: '/invalid' });

      expect(actions.navigate).not.toHaveBeenCalled();
      expect(result.content[0].text).toContain('error');
    });
  });

  describe('get_works tool', () => {
    it('should execute and return works', async () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      renderHook(() => useWebMCP(actions));

      const worksTool = mc._tools.get_works;
      const result = await worksTool.execute({});

      expect(actions.getWorks).toHaveBeenCalled();
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('read_work tool', () => {
    it('should validate slug and execute', async () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      renderHook(() => useWebMCP(actions));

      const readTool = mc._tools.read_work;
      const result = await readTool.execute({ slug: 'bearychat' });

      expect(actions.readWork).toHaveBeenCalledWith('bearychat');
      expect(result.content[0].type).toBe('text');
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

      const readTool = mc._tools.read_work;
      const result = await readTool.execute({ slug: '' });

      expect(actions.readWork).not.toHaveBeenCalled();
      expect(result.content[0].text).toContain('error');
    });
  });

  describe('search_works tool', () => {
    it('should validate query and execute', async () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      renderHook(() => useWebMCP(actions));

      const searchTool = mc._tools.search_works;
      const result = await searchTool.execute({ query: 'design' });

      expect(actions.searchWorks).toHaveBeenCalledWith('design');
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('get_resume tool', () => {
    it('should execute and return resume', async () => {
      const mc = createMockModelContext();
      Object.defineProperty(window, 'navigator', {
        value: { ...originalNavigator, modelContext: mc },
        writable: true,
        configurable: true,
      });

      const actions = createMockActions();
      renderHook(() => useWebMCP(actions));

      const resumeTool = mc._tools.get_resume;
      const result = await resumeTool.execute({});

      expect(actions.getResume).toHaveBeenCalled();
      expect(result.content[0].type).toBe('text');
    });
  });
});
