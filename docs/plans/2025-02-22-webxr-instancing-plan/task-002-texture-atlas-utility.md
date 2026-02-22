# Task 002: Texture Atlas Utility

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 1 - Foundation

## BDD Scenario Reference

- Feature 1: Work Card Hover Interactions (Scenarios 1-8)
- Feature 4: Loading States (Scenarios 3, 6, 9)

## Description

Create a texture atlas utility that combines multiple work card cover images into a single canvas texture. This reduces texture binds from 5 to 1 and enables instanced mesh rendering.

## Files to Create/Modify

### New Files
- `utils/webxr/textureAtlas.ts` - Main texture atlas creation utility
- `tests/unit/webxr/textureAtlas.test.ts` - Unit tests for texture atlas

### Modified Files
- None

## Implementation Requirements

### Texture Atlas Utility (`utils/webxr/textureAtlas.ts`)

Create utility with following functions:

#### `createTextureAtlas(images: string[], config?: AtlasConfig): Promise<THREE.Texture>`
- Loads all images in parallel
- Arranges images in grid layout (default 2 columns)
- Draws images onto canvas with padding
- Returns THREE.Texture with proper filtering settings
- Throws descriptive errors on image load failure

#### `getUVOffset(index: number, columns: number): [number, number]`
- Calculates UV offset for texture atlas lookup
- Returns [u, v] coordinates for given index

#### `getUVScale(columns: number, rows: number): [number, number]`
- Returns UV scale factors for texture atlas

### Configuration
- Default canvas size: 2048x2048
- Default tile size: 1024x768 (work card aspect ratio)
- Default padding: 4px
- Atlas layout: 2x2 grid for 4 tiles (card title at index 0)

## Verification Steps

### Unit Tests
1. Run `npm test tests/unit/webxr/textureAtlas.test.ts`
2. Verify `createTextureAtlas` returns valid THREE.Texture
3. Verify `getUVOffset` returns correct coordinates for all indices
4. Verify `getUVScale` returns correct scale factors
5. Verify error handling on image load failure

### Visual Tests
1. Manually verify atlas quality by inspecting generated canvas
2. Compare individual images vs atlas tiles for visual degradation
3. Verify no padding artifacts between tiles

## Acceptance Criteria

- Texture atlas is created successfully for all work links
- Atlas resolution is 2048x2048 or higher as needed
- Each tile maintains visual quality (SSIM ≥0.95 vs original)
- UV offsets are calculated correctly for all indices
- Error handling provides meaningful messages
- Texture filtering is set to LinearFilter for quality
- Texture wrapping is set to ClampToEdge to prevent artifacts

## Dependencies

**depends-on**: None

## Exit Criteria

- Texture atlas utility passes all unit tests
- Visual inspection shows no quality degradation
- Utility handles 5+ work cards without issues