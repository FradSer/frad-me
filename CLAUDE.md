# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for Frad LEE (frad.me) built with Next.js 16, featuring portfolio/work showcase with MDX content, an AI chat assistant (Vercel AI SDK v6), WebXR/VR experiences with React Three Fiber, and a WebMCP integration page.

## Common Development Commands

```bash
pnpm dev              # Start dev server on localhost:3000
pnpm build            # Production build (Turbopack by default)
pnpm check            # Biome format + lint + import organize (recommended before commit)
pnpm test             # Jest unit tests
pnpm test path         # Run specific test, e.g. pnpm test utils/__tests__/mdx.test.ts
pnpm test:e2e         # Playwright E2E tests
pnpm test:all         # Unit + E2E
pnpm analyze          # Bundle analysis (forces webpack mode)
```

**Before merging:** `pnpm check && pnpm build && pnpm test:all`

**Testing:**
```bash
pnpm test         # Run unit tests (Jest)
pnpm test:watch   # Run unit tests in watch mode
pnpm test:ci      # Run unit tests with coverage for CI
pnpm test:coverage # Run unit tests with coverage report
pnpm test:e2e     # Run end-to-end tests (Playwright)
pnpm test:e2e:ui  # Run E2E tests with interactive UI
pnpm test:e2e:headed # Run E2E tests in headed mode (visible browser)
pnpm test:all     # Run all tests (unit + E2E) — note: internally uses npm run

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

### Routes

| Route | Purpose |
|---|---|
| `/` | Home/landing with work cards and AI chat section |
| `/works/[slug]` | Individual work case studies (MDX) |
| `/resume` | Resume page |
| `/webxr` | Immersive WebXR 3D experience |
| `/xr` | Redirects to `/webxr` |
| `/webmcp` | WebMCP AI tools page |
| `/api/chat` | AI chat endpoint (GET: enabled check, POST: streaming chat) |
| `/api/content` | Content API for portfolio data |

### Dual Layout System

`ClientLayout` (`app/client-layout.tsx`) uses `useXRDetect` hook to switch between:
- **StandardLayout**: Traditional web with Header navigation, DotRing custom cursor, theme switching
- **VRLayout**: Immersive WebXR with 3D navigation, completely isolated from global UI

### AI Chat System

The "ask" section on the homepage uses Vercel AI SDK v6 with an OpenAI-compatible provider:
- **Client**: `useChat` from `@ai-sdk/react` sends `UIMessage` format (with `parts`, not `content`)
- **Server**: `app/api/chat/route.ts` uses `safeValidateUIMessages` + `convertToModelMessages` to convert between UI and model message formats
- **Tools**: `get_works`, `read_work`, `search_works`, `get_resume` — allow the AI to look up portfolio and resume data
- **Rate limiting**: 20 requests/IP/minute, in-memory
- **Environment variables**: `AI_API_KEY` (required), `AI_BASE_URL` (optional, for non-OpenAI providers like Dashscope), `AI_MODEL_ID` (optional, defaults to `gpt-4o-mini`)
- Feature is hidden from UI when `AI_API_KEY` is not set

### Content Management

- `content/works/*.mdx`: Portfolio case studies with frontmatter (`title`, `description`, `date`, `tags`, `image`, optional `externalLink`)
- `content/workLinks.ts`, `content/headerLinks.ts`, `content/footerLinks.ts`: Link configuration
- `content/resume.ts`: Structured resume data used by both `/resume` page and AI chat tools
- `utils/mdx.ts`: MDX processing with mdx-bundler

### WebXR Experience

- `/webxr` route uses `fixed inset-0` to overlay standard navigation
- `WebXRViewContext`: State management for `home` ↔ `work` view transitions
- `Navigation3D.tsx`: Single toggle button with breathing animation and spring physics
- `FooterLinks3D.tsx`: 3D-positioned external links visible only in home view
- Animation: `useSimpleLerp` hook with R3F `useFrame` and `THREE.MathUtils.lerp`; presets: `gentle`, `bouncy`, `quick`, `slow`
- Spring physics via `SpringScalar` class in `utils/webxr/animationHelpers.ts`

### Mouse Interaction System

- `MouseContext`: Centralized cursor state management
- `DotRing`: Custom cursor with spring physics (stiffness 300, damping 30) and attraction effects
- Cursor states: `default`, `header-link-hovered`, `work-card-hovered`, `attracted`
- To add hover effects: update `MouseContext` type → call `setCursorType()` on mouseEnter/Leave → DotRing handles visual transitions

### Error Handling

Progressive fallback: WebXR → 3D → 2D. Use `withErrorBoundary` HOC with `componentName` for proper fallback selection. Rate limiting example is in `app/api/chat/route.ts`.

## Key Technologies

- **Next.js 16** with App Router, Turbopack (default), TypeScript strict mode
- **React 19**, **Tailwind CSS v4** (configured via `@tailwindcss/postcss` and CSS, no `tailwind.config.js`)
- **Vercel AI SDK v6** (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`) for chat
- **React Three Fiber** ecosystem (`@react-three/fiber` v9, `@react-three/drei` v10, `@react-three/xr` v6)
- **Motion** v12 for 2D DOM animations
- **MDX** with mdx-bundler, **next-themes** for dark mode
- **Million.js** for React optimization (wraps next config)
- **Biome** 2.x for formatting/linting, **Jest** 30 for unit tests, **Playwright** for E2E

## Code Style

- **Biome**: Single quotes, 2-space indent, line width 100, import organization enabled, CSS Tailwind directives support
- **TypeScript**: Strict mode, path alias `@/*`, ES5 target, ESNext modules
- **Conventions**: `use client` directive for client components; PascalCase filenames for hooks/contexts; `camelCase` for variables/functions; absolute imports via `@/`
- **Commits**: Lowercase conventional commits (`feat:`, `fix:`, `chore:`), titles under 50 characters

## Critical Implementation Patterns

### WebXR Components
- **Never enable SSR**: Use `dynamic(() => import(), { ssr: false })`
- **Wrap with ErrorBoundary**: Use `withErrorBoundary` HOC
- **Material opacity**: Use `useFrame` to traverse and update; auto-hide when opacity < 0.01
- **Font**: GT Eesti Display Bold for all 3D text

### Theme System
- Use `useTheme()` from next-themes; always check `isMounted` before rendering theme-dependent content
- Theme values: `'light'` | `'dark'` | `'system'` (preference) / `'light'` | `'dark'` (resolved)

### Animation System
- **3D**: `useSimpleLerp` or `useCardAnimation` via R3F `useFrame`
- **2D DOM**: `motion` package with spring transitions and variants

### Header Contrast
The header uses `mix-blend-difference` with white source color for automatic contrast inversion over imagery. Header icons must use `fill-current`, not hardcoded fills. Do not add opaque backgrounds inside the header.

### MDX Content Workflow
1. Create `.mdx` in `content/works/` with frontmatter: `title`, `description`, `date`, `tags`, `image`
2. Images go in `public/images/works/`
3. Optionally add `externalLink` for external project URLs
