// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock motion
jest.mock('motion/react', () => {
  const React = require('react');
  const MOTION_PROPS = new Set([
    'initial',
    'whileHover',
    'animate',
    'variants',
    'exit',
    'transition',
    'whileTap',
    'whileFocus',
    'whileInView',
    'onHoverStart',
    'onHoverEnd',
  ]);
  const createMotionWrapper = (tag) =>
    React.forwardRef(({ children, ...rest }, ref) => {
      const sanitizedProps = { ...rest };
      for (const key of MOTION_PROPS) {
        if (key in sanitizedProps) {
          delete sanitizedProps[key];
        }
      }

      return React.createElement(tag, { ref, ...sanitizedProps }, children);
    });

  return {
    motion: {
      div: createMotionWrapper('div'),
      section: createMotionWrapper('section'),
      h1: createMotionWrapper('h1'),
      span: createMotionWrapper('span'),
      nav: createMotionWrapper('nav'),
      ul: createMotionWrapper('ul'),
      li: createMotionWrapper('li'),
      p: createMotionWrapper('p'),
      img: createMotionWrapper('img'),
      button: createMotionWrapper('button'),
      svg: createMotionWrapper('svg'),
      path: createMotionWrapper('path'),
    },
    AnimatePresence: ({ children }) => children,
    useAnimationControls: () => ({
      start: jest.fn(),
      stop: jest.fn(),
    }),
  };
});

// Mock three.js and React Three Fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }) => {
    const { forwardRef } = jest.requireActual('react');
    return React.createElement('div', {
      'data-testid': 'react-three-fiber-canvas',
      ...props
    }, children);
  },
  useFrame: jest.fn((callback) => {
    // Mock useFrame to not execute callback in tests
    return () => {};
  }),
  useThree: () => ({
    camera: {
      position: { set: jest.fn(), copy: jest.fn() },
      lookAt: jest.fn(),
      updateProjectionMatrix: jest.fn(),
    },
    scene: {
      add: jest.fn(),
      remove: jest.fn(),
      children: [],
    },
    gl: {
      setSize: jest.fn(),
      render: jest.fn(),
      setPixelRatio: jest.fn(),
      getPixelRatio: jest.fn(() => 1),
      domElement: document.createElement('canvas'),
    },
    size: { width: 800, height: 600 },
    viewport: { width: 800, height: 600, factor: 1 },
    invalidate: jest.fn(),
    setSize: jest.fn(),
  }),
  extend: jest.fn(),
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: ({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': 'orbit-controls',
      ...props
    }, children);
  },
  Text: ({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': 'three-text',
      ...props
    }, children);
  },
  Box: ({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': 'three-box',
      ...props
    }, children);
  },
  Sphere: ({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': 'three-sphere',
      ...props
    }, children);
  },
  Html: ({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': 'html-content',
      ...props
    }, children);
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch for error logger tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({ status: 'logged' }),
    text: () => Promise.resolve('success'),
  })
);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock performance.mark and performance.measure
if (!global.performance.mark) {
  global.performance.mark = jest.fn();
}
if (!global.performance.measure) {
  global.performance.measure = jest.fn();
}

// Keep original console methods for tests that need to spy on them
// Tests will mock these individually as needed
