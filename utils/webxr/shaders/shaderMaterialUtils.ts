/**
 * Shader material utilities for WebXR instancing system
 * Provides functions to create, configure, and manage shader materials
 */

import * as THREE from 'three';

import { FRAGMENT_SHADER, VERTEX_SHADER } from './loadShader';
import {
  DEFAULT_UNIFORMS,
  type InstanceAnimationAttributes,
  type InstanceAnimationUniforms,
  type InstanceData,
  type InstanceMeshConfig,
  OPACITY_THRESHOLDS,
  SHADER_DEFINES,
  type ShaderMaterialConfig,
  type TextureAtlasConfig,
  type UVCoordinate,
  VIEW_MODE_VALUES,
  type ViewMode,
} from './shaderTypes';

/**
 * Create default shader material configuration
 */
export function createDefaultShaderConfig(
  texture: THREE.Texture | null = null,
): ShaderMaterialConfig {
  return {
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      ...DEFAULT_UNIFORMS,
      uTextureAtlas: { value: texture },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
  };
}

/**
 * Create a shader material from configuration
 */
export function createShaderMaterial(config: ShaderMaterialConfig): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    vertexShader: config.vertexShader,
    fragmentShader: config.fragmentShader,
    uniforms: config.uniforms || {},
    transparent: config.transparent ?? true,
    side: config.side ?? THREE.DoubleSide,
    depthWrite: config.depthWrite ?? false,
    depthTest: config.depthTest ?? true,
    blending: config.blending ?? THREE.NormalBlending,
  });

  return material;
}

/**
 * Create shader material for instanced work cards
 */
export function createInstancedShaderMaterial(
  texture: THREE.Texture | null = null,
): THREE.ShaderMaterial {
  const config = createDefaultShaderConfig(texture);
  return createShaderMaterial(config);
}

/**
 * Update a uniform value on a shader material
 */
export function updateUniform(
  material: THREE.ShaderMaterial,
  name: keyof InstanceAnimationUniforms,
  value: unknown,
): void {
  if (material.uniforms[name]) {
    material.uniforms[name].value = value;
  }
}

/**
 * Update multiple uniforms at once
 */
export function updateUniforms(
  material: THREE.ShaderMaterial,
  uniforms: Partial<InstanceAnimationUniforms>,
): void {
  Object.entries(uniforms).forEach(([key, uniform]) => {
    if (material.uniforms[key]) {
      material.uniforms[key].value = uniform.value;
    }
  });
}

/**
 * Update view mode uniform
 */
export function setViewMode(material: THREE.ShaderMaterial, viewMode: ViewMode): void {
  updateUniform(material, 'uViewMode', VIEW_MODE_VALUES[viewMode]);
}

/**
 * Update hovered instance index
 */
export function setHoveredIndex(material: THREE.ShaderMaterial, index: number): void {
  updateUniform(material, 'uHoverIndex', index);
}

/**
 * Update time uniform for animation
 */
export function setTime(material: THREE.ShaderMaterial, time: number): void {
  updateUniform(material, 'uTime', time);
}

/**
 * Update opacity uniform
 */
export function setOpacity(material: THREE.ShaderMaterial, opacity: number): void {
  updateUniform(material, 'uOpacity', Math.max(0, Math.min(1, opacity)));
}

/**
 * Calculate animation offset for staggering
 * Staggers animations across instances for visual appeal
 */
export function calculateAnimationOffset(index: number, total: number, phaseOffset = 0.5): number {
  return (index / total) * Math.PI * 2 * phaseOffset;
}

/**
 * Calculate UV coordinates for texture atlas
 */
export function calculateUVForAtlasIndex(index: number, config: TextureAtlasConfig): UVCoordinate {
  const { width, height, tileSize, padding, grid } = config;
  const [cols] = grid;

  const tileWidth = tileSize[0] + padding;
  const tileHeight = tileSize[1] + padding;

  const col = index % cols;
  const row = Math.floor(index / cols);

  const u = (col * tileWidth) / width;
  const v = (row * tileHeight) / height;
  const uvWidth = tileSize[0] / width;
  const uvHeight = tileSize[1] / height;

  return { x: u, y: v, width: uvWidth, height: uvHeight };
}

/**
 * Generate UV offset array for instances
 */
export function generateUVOffsets(instances: InstanceData[], config: TextureAtlasConfig): number[] {
  return instances.flatMap((instance) => {
    const uv = calculateUVForAtlasIndex(instance.index, config);
    return [uv.x, uv.y];
  });
}

/**
 * Generate animation offset array for instances
 */
export function generateAnimationOffsets(instances: InstanceData[]): number[] {
  return instances.map((instance) => instance.animationOffset);
}

/**
 * Generate position arrays for instances
 */
export function generatePositionArrays(instances: InstanceData[]): {
  basePositions: number[];
  hoverPositions: number[];
  baseY: number[];
  hoverY: number[];
} {
  const basePositions: number[] = [];
  const hoverPositions: number[] = [];
  const baseY: number[] = [];
  const hoverY: number[] = [];

  instances.forEach((instance) => {
    basePositions.push(...instance.basePosition);
    hoverPositions.push(...instance.hoverPosition);
    baseY.push(instance.baseY);
    hoverY.push(instance.hoverY);
  });

  return { basePositions, hoverPositions, baseY, hoverY };
}

