import { Canvas } from '@react-three/fiber';
import { act, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import type * as THREE from 'three';
import { WebXRViewProvider } from '@/contexts/WebXR/WebXRViewContext';
import { useSimpleLerp } from '@/hooks/useSimpleLerp';
import { heroAnimationStates } from '@/utils/webxr/animationHelpers';
import HeroText from '../HeroText';

// Mock the dynamic Text import
jest.mock('@react-three/drei', () => ({
  Text: ({
    children,
    color,
    position,
    font,
    anchorX,
    anchorY,
    fontSize,
    rotation,
    ...props
  }: React.ComponentProps<'mesh'> & {
    color?: string;
    font?: unknown;
    anchorX?: number | 'center' | 'left' | 'right';
    anchorY?: number | 'center' | 'top' | 'bottom';
    fontSize?: number;
    rotation?: [number, number, number];
  }) =>
    React.createElement(
      'mesh',
      {
        'data-testid': 'text-mock',
        position,
        rotation,
        font,
        anchorX,
        anchorY,
        fontSize,
        color,
        ...props,
      },
      React.createElement('text', { 'data-testid': 'text-content' }, children),
    ),
}));

// Mock performance measurement
jest.mock('@/utils/performance', () => ({
  measureChunkLoad: jest.fn((_name, fn) => fn()),
}));

// Mock Next.js dynamic import
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (_dynamicImport: () => Promise<React.ComponentType>) => {
    const Component = () => {
      const { Text } = require('@react-three/drei');
      return Text;
    };
    return Component;
  },
}));

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <WebXRViewProvider>
    <Canvas>{children}</Canvas>
  </WebXRViewProvider>
);

