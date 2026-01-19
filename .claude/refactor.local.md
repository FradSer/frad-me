---
enabled: true
default_mode: all
rule_categories:
  nextjs:
    async: true
    bundle: true
    server: true
    client: true
    rerender: true
    rendering: true
    js: true
    advanced: true
  languages:
    typescript: true
    python: false
    go: false
    swift: false
    universal: true
weighting_strategy: impact-based
custom_weights: {}
disabled_patterns: []
---

# Refactor Configuration

This file controls the behavior of the `/refactor-project` and `/refactor` commands.
It is gitignored and contains your local preferences.

## Configuration Options

- **enabled**: Master switch to enable/disable refactoring features
- **default_mode**:
  - `all`: Apply all applicable rules automatically
  - `selected`: Always ask which rules to apply
  - `weighted`: Apply rules based on impact/weights
- **rule_categories**: Enable/disable specific rule sets
- **weighting_strategy**: How to prioritize changes (`impact-based`, `equal`, `custom`)
- **disabled_patterns**: List of specific pattern IDs to ignore (e.g. `no-console`)
