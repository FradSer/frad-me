/**
 * Unit tests for instancedMeshManager utility
 */

import * as THREE from 'three';
import {
  calculateInstanceMatrix,
  createTransform,
  InstancedMeshFactories,
  InstancedMeshManager,
  type InstanceTransform,
} from '../instancedMeshManager';

describe('InstancedMeshManager', () => {
  let geometry: THREE.BufferGeometry;
  let material: THREE.Material;
  let manager: InstancedMeshManager;

  beforeEach(() => {
    geometry = new THREE.BoxGeometry(1, 1, 1);
    material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    manager = new InstancedMeshManager(geometry, material, { maxInstances: 10 });
  });

  afterEach(() => {
    manager.dispose();
  });

  describe('Construction', () => {
    test('creates instanced mesh with correct instance count', () => {
      expect(manager.getMesh().count).toBe(10);
    });

    test('sets correct dynamic draw usage', () => {
      expect(manager.getMesh().instanceMatrix.usage).toBe(THREE.DynamicDrawUsage);
    });

    test('initializes instance color for supported materials', () => {
      const stdMat = new THREE.MeshStandardMaterial();
      const stdManager = new InstancedMeshManager(geometry, stdMat, { maxInstances: 5 });
      expect(stdManager.getMesh().instanceColor).toBeDefined();
      stdManager.dispose();
    });

    test('does not create instance color for unsupported materials', () => {
      const depthMat = new THREE.MeshDepthMaterial();
      const depthManager = new InstancedMeshManager(geometry, depthMat, { maxInstances: 5 });
      expect(depthManager.getMesh().instanceColor).toBeNull();
      depthManager.dispose();
    });
  });

  describe('Instance Management', () => {
    test('adds instance and returns valid ID', () => {
      const id = manager.addInstance();
      expect(id).toBeGreaterThanOrEqual(0);
      expect(manager.getInstanceCount()).toBe(1);
    });

    test('adds instance with initial transform', () => {
      const transform: InstanceTransform = {
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0.1, y: 0.2, z: 0.3 },
        scale: { x: 2, y: 2, z: 2 },
      };
      const id = manager.addInstance({ transform });
      const state = manager.getInstanceState(id);
      expect(state?.transform).toEqual(transform);
    });

    test('adds instance with initial color', () => {
      const id = manager.addInstance({ color: 0xff0000 });
      const state = manager.getInstanceState(id);
      expect(state?.color).toBeDefined();
      expect(state?.color?.getHex()).toBe(0xff0000);
    });

    test('removes instance and makes ID reusable', () => {
      const id1 = manager.addInstance();
      manager.removeInstance(id1);
      expect(manager.getInstanceCount()).toBe(0);

      const id2 = manager.addInstance();
      expect(id2).toBe(id1);
    });

    test('gets visible instances', () => {
      const id1 = manager.addInstance({ visible: true });
      const id2 = manager.addInstance({ visible: false });
      const id3 = manager.addInstance({ visible: true });

      const visible = manager.getVisibleInstances();
      expect(visible).toHaveLength(2);
      expect(visible).toContain(id1);
      expect(visible).not.toContain(id2);
      expect(visible).toContain(id3);
    });

    test('handles instance IDs up to capacity', () => {
      const maxInstances = 5;
      const limitedManager = new InstancedMeshManager(geometry, material, { maxInstances });

      const ids: number[] = [];
      for (let i = 0; i < maxInstances; i++) {
        ids.push(limitedManager.addInstance());
      }

      expect(ids[0]).toBe(0);
      expect(ids[maxInstances - 1]).toBe(maxInstances - 1);

      limitedManager.removeInstance(0);
      const reusedId = limitedManager.addInstance();
      expect(reusedId).toBe(0);

      limitedManager.dispose();
    });
  });

  describe('Transform Updates', () => {
    test('updates instance position', () => {
      const id = manager.addInstance();
      manager.updateInstanceTransform(id, { position: { x: 5, y: 10, z: 15 } });
      const state = manager.getInstanceState(id);
      expect(state?.transform.position).toEqual({ x: 5, y: 10, z: 15 });
    });

    test('updates instance rotation', () => {
      const id = manager.addInstance();
      manager.updateInstanceTransform(id, { rotation: { x: Math.PI, y: 0, z: 0 } });
      const state = manager.getInstanceState(id);
      expect(state?.transform.rotation.x).toBe(Math.PI);
    });

    test('updates instance scale', () => {
      const id = manager.addInstance();
      manager.updateInstanceTransform(id, { scale: { x: 3, y: 3, z: 3 } });
      const state = manager.getInstanceState(id);
      expect(state?.transform.scale).toEqual({ x: 3, y: 3, z: 3 });
    });

    test('updates partial transform', () => {
      const id = manager.addInstance();
      manager.updateInstanceTransform(id, { position: { x: 1, y: 2, z: 3 } });
      const state = manager.getInstanceState(id);
      expect(state?.transform.position).toEqual({ x: 1, y: 2, z: 3 });
      expect(state?.transform.rotation).toEqual({ x: 0, y: 0, z: 0 });
      expect(state?.transform.scale).toEqual({ x: 1, y: 1, z: 1 });
    });
  });

  describe('Color Updates', () => {
    test('updates instance color', () => {
      const id = manager.addInstance();
      manager.updateInstanceColor(id, 0x00ff00);
      const state = manager.getInstanceState(id);
      expect(state?.color?.getHex()).toBe(0x00ff00);
    });

    test('does not update color when unsupported', () => {
      const depthMat = new THREE.MeshDepthMaterial();
      const depthManager = new InstancedMeshManager(geometry, depthMat, { maxInstances: 5 });
      const id = depthManager.addInstance();
      // Should not throw error
      expect(() => depthManager.updateInstanceColor(id, 0xff0000)).not.toThrow();
      depthManager.dispose();
    });
  });

  describe('Visibility Updates', () => {
    test('updates instance visibility', () => {
      const id = manager.addInstance({ visible: false });
      manager.updateInstanceVisibility(id, true);
      const state = manager.getInstanceState(id);
      expect(state?.visible).toBe(true);
    });

    test('hides instance by setting zero scale matrix', () => {
      const id = manager.addInstance();
      manager.updateInstanceVisibility(id, false);

      const mesh = manager.getMesh();
      const matrix = new THREE.Matrix4();
      mesh.getMatrixAt(id, matrix);

      expect(matrix.elements[0]).toBe(0);
      expect(matrix.elements[1]).toBe(0);
      expect(matrix.elements[2]).toBe(0);
    });
  });

  describe('Batch Updates', () => {
    test('updates multiple instances in batch', () => {
      const id1 = manager.addInstance();
      const id2 = manager.addInstance();
      const id3 = manager.addInstance();

      const updates = new Map([
        [id1, { transform: { position: { x: 1, y: 0, z: 0 } as InstanceTransform['position'] } }],
        [id2, { color: 0xff0000, opacity: 0.5 }],
        [id3, { visible: false }],
      ]);

      manager.batchUpdate(updates);

      expect(manager.getInstanceState(id1)?.transform.position.x).toBe(1);
      expect(manager.getInstanceState(id2)?.color?.getHex()).toBe(0xff0000);
      expect(manager.getInstanceState(id2)?.opacity).toBe(0.5);
      expect(manager.getInstanceState(id3)?.visible).toBe(false);
    });
  });

  describe('Material Opacity', () => {
    test('updates material opacity', () => {
      const mat = manager.getMesh().material as THREE.MeshStandardMaterial;
      manager.updateMaterialOpacity(0.5);
      expect(mat.opacity).toBe(0.5);
      expect(mat.transparent).toBe(true);
      expect(mat.depthWrite).toBe(false);
    });

    test('enables depth write when opacity is 1', () => {
      const mat = manager.getMesh().material as THREE.MeshStandardMaterial;
      manager.updateMaterialOpacity(1);
      expect(mat.opacity).toBe(1);
      expect(mat.depthWrite).toBe(true);
    });

    test('does not update if opacity change is below threshold', () => {
      const mat = manager.getMesh().material as THREE.MeshStandardMaterial;
      manager.updateMaterialOpacity(0.5);
      const initialOpacity = mat.opacity;

      manager.updateMaterialOpacity(0.5001);
      expect(mat.opacity).toBe(initialOpacity);
    });
  });

  describe('Event Handling', () => {
    test('handles hover events', () => {
      const hoverCallback = jest.fn();
      manager.setEvents({ onInstanceHover: hoverCallback });

      const raycaster = new THREE.Raycaster();
      raycaster.set(new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 0, -1));

      manager.handleRaycast(raycaster);
      expect(hoverCallback).not.toHaveBeenCalled();
    });

    test('handles click events', () => {
      const clickCallback = jest.fn();
      manager.setEvents({ onInstanceClick: clickCallback });

      const raycaster = new THREE.Raycaster();
      raycaster.set(new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 0, -1));

      manager.handleClick(raycaster);
      expect(clickCallback).not.toHaveBeenCalled();
    });

    test('gets instance at point from raycaster', () => {
      const id = manager.addInstance();
      manager.updateInstanceTransform(id, { position: { x: 0, y: 0, z: -5 } });

      const raycaster = new THREE.Raycaster();
      raycaster.set(new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 0, -1));
      raycaster.far = 20;

      const instanceId = manager.getInstanceAtPoint(raycaster);
      expect(instanceId).toBe(id);
    });

    test('returns -1 when no instance is hit', () => {
      const raycaster = new THREE.Raycaster();
      raycaster.set(new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 0, -1));
      raycaster.far = 5;

      const instanceId = manager.getInstanceAtPoint(raycaster);
      expect(instanceId).toBe(-1);
    });
  });

  describe('Animation', () => {
    test('animates all visible instances', () => {
      const id1 = manager.addInstance({ visible: true });
      const id2 = manager.addInstance({ visible: false });
      const id3 = manager.addInstance({ visible: true });

      const updateCallback = jest.fn();
      manager.animate(updateCallback);

      expect(updateCallback).toHaveBeenCalledTimes(2);
      expect(updateCallback).toHaveBeenCalledWith(id1, expect.any(Object));
      expect(updateCallback).toHaveBeenCalledWith(id3, expect.any(Object));
      expect(updateCallback).not.toHaveBeenCalledWith(id2, expect.any(Object));
    });
  });

  describe('Cleanup', () => {
    test('disposes geometry and material', () => {
      const disposeSpy = jest.spyOn(geometry, 'dispose');
      const materialDisposeSpy = jest.spyOn(material, 'dispose');

      manager.dispose();

      expect(disposeSpy).toHaveBeenCalled();
      expect(materialDisposeSpy).toHaveBeenCalled();
    });

    test('clears instances', () => {
      manager.addInstance();
      manager.addInstance();
      manager.dispose();

      expect(manager.getInstanceCount()).toBe(0);
    });
  });

  describe('Capacity', () => {
    test('reports correct capacity', () => {
      expect(manager.getCapacity()).toBe(10);
    });
  });
});

