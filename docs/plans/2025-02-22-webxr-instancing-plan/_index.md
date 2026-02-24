# WebXR GPU-First Instancing - Implementation Plan

**Date**: 2025-02-22
**Status**: Draft
**Design Source**: `docs/plans/2025-02-22-webxr-instancing-design/`

---

## Goal

Verify the WebXR GPU-First Instancing implementation against BDD specifications. Since core implementation exists in codebase, this plan focuses on Test-First verification using Gherkin scenarios from `bdd-specs.md`.

**Business Objective**: Deliver fluid portfolio showcase (2-3 min visits) with instant hover feedback (<16ms) and smooth transitions (<500ms).

---

## Architecture

### Existing Implementation (To Be Verified)

| Component | Location | Status |
|-----------|----------|--------|
| WorkCardsInstanced | `components/WebXR/WorkCardsInstanced/` | Implemented |
| Texture Atlas | `utils/webxr/textureAtlas.ts` | Implemented |
| Shader System | `utils/webxr/shaders/` | Implemented |
| InstancedMeshManager | `utils/webxr/instancedMeshManager.ts` | Implemented |
| PerformanceMonitor | `utils/webxr/performanceMonitor.ts` | Implemented |

### Testing Infrastructure (To Create)

- BDD feature files: `tests/features/webxr/*.feature`
- Step definitions: `tests/steps/webxr/`
- Test utilities: `tests/utils/`

### Performance Targets

| Metric | Target |
|--------|--------|
| Draw Calls | ≤ 50 |
| Frame Rate (Vision Pro) | ≥ 60 FPS |
| Frame Rate (Quest) | ≥ 45 FPS |
| Hover Response | < 16ms |
| View Transition | < 800ms |

---

## Constraints

### Technical Constraints
- **WebGL2 Minimum**: WebGPU not yet supported in WebXR, use GLSL shaders
- **Texture Unit Limit**: 16 textures max, must use texture atlas
- **Vision Pro Compatibility**: Hand tracking (gaze + pinch) must work
- **Quest Support**: Controller raycasting must work
- **Desktop Fallback**: Graceful degradation without VR devices

### Development Constraints
- **Incremental Migration**: Cannot rewrite everything at once
- **Backward Compatibility**: Must maintain existing API where possible
- **Test Coverage**: Unit 90%+, Component 85%, Integration 70%
- **Code Quality**: Biome clean, TypeScript strict mode
- **Bundle Size**: Initial <200KB, WebXR chunks <2MB

### Quality Constraints
- **Visual Quality**: SSIM ≥0.95 vs baseline
- **Accessibility**: WCAG AA, reduced motion support
- **Performance**: No frame drops below 45fps during transitions

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| TSL not WebGPU in XR | Use GLSL shaders, prepare for TSL future |
| Texture atlas quality loss | Use 2048x2048 canvas, validate visual quality |
| Hover detection latency | Profile and optimize distance calculation |
| Breaking changes | Keep WorkCard3D as fallback, gradual migration |
| Device-specific issues | Test on Vision Pro, Quest 3, desktop |

---

## Verification Phases

### Phase 1: Test Infrastructure
- Create BDD feature files from bdd-specs.md
- Set up Cucumber step definitions
- Configure Jest for WebXR testing

### Phase 2: Feature 1 - Hover Interactions
8 scenarios covering instant response, spring physics, multiple cards, WIP badge, smooth exit, hand tracking, reduced motion, cross-device

### Phase 3: Feature 2 - View Transitions
10 scenarios covering home↔work transitions, camera movement, staggered entrance, opacity, rapid switching, performance, links visibility, reduced motion, button state

### Phase 4: Feature 3 - Navigation
10 scenarios covering breathing animation, hover state, click behavior, input methods (mouse, hand tracking, Quest controller), position, text readability, accessibility

### Phase 5: Feature 4 - Loading States
10 scenarios covering loading indicator, async loading, texture/font loading, interactive state, error handling, bundle size, cache, Vision Pro, performance budget

