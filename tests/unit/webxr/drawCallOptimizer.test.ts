/**
 * Unit tests for drawCallOptimizer utility
 */

import * as THREE from 'three';
import { DrawCallOptimizer, OptimizationStrategy } from '@/utils/webxr/drawCallOptimizer';

describe('DrawCallOptimizer', () => {
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;

  beforeEach(() => {
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(100, 100);
    renderer.info.render.calls = 0;
    renderer.info.render.triangles = 0;
    renderer.info.render.points = 0;
    renderer.info.render.lines = 0;

    scene = new THREE.Scene();
  });

  afterEach(() => {
    renderer.dispose();
    renderer = null as unknown as THREE.WebGLRenderer;
    scene = null as unknown as THREE.Scene;
  });

  describe('Metrics Collection', () => {
    test('should count draw calls from renderer info', () => {
      renderer.info.render.calls = 15;
      const optimizer = new DrawCallOptimizer(renderer, scene);

      const metrics = optimizer.getMetrics();
      expect(metrics.drawCalls).toBe(15);
    });

    test('should report triangles count', () => {
      renderer.info.render.triangles = 5000;
      const optimizer = new DrawCallOptimizer(renderer, scene);

      const metrics = optimizer.getMetrics();
      expect(metrics.triangles).toBe(5000);
    });

    test('should report points count', () => {
      renderer.info.render.points = 200;
      const optimizer = new DrawCallOptimizer(renderer, scene);

      const metrics = optimizer.getMetrics();
      expect(metrics.points).toBe(200);
    });

    test('should report lines count', () => {
      renderer.info.render.lines = 50;
      const optimizer = new DrawCallOptimizer(renderer, scene);

      const metrics = optimizer.getMetrics();
      expect(metrics.lines).toBe(50);
    });

    test('should track mesh count in scene', () => {
      const mesh1 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial(),
      );
      const mesh2 = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshBasicMaterial(),
      );
      scene.add(mesh1);
      scene.add(mesh2);

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const metrics = optimizer.getMetrics();

      expect(metrics.meshCount).toBe(2);
    });

    test('should track instanced mesh count separately', () => {
      const instancedMesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial(),
        10,
      );
      instancedMesh.count = 10;
      scene.add(instancedMesh);

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const metrics = optimizer.getMetrics();

      expect(metrics.instancedMeshCount).toBe(1);
      expect(metrics.instancedMeshInstances).toBe(10);
    });

    test('should calculate draw calls per mesh', () => {
      renderer.info.render.calls = 20;
      scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial()));
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshBasicMaterial()));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const metrics = optimizer.getMetrics();

      expect(metrics.drawCallsPerMesh).toBeCloseTo(10);
    });
  });

  describe('InstancedMesh Usage', () => {
    test('should recommend InstancedMesh for multiple meshes with same geometry', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial();

      for (let i = 0; i < 5; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      }

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const opportunities = optimizer.analyzeOptimizationOpportunities();

      const instancingOpportunity = opportunities.find(
        (opp) => opp.strategy === OptimizationStrategy.InstancedMesh,
      );
      expect(instancingOpportunity).toBeDefined();
      expect(instancingOpportunity?.potentialDrawCallReduction).toBeGreaterThan(0);
    });

    test('should not recommend InstancedMesh for single mesh', () => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial());
      scene.add(mesh);

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const opportunities = optimizer.analyzeOptimizationOpportunities();

      const instancingOpportunity = opportunities.find(
        (opp) => opp.strategy === OptimizationStrategy.InstancedMesh,
      );
      expect(instancingOpportunity).toBeUndefined();
    });

    test('should calculate potential draw call reduction for instancing', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial();

      for (let i = 0; i < 10; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      }

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const opportunities = optimizer.analyzeOptimizationOpportunities();

      const instancingOpportunity = opportunities.find(
        (opp) => opp.strategy === OptimizationStrategy.InstancedMesh,
      );
      expect(instancingOpportunity?.potentialDrawCallReduction).toBe(9);
    });

    test('should track instancing efficiency', () => {
      const instancedMesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial(),
        100,
      );
      instancedMesh.count = 50;
      scene.add(instancedMesh);

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const metrics = optimizer.getMetrics();

      expect(metrics.instancingEfficiency).toBeCloseTo(0.5);
    });
  });

  describe('Material Sharing', () => {
    test('should recommend material sharing for meshes with identical materials', () => {
      const geometry1 = new THREE.BoxGeometry(1, 1, 1);
      const geometry2 = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

      scene.add(new THREE.Mesh(geometry1, material));
      scene.add(new THREE.Mesh(geometry2, material));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const opportunities = optimizer.analyzeOptimizationOpportunities();

      const materialOpportunity = opportunities.find(
        (opp) => opp.strategy === OptimizationStrategy.MaterialSharing,
      );
      expect(materialOpportunity).toBeDefined();
    });

    test('should identify unique material count', () => {
      const material1 = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const material3 = new THREE.MeshStandardMaterial({ color: 0x0000ff });

      scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material1));
      scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material2));
      scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material3));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const metrics = optimizer.getMetrics();

      expect(metrics.uniqueMaterials).toBe(3);
    });

    test('should find shareable materials', () => {
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

      scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material));
      scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const shareable = optimizer.findShareableMaterials();

      expect(shareable.size).toBeGreaterThan(0);
      expect(shareable.get(material)?.length).toBe(2);
    });

    test('should calculate potential reduction from material sharing', () => {
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const geometry = new THREE.BoxGeometry(1, 1, 1);

      scene.add(new THREE.Mesh(geometry, material));
      scene.add(new THREE.Mesh(geometry, material));
      scene.add(new THREE.Mesh(geometry, material));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const opportunities = optimizer.analyzeOptimizationOpportunities();

      const materialOpportunity = opportunities.find(
        (opp) => opp.strategy === OptimizationStrategy.MaterialSharing,
      );
      expect(materialOpportunity?.potentialDrawCallReduction).toBe(2);
    });
  });

  describe('Visibility Culling', () => {
    test('should recommend culling for invisible or transparent meshes', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material1 = new THREE.MeshStandardMaterial({ opacity: 0.005, transparent: true });
      const material2 = new THREE.MeshStandardMaterial({ opacity: 0.99, transparent: true });

      scene.add(new THREE.Mesh(geometry, material1));
      scene.add(new THREE.Mesh(geometry, material2));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const opportunities = optimizer.analyzeOptimizationOpportunities();

      const cullingOpportunity = opportunities.find(
        (opp) => opp.strategy === OptimizationStrategy.VisibilityCulling,
      );
      expect(cullingOpportunity).toBeDefined();
    });

    test('should identify meshes with opacity below threshold', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);

      const material1 = new THREE.MeshStandardMaterial({ opacity: 0.005, transparent: true });
      const material2 = new THREE.MeshStandardMaterial({ opacity: 0.009, transparent: true });
      const material3 = new THREE.MeshStandardMaterial({ opacity: 0.02, transparent: true });

      scene.add(new THREE.Mesh(geometry, material1));
      scene.add(new THREE.Mesh(geometry, material2));
      scene.add(new THREE.Mesh(geometry, material3));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const culled = optimizer.findCullableMeshes();

      expect(culled).toHaveLength(2);
    });

    test('should support custom opacity threshold', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ opacity: 0.1, transparent: true });
      scene.add(new THREE.Mesh(geometry, material));

      const optimizer = new DrawCallOptimizer(renderer, scene, {
        opacityCullingThreshold: 0.15,
      });
      const culled = optimizer.findCullableMeshes();

      expect(culled).toHaveLength(1);
    });

    test('should not cull meshes with visible set to false', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.visible = false;
      scene.add(mesh);

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const culled = optimizer.findCullableMeshes();

      expect(culled).toHaveLength(0);
    });
  });

  describe('Geometry Reuse', () => {
    test('should recommend geometry reuse for duplicate geometries', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);

      scene.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial()));
      scene.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial()));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const opportunities = optimizer.analyzeOptimizationOpportunities();

      const geometryOpportunity = opportunities.find(
        (opp) => opp.strategy === OptimizationStrategy.GeometryReuse,
      );
      expect(geometryOpportunity).toBeDefined();
    });

    test('should track unique geometry count', () => {
      const geometry1 = new THREE.BoxGeometry(1, 1, 1);
      const geometry2 = new THREE.SphereGeometry(1, 32, 32);
      const geometry3 = new THREE.ConeGeometry(1, 2, 32);

      scene.add(new THREE.Mesh(geometry1, new THREE.MeshStandardMaterial()));
      scene.add(new THREE.Mesh(geometry1, new THREE.MeshStandardMaterial()));
      scene.add(new THREE.Mesh(geometry2, new THREE.MeshStandardMaterial()));
      scene.add(new THREE.Mesh(geometry3, new THREE.MeshStandardMaterial()));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const metrics = optimizer.getMetrics();

      expect(metrics.uniqueGeometries).toBe(3);
    });

    test('should find duplicate geometries', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);

      const mesh1 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      const mesh2 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      scene.add(mesh1);
      scene.add(mesh2);

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const duplicates = optimizer.findDuplicateGeometries();

      expect(duplicates.size).toBeGreaterThan(0);
      expect(duplicates.has(geometry)).toBe(true);
      expect(duplicates.get(geometry)?.length).toBe(2);
    });

    test('should not consider distinct geometries as duplicates', () => {
      const geometry1 = new THREE.BoxGeometry(1, 1, 1);
      const geometry2 = new THREE.BoxGeometry(1, 1, 1);

      scene.add(new THREE.Mesh(geometry1, new THREE.MeshStandardMaterial()));
      scene.add(new THREE.Mesh(geometry2, new THREE.MeshStandardMaterial()));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const duplicates = optimizer.findDuplicateGeometries();

      expect(duplicates.size).toBe(0);
    });
  });

  describe('Texture Atlas Verification', () => {
    test('should verify texture atlas usage', () => {
      const geometry = new THREE.PlaneGeometry(1, 1);
      const texture1 = new THREE.Texture();
      const texture2 = new THREE.Texture();

      const material1 = new THREE.MeshBasicMaterial({ map: texture1 });
      const material2 = new THREE.MeshBasicMaterial({ map: texture2 });

      scene.add(new THREE.Mesh(geometry, material1));
      scene.add(new THREE.Mesh(geometry, material2));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const opportunities = optimizer.analyzeOptimizationOpportunities();

      const atlasOpportunity = opportunities.find(
        (opp) => opp.strategy === OptimizationStrategy.TextureAtlas,
      );
      expect(atlasOpportunity).toBeDefined();
    });

    test('should track unique texture count', () => {
      const geometry = new THREE.PlaneGeometry(1, 1);

      const texture1 = new THREE.Texture();
      const texture2 = new THREE.Texture();
      const texture3 = new THREE.Texture();

      scene.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture1 })));
      scene.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture2 })));
      scene.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture3 })));

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const metrics = optimizer.getMetrics();

      expect(metrics.uniqueTextures).toBe(3);
    });

    test('should recommend texture atlas when multiple textures are used', () => {
      const geometry = new THREE.PlaneGeometry(1, 1);

      for (let i = 0; i < 4; i++) {
        const texture = new THREE.Texture();
        scene.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture })));
      }

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const opportunities = optimizer.analyzeOptimizationOpportunities();

      const atlasOpportunity = opportunities.find(
        (opp) => opp.strategy === OptimizationStrategy.TextureAtlas,
      );
      expect(atlasOpportunity).toBeDefined();
      expect(atlasOpportunity?.potentialDrawCallReduction).toBeGreaterThan(0);
    });
  });

  describe('Recommendations', () => {
    test('should generate human-readable recommendations', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial();

      for (let i = 0; i < 5; i++) {
        scene.add(new THREE.Mesh(geometry, material));
      }

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const recommendations = optimizer.getRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
      expect(typeof recommendations[0]).toBe('string');
    });

    test('should include instancing recommendations', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial();

      for (let i = 0; i < 5; i++) {
        scene.add(new THREE.Mesh(geometry, material));
      }

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const recommendations = optimizer.getRecommendations();

      const instancingRec = recommendations.find((rec) => rec.toLowerCase().includes('instance'));
      expect(instancingRec).toBeDefined();
    });
  });

  describe('Development Logging', () => {
    test('should log metrics in development mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      renderer.info.render.calls = 15;
      const optimizer = new DrawCallOptimizer(renderer, scene);

      optimizer.logMetrics();

      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).toContain('15');

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    test('should not log metrics in production mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const optimizer = new DrawCallOptimizer(renderer, scene);

      optimizer.logMetrics();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    test('should log optimization opportunities', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial();

      for (let i = 0; i < 5; i++) {
        scene.add(new THREE.Mesh(geometry, material));
      }

      const optimizer = new DrawCallOptimizer(renderer, scene);
      optimizer.logOptimizationOpportunities();

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Configuration', () => {
    test('should accept custom opacity culling threshold', () => {
      const optimizer = new DrawCallOptimizer(renderer, scene, {
        opacityCullingThreshold: 0.05,
      });

      expect(optimizer.getOpacityCullingThreshold()).toBe(0.05);
    });

    test('should use default opacity culling threshold', () => {
      const optimizer = new DrawCallOptimizer(renderer, scene);

      expect(optimizer.getOpacityCullingThreshold()).toBe(0.01);
    });

    test('should allow enabling/disabling specific strategies', () => {
      const optimizer = new DrawCallOptimizer(renderer, scene, {
        enabledStrategies: [OptimizationStrategy.InstancedMesh],
      });

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial();

      for (let i = 0; i < 5; i++) {
        scene.add(new THREE.Mesh(geometry, material));
      }

      const opportunities = optimizer.analyzeOptimizationOpportunities();

      expect(
        opportunities.every((opp) => opp.strategy === OptimizationStrategy.InstancedMesh),
      ).toBe(true);
    });
  });

  describe('Scene Traversal', () => {
    test('should traverse nested scene hierarchy', () => {
      const group = new THREE.Group();
      const childGroup = new THREE.Group();
      const mesh1 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial(),
      );
      const mesh2 = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshBasicMaterial(),
      );

      childGroup.add(mesh1);
      group.add(childGroup);
      group.add(mesh2);
      scene.add(group);

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const metrics = optimizer.getMetrics();

      expect(metrics.meshCount).toBe(2);
    });

    test('should skip empty groups', () => {
      const group = new THREE.Group();
      scene.add(group);

      const optimizer = new DrawCallOptimizer(renderer, scene);
      const metrics = optimizer.getMetrics();

      expect(metrics.meshCount).toBe(0);
    });
  });

  describe('Draw Call Thresholds', () => {
    test('should warn when draw calls exceed threshold', () => {
      renderer.info.render.calls = 150;
      const optimizer = new DrawCallOptimizer(renderer, scene, {
        drawCallWarningThreshold: 100,
      });

      const metrics = optimizer.getMetrics();
      expect(metrics.exceedsThreshold).toBe(true);
      expect(metrics.thresholdExceededBy).toBe(50);
    });

    test('should not warn when draw calls are below threshold', () => {
      renderer.info.render.calls = 50;
      const optimizer = new DrawCallOptimizer(renderer, scene, {
        drawCallWarningThreshold: 100,
      });

      const metrics = optimizer.getMetrics();
      expect(metrics.exceedsThreshold).toBe(false);
    });

    test('should use default draw call threshold', () => {
      renderer.info.render.calls = 150;
      const optimizer = new DrawCallOptimizer(renderer, scene);

      const metrics = optimizer.getMetrics();
      expect(metrics.exceedsThreshold).toBe(true);
    });
  });
});
