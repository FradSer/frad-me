# Task 013: Verify Performance Targets

**Priority**: P0
**Estimated Effort**: 0.5 day
**Phase**: 6 - Feature 5: Performance Monitoring

## BDD Scenario

```gherkin
Scenario: Instancing verification
  Then work cards should use InstancedMesh
  Then total draw calls should be under 50
  And draw call reduction should be at least 60%

Scenario: Production monitoring
  Then FPS should be sampled (not continuous)
  Then errors should be sent to error tracking
  Then performance data should be aggregated
```

## Description

Verify that performance targets from the design are met by the implementation.

## Verification

### tests/unit/webxr/performanceTargets.test.ts

```typescript
describe('Performance Targets', () => {
  it('uses InstancedMesh for work cards', () => {
    // Check component uses InstancedMesh
  });

  it('achieves under 50 draw calls', () => {
    // Render work view
    // Count draw calls
    // Assert < 50
  });

  it('achieves 60%+ draw call reduction', () => {
    // Baseline: individual cards ~75-100
    // Current: instanced < 50
    // Assert reduction >= 60%
  });

  it('samples FPS in production', () => {
    // Verify FPS not logged continuously
    // Verify periodic sampling
  });

  it('sends errors to tracking', () => {
    // Verify error boundary
    // Verify error tracking integration
  });
});
```

## Performance Validation

Run performance benchmarks:

```bash
# Draw calls
pnpm test:e2e tests/e2e/webxr/draw-calls.spec.ts

# FPS on desktop (headless)
pnpm test:e2e tests/e2e/webxr/fps.spec.ts
```

## Files to Verify

- `components/WebXR/WorkCardsInstanced/index.tsx` - InstancedMesh usage
- `utils/webxr/performanceMonitor.ts` - FPS tracking
- `utils/webxr/drawCallOptimizer.ts` - draw call reduction

## Verification Steps

1. Run `pnpm test tests/unit/webxr/performanceTargets.test.ts`
2. Run E2E draw call test
3. Verify all targets met

## Acceptance Criteria

- Draw calls < 50
- 60%+ reduction from baseline
- InstancedMesh used for cards

## Dependencies

**depends-on**: [Task 012: Performance benchmark tests](./task-012-performance-benchmark-tests.md)
