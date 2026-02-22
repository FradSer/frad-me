# Task 014: Update Unit Tests

**Priority**: P0
**Estimated Effort**: 2 days
**Phase**: 6 - Testing & Validation

## BDD Scenario Reference

- All BDD scenarios require corresponding test coverage

## Description

Update unit tests to cover new components and utilities. Ensure all new code has appropriate test coverage following the TDD Red-Green-Refactor approach.

## Files to Create/Modify

### New Tests
- `tests/unit/webxr/textureAtlas.test.ts` - Texture atlas tests
- `tests/unit/webxr/instanceManager.test.ts` - Instance manager tests
- `tests/unit/webxr/performanceMonitor.test.ts` - Performance monitor tests
- `tests/unit/webxr/drawCallOptimizer.test.ts` - Draw call optimizer tests
- `tests/unit/webxr/vertexShader.test.ts` - Vertex shader tests
- `tests/unit/webxr/fragmentShader.test.ts` - Fragment shader tests
- `tests/hooks/useInstancedHover.test.ts` - Hover detection tests

### Component Tests
- `tests/components/WebXR/WorkCardsInstanced.test.tsx` - WorkCardsInstanced tests
- `tests/components/WebXR/ShapesInstanced.test.tsx` - Shapes instanced tests
- `tests/components/WebXR/WipBadge.test.tsx` - WIP badge tests

### Updated Tests
- `tests/components/WebXR/HeroText.test.tsx` - Update for instanced shapes
- `utils/webxr/__tests__/animationConfig.test.ts` - May need updates

## Implementation Requirements

### Unit Test Coverage
- **textureAtlas.test.ts**: Cover all functions (createTextureAtlas, getUVOffset, getUVScale)
- **instanceManager.test.ts**: Cover all functions (create, setupAttributes, updateAt, updateAll, dispose)
- **performanceMonitor.test.ts**: Cover tracking, quality adaptation, logging
- **drawCallOptimizer.test.ts**: Cover counting, culling, optimization
- **vertexShader.test.ts**: Cover floating animation, hover effect logic
- **fragmentShader.test.ts**: Cover opacity transitions, glow effect, alpha discard

### Component Test Coverage
- **WorkCardsInstanced.test.tsx**: Render, props, state, events, integration
- **ShapesInstanced.test.tsx**: Render, props, animation, interaction
- **WipBadge.test.tsx**: Render, styling, visibility, accessibility

### Test Patterns
- **Arrange**: Set up test data and mocks
- **Act**: Call function or render component
- **Assert**: Verify expected behavior
- **Mock Three.js**: Use jest-canvas-mock for Three.js mocks
- **Mock Three.js Canvas**: Create mock WebGL context
- **Mock WebXR**: Mock @react-three/xr session

### External Dependencies
Isolate external dependencies with test doubles:
- **Image Loading**: Mock Image constructor and onload
- **File System**: Mock fs if needed
- **Browser APIs**: Mock navigator.xr for WebXR
- **Three.js**: Mock Three.js classes

### BDD Integration
Ensure tests align with BDD scenarios:
- Hover response time tests (<16ms)
- Transition completion tests (<500ms)
- FPS tracking tests
- Draw call count tests

## Verification Steps

### Test Execution
1. Run `npm test` - All unit tests should pass
2. Run `npm run test:ci` - Tests with coverage should pass
3. Run `npm run test:coverage` - Coverage report should show 90%+

### Coverage Report
- Verify unit test coverage ≥ 90%
- Verify component test coverage ≥ 85%
- Verify critical paths covered (hover, transition, performance)

### Code Quality
- Biome check should pass (`npm run check`)
- TypeScript strict mode should pass
- No TypeScript errors

### Integration
- Tests should run in CI/CD pipeline
- Tests should be fast (<5 seconds for unit tests)

## Acceptance Criteria

- All new tests pass
- Test coverage ≥ 90% for utilities
- Test coverage ≥ 85% for components
- All external dependencies mocked
- BDD scenarios covered by tests
- Biome check passes
- TypeScript strict mode passes
- Tests run in CI/CD pipeline
- Tests complete within time budget

## Dependencies

**depends-on**: All previous tasks (for code to test)

## Exit Criteria

- All tests pass
- Coverage targets met
- Quality checks pass