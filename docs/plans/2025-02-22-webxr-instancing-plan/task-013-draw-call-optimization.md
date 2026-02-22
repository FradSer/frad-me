# Task 013: Draw Call Optimization

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 5 - Performance

## BDD Scenario Reference

- Feature 5: Performance Monitoring (Scenarios 3, 9)
- Feature 2: View Transitions (Scenario 7 - frame rate maintained)

## Description

Optimize draw calls by ensuring proper instancing, material sharing, and visibility culling. This includes verifying that the instanced mesh approach actually reduces draw calls and that invisible objects are not rendered.

## Files to Create/Modify

### New Files
- `utils/webxr/drawCallOptimizer.ts` - Draw call optimization utilities
- `tests/unit/webxr/drawCallOptimizer.test.ts` - Tests for draw call optimizer

### Modified Files
- `components/WebXR/WorkCardsInstanced/index.tsx` - Ensure optimal draw calls
- `components/WebXR/HeroText.tsx` - Apply optimizations
- `components/WebXR/Stars/index.tsx` - Verify star rendering

## Implementation Requirements

### Draw Call Optimization Utility

Create utility that:
- Counts current draw calls via `renderer.info.render.calls`
- Identifies opportunities for optimization
- Provides recommendations for reducing draw calls
- Logs draw call metrics in development

### Optimization Strategies

#### 1. Verify InstancedMesh Usage
- WorkCardsInstanced should use single InstancedMesh
- Verify count is set to works.length (or slightly higher)
- Verify instance matrix needsUpdate is set only when needed

#### 2. Material Sharing
- Share materials across instances where possible
- Use same material type for similar objects
- Reuse material references instead of creating new ones

#### 3. Visibility Culling
- Set `visible = false` when opacity < 0.01
- Skip rendering when visible = false
- Skip raycasting when visible = false
- Resume rendering when opacity increases

#### 4. Geometry Reuse
- Reuse geometry objects (planeGeometry)
- Don't create new geometry for each instance
- Use `useMemo` to cache geometry

#### 5. Texture Atlas
- Verify texture atlas is used (single texture bind)
- Verify all cards use same texture
- Verify UV offsets are correct

### Optimization Targets
- Work Cards: 1 draw call (all 5 cards)
- HeroText Shapes: 3 draw calls (one per geometry type)
- Navigation: 1 draw call
- Stars: 1 draw call
- Total: ~6 draw calls in work view

### Verification
- Count draw calls in work view
- Count draw calls in home view
- Compare before/after metrics
- Verify reduction meets target (<50 total)

## Verification Steps

### Unit Tests
1. Run `npm test tests/unit/webxr/drawCallOptimizer.test.ts`
2. Verify draw call counting works correctly
3. Verify visibility culling logic works
4. Verify optimization recommendations are valid

### Integration Tests
1. Run `npm test tests/integration/webxr/drawCallOptimization.test.ts`
2. Verify total draw calls in work view < 50
3. Verify total draw calls in home view < 30
4. Verify invisible cards are not rendered
5. Verify invisible cards don't receive raycasting

### Performance Tests
1. Benchmark draw calls: verify <50 in work view
2. Benchmark draw calls: verify <30 in home view
3. Benchmark draw call reduction: verify 60%+ vs baseline
4. Verify no draw call regressions

### Visual Tests
1. Verify no visual artifacts from culling
2. Verify cards appear smoothly when becoming visible
3. Verify no flickering during transitions
4. Verify proper sorting (depth write for transparent materials)

## Acceptance Criteria

- Total draw calls in work view < 50
- Total draw calls in home view < 30
- Draw call reduction ≥ 60% vs baseline (~75 → ~30)
- Invisible objects are not rendered
- Invisible objects don't receive raycasting
- Visibility culling works correctly
- Materials are shared where possible
- Geometry is reused
- Texture atlas is used
- No visual artifacts from optimizations
- No regressions in visual quality

## Dependencies

**depends-on**: Task 004 (WorkCardsInstanced), Task 010 (HeroText shapes)

## Exit Criteria

- Draw call optimizer passes all tests
- Draw call targets verified (<50 work view, <30 home view)
- 60%+ reduction verified
- No visual artifacts
- No performance regressions