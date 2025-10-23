# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router entry points, layouts, and route-level clients (e.g., `client-layout.tsx`, `webxr/`).
- `components/`: Reusable UI, grouped by feature (`Header/`, `Landing/`, `common/`); prefer colocated tests under `components/**/__tests__/`.
- `contexts/` & `hooks/`: Cross-cutting providers (mouse, theme, XR) and typed hook interfaces; every hook lives alongside its provider.
- `styles/`: Tailwind v4 globals and custom variants (`globals.css` defines the `.dark` selector variant).
- `content/`: MDX portfolio case studies and structured metadata.
- `__tests__/`: Jest integration/unit suites; `__tests__/e2e/` holds Playwright specs and page objects.

## Build, Test, and Development Commands
- `pnpm dev`: Start the Next.js dev server on port 3000 with live reload.
- `pnpm build`: Production compile (fails fast on type or lint errors in production bundles).
- `pnpm test`: Run Jest unit/integration suites in jsdom.
- `pnpm test:e2e`: Execute Playwright scenarios (headless by default).
- `pnpm lint` / `pnpm format` / `pnpm check`: Apply Biome formatting, linting, and comprehensive checks.

## Coding Style & Naming Conventions
- TypeScript-first; keep files under 300 lines and functions under 50 lines.
- Use explicit `use client` directives for client components; shared utilities remain server-safe.
- Tailwind utility classes sit inline; prefer semantic helper constants (see `utils/classNames.ts`).
- Hooks, providers, and contexts follow `PascalCase` filenames with default exports; variables and functions use `camelCase`.
- Keep imports absolute via `@/` alias; group React/third-party/local imports in that order.

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
- Mirror source tree for test placement (`*.test.tsx` next to the subject or in feature-level `__tests__/`).
- Snapshot usage is discouraged; favor explicit assertions on DOM or state.
- Prior to PR, run `pnpm test` and any targeted `pnpm test:e2e` specs impacted by UI work.

## Commit & Pull Request Guidelines
- Use lowercase conventional commits (`feat:`, `fix:`, `chore:`) with titles under 50 characters.
- Each commit should be atomic: include code, tests, and docs updates together.
- PRs need a concise summary, linked issues (if applicable), screenshots or recordings for UI changes, and proof of passing tests (`pnpm test`, `pnpm lint`, relevant Playwright suites). Avoid merging until CI and manual verification are green.
