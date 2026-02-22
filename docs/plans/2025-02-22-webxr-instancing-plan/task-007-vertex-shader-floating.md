# Task 007: Vertex Shader Floating Animation

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 3 - GPU Animation

## BDD Scenario Reference

- Feature 1: Work Card Hover Interactions (Scenario 2 - spring physics)
- Feature 2: View Transitions (Scenario 5 - smooth opacity)

## Description

Implement GPU-based floating animation in the vertex shader. This replaces CPU-based lerp calculations with sin-based animation running entirely on the GPU.

## Files to Create/Modify

### New Files
- `utils/webxr/shaders/instanceAnimation.vert` (Update) - Add floating animation logic
- `tests/unit/webxr/vertexShader.test.ts` - Tests for vertex shader logic

### Modified Files
- `utils/webxr/shaders/instanceAnimation.frag` - May need updates for floating effect

## Implementation Requirements

### Vertex Shader Floating Animation

Add floating animation logic to vertex shader:

#### Floating Animation Formula
```glsl
float floatOffset = sin(uTime * 2.0 + aAnimationOffset) * 0.05;
```
- Uses `uTime` uniform for continuous animation
- Uses `aAnimationOffset` attribute for per-instance phase
- Multiplier `0.05` controls floating amplitude (0.05 units)
- Multiplier `2.0` controls floating speed

#### Position Application
Apply floating offset to Y position:
```glsl
vec3 pos = position;
pos.y += viewY + floatOffset;
```

#### View Mode Integration
Integrate with view transition:
```glsl
float viewY = mix(aBaseY, aHoverY, uViewMode);
```

#### Reduced Motion Support
Add reduced motion support:
```glsl
#ifdef REDUCED_MOTION
float floatOffset = 0.0;
#else
float floatOffset = sin(uTime * 2.0 + aAnimationOffset) * 0.05;
#endif
```

### Animation Configuration
Expose configuration for animation tuning:
- Floating amplitude: 0.05 units
- Floating speed: 2.0 rad/s
- Animation phases: 0.5 rad per card

## Verification Steps

### Unit Tests
1. Run `npm test tests/unit/webxr/vertexShader.test.ts`
2. Verify floating formula produces correct output
3. Verify animation phases create staggered effect
4. Verify viewY is correctly interpolated

### Integration Tests
1. Run `npm test tests/integration/webxr/floatingAnimation.test.ts`
2. Verify floating animation renders in actual scene
3. Verify cards float at different phases
4. Verify floating stops when switching views (if needed)

### Visual Tests
1. Verify cards float smoothly with sin-based motion
2. Verify floating amplitude is appropriate (not too much)
3. Verify animation phases create staggered wave effect
4. Verify reduced motion preference disables floating

### Performance Tests
1. Verify floating animation adds minimal GPU cost
2. Verify no CPU overhead for floating animation

## Acceptance Criteria

- Floating animation uses sin function on GPU
- Animation phases create staggered effect (0.5 rad per card)
- Floating amplitude is 0.05 units (appropriate for card size)
- Floating speed is 2.0 rad/s (smooth, not too fast)
- Reduced motion preference disables floating
- Floating animation integrates with view transitions
- No CPU overhead for floating animation
- Visual quality matches or exceeds baseline

## Dependencies

**depends-on**: Task 001 (shader infrastructure), Task 005 (animation offsets)

## Exit Criteria

- Floating animation passes all tests
- Visual quality verified across all cards
- Reduced motion support working
- Performance benchmarks meet targets