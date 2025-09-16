import React from 'react';

// Factory for creating mock components with consistent patterns
export const createMockComponent = (testId: string, additionalProps?: Record<string, unknown>) =>
  ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('div', {
      'data-testid': testId,
      ...props,
      ...additionalProps
    }, children);

// Factory for creating mock functions with default behaviors
export const createMockFunctions = (...names: string[]) =>
  names.reduce((acc, name) => {
    acc[name] = jest.fn();
    return acc;
  }, {} as Record<string, jest.Mock>);

// Factory for creating mock router
export const createMockRouter = (overrides: Record<string, unknown> = {}) => ({
  ...createMockFunctions('push', 'replace', 'reload', 'back', 'prefetch', 'beforePopState'),
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  ...overrides,
});

// Factory for creating mock theme provider
export const createMockTheme = (overrides: Record<string, unknown> = {}) => ({
  theme: 'light',
  setTheme: jest.fn(),
  resolvedTheme: 'light',
  ...overrides,
});

// Factory for creating framer-motion mocks
export const createFramerMotionMocks = () => ({
  motion: {
    div: createMockComponent('framer-motion-div'),
    section: createMockComponent('framer-motion-section'),
    h1: createMockComponent('framer-motion-h1'),
    p: createMockComponent('framer-motion-p'),
    img: createMockComponent('framer-motion-img'),
    button: createMockComponent('framer-motion-button'),
  },
  AnimatePresence: createMockComponent('animate-presence'),
  useAnimationControls: () => createMockFunctions('start', 'stop'),
});

// Factory for creating Three.js mocks
export const createThreeJSMocks = () => ({
  Canvas: createMockComponent('react-three-fiber-canvas'),
  useFrame: jest.fn((callback) => () => {}),
  useThree: () => ({
    camera: {
      ...createMockFunctions('lookAt', 'updateProjectionMatrix'),
      position: createMockFunctions('set', 'copy'),
    },
    scene: {
      ...createMockFunctions('add', 'remove'),
      children: [],
    },
    gl: {
      ...createMockFunctions('setSize', 'render', 'setPixelRatio'),
      getPixelRatio: jest.fn(() => 1),
      domElement: document.createElement('canvas'),
    },
    size: { width: 800, height: 600 },
    viewport: { width: 800, height: 600, factor: 1 },
    ...createMockFunctions('invalidate', 'setSize'),
  }),
  extend: jest.fn(),
});

// Factory for creating Three.js component mocks
export const createThreeDreiMocks = () => ({
  OrbitControls: createMockComponent('orbit-controls'),
  Text: createMockComponent('three-text'),
  Box: createMockComponent('three-box'),
  Sphere: createMockComponent('three-sphere'),
  Html: createMockComponent('html-content'),
});

// Factory for creating observer mocks
export const createObserverMock = (methods: string[] = ['observe', 'unobserve', 'disconnect']) =>
  jest.fn().mockImplementation(() => createMockFunctions(...methods));

// Factory for creating global mocks
export const createGlobalMocks = () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ status: 'logged' }),
      text: () => Promise.resolve('success'),
    })
  ),
  localStorage: createMockFunctions('getItem', 'setItem', 'removeItem', 'clear'),
  performance: {
    mark: jest.fn(),
    measure: jest.fn(),
  },
  matchMedia: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    ...createMockFunctions('addListener', 'removeListener', 'addEventListener', 'removeEventListener', 'dispatchEvent'),
  })),
});