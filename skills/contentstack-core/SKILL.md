---
name: contentstack-core
description: Use when working on @contentstack/core API surface, HTTP layer, errors, or how other SDKs consume this package.
---

# Contentstack core package – contentstack-js-core

## When to use

- Adding or changing modules under `src/`
- Adjusting Axios usage, retries, error types, or serialization
- Explaining how Delivery SDK pulls in this dependency

## Instructions

### Role of the package

- Published as **`@contentstack/core`**; it is an **internal building block** for Contentstack TypeScript SDKs, not a standalone app SDK for stack users.
- Entry points and exports are defined via `package.json` `exports` and build outputs under `dist/`.

### Boundaries

- Prefer stable, documented behavior for HTTP, errors, and request helpers—downstream SDKs rely on consistent error shapes and retry semantics.
- Coordinate version bumps with consumers (e.g. `contentstack-typescript`) when changing public types or behavior.

### Versioning

- Follow semver for releases; breaking changes require a major bump and coordinated updates in dependent packages.
