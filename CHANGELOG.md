## Change log

### Version: 1.3.8
#### Date: Jan-15-2026
 - Fix: Add .js extensions to relative imports in ESM build for proper module resolution
 - Fix: Change lodash import from named import to default import for ESM compatibility with CommonJS modules

### Version: 1.3.7
#### Date: Jan-12-2026
 - Fix: Improve error messages

### Version: 1.3.6
#### Date: Jan-05-2026
 - Fix: Resolve qa dependency snyk issue

### Version: 1.3.5
#### Date: Dec-15-2025
 - Fix: Added package.json with "type": "module" to dist/esm/ directory to resolve CommonJS/ESM module format mismatch error when importing ESM builds

### Version: 1.3.4
#### Date: Nov-26-2025
 - Fix: Prevent baseURL concatenation when absolute URLs (http:// or https://) are passed to getData() or created by live preview, preventing malformed URLs

### Version: 1.3.3
#### Date: Nov-10-2025
 - Fix: Added 'exports' field to package.json to fix ESM import error where '@contentstack/core' does not provide an export named 'getData' in modern ESM environments (e.g., Nuxt.js, Vite)

### Version: 1.3.2
#### Date: Oct-27-2025
 - Fix: Used common serialize method for query params

### Version: 1.3.1
#### Date: Sept-01-2025
 - Fix: Replace URLSearchParams.set() with React Native compatible implementation

### Version: 1.3.0
#### Date: Aug-25-2025
 - Fix: Remove custom error object and throw axios error

### Version: 1.2.4
#### Date: Aug-18-2025
 - Fix: Retry request logic after rate limit replenishes

### Version: 1.2.3
#### Date: Aug-04-2025
 - Fix: Added Pre-commit hook to run talisman and snyk scan
 - Fix: Updated Dependency to the latest versions

### Version: 1.2.2
#### Date: Jun-09-2025
 - Enhancement: Retry logic to check for rate limit remaining header

### Version: 1.2.1
#### Date: Apr-29-2025
 - Fix: Updated Regex for resolve the path traversal issue

### Version: 1.2.0
#### Date: Jan-24-2025
 - Fix: URL change for Live Preview

### Version: 1.1.4
#### Date: Jan-17-2025
 - Fixed defaultAdapters implementation
 - Updated the test cases

### Version: 1.1.3
#### Date: Oct-22-2024
 - Fix: getData to receive params and headers both in data

## Change log
### Version: 1.1.2
#### Date: Oct-22-2024
 - Node version bump

### Version: 1.1.1
#### Date: Aug-28-2024
 - Axios version bump

### Version: 1.1.0
#### Date: Aug-07-2024
 - Live Preview configuration changes

### Version: 1.0.3
#### Date: July-08-2024
 - Fixed retry response error handling

### Version: 1.0.2
#### Date: April-02-2024
 - Update dependency packages

### Version: 1.0.1
#### Date: January-11-2024
 - Fixed Build scripts

### Version: 1.0.0
#### Date: December-15-2023
 - Initial release of Typescript Core SDK

