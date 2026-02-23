/**
 * Shader type definitions for WebXR instancing system
 * Provides types for uniforms, attributes, and shader configurations
 */

import * as THREE from 'three';

export type ShaderUniformKey =
  | 'uTime'
  | 'uViewMode'
  | 'uHoverIndex'
  | 'uTextureAtlas'
  | 'uOpacity'
  | 'uHoverScale'
  | 'uGlowColor';

export type ShaderAttributeKey =
  | 'aAnimationOffset'
  | 'aUvOffset'
  | 'aBaseY'
  | 'aHoverY'
  | 'aBasePosition'
  | 'aHoverPosition';

export type ShaderVaryingKey = 'vUv' | 'vHovered' | 'vInstanceIndex';

export interface InstanceAnimationUniforms {
  uTime: THREE.IUniform<number>;
  uViewMode: THREE.IUniform<number>;
  uHoverIndex: THREE.IUniform<number>;
  uTextureAtlas: THREE.IUniform<THREE.Texture | null>;
  uOpacity: THREE.IUniform<number>;
  uHoverScale: THREE.IUniform<number>;
  uGlowColor: THREE.IUniform<THREE.Color>;
}

export interface InstanceAnimationAttributes {
  aAnimationOffset: number[];
  aUvOffset: number[];
  aBaseY: number[];
  aHoverY: number[];
  aBasePosition: number[];
  aHoverPosition: number[];
}

export interface ShaderMaterialConfig {
  vertexShader: string;
  fragmentShader: string;
  uniforms: Partial<InstanceAnimationUniforms>;
  attributes?: Partial<InstanceAnimationAttributes>;
  transparent?: boolean;
  side?: THREE.Side;
  depthWrite?: boolean;
  depthTest?: boolean;
  blending?: THREE.Blending;
}

export interface InstanceData {
  index: number;
  animationOffset: number;
  uvOffset: [number, number];
  baseY: number;
  hoverY: number;
  basePosition: [number, number, number];
  hoverPosition: [number, number, number];
}

export interface InstanceMeshConfig {
  count: number;
  instances: InstanceData[];
  geometry?: THREE.BufferGeometry;
  material?: ShaderMaterialConfig;
}

export interface TextureAtlasConfig {
  width: number;
  height: number;
  tileSize: [number, number];
  padding: number;
  grid: [number, number];
}

export interface UVCoordinate {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ShaderAnimationState {
  viewMode: number;
  hoveredIndex: number;
  opacity: number;
  time: number;
}

export type ViewMode = 'home' | 'work';

export const VIEW_MODE_VALUES = {
  home: 0,
  work: 1,
} as const satisfies Record<ViewMode, number>;

export const DEFAULT_UNIFORMS: Partial<InstanceAnimationUniforms> = {
  uTime: { value: 0 },
  uViewMode: { value: VIEW_MODE_VALUES.home },
  uHoverIndex: { value: -1 },
  uTextureAtlas: { value: null },
  uOpacity: { value: 0.9 },
  uHoverScale: { value: 1.1 },
  uGlowColor: { value: new THREE.Color(0.4, 0.4, 1.0) },
} as const;

export const SHADER_DEFINES = {
  INSTANCED: 1,
  MAX_INSTANCES: 50,
  FLOATING_AMPLITUDE: 0.05,
  FLOATING_SPEED: 2.0,
  HOVER_FORWARD_OFFSET: 0.5,
  HOVER_UP_OFFSET: 0.3,
  HOVER_SCALE: 1.1,
} as const;

export const HOVER_GLOW_COLOR = new THREE.Color('#4f46e5');

export const OPACITY_THRESHOLDS = {
  visible: 1.0,
  hidden: 0.0,
  minimum: 0.01,
} as const;

export const HIDE_THRESHOLD = 0.01;
