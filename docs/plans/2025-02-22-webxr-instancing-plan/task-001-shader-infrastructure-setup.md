# Task 001: Shader Infrastructure Setup

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 1 - Foundation

## BDD Scenario Reference

- Feature 1: Work Card Hover Interactions (Scenarios 1-8)
- Feature 2: View Transitions (Scenarios 1-10)

## Description

Set up the foundational shader infrastructure for GPU-based animations. This includes creating shader file structure, shader loader utilities, and type definitions for shader uniforms and attributes.

## Files to Create/Modify

### New Files
- `utils/webxr/shaders/instanceAnimation.vert` - Vertex shader for floating/hover animations
- `utils/webxr/shaders/instanceAnimation.frag` - Fragment shader for opacity/glow effects
- `utils/webxr/shaders/shaderTypes.ts` - TypeScript types for shader uniforms and attributes
- `utils/webxr/shaders/shaderLoader.ts` - Utility to load and compile shaders

### Modified Files
- None

## Implementation Requirements

### Shader Types (`utils/webxr/shaders/shaderTypes.ts`)
Create TypeScript interfaces for:
- `ShaderUniforms` - uTime, uViewMode, uHoverIndex, uTextureAtlas
- `ShaderAttributes` - aAnimationOffset, aUvOffset, aBaseY, aHoverY
- `ShaderVaryings` - vUv, vHovered, vInstanceIndex

### Shader Loader (`utils/webxr/shaders/shaderLoader.ts`)
Create utility that:
- Loads vertex and fragment shader files as strings
- Compiles shaders using THREE.ShaderMaterial
- Returns configured ShaderMaterial with uniforms and attributes

### Vertex Shader (`utils/webxr/shaders/instanceAnimation.vert`)
Implement GLSL vertex shader that:
- Calculates floating animation using uTime and aAnimationOffset
- Handles view transitions using uViewMode, aBaseY, aHoverY
- Applies hover effect using uHoverIndex with step functions
- Adjusts UV coordinates for texture atlas using aUvOffset

### Fragment Shader (`utils/webxr/shaders/instanceAnimation.frag`)
Implement GLSL fragment shader that:
- Samples texture atlas with adjusted UV coordinates
- Handles opacity transitions based on uViewMode
- Applies hover glow effect using vHovered
- Discards fragments with alpha < 0.01

## Verification Steps

### Unit Tests
1. Run `npm test tests/unit/webxr/shaderLoader.test.ts`
2. Verify shader types compile without errors
3. Verify shader loader returns valid ShaderMaterial

### Integration Tests
1. Run `npm test tests/integration/webxr/shaderIntegration.test.ts`
2. Verify shaders compile successfully in Three.js context
3. Verify uniform values can be updated at runtime

## Acceptance Criteria

- Shader types are strictly typed with no `any`
- Shader loader throws descriptive errors on failure
- Shaders compile without warnings in development console
- Vertex shader produces valid output for all attribute combinations
- Fragment shader handles edge cases (uv out of bounds, alpha zero)

## Dependencies

**depends-on**: None

## Exit Criteria

- All shader files exist with valid GLSL syntax
- TypeScript types pass strict mode compilation
- Unit tests pass for shader loader
- Integration tests pass for shader compilation