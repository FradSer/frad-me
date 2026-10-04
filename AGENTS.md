# Repository Guidelines

This file provides guidance for contributors and AI coding agents working in this repository.

## Project Overview

Personal website for Frad LEE (frad.me) built with Next.js 16 App Router, featuring a portfolio of MDX case studies, an AI chat assistant (Vercel AI SDK v7 via Vercel AI Gateway), and WebMCP integration.

## Project Structure & Module Organization

This is a self-contained single-package pnpm workspace (`pnpm-workspace.yaml` includes `.` only). No internal shared kit (`@fradser/pi-kit`) exists for this repo; keep framework-free helpers under `utils/` instead of adding an unverified registry dependency.

- `app/`: App Router entry points, layouts, route handlers (`app/api/chat/route.ts`), and route-level clients (`client-layout.tsx`, `work-page-client.tsx`, `resume-page-client.tsx`).
- `components/`: Reusable UI grouped by feature (`Header/`, `Landing/`, `Chat/`, `WorkPage/`, `webmcp/`, `common/`, `Mouse/`, `ThemeScript.tsx`); colocated tests under `__tests__/`.
- `contexts/`: Cross-cutting providers (`Mouse/`, `Theme/`, `WebMCP/`), each paired with typed hook interfaces.
- `hooks/`: Shared React hooks (`useMouseContext`, `useThemeMode`, `useWebMCP`, ...).
- `content/`: Structured metadata (`workLinks.ts`, `resume.ts`, `strudelPiece.ts`) consumed by pages and the AI chat tools.
- `markdown/works/*.mdx`: MDX case studies rendered by `/works/[slug]`.
- `utils/`: Framework-free helpers (`slugMapping.ts`, `workContent.ts`, `workList.ts`, `githubActivity.ts`, motion helpers in `motion/`).
- `types/`: Shared `.d.ts` and type declarations.
- `tests/features/`: BDD `.feature` specs (Gherkin) paired with source-assertion Jest tests.
- `test/__mocks__/`: Jest module mocks.

WebMCP uses `@mcp-b/global` v5. Await every `registerTool()` promise before reporting
readiness, and share an `AbortSignal` to cancel registrations together on failure or cleanup.

## Common Development Commands

```bash
pnpm dev              # Start dev server on localhost:3000
pnpm build            # Production build
pnpm start            # Serve production build
pnpm check            # Biome format + lint + import organize (recommended before commit)
pnpm test             # Jest unit/integration tests (jsdom)
pnpm test <path>      # Run specific test, e.g. pnpm test app/api/chat/__tests__/route.test.ts
pnpm test:watch       # Jest watch mode
pnpm test:ci          # Jest with coverage (CI mode)
pnpm test:all         # CI tests
pnpm analyze          # Bundle analysis (forces webpack mode)
```

**Before merging:** `pnpm check && pnpm build && pnpm test`

Production deploys run on Vercel via Git push to `main`; `vercel.json` pins the install command to pnpm 11 through corepack — do not remove it or lockfile resolution fails.

## Architecture

### Routes

| Route | Purpose |
|---|---|
| `/` | Home/landing with work cards and AI chat section |
| `/works/[slug]` | Individual work case studies (MDX) |
| `/resume` | Resume page |
| `/webmcp` | WebMCP AI tools page |
| `/api/chat` | AI chat endpoint (GET: enabled check, POST: streaming chat) |
| `/api/content` | Content API for portfolio data |

### Root Client Layout

`ClientLayout` (`app/client-layout.tsx`) provides the global client shell:
- **Providers**: ErrorBoundary → WebMCPProvider → MouseContextProvider → ThemeModeProvider
- **Global UI**: DotRing custom cursor, LayoutWrapper with Header/Footer
- It calls `usePathname()` to stay request-aware under Cache Components

### AI Chat System

The "ask" section on the homepage uses Vercel AI SDK v7 (`ai@^7`, `@ai-sdk/gateway`) via Vercel AI Gateway as the sole AI provider:
- **Client**: `useChat` from `@ai-sdk/react` sends `UIMessage` format (with `parts`, not `content`)
- **Server**: `app/api/chat/route.ts` converts between UI and model message formats
- **Tools**: `get_works`, `read_work`, `search_works`, `get_resume`, `get_recent_activity` (live GitHub data from `utils/githubActivity.ts`, ~10-minute cache) — keep BDD scenarios in sync when adding tools
- **Rate limiting**: 20 requests/IP/minute, in-memory
- **Environment variables**: `AI_GATEWAY_API_KEY` (or Vercel OIDC when hosted); optional `AI_GATEWAY_MODEL_ID` in `provider/model` form (defaults to `alibaba/qwen3.7-flash`). See `.env.example`. Feature is hidden from UI when the gateway is not configured.

