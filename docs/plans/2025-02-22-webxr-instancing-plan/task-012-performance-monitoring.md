# Task 012: Performance Monitoring

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 5 - Performance

## BDD Scenario Reference

- Feature 5: Performance Monitoring (All Scenarios 1-10)

## Description

Implement comprehensive performance monitoring for the WebXR experience. This includes FPS tracking, draw call counting, memory monitoring, and quality adaptation based on performance metrics.

## Files to Create/Modify

### New Files
- `utils/webxr/performanceMonitor.ts` - Performance monitoring utility
- `contexts/WebXR/PerformanceContext.tsx` - Performance context provider
- `tests/unit/webxr/performanceMonitor.test.ts` - Tests for performance monitor

### Modified Files
- `components/WebXR/WebXRCanvas.tsx` - Integrate performance monitoring
- `components/WebXR/WorkCardsInstanced/index.tsx` - Update performance targets

## Implementation Requirements

### Performance Monitor Utility

Create utility that:
- Tracks FPS using requestAnimationFrame timestamps
- Counts draw calls via `renderer.info.render.calls`
- Estimates GPU memory usage via `renderer.info.memory`
- Logs performance metrics in development
- Provides quality level adaptation (High/Normal/Reduced)

### Performance Metrics
Track the following metrics:
- **FPS**: Current and average frame rate
- **Draw Calls**: Total draw calls per frame
- **Triangles**: Total triangles rendered
- **Memory**: Estimated GPU memory usage
- **Frame Time**: Time per frame in ms

### Quality Levels
Define quality levels based on FPS:
```typescript
enum QualityLevel {
  High = 60,      // FPS >= 60
  Normal = 45,    // 30 <= FPS < 50
  Reduced = 30    // FPS < 30
}
```

### Adaptation Logic
When FPS drops below threshold:
- Increase animation speed by 50%
- Increase spring tension by 50%
- Reduce shadow quality
- Disable non-essential features

### Performance Context
Create context that provides:
- `fps`: Current FPS
- `qualityLevel`: Current quality level
- `drawCalls`: Current draw call count
- `memoryUsage`: Current memory usage
- `metrics`: Full metrics object

### Integration Points
- WebXRCanvas: Initialize and update performance monitor
- WorkCardsInstanced: Read quality level and adapt
- All WebXR components: Access performance context

### Development Logging
- Log FPS every second in development
- Log draw calls when exceeding threshold
- Log memory warnings when approaching limit
- Log quality level changes

### Production Sampling
- Sample FPS (not continuous) in production
- Aggregate metrics and send to analytics
- Only track anonymized performance data

## Verification Steps

### Unit Tests
1. Run `npm test tests/unit/webxr/performanceMonitor.test.ts`
2. Verify FPS tracking works correctly
3. Verify draw call counting works
4. Verify memory estimation works
5. Verify quality level adaptation logic

### Integration Tests
1. Run `npm test tests/integration/webxr/performanceMonitoring.test.ts`
2. Verify context provides correct metrics
3. Verify components receive quality updates
4. Verify adaptation logic triggers correctly

### Performance Tests
1. Verify FPS tracking adds minimal overhead (<1%)
2. Verify draw call counting is accurate
3. Verify quality adaptation works on simulated FPS drops

### Device Tests
1. Test monitoring on Vision Pro (target 60 FPS)
2. Test monitoring on Quest (target 45 FPS)
3. Test monitoring on desktop (target 30 FPS)

## Acceptance Criteria

- FPS is tracked continuously and logged in development
- Draw calls are counted and logged in development
- GPU memory usage is estimated
- Quality level adapts based on FPS
- Animation speed increases when quality reduced
- Spring tension increases when quality reduced
- Performance context provides metrics to components
- Components can read and adapt to quality level
- Production sampling sends aggregated metrics
- Monitoring adds minimal overhead (<1% FPS)
- Cross-device targets verified

## Dependencies

**depends-on**: None

## Exit Criteria

- Performance monitor passes all tests
- Overhead verified minimal
- Cross-device support verified
- Quality adaptation verified