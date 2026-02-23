/**
 * Texture Atlas Utility Tests
 *
 * Tests for texture atlas creation, validation, and utility functions.
 */

import {
  type AtlasConfig,
  type AtlasTileInfo,
  calculateTileUV,
  createTextureAtlas,
  createUVAttribute,
  DEFAULT_ATLAS_CONFIG,
  disposeAtlas,
  getAtlasConfigForCount,
  getTileInfo,
  isPowerOfTwo,
  validateAtlasConfig,
} from '../textureAtlas';

describe('Texture Atlas Utility', () => {
  describe('Power of Two Validation', () => {
    it('should identify valid powers of two', () => {
      expect(isPowerOfTwo(1)).toBe(true);
      expect(isPowerOfTwo(2)).toBe(true);
      expect(isPowerOfTwo(4)).toBe(true);
      expect(isPowerOfTwo(8)).toBe(true);
      expect(isPowerOfTwo(16)).toBe(true);
      expect(isPowerOfTwo(32)).toBe(true);
      expect(isPowerOfTwo(64)).toBe(true);
      expect(isPowerOfTwo(128)).toBe(true);
      expect(isPowerOfTwo(256)).toBe(true);
      expect(isPowerOfTwo(512)).toBe(true);
      expect(isPowerOfTwo(1024)).toBe(true);
      expect(isPowerOfTwo(2048)).toBe(true);
      expect(isPowerOfTwo(4096)).toBe(true);
    });

    it('should reject non-powers of two', () => {
      expect(isPowerOfTwo(0)).toBe(false);
      expect(isPowerOfTwo(3)).toBe(false);
      expect(isPowerOfTwo(5)).toBe(false);
      expect(isPowerOfTwo(6)).toBe(false);
      expect(isPowerOfTwo(7)).toBe(false);
      expect(isPowerOfTwo(100)).toBe(false);
      expect(isPowerOfTwo(1000)).toBe(false);
      expect(isPowerOfTwo(2047)).toBe(false);
      expect(isPowerOfTwo(5000)).toBe(false);
    });

    it('should reject negative numbers', () => {
      expect(isPowerOfTwo(-1)).toBe(false);
      expect(isPowerOfTwo(-2)).toBe(false);
      expect(isPowerOfTwo(-4)).toBe(false);
    });
  });

  describe('Atlas Configuration Validation', () => {
    it('should validate default configuration', () => {
      expect(validateAtlasConfig(DEFAULT_ATLAS_CONFIG)).toBe(true);
    });

    it('should validate valid custom configurations', () => {
      const validConfigs: Partial<AtlasConfig>[] = [
        { width: 512, height: 512, columns: 2, rows: 2 },
        { width: 1024, height: 1024, columns: 3, rows: 3 },
        { width: 1024, height: 512, columns: 2, rows: 1, padding: 8 },
      ];

      validConfigs.forEach((config) => {
        const fullConfig = { ...DEFAULT_ATLAS_CONFIG, ...config };
        expect(validateAtlasConfig(fullConfig)).toBe(true);
      });
    });

    it('should reject invalid width', () => {
      const invalidConfigs = [
        { width: 0, height: 512, columns: 2, rows: 2 },
        { width: 100, height: 512, columns: 2, rows: 2 },
        { width: 512, height: 512, columns: 2, rows: 2, width: 100 },
      ];

      invalidConfigs.forEach((config) => {
        const fullConfig = { ...DEFAULT_ATLAS_CONFIG, ...config };
        expect(validateAtlasConfig(fullConfig)).toBe(false);
      });
    });

    it('should reject invalid height', () => {
      const invalidConfigs = [
        { width: 512, height: 0, columns: 2, rows: 2 },
        { width: 512, height: 100, columns: 2, rows: 2 },
      ];

      invalidConfigs.forEach((config) => {
        const fullConfig = { ...DEFAULT_ATLAS_CONFIG, ...config };
        expect(validateAtlasConfig(fullConfig)).toBe(false);
      });
    });

    it('should reject non-power-of-two dimensions', () => {
      const invalidConfigs = [
        { width: 512, height: 512, columns: 2, rows: 2, width: 1000 },
        { width: 512, height: 512, columns: 2, rows: 2, height: 1000 },
        { width: 512, height: 512, columns: 2, rows: 2, width: 1024, height: 1025 },
      ];

      invalidConfigs.forEach((config) => {
        const fullConfig = { ...DEFAULT_ATLAS_CONFIG, ...config };
        expect(validateAtlasConfig(fullConfig)).toBe(false);
      });
    });

    it('should reject invalid grid dimensions', () => {
      const invalidConfigs = [
        { width: 512, height: 512, columns: 0, rows: 2 },
        { width: 512, height: 512, columns: 2, rows: 0 },
        { width: 512, height: 512, columns: -1, rows: 2 },
        { width: 512, height: 512, columns: 2, rows: -1 },
      ];

      invalidConfigs.forEach((config) => {
        const fullConfig = { ...DEFAULT_ATLAS_CONFIG, ...config };
        expect(validateAtlasConfig(fullConfig)).toBe(false);
      });
    });

    it('should reject negative padding', () => {
      const invalidConfigs = [
        { width: 512, height: 512, columns: 2, rows: 2, padding: -1 },
        { width: 512, height: 512, columns: 2, rows: 2, padding: -10 },
      ];

      invalidConfigs.forEach((config) => {
        const fullConfig = { ...DEFAULT_ATLAS_CONFIG, ...config };
        expect(validateAtlasConfig(fullConfig)).toBe(false);
      });
    });

    it('should accept zero padding', () => {
      const config = { ...DEFAULT_ATLAS_CONFIG, padding: 0 };
      expect(validateAtlasConfig(config)).toBe(true);
    });

    it('should reject null or undefined configuration', () => {
      expect(validateAtlasConfig(null as unknown as AtlasConfig)).toBe(false);
      expect(validateAtlasConfig(undefined as unknown as AtlasConfig)).toBe(false);
    });

    it('should reject non-object configuration', () => {
      expect(validateAtlasConfig('' as unknown as AtlasConfig)).toBe(false);
      expect(validateAtlasConfig(123 as unknown as AtlasConfig)).toBe(false);
      expect(validateAtlasConfig([] as unknown as AtlasConfig)).toBe(false);
    });
  });

  describe('Tile UV Calculation', () => {
    const config = { ...DEFAULT_ATLAS_CONFIG };

    it('should calculate UV for first tile (top-left)', () => {
      const result = calculateTileUV(0, 0, config);

      expect(result.uvOffset[0]).toBeGreaterThanOrEqual(0);
      expect(result.uvOffset[0]).toBeLessThan(1);
      expect(result.uvOffset[1]).toBeLessThanOrEqual(1);
      expect(result.uvOffset[1]).toBeGreaterThan(0);
      expect(result.uvScale[0]).toBeGreaterThan(0);
      expect(result.uvScale[1]).toBeGreaterThan(0);
    });

    it('should calculate UV for different tiles', () => {
      const uv1 = calculateTileUV(0, 0, config);
      const uv2 = calculateTileUV(1, 0, config);
      const uv3 = calculateTileUV(0, 1, config);

      expect(uv1.uvOffset[0]).not.toEqual(uv2.uvOffset[0]);
      expect(uv1.uvOffset[1]).not.toEqual(uv3.uvOffset[1]);
    });

    it('should maintain UV scale consistency across tiles', () => {
      const uv1 = calculateTileUV(0, 0, config);
      const uv2 = calculateTileUV(1, 0, config);
      const uv3 = calculateTileUV(0, 1, config);

      expect(uv1.uvScale[0]).toBeCloseTo(uv2.uvScale[0]);
      expect(uv1.uvScale[1]).toBeCloseTo(uv2.uvScale[1]);
      expect(uv1.uvScale[0]).toBeCloseTo(uv3.uvScale[0]);
      expect(uv1.uvScale[1]).toBeCloseTo(uv3.uvScale[1]);
    });

    it('should account for padding in UV calculations', () => {
      const configWithPadding = { ...config, padding: 10 };
      const configWithoutPadding = { ...config, padding: 0 };

      const uvWithPadding = calculateTileUV(0, 0, configWithPadding);
      const uvWithoutPadding = calculateTileUV(0, 0, configWithoutPadding);

      expect(uvWithPadding.uvOffset[0]).toBeGreaterThan(uvWithoutPadding.uvOffset[0]);
    });
  });

  describe('Tile Information', () => {
    const config = { ...DEFAULT_ATLAS_CONFIG };

    it('should return tile info for valid indices', () => {
      const tileInfo = getTileInfo(0, config);

      expect(tileInfo).not.toBeNull();
      expect(tileInfo?.index).toBe(0);
      expect(tileInfo?.column).toBe(0);
      expect(tileInfo?.row).toBe(0);
      expect(tileInfo?.uvOffset).toHaveLength(2);
      expect(tileInfo?.uvScale).toHaveLength(2);
    });

    it('should return null for negative indices', () => {
      expect(getTileInfo(-1, config)).toBeNull();
      expect(getTileInfo(-10, config)).toBeNull();
    });

    it('should return null for indices beyond grid capacity', () => {
      const maxIndex = config.columns * config.rows;
      expect(getTileInfo(maxIndex, config)).toBeNull();
      expect(getTileInfo(maxIndex + 1, config)).toBeNull();
    });

    it('should calculate correct column and row for each index', () => {
      for (let index = 0; index < config.columns * config.rows; index++) {
        const tileInfo = getTileInfo(index, config);

        expect(tileInfo?.column).toBe(index % config.columns);
        expect(tileInfo?.row).toBe(Math.floor(index / config.columns));
      }
    });

    it('should return unique UV offsets for each tile', () => {
      const uvOffsets = new Set<string>();

      for (let index = 0; index < config.columns * config.rows; index++) {
        const tileInfo = getTileInfo(index, config);
        if (tileInfo) {
          const key = `${tileInfo.uvOffset[0]},${tileInfo.uvOffset[1]}`;
          uvOffsets.add(key);
        }
      }

      expect(uvOffsets.size).toBe(config.columns * config.rows);
    });
  });

  describe('UV Attribute Creation', () => {
    it('should create correct UV attribute array', () => {
      const tiles: AtlasTileInfo[] = [
        { index: 0, uvOffset: [0.0, 0.5], uvScale: [0.5, 0.5], column: 0, row: 0 },
        { index: 1, uvOffset: [0.5, 0.5], uvScale: [0.5, 0.5], column: 1, row: 0 },
        { index: 2, uvOffset: [0.0, 0.0], uvScale: [0.5, 0.5], column: 0, row: 1 },
      ];

      const attribute = createUVAttribute(tiles);

      expect(attribute).toBeInstanceOf(Float32Array);
      expect(attribute.length).toBe(tiles.length * 2);
      expect(attribute[0]).toBe(0.0);
      expect(attribute[1]).toBe(0.5);
      expect(attribute[2]).toBe(0.5);
      expect(attribute[3]).toBe(0.5);
      expect(attribute[4]).toBe(0.0);
      expect(attribute[5]).toBe(0.0);
    });

    it('should handle empty tile array', () => {
      const attribute = createUVAttribute([]);

      expect(attribute).toBeInstanceOf(Float32Array);
      expect(attribute.length).toBe(0);
    });

    it('should handle single tile', () => {
      const tiles: AtlasTileInfo[] = [
        { index: 0, uvOffset: [0.1, 0.2], uvScale: [0.5, 0.5], column: 0, row: 0 },
      ];

      const attribute = createUVAttribute(tiles);

      expect(attribute.length).toBe(2);
      expect(attribute[0]).toBeCloseTo(0.1);
      expect(attribute[1]).toBeCloseTo(0.2);
    });
  });

  describe('Atlas Configuration for Count', () => {
    it('should return default config for valid item counts', () => {
      const config = getAtlasConfigForCount(5);

      expect(config.columns).toBeGreaterThan(0);
      expect(config.rows).toBeGreaterThan(0);
      expect(config.columns * config.rows).toBeGreaterThanOrEqual(5);
      expect(validateAtlasConfig(config)).toBe(true);
    });

    it('should calculate sufficient grid for item count', () => {
      for (let count = 1; count <= 10; count++) {
        const config = getAtlasConfigForCount(count);
        const capacity = config.columns * config.rows;

        expect(capacity).toBeGreaterThanOrEqual(count);
      }
    });

    it('should use preferred width when possible', () => {
      const config = getAtlasConfigForCount(4, 1024);

      expect(config.width).toBe(1024);
      expect(config.height).toBe(1024);
    });

    it('should handle single item', () => {
      const config = getAtlasConfigForCount(1);

      expect(config.columns).toBeGreaterThanOrEqual(1);
      expect(config.rows).toBeGreaterThanOrEqual(1);
      expect(config.columns * config.rows).toBeGreaterThanOrEqual(1);
    });

    it('should handle large item counts', () => {
      const config = getAtlasConfigForCount(25);

      expect(config.columns).toBeGreaterThan(0);
      expect(config.rows).toBeGreaterThan(0);
      expect(config.columns * config.rows).toBeGreaterThanOrEqual(25);
    });
  });

  describe('Texture Atlas Creation', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('should throw error for empty image array', async () => {
      await expect(createTextureAtlas([])).rejects.toThrow('No images provided');
    });

    it('should throw error for too many images', async () => {
      const images = Array(10).fill('/test/image.jpg');

      await expect(
        createTextureAtlas(images, {
          width: 512,
          height: 512,
          columns: 2,
          rows: 2,
        }),
      ).rejects.toThrow('Too many images');
    });

    it('should throw error for invalid configuration', async () => {
      await expect(
        createTextureAtlas(['/test/image.jpg'], {
          width: 100,
          height: 512,
          columns: 2,
          rows: 2,
        }),
      ).rejects.toThrow('Invalid atlas configuration');
    });

    it('should handle failed image loads', async () => {
      jest.useFakeTimers();
      jest.spyOn(document, 'createElement').mockReturnValue({
        width: 2048,
        height: 2048,
        getContext: () => ({
          fillRect: jest.fn(),
          drawImage: jest.fn(),
          fillText: jest.fn(),
          font: '24px sans-serif',
          textAlign: 'center',
          textBaseline: 'middle',
        }),
      } as unknown as HTMLCanvasElement);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const ImageMock = function ImageMock(this: HTMLImageElement) {
        this.onload = null;
        this.onerror = null;
        this.src = '';
        this.crossOrigin = '';

        setTimeout(() => {
          if (this.onerror) {
            this.onerror(new Event('error'));
          }
        }, 0);
      } as unknown as { new (): HTMLImageElement };

      jest.spyOn(window, 'Image').mockImplementation(ImageMock);

      const promise = createTextureAtlas(['/test/fail.jpg'], {
        width: 512,
        height: 512,
        columns: 1,
        rows: 1,
      });

      jest.runAllTimers();

      const result = await promise;

      expect(result).toBeDefined();
      expect(result.tiles).toHaveLength(1);

      consoleSpy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe('Atlas Disposal', () => {
    it('should dispose texture atlas', () => {
      const mockTexture = {
        dispose: jest.fn(),
        image: {
          width: 2048,
          height: 2048,
        },
      } as unknown as THREE.CanvasTexture;

      const atlas = {
        texture: mockTexture,
        tiles: [
          {
            index: 0,
            uvOffset: [0, 0],
            uvScale: [0.5, 0.5],
            column: 0,
            row: 0,
          },
        ],
        tileSize: [1024, 768],
        tileCount: 1,
      };

      disposeAtlas(atlas);

      expect(mockTexture.dispose).toHaveBeenCalled();
    });

    it('should handle null texture', () => {
      const atlas = {
        texture: null as unknown as THREE.CanvasTexture,
        tiles: [],
        tileSize: [0, 0],
        tileCount: 0,
      };

      expect(() => disposeAtlas(atlas)).not.toThrow();
    });

    it('should reset canvas dimensions', () => {
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 2048;
      mockCanvas.height = 2048;

      const mockTexture = {
        dispose: jest.fn(),
        image: mockCanvas,
      } as unknown as THREE.CanvasTexture;

      const atlas = {
        texture: mockTexture,
        tiles: [],
        tileSize: [0, 0] as [number, number],
        tileCount: 0,
      };

      disposeAtlas(atlas);

      expect(mockTexture.dispose).toHaveBeenCalled();
    });
  });

  describe('Default Configuration', () => {
    it('should have valid default configuration', () => {
      expect(DEFAULT_ATLAS_CONFIG.width).toBe(2048);
      expect(DEFAULT_ATLAS_CONFIG.height).toBe(2048);
      expect(DEFAULT_ATLAS_CONFIG.columns).toBe(2);
      expect(DEFAULT_ATLAS_CONFIG.rows).toBe(3);
      expect(DEFAULT_ATLAS_CONFIG.padding).toBe(4);
      expect(DEFAULT_ATLAS_CONFIG.backgroundColor).toBe('#1a1a1a');
    });

    it('should pass validation', () => {
      expect(validateAtlasConfig(DEFAULT_ATLAS_CONFIG)).toBe(true);
    });

    it('should fit 6 tiles', () => {
      expect(DEFAULT_ATLAS_CONFIG.columns * DEFAULT_ATLAS_CONFIG.rows).toBe(6);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle maximum atlas size', () => {
      const config: AtlasConfig = {
        width: 4096,
        height: 4096,
        columns: 4,
        rows: 4,
        padding: 8,
        backgroundColor: '#000000',
      };

      expect(validateAtlasConfig(config)).toBe(true);
    });

    it('should handle minimum atlas size', () => {
      const config: AtlasConfig = {
        width: 256,
        height: 256,
        columns: 1,
        rows: 1,
        padding: 0,
      };

      expect(validateAtlasConfig(config)).toBe(true);
    });

    it('should handle atlas larger than MAX_ATLAS_SIZE', () => {
      const config: AtlasConfig = {
        width: 8192,
        height: 8192,
        columns: 8,
        rows: 8,
        padding: 0,
      };

      expect(validateAtlasConfig(config)).toBe(false);
    });

    it('should handle atlas smaller than MIN_ATLAS_SIZE', () => {
      const config: AtlasConfig = {
        width: 128,
        height: 128,
        columns: 1,
        rows: 1,
        padding: 0,
      };

      expect(validateAtlasConfig(config)).toBe(false);
    });

    it('should maintain UV coordinates within [0, 1] range', () => {
      const config = getAtlasConfigForCount(6);

      for (let index = 0; index < 6; index++) {
        const tileInfo = getTileInfo(index, config);

        expect(tileInfo?.uvOffset[0]).toBeGreaterThanOrEqual(0);
        expect(tileInfo?.uvOffset[0]).toBeLessThanOrEqual(1);
        expect(tileInfo?.uvOffset[1]).toBeGreaterThanOrEqual(0);
        expect(tileInfo?.uvOffset[1]).toBeLessThanOrEqual(1);
        expect(tileInfo?.uvScale[0]).toBeGreaterThan(0);
        expect(tileInfo?.uvScale[1]).toBeGreaterThan(0);
      }
    });

    it('should calculate tile size correctly', () => {
      const config = { ...DEFAULT_ATLAS_CONFIG };
      const padding = config.padding ?? 0;
      const expectedTileWidth = (config.width - padding * (config.columns + 1)) / config.columns;
      const expectedTileHeight = (config.height - padding * (config.rows + 1)) / config.rows;

      const tileInfo = getTileInfo(0, config);
      const uvScale = tileInfo?.uvScale;
      const actualTileWidth = uvScale?.[0] * config.width;
      const actualTileHeight = uvScale?.[1] * config.height;

      expect(actualTileWidth).toBeCloseTo(expectedTileWidth, 2);
      expect(actualTileHeight).toBeCloseTo(expectedTileHeight, 2);
    });
  });
});
