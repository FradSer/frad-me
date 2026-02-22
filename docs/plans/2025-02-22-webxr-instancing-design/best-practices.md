# Best Practices

**Design Document**: WebXR GPU-First Instancing Optimization
**Date**: 2025-02-22

---

## Performance Best Practices

### Draw Call Optimization

**Golden Rule**: Target under 50 draw calls per frame for 60fps on VR devices.

```typescript
// BAD: 5 separate meshes = 5 draw calls
{works.map(work => (
  <mesh key={work.slug}>
    <planeGeometry />
    <meshBasicMaterial map={work.texture} />
  </mesh>
))}

// GOOD: 1 instanced mesh = 1 draw call
<instancedMesh ref={meshRef} args={[undefined, material, works.length]}>
  <planeGeometry />
</instancedMesh>
```

### Instancing Guidelines

1. **Use instancing for repeated geometry**: Same geometry + different positions/scales
2. **Batch materials**: Share materials across instances
3. **Pre-allocate capacity**: Set instance count higher than actual need
4. **Minimize instance matrix updates**: Update only when needed

```typescript
// GOOD: Pre-allocate with buffer
const MAX_INSTANCES = 10;
const count = works.length;

<instancedMesh args={[undefined, material, MAX_INSTANCES]} count={count} />
```

### GPU Animation Best Practices

1. **Move constant calculations to shader**: Time-based animations
2. **Use uniforms for global state**: View mode, hover index
3. **Use attributes for per-instance data**: Position offset, UV offset
4. **Avoid CPU-GPU data transfer**: Minimize uniform updates

```typescript
// GOOD: Single uniform update per frame
useFrame((state) => {
  material.uniforms.uTime.value = state.clock.elapsedTime;
});

// BAD: Per-instance update in useFrame
useFrame(() => {
  for (let i = 0; i < count; i++) {
    meshRef.current.setMatrixAt(i, ...);
  }
});
```

### Texture Optimization

1. **Use texture atlases**: Combine multiple textures into one
2. **Match atlas size to content**: Don't waste resolution
3. **Use power-of-two dimensions**: WebGL best practice
4. **Compress textures**: WebP for card images

```typescript
// GOOD: Texture atlas
const atlas = createTextureAtlas([
  card1.jpg,
  card2.jpg,
  card3.jpg,
  card4.jpg,
  card5.jpg
], { columns: 2, rows: 3, tileSize: [1024, 768] });
```

### Memory Management

1. **Reuse geometries**: Share across instances
2. **Reuse materials**: Share across components
3. **Dispose unused resources**: Clean up when unmounting
4. **Limit texture resolution**: Based on device capability

```typescript
// GOOD: Reuse geometry
const sharedGeometry = useMemo(
  () => new THREE.PlaneGeometry(4.5, 3),
  []
);

// GOOD: Dispose on unmount
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
  };
}, []);
```

---

## Security Best Practices

### Input Validation

Validate all user inputs, especially instance indices and view modes.

```typescript
// Validate instance index
const getValidatedIndex = (index: number, max: number): number => {
  return Math.max(-1, Math.min(index, max - 1));
};

// Validate view mode
const getValidatedViewMode = (mode: string): number => {
  return mode === 'work' ? 1 : 0;
};
```

### Resource Limits

Implement resource limits to prevent abuse or crashes.

```typescript
// Configuration
const WEBXR_LIMITS = {
  MAX_INSTANCES: 50,
  MAX_ATLAS_SIZE: 4096,
  MAX_TEXTURE_SIZE: 1024,
} as const;

// Enforce limits
const validatedCount = Math.min(requestedCount, WEBXR_LIMITS.MAX_INSTANCES);
```

### Error Handling

Use ErrorBoundary for all WebXR components to prevent crashes.

```typescript
<ErrorBoundary
  componentName="WorkCardsInstanced"
  fallback={<WorkGrid3DFallback />}
>
  <WorkCardsInstanced works={displayWorks} />
</ErrorBoundary>
```

### Content Security

1. **Validate URLs**: Only allow trusted image sources
2. **Check content type**: Ensure images are actual images
3. **Sanitize user content**: Prevent XSS in overlays

```typescript
// Validate image URL
const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
};
```

---

## Code Quality Best Practices

### TypeScript Best Practices

1. **Use strict types**: Enable `strict: true` in tsconfig
2. **Define interfaces**: For all props and returns
3. **Avoid `any`**: Use proper types instead
4. **Use generics**: For reusable utilities