/**
 * Set instance attributes on instanced mesh
 */
export function setInstanceAttributes(
  mesh: THREE.InstancedMesh,
  attributes: Partial<InstanceAnimationAttributes>,
): void {
  const geometry = mesh.geometry;

  if (attributes.aAnimationOffset) {
    geometry.setAttribute(
      'aAnimationOffset',
      new THREE.InstancedBufferAttribute(new Float32Array(attributes.aAnimationOffset), 1),
    );
  }

  if (attributes.aUvOffset) {
    geometry.setAttribute(
      'aUvOffset',
      new THREE.InstancedBufferAttribute(new Float32Array(attributes.aUvOffset), 2),
    );
  }

  if (attributes.aBaseY) {
    geometry.setAttribute(
      'aBaseY',
      new THREE.InstancedBufferAttribute(new Float32Array(attributes.aBaseY), 1),
    );
  }

  if (attributes.aHoverY) {
    geometry.setAttribute(
      'aHoverY',
      new THREE.InstancedBufferAttribute(new Float32Array(attributes.aHoverY), 1),
    );
  }

  if (attributes.aBasePosition) {
    geometry.setAttribute(
      'aBasePosition',
      new THREE.InstancedBufferAttribute(new Float32Array(attributes.aBasePosition), 3),
    );
  }

  if (attributes.aHoverPosition) {
    geometry.setAttribute(
      'aHoverPosition',
      new THREE.InstancedBufferAttribute(new Float32Array(attributes.aHoverPosition), 3),
    );
  }
}

/**
 * Create instanced mesh with shader material and attributes
 */
export function createInstancedMeshWithShader(config: InstanceMeshConfig): THREE.InstancedMesh {
  const { count, instances, geometry, material: materialConfig } = config;

  const meshGeometry =
    geometry ||
    new THREE.PlaneGeometry(SHADER_DEFINES.HOVER_SCALE * 4.5, SHADER_DEFINES.HOVER_SCALE * 3);

  const material = materialConfig
    ? createShaderMaterial(materialConfig)
    : createInstancedShaderMaterial(null);

  const mesh = new THREE.InstancedMesh(meshGeometry, material, count);

  // Set instance attributes
  const attributes: Partial<InstanceAnimationAttributes> = {
    aAnimationOffset: generateAnimationOffsets(instances),
  };

  if (materialConfig?.uniforms?.uTextureAtlas?.value) {
    const atlasConfig: TextureAtlasConfig = {
      width: 2048,
      height: 2048,
      tileSize: [1024, 768],
      padding: 4,
      grid: [2, 2],
    };
    attributes.aUvOffset = generateUVOffsets(instances, atlasConfig);
  }

  const positions = generatePositionArrays(instances);
  attributes.aBasePosition = positions.basePositions;
  attributes.aHoverPosition = positions.hoverPositions;
  attributes.aBaseY = positions.baseY;
  attributes.aHoverY = positions.hoverY;

  setInstanceAttributes(mesh, attributes);

  // Initialize instance matrices
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    dummy.position.set(0, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;

  return mesh;
}

/**
 * Check if material should be hidden based on opacity
 */
export function shouldHideMaterial(opacity: number): boolean {
  return opacity < OPACITY_THRESHOLDS.minimum;
}

/**
 * Get default texture atlas configuration
 */
export function getDefaultAtlasConfig(): TextureAtlasConfig {
  return {
    width: 2048,
    height: 2048,
    tileSize: [1024, 768],
    padding: 4,
    grid: [2, 2],
  };
}

/**
 * Validate instance data
 */
export function validateInstanceData(data: InstanceData): boolean {
  return (
    typeof data.index === 'number' &&
    data.index >= 0 &&
    typeof data.animationOffset === 'number' &&
    Array.isArray(data.uvOffset) &&
    data.uvOffset.length === 2 &&
    typeof data.baseY === 'number' &&
    typeof data.hoverY === 'number' &&
    Array.isArray(data.basePosition) &&
    data.basePosition.length === 3 &&
    Array.isArray(data.hoverPosition) &&
    data.hoverPosition.length === 3
  );
}

/**
 * Convert work link data to instance data
 */
export function workLinkToInstanceData(
  index: number,
  basePosition: [number, number, number],
  hoverPosition: [number, number, number],
  totalInstances: number,
): InstanceData {
  return {
    index,
    animationOffset: calculateAnimationOffset(index, totalInstances),
    uvOffset: [0, 0],
    baseY: basePosition[1],
    hoverY: hoverPosition[1],
    basePosition,
    hoverPosition,
  };
}

/**
 * Dispose shader material properly
 */
export function disposeShaderMaterial(material: THREE.ShaderMaterial): void {
  material.uniforms.uTextureAtlas?.value?.dispose();
  material.dispose();
}
