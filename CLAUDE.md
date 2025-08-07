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
pnpm lint         # Run ESLint with Next.js rules
pnpm format       # Format code with Prettier and import ordering
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

### Key Components Organization
- **components/**: Organized by feature/page
  - `Landing/`: Hero section with 3D elements, Work showcase
  - `WebXR/`: VR/AR components using React Three Fiber
    - `WebXRErrorBoundary.tsx`: Comprehensive error boundary with progressive fallback (webxr → 3d → 2d)
    - `WebXR2DFallback.tsx`: 2D fallback experience
    - `WebXR3DFallback.tsx`: 3D fallback with quality-based rendering
    - `GeneralCanvas.tsx`: WebGL canvas with error handling
    - `Fallback3D/`: Complete 3D fallback experience components
  - `WorkPage/`: MDX-based work detail components
  - `Header/`: Navigation with theme switcher
  - `common/`: Shared components (LayoutWrapper, ErrorBoundary)

### Content Management
- **content/**: MDX files for work portfolio
  - `works/`: Individual work case studies (.mdx files)
  - Link configuration files for navigation
- **utils/mdx.ts**: MDX processing with mdx-bundler

### State Management & Architecture Patterns
- **contexts/**: React contexts for global state
  - `Mouse/`: Custom mouse cursor functionality and physical attraction effects
- **hooks/**: Custom React hooks
  - `useXRDetect.ts`: WebXR capability detection with loading states
  - `useLoading.ts`: Loading state management
  - `useMouseContext.ts`, `useMousePosition.ts`: Mouse interaction hooks
  - `usePhysicalAttraction.ts`: Mouse attraction physics
  - `useSpeechSynthesis.ts`: Web Speech API integration
  - `useWindowSize.ts`: Responsive design utilities
  - `use3DFallbackState.ts`: 3D fallback quality management

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
- XR detection determines layout rendering (Standard vs VR layout)

**WebXR Error Handling:**
- Comprehensive error boundary system with 3-tier fallback
- Automatic capability detection (WebXR, WebGL support)
- Error logging with offline queue and analytics integration
- Security-focused error collection API with rate limiting

**MDX Content:**
- Work case studies in `/content/works/` as `.mdx` files
- Custom MDX components in `components/WorkPage/MDXComponents.tsx`
- Frontmatter includes cover, title, description, platforms, contributors

**Performance Optimization:**
- Million.js compiler integration for React optimization
- Dynamic imports for heavy 3D components
- Quality-based 3D rendering in fallback scenarios
- Bundle analysis available via `pnpm analyze`

**Mouse Interaction System:**
- Custom cursor with physical attraction effects
- Context-based mouse position tracking
- Optimized for performance with throttling

**Styling System:**
- Custom Tailwind config extends grid system (16-column grid)
- Dark mode implemented with class-based switching
- Custom aspect ratios and font families configured
- GT Eesti font family with multiple weights and styles

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