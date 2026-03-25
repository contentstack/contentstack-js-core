---
name: code-review
description: PR review for @contentstack/core — public exports, delivery-sdk impact, errors, tests, coverage.
---

# Code review — `@contentstack/core`

## Checklist

- [ ] **Exports:** `src/index.ts` and `package.json` `exports` stay aligned; no accidental removal of symbols **delivery-sdk** uses.
- [ ] **Semver:** Breaking type or runtime changes → **major**; additive → **minor** / **patch** as appropriate.
- [ ] **HTTP / retry:** Behavior matches documented Axios options; 429 / retry paths still tested.
- [ ] **Errors:** `ContentstackError` / `ApiError` patterns preserved; no token leakage in logs.
- [ ] **Tests:** `npm test` passes; coverage thresholds in `jest.config.ts` satisfied.
- [ ] **Lint:** `npm run lint` passes.

## References

- `.cursor/rules/code-review.mdc`
- `.cursor/rules/dev-workflow.md`
