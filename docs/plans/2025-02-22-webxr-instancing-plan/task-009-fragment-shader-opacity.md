# Task 009: Fragment Shader Opacity Transitions

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 3 - GPU Animation

## BDD Scenario Reference

- Feature 2: View Transitions (Scenarios 1, 2, 5, 7)
- Feature 1: Work Card Hover Interactions (Scenario 5 - fade out)

## Description

Implement GPU-based opacity transitions in the fragment shader. This handles fading cards in/out during view transitions and fading out when hovered cards are no longer hovered.

## Files to Create/Modify

### New Files
- `utils/webxr/shaders/instanceAnimation.frag` (Update) - Add opacity transition logic
- `tests/unit/webxr/fragmentShader.test.ts` - Tests for fragment shader logic

### Modified Files
- None

## Implementation Requirements

### Fragment Shader Opacity Transitions

Add opacity transition logic to fragment shader:

#### View Mode Opacity
Mix opacity based on uViewMode:
```glsl
float viewOpacity = mix(0.0, 0.9, uViewMode);
```

#### Hover Fade Effect
Add slight fade when unhovering for smooth transition:
```glsl
float hoverFade = mix(1.0, 0.95, 1.0 - vHovered);
float finalOpacity = viewOpacity * hoverFade;
```

#### Texture Sampling
Sample texture atlas with adjusted UV:
```glsl
vec4 texColor = texture2D(uTextureAtlas, vUv);
```

#### Hover Glow Effect
Apply glow color when hovered:
```glsl
vec3 glowColor = vec3(0.3, 0.27, 0.9);
vec3 finalColor = mix(texColor.rgb, glowColor, vHovered * 0.3);
```

#### Final Output
Combine color and opacity:
```glsl
gl_FragColor = vec4(finalColor, finalOpacity * texColor.a);
```

#### Alpha Discard
Discard fragments with very low alpha to avoid rendering invisible objects:
```glsl
if (gl_FragColor.a < 0.01) discard;
```

### Opacity Configuration
Expose configuration for opacity tuning:
- Home view opacity: 0.0 (invisible)
- Work view opacity: 0.9 (visible)
- Hover fade factor: 0.95 (95% when unhovered)
- Glow intensity: 0.3 (30% blend)
- Glow color: #4B46E5 (indigo-500)
- Discard threshold: 0.01 (don't render if alpha below 1%)

### Smooth Transitions
Opacities transition smoothly because:
- uViewMode is updated gradually by CPU (via useSimpleLerp)
- GPU just samples the current uViewMode value
- Result is smooth, linear interpolation on GPU

## Verification Steps

### Unit Tests
1. Run `npm test tests/unit/webxr/fragmentShader.test.ts`
2. Verify view opacity mixes correctly based on uViewMode
3. Verify hover fade effect applies correctly
4. Verify glow color mixes correctly
5. Verify alpha discard works below threshold
6. Verify texture sampling with adjusted UV

### Integration Tests
1. Run `npm test tests/integration/webxr/opacityTransitions.test.ts`
2. Verify cards fade in when switching to work view
3. Verify cards fade out when switching to home view
4. Verify hover glow appears when card hovered
5. Verify no flickering during transitions
6. Verify invisible cards are not rendered

### Visual Tests
1. Verify cards fade in smoothly during view transition
2. Verify cards fade out smoothly during view transition
3. Verify glow effect appears on hover
4. Verify no visual artifacts during transitions
5. Verify invisible cards don't appear in scene
6. Verify alpha blend is correct (no hard edges)

### Performance Tests
1. Verify opacity transitions add minimal GPU cost
2. Verify alpha discard reduces render load
3. Verify no CPU overhead for opacity transitions

## Acceptance Criteria

- Opacity transitions smoothly based on uViewMode
- Cards are invisible (opacity 0.0) in home view
- Cards are visible (opacity 0.9) in work view
- Hover glow effect appears when card hovered
- Hover fade effect creates smooth transition
- Alpha discard prevents rendering invisible cards
- No flickering during transitions
- No visual artifacts (hard edges, bleeding)
- Invisible cards are not rendered (performance optimization)
- GPU-based opacity with no CPU overhead

## Dependencies

**depends-on**: Task 001 (shader infrastructure), Task 004 (component integration)

## Exit Criteria

- Opacity transitions pass all tests
- Visual quality verified
- No flickering or artifacts
- Performance benchmarks meet targets
- Alpha discard verified working