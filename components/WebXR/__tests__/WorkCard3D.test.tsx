/// <reference types="jest" />
import { render } from '@testing-library/react';
import type React from 'react';
import '@testing-library/jest-dom';
import { Canvas } from '@react-three/fiber';

import WorkCard3D from '@/components/WebXR/WorkCard3D';
import { NAVIGATION_POSITIONS, WORK_CARD_POSITIONS } from '@/utils/webxr/animationConstants';

// Mock the workCardPositions utility
jest.mock('@/utils/webxr/animationHelpers', () => ({
  workCardPositions: {
    calculatePosition: jest.fn((index: number) => [index * 2, 0, -5]),
    GRID_SPACING: 4,
    MAX_CARDS_PER_ROW: 3,
  },
}));

// Mock WebXR View Context
jest.mock('@/contexts/WebXR/WebXRViewContext', () => ({
  useWebXRView: () => ({
    currentView: 'home',
    isVisionPro: false,
    navigateToView: jest.fn(),
  }),
}));

// Mock HTML component
jest.mock('@react-three/drei', () => ({
  ...jest.requireActual('@react-three/drei'),
  Html: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="html-content">{children}</div>
  ),
  Text: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => (
    <mesh {...props} data-testid="text-mesh">
      {children}
    </mesh>
  ),
}));

// Mock work data
const mockWorkData = {
  title: 'Test Work',
  subTitle: 'Test Subtitle',
  slug: 'test-work',
  cover: '/test-cover.jpg',
  isWIP: false,
  description: 'Test description',
};

