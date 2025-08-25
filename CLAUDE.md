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
pnpm dev:https    # Start development server with HTTPS certificates
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
pnpm test:e2e navigation.spec.ts
```

**Package Management:**
- Uses `pnpm` as package manager
- Node.js version: 22.x (specified in engines)

## Architecture

### Core Structure (App Router)
- **app/**: Next.js App Router structure with TypeScript strict mode
  - `layout.tsx`: Root layout with metadata and GT Eesti font loading
  - `page.tsx`: Landing page combining Hero and Work sections
  - `client-layout.tsx`: Client-side layout with XR detection and theme provider
  - `webxr/page.tsx`: WebXR experience page with comprehensive error boundaries
  - `works/[slug]/page.tsx`: Dynamic work detail pages from MDX content
  - `api/errors/route.ts`: Secure API endpoint for WebXR error logging with rate limiting

### Dual Layout Architecture
The application uses smart layout switching based on WebXR capability detection:

- **StandardLayout**: Traditional web experience with Header navigation, mouse interactions, and theme switching
- **VRLayout**: Immersive WebXR experience with 3D navigation, completely isolated from global UI elements
- **ClientLayout Detection**: `useXRDetect` hook determines which layout to render based on device capabilities

### WebXR Experience Architecture
- **Pure 3D Interface**: `/webxr` route uses `fixed inset-0` positioning to completely overlay standard navigation
- **3D Navigation System**: 
  - `Navigation3D.tsx`: Single toggle button (home/work) with breathing animation and spring physics
  - `FooterLinks3D.tsx`: External links (resume, calendly) positioned in 3D space, visible only in home view
- **WebXRViewContext**: Centralized state management for view transitions (`home` ↔ `work`)
- **Spring Animation System**: Custom `useSpringAnimation` hook with `SpringScalar` class for smooth 3D transitions

### Test Structure (Best Practices)
Tests are organized following Jest and Next.js best practices with colocated testing:

```
utils/
├── mdx.ts
└── __tests__/          # Unit tests next to source code
    ├── mdx.test.ts
    └── errorLogger.test.ts

components/
├── WebXR/
│   ├── WorkCard3D/
│   └── __tests__/      # Component tests colocated
│       └── WorkCard3D.test.tsx

__tests__/              # Project-level tests
├── integration/        # Integration tests
│   └── webxr-flow.test.tsx
├── e2e/               # E2E tests (Playwright)
│   ├── navigation.spec.ts
│   └── works.spec.ts
└── webxr-mocks.ts     # Shared test utilities
```

### Key Components Organization
- **components/**: Organized by feature/page with colocated tests
  - `Landing/`: Hero section with 3D elements, Work showcase
  - `WebXR/`: VR/AR components using React Three Fiber ecosystem
    - `HeroText.tsx`: 3D hero content with spring-based fade animations
    - `WorkGrid3D/`: 3D work portfolio grid with lighting and positioning utilities
    - `WorkCard3D/`: Individual work cards with hover effects and interactions
    - `GeneralCanvas.tsx`: WebGL canvas with XR store integration
    - Error boundaries with progressive fallback (webxr → 3d → 2d)
  - `WorkPage/`: MDX-based work detail components with custom styling
  - `Header/`: Navigation with theme switcher (automatically hidden in WebXR mode)
  - `common/`: Shared components (LayoutWrapper, ErrorBoundary, WebXRErrorBoundary)

### Content Management
- **content/**: MDX files and configuration for work portfolio
  - `works/`: Individual work case studies (.mdx files) with frontmatter
  - Link configuration files (`workLinks.ts`, `headerLinks.ts`, `footerLinks.ts`)
- **utils/mdx.ts**: MDX processing with mdx-bundler, including compilation and frontmatter extraction

### State Management & Animation System
- **contexts/**: React contexts for global state management
  - `WebXR/WebXRViewContext.tsx`: WebXR view state and navigation transitions
  - `Mouse/`: Custom mouse cursor functionality with physical attraction effects
- **hooks/**: Custom React hooks for functionality
  - `useXRDetect.ts`: WebXR capability detection with loading states and fallbacks
  - `useSpringAnimation.ts`: Custom spring physics system for 3D animations
  - Mouse interaction hooks, window utilities, loading states
- **utils/webxr/**: WebXR-specific utilities and constants
  - `animationConstants.ts`: Spring configurations and entrance positions
  - `materialUtils.ts`: 3D material opacity management through Three.js traversal
  - `workGridUtils.ts`: 3D grid layout calculations and positioning
  - `animationHelpers.ts`: Hero text animation states and smooth transitions

### Error Handling System
- **Progressive Fallback Architecture**: WebXR → 3D → 2D fallback levels with comprehensive error boundaries
- **utils/errorLogger.ts**: Comprehensive error logging system with:
  - Rate limiting and input sanitization for security
  - Offline queue support with localStorage
  - Analytics integration (Google Analytics, Sentry) with proper TypeScript interfaces
  - WebXR/WebGL capability detection and reporting
- **app/api/errors/route.ts**: Secure error collection API with validation and rate limiting
- **Security Features**: Input sanitization, rate limiting, secure logging with environment-based configuration

## Key Technologies

**Frontend Stack:**
- Next.js 14 with App Router and TypeScript strict mode
- React 18 with Tailwind CSS and custom 16-column grid system
- Framer Motion for 2D animations and transitions
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
- Biome for formatting, linting, and import organization (replaced ESLint/Prettier)
- Jest with React Testing Library for unit and integration testing
- Playwright for end-to-end testing across browsers
- SonarCloud integration for continuous code quality monitoring

## Development Notes

**WebXR Animation System:**
- Custom spring physics using `SpringScalar` class with configurable dampening and stiffness
- Material opacity management through `useFrame` hook traversing Three.js object hierarchies
- Performance optimization: components automatically hidden when opacity < 0.01
- Animation states defined in `animationHelpers.ts` with smooth transitions between home/work views
- GT Eesti Display Bold font consistency across all 3D text elements

**WebXR Navigation Design:**
- Single toggle navigation (home ↔ work) with breathing animation effects using spring physics
- 3D positioned external links (resume, calendly) visible only in home view with proper depth sorting
- Complete isolation from global navigation when in WebXR mode to prevent interference
- Automatic layout switching based on device WebXR capabilities

**Content & Typography:**
- Work case studies stored in `/content/works/` as `.mdx` files with structured frontmatter
- Custom Tailwind configuration extends utility classes for consistent design language
- Dark mode implementation with class-based switching and proper color token management

**Performance Optimization:**
- Million.js compiler integration for React optimization and reduced bundle size
- Dynamic imports for heavy 3D components with `measureChunkLoad` performance monitoring
- Bundle analysis available via `pnpm analyze` for optimization insights
- Custom mouse cursor with physical attraction effects using throttled position tracking

**Build Configuration:**
- App Router with TypeScript strict mode and path aliases (`@/*`) for clean imports
- Million.js integration with transpiled packages for 3D libraries compatibility
- Font optimization via next/font with preloading for GT Eesti font family
- Vercel Analytics and Speed Insights integration for performance monitoring