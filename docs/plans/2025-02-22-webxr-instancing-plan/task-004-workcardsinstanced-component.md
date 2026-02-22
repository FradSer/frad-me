# Task 004: WorkCardsInstanced Component

**Priority**: P0
**Estimated Effort**: 3 days
**Phase**: 2 - Work Card Instancing

## BDD Scenario Reference

- Feature 1: Work Card Hover Interactions (Scenarios 1-8)
- Feature 2: View Transitions (Scenarios 1, 2, 4, 5)
- Feature 4: Loading States (Scenario 3)

## Description

Create the main WorkCardsInstanced component that renders all work cards using a single InstancedMesh with custom shader material. This component replaces individual WorkCard3D components.

## Files to Create/Modify

### New Files
- `components/WebXR/WorkCardsInstanced/index.tsx` - Main instanced cards component
- `tests/components/WebXR/WorkCardsInstanced.test.tsx` - Component tests

### Modified Files
- `components/WebXR/WorkGrid3D/index.tsx` - Replace WorkCard3D map with WorkCardsInstanced
- `content/workLinks.ts` - May need to extend WorkLink type for instancing data

## Implementation Requirements

### WorkCardsInstanced Component

Create component that:
- Accepts `works: WorkLink[]` and optional `maxCapacity?: number`
- Creates single InstancedMesh with custom shader material (from Task 001)
- Sets up instance attributes using instanceManager (from Task 003)
- Loads texture atlas using textureAtlas utility (from Task 002)
- Renders title, subtitle, and WIP badge as separate HTML overlays (cannot be instanced)
- Handles pointer events for hover and click
- Integrates with WebXRViewContext for view state

### Shader Material Configuration
- Set `uViewMode` uniform based on currentView
- Update `uTime` uniform every frame
- Update `uHoverIndex` uniform based on hover detection
- Pass texture atlas as `uTextureAtlas` uniform

### Instance Data Setup
For each work link:
- Set `aAnimationOffset` for staggered animation (index * 0.5)
- Set `aUvOffset` for texture atlas lookup
- Set `aBaseY` for home view position
- Set `aHoverY` for work view position
- Set initial instance matrix using calculateCardPosition

### Text and Badge Rendering
- Render title and subtitle using Html overlay positioned per card
- Render WIP badge using Html overlay (only for cards with `isWIP` flag)
- Update visibility based on currentView and hover state

### Click Handling
- Handle onClick events with instanceId
- Navigate to `/works/${slug}` when card clicked
- Support Vision Pro hand tracking (gaze + pinch)

## Verification Steps

### Component Tests
1. Run `npm test tests/components/WebXR/WorkCardsInstanced.test.tsx`
2. Verify component renders with all works
3. Verify shader material is configured correctly
4. Verify instance attributes are set for all works
5. Verify click navigation works
6. Verify text overlays are positioned correctly
7. Verify WIP badge appears only for flagged cards

### Integration Tests
1. Run `npm test tests/integration/webxr/workGridInstanced.test.ts`
2. Verify integration with WebXRViewContext
3. Verify view transitions update uViewMode
4. Verify hover state updates uHoverIndex

### Visual Tests
1. Verify cards are positioned correctly in 3D space
2. Verify texture atlas images are displayed correctly
3. Verify text overlays are readable
4. Verify WIP badge has proper contrast

## Acceptance Criteria

- Component renders all work cards using single InstancedMesh
- Shader uniforms are updated correctly per frame
- Instance attributes are set for all cards
- Text overlays are positioned correctly over each card
- WIP badge appears on hover for flagged cards
- Click navigation works and navigates to correct slug
- Vision Pro hand tracking (gaze + pinch) works
- Component respects currentView from WebXRViewContext
- Performance: single draw call for all cards

## Dependencies

**depends-on**: Task 001, Task 002, Task 003

## Exit Criteria

- Component passes all tests
- Visual quality matches or exceeds baseline
- Draw calls reduced to 1 for all work cards