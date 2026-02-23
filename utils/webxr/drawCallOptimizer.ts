import * as THREE from 'three';

export enum OptimizationStrategy {
  InstancedMesh = 'InstancedMesh',
  MaterialSharing = 'MaterialSharing',
  VisibilityCulling = 'VisibilityCulling',
  GeometryReuse = 'GeometryReuse',
  TextureAtlas = 'TextureAtlas',
}

export interface DrawCallOptimizerConfig {
  opacityCullingThreshold?: number;
  drawCallWarningThreshold?: number;
  instancingMinimumCount?: number;
  enabledStrategies?: OptimizationStrategy[];
}

export interface DrawCallMetrics {
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  meshCount: number;
  instancedMeshCount: number;
  instancedMeshInstances: number;
  uniqueMaterials: number;
  uniqueGeometries: number;
  uniqueTextures: number;
  drawCallsPerMesh: number;
  instancingEfficiency: number;
  exceedsThreshold: boolean;
  thresholdExceededBy?: number;
}

export interface OptimizationOpportunity {
  strategy: OptimizationStrategy;
  description: string;
  potentialDrawCallReduction: number;
  affectedMeshes: number;
}

const DEFAULT_CONFIG: Required<Omit<DrawCallOptimizerConfig, 'enabledStrategies'>> = {
  opacityCullingThreshold: 0.01,
  drawCallWarningThreshold: 100,
  instancingMinimumCount: 3,
};

