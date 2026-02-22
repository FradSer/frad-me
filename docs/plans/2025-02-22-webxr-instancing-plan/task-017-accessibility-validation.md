# Task 017: Accessibility Validation

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 6 - Testing & Validation

## BDD Scenario Reference

- Feature 1: Work Card Hover Interactions (Scenario 7 - reduced motion)
- Feature 3: Navigation Interactions (Scenario 10 - accessibility)
- Feature 4: Loading States (Scenario 9 - performance budget)

## Description

Validate accessibility of the WebXR experience to ensure WCAG AA compliance and support for reduced motion, keyboard navigation, and screen readers.

## Files to Create/Modify

### New Files
- `tests/e2e/webxr/accessibility.spec.ts` - Accessibility E2E tests
- `utils/webxr/accessibilityValidator.ts` - Accessibility validation utility

### Modified Files
- `components/WebXR/WorkCardsInstanced/index.tsx` - Ensure ARIA labels
- `components/WebXR/Navigation3D.tsx` - Ensure keyboard support

## Implementation Requirements

### Accessibility Tests

Create Playwright E2E tests that:

#### Reduced Motion Support
- Verify reduced motion preference is respected
- Verify animations are linear or disabled
- Verify motion sickness prevention works

#### Keyboard Navigation
- Verify navigation button is keyboard navigable
- Verify Tab key moves through interactive elements
- Verify Enter/Space key activates buttons
- Verify focus indicators are visible

#### Screen Reader Support
- Verify ARIA labels are present and descriptive
- Verify screen reader announces content
- Verify state changes are announced
- Verify WIP badge is announced

#### Color Contrast
- Verify text meets WCAG AA contrast (4.5:1)
- Verify badges meet WCAG AA contrast
- Verify hover states maintain contrast

#### Font Size
- Verify text size is readable (16-20pt equivalent)
- Verify font size scales with viewport
- Verify GT Eesti Display Bold is loaded

### Accessibility Validator

Create utility that:
- Checks color contrast ratios
- Checks ARIA label presence
- Checks keyboard navigability
- Checks font sizes
- Generates accessibility report

### ARIA Labels

Ensure proper ARIA labels:
- Work cards: `aria-label="${work.title} - ${work.subTitle}"`
- Navigation button: `aria-label="Navigate to ${navText} view"`
- Links: `aria-label="External link to ${linkText}"`

### Keyboard Support

Ensure keyboard support:
- Tab navigation order is logical
- Focus indicators are visible (outline, background change)
- Enter/Space activates buttons
- Escape cancels interactions

### Motion Preferences

Detect and respect motion preferences:
- `prefers-reduced-motion` media query
- Disable floating animation
- Disable breathing animation
- Use linear animations instead of spring

### Font Readability

Ensure text is readable:
- Minimum font size 16pt in VR
- High contrast colors (white on black)
- Anti-aliased rendering
- Custom fonts loaded with fallback

## Verification Steps

### Automated Tests
1. Run `npm test tests/e2e/webxr/accessibility.spec.ts`
2. Run `npx axe-core-cli webxr` for Axe Core analysis
3. Verify all automated checks pass

### Manual Testing
1. Manual keyboard navigation through experience
2. Manual screen reader testing (VoiceOver, NVDA)
3. Manual contrast verification
4. Manual reduced motion testing

### Device Testing
1. Test on Vision Pro with screen reader
2. Test on Quest with controller
3. Test on desktop with keyboard

### Tools
- **Axe DevTools**: Chrome extension for accessibility
- **WAVE**: WebAIM's evaluation tool
- **Lighthouse**: Accessibility audit
- **VoiceOver**: macOS screen reader
- **NVDA**: Windows screen reader

## Acceptance Criteria

- WCAG AA compliance verified
- Reduced motion preference respected
- Keyboard navigation works
- Screen reader support verified
- Color contrast meets 4.5:1 ratio
- Font size ≥ 16pt equivalent
- ARIA labels present and descriptive
- Focus indicators visible
- All automated accessibility tests pass
- Manual accessibility testing passed
- Cross-device accessibility verified

## Dependencies

**depends-on**: Task 004 (WorkCardsInstanced), Task 011 (WIP badge)

## Exit Criteria

- All accessibility tests pass
- WCAG AA compliance verified
- Reduced motion working
- Keyboard navigation verified
- Screen reader verified
- Color contrast verified