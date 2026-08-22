# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router entry points, layouts, route handlers (`app/api/chat/route.ts`), and route-level clients (e.g., `client-layout.tsx`).
- `components/`: Reusable UI, grouped by feature (`Header/`, `Landing/`, `Chat/`, `common/`); prefer colocated tests under `components/**/__tests__/`.
- `contexts/` & `hooks/`: Cross-cutting providers (mouse, theme, XR) and typed hook interfaces; every hook lives alongside its provider.
- `styles/`: Tailwind v4 globals and custom variants (`globals.css` defines the `.dark` selector variant).
- `content/`: Structured metadata (`workLinks.ts`, `resume.ts`) consumed by pages and the AI chat tools; `markdown/works/*.mdx` holds the MDX case studies rendered by `/works/[slug]`.
- `utils/` & `types/`: Framework-free helpers (`githubActivity.ts`, `slugMapping.ts`, `workContent.ts`, motion helpers in `utils/motion/`) and shared `.d.ts` declarations.
- `tests/features/`: BDD `.feature` specs (Gherkin) paired with source-assertion Jest tests; `__tests__/e2e/` holds Playwright specs and page objects.

## Build, Test, and Development Commands
- `pnpm dev`: Start the Next.js dev server on port 3000 with live reload.
- `pnpm build`: Production compile (fails fast on type or lint errors in production bundles).
- `pnpm test`: Run Jest unit/integration suites in jsdom; scope with `pnpm test <path>`.
- `pnpm test:e2e`: Execute Playwright scenarios (headless by default); `pnpm test:all` runs CI tests plus E2E.
- `pnpm lint` / `pnpm format` / `pnpm check`: Apply Biome formatting, linting, and comprehensive checks.
- Production deploys run on Vercel via Git push to `main`; `vercel.json` pins the install command to pnpm 11 through corepack — do not remove it or lockfile resolution fails.

## Coding Style & Naming Conventions
- TypeScript-first; keep files under 300 lines and functions under 50 lines.
- Use explicit `use client` directives for client components; shared utilities remain server-safe.
- Tailwind utility classes sit inline; prefer semantic helper constants (see `utils/classNames.ts`).
- Hooks, providers, and contexts follow `PascalCase` filenames with default exports; variables and functions use `camelCase`.
- Keep imports absolute via `@/` alias; group React/third-party/local imports in that order.

## AI Chat Configuration
- The ask assistant uses Vercel AI Gateway exclusively via `@ai-sdk/gateway`; direct provider packages (e.g., `@ai-sdk/openai`) are intentionally absent.
- Required env: `AI_GATEWAY_API_KEY` (or Vercel OIDC when hosted); optional `AI_GATEWAY_MODEL_ID` in `provider/model` form. See `.env.example`.
- Chat tools live in `app/api/chat/route.ts`; live GitHub data comes from `utils/githubActivity.ts` (10-minute cache with curated fallback). Keep BDD scenarios in sync when adding tools.

## UI Contrast Patterns
- Header navigation applies `mix-blend-difference` with a white source color so typography and glyphs automatically invert over imagery; keep the header background transparent to preserve that effect.
- Header icons must use `fill-current` (not hardcoded fills) to inherit the navigation color and participate in the inversion.
- Verify the contrast contract with `pnpm test -- components/Header/__tests__/Header.test.tsx`, which asserts the presence of the blending class.
- Avoid adding opaque layers inside the header unless you isolate them in a nested wrapper; solid backgrounds break the inversion strategy.
- Preserve the fixed header shimming structure (`motion.header` with `pointer-events-none` → inner `layout-wrapper pointer-events-auto mx-auto`) so the nav stays centered while blending stays functional.
- Ensure the layout root retains `bg-white dark:bg-black` so light mode computes a true background for `mix-blend-difference`; removing it leaves the header text stuck in white.
- Apply `text-black dark:text-white` to navigational elements so light mode stays pure black while dark mode retains the inverted blend; only the dark theme decorates with `dark:mix-blend-difference`.
- `LayoutWrapper` pins the header in a `pointer-events-none` overlay outside the surface background; keep page backgrounds on `main` so blend modes can sample the underlying hero imagery.

## Testing Guidelines
- Jest (jsdom) for units/integration; Playwright for end-to-end flows.
- Follow BDD: add or update a scenario in `tests/features/**/*.feature` first, then pair it with a Jest test that asserts the implementation source (see `app/api/chat/__tests__/route.test.ts`).
- Mirror source tree for test placement (`*.test.tsx` next to the subject or in feature-level `__tests__/`).
- Snapshot usage is discouraged; favor explicit assertions on DOM or state.
- Prior to PR, run `pnpm test` and any targeted `pnpm test:e2e` specs impacted by UI work.

## Commit & Pull Request Guidelines
- Use lowercase conventional commits (`feat:`, `fix:`, `chore:`) with titles under 50 characters.
- Each commit should be atomic: include code, tests, and docs updates together.
- PRs need a concise summary, linked issues (if applicable), screenshots or recordings for UI changes, and proof of passing tests (`pnpm test`, `pnpm lint`, relevant Playwright suites). Avoid merging until CI and manual verification are green.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
