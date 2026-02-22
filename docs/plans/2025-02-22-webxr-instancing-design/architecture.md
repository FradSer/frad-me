# Architecture

**Design Document**: WebXR GPU-First Instancing Optimization
**Date**: 2025-02-22

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           Next.js 16 App Router                  │
│                           /webxr route                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       WebXRViewContext                         │
│  - currentView: 'home' | 'work'                                │
│  - isTransitioning: boolean                                     │
│  - isVisionPro: boolean                                        │
│  - webXRSupported: boolean                                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        WebXRCanvas                              │
│  - Canvas with XR wrapper                                       │
│  - Camera config per device                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  HeroText     │    │ WorkGrid3D    │    │ Navigation3D  │
│  (optimized)  │    │ (instanced)   │    │  (unchanged)  │
└───────────────┘    └───────┬───────┘    └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │WorkCardsInstanced│
                    │ - InstancedMesh │
                    │ - Vertex Shader │
                    │ - Fragment Shader│
                    └───────┬───────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │Texture    │   │Hover      │   │Instance   │
    │Atlas      │   │Detection  │   │Attributes │
    └───────────┘   └───────────┘   └───────────┘
```

---

## Component Architecture

### Core Components

#### WebXRCanvas (`components/WebXR/WebXRCanvas.tsx`)

**Purpose**: Main canvas wrapper with XR support

**Changes**: Minimal - may need shader extensions for instancing

```typescript
export const WebXRCanvas = memo<WebXRCanvasProps>(function WebXRCanvas({ children }) {
  const { webXRSupported, isVisionPro } = useWebXRView();

  return (
    <Canvas {...canvasSettings} data-testid="webxr-canvas">
      {webXRSupported ? <XR store={xrStore}>{children}</XR> : children}
    </Canvas>
  );
});
```

#### WorkCardsInstanced (`components/WebXR/WorkCardsInstanced/index.tsx`) - NEW

**Purpose**: Instanced mesh renderer for all work cards

**Key Responsibilities**:
- Single draw call for all 5 work cards
- GPU-based floating animation
- GPU-based hover effect
- Texture atlas UV mapping
- Click navigation handling

**Interface**:
```typescript
interface WorkCardsInstancedProps {
  works: WorkLink[];
  maxCapacity?: number; // Default: 10
}

const WorkCardsInstanced: React.FC<WorkCardsInstancedProps> = ({
  works,
  maxCapacity = 10,
}) => {
  // Instanced mesh with custom shader material
  // Hover detection in useFrame
  // Click navigation handling
};
```

#### WorkGrid3D (`components/WebXR/WorkGrid3D/index.tsx`)

**Changes**: Replace `WorkCard3D` map with `WorkCardsInstanced`

```typescript
// Before:
{displayWorks.map((work, index) => (
  <WorkCard3D key={work.slug} work={work} position={position} index={index} />
))}

// After:
<WorkCardsInstanced works={displayWorks} maxCapacity={10} />
```

#### HeroText (`components/WebXR/HeroText.tsx`)

**Changes**: Optional - instanced geometry for shapes (box, triangle, sphere)

**Optimization**: Multiple instances of same shapes can use instancing

---

## Shader Architecture

### Vertex Shader (`utils/webxr/shaders/instanceAnimation.vert`)

**Purpose**: Handle position, scale, and floating animations on GPU

**Uniforms**:
- `uTime` - Global time for animation
- `uViewMode` - 0 for home, 1 for work
- `uHoverIndex` - Currently hovered instance index
- `uTextureAtlas` - Combined card textures

**Attributes**:
- `aAnimationOffset` - Per-instance animation phase
- `aUvOffset` - Texture atlas UV coordinates
- `aBaseY` - Base Y position
- `aHoverY` - Hover Y position

**Varyings**:
- `vUv` - Adjusted UV for texture atlas
- `vHovered` - Hover state for fragment shader

```glsl
uniform float uTime;
uniform float uViewMode;
uniform int uHoverIndex;
uniform sampler2D uTextureAtlas;

attribute float aAnimationOffset;
attribute vec2 aUvOffset;
attribute float aBaseY;
attribute float aHoverY;

varying vec2 vUv;
varying float vHovered;
varying float vInstanceIndex;

void main() {
  vInstanceIndex = float(gl_InstanceID);

  // Floating animation
  float floatOffset = sin(uTime * 2.0 + aAnimationOffset) * 0.05;

  // View transition
  float viewY = mix(aBaseY, aHoverY, uViewMode);

  vec3 pos = position;
  pos.y += viewY + floatOffset;

  // Hover effect
  float isHovered = step(gl_InstanceID - 0.5, float(uHoverIndex)) *
                   step(float(uHoverIndex) - 0.5, gl_InstanceID);
  vHovered = isHovered;
  pos.z += isHovered * 0.5;
  pos.y += isHovered * 0.3;

  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Adjust UV for texture atlas
  vUv = uv + aUvOffset;
}
```

### Fragment Shader (`utils/webxr/shaders/instanceAnimation.frag`)

**Purpose**: Handle color, opacity, and glow effects on GPU

**Uniforms**:
- `uTextureAtlas` - Combined card textures
- `uViewMode` - 0 for home, 1 for work

```glsl
uniform sampler2D uTextureAtlas;
uniform float uViewMode;