export class DrawCallOptimizer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private config: Required<DrawCallOptimizerConfig>;
  private meshCache: THREE.Mesh[] = [];
  private instancedMeshCache: THREE.InstancedMesh[] = [];
  private materialCache: Map<THREE.Material, THREE.Mesh[]> = new Map();
  private geometryCache: Map<THREE.BufferGeometry, THREE.Mesh[]> = new Map();
  private textureCache: Map<THREE.Texture, THREE.Mesh[]> = new Map();

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    config: DrawCallOptimizerConfig = {},
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.config = {
      ...DEFAULT_CONFIG,
      enabledStrategies: Object.values(OptimizationStrategy),
      ...config,
    };
    this.refreshCache();
  }

  private refreshCache(): void {
    this.meshCache = [];
    this.instancedMeshCache = [];
    this.materialCache.clear();
    this.geometryCache.clear();
    this.textureCache.clear();

    this.scene.traverse((object) => {
      if (object instanceof THREE.InstancedMesh) {
        this.instancedMeshCache.push(object);
      } else if (object instanceof THREE.Mesh) {
        this.meshCache.push(object);

        const material = object.material;
        if (Array.isArray(material)) {
          material.forEach((mat) => {
            if (!this.materialCache.has(mat)) {
              this.materialCache.set(mat, []);
            }
            this.materialCache.get(mat)!.push(object);
          });
        } else if (material) {
          if (!this.materialCache.has(material)) {
            this.materialCache.set(material, []);
          }
          this.materialCache.get(material)!.push(object);
        }

        if (object.geometry) {
          if (!this.geometryCache.has(object.geometry)) {
            this.geometryCache.set(object.geometry, []);
          }
          this.geometryCache.get(object.geometry)!.push(object);
        }

        if (material && !Array.isArray(material)) {
          if ('map' in material && material.map instanceof THREE.Texture) {
            if (!this.textureCache.has(material.map)) {
              this.textureCache.set(material.map, []);
            }
            this.textureCache.get(material.map)!.push(object);
          }
        }
      }
    });
  }

  getMetrics(): DrawCallMetrics {
    const drawCalls = this.renderer.info.render.calls;
    const triangles = this.renderer.info.render.triangles;
    const points = this.renderer.info.render.points;
    const lines = this.renderer.info.render.lines;

    const meshCount = this.meshCache.length;
    const instancedMeshCount = this.instancedMeshCache.length;
    const instancedMeshInstances = this.instancedMeshCache.reduce(
      (sum, mesh) => sum + mesh.count,
      0,
    );

    const uniqueMaterials = this.materialCache.size;
    const uniqueGeometries = this.geometryCache.size;
    const uniqueTextures = this.textureCache.size;

    const drawCallsPerMesh = meshCount > 0 ? drawCalls / meshCount : 0;

    let instancingEfficiency = 0;
    if (instancedMeshCount > 0) {
      const totalCapacity = this.instancedMeshCache.reduce((sum, mesh) => sum + mesh.count, 0);
      const maxCapacity = this.instancedMeshCache.reduce((sum, mesh) => {
        const maxCount = (mesh.instanceMatrix as THREE.InstancedBufferAttribute).count;
        return sum + maxCount;
      }, 0);
      instancingEfficiency = maxCapacity > 0 ? totalCapacity / maxCapacity : 0;
    }

    const exceedsThreshold = drawCalls > this.config.drawCallWarningThreshold;
    const thresholdExceededBy = exceedsThreshold
      ? drawCalls - this.config.drawCallWarningThreshold
      : undefined;

    return {
      drawCalls,
      triangles,
      points,
      lines,
      meshCount,
      instancedMeshCount,
      instancedMeshInstances,
      uniqueMaterials,
      uniqueGeometries,
      uniqueTextures,
      drawCallsPerMesh,
      instancingEfficiency,
      exceedsThreshold,
      thresholdExceededBy,
    };
  }

  analyzeOptimizationOpportunities(): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    if (this.isStrategyEnabled(OptimizationStrategy.InstancedMesh)) {
      const instancingOpp = this.analyzeInstancingOpportunities();
      if (instancingOpp) {
        opportunities.push(instancingOpp);
      }
    }

    if (this.isStrategyEnabled(OptimizationStrategy.MaterialSharing)) {
      const materialOpp = this.analyzeMaterialSharingOpportunities();
      if (materialOpp) {
        opportunities.push(materialOpp);
      }
    }

    if (this.isStrategyEnabled(OptimizationStrategy.VisibilityCulling)) {
      const cullingOpp = this.analyzeVisibilityCullingOpportunities();
      if (cullingOpp) {
        opportunities.push(cullingOpp);
      }
    }

    if (this.isStrategyEnabled(OptimizationStrategy.GeometryReuse)) {
      const geometryOpp = this.analyzeGeometryReuseOpportunities();
      if (geometryOpp) {
        opportunities.push(geometryOpp);
      }
    }

    if (this.isStrategyEnabled(OptimizationStrategy.TextureAtlas)) {
      const atlasOpp = this.analyzeTextureAtlasOpportunities();
      if (atlasOpp) {
        opportunities.push(atlasOpp);
      }
    }

    return opportunities.sort(
      (a, b) => b.potentialDrawCallReduction - a.potentialDrawCallReduction,
    );
  }

  private isStrategyEnabled(strategy: OptimizationStrategy): boolean {
    return this.config.enabledStrategies.includes(strategy);
  }

  private analyzeInstancingOpportunities(): OptimizationOpportunity | null {
    let totalReduction = 0;
    let affectedMeshes = 0;

    for (const [geometry, meshes] of this.geometryCache) {
      if (meshes.length >= this.config.instancingMinimumCount) {
        const material = meshes[0].material;
        const sameMaterialMeshes = meshes.filter((mesh) => mesh.material === material);

        if (sameMaterialMeshes.length >= this.config.instancingMinimumCount) {
          totalReduction += sameMaterialMeshes.length - 1;
          affectedMeshes += sameMaterialMeshes.length;
        }
      }
    }

    if (totalReduction === 0) return null;

    return {
      strategy: OptimizationStrategy.InstancedMesh,
      description: `Use InstancedMesh for ${affectedMeshes} meshes with shared geometry and material`,
      potentialDrawCallReduction: totalReduction,
      affectedMeshes,
    };
  }

  private analyzeMaterialSharingOpportunities(): OptimizationOpportunity | null {
    let totalReduction = 0;
    let affectedMeshes = 0;

    for (const [material, meshes] of this.materialCache) {
      if (meshes.length > 1) {
        totalReduction += meshes.length - 1;
        affectedMeshes += meshes.length;
      }
    }

    if (totalReduction === 0) return null;

    return {
      strategy: OptimizationStrategy.MaterialSharing,
      description: `${affectedMeshes} meshes share ${this.materialCache.size} unique materials`,
      potentialDrawCallReduction: totalReduction,
      affectedMeshes,
    };
  }

  private analyzeVisibilityCullingOpportunities(): OptimizationOpportunity | null {
    const cullableMeshes = this.findCullableMeshes();

    if (cullableMeshes.length === 0) return null;

    return {
      strategy: OptimizationStrategy.VisibilityCulling,
      description: `${cullableMeshes.length} meshes with opacity below ${this.config.opacityCullingThreshold} can be culled`,
      potentialDrawCallReduction: cullableMeshes.length,
      affectedMeshes: cullableMeshes.length,
    };
  }

  private analyzeGeometryReuseOpportunities(): OptimizationOpportunity | null {
    let totalReduction = 0;
    let affectedMeshes = 0;

    for (const [geometry, meshes] of this.geometryCache) {
      if (meshes.length > 1) {
        totalReduction += meshes.length - 1;
        affectedMeshes += meshes.length;
      }
    }

    if (totalReduction === 0) return null;

    return {
      strategy: OptimizationStrategy.GeometryReuse,
      description: `${affectedMeshes} meshes use ${this.geometryCache.size} unique geometries`,
      potentialDrawCallReduction: totalReduction,
      affectedMeshes,
    };
  }

  private analyzeTextureAtlasOpportunities(): OptimizationOpportunity | null {
    if (this.textureCache.size < 2) return null;

    const totalReduction = this.textureCache.size - 1;
    const affectedMeshes = Array.from(this.textureCache.values()).reduce(
      (sum, meshes) => sum + meshes.length,
      0,
    );

    return {
      strategy: OptimizationStrategy.TextureAtlas,
      description: `${this.textureCache.size} unique textures can be combined into a texture atlas for ${affectedMeshes} meshes`,
      potentialDrawCallReduction: totalReduction,
      affectedMeshes,
    };
  }

  findCullableMeshes(): THREE.Mesh[] {
    return this.meshCache.filter((mesh) => {
      if (!mesh.visible) return false;

      const material = mesh.material;
      if (!material) return false;

      if (Array.isArray(material)) {
        return material.some(
          (mat) =>
            mat.transparent &&
            mat.opacity !== undefined &&
            mat.opacity < this.config.opacityCullingThreshold,
        );
      }

      return (
        material.transparent &&
        material.opacity !== undefined &&
        material.opacity < this.config.opacityCullingThreshold
      );
    });
  }

  findShareableMaterials(): Map<THREE.Material, THREE.Mesh[]> {
    const shareable = new Map<THREE.Material, THREE.Mesh[]>();

    for (const [material, meshes] of this.materialCache) {
      if (meshes.length > 1) {
        shareable.set(material, [...meshes]);
      }
    }

    return shareable;
  }

  findDuplicateGeometries(): Map<THREE.BufferGeometry, THREE.Mesh[]> {
    const duplicates = new Map<THREE.BufferGeometry, THREE.Mesh[]>();

    for (const [geometry, meshes] of this.geometryCache) {
      if (meshes.length > 1) {
        duplicates.set(geometry, [...meshes]);
      }
    }

    return duplicates;
  }

  getRecommendations(): string[] {
    const opportunities = this.analyzeOptimizationOpportunities();
    const recommendations: string[] = [];

    for (const opp of opportunities) {
      recommendations.push(opp.description);
    }

    const metrics = this.getMetrics();
    if (metrics.exceedsThreshold) {
      recommendations.unshift(
        `⚠️ Draw calls (${metrics.drawCalls}) exceed warning threshold (${this.config.drawCallWarningThreshold})`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('No optimization opportunities found. Good job!');
    }

    return recommendations;
  }

  logMetrics(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const metrics = this.getMetrics();

    console.group('📊 Draw Call Metrics');
    console.log(`Draw Calls: ${metrics.drawCalls}`);
    console.log(`Triangles: ${metrics.triangles.toLocaleString()}`);
    console.log(`Points: ${metrics.points}`);
    console.log(`Lines: ${metrics.lines}`);
    console.log(`Meshes: ${metrics.meshCount}`);
    console.log(
      `Instanced Meshes: ${metrics.instancedMeshCount} (${metrics.instancedMeshInstances} instances)`,
    );
    console.log(`Unique Materials: ${metrics.uniqueMaterials}`);
    console.log(`Unique Geometries: ${metrics.uniqueGeometries}`);
    console.log(`Unique Textures: ${metrics.uniqueTextures}`);
    console.log(`Draw Calls per Mesh: ${metrics.drawCallsPerMesh.toFixed(2)}`);
    console.log(`Instancing Efficiency: ${(metrics.instancingEfficiency * 100).toFixed(1)}%`);
    console.groupEnd();
  }

  logOptimizationOpportunities(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const opportunities = this.analyzeOptimizationOpportunities();

    console.group('🎯 Optimization Opportunities');
    if (opportunities.length === 0) {
      console.log('No optimization opportunities found.');
    } else {
      for (const opp of opportunities) {
        console.log(
          `${opp.strategy}: -${opp.potentialDrawCallReduction} draw calls (${opp.affectedMeshes} meshes)`,
        );
        console.log(`  ${opp.description}`);
      }
    }
    console.groupEnd();
  }

  getOpacityCullingThreshold(): number {
    return this.config.opacityCullingThreshold;
  }

  getDrawCallWarningThreshold(): number {
    return this.config.drawCallWarningThreshold;
  }

  updateRenderer(renderer: THREE.WebGLRenderer): void {
    this.renderer = renderer;
  }

  updateScene(scene: THREE.Scene): void {
    this.scene = scene;
    this.refreshCache();
  }
}
