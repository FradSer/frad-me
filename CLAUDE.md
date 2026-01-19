# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js personal website for Frad LEE built with TypeScript, featuring:
- Portfolio/work showcase with MDX content
- WebXR/VR capabilities with React Three Fiber
- Comprehensive error boundary system with progressive fallback
- Dark mode support with next-themes
- Custom mouse interactions and animations
- Responsive design with Tailwind CSS

## Common Development Commands

**Development:**
```bash
pnpm dev          # Start development server on localhost:3000
pnpm build        # Build for production
pnpm start        # Start production server
pnpm analyze      # Build with bundle analyzer
```

**Code Quality (Biome):**
```bash
pnpm format       # Format all files with Biome
pnpm lint         # Lint and apply safe fixes with Biome
pnpm check        # Format, lint, and organize imports with Biome (recommended)
```

**Testing:**
```bash
pnpm test         # Run unit tests (Jest)
pnpm test:watch   # Run unit tests in watch mode
pnpm test:ci      # Run unit tests with coverage for CI
pnpm test:coverage # Run unit tests with coverage report
pnpm test:e2e     # Run end-to-end tests (Playwright)
pnpm test:e2e:ui  # Run E2E tests with interactive UI
pnpm test:e2e:headed # Run E2E tests in headed mode (visible browser)
pnpm test:all     # Run all tests (unit + E2E)

# Run specific test files:
pnpm test utils/__tests__/mdx.test.ts
# Note: E2E tests have been cleaned up to remove flaky suites.
```

**Package Management:**
- Uses `pnpm` as package manager (version 10.15.0+)
- Node.js version: 22.0.0+ (specified in engines)
- pnpm lockfile version: 9.0

**Troubleshooting:**
```bash
# Clear build cache and restart
rm -rf .next && pnpm dev
# Bundle analysis for performance debugging
pnpm analyze      # Generates webpack bundle analysis
```

## Architecture

### Dual Layout Architecture
The application uses smart layout switching based on WebXR capability detection:

- **StandardLayout**: Traditional web experience with Header navigation, mouse interactions, and theme switching
- **VRLayout**: Immersive WebXR experience with 3D navigation, completely isolated from global UI elements
- **ClientLayout Detection**: `useXRDetect` hook (hooks/useXRDetect.ts) determines which layout to render based on device capabilities

### WebXR Experience Architecture
- **Pure 3D Interface**: `/webxr` route uses `fixed inset-0` positioning to completely overlay standard navigation
- **3D Navigation System**:
  - `Navigation3D.tsx`: Single toggle button (home/work) with breathing animation and spring physics
  - `FooterLinks3D.tsx`: External links (resume, calendly) positioned in 3D space, visible only in home view
- **WebXRViewContext**: Centralized state management for view transitions (`home` ↔ `work`)
- **Spring Animation System**: Simplified animation logic using R3F `useFrame` and `THREE.MathUtils.lerp`
  - `useSimpleLerp` hook for smooth 3D transitions with referential stability
  - Spring presets (gentle, bouncy, quick, slow) mapped to lerp speeds for consistent feel

### Error Handling System
- **Progressive Fallback Architecture**: WebXR → 3D → 2D fallback levels with comprehensive error boundaries
- **ErrorBoundary**: Custom React component providing:
  - Component-level isolation for standard and WebXR layouts
  - Progressive fallback UI based on failure context
  - Integration with React 19 Error Boundary APIs

### Mouse Interaction System
- **Performance Optimized**: Custom mouse position tracking using requestAnimationFrame for 60fps performance
- **DotRing Component**: Advanced cursor with spring physics and attraction effects
  - Configurable constants for spring stiffness (300), damping (30), and blend factors
  - Multiple cursor states: default, header-link-hovered, work-card-hovered, attracted
  - Smooth transitions with Motion spring animations
- **Context-Based**: MouseContext provides centralized cursor state management across components
- **Accessibility**: Maintains standard cursor functionality while adding visual enhancements

