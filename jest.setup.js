// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import {
  createMockRouter,
  createMockTheme,
  createFramerMotionMocks,
  createThreeJSMocks,
  createThreeDreiMocks,
  createObserverMock,
  createGlobalMocks,
} from '@/utils/test/mockFactories';

// Mock Next.js router
const mockRouter = createMockRouter();

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock next-themes
const mockTheme = createMockTheme();

jest.mock('next-themes', () => ({
  useTheme: () => mockTheme,
  ThemeProvider: ({ children }) => children,
}));

// Mock framer-motion
const framerMotionMocks = createFramerMotionMocks();

jest.mock('framer-motion', () => framerMotionMocks);

// Mock three.js and React Three Fiber
const threeJSMocks = createThreeJSMocks();

jest.mock('@react-three/fiber', () => threeJSMocks);

// Mock Three.js components
const threeDreiMocks = createThreeDreiMocks();

jest.mock('@react-three/drei', () => threeDreiMocks);

// Setup global mocks
const globalMocks = createGlobalMocks();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: globalMocks.matchMedia,
});

// Mock observers
global.ResizeObserver = createObserverMock();
global.IntersectionObserver = createObserverMock();

// Mock global APIs
global.fetch = globalMocks.fetch;
global.localStorage = globalMocks.localStorage;

// Mock performance APIs
if (!global.performance.mark) {
  global.performance.mark = globalMocks.performance.mark;
}
if (!global.performance.measure) {
  global.performance.measure = globalMocks.performance.measure;
}

// Keep original console methods for tests that need to spy on them
// Tests will mock these individually as needed
