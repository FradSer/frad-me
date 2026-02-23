import * as THREE from 'three';
import type { Position } from '@/types/common';

export type InstanceTransform = {
  position: Position & { z: number };
  rotation: Position & { z: number };
  scale: Position & { z: number };
};

export type InstanceState = {
  transform: InstanceTransform;
  color?: THREE.Color;
  opacity?: number;
  visible?: boolean;
  hovered?: boolean;
  userData?: Record<string, unknown>;
};

export type InstanceId = number;

export interface InstancedMeshConfig {
  maxInstances: number;
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material;
  baseColor?: THREE.ColorRepresentation;
  baseOpacity?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface InstancedMeshManagerEvents {
  onInstanceHover?: (instanceId: InstanceId, hovered: boolean) => void;
  onInstanceClick?: (instanceId: InstanceId) => void;
}

const DEFAULT_CONFIG: Required<Omit<InstancedMeshConfig, 'geometry' | 'material'>> = {
  maxInstances: 1000,
  baseColor: 0xffffff,
  baseOpacity: 1,
  castShadow: true,
  receiveShadow: true,
};

const MATRIX_HELPER = {
  tempPosition: new THREE.Vector3(),
  tempQuaternion: new THREE.Quaternion(),
  tempScale: new THREE.Vector3(),
  tempMatrix: new THREE.Matrix4(),
} as const;

export class InstancedMeshManager {
  private mesh: THREE.InstancedMesh;
  private instances: Map<InstanceId, InstanceState> = new Map();
  private nextInstanceId: InstanceId = 0;
  private freeInstanceIds: InstanceId[] = [];
  private config: Required<InstancedMeshConfig>;
  private colorHelper: THREE.Color = new THREE.Color();
  private lastOpacityUpdate: number = -1;
  private opacityUpdateThreshold: number = 0.01;
  private events: InstancedMeshManagerEvents = {};

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    config: InstancedMeshConfig,
  ) {
    this.config = {
      ...DEFAULT_CONFIG,
      geometry,
      material,
      ...config,
    };

    this.mesh = new THREE.InstancedMesh(geometry, material, this.config.maxInstances);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.castShadow = this.config.castShadow;
    this.mesh.receiveShadow = this.config.receiveShadow;

    if (this.supportsInstanceColor()) {
      this.mesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(this.config.maxInstances * 3),
        3,
      );
    }

    for (let i = 0; i < this.config.maxInstances; i++) {
      this.mesh.setMatrixAt(
        i,
        new THREE.Matrix4().set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
      );
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  private supportsInstanceColor(): boolean {
    const mat = this.config.material;
    return mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial;
  }

  getMesh(): THREE.InstancedMesh {
    return this.mesh;
  }

  setEvents(events: InstancedMeshManagerEvents): void {
    this.events = { ...this.events, ...events };
  }

  addInstance(initialState: Partial<InstanceState> = {}): InstanceId {
    const instanceId =
      this.freeInstanceIds.length > 0
        ? (this.freeInstanceIds.pop() as InstanceId)
        : this.nextInstanceId++;

    const defaultTransform: InstanceTransform = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };

    const state: InstanceState = {
      transform: {
        ...defaultTransform,
        ...initialState.transform,
      },
      color: this.config.baseColor ? new THREE.Color(this.config.baseColor) : undefined,
      opacity: this.config.baseOpacity,
      visible: true,
      hovered: false,
      userData: {},
    };

    if (initialState.color !== undefined) {
      state.color = new THREE.Color(initialState.color);
    }
    if (initialState.opacity !== undefined) {
      state.opacity = initialState.opacity;
    }
    if (initialState.visible !== undefined) {
      state.visible = initialState.visible;
    }
    if (initialState.hovered !== undefined) {
      state.hovered = initialState.hovered;
    }
    if (initialState.userData !== undefined) {
      state.userData = { ...initialState.userData };
    }

    this.instances.set(instanceId, state);
    this.updateInstanceTransform(instanceId);
    this.updateInstanceColor(instanceId);
    this.updateMeshVisibility(instanceId, state.visible ?? true);

    return instanceId;
  }

