import '@testing-library/jest-dom'

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
  beforePopState: vi.fn(),
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
}

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => props.children,
    section: (props: any) => props.children,
    h1: (props: any) => props.children,
    p: (props: any) => props.children,
    img: (props: any) => props.children,
    button: (props: any) => props.children,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimationControls: () => ({
    start: vi.fn(),
    stop: vi.fn(),
  }),
}))

// Mock three.js and React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => children,
  useFrame: () => {},
  useThree: () => ({
    camera: {},
    scene: {},
    gl: {},
  }),
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Text: ({ children }: { children: React.ReactNode }) => children,
  Box: () => null,
  Sphere: () => null,
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})