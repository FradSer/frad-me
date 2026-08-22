// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

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
      header: createMotionWrapper('header'),
      main: createMotionWrapper('main'),
      span: createMotionWrapper('span'),
      nav: createMotionWrapper('nav'),
      ul: createMotionWrapper('ul'),
      li: createMotionWrapper('li'),
      p: createMotionWrapper('p'),
      img: createMotionWrapper('img'),
      button: createMotionWrapper('button'),
      svg: createMotionWrapper('svg'),
      path: createMotionWrapper('path'),
      line: createMotionWrapper('line'),
    },
    AnimatePresence: ({ children }) => children,
    useAnimationControls: () => ({
      start: jest.fn(),
      stop: jest.fn(),
    }),
    useMotionValue: (initial) => {
      let value = initial;
      return {
        get: () => value,
        set: (next) => {
          value = next;
        },
        on: () => () => {},
        onChange: () => () => {},
        destroy: () => {},
      };
    },
    useSpring: (source) => {
      if (source && typeof source === 'object' && 'get' in source) return source;
      let value = source;
      return {
        get: () => value,
        set: (next) => {
          value = next;
        },
        on: () => () => {},
        onChange: () => () => {},
        destroy: () => {},
      };
    },
    useTransform: (_source, _input, output) => {
      const value = Array.isArray(output) ? output[0] : output;
      let current = value;
      return {
        get: () => current,
        set: (next) => {
          current = next;
        },
        on: () => () => {},
        onChange: () => () => {},
        destroy: () => {},
      };
    },
  };
});

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
  }),
);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Keep original console methods for tests that need to spy on them
// Tests will mock these individually as needed
