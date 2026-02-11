import * as Qs from 'qs';

export function serialize(params: Record<string, any>) {
  const query = params.query;
  delete params.query;
  let qs = Qs.stringify(params, { arrayFormat: 'brackets' });
  if (query) {
    qs = qs + `&query=${encodeURIComponent(JSON.stringify(query))}`;
  }
  params.query = query;

  return qs;
}