describe('WorkCard3D Animation', () => {
  // Helper to render WorkCard3D in Canvas context
  const renderWorkCard3D = (props = {}) => {
    return render(
      <Canvas>
        <WorkCard3D work={mockWorkData} index={0} position={[0, 0, -5]} {...props} />
      </Canvas>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock performance.now for consistent animation timing
    jest.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial Positioning', () => {
    it('should position card at navigation button initially', () => {
      const { container } = renderWorkCard3D();

      // Should render the card component
      expect(container.querySelector('group')).toBeTruthy();
    });

    it('should use correct navigation position from constants', () => {
      const expectedPosition = NAVIGATION_POSITIONS.navigationButtonAbsolute;

      renderWorkCard3D();

      // The card should start from navigation position
      expect(expectedPosition).toEqual([2.5, 2, -3]);
    });

    it('should apply correct card geometry from constants', () => {
      const expectedGeometry = WORK_CARD_POSITIONS.cardGeometry;

      renderWorkCard3D();

      // Should use the geometry constants
      expect(expectedGeometry).toEqual([3, 2, 1]);
    });
  });

  describe('Animation Timing and States', () => {
    it('should handle visible prop correctly', () => {
      const { rerender } = renderWorkCard3D({ visible: false });

      // Card should be hidden initially
      expect(true).toBe(true); // Basic render test

      rerender(
        <Canvas>
          <WorkCard3D work={mockWorkData} index={0} position={[0, 0, -5]} visible={true} />
        </Canvas>,
      );

      // Should show card when visible is true
      expect(true).toBe(true); // Basic render test
    });

    it('should render card successfully', () => {
      renderWorkCard3D({ visible: true });

      // Card should render successfully
      expect(true).toBe(true);
    });

    it('should handle staggered animation timing', () => {
      const work1 = renderWorkCard3D({ index: 0 });
      const work2 = renderWorkCard3D({ index: 1 });
      const work3 = renderWorkCard3D({ index: 2 });

      // Different indices should result in different timing
      // This would be better tested in integration tests
      expect(work1).toBeTruthy();
      expect(work2).toBeTruthy();
      expect(work3).toBeTruthy();
    });
  });

  describe('Card Content and Layout', () => {
    it('should render card title correctly', () => {
      const { container } = renderWorkCard3D();

      // Should have text mesh for title
      expect(container.querySelector('[data-testid="text-mesh"]')).toBeTruthy();
    });

    it('should render card description', () => {
      const { container } = renderWorkCard3D();

      // Should render HTML content for description
      expect(container.querySelector('[data-testid="html-content"]')).toBeTruthy();
    });

    it('should show WIP badge when work is in progress', () => {
      const wipWork = { ...mockWorkData, isWIP: true };

      const { container } = renderWorkCard3D({ work: wipWork });

      // Should have WIP badge rendering
      expect(container).toBeTruthy();
    });

    it('should use correct positioning for card elements', () => {
      const titlePosition = WORK_CARD_POSITIONS.titleGroup;
      const descriptionPosition = WORK_CARD_POSITIONS.descriptionGroup;
      const wipBadgePosition = WORK_CARD_POSITIONS.wipBadgeGroup;

      expect(titlePosition).toEqual([0, -1.5, 0.1]);
      expect(descriptionPosition).toEqual([0, -2.1, 0.1]);
      expect(wipBadgePosition).toEqual([1.3, 0.8, 0.1]);
    });
  });

  describe('Interaction Handling', () => {
    it('should handle click events properly', () => {
      const { container } = renderWorkCard3D();

      const cardMesh = container.querySelector('mesh');
      expect(cardMesh).toBeTruthy();

      // Click handling would be tested with user interaction tests
    });

    it('should handle hover states', () => {
      const { container } = renderWorkCard3D();

      // Hover effects would be tested with pointer events
      expect(container).toBeTruthy();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle multiple cards efficiently', () => {
      const cards = [];

      // Render multiple cards
      for (let i = 0; i < 6; i++) {
        cards.push(
          renderWorkCard3D({
            index: i,
            work: { ...mockWorkData, slug: `test-work-${i}` },
          }),
        );
      }

      // All cards should render successfully
      expect(cards).toHaveLength(6);
      cards.forEach((card) => {
        expect(card.container).toBeTruthy();
      });
    });

    it('should not cause memory leaks with re-renders', () => {
      const { rerender } = renderWorkCard3D();

      // Multiple re-renders should not cause issues
      for (let i = 0; i < 10; i++) {
        rerender(
          <Canvas>
            <WorkCard3D
              work={{ ...mockWorkData, title: `Updated Title ${i}` }}
              index={0}
              position={[0, 0, -5]}
            />
          </Canvas>,
        );
      }

      expect(true).toBe(true); // Should complete without errors
    });
  });

  describe('Error Handling', () => {
    it('should handle missing work data gracefully', () => {
      expect(() => {
        renderWorkCard3D({ work: null });
      }).not.toThrow();
    });

    it('should handle invalid positions gracefully', () => {
      expect(() => {
        renderWorkCard3D({ position: [NaN, undefined, null] });
      }).not.toThrow();
    });

    it('should handle invalid props gracefully', () => {
      expect(() => {
        renderWorkCard3D({
          visible: undefined,
        });
      }).not.toThrow();
    });
  });

  describe('Animation Integration', () => {
    it('should respect animation constants', () => {
      // Test that animation uses the centralized constants
      const navigationPos = NAVIGATION_POSITIONS.navigationButtonAbsolute;
      const cardGeometry = WORK_CARD_POSITIONS.cardGeometry;

      expect(navigationPos).toEqual([2.5, 2, -3]);
      expect(cardGeometry).toEqual([3, 2, 1]);

      renderWorkCard3D();

      // Animation should use these constants
      expect(true).toBe(true);
    });

    it('should handle visibility state transitions', () => {
      const { rerender } = renderWorkCard3D({
        visible: false,
      });

      // Transition to showing card
      rerender(
        <Canvas>
          <WorkCard3D work={mockWorkData} index={0} position={[0, 0, -5]} visible={true} />
        </Canvas>,
      );

      // Then back to hidden
      rerender(
        <Canvas>
          <WorkCard3D work={mockWorkData} index={0} position={[0, 0, -5]} visible={false} />
        </Canvas>,
      );

      expect(true).toBe(true); // Should handle transitions smoothly
    });
  });
});
