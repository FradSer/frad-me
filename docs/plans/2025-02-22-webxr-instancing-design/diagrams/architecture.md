# WebXR Architecture Diagrams

**Design Document**: WebXR GPU-First Instancing Optimization
**Date**: 2025-02-22

---

## Component Hierarchy

```mermaid
graph TD
    A[Next.js App Router] --> B[/webxr route/]
    B --> C[WebXRViewContext]
    C --> D[WebXRCanvas]
    D --> E[CameraController3D]
    D --> F[HeroText]
    D --> G[WorkGrid3D]
    G --> H[WorkCardsInstanced]
    H --> I[InstancedMesh]
    I --> J[Vertex Shader]
    I --> K[Fragment Shader]
    H --> L[Texture Atlas]
    H --> M[Hover Detection]
    D --> N[Navigation3D]
    D --> O[FooterLinks3D]
    D --> P[Stars]
```

---

## Data Flow: Hover Detection

```mermaid
sequenceDiagram
    participant Loop as useFrame Loop
    participant Pointer as Pointer State
    participant Calc as Distance Calculation
    participant Uniform as uHoverIndex
    participant GPU as Vertex Shader

    Loop->>Pointer: Get pointer position
    Pointer->>Calc: Pass pointer position
    Calc->>Calc: For each instance<br/>Calculate distance
    Calc->>Calc: Find closest index
    Calc->>Uniform: Set uHoverIndex
    Uniform->>GPU: GPU receives new value
    GPU->>GPU: Render hover effect
```

---

## Data Flow: View Transition

```mermaid
sequenceDiagram
    participant User as User
    participant Nav as Navigation3D
    participant Context as WebXRViewContext
    participant Uniform as uViewMode
    participant Vertex as Vertex Shader
    participant Frag as Fragment Shader
    participant Camera as CameraController3D

    User->>Nav: Click "work" button
    Nav->>Context: navigateToView("work")
    Context->>Context: currentView = "work"
    Context->>Uniform: uViewMode = 1
    Uniform->>Vertex: Animate positions
    Uniform->>Frag: Animate opacity
    Vertex->>Vertex: Cards move forward
    Frag->>Frag: Cards fade in
    Camera->>Camera: Move to work position
    Camera->>Camera: Change FOV to 65deg
```

---

## Performance Comparison

```mermaid
graph LR
    subgraph Before [Current Architecture]
        A1[WorkCard3D #1<br/>5 draws] --> A[Total: ~75 draws]
        A2[WorkCard3D #2<br/>5 draws] --> A
        A3[WorkCard3D #3<br/>5 draws] --> A
        A4[WorkCard3D #4<br/>5 draws] --> A
        A5[WorkCard3D #5<br/>5 draws] --> A
        A6[CPU Animation<br/>~2ms/frame] --> B[~30-45 FPS]
    end

    subgraph After [GPU-First Instancing]
        C1[WorkCardsInstanced<br/>1 draw] --> C[Total: ~6 draws]
        C2[GPU Animation<br/>~0.1ms/frame] --> D[60+ FPS]
    end

    B -.->|60% improvement| D
    A -.->|92% reduction| C
```

---

## Memory Architecture

```mermaid
pie title GPU Memory Budget (150MB)
    "Texture Atlas" : 16
    "Instanced Geometry" : 0.5
    "Shaders" : 0.1
    "Fonts" : 2
    "Other Assets" : 10
    "Headroom" : 121
```

---

## Implementation Timeline

```mermaid
gantt
    title WebXR Optimization Implementation (10 Weeks)
    dateFormat  YYYY-MM-DD
    section Foundation
    Shader Infrastructure      :done, f1, 2025-02-23, 1w
    Texture Atlas System      :active, f2, after f1, 1w
    Instanced Mesh Manager    :f3, after f2, 0.5w
    section Work Card Instancing
    Create WorkCardsInstanced :f4, after f3, 1w
    Migrate WorkCard3D Data  :f5, after f4, 1w
    Implement Hover Detection :f6, after f5, 1w
    section GPU Animation
    Vertex Shader Animation   :f7, after f6, 1w
    Fragment Shader Animation :f8, after f7, 1w
    Remove CPU Dependencies   :f9, after f8, 0.5w
    section Text & Hero
    Instanced Shapes          :f10, after f9, 1w
    Text Optimization         :f11, after f10, 1w
    section Performance
    Profile on Devices        :f12, after f11, 0.5w
    Optimize Draw Calls       :f13, after f12, 0.5w
    Add Monitoring            :f14, after f13, 0.5w
    section Testing
    Update Unit Tests         :f15, after f14, 0.5w
    Performance Benchmarking  :f16, after f15, 0.5w
    Visual Regression         :f17, after f16, 0.5w
    Accessibility Validation  :f18, after f17, 0.5w
```

---

## Quality Decision Tree

```mermaid
graph TD
    A[Device Detected] --> B{Is Vision Pro?}
    B -->|Yes| C[Target: 60 FPS<br/>High Quality]
    B -->|No| D{Is Quest?}
    D -->|Yes| E[Target: 45 FPS<br/>High Quality]
    D -->|No| F[Target: 30+ FPS<br/>Normal Quality]

    C --> G{FPS < 60?}
    E --> G
    F --> G

    G -->|Yes| H[Reduce Animation Speed<br/>Increase Spring Tension]
    G -->|No| I[Maintain Settings]

    H --> J{FPS Still Low?}
    I --> K{FPS Still Low?}

    J -->|Yes| L[Disable Non-Essential Features]
    J -->|No| I
    K -->|Yes| L
    K -->|No| I

    L --> M[Log Warning]
```

---

## Shader Pipeline

```mermaid
graph LR
    A[Uniforms<br/>uTime, uViewMode<br/>uHoverIndex] --> B[Vertex Shader]
    C[Attributes<br/>aAnimationOffset<br/>aUvOffset, aBaseY, aHoverY] --> B
    B --> D[Varyings<br/>vUv, vHovered<br/>vInstanceIndex]
    D --> E[Fragment Shader]
    F[Uniforms<br/>uTextureAtlas<br/>uViewMode] --> E
    E --> G[Final Output<br/>Position, Color, Opacity]
```

---

## Progressive Fallback Strategy

```mermaid
graph TD
    A[Load WebXR Experience] --> B{InstancedMesh<br/>Available?}
    B -->|Yes| C{Texture Atlas<br/>Load Success?}
    B -->|No| F[Fallback: WorkCard3D]
    C -->|Yes| D{Shaders Compile?}
    C -->|No| F
    D -->|Yes| E[Success: WorkCardsInstanced]
    D -->|No| G[Fallback: CPU Animation]
    F --> H[Render with Individual Meshes]
    G --> H
    E --> I[Render with GPU Animation]
```

---

## Testing Strategy

```mermaid
graph TD
    A[BDD Scenarios] --> B[Unit Tests]
    A --> C[Component Tests]
    A --> D[Integration Tests]
    A --> E[E2E Tests]
    A --> F[Visual Regression]
    A --> G[Performance Tests]
    A --> H[Accessibility Tests]

    B --> I[Jest Coverage: 90%+]
    C --> I
    D --> J[Playwright Coverage: 70%+]
    E --> J
    F --> K[Screenshot Comparison]
    G --> L[Performance Metrics]
    H --> M[WCAG AA Compliance]

    I --> N[CI/CD Pipeline]
    J --> N
    K --> N
    L --> N
    M --> N
```

---

**Document Version**: 1.0
**Last Updated**: 2025-02-22