### Content Management
- **content/**: MDX files and configuration for work portfolio
  - `works/`: Individual work case studies (.mdx files) with frontmatter
  - Link configuration files (`workLinks.ts`, `headerLinks.ts`, `footerLinks.ts`)
- **utils/mdx.ts**: MDX processing with mdx-bundler, including compilation and frontmatter extraction

### WebXR-Specific Testing
Playwright is configured with enhanced WebXR testing capabilities:
- Special browser flags for WebXR support (`--enable-webxr`, `--enable-features=WebXR`)
- Extended timeouts for 3D rendering (up to 60s for navigation)
- Permissions for camera, microphone, accelerometer, gyroscope
- Performance testing configurations with GPU benchmarking flags

## Key Technologies

**Frontend Stack:**
- Next.js 15 with App Router and TypeScript strict mode
- React 19 with Tailwind CSS and custom 16-column grid system
- Motion (Framer Motion) for 2D animations and transitions
- next-themes for dark mode with class-based switching

**3D/XR Features:**
- React Three Fiber ecosystem (@react-three/fiber, @react-three/drei, @react-three/xr)
- Three.js for 3D graphics and WebGL rendering
- WebXR for VR/AR experiences with automatic capability detection
- Comprehensive error boundaries with progressive fallback system

**Content & Styling:**
- MDX with mdx-bundler for flexible content management
- GT Eesti font family with multiple weights and styles loaded via next/font
- Custom Tailwind configuration with design tokens
- Million.js for React optimization and performance

**Code Quality & Testing:**
- Biome for formatting, linting, and import organization (replaces ESLint/Prettier)
- Jest with React Testing Library for unit and integration testing
- Playwright for end-to-end testing across browsers
- SonarCloud integration for continuous code quality monitoring

## Development Notes

**WebXR Animation System:**
- Custom spring physics using `SpringScalar` class with configurable tension and friction
- Material opacity management through `useFrame` hook traversing Three.js object hierarchies
- Performance optimization: components automatically hidden when opacity < 0.01
- Animation states defined in `utils/webxr/animationHelpers.ts` with smooth transitions between home/work views
- GT Eesti Display Bold font consistency across all 3D text elements

**WebXR Navigation Design:**
- Single toggle navigation (home ↔ work) with breathing animation effects using spring physics
- 3D positioned external links (resume, calendly) visible only in home view with proper depth sorting
- Complete isolation from global navigation when in WebXR mode to prevent interference
- Automatic layout switching based on device WebXR capabilities

**Component Architecture Patterns:**
- **Configuration Constants**: Magic numbers extracted to named constants (e.g., SPRING_CONFIG, CURSOR_SIZES)
- **Animation Optimization**: Conditional props extracted into clear variables for better readability
- **Component Reusability**: Shared components like DownArrowIcon reduce duplication
- **Type Safety**: Extensive use of TypeScript const assertions and proper type inference
- **Performance**: requestAnimationFrame-based hooks and memoized calculations for smooth animations

**Build Configuration:**
- App Router with TypeScript strict mode and path aliases (`@/*`) for clean imports
- Million.js integration with transpiled packages for 3D libraries compatibility
- Font optimization via next/font with preloading for GT Eesti font family
- Bundle analysis available via `pnpm analyze` for optimization insights
- Vercel Analytics and Speed Insights integration for performance monitoring
- Next.js transpiles React Three Fiber ecosystem packages for server compatibility
- Webpack fallback configured for WebXR protobuf dependencies

## Code Style and Quality

**Biome Configuration:**
- Single quotes for JavaScript/TypeScript
- Space indentation (2 spaces)
- Import organization enabled
- Recommended linting rules enforced
- Specific file includes: `app/`, `components/`, `content/`, `test/`, `types/`, `utils/`

**TypeScript Configuration:**
- Strict mode enabled with `forceConsistentCasingInFileNames`
- Path aliases configured for clean imports (`@/*`)
- Excludes test files from production builds
- ES5 target with ESNext modules for modern compatibility

## Critical Implementation Patterns

### Theme System Integration
When adding new components that need theme awareness:
- Wrap with `ThemeModeProvider` if creating new layout sections
- Use `useTheme()` hook from next-themes to access current theme
- Always check `isMounted` before rendering theme-dependent content to prevent hydration mismatches
- Theme values: `'light'`, `'dark'`, or `'system'` (preference) / `'light'` or `'dark'` (resolved)

### WebXR Component Guidelines
When creating new WebXR/3D components:
- **Never enable SSR**: Use `dynamic(() => import(), { ssr: false })` for all 3D components
- **Wrap with ErrorBoundary**: Use `withErrorBoundary` HOC with componentName for proper fallback selection
- **Performance monitoring**: Wrap dynamic imports with `measureChunkLoad` for loading metrics
- **Material opacity**: Use `useFrame` to traverse and update material opacity for fade effects
- **Auto-hide threshold**: Components with opacity < 0.01 should be automatically hidden
- **Font consistency**: Use GT Eesti Display Bold for all 3D text elements

### Animation System Usage
Choose the correct animation system for your use case:
- **3D Animations**: Use `useSimpleLerp` or `useCardAnimation` for 3D position/rotation/scale.
  - Leverages R3F `useFrame` for performance.
  - Mapped presets: `gentle`, `bouncy`, `quick`, `slow`.
- **Motion Library** (`motion` package): For 2D DOM animations and transitions
  - Use spring transitions with configured presets
  - Use variants for complex animation sequences

### Error Handling Best Practices
- **Component-level**: Wrap interactive components with `withErrorBoundary` HOC
- **API routes**: Always validate input with type guards before processing
- **Rate limiting**: Implement per-IP rate limiting for public APIs (see `/app/api/errors/route.ts`)
- **Sanitization**: Remove sensitive data (stack traces, tokens) from client responses
- **Logging**: Use console logging for client-side errors; implement custom monitoring as needed.

### Mouse Interaction Pattern
When adding hover effects or custom cursor states:
1. Add new cursor type to `MouseContext` type definition
2. Call `setCursorType()` on mouseEnter/mouseLeave events
3. For attraction effects, use `setAttractorPosition()` with element position
4. DotRing automatically handles visual transitions

### MDX Content Workflow
Adding new work portfolio items:
1. Create `.mdx` file in `/content/works/` directory
2. Add required frontmatter: `title`, `description`, `date`, `tags`, `image`
3. Optionally add `externalLink` for external project URLs
4. Images should be placed in `/public/images/works/`
5. Run `pnpm dev` to verify MDX compilation

### Testing Requirements
Before merging code:
- **Unit tests**: Required for all new utilities, hooks, and contexts
- **Component tests**: Required for new UI components with user interactions
- **E2E tests**: Required for new routes or critical user flows
- **Coverage**: Maintain existing coverage levels (check with `pnpm test:coverage`)
- **WebXR tests**: Add to `WEBXR_TESTS` suite if modifying 3D components

### Performance Optimization Checklist
When adding new features:
- [ ] Dynamic imports for code splitting (especially 3D components)
- [ ] `useMemo` for expensive calculations or object creation
- [ ] `useCallback` for event handlers passed as props
- [ ] RAF-based updates for high-frequency events (scroll, mousemove)
- [ ] Lazy loading for images and media
- [ ] Verify bundle impact with `pnpm analyze`

### Git Workflow
- **Branch naming**: `feature/`, `fix/`, `hotfix/`, `release/` prefixes
- **Commit style**: Conventional commits (feat:, fix:, chore:, docs:, etc.)
- **Commit titles**: Under 50 characters, all lowercase
- **Before merging**: Run `pnpm check && pnpm build && pnpm test:all`
- **Main branch**: Production deployments only
- **Develop branch**: Integration branch for features
