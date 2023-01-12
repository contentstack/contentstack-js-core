
import axios, { AxiosInstance as OriginalAxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios'

type DefaultOptions = AxiosRequestConfig & {
  logHandler: (level: string, data?: Error | string) => void
  responseLogger?: (response: AxiosResponse<any> | Error) => unknown
  requestLogger?: (request: AxiosRequestConfig | Error) => unknown
  retryOnError?: boolean
  versioningStrategy: string
}

export type AxiosInstance = OriginalAxiosInstance & {
  httpClientParams: HttpClientParams
  defaults: DefaultOptions
}

export interface HttpClientParams  {
  /** API host */
  host?: string
  /** API Endpoint */
  endpoint?: string
  /** Request type */
  insecure?: boolean
  /**Port */
  port?:number
  /**API version */
  version?:string
  /** API Key */
  apiKey?: string
  /** Access token */
  accessToken?: string
  /** HTTP agent for node */
  httpAgent?: AxiosRequestConfig['httpAgent']
  /** HTTPS agent for node */
  httpsAgent?: AxiosRequestConfig['httpsAgent']

  /** Axios adapter to handle requests */
  adapter?: AxiosRequestConfig['adapter']
  /** Axios proxy config */
  proxy?: AxiosRequestConfig['proxy']

  /** Gets called on every request triggered by the SDK, takes the axios request config as an argument */
  requestLogger?: DefaultOptions['requestLogger']
  /** Gets called on every response, takes axios response object as an argument */
  responseLogger?: DefaultOptions['responseLogger']

  /** Request interceptor */
  onRequest?: (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>

  /** Error handler */
  onError?: (error: any) => any

  /** A log handler function to process given log messages & errors. */
  logHandler?: DefaultOptions['logHandler']

  /** Optional additional headers */
  headers?: AxiosRequestHeaders

  /** Default host name  */
  defaultHostname?: string

  /**
    * If we should retry on errors and 429 rate limit exceptions
    * @default true
    */
  retryOnError?: boolean

  /**
    * Optional number of retries before failure
    * @default 5
    */
   retryLimit?: number

   /**
    * Optional number of milliseconds before the request times out.
    * @default 30000
    */
   timeout?: number

   /** Base path in API url */
   basePath?: string

   baseURL?: string

   /**
    * Optional maximum content length in bytes
    * @default 1073741824 i.e 1GB
    */
   maxContentLength?: number

   /**
    * Optional maximum body length in bytes
    * @default 1073741824 i.e 1GB
    */
   maxBodyLength?: number
}