```typescript
// GOOD: Proper typing
interface WorkCardInstancedProps {
  works: WorkLink[];
  maxCapacity?: number;
}

const WorkCardsInstanced: React.FC<WorkCardInstancedProps> = ({
  works,
  maxCapacity = 10,
}) => {
  // Implementation
};
```

### React Best Practices

1. **Use `memo` for pure components**: Prevent unnecessary re-renders
2. **Use `useMemo` for expensive calculations**: Cache results
3. **Use `useCallback` for event handlers**: Stable references
4. **Minimize state**: Prefer derived state

```typescript
// GOOD: Memoized component
const WorkCardsInstanced = memo<WorkCardsInstancedProps>(
  function WorkCardsInstanced({ works, maxCapacity }) {
    // Implementation
  },
  (prev, next) => prev.works === next.works
);
```

### Three.js Best Practices

1. **Reuse Three.js objects**: Geometries, materials, vectors
2. **Dispose unused resources**: Prevent memory leaks
3. **Use object pools**: For frequently created objects
4. **Minimize scene graph depth**: Flatten when possible

```typescript
// GOOD: Reuse vector
const tempVector = useMemo(() => new THREE.Vector3(), []);

useFrame(() => {
  tempVector.set(x, y, z);
  mesh.position.copy(tempVector);
});
```

### Biome Formatting

Follow project Biome configuration:
- Single quotes
- 2-space indent
- 100 char line width
- Import organization enabled

```typescript
// GOOD: Biome-compliant
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
```

---

## Accessibility Best Practices

### Motion and Animation

1. **Respect reduced motion preference**: Detect and adapt
2. **Provide motion controls**: Allow users to disable animations
3. **Avoid motion sickness**: Keep movements smooth and predictable
4. **Limit animation speed**: Don't exceed comfortable rates

```typescript
// Detect reduced motion
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

// Adapt animation speed
const animationSpeed = prefersReducedMotion ? 0.5 : 1.0;
```

### Visual Accessibility

1. **WCAG AA contrast**: Minimum 4.5:1 for text
2. **Large text size**: 16-20pt minimum for VR
3. **High contrast mode**: Support when requested
4. **Color independence**: Don't rely on color alone

```typescript
// GOOD: WCAG AA compliant colors
const COLORS = {
  title: '#ffffff', // White on black background
  subtitle: '#d1d5db', // Light gray (meets AA)
  glow: '#4f46e5', // Blue with white text (meets AA)
} as const;
```

### Auditory Accessibility

1. **Spatial audio cues**: Use 3D audio for feedback
2. **Screen reader support**: Announce important state changes
3. **Visual alternatives**: Provide visual cues for audio
4. **Caption support**: For any audio content

### Motor Accessibility

1. **Multiple input methods**: Support mouse, keyboard, VR controller
2. **Seated mode support**: Don't require standing
3. **Interaction range**: Keep targets within reach
4. **Large hit areas**: Minimum 30x30mm for VR

```typescript
// GOOD: Large hit area
const HIT_AREA_SIZE = [5.5, 5]; // Large interaction area

<mesh
  onPointerOver={handleHover}
  onClick={handleClick}
>
  <planeGeometry args={HIT_AREA_SIZE} />
  <meshBasicMaterial transparent opacity={0} />
</mesh>
```

### Cognitive Accessibility

1. **Clear navigation**: Obvious way to move between views
2. **Minimal cognitive load**: Don't overwhelm with options
3. **Memory support**: Provide context clues
4. **Error prevention**: Guide users away from mistakes

---

## Testing Best Practices

### Unit Testing

1. **Test pure functions**: Animation calculations, utilities
2. **Mock Three.js**: Use jest-canvas-mock for Three.js
3. **Test configuration**: Animation config, constants
4. **Cover edge cases**: Invalid inputs, boundary conditions

```typescript
// GOOD: Test pure function
describe('calculateCardPosition', () => {
  it('returns correct position for index 1', () => {
    const result = calculateCardPosition(1, false, 5);
    expect(result).toEqual([expectedX, expectedY, expectedZ]);
  });
});
```

### Component Testing

1. **Test component rendering**: Verify correct output
2. **Test user interactions**: Hover, click events
3. **Test state changes**: View transitions, hover states
4. **Test error cases**: Invalid props, missing data

