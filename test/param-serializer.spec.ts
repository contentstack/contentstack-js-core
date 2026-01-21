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
    expect(param).toEqual('&query=%7B%22title%22:%7B%22$in%22:%5B%22welcome%22,%22hello%22%5D%7D%7D');
    done();
  });

  it('should return brackets and query with encoded string when passed query param and array value', (done) => {
    const param = serialize({ include: ['reference'], query: { title: { $in: ['welcome', 'hello'] } } });
    expect(param).toEqual(
      'include%5B%5D=reference&query=%7B%22title%22:%7B%22$in%22:%5B%22welcome%22,%22hello%22%5D%7D%7D'
    );
    done();
  });

  it('should return comma-separated format when useCompactFormat is true', (done) => {
    const param = serialize({ 'include[]': ['ref1', 'ref2', 'ref3'] }, true);
    expect(param).toEqual('include=ref1%2Cref2%2Cref3');
    done();
  });

  it('should return brackets format when useCompactFormat is false', (done) => {
    const param = serialize({ 'include[]': ['ref1', 'ref2', 'ref3'] }, false);
    expect(param).toEqual('include%5B%5D=ref1&include%5B%5D=ref2&include%5B%5D=ref3');
    done();
  });

  it('should handle query param with compact format', (done) => {
    const param = serialize({ 'include[]': ['ref1', 'ref2'], query: { title: 'test' } }, true);
    expect(param).toContain('include=ref1%2Cref2');
    expect(param).toContain('query=');
    done();
  });
});
