import { cloneDeep } from 'lodash';
import { serialize } from './param-serializer';
import axios, { AxiosRequestHeaders } from 'axios';
import { AxiosInstance, IHttpClientParams } from './types';
import { retryRequestHandler, retryResponseErrorHandler, retryResponseHandler } from './retryPolicy/handlers';

export function httpClient(options: IHttpClientParams): AxiosInstance {
  const defaultConfig = {
    insecure: false,
    retryOnError: true,
    headers: {} as AxiosRequestHeaders,
    basePath: '',
    proxy: false as const,
    httpAgent: false,
    httpsAgent: false,
    timeout: 30000,
    logHandler: (level: string, data?: any) => {
      if (level === 'error' && data) {
        const title = [data.name, data.message].filter((a) => a).join(' - ');
        console.error(`[error] ${title}`);

        return;
      }
      console.log(`[${level}] ${data}`);
    },
    retryCondition: (error: any) => {
      if (error.response && error.response.status === 429) {
        return true;
      }

      return false;
    },
    versioningStrategy: 'path',
  };

  const config: IHttpClientParams = {
    ...defaultConfig,
    ...cloneDeep(options),
  };

  if (config.apiKey && config.headers) {
    config.headers.api_key = config.apiKey;
  }

  if (config.accessToken && config.headers) {
    config.headers.access_token = config.accessToken;
  }

  const protocol = config.insecure ? 'http' : 'https';
  const hostname = config.defaultHostname;
  const port = config.port || 443;
  const version = config.version || 'v3';

  const baseURL = config.endpoint || `${protocol}://${hostname}:${port}${config.basePath}/${version}`;

  const instance = axios.create({
    // Axios
    baseURL,
    ...config,
    paramsSerializer: {
      serialize,
    },
  }) as AxiosInstance;

  instance.httpClientParams = options;

  // Retry policy handlers
  const errorHandler = (error: any) => {
    retryResponseErrorHandler(error, config);
  };
  instance.interceptors.request.use(retryRequestHandler);
  instance.interceptors.response.use(retryResponseHandler, errorHandler);

  if (config.onError) {
    instance.interceptors.response.use((response) => response, config.onError);
  }

  return instance;
}