### Phase 6: Feature 5 - Performance Monitoring
10 scenarios covering FPS tracking, quality adaptation, draw call monitoring, memory tracking, performance gates, device targets, hot path, visibility culling, instancing verification, production monitoring

---

## Success Criteria

| Criterion | Pass Criteria |
|-----------|---------------|
| Performance | ≥60 FPS Vision Pro, ≥45 FPS Quest |
| Draw Calls | ≤50 in work view |
| Visual Quality | SSIM ≥0.95 vs baseline |
| Hover Response | <16ms |
| Transition Time | <500ms |
| Accessibility | WCAG AA, reduced motion support |
| Code Quality | Biome clean, TypeScript strict, test coverage >80% |

---

## Execution Plan

### Phase 1: Test Infrastructure

- [Task 001: Create BDD feature files](./task-001-create-bdd-feature-files.md)
- [Task 002: Set up Cucumber step definitions](./task-002-setup-step-definitions.md)
- [Task 003: Configure Jest for WebXR](./task-003-configure-jest-webxr.md)

### Phase 2: Feature 1 - Hover Interactions

- [Task 004: Hover state tests](./task-004-hover-state-tests.md)
- [Task 005: Verify hover behavior](./task-005-verify-hover-behavior.md)

### Phase 3: Feature 2 - View Transitions

- [Task 006: View transition tests](./task-006-view-transition-tests.md)
- [Task 007: Verify transition timing](./task-007-verify-transition-timing.md)

### Phase 4: Feature 3 - Navigation

- [Task 008: Navigation button tests](./task-008-navigation-button-tests.md)
- [Task 009: Verify navigation accessibility](./task-009-verify-navigation-a11y.md)

### Phase 5: Feature 4 - Loading States

- [Task 010: Loading state tests](./task-010-loading-state-tests.md)
- [Task 011: Verify bundle optimization](./task-011-verify-bundle-optimization.md)

### Phase 6: Feature 5 - Performance

- [Task 012: Performance benchmark tests](./task-012-performance-benchmark-tests.md)
- [Task 013: Verify performance targets](./task-013-verify-performance-targets.md)

### Phase 7: Integration

- [Task 014: E2E portfolio flow test](./task-014-e2e-portfolio-flow.md)
- [Task 015: Visual regression validation](./task-015-visual-regression-validation.md)

---

## BDD Test Strategy

### Test-First Workflow

Each task follows Red-Green-Refactor:
1. **Red**: Create failing test based on BDD scenario
2. **Green**: Run test, verify it fails with expected error
3. **Refactor**: Implementation exists; verify test passes

### BDD Feature Coverage

| Feature | Scenarios | Test File |
|---------|-----------|-----------|
| Work Card Hover | 8 | `work-card-hover-interactions.feature` |
| View Transitions | 10 | `view-transitions.feature` |
| Navigation | 10 | `navigation-interactions.feature` |
| Loading States | 10 | `loading-states.feature` |
| Performance | 10 | `performance-monitoring.feature` |

### Test Types

- **BDD (Gherkin)**: Feature files in `tests/features/webxr/`
- **Unit**: Pure function tests in `tests/unit/webxr/`
- **Component**: React component tests
- **E2E**: Playwright tests in `tests/e2e/webxr/`

---

## Progress Tracking

### Completed Tasks
- None yet (plan not executed)

### In Progress Tasks
- None yet

### Blocked Tasks
- None yet

---

## References

- [Design Document](../2025-02-22-webxr-instancing-design/_index.md)
- [BDD Specifications](../2025-02-22-webxr-instancing-design/bdd-specs.md)
- [Architecture Details](../2025-02-22-webxr-instancing-design/architecture.md)
- [Best Practices](../2025-02-22-webxr-instancing-design/best-practices.md)

---

**Document Version**: 1.0
**Last Updated**: 2025-02-22