```typescript
// GOOD: Test hover interaction
it('calls onHover when pointer over', () => {
  const handleHover = jest.fn();
  render(
    <WorkCard3D work={mockWork} onHover={handleHover} />
  );

  fireEvent.pointerOver(screen.getByRole('mesh'));

  expect(handleHover).toHaveBeenCalledWith(true);
});
```

### Integration Testing

1. **Test view transitions**: Home to work and back
2. **Test context state**: WebXRViewContext integration
3. **Test shader uniforms**: Correct values passed to GPU
4. **Test performance**: Frame rate, draw calls

### E2E Testing

1. **Test complete flows**: Navigation through portfolio
2. **Test cross-device**: Vision Pro, Quest, desktop
3. **Test loading states**: Asset loading, error handling
4. **Test accessibility**: Reduced motion, keyboard nav

### Performance Testing

1. **Benchmark FPS**: Target 60fps Vision Pro, 45fps Quest
2. **Measure draw calls**: Target < 50 in work view
3. **Profile memory**: Target < 150MB GPU memory
4. **Test thermal behavior**: Avoid overheating on VR devices

```typescript
// GOOD: Performance benchmark
describe('WebXR Performance', () => {
  it('maintains 60fps on Vision Pro', async () => {
    const fps = await measureFPSOverTime(10000); // 10 seconds
    expect(fps).toBeGreaterThanOrEqual(60);
  });
});
```

---

## Deployment Best Practices

### Bundle Optimization

1. **Code split by route**: Separate WebXR chunk
2. **Lazy load components**: Dynamic imports for heavy parts
3. **Minify code**: Production builds only
4. **Tree shake unused code**: Reduce bundle size

```typescript
// GOOD: Dynamic import with performance tracking
const WorkCardsInstanced = dynamic(
  () => measureChunkLoad(
    'WorkCardsInstanced',
    () => import('@/components/WebXR/WorkCardsInstanced')
  ),
  { ssr: false }
);
```

### Asset Optimization

1. **Use WebP images**: Smaller than JPEG/PNG
2. **Lazy load images**: Load as needed
3. **Cache assets**: Browser cache headers
4. **CDN delivery**: Use Vercel CDN for static assets

### Environment Configuration

1. **Development logging**: Debug mode logging
2. **Production analytics**: Track performance
3. **Feature flags**: Enable/disable features
4. **Device detection**: Optimize per device

```typescript
// GOOD: Environment-specific behavior
if (process.env.NODE_ENV === 'development') {
  console.log('WebXR debugging enabled');
}

if (isVisionPro) {
  // Vision Pro-specific optimizations
}
```

### Monitoring

1. **Track FPS**: Continuous monitoring
2. **Log errors**: Error tracking service
3. **Measure load times**: Performance API
4. **Monitor crashes**: Crash reporting

```typescript
// GOOD: Performance monitoring
useEffect(() => {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    trackPerformance('workCardsLoad', duration);
  };
}, []);
```

---

## Documentation Best Practices

1. **Document all public APIs**: TypeScript JSDoc comments
2. **Explain shader code**: Inline comments for GLSL
3. **Create diagrams**: Mermaid for architecture
4. **Update README**: Include in project docs

```typescript
/**
 * Creates a texture atlas from multiple images
 * @param images - Array of image URLs to combine
 * @param config - Atlas configuration
 * @returns Three.js Texture object
 */
export const createTextureAtlas = (
  images: string[],
  config: AtlasConfig
): Promise<THREE.Texture> => {
  // Implementation
};
```

---

## Migration Best Practices

1. **Gradual migration**: Phase by phase, not all at once
2. **Keep fallbacks**: Maintain working alternative
3. **Test extensively**: At each migration step
4. **Monitor performance**: Compare before/after metrics

```typescript
// GOOD: Progressive enhancement
const supportsInstancing = 'InstancedMesh' in THREE;

return supportsInstancing ? (
  <WorkCardsInstanced works={works} />
) : (
  <WorkCardsFallback works={works} />
);
```

---

## References

- [Three.js Performance Tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
- [React Three Fiber Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- [WebXR Performance Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API/Performance)
- [WCAG 3.0 Accessibility](https://www.w3.org/TR/wcag-3.0/)
- [W3C XR Accessibility Guidelines](https://www.w3.org/WAI/apg/xr-accessibility/)

---

**Document Version**: 1.0
**Last Updated**: 2025-02-22