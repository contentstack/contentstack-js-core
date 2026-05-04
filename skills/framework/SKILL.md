---
name: framework
description: Axios HTTP stack in @contentstack/core — clients, retries, serialization pipeline.
---

# Framework skill — HTTP layer (`@contentstack/core`)

## Flow

1. **`httpClient(params)`** returns a configured **Axios** instance (**baseURL**, **headers**, **timeout**, adapters).
2. **Interceptors** from **`retryPolicy/delivery-sdk-handlers.ts`** may be attached by consumers for retry-on-429-style behavior.
3. **Serialization** via **`param-serializer`** ensures query strings match API expectations.

## When to edit

- **Global defaults** (timeout, retry predicate) → **`contentstack-core.ts`**.
- **Query encoding** → **`param-serializer.ts`** (watch for regressions in delivery-sdk tests).
- **Retry timing / idempotency** → **`retryPolicy/delivery-sdk-handlers.ts`**.

## Tests

- **`test/request.spec.ts`**, **`test/contentstack-core.spec.ts`**, retry specs under **`test/retryPolicy/`** — extend when altering behavior.

## Rule shortcut

- `.cursor/rules/contentstack-js-core.mdc` · `.cursor/rules/typescript.mdc`
