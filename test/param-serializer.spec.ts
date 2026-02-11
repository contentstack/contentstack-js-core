import { serialize } from '../src/lib/param-serializer';
describe('serialize', () => {
  it('should return blank string when passed empty params', (done) => {
    const param = serialize({});
    expect(param).toEqual('');
    done();
  });

  it('should return brackets structure when param contains array value', (done) => {
    const param = serialize({ include: ['reference'] });
    expect(param).toEqual('include%5B%5D=reference');
    done();
  });

  it('should return non brackets string when param value is not array value', (done) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const param = serialize({ include_count: true });
    expect(param).toEqual('include_count=true');
    done();
  });

  it('should return query with encode string when passed query param', (done) => {
    const param = serialize({ query: { title: { $in: ['welcome', 'hello'] } } });
    expect(param).toEqual('&query=%7B%22title%22%3A%7B%22%24in%22%3A%5B%22welcome%22%2C%22hello%22%5D%7D%7D');
    done();
  });

  it('should return brackets and query with encoded string when passed query param and array value', (done) => {
    const param = serialize({ include: ['reference'], query: { title: { $in: ['welcome', 'hello'] } } });
    expect(param).toEqual(
      'include%5B%5D=reference&query=%7B%22title%22%3A%7B%22%24in%22%3A%5B%22welcome%22%2C%22hello%22%5D%7D%7D'
    );
    done();
  });

  it('should properly encode special characters like ampersand in query values', (done) => {
    const param = serialize({ query: { url: '/imaging-&-automation' } });
    // The & should be encoded as %26
    expect(param).toEqual('&query=%7B%22url%22%3A%22%2Fimaging-%26-automation%22%7D');
    done();
  });

  it('should properly encode other URL-special characters in query values', (done) => {
    const param = serialize({ query: { title: 'test=value&foo=bar?baz' } });
    // =, &, and ? should all be encoded
    expect(param).toEqual('&query=%7B%22title%22%3A%22test%3Dvalue%26foo%3Dbar%3Fbaz%22%7D');
    done();
  });
});
