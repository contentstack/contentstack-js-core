/**
 * @jest-environment node
 */
import http from 'http';
import https from 'https';
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
});
