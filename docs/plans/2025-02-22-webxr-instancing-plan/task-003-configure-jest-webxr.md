# Task 003: Configure Jest for WebXR Testing

**Priority**: P0
**Estimated Effort**: 0.5 day
**Phase**: 1 - Test Infrastructure

## Description

Configure Jest to properly test WebXR components. This includes mocking Three.js, React Three Fiber, and setting up test utilities.

## Verification (Test-First)

### Red - Create Failing Test Configuration

Verify Jest can run existing unit tests and discover new WebXR tests.

### Expected Behavior

- Jest configuration supports Three.js and R3F mocking
- Unit tests can import WebXR utilities without errors
- Component tests can render with @react-three/fiber

## Files to Modify

### jest.setup.js (existing)

Ensure Three.js mocks are configured:

```javascript
// Mock THREE.js
jest.mock('three', () => ({
  ...jest.requireActual('three'),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    info: { render: { calls: 0 } },
  })),
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn(), x: 0, y: 0, z: 5 },
    lookAt: jest.fn(),
  })),
  // ... other Three.js mocks
}));

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  ...jest.requireActual('@react-three/fiber'),
  useFrame: jest.fn((callback) => callback({ clock: { elapsedTime: 0 } }, 0)),
  useThree: jest.fn(() => ({
    camera: { position: { x: 0, y: 0, z: 5 } },
    scene: { add: jest.fn(), remove: jest.fn() },
    gl: { setSize: jest.fn(), render: jest.fn() },
  })),
}));
```

### tests/utils/webxr/testUtils.ts

Create test utilities:

```typescript
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';

export const renderWithR3F = (component: React.ReactElement) => {
  return render(<Canvas>{component}</Canvas>);
};

export const createMockWorks = () => [
  { title: 'Project 1', subTitle: 'Description 1', slug: 'project-1', cover: '/img1.jpg' },
  { title: 'Project 2', subTitle: 'Description 2', slug: 'project-2', cover: '/img2.jpg' },
  // ...
];
```

## Verification Steps

1. Run `pnpm test -- --listTests` to verify test discovery
2. Run existing unit tests in `utils/webxr/__tests__/`
3. Verify no import errors for Three.js/R3F

## Acceptance Criteria

- Jest runs without configuration errors
- Existing WebXR unit tests pass
- New test utilities can be imported

## Dependencies

**depends-on**: None
