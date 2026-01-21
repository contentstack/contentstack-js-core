import * as Qs from 'qs';

export function serialize(params: Record<string, any>, useCompactFormat = false) {
  const query = params.query;
  delete params.query;
  const arrayFormat = useCompactFormat ? 'comma' : 'brackets';
  let qs = Qs.stringify(params, { arrayFormat });
  if (query) {
    qs = qs + `&query=${encodeURI(JSON.stringify(query))}`;
  }
  params.query = query;

  return qs;
}
