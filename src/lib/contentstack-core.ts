import {cloneDeep} from 'lodash'
import { serialize } from './param-serializer';
import axios, { AxiosRequestHeaders } from 'axios';
import { AxiosInstance, HttpClientParams } from './types';

export function httpClient(options: HttpClientParams): AxiosInstance {
  const defaultConfig = {
    insecure: false,
    retryOnError: true,
    headers: {} as AxiosRequestHeaders,
    basePath: '',
    proxy: false as const,
    httpAgent: false,
    httpsAgent: false,
    timeout: 30000,
    logHandler: (level:  string, data?: any) => {
      if (level === 'error' && data) {
        const title = [data.name, data.message].filter((a) => a).join(' - ')
        console.error(`[error] ${title}`)
        return
      }
      console.log(`[${level}] ${data}`)
    },
    retryCondition: (error:any) => {
      if (error.response && error.response.status === 429) {
        return true
      }
      return false
    },
    versioningStrategy: 'path'
  }

  const config: HttpClientParams = {
    ...defaultConfig,
    ...cloneDeep(options),
  }

  if (config.apiKey && config.headers) {
    config.headers['apiKey'] = config.apiKey
  }

  if (config.accessToken && config.headers) {
    config.headers['accessToken'] = config.accessToken
  }

  const protocol = config.insecure ? 'http' : 'https'
  const hostname = config.defaultHostname
  const port = config.port || 443

  const baseURL = config.endpoint || `${protocol}://${hostname}:${port}${config.basePath}/{api-version}`

  const instance = axios.create({
    // Axios
    baseURL,
    ...config,
    paramsSerializer: {
      serialize
    },
  }) as AxiosInstance

  instance.httpClientParams = options

  if (config.onError) {
    instance.interceptors.response.use((response) => response, config.onError)
  }
  return instance;
}
