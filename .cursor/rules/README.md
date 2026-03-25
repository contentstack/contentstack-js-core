# Cursor Rules — `@contentstack/core`

Rules for **contentstack-js-core**: TypeScript foundation (HTTP, errors, retries) used by the Delivery SDK.

## Rules overview

| Rule | Role |
|------|------|
| [`dev-workflow.md`](dev-workflow.md) | Branch/PR expectations, build, lint, test, semver |
| [`typescript.mdc`](typescript.mdc) | TypeScript style, `src/`, `config/`, `tools/` |
| [`contentstack-js-core.mdc`](contentstack-js-core.mdc) | Axios client, errors, serializers, retry handlers |
| [`testing.mdc`](testing.mdc) | Jest + ts-jest, specs, coverage thresholds |
| [`code-review.mdc`](code-review.mdc) | PR checklist (**always applied**) |

## Rule application

| Context | Typical rules |
|---------|----------------|
| **Every session** | `code-review.mdc` |
| **Most files** | `dev-workflow.md` |
| **Implementation** | `typescript.mdc` + `contentstack-js-core.mdc` for `src/**/*.ts` |
| **Build / tooling** | `typescript.mdc` for `config/**`, `tools/**` |
| **Tests** | `testing.mdc` for `test/**` |

## Quick reference

| File | `alwaysApply` | Globs (summary) |
|------|---------------|-----------------|
| `dev-workflow.md` | no | `**/*.ts`, `**/*.js`, `**/*.json` |
| `typescript.mdc` | no | `src/**/*.ts`, `config/**/*.ts`, `config/**/*.js`, `tools/**/*.js`, `*.ts` at root (jest, etc.) |
| `contentstack-js-core.mdc` | no | `src/**/*.ts` |
| `testing.mdc` | no | `test/**/*.ts` |
| `code-review.mdc` | **yes** | — |

## Skills & maintenance

- [`skills/README.md`](../../skills/README.md) · [`AGENTS.md`](../../AGENTS.md)
