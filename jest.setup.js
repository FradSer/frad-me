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
  };
});

// Mock three.js and React Three Fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'react-three-fiber-canvas',
        ...props,
      },
      children,
    );
  },
  useFrame: jest.fn((_callback) => {
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
    return React.createElement(
      'div',
      {
        'data-testid': 'orbit-controls',
        ...props,
      },
      children,
    );
  },
  Text: ({ children, ...props }) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'three-text',
        ...props,
      },
      children,
    );
  },
  Box: ({ children, ...props }) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'three-box',
        ...props,
      },
      children,
    );
  },
  Sphere: ({ children, ...props }) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'three-sphere',
        ...props,
      },
      children,
    );
  },
  Html: ({ children, ...props }) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'html-content',
        ...props,
      },
      children,
    );
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

// Mock performance.mark and performance.measure
if (!global.performance.mark) {
  global.performance.mark = jest.fn();
}
if (!global.performance.measure) {
  global.performance.measure = jest.fn();
}

// Keep original console methods for tests that need to spy on them
// Tests will mock these individually as needed

// Mock HTMLCanvasElement.getContext for three.js tests
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return {
      getParameter: jest.fn(() => 0),
      enable: jest.fn(),
      disable: jest.fn(),
      createShader: jest.fn(() => ({})),
      createProgram: jest.fn(() => ({})),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      useProgram: jest.fn(),
      deleteProgram: jest.fn(),
      deleteShader: jest.fn(),
      getShaderParameter: jest.fn(() => true),
      getProgramParameter: jest.fn(() => true),
      getProgramInfoLog: jest.fn(() => ''),
      getShaderInfoLog: jest.fn(() => ''),
      createBuffer: jest.fn(() => ({})),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      vertexAttribPointer: jest.fn(),
      enableVertexAttribArray: jest.fn(),
      disableVertexAttribArray: jest.fn(),
      drawElements: jest.fn(),
      drawArrays: jest.fn(),
      activeTexture: jest.fn(),
      bindTexture: jest.fn(),
      texImage2D: jest.fn(),
      texParameteri: jest.fn(),
      createTexture: jest.fn(() => ({})),
      deleteBuffer: jest.fn(),
      deleteTexture: jest.fn(),
      getUniformLocation: jest.fn(() => ({})),
      getAttribLocation: jest.fn(() => 0),
      uniform1f: jest.fn(),
      uniform2f: jest.fn(),
      uniform3f: jest.fn(),
      uniform4f: jest.fn(),
      uniform1i: jest.fn(),
      uniform2i: jest.fn(),
      uniform3i: jest.fn(),
      uniform4i: jest.fn(),
      uniformMatrix4fv: jest.fn(),
      createFramebuffer: jest.fn(() => ({})),
      bindFramebuffer: jest.fn(),
      framebufferTexture2D: jest.fn(),
      deleteFramebuffer: jest.fn(),
      createRenderbuffer: jest.fn(() => ({})),
      bindRenderbuffer: jest.fn(),
      framebufferRenderbuffer: jest.fn(),
      deleteRenderbuffer: jest.fn(),
      clearColor: jest.fn(),
      clear: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      depthFunc: jest.fn(),
      cullFace: jest.fn(),
      frontFace: jest.fn(),
      viewport: jest.fn(),
      scissor: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      blendFunc: jest.fn(),
      blendEquation: jest.fn(),
    };
  }
  return null;
});

// Mock WebGLRenderer in three.js
jest.mock('three', () => {
  const actualThree = jest.requireActual('three');

  return {
    ...actualThree,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      info: {
        render: {
          calls: 0,
          triangles: 0,
          points: 0,
          lines: 0,
        },
        memory: {
          geometries: 0,
          textures: 0,
        },
      },
      domElement: document.createElement('canvas'),
      setPixelRatio: jest.fn(),
      getPixelRatio: jest.fn(() => 1),
    })),
  };
});
