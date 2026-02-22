# Task 006: Hover Detection Implementation

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 2 - Work Card Instancing

## BDD Scenario Reference

- Feature 1: Work Card Hover Interactions (Scenarios 1, 3, 5, 6, 8)
- Feature 3: Navigation Interactions (Scenarios 5, 6, 7)

## Description

Implement CPU-based hover detection for the instanced work cards. Since we only have 5 cards, a simple distance check in useFrame is efficient and provides <16ms response time.

## Files to Create/Modify

### New Files
- `hooks/useInstancedHover.ts` - Hook for instanced mesh hover detection
- `tests/hooks/useInstancedHover.test.ts` - Tests for hover detection hook

### Modified Files
- `components/WebXR/WorkCardsInstanced/index.tsx` - Integrate hover detection

## Implementation Requirements

### useInstancedHover Hook

Create hook that:
- Accepts `instancePositions: THREE.Vector3[]` and `threshold?: number`
- Tracks current hovered instance index
- Updates `hoveredIndex` state using distance calculation in useFrame
- Returns `{ hoveredIndex, setHoveredIndex }`

### Distance Calculation Algorithm
- Get current pointer/gaze position from Three.js
- Calculate distance from pointer to each instance position
- Find closest instance within threshold (default 2.5)
- Return index of closest instance, or -1 if none within threshold

### Performance Optimization
- Calculate distances in useFrame loop (single pass per frame)
- Use squared distance to avoid sqrt operations when comparing
- Reuse temporary vector object to avoid allocations
- Update result only when hoveredIndex changes

### Multi-Device Support
- Works with mouse pointer (desktop)
- Works with Quest controller raycasting
- Works with Vision Pro gaze tracking

### Integration with Shader
- Update `uHoverIndex` uniform when hoveredIndex changes
- Shader uses this uniform to render hover effect

## Verification Steps

### Unit Tests
1. Run `npm test tests/hooks/useInstancedHover.test.ts`
2. Verify hook initializes with no hover (-1)
3. Verify hoveredIndex updates when pointer is near instance
4. Verify hoveredIndex updates when moving between instances
5. Verify hoveredIndex resets to -1 when pointer moves away
6. Verify threshold parameter affects hover detection

### Integration Tests
1. Run `npm test tests/integration/webxr/hoverDetection.test.ts`
2. Verify hook works with actual Three.js pointer
3. Verify uHoverIndex uniform is updated correctly
4. Verify hover response time is <16ms

### Performance Tests
1. Benchmark hover detection for 5 instances
2. Verify calculation takes <0.1ms per frame
3. Verify no allocations in useFrame loop

### Device Tests
1. Test hover detection with mouse (desktop)
2. Test hover detection with Quest controller
3. Test hover detection with Vision Pro gaze

## Acceptance Criteria

- Hover detection responds within 16ms
- HoveredIndex updates correctly for all instances
- Hover detection works across mouse, controller, and gaze
- No allocations occur in useFrame loop
- Performance target <0.1ms per frame
- uHoverIndex uniform is updated when hoveredIndex changes
- Threshold parameter affects detection radius correctly

## Dependencies

**depends-on**: Task 004 (for component integration)

## Exit Criteria

- Hover detection passes all tests
- Performance benchmarks meet targets
- Cross-device support verified
- Integration with shader works correctly