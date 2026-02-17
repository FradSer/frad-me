import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useWebMCPContext, WebMCPProvider } from '../WebMCPContext';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock useWebMCP to avoid navigator.modelContext dependency
jest.mock('@/hooks/useWebMCP', () => ({
  useWebMCP: jest.fn(() => ({
    isReady: false,
    logs: [],
  })),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <WebMCPProvider>{children}</WebMCPProvider>
);

describe('WebMCPContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw when used outside WebMCPProvider', () => {
    expect(() => {
      renderHook(() => useWebMCPContext());
    }).toThrow('useWebMCPContext must be used within a WebMCPProvider');
  });

  it('should provide context values when used within WebMCPProvider', () => {
    const { result } = renderHook(() => useWebMCPContext(), { wrapper });

    expect(result.current.isReady).toBe(false);
    expect(result.current.logs).toEqual([]);
    expect(result.current.messageSent).toBe(false);
    expect(typeof result.current.setMessageSent).toBe('function');
  });

  it('should update messageSent state', () => {
    const { result } = renderHook(() => useWebMCPContext(), { wrapper });

    expect(result.current.messageSent).toBe(false);

    act(() => {
      result.current.setMessageSent(true);
    });

    expect(result.current.messageSent).toBe(true);
  });

  it("should create actions with navigate handling 'work' path", () => {
    // Access actions indirectly by checking what useWebMCP received
    const { useWebMCP } = require('@/hooks/useWebMCP');

    renderHook(() => useWebMCPContext(), { wrapper });

    const actions = useWebMCP.mock.calls[0][0];

    const result = actions.navigate('work');
    expect(mockPush).toHaveBeenCalledWith('/#work');
    expect(result).toEqual({
      success: true,
      message: 'Navigated to Work section',
    });
  });

  it("should create actions with navigate handling '/work' path", () => {
    const { useWebMCP } = require('@/hooks/useWebMCP');

    renderHook(() => useWebMCPContext(), { wrapper });

    const actions = useWebMCP.mock.calls[0][0];

    const result = actions.navigate('/work');
    expect(mockPush).toHaveBeenCalledWith('/#work');
    expect(result).toEqual({
      success: true,
      message: 'Navigated to Work section',
    });
  });

  it('should create actions with navigate handling generic path', () => {
    const { useWebMCP } = require('@/hooks/useWebMCP');

    renderHook(() => useWebMCPContext(), { wrapper });

    const actions = useWebMCP.mock.calls[0][0];

    const result = actions.navigate('/resume');
    expect(mockPush).toHaveBeenCalledWith('/resume');
    expect(result).toEqual({
      success: true,
      message: 'Navigated to /resume',
    });
  });

  it('should create actions with getWorks returning work list', () => {
    const { useWebMCP } = require('@/hooks/useWebMCP');

    renderHook(() => useWebMCPContext(), { wrapper });

    const actions = useWebMCP.mock.calls[0][0];
    const result = actions.getWorks();

    expect(result.success).toBe(true);
    expect(result.count).toBeGreaterThan(0);
    expect(Array.isArray(result.works)).toBe(true);
    expect(result.works[0]).toHaveProperty('title');
    expect(result.works[0]).toHaveProperty('slug');
  });

  it('should create actions with readWork returning work details', async () => {
    const { useWebMCP } = require('@/hooks/useWebMCP');

    // Mock fetch for the API call
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: true,
            work: { title: 'BearyChat', slug: 'bearychat' },
          }),
      }),
    ) as jest.Mock;

    renderHook(() => useWebMCPContext(), { wrapper });

    const actions = useWebMCP.mock.calls[0][0];
    const result = await actions.readWork('bearychat');

    expect(result.success).toBe(true);
    expect(result.work.title).toBe('BearyChat');
    expect(mockPush).toHaveBeenCalledWith('/works/bearychat');
  });

  it('should return error for unknown slug in readWork', async () => {
    const { useWebMCP } = require('@/hooks/useWebMCP');

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: false, error: 'Project not found' }),
      }),
    ) as jest.Mock;

    renderHook(() => useWebMCPContext(), { wrapper });

    const actions = useWebMCP.mock.calls[0][0];
    const result = await actions.readWork('nonexistent');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Project not found');
  });

  it('should open external link for works with externalLink', async () => {
    const { useWebMCP } = require('@/hooks/useWebMCP');
    const mockOpen = jest.fn();
    window.open = mockOpen;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: true,
            work: { title: 'vivo Vision', slug: 'vivo-vision' },
          }),
      }),
    ) as jest.Mock;

    renderHook(() => useWebMCPContext(), { wrapper });

    const actions = useWebMCP.mock.calls[0][0];
    const result = await actions.readWork('vivo-vision');

    expect(result.success).toBe(true);
    expect(mockOpen).toHaveBeenCalledWith('https://www.vivo.com.cn/vivo/vivovision/', '_blank');
  });
});