varying vec2 vUv;
varying float vHovered;
varying float vInstanceIndex;

void main() {
  vec4 texColor = texture2D(uTextureAtlas, vUv);

  // Fade in based on view mode
  float opacity = mix(0.0, 0.9, uViewMode);

  // Hover glow
  vec3 glowColor = vec3(0.3, 0.27, 0.9);
  vec3 finalColor = mix(texColor.rgb, glowColor, vHovered * 0.3);

  gl_FragColor = vec4(finalColor, opacity * texColor.a);

  if (gl_FragColor.a < 0.01) discard;
}
```

---

## Data Flow

### Hover Detection Flow

```
┌──────────────┐
│ useFrame     │
│ Loop         │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Get pointer  │
│ position     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ For each     │
│ instance:    │
│ - Calculate  │
│   distance   │
│ - Find       │
│   closest    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Set          │
│ uHoverIndex  │
│ uniform      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ GPU shader   │
│ renders      │
│ hover effect │
└──────────────┘
```

### View Transition Flow

```
┌──────────────┐
│ User clicks  │
│ navigation   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ WebXRView    │
│ Context      │
│ currentView  │
│ = "work"     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Set          │
│ uViewMode    │
│ uniform = 1  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Vertex       │
│ Shader       │
│ animates     │
│ position     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Fragment     │
│ Shader       │
│ animates     │
│ opacity      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Camera       │
│ Controller   │
│ animates     │
│ camera       │
└──────────────┘
```

---

## Module Structure

```
components/WebXR/
├── WebXRCanvas.tsx (minimal changes)
├── WorkGrid3D/
│   └── index.tsx (replace WorkCard3D with WorkCardsInstanced)
├── WorkCardsInstanced/ (NEW)
│   └── index.tsx (main instanced component)
├── WorkCard3D/ (DEPRECATED - keep for fallback)
│   └── index.tsx
├── HeroText.tsx (optional optimization)
├── Navigation3D.tsx (unchanged)
├── FooterLinks3D.tsx (unchanged)
├── ImmersiveButton.tsx (unchanged)
├── CameraController3D/
│   └── index.tsx (unchanged)
├── VisionProInputHandler.tsx (unchanged)
└── Stars/ (dynamic import from drei, unchanged)

hooks/
├── useSimpleLerp.ts (existing, may be deprecated)
├── useCardAnimation.ts (existing, not used with instancing)
└── useInstancedHover.ts (NEW - hover detection hook)

utils/webxr/
├── shaders/
│   ├── instanceAnimation.vert (NEW)
│   ├── instanceAnimation.frag (NEW)
│   └── cardMaterial.glsl (NEW)
├── textureAtlas.ts (NEW)
├── instanceManager.ts (NEW)
├── animationHelpers.ts (mostly unchanged)
├── animationConfig.ts (mostly unchanged)
├── animationConstants.ts (mostly unchanged)
├── materialUtils.ts (adapt for instancing)
├── workGridConstants.ts (mostly unchanged)
└── workGridUtils.ts (mostly unchanged)
```

---

## Performance Architecture

### GPU vs CPU Animation Comparison

| Aspect | Current (CPU) | New (GPU) | Improvement |
|--------|---------------|-----------|-------------|
| Animation Cost | 5 x lerp calculations | 1 uniform update | 80% reduction |
| Frame Overhead | ~2ms per frame | ~0.1ms per frame | 95% reduction |
| Draw Calls | 5 separate meshes | 1 instanced mesh | 80% reduction |
| Memory | 5 separate objects | 1 shared geometry | 60% reduction |

### Memory Architecture

```
┌─────────────────────────────────────────────────┐
│ GPU Memory Budget: 150MB                       │
├─────────────────────────────────────────────────┤
│ Texture Atlas (2048x2048 RGBA):      ~16MB      │
│ Instanced Geometry (5 instances):    ~0.5MB     │
│ Shaders (vertex + fragment):        ~0.1MB     │
│ Font Textures:                     ~2MB       │
│ Other Assets:                      ~10MB      │
│ Headroom:                          ~121MB     │
└─────────────────────────────────────────────────┘
```

### Draw Call Architecture

```
Before:
├── WorkCard3D #1: 5 draw calls
├── WorkCard3D #2: 5 draw calls
├── WorkCard3D #3: 5 draw calls
├── WorkCard3D #4: 5 draw calls
├── WorkCard3D #5: 5 draw calls
├── HeroText shapes: 3 draw calls
├── Navigation: 1 draw call
├── Stars: 1 draw call
└── Total: ~30 draw calls (work view)

