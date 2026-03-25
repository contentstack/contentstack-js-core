---
name: contentstack-js-core
description: @contentstack/core — httpClient, request helpers, param serialization, errors, delivery retry handlers.
---

# `@contentstack/core` skill

Internal library for **Contentstack TypeScript/JavaScript SDKs**. Prefer **`@contentstack/delivery-sdk`** for app code.

## Modules

| Module | Responsibility |
|--------|----------------|
| **`contentstack-core.ts`** | **`httpClient`**: Axios create, defaults, **apiKey** / **accessToken** → headers, **retryCondition**, **logHandler** |
| **`request.ts`** | Request execution helpers used with the client |
| **`param-serializer.ts`** | Query/body serialization for CDA-style calls |
| **`contentstack-error.ts`**, **`api-error.ts`** | Typed errors |
| **`retryPolicy/delivery-sdk-handlers.ts`** | Retry interceptors composed with **`httpClient`** in consumers |
| **`types.ts`** | **HttpClientParams**, etc. |

## Changing behavior

- Coordinate with **`contentstack-typescript`** when changing interceptor signatures, default timeouts, or error shapes.
- Run **`npm test`** and **`npm run build`** before PR.

## Docs

- [Content Delivery API](https://www.contentstack.com/docs/developers/apis/content-delivery-api/) (consumer semantics)

## Rule shortcut

- `.cursor/rules/contentstack-js-core.mdc`
