# @contentstack/core

[![Contentstack](https://www.contentstack.com/docs/static/images/contentstack.png)](https://www.contentstack.com/)

TypeScript Core SDK for Contentstack - A foundational library providing core modules and utilities for Contentstack TypeScript SDKs.

## About Contentstack

Contentstack is a headless CMS with an API-first approach. It is a CMS that developers can use to build powerful cross-platform applications in their favorite languages. Build your application frontend, and Contentstack will take care of the rest. [Read More](https://www.contentstack.com/).

## Description

This package contains core modules and utilities used by the [Contentstack TypeScript Delivery SDK](https://github.com/contentstack/contentstack-typescript/). It provides essential functionality including HTTP client configuration, error handling, request management, parameter serialization, and retry policies.

## Features

- **HTTP Client**: Configurable Axios-based HTTP client with support for custom adapters
- **Error Handling**: Comprehensive error classes for API and Contentstack-specific errors
- **Request Management**: Request handling with interceptors and custom error callbacks
- **Parameter Serialization**: Custom parameter serialization for API requests
- **Retry Policies**: Built-in retry logic for handling rate limits and transient errors
- **TypeScript Support**: Full TypeScript definitions included
- **Multiple Build Formats**: Supports CommonJS, ESM, UMD, and TypeScript declarations

## Important Note

**This package is an internal dependency** used by Contentstack TypeScript SDKs. End users should **not** install this package directly. Instead, install the appropriate Contentstack SDK (e.g., [Contentstack TypeScript Delivery SDK](https://github.com/contentstack/contentstack-typescript/)), which will automatically include this package as a dependency.

## For SDK Developers

If you are developing or maintaining a Contentstack SDK and need to use this core package directly, you can install it as a dependency:

```bash
npm install @contentstack/core
```

Then import the modules:

```typescript
import {
  httpClient,
  // ... other exports
} from '@contentstack/core';
```

## Development

### Prerequisites

- Node.js version 4.4.7 or later

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/contentstack/contentstack-js-core.git
cd contentstack-js-core
npm install
```

### Build

Build all output formats (CommonJS, ESM, UMD, and TypeScript declarations):

```bash
npm run build
```

Build specific formats:

```bash
npm run build        # Build all
npm run build:cjs    # CommonJS
npm run build:esm    # ES Modules
npm run build:umd    # UMD
npm run build:types  # TypeScript declarations
```

### Testing

Run unit tests:

```bash
npm run test
```

Run linting:

```bash
npm run lint
```

### Packaging

Create a package tarball:

```bash
npm run package
```

### Clean

Clean build artifacts:

```bash
npm run clean
```

## License

This project is licensed under the MIT License. See the [LICENSE.txt](LICENSE.txt) file for details.

## Repository

- **GitHub**: [contentstack/contentstack-js-core](https://github.com/contentstack/contentstack-js-core)

## Related Projects

- [Contentstack TypeScript Delivery SDK](https://github.com/contentstack/contentstack-javascript/)

## Support

For issues and feature requests, please visit the [GitHub Issues](https://github.com/contentstack/contentstack-js-core/issues) page.

---

Copyright (c) 2016-2025 Contentstack. All rights reserved.
