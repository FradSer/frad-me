# Task 011: WIP Badge Functionality

**Priority**: P1
**Estimated Effort**: 1 day
**Phase**: 4 - Text & Hero

## BDD Scenario Reference

- Feature 1: Work Card Hover Interactions (Scenario 4 - WIP badge appears)

## Description

Ensure WIP badge functionality works correctly with instanced work cards. The WIP badge is an HTML overlay that appears only when a work card with `isWIP` flag is hovered.

## Files to Create/Modify

### New Files
- `components/WebXR/WipBadge.tsx` - Standalone WIP badge component (extracted from WorkCard3D)
- `tests/components/WebXR/WipBadge.test.tsx` - Tests for WIP badge

### Modified Files
- `components/WebXR/WorkCardsInstanced/index.tsx` - Integrate WIP badge component
- `content/workLinks.ts` - Ensure isWIP flag is present

## Implementation Requirements

### WIP Badge Component

Create component that:
- Renders HTML overlay badge using Drei's Html component
- Shows "WIP" text with yellow background and black text
- Positioned above the work card
- Only visible when:
  1. Card has `isWIP` flag set to true
  2. Card is currently hovered
  3. Current view is "work"
- Has proper contrast for accessibility (yellow on black)

### Badge Styling
```css
- Background: yellow-500 (Tailwind)
- Text: black, font-bold, text-xs
- Padding: px-2 py-1
- Rounded: rounded
- Shadow: shadow-lg
```

### Positioning
- Position: `[2, 1.2, 0.2]` relative to card
- Use `transform` prop for proper 3D positioning
- Use `distanceFactor` for proper scale in 3D space

### Integration with WorkCardsInstanced
- Render WipBadge only when card is hovered
- Use hoveredIndex to determine which card badge to show
- Pass isWIP flag from work data
- Handle multiple hovered states (only show one at a time)

### Accessibility
- High contrast badge (WCAG AA compliant)
- Screen reader support
- Reduced motion support (fade in smoothly)

## Verification Steps

### Component Tests
1. Run `npm test tests/components/WebXR/WipBadge.test.tsx`
2. Verify WIP badge renders correctly
3. Verify badge has proper styling
4. Verify badge has proper contrast

### Integration Tests
1. Run `npm test tests/integration/webxr/wipBadge.test.ts`
2. Verify badge appears when WIP card hovered
3. Verify badge does not appear when non-WIP card hovered
4. Verify badge does not appear when card not hovered
5. Verify badge does not appear in home view

### Visual Tests
1. Verify badge has yellow background and black text
2. Verify badge has proper contrast (meets WCAG AA)
3. Verify badge is positioned correctly above card
4. Verify badge appears smoothly on hover
5. Verify badge disappears smoothly when unhovered

### Accessibility Tests
1. Verify badge meets WCAG AA contrast requirements
2. Verify screen reader announces "WIP" when badge visible
3. Verify reduced motion preference works

## Acceptance Criteria

- WIP badge appears only when WIP card is hovered
- WIP badge has yellow-500 background with black text
- WIP badge has proper contrast (WCAG AA compliant)
- WIP badge is positioned correctly above card
- WIP badge appears smoothly (fade in)
- WIP badge disappears smoothly (fade out)
- WIP badge does not appear for non-WIP cards
- WIP badge does not appear when card not hovered
- WIP badge does not appear in home view
- Screen reader support working
- Reduced motion preference working

## Dependencies

**depends-on**: Task 004 (WorkCardsInstanced component), Task 006 (hover detection)

## Exit Criteria

- WIP badge passes all tests
- Visual quality verified
- Accessibility verified