# WebXR GPU-First Instancing Optimization - Execution Plan

**Date**: 2025-02-22
**Status**: Draft
**Design Source**: `docs/plans/2025-02-22-webxr-instancing-design/`

---

## Goal

Implement GPU-first instancing architecture for WebXR portfolio experience to achieve 60fps on Vision Pro and 45fps on Quest while maintaining all existing features and user experience quality.

**Business Objective**: Deliver fluid portfolio showcase (2-3 min visits) with instant hover feedback (<16ms) and smooth transitions (<500ms).

---

## Architecture Overview

### Chosen Architecture: GPU-First Instancing

**Key Components**:
- `WorkCardsInstanced`: Single instanced mesh replacing 5 individual card components
- Texture Atlas: Combined card images (2048x2048, 2x2 grid)
- Custom Shaders: Vertex shader for floating/hover animations, fragment shader for opacity effects
- CPU-based Hover Detection: Distance calculation in useFrame loop

**Performance Targets**:
- Draw Calls: ~75 → <50 (60%+ reduction)
- Frame Rate: 30+ baseline → 60fps Vision Pro, 45fps Quest
- Hover Response: <16ms
- View Transition: <500ms

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

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Shader infrastructure setup
- Texture atlas utility
- Instanced mesh management

### Phase 2: Work Card Instancing (Week 3-4)
- WorkCardsInstanced component
- Data migration to instanced attributes
- Hover detection implementation

### Phase 3: GPU Animation (Week 5-6)
- Vertex shader for floating animation
- Vertex shader for hover effect
- Fragment shader for opacity transitions

### Phase 4: Text & Hero Optimization (Week 7-8)
- Instanced geometry for HeroText shapes
- Text pre-rendering considerations
- WIP badge functionality

### Phase 5: Performance Tuning (Week 9)
- Device profiling
- Draw call optimization
- Performance monitoring

### Phase 6: Testing & Validation (Week 10)
- Unit tests update
- Performance benchmarking
- Visual regression testing
- Accessibility validation

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

### Phase 1: Foundation Tasks

- [Task 001: Shader Infrastructure Setup](./task-001-shader-infrastructure-setup.md)
- [Task 002: Texture Atlas Utility](./task-002-texture-atlas-utility.md)
- [Task 003: Instanced Mesh Manager](./task-003-instance-manager.md)

### Phase 2: Work Card Instancing Tasks

- [Task 004: WorkCardsInstanced Component](./task-004-workcardsinstanced-component.md)
- [Task 005: Data Migration to Instanced Attributes](./task-005-data-migration.md)
- [Task 006: Hover Detection Implementation](./task-006-hover-detection.md)

### Phase 3: GPU Animation Tasks

- [Task 007: Vertex Shader Floating Animation](./task-007-vertex-shader-floating.md)
- [Task 008: Vertex Shader Hover Effect](./task-008-vertex-shader-hover.md)
- [Task 009: Fragment Shader Opacity Transitions](./task-009-fragment-shader-opacity.md)

### Phase 4: Text & Hero Tasks

- [Task 010: HeroText Instanced Shapes](./task-010-herotext-instanced-shapes.md)
- [Task 011: WIP Badge Functionality](./task-011-wip-badge.md)

### Phase 5: Performance Tasks

- [Task 012: Performance Monitoring](./task-012-performance-monitoring.md)
- [Task 013: Draw Call Optimization](./task-013-draw-call-optimization.md)

### Phase 6: Testing Tasks

- [Task 014: Update Unit Tests](./task-014-update-unit-tests.md)
- [Task 015: Performance Benchmarking](./task-015-performance-benchmarking.md)
- [Task 016: Visual Regression Testing](./task-016-visual-regression.md)
- [Task 017: Accessibility Validation](./task-017-accessibility-validation.md)

---

## Testing Strategy

### BDD Feature Coverage

| Feature | Scenarios | Tasks |
|---------|-----------|-------|
| Work Card Hover | 8 scenarios | Tasks 004-009 |
| View Transitions | 10 scenarios | Tasks 004-009, 013 |
| Navigation | 10 scenarios | Existing (unchanged) |
| Loading States | 10 scenarios | Tasks 002, 004 |
| Performance | 10 scenarios | Tasks 012-015 |

### Test Types

- **Unit Tests**: Test pure functions (textureAtlas, instanceManager)
- **Component Tests**: Test React components (WorkCardsInstanced)
- **Integration Tests**: Test context and view transitions
- **E2E Tests**: Test complete user flows
- **Visual Tests**: Screenshot comparison for key states
- **Performance Tests**: FPS, draw calls, response times
- **Accessibility Tests**: WCAG AA, reduced motion

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