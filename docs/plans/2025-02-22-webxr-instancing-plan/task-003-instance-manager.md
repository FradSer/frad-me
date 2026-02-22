# Task 003: Instanced Mesh Manager

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 1 - Foundation

## BDD Scenario Reference

- Feature 1: Work Card Hover Interactions (Scenarios 1-8)
- Feature 5: Performance Monitoring (Scenario 9)

## Description

Create a utility manager for InstancedMesh operations. This handles setting up instance attributes, updating instance matrices, and managing the lifecycle of instanced mesh objects.

## Files to Create/Modify

### New Files
- `utils/webxr/instanceManager.ts` - Instanced mesh management utility
- `tests/unit/webxr/instanceManager.test.ts` - Unit tests for instance manager

### Modified Files
- None

## Implementation Requirements

### Instance Manager (`utils/webxr/instanceManager.ts`)

Create utility with following functions:

#### `createInstancedMesh(geometry: THREE.BufferGeometry, material: THREE.Material, count: number): THREE.InstancedMesh`
- Creates new InstancedMesh with pre-allocated capacity
- Sets up instance matrix buffer
- Returns configured mesh

#### `setupInstanceAttributes(mesh: THREE.InstancedMesh, config: InstanceAttributeConfig): void`
- Adds custom attributes to mesh geometry:
  - `aAnimationOffset` (float) - per-instance animation phase
  - `aUvOffset` (vec2) - texture atlas UV coordinates
  - `aBaseY` (float) - base Y position for home view
  - `aHoverY` (float) - hover Y position for work view

#### `updateInstanceAt(mesh: THREE.InstancedMesh, index: number, position: THREE.Vector3, scale: number): void`
- Updates instance matrix at given index
- Uses temporary THREE.Object3D to avoid allocations
- Marks matrix as needing update

#### `updateAllInstances(mesh: THREE.InstancedMesh, positions: THREE.Vector3[], scales: number[]): void`
- Updates all instance matrices in batch
- Optimizes for performance with single needsUpdate flag

#### `disposeInstancedMesh(mesh: THREE.InstancedMesh): void`
- Properly disposes mesh and its resources
- Disposes geometry and material if unique
- Prevents memory leaks

### Performance Optimizations
- Reuse temporary THREE.Object3D object across calls
- Batch matrix updates when updating multiple instances
- Set instance matrix needsUpdate flag only once per frame

## Verification Steps

### Unit Tests
1. Run `npm test tests/unit/webxr/instanceManager.test.ts`
2. Verify `createInstancedMesh` returns valid mesh
3. Verify instance attributes are set correctly
4. Verify `updateInstanceAt` updates matrix correctly
5. Verify `updateAllInstances` updates all matrices efficiently
6. Verify `disposeInstancedMesh` properly cleans up resources
7. Verify temporary object is reused (no allocations in loop)

### Performance Tests
1. Benchmark `updateAllInstances` for 10 instances
2. Verify matrix updates take <1ms for 10 instances
3. Verify no allocations occur during update loops

## Acceptance Criteria

- Instanced mesh is created with correct capacity
- Instance attributes are accessible and updatable
- Matrix updates are performed efficiently without allocations
- Disposal properly cleans up all resources
- Performance meets targets (<1ms for 10 instances)
- No memory leaks detected after repeated create/dispose cycles

## Dependencies

**depends-on**: None

## Exit Criteria

- Instance manager passes all unit tests
- Performance benchmarks meet targets
- Utility handles edge cases (zero instances, invalid index)