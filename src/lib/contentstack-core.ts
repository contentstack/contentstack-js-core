import _ from 'lodash';
import { serialize } from './param-serializer';
import axios, { AxiosRequestHeaders, getAdapter } from 'axios';
import { AxiosInstance, HttpClientParams } from './types';
import { ERROR_MESSAGES } from './error-messages';

const isNodeEnvironment = typeof window === 'undefined';

// In Node we default to keep-alive agents so TCP connections are reused under concurrent load.
// Guards: `isNodeEnvironment` skips browsers; `typeof require` skips native ESM (where `require` is undefined).
// The requires use literal 'http'/'https' so bundlers (Turbopack/webpack) can statically analyze them, and the
// package.json "browser" field maps those modules to `false` so browser bundles never try to resolve them.
function isNodeRuntime(): boolean {
  return isNodeEnvironment && typeof require !== 'undefined';
}

function createHttpAgent() {
  if (!isNodeRuntime()) return false as const;

  return new (require('http').Agent)({ keepAlive: true });
}

function createHttpsAgent() {
  if (!isNodeRuntime()) return false as const;

  return new (require('https').Agent)({ keepAlive: true });
}

export function httpClient(options: HttpClientParams): AxiosInstance {
  const defaultConfig = {
    insecure: false,
    retryOnError: true,
    headers: {} as AxiosRequestHeaders,
    basePath: '',
    proxy: false as const,
    httpAgent: createHttpAgent(),
    httpsAgent: createHttpsAgent(),
    timeout: 30000,
    logHandler: (level: string, data?: any) => {
      if (level === 'error') {
        if (data) {
          const title = [data.name, data.message].filter((a) => a).join(' - ');
          console.error(ERROR_MESSAGES.CONSOLE.ERROR_WITH_TITLE(title));
        }

        return;
      }
      if (data !== undefined) {
        console.log(ERROR_MESSAGES.CONSOLE.LEVEL_WITH_DATA(level, data));
      }
    },
    retryCondition: (error: any) => {
      if (error.response && error.response.status === 429) {
        return true;
      }

      return false;
    },
    versioningStrategy: 'path',
  };

  const config: HttpClientParams = {
    ...defaultConfig,
    ..._.cloneDeep(options),
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
    adapter: getAdapter(axios.defaults.adapter),
    ...config,
    paramsSerializer: {
      serialize,
    },
  }) as AxiosInstance;

  instance.httpClientParams = options;

  if (config.onError) {
    instance.interceptors.response.use((response) => response, config.onError);
  }

  return instance;
}