### Content Management

- `markdown/works/*.mdx` export an `export const metadata: WorkFrontmatter` with fields defined in `types/work.ts`: `title`, `description`, plus optional `cover`, `coverBackground`, `platforms`, `contributors`, `site`, `nextWork`
- Images live in `public/works/<slug>/`
- `content/workLinks.ts` drives homepage work cards (including external/WIP links); `/works/[slug]` reads metadata straight from each MDX module
- MDX rendering via `@next/mdx`; `utils/workContent.ts` handles plain-text extraction for AI tools
- `docs/strudel/frad-me.strudel.js` is a paste-ready mirror of `content/strudelPiece.ts` for strudel.cc — keep the two in sync

### Mouse Interaction System

- `contexts/Mouse/MouseContext`: centralized cursor state; cursor types are the `CursorType` enum (`default`, `header-link-hovered`, `work-card-hovered`, `work-card-hovered-wip`, `button-hovered`, `attracted`, `input-active`)
- To add hover effects: extend the `CursorType` enum → call `setCursorType()` on mouseEnter/Leave → DotRing handles visual transitions

## Key Technologies

- **Next.js 16** App Router with Cache Components, TypeScript strict mode
- **React 19**, **Tailwind CSS v4** (configured via `@tailwindcss/postcss` and CSS, no config file)
- **Vercel AI SDK v7** (`ai`, `@ai-sdk/gateway`, `@ai-sdk/react`) for chat
- **Motion** v14 for animations; shared helpers in `utils/motion/`
- **MDX** via `@next/mdx`; **Million.js** wraps the Next config
- **Biome** 2.x for formatting/linting, **Jest** 30 for unit/integration tests
- Custom theme system in `contexts/Theme/` (`light` / `dark` / `system` preference, resolved value persisted under the `theme` storage key); no third-party theming library

## Coding Style & Naming Conventions

- Biome: single quotes, 2-space indent, line width 100, import organization enabled, Tailwind directives support
- TypeScript strict mode; path alias `@/*`; files under 300 lines, functions under 50 lines
- Explicit `use client` directive for client components; shared utilities remain server-safe
- Hooks/providers use PascalCase filenames with default exports; variables/functions are camelCase
- Absolute imports via `@/`; group React/third-party/local imports in that order
- Tailwind utility classes inline; prefer semantic helper constants (`utils/constants.ts`)

## Testing Guidelines

- Jest (jsdom) for units/integration.
- Follow BDD: add or update a scenario in `tests/features/**/*.feature` first, then pair it with a Jest test that asserts the implementation source (see `tests/features/theme/no-client-script-error.feature` → `__tests__/integration/theme-root-layout.test.tsx`).
- Mirror the source tree for test placement (`*.test.ts(x)` next to the subject or in feature-level `__tests__/`).
- Snapshot usage is discouraged; favor explicit assertions on DOM or state.
- `jest.setup.js` mocks `motion/react` primitives, `matchMedia`, observers, and storage — extend it there rather than per-test when adding new animation APIs.

## UI Contrast Patterns

- Header navigation applies `mix-blend-difference` with a white source color so typography and glyphs automatically invert over imagery; keep the header background transparent to preserve that effect.
- Header icons must use `fill-current` (not hardcoded fills) to inherit the navigation color and participate in the inversion.
- Avoid adding opaque layers inside the header unless isolated in a nested wrapper; solid backgrounds break the inversion strategy.
- Preserve the fixed header shimming structure (`motion.header` with `pointer-events-none` → inner `layout-wrapper pointer-events-auto mx-auto`) so the nav stays centered while blending stays functional.
- Ensure the layout root retains `bg-white dark:bg-black` so light mode computes a true background for `mix-blend-difference`; removing it leaves header text stuck white.
- Apply `text-black dark:text-white` to navigational elements so light mode stays pure black while dark mode retains the inverted blend; only the dark theme decorates with `dark:mix-blend-difference`.
- `LayoutWrapper` pins the header in a `pointer-events-none` overlay outside the surface background; keep page backgrounds on `main` so blend modes can sample the underlying hero imagery.

## Commit & Pull Request Guidelines

- Lowercase conventional commits (`feat:`, `fix:`, `chore:`), titles under 50 characters.
- Each commit is atomic: code, tests, and docs updates together.
- PRs need a concise summary, linked issues (if applicable), screenshots or recordings for UI changes, and proof of passing checks (`pnpm check`, `pnpm build`, `pnpm test`). Do not merge until everything is green.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
