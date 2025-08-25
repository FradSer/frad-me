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
pnpm format       # Format all files with Biome
pnpm lint         # Lint and apply safe fixes with Biome  
pnpm check        # Format, lint, and organize imports with Biome
pnpm release      # Create release with conventional changelog
```

**Testing:**
```bash
pnpm test         # Run unit tests (Jest)
pnpm test:watch   # Run unit tests in watch mode
pnpm test:ci      # Run unit tests with coverage for CI
pnpm test:coverage # Run unit tests with coverage report
pnpm test:e2e     # Run end-to-end tests (Playwright)
pnpm test:e2e:ui  # Run E2E tests with UI
pnpm test:e2e:headed # Run E2E tests in headed mode (visible browser)
pnpm test:all     # Run all tests (unit + E2E)
```

**Package Management:**
- Uses `pnpm` as package manager
- Node.js version: 22.x (specified in engines)

## Architecture

### Core Structure (App Router)
- **app/**: Next.js App Router structure
  - `layout.tsx`: Root layout with metadata and font loading
  - `page.tsx`: Landing page with Hero and Work sections
  - `client-layout.tsx`: Client-side layout with XR detection and theme provider
  - `webxr/page.tsx`: WebXR experience page with error boundaries
  - `works/[slug]/page.tsx`: Dynamic work detail pages from MDX content
  - `api/errors/route.ts`: API endpoint for WebXR error logging

### Dual Layout Architecture
The application uses smart layout switching based on WebXR capability detection:

- **StandardLayout**: Traditional web experience with Header navigation, mouse interactions, and theme switching
- **VRLayout**: Immersive WebXR experience with 3D navigation, isolated from global UI elements
- **ClientLayout Detection**: `useXRDetect` hook determines which layout to render

### WebXR Experience Architecture
- **Pure 3D Interface**: `/webxr` page uses `fixed inset-0` positioning to completely overlay standard navigation
- **3D Navigation System**: 
  - `Navigation3D.tsx`: Single toggle button (home/work) with breathing animation and spring physics
  - `FooterLinks3D.tsx`: External links (resume, calendly) positioned in 3D space, visible only in home view
- **WebXRViewContext**: Centralized state management for view transitions (`home` ↔ `work`)

### Key Components Organization
- **components/**: Organized by feature/page
  - `Landing/`: Hero section with 3D elements, Work showcase
  - `WebXR/`: VR/AR components using React Three Fiber
    - `HeroText.tsx`: 3D hero content with spring-based fade animations
    - `WorkGrid3D/`: 3D work portfolio grid with lighting and positioning utilities
    - `WorkCard3D/`: Individual work cards with hover effects and interactions
    - `GeneralCanvas.tsx`: WebGL canvas with XR store integration
    - Error boundaries with progressive fallback (webxr → 3d → 2d)
  - `WorkPage/`: MDX-based work detail components
  - `Header/`: Navigation with theme switcher (hidden in WebXR mode)
  - `common/`: Shared components (LayoutWrapper, ErrorBoundary)

### Content Management
- **content/**: MDX files for work portfolio
  - `works/`: Individual work case studies (.mdx files)
  - Link configuration files (`workLinks.ts`, `headerLinks.ts`, `footerLinks.ts`)
- **utils/mdx.ts**: MDX processing with mdx-bundler

### State Management & Animation System
- **contexts/**: React contexts for global state
  - `WebXR/WebXRViewContext.tsx`: WebXR view state and navigation transitions
  - `Mouse/`: Custom mouse cursor functionality and physical attraction effects
- **hooks/**: Custom React hooks
  - `useXRDetect.ts`: WebXR capability detection with loading states
  - `useSpringAnimation.ts`: Custom spring physics system for 3D animations
  - Mouse interaction hooks, window utilities, loading states
- **utils/webxr/**: WebXR-specific utilities
  - `animationConstants.ts`: Spring configs and entrance positions
  - `materialUtils.ts`: 3D material opacity management 
  - `workGridUtils.ts`: 3D grid layout calculations
  - `animationHelpers.ts`: Hero text animation states and transitions

### Error Handling System
- **Progressive Fallback**: WebXR → 3D → 2D fallback levels
- **utils/errorLogger.ts**: Comprehensive error logging with:
  - Rate limiting and input sanitization
  - Offline queue support
  - Analytics integration (Google Analytics, Sentry)
  - WebXR/WebGL capability detection
- **app/api/errors/route.ts**: Secure error collection API with validation
- **Security Features**: Input sanitization, rate limiting, secure logging

### Testing Infrastructure
- **src/__tests__/**: Unit and component tests using Jest + React Testing Library
  - `WebXRErrorBoundary.test.tsx`: Error boundary functionality tests
  - `mdx.test.ts`: MDX utilities and content processing tests
  - `performance.test.ts`: Performance monitoring tests
- **tests/e2e/**: End-to-end tests using Playwright
  - `navigation.spec.ts`: Navigation and theme switching tests
  - `works.spec.ts`: Work portfolio functionality tests
  - `theme-responsive.spec.ts`: Theme and responsive behavior tests
- **Configuration**: 
  - `jest.config.js`: Jest configuration with Next.js integration
  - `jest.setup.js`: Global test setup with mocks for Next.js, framer-motion, and 3D libraries
  - `playwright.config.ts`: Playwright multi-browser testing setup

## Key Technologies

**Frontend Stack:**
- Next.js 14 with App Router and TypeScript
- React 18 with Tailwind CSS
- Framer Motion for animations
- next-themes for dark mode

**3D/XR Features:**
- React Three Fiber ecosystem (@react-three/fiber, @react-three/drei, @react-three/xr)
- Three.js for 3D graphics
- WebXR for VR/AR experiences
- Comprehensive error boundaries with progressive fallback

**Content & Styling:**
- MDX with mdx-bundler for content
- Custom Tailwind configuration with GT Eesti fonts
- Million.js for React optimization

## Development Notes

**App Router Architecture:**
- Client components are explicitly marked with 'use client'
- Server components handle static content and SEO
- Dynamic imports for WebXR components (SSR disabled)
- Dual layout system: StandardLayout vs VRLayout determined by XR capability detection

**WebXR Animation System:**
- Custom spring physics using `useSpringAnimation` hook with `SpringScalar` class
- Material opacity management through `useFrame` hook traversing Three.js object hierarchies
- Performance optimization: components hidden when opacity < 0.01
- Animation states defined in `animationHelpers.ts` with smooth transitions between home/work views

**WebXR Navigation Design:**
- Single toggle navigation (home ↔ work) with breathing animation effects
- GT Eesti Display Bold font consistency across all 3D text elements
- 3D positioned external links (resume, calendly) visible only in home view
- Complete isolation from global navigation when in WebXR mode

**WebXR Error Handling:**
- Comprehensive error boundary system with 3-tier fallback
- Automatic capability detection (WebXR, WebGL support)
- Error logging with offline queue and analytics integration
- Security-focused error collection API with rate limiting

**Content & Typography:**
- Work case studies in `/content/works/` as `.mdx` files
- GT Eesti font family with multiple weights and styles
- Custom Tailwind config extends grid system (16-column grid)
- Dark mode implemented with class-based switching

**Performance Optimization:**
- Million.js compiler integration for React optimization
- Dynamic imports for heavy 3D components with `measureChunkLoad` performance monitoring
- Bundle analysis available via `pnpm analyze`
- Custom mouse cursor with physical attraction effects and throttled position tracking

## Build Configuration

**Next.js Setup:**
- App Router with TypeScript strict mode
- Million.js integration for React optimization
- Transpiled packages for 3D libraries compatibility
- Path aliases (`@/*`) for clean imports
- Font optimization via next/font

**Security & Quality:**
- SonarCloud integration for code quality monitoring
- ESLint with Next.js, TypeScript, and React Three Fiber rules
- Input sanitization in error logging
- Rate limiting on API endpoints

**Development Tools:**
- Prettier with import ordering and Tailwind class sorting
- Release-it with conventional changelog generation
- Vercel Analytics and Speed Insights integration
- Cross-browser testing with Playwright