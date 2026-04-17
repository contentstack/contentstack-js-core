---
name: dev-workflow
description: Use when changing branches, CI, npm scripts, Husky hooks, or release workflow in contentstack-js-core.
---

# Development workflow – contentstack-js-core

## When to use

- Planning a change that touches build, test, or CI
- Onboarding to how PRs and checks run for this repo

## Instructions

### Branches and integration

- Default branch is **`main`**; `development` also exists—match team practice for PR targets.
- GitHub Actions under `.github/workflows/` run tests, branch checks, SCA, policy, and CodeQL—coordinate schema changes with those jobs.

### Commands

- Install: `npm ci` (or `npm install` for local dev).
- Build: `npm run build` (CJS + ESM + UMD + types).
- Test: `npm test`.
- Lint: `npm run lint`.
- `prepare` runs build and Husky setup—expect hooks after install.

### PR expectations

- Keep changes scoped; this package is consumed by other SDKs—avoid breaking exports without semver alignment.
- Ensure `npm run build` and `npm test` pass locally before opening a PR.
