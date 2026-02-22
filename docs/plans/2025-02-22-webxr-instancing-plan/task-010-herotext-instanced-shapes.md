# Task 010: HeroText Instanced Shapes

**Priority**: P1
**Estimated Effort**: 2 days
**Phase**: 4 - Text & Hero

## BDD Scenario Reference

- Feature 2: View Transitions (Scenario 1 - Hero Text fade out)
- (No direct BDD scenarios, optimization task)

## Description

Optimize HeroText component by instancing repeated geometry shapes (box, triangle, sphere). Currently each shape is a separate mesh, which can be optimized using InstancedMesh.

## Files to Create/Modify

### New Files
- `components/WebXR/HeroText/ShapesInstanced.tsx` - Instanced shapes component
- `tests/components/WebXR/ShapesInstanced.test.tsx` - Tests for instanced shapes

### Modified Files
- `components/WebXR/HeroText.tsx` - Replace individual shape meshes with instanced version
- `utils/webxr/migrationHelper.ts` - Add shape data migration

## Implementation Requirements

### ShapesInstanced Component

Create component that:
- Renders all interactive shapes (box, triangle, sphere) using InstancedMesh
- Uses separate InstancedMesh for each geometry type (3 total)
- Applies rotation animations via instance matrices
- Handles hover states for interactivity
- Maintains existing behavior (rotation, hover effects, click)

### Geometry Types
1. **Box**: `boxGeometry args={[3, 1, 1]}`
2. **Triangle**: `coneGeometry args={[1, 1.4, 3, 1]}`
3. **Sphere**: `sphereGeometry args={[0.65, 16, 16]}`

### Instance Data
For each shape type:
- Map shapes with same geometry to single InstancedMesh
- Set position, rotation, scale per instance
- Maintain existing scale factors (triangle: 1.5x, sphere: 1.5x)
- Maintain existing rotation speeds and axes

### Animation Approach
- Rotation animation still done via CPU (useFrame) for simplicity
- Update instance matrices for rotation each frame
- Significant benefit: 3 draw calls instead of many (if multiple instances)

### Interaction Handling
- Maintain existing hover and click behavior
- Raycasting works with InstancedMesh (instanceId available)
- Update instance-specific state when hovered/clicked

### Reduced Motion Support
- Respect reduced motion preference (from heroAnimationStates)
- Simplify or disable rotation animations

## Verification Steps

### Component Tests
1. Run `npm test tests/components/WebXR/ShapesInstanced.test.tsx`
2. Verify all shapes render correctly
3. Verify positions match original HeroText
4. Verify rotation animations work
5. Verify hover states work per shape
6. Verify click states work per shape
7. Verify reduced motion support works

### Integration Tests
1. Run `npm test tests/integration/webxr/shapesInstanced.test.ts`
2. Verify integration with HeroText component
3. Verify view transitions still work
4. Verify no conflicts with other components

### Visual Tests
1. Verify shapes appear in correct positions
2. Verify shapes rotate correctly
3. Verify hover effects match original
4. Verify reduced motion simplifies animations

### Performance Tests
1. Benchmark draw calls: verify reduction
2. Benchmark frame rate: verify improvement or no regression
3. Verify memory usage: verify no increase

## Acceptance Criteria

- All interactive shapes use InstancedMesh
- Shapes render in same positions as original
- Rotation animations work correctly
- Hover effects work per shape
- Click effects work per shape
- Reduced motion support working
- Draw calls reduced (benchmark)
- No visual degradation vs original
- No memory leaks detected
- Performance meets or exceeds baseline

## Dependencies

**depends-on**: Task 003 (instance manager)

## Exit Criteria

- Instanced shapes pass all tests
- Visual quality matches or exceeds baseline
- Performance verified (draw call reduction)