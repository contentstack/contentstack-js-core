# AGENTS.md — AI / automation context

## Project

| | |
|---|---|
| **Name** | **`@contentstack/core`** (npm) — **Contentstack JavaScript / TypeScript core library** |
| **Purpose** | Foundational HTTP client, errors, serialization, and retry helpers consumed by **Contentstack TypeScript Delivery SDK** (`@contentstack/delivery-sdk`) and related packages. **Not** an app-facing CDA client by itself. |
| **Repository** | [contentstack/contentstack-js-core](https://github.com/contentstack/contentstack-js-core.git) |

## Tech stack

| Area | Details |
|------|---------|
| **Language** | **TypeScript** in `src/` |
| **HTTP** | **Axios** (`src/lib/contentstack-core.ts`), **qs** / custom **`param-serializer`**, **lodash** |
| **Build** | **TypeScript** → **CJS** / **ESM** / **types** (`config/tsconfig.*.json`); **UMD** via **webpack** (`config/webpack.config.js`) |
| **Lint** | **ESLint** (Airbnb TypeScript + Prettier; `.eslintrc.js` / `.eslintrc.json`) |
| **Tests** | **Jest** + **ts-jest** (`jest.config.ts`, `test/**/*.spec.ts`); coverage thresholds in Jest config |

## Source layout

| Path | Role |
|------|------|
| `src/index.ts` | Public exports |
| `src/lib/contentstack-core.ts` | **`httpClient`** factory, Axios config |
| `src/lib/request.ts` / `param-serializer.ts` | Request wiring and query serialization |
| `src/lib/contentstack-error.ts` / `api-error.ts` / `error-messages.ts` | Error types and messages |
| `src/lib/retryPolicy/delivery-sdk-handlers.ts` | Retry interceptors for delivery SDK |
| `src/lib/types.ts` | Shared TS types |
| `config/` | TS compiler + webpack configs |
| `tools/` | `cleanup`, `postbuild` |
| `dist/` | Published artifacts (`package.json` `exports`) |

## Common commands

```bash
npm install
npm run build        # cjs + esm + umd + types
npm run lint         # eslint . -c .eslintrc.js
npm test             # jest ./test
npm run clean        # node tools/cleanup
```

## Consumer relationship

- **End users** should depend on **`@contentstack/delivery-sdk`**, not usually this package directly.
- When changing public exports or behavior, consider impact on **contentstack-typescript** and semver for **`@contentstack/core`**.

## Further guidance

- **Cursor rules:** [`.cursor/rules/README.md`](.cursor/rules/README.md)
- **Skills:** [`skills/README.md`](skills/README.md)

Official API context for consumers: [Content Delivery API](https://www.contentstack.com/docs/developers/apis/content-delivery-api/).
