---
name: code-review
description: Use when reviewing PRs or preparing changes for contentstack-js-core—API stability, tests, and consumer impact.
---

# Code review – contentstack-js-core

## When to use

- Authoring or reviewing a PR
- Judging whether a change is safe for downstream SDKs

## Instructions

### Checklist

- **API / exports**: Any change to public exports or types that could break `@contentstack/delivery-sdk` or other consumers?
- **Behavior**: Retries, errors, and serialization remain backward compatible unless semver major.
- **Tests**: New logic covered; existing tests updated when semantics change.
- **Build**: `npm run build` and `npm test` and `npm run lint` succeed.
- **Security / deps**: Dependency bumps justified; no secrets in code or tests.

### Severity hints

- **Blocker**: Breaking change without major version or failing CI.
- **Major**: Missing tests for risky HTTP/error changes.
- **Minor**: Style, naming, or internal refactors with full green CI.
