/**
 * @jest-environment node
 */
import http from 'http';
import https from 'https';
import { execFile } from 'child_process';
import * as path from 'path';
import { httpClient } from '../src/lib/contentstack-core';

describe('httpClient default connection agents (Node environment)', () => {
  it('should default httpAgent to a keepAlive http.Agent when not explicitly provided', () => {
    const instance = httpClient({});

    expect(instance.defaults.httpAgent).toBeInstanceOf(http.Agent);
    expect((instance.defaults.httpAgent as any).keepAlive).toBe(true);
  });

  it('should default httpsAgent to a keepAlive https.Agent when not explicitly provided', () => {
    const instance = httpClient({});

    expect(instance.defaults.httpsAgent).toBeInstanceOf(https.Agent);
    expect((instance.defaults.httpsAgent as any).keepAlive).toBe(true);
  });

  it('should not throw and fall back to false agents in native ESM (require is not defined)', (done) => {
    // Runs test/esm-compat.mjs as a native ESM child process.
    // Regression test for contentstack-js-core#246: ReferenceError: require is not defined.
    // Requires `npm run build` to have been run first.
    const script = path.join(__dirname, 'esm-compat.mjs');
    execFile(process.execPath, [script], (error, stdout, stderr) => {
      if (error) {
        done(new Error(`Native ESM test failed:\n${stderr || stdout}`));
      } else {
        done();
      }
    });
  });
});
