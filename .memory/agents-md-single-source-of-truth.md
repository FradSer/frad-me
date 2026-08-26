---
name: agents-md-single-source-of-truth
description: AGENTS.md is the only real agent-instructions file; CLAUDE.md and WARP.md are symlinks to it; Playwright E2E stack was removed as dead infrastructure.
type: decision
---

**Why:** CLAUDE.md (134 lines) and AGENTS.md (62 lines) overlapped heavily and had drifted apart with wrong claims (next-themes, AI SDK v6, Motion v12, nonexistent test paths, wrong MDX frontmatter fields). Consolidated into a single corrected AGENTS.md on 2026-08-26. Playwright was removed entirely: zero `*.spec` files existed after flaky suites were deleted upstream, leaving orphaned config/page-objects/scripts that could never pass (`pnpm test:e2e` would exit nonzero).

**How to apply:** Edit agent guidance in AGENTS.md only — never edit CLAUDE.md or WARP.md directly (they are symlinks). Do not re-add Playwright unless E2E specs are actually reintroduced. `.claude/*.local.md` personal tool configs are untracked and ignored via project .gitignore.

**Related:** [[frad-me-cleanup-2026-08]]
