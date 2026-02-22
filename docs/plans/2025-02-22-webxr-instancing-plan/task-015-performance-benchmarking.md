# Task 015: Performance Benchmarking

**Priority**: P0
**Estimated Effort**: 3 days
**Phase**: 6 - Testing & Validation

## BDD Scenario Reference

- Feature 5: Performance Monitoring (Scenario 6 - device-specific targets)

## Description

Run performance benchmarks on target devices to verify optimization goals are met. This includes measuring FPS, draw calls, response times, and comparing against baseline measurements.

## Files to Create/Modify

### New Files
- `tests/performance/webxr-benchmarks.ts` - Performance benchmark tests
- `utils/webxr/benchmarkRunner.ts` - Benchmark execution utility

### Modified Files
- None

## Implementation Requirements

### Benchmark Tests

Create benchmarks for:

#### Frame Rate Tests
- `shouldMaintain60FPSOnVisionPro` - Measure FPS over 10 seconds
- `shouldMaintain45FPSOnQuest` - Measure FPS over 10 seconds
- `shouldMaintain30FPSOnDesktop` - Measure FPS over 10 seconds

#### Draw Call Tests
- `shouldHaveUnder50DrawCallsInWorkView` - Count draw calls
- `shouldHaveUnder30DrawCallsInHomeView` - Count draw calls
- `shouldReduceDrawCallsBy60Percent` - Compare vs baseline

#### Response Time Tests
- `shouldRespondToHoverWithin16ms` - Measure hover response time
- `shouldCompleteViewTransitionWithin500ms` - Measure transition time

#### Memory Tests
- `shouldUseUnder150MBGPUMemory` - Estimate GPU memory
- `shouldNotHaveMemoryLeaks` - Test repeated create/dispose cycles

#### Quality Tests
- `shouldMaintainVisualQuality` - SSIM comparison vs baseline
- `shouldHaveNoVisualArtifacts` - Manual inspection for glitches

### Benchmark Runner

Create utility that:
- Starts benchmark execution
- Measures metrics over specified duration
- Collects and aggregates results
- Compares against targets and baseline
- Generates performance report

### Measurement Methods

#### FPS Measurement
- Use `performance.now()` for timing
- Count frames over duration
- Calculate average FPS
- Track minimum FPS

#### Draw Call Measurement
- Use `renderer.info.render.calls`
- Sample over time (not every frame)
- Report average and peak

#### Response Time Measurement
- Time between event trigger and visual update
- Use Performance API
- Report p50, p95, p99 latencies

#### Memory Measurement
- Use `renderer.info.memory`
- Use Chrome DevTools Memory Profiler
- Report current and peak usage

### Target Devices
- **Vision Pro**: Target 60 FPS
- **Quest 3**: Target 45 FPS
- **Desktop**: Target 30 FPS
- **Baseline**: Current implementation for comparison

## Verification Steps

### Benchmark Execution
1. Run `npm test tests/performance/webxr-benchmarks.ts`
2. Verify all performance tests pass
3. Verify all targets are met

### Device Testing
1. Test on Vision Pro (if available)
2. Test on Quest 3 (if available)
3. Test on desktop browser
4. Compare results across devices

### Baseline Comparison
1. Measure baseline FPS before optimization
2. Measure optimized FPS
3. Verify improvement meets targets

### Visual Quality
1. Take screenshots of key states
2. Compare with baseline screenshots
3. Calculate SSIM (structural similarity index)
4. Verify SSIM ≥ 0.95

## Acceptance Criteria

- Frame rate ≥ 60 FPS on Vision Pro
- Frame rate ≥ 45 FPS on Quest
- Frame rate ≥ 30 FPS on desktop
- Draw calls ≤ 50 in work view
- Draw calls ≤ 30 in home view
- Draw call reduction ≥ 60% vs baseline
- Hover response time < 16ms
- View transition time < 500ms
- GPU memory usage ≤ 150MB
- No memory leaks detected
- SSIM ≥ 0.95 vs baseline
- No visual artifacts (glitches, flickering)
- Performance tests pass

## Dependencies

**depends-on**: All previous tasks (optimized code to benchmark)

## Exit Criteria

- All performance tests pass
- All targets met
- Baseline comparison shows improvement
- Visual quality verified