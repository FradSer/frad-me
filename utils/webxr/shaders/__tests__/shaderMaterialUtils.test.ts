/**
 * Unit tests for shader material utilities
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import * as THREE from 'three';
import {
  calculateAnimationOffset,
  calculateUVForAtlasIndex,
  createDefaultShaderConfig,
  createInstancedMeshWithShader,
  createShaderMaterial,
  disposeShaderMaterial,
  generateAnimationOffsets,
  generatePositionArrays,
  generateUVOffsets,
  getDefaultAtlasConfig,
  type InstanceData,
  type InstanceMeshConfig,
  setHoveredIndex,
  setInstanceAttributes,
  setOpacity,
  setTime,
  setViewMode,
  shouldHideMaterial,
  updateUniform,
  updateUniforms,
  validateInstanceData,
  workLinkToInstanceData,
} from '../shaderMaterialUtils';
import { VIEW_MODE_VALUES } from '../shaderTypes';

describe('shaderMaterialUtils', () => {
  let mockMaterial: THREE.ShaderMaterial;

  beforeEach(() => {
    mockMaterial = new THREE.ShaderMaterial({
      vertexShader: 'void main() {}',
      fragmentShader: 'void main() {}',
      uniforms: {
        uTime: { value: 0 },
        uViewMode: { value: 0 },
        uHoverIndex: { value: -1 },
        uOpacity: { value: 0.9 },
      },
    });
  });

  describe('createDefaultShaderConfig', () => {
    it('should create default shader config', () => {
      const config = createDefaultShaderConfig();

      expect(config).toHaveProperty('vertexShader');
      expect(config).toHaveProperty('fragmentShader');
      expect(config).toHaveProperty('uniforms');
      expect(config.transparent).toBe(true);
      expect(config.side).toBe(THREE.DoubleSide);
      expect(config.depthWrite).toBe(false);
    });

    it('should include texture in config if provided', () => {
      const mockTexture = {} as THREE.Texture;
      const config = createDefaultShaderConfig(mockTexture);

      expect(config.uniforms?.uTextureAtlas?.value).toBe(mockTexture);
    });
  });

  describe('createShaderMaterial', () => {
    it('should create shader material from config', () => {
      const config = {
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
        uniforms: { uTime: { value: 0 } },
      };

      const material = createShaderMaterial(config);

      expect(material).toBeInstanceOf(THREE.ShaderMaterial);
      expect(material.vertexShader).toBe(config.vertexShader);
      expect(material.fragmentShader).toBe(config.fragmentShader);
    });

    it('should use default values when config properties are undefined', () => {
      const config = {
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
      };

      const material = createShaderMaterial(config);

      expect(material.transparent).toBe(true);
      expect(material.side).toBe(THREE.DoubleSide);
      expect(material.depthWrite).toBe(false);
    });
  });

  describe('updateUniform', () => {
    it('should update existing uniform', () => {
      updateUniform(mockMaterial, 'uTime', 1.5);

      expect(mockMaterial.uniforms.uTime?.value).toBe(1.5);
    });

    it('should not throw when uniform does not exist', () => {
      expect(() => {
        updateUniform(mockMaterial, 'uNonExistent' as never, 1.0);
      }).not.toThrow();
    });
  });

  describe('updateUniforms', () => {
    it('should update multiple uniforms', () => {
      updateUniforms(mockMaterial, {
        uTime: { value: 2.0 },
        uOpacity: { value: 0.5 },
      });

      expect(mockMaterial.uniforms.uTime?.value).toEqual(2.0);
      expect(mockMaterial.uniforms.uOpacity?.value).toEqual(0.5);
    });
  });

  describe('setViewMode', () => {
    it('should set view mode to home', () => {
      setViewMode(mockMaterial, 'home');

      expect(mockMaterial.uniforms.uViewMode?.value).toBe(VIEW_MODE_VALUES.home);
    });

    it('should set view mode to work', () => {
      setViewMode(mockMaterial, 'work');

      expect(mockMaterial.uniforms.uViewMode?.value).toBe(VIEW_MODE_VALUES.work);
    });
  });

  describe('setHoveredIndex', () => {
    it('should set hovered index', () => {
      setHoveredIndex(mockMaterial, 2);

      expect(mockMaterial.uniforms.uHoverIndex?.value).toBe(2);
    });

    it('should set hovered index to -1 for no hover', () => {
      setHoveredIndex(mockMaterial, -1);

      expect(mockMaterial.uniforms.uHoverIndex?.value).toBe(-1);
    });
  });

  describe('setTime', () => {
    it('should set time uniform', () => {
      setTime(mockMaterial, 3.5);

      expect(mockMaterial.uniforms.uTime?.value).toBe(3.5);
    });
  });

  describe('setOpacity', () => {
    it('should set opacity within valid range', () => {
      setOpacity(mockMaterial, 0.7);

      expect(mockMaterial.uniforms.uOpacity?.value).toBe(0.7);
    });

    it('should clamp opacity to maximum 1', () => {
      setOpacity(mockMaterial, 1.5);

      expect(mockMaterial.uniforms.uOpacity?.value).toBe(1.0);
    });

    it('should clamp opacity to minimum 0', () => {
      setOpacity(mockMaterial, -0.5);

      expect(mockMaterial.uniforms.uOpacity?.value).toBe(0.0);
    });
  });

  describe('calculateAnimationOffset', () => {
    it('should calculate animation offset for index', () => {
      const offset = calculateAnimationOffset(0, 5);

      expect(typeof offset).toBe('number');
    });

    it('should calculate different offsets for different indices', () => {
      const offset0 = calculateAnimationOffset(0, 5);
      const offset1 = calculateAnimationOffset(1, 5);

      expect(offset0).not.toBe(offset1);
    });

    it('should respect phase offset parameter', () => {
      const offset1 = calculateAnimationOffset(1, 5, 0.5);
      const offset2 = calculateAnimationOffset(1, 5, 1.0);

      expect(offset1).not.toBe(offset2);
    });
  });

  describe('calculateUVForAtlasIndex', () => {
    it('should calculate UV coordinates for index', () => {
      const config = getDefaultAtlasConfig();
      const uv = calculateUVForAtlasIndex(0, config);

      expect(uv).toHaveProperty('x');
      expect(uv).toHaveProperty('y');
      expect(uv).toHaveProperty('width');
      expect(uv).toHaveProperty('height');
    });

    it('should calculate different UVs for different indices', () => {
      const config = getDefaultAtlasConfig();
      const uv0 = calculateUVForAtlasIndex(0, config);
      const uv1 = calculateUVForAtlasIndex(1, config);

      expect(uv0.x).not.toBe(uv1.x);
    });

    it('should wrap to next row when index exceeds columns', () => {
      const config = getDefaultAtlasConfig();
      const uv0 = calculateUVForAtlasIndex(1, config);
      const uv2 = calculateUVForAtlasIndex(2, config);

      expect(uv0.y).toBe(0);
      expect(uv2.y).toBeGreaterThan(0);
    });
  });

  describe('generateUVOffsets', () => {
    it('should generate UV offsets for instances', () => {
      const instances: InstanceData[] = [
        {
          index: 0,
          animationOffset: 0,
          uvOffset: [0, 0],
          baseY: 0,
          hoverY: 1,
          basePosition: [0, 0, 0],
          hoverPosition: [0, 1, 0],
        },
        {
          index: 1,
          animationOffset: 0,
          uvOffset: [0, 0],
          baseY: 0,
          hoverY: 1,
          basePosition: [0, 0, 0],
          hoverPosition: [0, 1, 0],
        },
      ];
      const config = getDefaultAtlasConfig();

      const offsets = generateUVOffsets(instances, config);

      expect(offsets).toHaveLength(4);
      expect(typeof offsets[0]).toBe('number');
    });
  });

  describe('generateAnimationOffsets', () => {
    it('should generate animation offsets for instances', () => {
      const instances: InstanceData[] = [
        {
          index: 0,
          animationOffset: 0,
          uvOffset: [0, 0],
          baseY: 0,
          hoverY: 1,
          basePosition: [0, 0, 0],
          hoverPosition: [0, 1, 0],
        },
        {
          index: 1,
          animationOffset: 0,
          uvOffset: [0, 0],
          baseY: 0,
          hoverY: 1,
          basePosition: [0, 0, 0],
          hoverPosition: [0, 1, 0],
        },
      ];

      const offsets = generateAnimationOffsets(instances);

      expect(offsets).toHaveLength(2);
      expect(typeof offsets[0]).toBe('number');
    });
  });

  describe('generatePositionArrays', () => {
    it('should generate position arrays for instances', () => {
      const instances: InstanceData[] = [
        {
          index: 0,
          animationOffset: 0,
          uvOffset: [0, 0],
          baseY: 0,
          hoverY: 1,
          basePosition: [0, 0, 0],
          hoverPosition: [0, 1, 0],
        },
        {
          index: 1,
          animationOffset: 0,
          uvOffset: [0, 0],
          baseY: 0,
          hoverY: 1,
          basePosition: [1, 0, 0],
          hoverPosition: [1, 1, 0],
        },
      ];

      const positions = generatePositionArrays(instances);

      expect(positions.basePositions).toHaveLength(6);
      expect(positions.hoverPositions).toHaveLength(6);
      expect(positions.baseY).toHaveLength(2);
      expect(positions.hoverY).toHaveLength(2);
    });
  });

  describe('setInstanceAttributes', () => {
    it('should set instance attributes on mesh', () => {
      const geometry = new THREE.PlaneGeometry(1, 1);
      const mesh = new THREE.InstancedMesh(geometry, mockMaterial, 2);

      setInstanceAttributes(mesh, {
        aAnimationOffset: [0, 0.5],
        aBasePosition: [0, 0, 0, 1, 0, 0],
      });

      expect(geometry.attributes.aAnimationOffset).toBeDefined();
      expect(geometry.attributes.aBasePosition).toBeDefined();
    });
  });

  describe('createInstancedMeshWithShader', () => {
    it('should create instanced mesh with shader', () => {
      const instances: InstanceData[] = [
        {
          index: 0,
          animationOffset: 0,
          uvOffset: [0, 0],
          baseY: 0,
          hoverY: 1,
          basePosition: [0, 0, 0],
          hoverPosition: [0, 1, 0],
        },
      ];

      const config: InstanceMeshConfig = {
        count: 1,
        instances,
      };

      const mesh = createInstancedMeshWithShader(config);

      expect(mesh).toBeInstanceOf(THREE.InstancedMesh);
      expect(mesh.count).toBe(1);
    });
  });

  describe('shouldHideMaterial', () => {
    it('should return true for opacity below threshold', () => {
      expect(shouldHideMaterial(0.005)).toBe(true);
    });

    it('should return false for opacity above threshold', () => {
      expect(shouldHideMaterial(0.5)).toBe(false);
    });

    it('should return false for opacity at threshold', () => {
      expect(shouldHideMaterial(0.01)).toBe(false);
    });
  });

  describe('getDefaultAtlasConfig', () => {
    it('should return default atlas config', () => {
      const config = getDefaultAtlasConfig();

      expect(config.width).toBe(2048);
      expect(config.height).toBe(2048);
      expect(config.tileSize).toEqual([1024, 768]);
      expect(config.padding).toBe(4);
      expect(config.grid).toEqual([2, 2]);
    });
  });

  describe('validateInstanceData', () => {
    it('should validate correct instance data', () => {
      const data: InstanceData = {
        index: 0,
        animationOffset: 0,
        uvOffset: [0, 0],
        baseY: 0,
        hoverY: 1,
        basePosition: [0, 0, 0],
        hoverPosition: [0, 1, 0],
      };

      expect(validateInstanceData(data)).toBe(true);
    });

    it('should reject data with negative index', () => {
      const data = {
        index: -1,
        animationOffset: 0,
        uvOffset: [0, 0],
        baseY: 0,
        hoverY: 1,
        basePosition: [0, 0, 0],
        hoverPosition: [0, 1, 0],
      } as InstanceData;

      expect(validateInstanceData(data)).toBe(false);
    });

    it('should reject data with invalid uvOffset length', () => {
      const data = {
        index: 0,
        animationOffset: 0,
        uvOffset: [0] as [number, number],
        baseY: 0,
        hoverY: 1,
        basePosition: [0, 0, 0],
        hoverPosition: [0, 1, 0],
      } as InstanceData;

      expect(validateInstanceData(data)).toBe(false);
    });
  });

  describe('workLinkToInstanceData', () => {
    it('should convert work link to instance data', () => {
      const instanceData = workLinkToInstanceData(0, [0, 0, -8], [0, 1, -5], 5);

      expect(instanceData.index).toBe(0);
      expect(instanceData.basePosition).toEqual([0, 0, -8]);
      expect(instanceData.hoverPosition).toEqual([0, 1, -5]);
      expect(instanceData.baseY).toBe(0);
      expect(instanceData.hoverY).toBe(1);
      expect(typeof instanceData.animationOffset).toBe('number');
    });
  });

  describe('disposeShaderMaterial', () => {
    it('should dispose shader material', () => {
      const mockTexture = {
        dispose: () => {},
      } as unknown as THREE.Texture;

      const material = new THREE.ShaderMaterial({
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
        uniforms: { uTextureAtlas: { value: mockTexture } },
      });

      expect(() => disposeShaderMaterial(material)).not.toThrow();
    });

    it('should handle null texture', () => {
      const material = new THREE.ShaderMaterial({
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
        uniforms: { uTextureAtlas: { value: null } },
      });

      expect(() => disposeShaderMaterial(material)).not.toThrow();
    });
  });
});
