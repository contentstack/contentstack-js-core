---
name: typescript
description: Use for TypeScript layout, tsconfig variants, and build outputs (CJS/ESM/UMD/types) in contentstack-js-core.
---

# TypeScript & repo layout – contentstack-js-core

## When to use

- Editing `config/tsconfig.*.json` or build pipelines
- Adding new source files under `src/`
- Debugging dual CJS/ESM/UMD output issues

## Instructions

### Layout

- Source lives under **`src/`**; compiled artifacts go to **`dist/`** via separate targets (`build:cjs`, `build:esm`, `build:umd`, `build:types`).
- **`config/`** holds TypeScript and Webpack configs—keep them in sync when adding path aliases or new entry files.

### Tooling

- TypeScript version is pinned in `package.json`—upgrade deliberately with full `npm run build` and `npm test`.
- ESLint uses `.eslintrc.js`; run `npm run lint` after structural refactors.
