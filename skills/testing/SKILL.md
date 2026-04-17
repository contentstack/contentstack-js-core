---
name: testing
description: Use when writing or fixing Jest tests, mocks, or test layout under test/ in contentstack-js-core.
---

# Testing – contentstack-js-core

## When to use

- Adding coverage for new `src/` behavior
- Fixing flaky or outdated tests under `test/`

## Instructions

### Runner and layout

- **Jest** is configured for this repo; tests live under **`test/`** (`npm test` runs `jest ./test`).
- Prefer focused unit tests near the behavior under test; use mocks for HTTP where `axios` or adapters are involved.

### Practice

- Run the full suite before merging: `npm test`.
- Keep tests deterministic—no live network calls to Contentstack APIs in CI unless a dedicated integration job exists and secrets are available.