describe('InstancedMeshFactories', () => {
  test('creates box instances', () => {
    const manager = InstancedMeshFactories.createBoxInstances(2, 10);
    expect(manager.getMesh().geometry).toBeInstanceOf(THREE.BoxGeometry);
    expect(manager.getCapacity()).toBe(10);
    manager.dispose();
  });

  test('creates sphere instances', () => {
    const manager = InstancedMeshFactories.createSphereInstances(1, 5);
    expect(manager.getMesh().geometry).toBeInstanceOf(THREE.SphereGeometry);
    expect(manager.getCapacity()).toBe(5);
    manager.dispose();
  });

  test('creates cone instances', () => {
    const manager = InstancedMeshFactories.createConeInstances(1, 2, 32, 8);
    expect(manager.getMesh().geometry).toBeInstanceOf(THREE.ConeGeometry);
    expect(manager.getCapacity()).toBe(8);
    manager.dispose();
  });

  test('creates plane instances', () => {
    const manager = InstancedMeshFactories.createPlaneInstances(3, 2, 6);
    expect(manager.getMesh().geometry).toBeInstanceOf(THREE.PlaneGeometry);
    expect(manager.getCapacity()).toBe(6);
    manager.dispose();
  });

  test('accepts custom material', () => {
    const customMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const manager = InstancedMeshFactories.createBoxInstances(1, 5, customMaterial);
    expect(manager.getMesh().material).toBe(customMaterial);
    manager.dispose();
  });

  test('accepts custom config', () => {
    const manager = InstancedMeshFactories.createBoxInstances(1, 5, undefined, {
      baseColor: 0xff0000,
      baseOpacity: 0.8,
    });
    expect(manager.getCapacity()).toBe(5);
    manager.dispose();
  });
});

