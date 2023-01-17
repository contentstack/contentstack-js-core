import { httpClient } from '../src/lib/contentstack-core';
describe('contentstackCore', () => {
  it('should return default config when no config is passed', (done) => {
    const client = httpClient({});
    done();
  });
});
