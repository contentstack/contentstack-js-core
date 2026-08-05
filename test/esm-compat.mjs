/**
 * Native ESM integration test for @contentstack/core.
 *
 * Run after `npm run build`:
 *   node test/esm-compat.mjs
 *
 * Verifies that importing httpClient via ESM (where require is not defined)
 * does not throw a ReferenceError and falls back to false for http/https agents.
 * This catches the regression reported in contentstack-js-core#246.
 */
import { httpClient } from '../dist/esm/src/index.js';

let failed = false;

function assert(condition, message) {
  if (!condition) {
    process.stderr.write(`FAIL: ${message}\n`);
    failed = true;
  } else {
    process.stdout.write(`PASS: ${message}\n`);
  }
}

let instance;
try {
  instance = httpClient({});
} catch (err) {
  process.stderr.write(`FAIL: httpClient() threw in native ESM: ${err.message}\n`);
  process.exit(1);
}

// In native ESM, require is not defined, so createHttpAgent()/createHttpsAgent() must fall back to false
assert(
  instance.defaults.httpAgent === false,
  `httpAgent should be false in native ESM (got ${instance.defaults.httpAgent})`
);

assert(
  instance.defaults.httpsAgent === false,
  `httpsAgent should be false in native ESM (got ${instance.defaults.httpsAgent})`
);

if (failed) process.exit(1);
process.stdout.write('ESM compat: all checks passed\n');
