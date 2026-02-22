# Task 005: Data Migration to Instanced Attributes

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 2 - Work Card Instancing

## BDD Scenario Reference

- Feature 1: Work Card Hover Interactions (Scenarios 1-8)
- Feature 2: View Transitions (Scenarios 1, 2, 4)

## Description

Migrate existing WorkCard3D data structures to instanced mesh attributes. This involves extracting position, scale, and animation data from existing components and converting to the format expected by InstancedMesh.

## Files to Create/Modify

### New Files
- `utils/webxr/migrationHelper.ts` - Utility to migrate WorkCard3D data to instanced attributes
- `tests/unit/webxr/migrationHelper.test.ts` - Tests for migration utility

### Modified Files
- `utils/webxr/animationConstants.ts` - May need to add instanced-specific constants
- `utils/webxr/workGridUtils.ts` - Enhance calculateCardPosition for instancing

## Implementation Requirements

### Migration Helper (`utils/webxr/migrationHelper.ts`)

Create utility with following functions:

#### `createInstanceDataForWorks(works: WorkLink[]): InstanceData[]`
- Maps WorkLink array to InstanceData array
- Calculates position using calculateCardPosition
- Determines animation offset based on index
- Calculates UV offset for texture atlas
- Sets base and hover Y positions

#### `setupWorkCardInstanceData(work: WorkLink, index: number, totalCards: number): InstanceData`
- Creates InstanceData for single work card
- Handles isFullScreen flag for positioning
- Handles index 0 (title card) specially
- Returns properly formatted instance data

### Instance Data Structure
```typescript
interface InstanceData {
  position: [number, number, number];
  animationOffset: number;
  uvOffset: [number, number];
  baseY: number;
  hoverY: number;
  scale: number;
}
```

### Position Calculation Enhancement
- Extend calculateCardPosition to handle index 0 (title position)
- Ensure positions align with WorkGrid3D grid layout
- Maintain 3-per-row grid with centering logic
- Handle fullscreen card positioning

### Animation Offset Mapping
- Index 0 (title): 0.0
- Card 1: 0.5
- Card 2: 1.0
- Card 3: 1.5
- Card 4: 2.0
- Formula: `index * 0.5`

### UV Offset Calculation
- Use getUVOffset from Task 002
- Map indices to 2x2 grid:
  - Index 0 (title): [0, 0]
  - Card 1: [0.5, 0]
  - Card 2: [0, 0.5]
  - Card 3: [0.5, 0.5]
  - Card 4: [0, 0] (if 3 rows) or extend grid

## Verification Steps

### Unit Tests
1. Run `npm test tests/unit/webxr/migrationHelper.test.ts`
2. Verify createInstanceDataForWorks returns correct count
3. Verify instance data has all required fields
4. Verify positions match calculateCardPosition output
5. Verify animation offsets are correctly staggered
6. Verify UV offsets map correctly to atlas grid

### Integration Tests
1. Run `npm test tests/integration/webxr/dataMigration.test.ts`
2. Verify migrated data produces correct instance matrices
3. Verify positions align with WorkGrid3D expectations

### Visual Tests
1. Verify cards appear in same positions as WorkCard3D
2. Verify title card is positioned correctly
3. Verify fullscreen cards are positioned correctly

## Acceptance Criteria

- All WorkLink data converts to InstanceData format
- Instance positions match original WorkCard3D positions
- Animation offsets are correctly staggered
- UV offsets map correctly to texture atlas
- Title card (index 0) is handled specially
- Fullscreen cards use correct positioning
- Data structure passes TypeScript strict mode

## Dependencies

**depends-on**: Task 002 (for getUVOffset), Task 004 (for component integration)

## Exit Criteria

- Migration helper passes all unit tests
- Visual comparison shows identical positioning
- Data structure supports all work card configurations