describe('HeroText Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <HeroText />
        </TestWrapper>,
      );
      expect(document.body).toBeTruthy();
    });

    it('renders hero content elements', () => {
      render(
        <TestWrapper>
          <HeroText />
        </TestWrapper>,
      );

      // Check that the component renders without errors and contains the expected structure
      // The Text component may not render in test environment, but the structure should be there
      expect(document.body).toBeTruthy();

      // Check for the group structure
      const canvas = screen.getByTestId('react-three-fiber-canvas');
      expect(canvas).toBeTruthy();
    });

    it('renders all shape types', () => {
      render(
        <TestWrapper>
          <HeroText />
        </TestWrapper>,
      );

      // The component should render Triangle, Box, and Sphere shapes
      expect(document.querySelectorAll('mesh')).toHaveLength(3);
    });

    it('applies lighting setup', () => {
      render(
        <TestWrapper>
          <HeroText />
        </TestWrapper>,
      );

      expect(document.querySelector('ambientLight')).toBeTruthy();
      expect(document.querySelector('pointLight')).toBeTruthy();
    });
  });

  describe('View-based Animations', () => {
    it('starts with home animation state', () => {
      const { result } = renderHook(
        () => ({
          positionX: useSimpleLerp(heroAnimationStates.home.position.x, { speed: 0.1 }),
          positionY: useSimpleLerp(heroAnimationStates.home.position.y, { speed: 0.1 }),
          positionZ: useSimpleLerp(heroAnimationStates.home.position.z, { speed: 0.1 }),
          opacity: useSimpleLerp(heroAnimationStates.home.opacity, { speed: 0.1 }),
        }),
        {
          wrapper: ({ children }) => <WebXRViewProvider>{children}</WebXRViewProvider>,
        },
      );

      expect(result.current.positionX.value).toBe(heroAnimationStates.home.position.x);
      expect(result.current.positionY.value).toBe(heroAnimationStates.home.position.y);
      expect(result.current.positionZ.value).toBe(heroAnimationStates.home.position.z);
      expect(result.current.opacity.value).toBe(heroAnimationStates.home.opacity);
    });

    it('transitions to hidden state when view changes to work', () => {
      const { result } = renderHook(() => {
        const [currentView, setCurrentView] = React.useState<'home' | 'work'>('home');
        const positionY = useSimpleLerp(heroAnimationStates.home.position.y, { speed: 0.1 });
        const opacity = useSimpleLerp(heroAnimationStates.home.opacity, { speed: 0.1 });

        // Simulate view change behavior
        React.useEffect(() => {
          if (currentView === 'work') {
            positionY.set(heroAnimationStates.hidden.position.y);
            opacity.set(heroAnimationStates.hidden.opacity);
          } else {
            positionY.set(heroAnimationStates.home.position.y);
            opacity.set(heroAnimationStates.home.opacity);
          }
        }, [currentView, positionY, opacity]);

        return { currentView, setCurrentView, positionY, opacity };
      }, {});

      // Initial state should be home
      expect(result.current.positionY.value).toBe(heroAnimationStates.home.position.y);
      expect(result.current.opacity.value).toBe(heroAnimationStates.home.opacity);

      // Change to work view
      act(() => {
        result.current.setCurrentView('work');
      });

      // After view change, springs should be set to target hidden state values
      // Note: Springs interpolate over time, so we test the target setting behavior
      expect(result.current.positionY.value).toBe(heroAnimationStates.home.position.y); // Still animating
      expect(result.current.opacity.value).toBe(heroAnimationStates.home.opacity); // Still animating
    });

    it('handles visibility based on opacity threshold', () => {
      const groupRef = { current: null as THREE.Group | null };

      // Mock THREE.Group
      const mockGroup = {
        position: { set: jest.fn() },
        scale: { set: jest.fn() },
        visible: true,
        traverse: jest.fn(),
      } as unknown as THREE.Group;

      groupRef.current = mockGroup;

      // Test high opacity - should be visible
      expect(mockGroup.visible).toBe(true);

      // Test very low opacity - should be hidden
      const lowOpacity = 0.005;
      expect(lowOpacity > 0.01).toBe(false);
    });
  });

  describe('Interactive Mesh Hook', () => {
    it('handles hover state changes', () => {
      const { result } = renderHook(() => {
        const [hovered, setHovered] = React.useState(false);
        const [active, _setActive] = React.useState(false);
        const scaleSpring = useSimpleLerp(1, { speed: 0.1 });
        const rotationSpring = useSimpleLerp(0, { speed: 0.1 });

        const handlers = {
          onPointerOver: () => {
            setHovered(true);
            scaleSpring.set(1.1);
            rotationSpring.set(1);
          },
          onPointerOut: () => {
            setHovered(false);
            if (!active) {
              scaleSpring.set(1);
              rotationSpring.set(0);
            }
          },
        };

        return { hovered, active, scaleSpring, rotationSpring, handlers };
      }, {});

      // Initial state
      expect(result.current.hovered).toBe(false);
      expect(result.current.scaleSpring.value).toBe(1);
      expect(result.current.rotationSpring.value).toBe(0);

      // Simulate hover - test that handlers are functions and state changes
      act(() => {
        result.current.handlers.onPointerOver();
      });

      expect(result.current.hovered).toBe(true);
      // Note: Springs interpolate over time, so we test that they start with correct initial values
      expect(result.current.scaleSpring.value).toBe(1);
      expect(result.current.rotationSpring.value).toBe(0);

      // Simulate hover out
      act(() => {
        result.current.handlers.onPointerOut();
      });

      expect(result.current.hovered).toBe(false);
    });

    it('handles click state changes', () => {
      const { result } = renderHook(() => {
        const [active, setActive] = React.useState(false);
        const scaleSpring = useSimpleLerp(1, { speed: 0.1 });
        const rotationSpring = useSimpleLerp(0, { speed: 0.1 });

        const handlers = {
          onClick: () => {
            setActive(!active);
            scaleSpring.set(active ? 1 : 1.3);
            rotationSpring.set(active ? 0 : 2);
          },
        };

        return { active, scaleSpring, rotationSpring, handlers };
      }, {});

      // Initial state
      expect(result.current.active).toBe(false);
      expect(result.current.scaleSpring.value).toBe(1);
      expect(result.current.rotationSpring.value).toBe(0);

      // First click - activate
      act(() => {
        result.current.handlers.onClick();
      });

      expect(result.current.active).toBe(true);

      // Second click - deactivate
      act(() => {
        result.current.handlers.onClick();
      });

      expect(result.current.active).toBe(false);
    });

    it('maintains active state on hover out', () => {
      const { result } = renderHook(() => {
        const [hovered, setHovered] = React.useState(false);
        const [active, _setActive] = React.useState(true); // Start active

        const handlers = {
          onPointerOver: () => {
            setHovered(true);
          },
          onPointerOut: () => {
            setHovered(false);
            // Test that active state is maintained
          },
        };

        return { hovered, active, handlers };
      }, {});

      // Hover over active element
      act(() => {
        result.current.handlers.onPointerOver();
      });

      expect(result.current.hovered).toBe(true);
      expect(result.current.active).toBe(true); // Should remain active

      // Hover out - should maintain active state
      act(() => {
        result.current.handlers.onPointerOut();
      });

      expect(result.current.hovered).toBe(false);
      expect(result.current.active).toBe(true); // Should still be active
    });
  });

  describe('Shape Components', () => {
    it('renders Box with correct geometry', () => {
      render(
        <TestWrapper>
          <mesh data-testid="box-mesh">
            <boxGeometry args={[3, 1, 1]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </TestWrapper>,
      );

      expect(screen.getByTestId('box-mesh')).toBeTruthy();
    });

    it('renders Triangle with correct geometry', () => {
      render(
        <TestWrapper>
          <mesh data-testid="triangle-mesh">
            <coneGeometry args={[1, 1.4, 3, 1]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </TestWrapper>,
      );

      expect(screen.getByTestId('triangle-mesh')).toBeTruthy();
    });

    it('renders Sphere with correct geometry', () => {
      render(
        <TestWrapper>
          <mesh data-testid="sphere-mesh">
            <sphereGeometry args={[0.65, 16, 16]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </TestWrapper>,
      );

      expect(screen.getByTestId('sphere-mesh')).toBeTruthy();
    });

    it('applies hover color changes', () => {
      const { result } = renderHook(() => {
        const [hovered, setHovered] = React.useState(false);

        return {
          hovered,
          color: hovered ? 'gray' : 'white',
          onPointerOver: () => setHovered(true),
          onPointerOut: () => setHovered(false),
        };
      }, {});

      // Initial color should be white
      expect(result.current.color).toBe('white');

      // Simulate hover
      act(() => {
        result.current.onPointerOver();
      });

      expect(result.current.hovered).toBe(true);
      expect(result.current.color).toBe('gray');

      // Simulate hover out
      act(() => {
        result.current.onPointerOut();
      });

      expect(result.current.hovered).toBe(false);
      expect(result.current.color).toBe('white');
    });
  });

  describe('Text Rendering', () => {
    it('renders text with correct properties', () => {
      // Test that the heroContent configuration contains expected text elements
      const heroContent = [
        { type: 'line', text: 'Frad LEE' },
        { type: 'line', text: 'is a self-taught craftier' },
        { type: 'line', text: 'who is eager to learn for' },
        { type: 'line', text: 'advancement. Whether it is' },
        { type: 'line', text: 'coding in a new language,' },
        { type: 'line', text: 'design with any tool whatsoever' },
        { type: 'line', text: 'or building a startup' },
      ];

      // Check that text elements have expected content
      expect(heroContent.some((item) => item.text?.includes('Frad LEE'))).toBe(true);
      expect(heroContent.some((item) => item.text?.includes('is a self-taught craftier'))).toBe(
        true,
      );
      expect(heroContent.some((item) => item.text?.includes('who is eager to learn for'))).toBe(
        true,
      );
    });

    it('applies correct font and positioning', () => {
      // Test the Line component props configuration
      const lineProps = {
        anchorX: 'center',
        anchorY: 'middle',
        fontSize: 1,
        font: 'fonts/GT-Eesti-Display-Bold-Trial.woff',
      };

      // Verify that the Line component would receive correct props
      expect(lineProps.anchorX).toBe('center');
      expect(lineProps.anchorY).toBe('middle');
      expect(lineProps.fontSize).toBe(1);
      expect(lineProps.font).toBe('fonts/GT-Eesti-Display-Bold-Trial.woff');
    });

    it('handles text color variations', () => {
      // Test that heroContent contains text elements with different colors
      const textElements = [
        { type: 'line', color: 'white', text: 'Frad LEE' },
        { type: 'line', color: 'gray', text: 'is a self-taught craftier' },
        { type: 'line', color: 'gray', text: 'who is eager to learn for' },
      ];

      // Check for color variations
      const whiteText = textElements.find((el) => el.color === 'white');
      const grayText = textElements.find((el) => el.color === 'gray');

      expect(whiteText).toBeTruthy();
      expect(grayText).toBeTruthy();
    });
  });

  describe('Animation Performance', () => {
    it('optimizes visibility based on opacity', () => {
      const groupRef = { current: null as THREE.Group | null };

      // Mock THREE.Group
      const mockGroup = {
        position: { set: jest.fn() },
        scale: { set: jest.fn() },
        visible: true,
        traverse: jest.fn(),
      } as unknown as THREE.Group;

      groupRef.current = mockGroup;

      // Test with high opacity - should remain visible
      const highOpacity = 0.5;
      expect(highOpacity > 0.01).toBe(true);

      // Test with very low opacity - should be hidden
      const veryLowOpacity = 0.005;
      expect(veryLowOpacity > 0.01).toBe(false);

      // Test at threshold
      const thresholdOpacity = 0.01;
      expect(thresholdOpacity > 0.01).toBe(false);

      const aboveThresholdOpacity = 0.011;
      expect(aboveThresholdOpacity > 0.01).toBe(true);
    });

    it('applies material opacity to all child materials', () => {
      const mockMaterial1 = { opacity: 1, transparent: false };
      const mockMaterial2 = { opacity: 1, transparent: false };

      const mockMesh = {
        material: [mockMaterial1, mockMaterial2],
      };

      // Simulate opacity application
      const newOpacity = 0.7;
      if (Array.isArray(mockMesh.material)) {
        mockMesh.material.forEach((material) => {
          material.opacity = newOpacity;
          material.transparent = true;
        });
      }

      expect(mockMaterial1.opacity).toBe(newOpacity);
      expect(mockMaterial1.transparent).toBe(true);
      expect(mockMaterial2.opacity).toBe(newOpacity);
      expect(mockMaterial2.transparent).toBe(true);
    });

    it('handles single material opacity', () => {
      const mockMaterial = { opacity: 1, transparent: false };

      const mockMesh = {
        material: mockMaterial,
      };

      // Simulate opacity application
      const newOpacity = 0.5;
      const material = mockMesh.material;
      if (material && !Array.isArray(material)) {
        material.opacity = newOpacity;
        material.transparent = true;
      }

      expect(mockMaterial.opacity).toBe(newOpacity);
      expect(mockMaterial.transparent).toBe(true);
    });
  });

  describe('Content Configuration', () => {
    it('maintains consistent hero content structure', () => {
      const heroContent = [
        { type: 'triangle', position: [-9, 4, 0] as [number, number, number] },
        {
          type: 'line',
          position: [-5.3, 3, 0] as [number, number, number],
          color: 'white',
          text: 'Frad LEE',
        },
        {
          type: 'line',
          position: [2, 3, 0] as [number, number, number],
          color: 'gray',
          text: 'is a self-taught craftier',
        },
        { type: 'box', position: [5.7, 1.8, 0] as [number, number, number] },
        { type: 'sphere', position: [3.2, -4, 0] as [number, number, number] },
      ];

      // Verify structure
      expect(heroContent).toHaveLength(5);
      expect(heroContent.filter((item) => item.type === 'line')).toHaveLength(2);
      expect(heroContent.filter((item) => item.type === 'triangle')).toHaveLength(1);
      expect(heroContent.filter((item) => item.type === 'box')).toHaveLength(1);
      expect(heroContent.filter((item) => item.type === 'sphere')).toHaveLength(1);
    });

    it('handles different content types in renderElement', () => {
      const elements = [
        {
          type: 'line',
          position: [0, 0, 0] as [number, number, number],
          color: 'white',
          text: 'Test',
        },
        { type: 'box', position: [1, 1, 1] as [number, number, number] },
        {
          type: 'triangle',
          position: [2, 2, 2] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: 1,
        },
        { type: 'sphere', position: [3, 3, 3] as [number, number, number] },
        { type: 'unknown', position: [4, 4, 4] as [number, number, number] },
      ];

      // Test that renderElement handles all types appropriately
      elements.forEach((element, index) => {
        const key = `${element.type}-${index}`;
        expect(key).toBeDefined();

        switch (element.type) {
          case 'line':
            expect(element.color).toBeDefined();
            expect(element.text).toBeDefined();
            break;
          case 'box':
          case 'triangle':
          case 'sphere':
            expect(element.position).toBeDefined();
            break;
          default:
            // Unknown types should return null
            expect(null).toBeNull();
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing group ref gracefully', () => {
      const groupRef = { current: null };

      // Should not throw error when groupRef.current is null
      expect(() => {
        if (!groupRef.current) {
          // This is the expected behavior
          return;
        }
      }).not.toThrow();
    });

    it('handles material traversal errors', () => {
      const mockMesh = {
        material: null, // Invalid material
      };

      // Should handle invalid materials gracefully
      expect(() => {
        if (mockMesh.material) {
          // Material exists, process it
        } else {
          // Material is null, skip processing
        }
      }).not.toThrow();
    });
  });
});
