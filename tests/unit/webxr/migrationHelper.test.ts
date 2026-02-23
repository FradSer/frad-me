/**
 * Migration Helper Utility Tests
 *
 * Tests for migrating WorkCard3D data to instanced attributes.
 * Following BDD TDD Red-Green-Refactor approach.
 */

import { ENTRANCE_POSITIONS } from '@/utils/webxr/animationConstants';
import {
  createInstanceDataForWorks,
  type InstanceData,
  setupWorkCardInstanceData,
  type WorkLink,
} from '@/utils/webxr/migrationHelper';
import { type AtlasConfig, getTileInfo } from '@/utils/webxr/textureAtlas';
import { calculateCardPosition } from '@/utils/webxr/workGridUtils';

// Mock dependencies
jest.mock('@/utils/webxr/workGridUtils');
jest.mock('@/utils/webxr/textureAtlas');
jest.mock('@/utils/webxr/animationConstants');

describe('Migration Helper Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up ENTRANCE_POSITIONS mock
    (ENTRANCE_POSITIONS as unknown as { workDefault: [number, number, number] }).workDefault = [
      0, 0, -8,
    ] as [number, number, number];
  });

  describe('createInstanceDataForWorks', () => {
    const mockWorks: WorkLink[] = [
      {
        title: 'Test Work 1',
        subTitle: 'Test Subtitle',
        slug: 'test-1',
        cover: '/works/test-1/cover.png',
      },
      {
        title: 'Test Work 2',
        subTitle: 'Test Subtitle',
        slug: 'test-2',
        cover: '/works/test-2/cover.png',
        isFullScreen: true,
      },
    ];

    it('should create instance data for an array of works', () => {
      (calculateCardPosition as jest.Mock)
        .mockReturnValueOnce([0, 0.5, -8])
        .mockReturnValueOnce([-6, 0.5, -8]);

      (getTileInfo as jest.Mock)
        .mockReturnValueOnce({
          index: 0,
          uvOffset: [0.0, 0.5],
          uvScale: [0.5, 0.5],
          column: 0,
          row: 0,
        })
        .mockReturnValueOnce({
          index: 1,
          uvOffset: [0.5, 0.5],
          uvScale: [0.5, 0.5],
          column: 1,
          row: 0,
        });

      const result = createInstanceDataForWorks(mockWorks);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        index: 0,
        uvOffset: [0.0, 0.5],
        scale: 1,
      });
      expect(result[1]).toMatchObject({
        index: 1,
        uvOffset: [0.5, 0.5],
        scale: 1,
      });
    });

    it('should calculate animation offset for each instance', () => {
      (calculateCardPosition as jest.Mock)
        .mockReturnValue([0, 0.5, -8])
        .mockReturnValue([-6, 0.5, -8]);

      (getTileInfo as jest.Mock).mockReturnValue({
        index: 0,
        uvOffset: [0.0, 0.5],
        uvScale: [0.5, 0.5],
        column: 0,
        row: 0,
      });

      const result = createInstanceDataForWorks(mockWorks);

      expect(result[0].animationOffset).toBe(0);
      expect(result[1].animationOffset).toBeGreaterThan(0);
    });

    it('should calculate correct base and hover Y positions', () => {
      const basePosition: [number, number, number] = [0, 0.5, -8];
      const ENTRANCE_Y_OFFSET = 2;

      (calculateCardPosition as jest.Mock).mockReturnValue(basePosition);
      (getTileInfo as jest.Mock).mockReturnValue({
        index: 0,
        uvOffset: [0.0, 0.5],
        uvScale: [0.5, 0.5],
        column: 0,
        row: 0,
      });

      const result = createInstanceDataForWorks(mockWorks);

      // Base Y should be offset from entrance
      const expectedBaseY = basePosition[1] - ENTRANCE_POSITIONS.workDefault[1] + ENTRANCE_Y_OFFSET;
      expect(result[0].baseY).toBe(expectedBaseY);

      // Hover Y should be at final position
      const expectedHoverY = basePosition[1] - ENTRANCE_POSITIONS.workDefault[1];
      expect(result[0].hoverY).toBe(expectedHoverY);
    });

    it('should handle isFullScreen work flag', () => {
      const works: WorkLink[] = [
        {
          title: 'Full Screen Work',
          subTitle: 'Test',
          slug: 'fullscreen',
          cover: '/works/fullscreen/cover.png',
          isFullScreen: true,
        },
      ];

      (calculateCardPosition as jest.Mock).mockReturnValue([0, 0.5, -8]);
      (getTileInfo as jest.Mock).mockReturnValue({
        index: 0,
        uvOffset: [0.0, 0.5],
        uvScale: [0.5, 0.5],
        column: 0,
        row: 0,
      });

      createInstanceDataForWorks(works);

      expect(calculateCardPosition).toHaveBeenCalledWith(
        1, // index + 1 for work index
        true,
        1,
      );
    });

    it('should handle isWIP work flag by adjusting scale', () => {
      const works: WorkLink[] = [
        {
          title: 'WIP Work',
          subTitle: 'Test',
          slug: 'wip',
          cover: '/works/wip/cover.png',
          isWIP: true,
        },
      ];

      (calculateCardPosition as jest.Mock).mockReturnValue([0, 0.5, -8]);
      (getTileInfo as jest.Mock).mockReturnValue({
        index: 0,
        uvOffset: [0.0, 0.5],
        uvScale: [0.5, 0.5],
        column: 0,
        row: 0,
      });

      const result = createInstanceDataForWorks(works);

      expect(result[0].scale).toBe(0.85);
    });

    it('should handle empty works array', () => {
      const result = createInstanceDataForWorks([]);

      expect(result).toHaveLength(0);
    });

    it('should pass correct totalCards to calculateCardPosition', () => {
      const works: WorkLink[] = [
        { title: 'Work 1', subTitle: 'Test', slug: 'w1', cover: '/cover1.png' },
        { title: 'Work 2', subTitle: 'Test', slug: 'w2', cover: '/cover2.png' },
        { title: 'Work 3', subTitle: 'Test', slug: 'w3', cover: '/cover3.png' },
      ];

      (calculateCardPosition as jest.Mock).mockReturnValue([0, 0.5, -8]);
      (getTileInfo as jest.Mock).mockReturnValue({
        index: 0,
        uvOffset: [0.0, 0.5],
        uvScale: [0.5, 0.5],
        column: 0,
        row: 0,
      });

      createInstanceDataForWorks(works);

      expect(calculateCardPosition).toHaveBeenCalledTimes(3);
      expect(calculateCardPosition).toHaveBeenNthCalledWith(1, 1, false, 3);
      expect(calculateCardPosition).toHaveBeenNthCalledWith(2, 2, false, 3);
      expect(calculateCardPosition).toHaveBeenNthCalledWith(3, 3, false, 3);
    });
  });

  describe('setupWorkCardInstanceData', () => {
    const ENTRANCE_Y_OFFSET = 2;

    const mockWork: WorkLink = {
      title: 'Test Work',
      subTitle: 'Test Subtitle',
      slug: 'test-work',
      cover: '/works/test/cover.png',
    };

    it('should create instance data for a single work card', () => {
      const index = 0;
      const totalCards = 5;
      const cardPosition: [number, number, number] = [0, 0.5, -8];

      (getTileInfo as jest.Mock).mockReturnValue({
        index: 0,
        uvOffset: [0.1, 0.2],
        uvScale: [0.5, 0.5],
        column: 0,
        row: 0,
      });

      const result = setupWorkCardInstanceData(mockWork, index, totalCards, cardPosition);

      expect(result).toMatchObject({
        index: 0,
        uvOffset: [0.1, 0.2],
        scale: 1,
      });
    });

    it('should calculate position relative to entrance position', () => {
      const cardPosition: [number, number, number] = [2, 1.5, -8];
      const index = 1;
      const totalCards = 5;

      (getTileInfo as jest.Mock).mockReturnValue({
        index: 1,
        uvOffset: [0.3, 0.4],
        uvScale: [0.5, 0.5],
        column: 1,
        row: 0,
      });

      const result = setupWorkCardInstanceData(mockWork, index, totalCards, cardPosition);

      const expectedPosition: [number, number, number] = [
        cardPosition[0] - ENTRANCE_POSITIONS.workDefault[0],
        cardPosition[1] - ENTRANCE_POSITIONS.workDefault[1] + ENTRANCE_Y_OFFSET,
        cardPosition[2] - ENTRANCE_POSITIONS.workDefault[2],
      ];

      expect(result.position).toEqual(expectedPosition);
    });

    it('should set correct animation offset based on index', () => {
      const index = 2;
      const totalCards = 5;
      const cardPosition: [number, number, number] = [0, 0.5, -8];

      (getTileInfo as jest.Mock).mockReturnValue({
        index: 2,
        uvOffset: [0.0, 0.5],
        uvScale: [0.5, 0.5],
        column: 0,
        row: 0,
      });

      const result = setupWorkCardInstanceData(mockWork, index, totalCards, cardPosition);

      // Animation offset should be staggered
      const expectedOffset = (index / totalCards) * Math.PI * 2 * 0.5;
      expect(result.animationOffset).toBeCloseTo(expectedOffset, 5);
    });

    it('should set scale to 0.85 for WIP works', () => {
      const wipWork: WorkLink = {
        title: 'WIP Work',
        subTitle: 'Test',
        slug: 'wip',
        cover: '/works/wip/cover.png',
        isWIP: true,
      };

      const cardPosition: [number, number, number] = [0, 0.5, -8];

      (getTileInfo as jest.Mock).mockReturnValue({
        index: 0,
        uvOffset: [0.0, 0.5],
        uvScale: [0.5, 0.5],
        column: 0,
        row: 0,
      });

      const result = setupWorkCardInstanceData(wipWork, 0, 5, cardPosition);

      expect(result.scale).toBe(0.85);
    });

    it('should set scale to 1 for non-WIP works', () => {
      const cardPosition: [number, number, number] = [0, 0.5, -8];

      (getTileInfo as jest.Mock).mockReturnValue({
        index: 0,
        uvOffset: [0.0, 0.5],
        uvScale: [0.5, 0.5],
        column: 0,
        row: 0,
      });

      const result = setupWorkCardInstanceData(mockWork, 0, 5, cardPosition);

      expect(result.scale).toBe(1);
    });

    it('should accept custom base position', () => {
      const cardPosition: [number, number, number] = [5, 5, -10];
      const customBase: [number, number, number] = [1, 1, -2];
      const index = 0;
      const totalCards = 3;

      (getTileInfo as jest.Mock).mockReturnValue({
        index: 0,
        uvOffset: [0.0, 0.5],
        uvScale: [0.5, 0.5],
        column: 0,
        row: 0,
      });

      const result = setupWorkCardInstanceData(
        mockWork,
        index,
        totalCards,
        cardPosition,
        customBase,
      );

      const expectedPosition: [number, number, number] = [
        cardPosition[0] - customBase[0],
        cardPosition[1] - customBase[1] + ENTRANCE_Y_OFFSET,
        cardPosition[2] - customBase[2],
      ];

      expect(result.position).toEqual(expectedPosition);
    });

    it('should call getTileInfo with correct index', () => {
      const index = 2;
      const totalCards = 5;
      const cardPosition: [number, number, number] = [0, 0.5, -8];

      (getTileInfo as jest.Mock).mockReturnValue({
        index: 2,
        uvOffset: [0.6, 0.7],
        uvScale: [0.5, 0.5],
        column: 1,
        row: 1,
      });

      setupWorkCardInstanceData(mockWork, index, totalCards, cardPosition);

      expect(getTileInfo).toHaveBeenCalledWith(index, expect.any(Object));
    });
  });

  describe('Integration', () => {
    it('should create consistent instance data for all works', () => {
      const works: WorkLink[] = [
        { title: 'Work 1', subTitle: 'Sub1', slug: 'w1', cover: '/c1.png' },
        { title: 'Work 2', subTitle: 'Sub2', slug: 'w2', cover: '/c2.png', isCenter: true },
        { title: 'Work 3', subTitle: 'Sub3', slug: 'w3', cover: '/c3.png', isFullScreen: true },
        {
          title: 'Work 4',
          subTitle: 'Sub4',
          slug: 'w4',
          cover: '/c4.png',
          isWIP: true,
        },
      ];

      (calculateCardPosition as jest.Mock)
        .mockReturnValueOnce([0, 4, -6])
        .mockReturnValueOnce([-6, 0.5, -8])
        .mockReturnValueOnce([0, 0.5, -8])
        .mockReturnValueOnce([6, 0.5, -8]);

      (getTileInfo as jest.Mock)
        .mockReturnValueOnce({
          index: 0,
          uvOffset: [0.0, 0.5],
          uvScale: [0.5, 0.5],
          column: 0,
          row: 0,
        })
        .mockReturnValueOnce({
          index: 1,
          uvOffset: [0.5, 0.5],
          uvScale: [0.5, 0.5],
          column: 1,
          row: 0,
        })
        .mockReturnValueOnce({
          index: 2,
          uvOffset: [0.0, 0.0],
          uvScale: [0.5, 0.5],
          column: 0,
          row: 1,
        })
        .mockReturnValueOnce({
          index: 3,
          uvOffset: [0.5, 0.0],
          uvScale: [0.5, 0.5],
          column: 1,
          row: 1,
        });

      const result = createInstanceDataForWorks(works);

      expect(result).toHaveLength(4);

      // Check animation offsets are staggered
      const offsets = result.map((r) => r.animationOffset);
      expect(offsets[0]).toBe(0);
      expect(offsets[1]).toBeGreaterThan(offsets[0]);
      expect(offsets[2]).toBeGreaterThan(offsets[1]);
      expect(offsets[3]).toBeGreaterThan(offsets[2]);

      // Check WIP work has different scale
      expect(result[0].scale).toBe(1);
      expect(result[1].scale).toBe(1);
      expect(result[2].scale).toBe(1);
      expect(result[3].scale).toBe(0.85);

      // Check UV offsets are unique
      const uvOffsets = result.map((r) => r.uvOffset.join(','));
      expect(new Set(uvOffsets).size).toBe(4);
    });

    it('should maintain correct indexing across multiple calls', () => {
      const works: WorkLink[] = [
        { title: 'Work 1', subTitle: 'S1', slug: 'w1', cover: '/c1.png' },
        { title: 'Work 2', subTitle: 'S2', slug: 'w2', cover: '/c2.png' },
      ];

      (calculateCardPosition as jest.Mock).mockReturnValue([0, 0.5, -8]);
      (getTileInfo as jest.Mock).mockReturnValue({
        index: 0,
        uvOffset: [0.0, 0.5],
        uvScale: [0.5, 0.5],
        column: 0,
        row: 0,
      });

      const firstCall = createInstanceDataForWorks([works[0]]);
      const secondCall = createInstanceDataForWorks([works[1]]);

      expect(firstCall[0].index).toBe(0);
      expect(secondCall[0].index).toBe(0);
    });
  });
});
