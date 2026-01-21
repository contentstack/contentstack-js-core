import * as Qs from 'qs';
import { ParamsSerializerOptions } from 'axios';

interface ExtendedParamsSerializerOptions extends ParamsSerializerOptions {
  useCompactFormat?: boolean;
}

export function serialize(
  params: Record<string, any>,
  options?: ParamsSerializerOptions | ExtendedParamsSerializerOptions | boolean
): string {
  // Support both axios signature (options object) and legacy signature (boolean)
  const useCompactFormat =
    typeof options === 'boolean' ? options : (options as ExtendedParamsSerializerOptions)?.useCompactFormat ?? false;

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