  removeInstance(instanceId: InstanceId): void {
    if (!this.instances.has(instanceId)) return;

    this.instances.delete(instanceId);
    this.freeInstanceIds.push(instanceId);
    this.updateMeshVisibility(instanceId, false);
  }

  updateInstanceTransform(instanceId: InstanceId, transform?: Partial<InstanceTransform>): void {
    const state = this.instances.get(instanceId);
    if (!state) return;

    if (transform) {
      state.transform = { ...state.transform, ...transform };
    }

    const { position, rotation, scale } = state.transform;
    const { tempPosition, tempQuaternion, tempScale, tempMatrix } = MATRIX_HELPER;

    tempPosition.set(position.x, position.y, position.z);
    tempQuaternion.setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z));
    tempScale.set(scale.x, scale.y, scale.z);

    tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
    this.mesh.setMatrixAt(instanceId, tempMatrix);
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  updateInstanceColor(instanceId: InstanceId, color?: THREE.ColorRepresentation): void {
    const state = this.instances.get(instanceId);
    if (!state || !this.supportsInstanceColor()) return;

    if (color !== undefined) {
      state.color = new THREE.Color(color);
    }

    if (state.color && this.mesh.instanceColor) {
      this.colorHelper.copy(state.color);
      this.mesh.setColorAt(instanceId, this.colorHelper);
      this.mesh.instanceColor.needsUpdate = true;
    }
  }

  updateInstanceOpacity(instanceId: InstanceId, opacity?: number): void {
    const state = this.instances.get(instanceId);
    if (!state) return;

    state.opacity = opacity ?? state.opacity;
  }

  updateInstanceVisibility(instanceId: InstanceId, visible: boolean): void {
    const state = this.instances.get(instanceId);
    if (!state) return;

    state.visible = visible;
    this.updateMeshVisibility(instanceId, visible);
  }

  private updateMeshVisibility(instanceId: InstanceId, visible: boolean): void {
    const { tempMatrix } = MATRIX_HELPER;

    if (!visible) {
      tempMatrix.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      this.mesh.setMatrixAt(instanceId, tempMatrix);
      this.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  batchUpdate(updates: Map<InstanceId, Partial<InstanceState>>): void {
    updates.forEach((update, instanceId) => {
      const state = this.instances.get(instanceId);
      if (!state) return;

      if (update.transform) {
        this.updateInstanceTransform(instanceId, update.transform);
      }
      if (update.color) {
        this.updateInstanceColor(instanceId, update.color);
      }
      if (update.opacity !== undefined) {
        this.updateInstanceOpacity(instanceId, update.opacity);
      }
      if (update.visible !== undefined) {
        this.updateInstanceVisibility(instanceId, update.visible);
      }
      if (update.userData) {
        state.userData = { ...state.userData, ...update.userData };
      }
    });
  }

  getInstanceState(instanceId: InstanceId): InstanceState | undefined {
    return this.instances.get(instanceId);
  }

  getVisibleInstances(): InstanceId[] {
    const visibleIds: InstanceId[] = [];
    this.instances.forEach((state, id) => {
      if (state.visible) {
        visibleIds.push(id);
      }
    });
    return visibleIds;
  }

  getInstanceAtPoint(raycaster: THREE.Raycaster): InstanceId {
    const intersection = raycaster.intersectObject(this.mesh);
    if (intersection.length === 0) return -1;

    return intersection[0].instanceId ?? -1;
  }

  handleRaycast(raycaster: THREE.Raycaster): void {
    const hoveredInstanceId = this.getInstanceAtPoint(raycaster);

    this.instances.forEach((state, instanceId) => {
      const wasHovered = state.hovered;
      const isHovered = instanceId === hoveredInstanceId;

      if (wasHovered !== isHovered) {
        state.hovered = isHovered;
        this.events.onInstanceHover?.(instanceId, isHovered);
      }
    });
  }

  handleClick(raycaster: THREE.Raycaster): void {
    const instanceId = this.getInstanceAtPoint(raycaster);
    if (instanceId >= 0) {
      this.events.onInstanceClick?.(instanceId);
    }
  }

  animate(updateCallback: (instanceId: InstanceId, state: InstanceState) => void): void {
    this.instances.forEach((state, instanceId) => {
      if (!state.visible) return;

      updateCallback(instanceId, state);
      this.updateInstanceTransform(instanceId);
    });
  }

  updateMaterialOpacity(opacity: number): void {
    if (Math.abs(opacity - this.lastOpacityUpdate) < this.opacityUpdateThreshold) {
      return;
    }

    this.lastOpacityUpdate = opacity;

    const mat = this.mesh.material;
    if (Array.isArray(mat)) {
      for (const m of mat) {
        this.applyOpacityToMaterial(m, opacity);
      }
    } else {
      this.applyOpacityToMaterial(mat, opacity);
    }
  }

  private applyOpacityToMaterial(material: THREE.Material, opacity: number): void {
    if (
      material instanceof THREE.MeshBasicMaterial ||
      material instanceof THREE.MeshStandardMaterial ||
      material instanceof THREE.MeshLambertMaterial
    ) {
      material.opacity = opacity;
      material.transparent = true;
      material.depthWrite = opacity >= 1;
      material.side = THREE.DoubleSide;
      material.needsUpdate = true;
    }
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    if (Array.isArray(this.mesh.material)) {
      for (const mat of this.mesh.material) {
        mat.dispose();
      }
    } else {
      this.mesh.material.dispose();
    }
    this.mesh.dispose();
    this.instances.clear();
    this.freeInstanceIds = [];
  }

  getInstanceCount(): number {
    return this.instances.size;
  }

  getCapacity(): number {
    return this.config.maxInstances;
  }
}

export const InstancedMeshFactories = {
  createBoxInstances: (
    size: number,
    count: number,
    material?: THREE.Material,
    config?: Partial<InstancedMeshConfig>,
  ): InstancedMeshManager => {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const mat =
      material ??
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.1,
      });

    return new InstancedMeshManager(geometry, mat, {
      maxInstances: count,
      ...config,
    });
  },

  createSphereInstances: (
    radius: number,
    count: number,
    material?: THREE.Material,
    config?: Partial<InstancedMeshConfig>,
  ): InstancedMeshManager => {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const mat =
      material ??
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.2,
      });

    return new InstancedMeshManager(geometry, mat, {
      maxInstances: count,
      ...config,
    });
  },

  createConeInstances: (
    radius: number,
    height: number,
    segments: number,
    count: number,
    material?: THREE.Material,
    config?: Partial<InstancedMeshConfig>,
  ): InstancedMeshManager => {
    const geometry = new THREE.ConeGeometry(radius, height, segments);
    const mat =
      material ??
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.1,
      });

    return new InstancedMeshManager(geometry, mat, {
      maxInstances: count,
      ...config,
    });
  },

  createPlaneInstances: (
    width: number,
    height: number,
    count: number,
    material?: THREE.Material,
    config?: Partial<InstancedMeshConfig>,
  ): InstancedMeshManager => {
    const geometry = new THREE.PlaneGeometry(width, height);
    const mat =
      material ??
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.0,
        side: THREE.DoubleSide,
      });

    return new InstancedMeshManager(geometry, mat, {
      maxInstances: count,
      ...config,
    });
  },
};

export const createTransform = (
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
): InstanceTransform => ({
  position: { x: position[0], y: position[1], z: position[2] },
  rotation: { x: rotation[0], y: rotation[1], z: rotation[2] },
  scale: { x: scale[0], y: scale[1], z: scale[2] },
});

export const calculateInstanceMatrix = (
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
): THREE.Matrix4 => {
  const { tempPosition, tempQuaternion, tempScale, tempMatrix } = MATRIX_HELPER;

  tempPosition.set(position[0], position[1], position[2]);
  tempQuaternion.setFromEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2]));
  tempScale.set(scale[0], scale[1], scale[2]);

  return tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
};
