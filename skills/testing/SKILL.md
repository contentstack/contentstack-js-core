---
name: testing
description: Run and extend Jest tests for @contentstack/core — ts-jest, coverage, mocks.
---

# Testing — `@contentstack/core`

## Commands

| Goal | Command |
|------|---------|
| Unit tests | `npm test` → `jest ./test` |
| Lint | `npm run lint` |
| Build (before packaging) | `npm run build` |

## Config

- **`jest.config.ts`** — displayName, **ts-jest**, `tsconfig.spec.json`, **collectCoverageFrom** `src/**` (minus index if excluded), **coverageThreshold** (high bar).
- Reporters: HTML under **`reports/contentstack-js-core/html`**, JUnit under **`reports/contentstack-js-core/junit`**.

## Patterns

- Use **axios-mock-adapter** or **`test/utils/mocks.ts`** for HTTP.
- Name files **`*.spec.ts`** next to or under **`test/`** per existing layout.

## References

- `.cursor/rules/testing.mdc`
