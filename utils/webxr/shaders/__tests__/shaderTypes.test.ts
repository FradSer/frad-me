/**
 * Unit tests for shader type definitions
 */

import { describe, expect, it } from '@jest/globals';
import {
  DEFAULT_UNIFORMS,
  HOVER_GLOW_COLOR,
  type InstanceAnimationUniforms,
  type InstanceData,
  OPACITY_THRESHOLDS,
  SHADER_DEFINES,
  type TextureAtlasConfig,
  type UVCoordinate,
  VIEW_MODE_VALUES,
  type ViewMode,
} from '../shaderTypes';

describe('shaderTypes', () => {
  describe('VIEW_MODE_VALUES', () => {
    it('should have correct home value', () => {
      expect(VIEW_MODE_VALUES.home).toBe(0);
    });

    it('should have correct work value', () => {
      expect(VIEW_MODE_VALUES.work).toBe(1);
    });
  });

  describe('DEFAULT_UNIFORMS', () => {
    it('should have uTime uniform', () => {
      expect(DEFAULT_UNIFORMS.uTime).toBeDefined();
      expect(DEFAULT_UNIFORMS.uTime?.value).toBe(0);
    });

    it('should have uViewMode uniform set to home', () => {
      expect(DEFAULT_UNIFORMS.uViewMode).toBeDefined();
      expect(DEFAULT_UNIFORMS.uViewMode?.value).toBe(VIEW_MODE_VALUES.home);
    });

    it('should have uHoverIndex uniform set to -1', () => {
      expect(DEFAULT_UNIFORMS.uHoverIndex).toBeDefined();
      expect(DEFAULT_UNIFORMS.uHoverIndex?.value).toBe(-1);
    });

    it('should have uOpacity uniform', () => {
      expect(DEFAULT_UNIFORMS.uOpacity).toBeDefined();
      expect(DEFAULT_UNIFORMS.uOpacity?.value).toBe(0.9);
    });

    it('should have uHoverScale uniform', () => {
      expect(DEFAULT_UNIFORMS.uHoverScale).toBeDefined();
      expect(DEFAULT_UNIFORMS.uHoverScale?.value).toBe(1.1);
    });

    it('should have uGlowColor uniform', () => {
      expect(DEFAULT_UNIFORMS.uGlowColor).toBeDefined();
      expect(DEFAULT_UNIFORMS.uGlowColor?.value).toBeInstanceOf(Object);
    });
  });

  describe('HOVER_GLOW_COLOR', () => {
    it('should be a valid color', () => {
      expect(HOVER_GLOW_COLOR).toBeDefined();
    });
  });

  describe('OPACITY_THRESHOLDS', () => {
    it('should have visible threshold', () => {
      expect(OPACITY_THRESHOLDS.visible).toBe(1.0);
    });

    it('should have hidden threshold', () => {
      expect(OPACITY_THRESHOLDS.hidden).toBe(0.0);
    });

    it('should have minimum threshold', () => {
      expect(OPACITY_THRESHOLDS.minimum).toBe(0.01);
    });
  });

  describe('SHADER_DEFINES', () => {
    it('should have FLOATING_SPEED constant', () => {
      expect(SHADER_DEFINES.FLOATING_SPEED).toBe(2.0);
    });

    it('should have FLOATING_AMPLITUDE constant', () => {
      expect(SHADER_DEFINES.FLOATING_AMPLITUDE).toBe(0.05);
    });

    it('should have HOVER_FORWARD_OFFSET constant', () => {
      expect(SHADER_DEFINES.HOVER_FORWARD_OFFSET).toBe(0.5);
    });

    it('should have HOVER_UP_OFFSET constant', () => {
      expect(SHADER_DEFINES.HOVER_UP_OFFSET).toBe(0.3);
    });

    it('should have HOVER_SCALE constant', () => {
      expect(SHADER_DEFINES.HOVER_SCALE).toBe(1.1);
    });

    it('should have INSTANCED define', () => {
      expect(SHADER_DEFINES.INSTANCED).toBe(1);
    });

    it('should have MAX_INSTANCES define', () => {
      expect(SHADER_DEFINES.MAX_INSTANCES).toBe(50);
    });
  });

  describe('InstanceData type', () => {
    it('should accept valid instance data', () => {
      const instanceData: InstanceData = {
        index: 0,
        animationOffset: 0,
        uvOffset: [0, 0],
        baseY: 0,
        hoverY: 1,
        basePosition: [0, 0, 0],
        hoverPosition: [0, 1, 0],
      };

      expect(instanceData.index).toBe(0);
      expect(instanceData.animationOffset).toBe(0);
      expect(instanceData.uvOffset).toEqual([0, 0]);
      expect(instanceData.baseY).toBe(0);
      expect(instanceData.hoverY).toBe(1);
      expect(instanceData.basePosition).toEqual([0, 0, 0]);
      expect(instanceData.hoverPosition).toEqual([0, 1, 0]);
    });
  });

  describe('TextureAtlasConfig type', () => {
    it('should accept valid texture atlas config', () => {
      const config: TextureAtlasConfig = {
        width: 2048,
        height: 2048,
        tileSize: [1024, 768],
        padding: 4,
        grid: [2, 2],
      };

      expect(config.width).toBe(2048);
      expect(config.height).toBe(2048);
      expect(config.tileSize).toEqual([1024, 768]);
      expect(config.padding).toBe(4);
      expect(config.grid).toEqual([2, 2]);
    });
  });

  describe('UVCoordinate type', () => {
    it('should accept valid UV coordinate', () => {
      const uv: UVCoordinate = {
        x: 0,
        y: 0,
        width: 0.5,
        height: 0.5,
      };

      expect(uv.x).toBe(0);
      expect(uv.y).toBe(0);
      expect(uv.width).toBe(0.5);
      expect(uv.height).toBe(0.5);
    });
  });

  describe('ViewMode type', () => {
    it('should accept home view mode', () => {
      const viewMode: ViewMode = 'home';
      expect(viewMode).toBe('home');
    });

    it('should accept work view mode', () => {
      const viewMode: ViewMode = 'work';
      expect(viewMode).toBe('work');
    });
  });

  describe('InstanceAnimationUniforms type', () => {
    it('should accept valid uniforms', () => {
      const uniforms: Partial<InstanceAnimationUniforms> = {
        uTime: { value: 0 },
        uViewMode: { value: 1 },
        uHoverIndex: { value: 0 },
        uTextureAtlas: { value: null },
        uOpacity: { value: 0.9 },
        uHoverScale: { value: 1.1 },
        uGlowColor: { value: HOVER_GLOW_COLOR },
      };

      expect(uniforms.uTime?.value).toBe(0);
      expect(uniforms.uViewMode?.value).toBe(1);
      expect(uniforms.uHoverIndex?.value).toBe(0);
      expect(uniforms.uTextureAtlas?.value).toBeNull();
      expect(uniforms.uOpacity?.value).toBe(0.9);
      expect(uniforms.uHoverScale?.value).toBe(1.1);
    });
  });
});