describe('Utility Functions', () => {
  describe('createTransform', () => {
    test('creates transform with position only', () => {
      const transform = createTransform([1, 2, 3]);
      expect(transform.position).toEqual({ x: 1, y: 2, z: 3 });
      expect(transform.rotation).toEqual({ x: 0, y: 0, z: 0 });
      expect(transform.scale).toEqual({ x: 1, y: 1, z: 1 });
    });

    test('creates transform with position and rotation', () => {
      const transform = createTransform([1, 2, 3], [0.1, 0.2, 0.3]);
      expect(transform.position).toEqual({ x: 1, y: 2, z: 3 });
      expect(transform.rotation).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
      expect(transform.scale).toEqual({ x: 1, y: 1, z: 1 });
    });

    test('creates full transform', () => {
      const transform = createTransform([1, 2, 3], [0.1, 0.2, 0.3], [2, 2, 2]);
      expect(transform.position).toEqual({ x: 1, y: 2, z: 3 });
      expect(transform.rotation).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
      expect(transform.scale).toEqual({ x: 2, y: 2, z: 2 });
    });
  });

  describe('calculateInstanceMatrix', () => {
    test('calculates identity matrix for default values', () => {
      const matrix = calculateInstanceMatrix([0, 0, 0], [0, 0, 0], [1, 1, 1]);
      const identity = new THREE.Matrix4().identity();
      expect(matrix.elements).toEqual(identity.elements);
    });

    test('calculates matrix with translation', () => {
      const matrix = calculateInstanceMatrix([5, 10, 15]);
      expect(matrix.elements[12]).toBe(5);
      expect(matrix.elements[13]).toBe(10);
      expect(matrix.elements[14]).toBe(15);
    });

    test('calculates matrix with scale', () => {
      const matrix = calculateInstanceMatrix([0, 0, 0], [0, 0, 0], [2, 3, 4]);
      expect(matrix.elements[0]).toBe(2);
      expect(matrix.elements[5]).toBe(3);
      expect(matrix.elements[10]).toBe(4);
    });
  });
});
