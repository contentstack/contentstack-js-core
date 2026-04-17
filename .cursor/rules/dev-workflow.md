---
description: "Branches, build, lint, and PR expectations for contentstack-js-core"
globs: ["**/*.ts", "**/*.js", "**/*.json"]
alwaysApply: false
---

# Development workflow — `@contentstack/core`

## Before a PR

1. **`npm run lint`** — must pass.
2. **`npm test`** — Jest + coverage thresholds in `jest.config.ts` must be satisfied.
3. **`npm run build`** — CJS, ESM, UMD, and types must compile.

## API stability

- This package is a **dependency of `@contentstack/delivery-sdk`**. Avoid breaking changes to exported functions, option shapes, or error types without a **semver-major** bump and coordinated **delivery-sdk** upgrade.
- Keep **`package.json` `exports`** in sync with `src/index.ts`.

## Versioning

- Bump **`package.json` `version`** for releases that change published behavior (patch/minor/major per semver).

## Links

- [`AGENTS.md`](../../AGENTS.md) · [`skills/contentstack-js-core/SKILL.md`](../../skills/contentstack-js-core/SKILL.md)