After:
├── WorkCardsInstanced: 1 draw call
├── HeroText shapes: 3 draw calls (optional instancing)
├── Navigation: 1 draw call
├── Stars: 1 draw call
└── Total: ~6 draw calls (work view)
```

---

## State Management

### WebXRViewContext (Minimal Changes)

```typescript
interface WebXRViewContextValue {
  currentView: WebXRView;
  isTransitioning: boolean;
  navigationVisible: boolean;
  footerLinksVisible: boolean;
  isVisionPro: boolean;
  webXRSupported: boolean;
  navigateToView: (view: WebXRView) => void;
  setTransitioning: (transitioning: boolean) => void;
}
```

### Component State (WorkCardsInstanced)

```typescript
interface WorkCardsInstancedState {
  hoveredIndex: number; // -1 for none
  isLoaded: boolean;
  textureAtlas: THREE.Texture | null;
}
```

### Animation State (GPU via Uniforms)

```typescript
interface AnimationUniforms {
  uTime: number;
  uViewMode: number; // 0 or 1
  uHoverIndex: number;
}
```

---

## Error Handling Architecture

### Progressive Fallback

```
┌─────────────────────────────────────────────────┐
│ Attempt: WorkCardsInstanced                     │
├─────────────────────────────────────────────────┤
│ If InstancedMesh fails                          │
│   → Fallback: WorkCard3D (individual meshes)   │
│ If texture atlas fails                          │
│   → Fallback: Individual textures               │
│ If shaders fail                                 │
│   → Fallback: CPU animation (useSimpleLerp)     │
└─────────────────────────────────────────────────┘
```

### ErrorBoundary Usage

```typescript
<ErrorBoundary
  componentName="WorkCardsInstanced"
  fallback={<WorkGrid3DFallback />}
>
  <WorkCardsInstanced works={displayWorks} />
</ErrorBoundary>
```

---

## Integration Points

### XR Integration (@react-three/xr v6)

```typescript
// Hand tracking events work seamlessly
<instancedMesh
  onPointerOver={(e) => {
    const instanceId = e.instanceId;
    handleHover(instanceId);
  }}
  onClick={(e) => {
    const instanceId = e.instanceId;
    handleClick(instanceId);
  }}
/>
```

### Three.js Integration

```typescript
// InstancedMesh is native Three.js feature
const mesh = new THREE.InstancedMesh(
  geometry,
  material,
  count
);
```

### React Three Fiber Integration

```typescript
// JSX-friendly API
<instancedMesh
  ref={meshRef}
  args={[undefined, material, count]}
  material={customMaterial}
>
  <planeGeometry args={[4.5, 3]} />
</instancedMesh>
```

---

## Deployment Architecture

### Bundle Splitting

```
main.js (entry)
├── webxr-*.js (code-split)
│   ├── WorkCardsInstanced chunk (~50KB)
│   ├── Shaders chunk (~10KB)
│   └── TextureAtlas chunk (~5KB)
└── Shared (~150KB)
```

### Asset Optimization

```
public/images/works/
├── card-1.jpg (WebP, optimized)
├── card-2.jpg (WebP, optimized)
└── ...
```

### CDN Strategy

```
├── Static assets: Vercel CDN
├── Fonts: Vercel CDN
└── Card images: Optimized via next/image
```

---

## Security Considerations

### Input Validation

```typescript
// Validate instance index
const validatedIndex = Math.max(-1, Math.min(hoverIndex, count - 1));

// Validate view mode
const validatedViewMode = viewMode === 'work' ? 1 : 0;
```

### Resource Limits

```typescript
// Limit texture atlas size
const MAX_ATLAS_SIZE = 4096;
const atlasSize = Math.min(requestedSize, MAX_ATLAS_SIZE);

// Limit instance count
const MAX_INSTANCES = 50;
const count = Math.min(works.length, MAX_INSTANCES);
```

### Error Boundary

```typescript
// Wrap all WebXR components
<ErrorBoundary componentName="WebXR">
  <WebXRViewProvider>
    <WebXRCanvas>
      {/* Components */}
    </WebXRCanvas>
  </WebXRViewProvider>
</ErrorBoundary>
```

---

## References

- [Three.js InstancedMesh](https://threejs.org/docs/#api/en/objects/InstancedMesh)
- [React Three Fiber Events](https://r3f.docs.pmnd.rs/api/events)
- [Drei Instances](https://drei.docs.pmnd.rs/performances/instances)
- [@react-three/xr Documentation](https://docs.pmnd.rs/xr)
- [WebGPU Shading Language](https://www.w3.org/TR/WGSL/)

---

**Document Version**: 1.0
**Last Updated**: 2025-02-22