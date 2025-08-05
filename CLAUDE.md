# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js personal website for Frad LEE built with TypeScript, featuring:
- Portfolio/work showcase with MDX content
- WebXR/VR capabilities with React Three Fiber
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

### Core Structure
- **pages/**: Next.js pages using Pages Router pattern
  - `index.tsx`: Landing page with Hero and Work sections
  - `works/[slug].tsx`: Dynamic work detail pages from MDX content
  - `webxr.tsx`: WebXR experience page with 3D models
  - `_app.tsx`: App wrapper with theme provider and XR detection
  - `_document.js`: Custom document for font loading
  - `api/hello.ts`: Example API route

### Key Components Organization
- **components/**: Organized by feature/page
  - `Landing/`: Hero section with 3D elements, Work showcase
  - `WebXR/`: VR/AR components using React Three Fiber
  - `WorkPage/`: MDX-based work detail components
  - `Header/`: Navigation with theme switcher
  - `common/`: Shared components (LayoutWrapper, etc.)

### Content Management
- **content/**: MDX files for work portfolio
  - `works/`: Individual work case studies (.mdx files)
  - Link configuration files for navigation
- **utils/mdx.ts**: MDX processing with mdx-bundler

### State Management
- **contexts/**: React contexts for global state
  - `Mouse/`: Custom mouse cursor functionality and physical attraction effects
- **hooks/**: Custom React hooks
  - `useXRDetect.ts`: WebXR capability detection
  - `useLoading.ts`: Loading state management
  - `useMouseContext.ts`, `useMousePosition.ts`: Mouse interaction hooks
  - `usePhysicalAttraction.ts`: Mouse attraction physics
  - `useSpeechSynthesis.ts`: Web Speech API integration
  - `useWindowSize.ts`: Responsive design utilities

### Testing Infrastructure
- **src/__tests__/**: Unit and component tests using Jest + React Testing Library
  - `mdx.test.ts`: Tests for MDX utilities and content processing
- **tests/e2e/**: End-to-end tests using Playwright
  - `navigation.spec.ts`: Navigation and theme switching tests
  - `works.spec.ts`: Work portfolio functionality tests
- **Configuration**: 
  - `jest.config.js`: Jest configuration with Next.js integration
  - `jest.setup.js`: Global test setup with mocks for Next.js, framer-motion, and 3D libraries
  - `playwright.config.ts`: Playwright multi-browser testing setup

## Key Technologies

**Frontend Stack:**
- Next.js 14 with TypeScript
- React 18 with Tailwind CSS
- Framer Motion for animations
- next-themes for dark mode

**3D/XR Features:**
- React Three Fiber ecosystem (@react-three/fiber, @react-three/drei, @react-three/xr)
- Three.js for 3D graphics
- WebXR for VR/AR experiences

**Content & Styling:**
- MDX with mdx-bundler for content
- Custom Tailwind configuration with GT Eesti fonts
- Million.js for React optimization

## Development Notes

**MDX Content:**
- Work case studies are in `/content/works/` as `.mdx` files
- Custom MDX components in `components/WorkPage/MDXComponents.tsx`
- Frontmatter includes cover, title, description, platforms, contributors

**WebXR Integration:**
- XR detection in `_app.tsx` renders different UI for VR users
- WebXR components are dynamically imported (SSR disabled)
- 3D models stored in `/public/` (.gltf files)

**Styling System:**
- Custom Tailwind config extends grid system (16-column grid)
- Dark mode implemented with class-based switching
- Custom aspect ratios and font families configured

**Performance:**
- Million.js compiler integration
- Dynamic imports for WebXR components
- Vercel Analytics and Speed Insights integrated

## Build Configuration

**Next.js Setup:**
- Million.js integration for React optimization
- Transpiled packages for 3D libraries compatibility
- Custom font loading via `_document.js`
- TypeScript with strict mode and path aliases (`@/*`)

**Tailwind Configuration:**
- JIT mode enabled for optimal build size
- Custom GT Eesti font family integration  
- Extended grid system (16-column layout)
- Custom aspect ratios for responsive design
- Class-based dark mode switching

**Development Tools:**
- ESLint with Next.js, TypeScript, and React Three Fiber rules
- Prettier with import ordering and Tailwind class sorting
- SonarJS plugin for code quality analysis
- Release-it with conventional changelog generation