import clonedeep from 'lodash/cloneDeep'
import Qs from 'qs'
import axios, { AxiosInstance } from 'axios'

interface defaultConfig {
  insecure: boolean;
  retryOnError: boolean;
  headers:object;
  basePath: string;
  proxy: boolean;
  httpAgent: boolean;
  httpsAgent: boolean;
  adapter: boolean;
  timeout: number;
  logHandler: (level:string, data:{name: string, message: string}) => void;
  retryCondition: (error:any) => boolean;
}

type Headers = {
  apiKey: string
  accessToken: string
}

interface Config extends defaultConfig {
  headers: Headers;
  insecure: boolean;
  defaultHostName?: string;
  port: number;
  version: string;
  endpoint: string;
  basePath: string;
  apiKey?: string;
  accessToken?: string;
}

export function contentstackCore(options:Config): AxiosInstance {
  const defaultConfig: defaultConfig = {
    insecure: false,
    retryOnError: true,
    headers: {},
    basePath: '',
    proxy: false,
    httpAgent: false,
    httpsAgent: false,
    adapter: false,
    timeout: 30000,
    logHandler: (level, data) => {
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
    }
  }

  const config: Config = {
    ...defaultConfig,
    ...clonedeep(options),
  }

  if (config.apiKey) {
    config.headers['apiKey'] = config.apiKey
  }

  if (config.accessToken) {
    config.headers['accessToken'] = config.accessToken
  }

  const protocol = config.insecure ? 'http' : 'https'
  const hostname = config.defaultHostName
  const port = config.port || 443
  const version = config.version || 'v3'

  const baseURL = config.endpoint || `${protocol}://${hostname}:${port}${config.basePath}/{api-version}`

  const instance = axios.create({
    // Axios
    baseURL,
    ...config,
    paramsSerializer: function (params:{query:string}) {
      const query:string = params.query;
      delete params.query
      let qs = Qs.stringify(params, { arrayFormat: 'brackets' })
      if (query) {
        qs = qs + `&query=${encodeURI(JSON.stringify(query))}`
      }
      params.query = query
      return qs
    },
    versioningStrategy: 'path'
  });
  instance.httpClientParams = options
  return instance;
}
