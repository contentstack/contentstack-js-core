# @contentstack/core – Agent guide

**Universal entry point** for contributors and AI agents. Detailed conventions live in **`skills/*/SKILL.md`**.

## What this repo is

| Field | Detail |
|--------|--------|
| **Name:** | [contentstack-js-core](https://github.com/contentstack/contentstack-js-core) (`@contentstack/core`) |
| **Purpose:** | TypeScript core library: HTTP client wiring, errors, serialization, retries—shared by Contentstack TS SDKs. |
| **Out of scope:** | Not an end-user SDK; apps should use the Delivery SDK, which depends on this package. |

## Tech stack (at a glance)

| Area | Details |
|------|---------|
| Language | TypeScript (see `typescript` in `package.json`; `config/tsconfig.*.json`) |
| Build | `tsc` (CJS/ESM/types) + Webpack UMD (`config/webpack.config.js`, `tools/`) |
| Tests | Jest → `test/` (`npm test` → `jest ./test`) |
| Lint / coverage | ESLint `.eslintrc.js` (`npm run lint`) |
| CI | `.github/workflows/unit-test.yml`, `check-branch.yml`, `sca-scan.yml`, `policy-scan.yml`, `codeql-analysis.yml` |

## Commands (quick reference)

| Command type | Command |
|--------------|---------|
| Build | `npm run build` |
| Test | `npm test` |
| Lint | `npm run lint` |

## Where the documentation lives: skills

| Skill | Path | What it covers |
|-------|------|----------------|
| **Development workflow** | [`skills/dev-workflow/SKILL.md`](skills/dev-workflow/SKILL.md) | Branches, CI, npm scripts, Husky, release notes |
| **Contentstack core (package)** | [`skills/contentstack-core/SKILL.md`](skills/contentstack-core/SKILL.md) | `@contentstack/core` boundaries, public surface, dependency role |
| **TypeScript & layout** | [`skills/typescript/SKILL.md`](skills/typescript/SKILL.md) | `src/`, `config/` tsconfigs, ESM/CJS/UMD outputs |
| **Testing** | [`skills/testing/SKILL.md`](skills/testing/SKILL.md) | Jest layout, mocks, fixtures |
| **Code review** | [`skills/code-review/SKILL.md`](skills/code-review/SKILL.md) | PR expectations and checklist |

## Using Cursor (optional)

If you use **Cursor**, [`.cursor/rules/README.md`](.cursor/rules/README.md) only points to **`AGENTS.md`**—same docs as everyone else.
