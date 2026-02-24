# Task 002: Set Up Cucumber Step Definitions

**Priority**: P0
**Estimated Effort**: 1 day
**Phase**: 1 - Test Infrastructure

## BDD Scenario Reference

All features require step definitions to run.

## Description

Create step definition files that map Gherkin steps to test code. Each step definition file corresponds to a feature file and implements the Given/When/Then steps.

## Verification (Test-First)

### Red - Create Failing Step Definitions

Create step definition files that reference the feature files created in Task 001.

### Expected Behavior

Step definitions should:
- Import Given/When/Then from @cucumber/cucumber
- Implement placeholder steps that fail until implementation is verified
- Use World context for shared state

## Files to Create

### tests/steps/webxr/work-card-steps.ts

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { World } from '@cucumber/cucumber';

Given('the WebXR experience is loaded', async function (this: World) {
  // Navigate to /webxr or use test renderer
  throw new Error('Step not implemented - WebXR environment not ready');
});

Given('the user is on the {string} view', async function (this: World, view: string) {
  throw new Error('Step not implemented');
});

// ... all steps for hover interactions feature
```

### tests/steps/webxr/view-transition-steps.ts

Steps for view transitions feature.

### tests/steps/webxr/navigation-steps.ts

Steps for navigation interactions feature.

### tests/steps/webxr/loading-steps.ts

Steps for loading states feature.

### tests/steps/webxr/performance-steps.ts

Steps for performance monitoring feature.

## Cucumber Configuration

### cucumber.js (or package.json)

```json
{
  "cucumber": {
    "format": ["progress-bar", "json:test-results/cucumber.json"],
    "paths": ["tests/features/webxr/*.feature"],
    "require": ["tests/steps/**/*.ts", "tests/hooks/**/*.ts"]
  }
}
```

### tests/hooks/webxr/world.ts

```typescript
import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

export class WebXRWorld extends World implements IWorldOptions {
  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(WebXRWorld);
```

## Verification Steps

1. Verify step definition files exist in `tests/steps/webxr/`
2. Run `pnpm cucumber` to verify step definitions are registered
3. Verify "undefined step" errors for unimplemented steps

## Acceptance Criteria

- 5 step definition files created
- Each file contains steps for corresponding feature
- Cucumber can discover and register all steps
- Running features shows "undefined step" for each scenario

## Dependencies

**depends-on**: [Task 001: Create BDD feature files](./task-001-create-bdd-feature-files.md)
