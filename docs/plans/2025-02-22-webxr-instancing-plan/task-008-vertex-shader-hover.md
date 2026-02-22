# Task 008: Vertex Shader Hover Effect

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 3 - GPU Animation

## BDD Scenario Reference

- Feature 1: Work Card Hover Interactions (Scenarios 1-3, 5)
- Feature 1: Work Card Hover Interactions (Scenario 7 - reduced motion)

## Description

Implement GPU-based hover effect in the vertex shader. This uses the uHoverIndex uniform to determine which instance is hovered and applies scale, position, and glow transformations.

## Files to Create/Modify

### New Files
- `utils/webxr/shaders/instanceAnimation.vert` (Update) - Add hover effect logic
- `tests/unit/webxr/vertexShader.test.ts` (Update) - Add hover effect tests

### Modified Files
- `utils/webxr/shaders/instanceAnimation.frag` - Add glow effect for hover
- `hooks/useInstancedHover.ts` - Update to provide hover state data

## Implementation Requirements

### Vertex Shader Hover Effect

Add hover effect logic to vertex shader:

#### Hover Detection
Use step function to determine if current instance is hovered:
```glsl
float isHovered = step(float(gl_InstanceID) - 0.5, float(uHoverIndex)) *
                 step(float(uHoverIndex) - 0.5, float(gl_InstanceID));
```

#### Hover Scale
Apply scale increase when hovered:
```glsl
#ifdef REDUCED_MOTION
float hoverScale = isHovered ? 1.05 : 1.0;
#else
float hoverScale = isHovered ? 1.1 : 1.0;
#endif
pos *= hoverScale;
```

#### Hover Position
Move hovered instance forward and slightly up:
```glsl
#ifdef REDUCED_MOTION
float hoverZ = isHovered ? 0.2 : 0.0;
float hoverY = isHovered ? 0.1 : 0.0;
#else
float hoverZ = isHovered ? 0.5 : 0.0;
float hoverY = isHovered ? 0.3 : 0.0;
#endif
pos.z += hoverZ;
pos.y += hoverY;
```

#### Varying Output
Pass hover state to fragment shader:
```glsl
vHovered = isHovered;
```

### Reduced Motion Support
- Reduced hover scale: 1.05x instead of 1.1x
- Reduced hover movement: 0.2/0.1 units instead of 0.5/0.3
- Can use linear interpolation instead of instant step

### Hover Configuration
Expose configuration for hover tuning:
- Normal scale: 1.0
- Hover scale: 1.1x (normal), 1.05x (reduced)
- Hover Z offset: 0.5 units (normal), 0.2 units (reduced)
- Hover Y offset: 0.3 units (normal), 0.1 units (reduced)

## Verification Steps

### Unit Tests
1. Run `npm test tests/unit/webxr/vertexShader.test.ts`
2. Verify hover detection logic identifies correct instance
3. Verify hover scale is applied correctly
4. Verify hover position offsets are applied correctly
5. Verify reduced motion uses different values

### Integration Tests
1. Run `npm test tests/integration/webxr/hoverEffect.test.ts`
2. Verify hover effect renders when card is hovered
3. Verify hover effect disappears when card unhovered
4. Verify multiple cards can be hovered sequentially

### Visual Tests
1. Verify hovered card scales to 1.1x
2. Verify hovered card moves forward and up
3. Verify hover transition is smooth (instant on GPU)
4. Verify reduced motion uses smaller scale and movement
5. Verify glow effect appears on hover

### Performance Tests
1. Verify hover effect adds minimal GPU cost
2. Verify no CPU overhead for hover effect
3. Verify <16ms response time for hover

### Device Tests
1. Test hover effect with mouse (desktop)
2. Test hover effect with Quest controller
3. Test hover effect with Vision Pro gaze

## Acceptance Criteria

- Hover detection identifies correct instance using uHoverIndex
- Hovered card scales to 1.1x (1.05x with reduced motion)
- Hovered card moves forward 0.5 units (0.2 with reduced motion)
- Hovered card moves up 0.3 units (0.1 with reduced motion)
- Hover state is passed to fragment shader for glow effect
- Hover transition is instant on GPU
- Hover response time <16ms
- Reduced motion preference uses different values
- Cross-device support verified

## Dependencies

**depends-on**: Task 001 (shader infrastructure), Task 006 (hover detection)

## Exit Criteria

- Hover effect passes all tests
- Visual quality verified
- Reduced motion support working
- Performance benchmarks meet targets
- Cross-device support verified