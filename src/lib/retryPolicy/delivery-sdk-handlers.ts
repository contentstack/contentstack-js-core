import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface InternalAxiosRequestConfig {
    retryCount?: number;
  }
}

const defaultConfig = {
  maxRequests: 5,
  retryLimit: 5,
  retryDelay: 300,
};

export const retryRequestHandler = (req: InternalAxiosRequestConfig<any>): InternalAxiosRequestConfig<any> => {
  req.retryCount = req.retryCount || 0;

  return req;
};

export const retryResponseHandler = (response: AxiosResponse) => response;

export const retryResponseErrorHandler = async (error: any, config: any): Promise<any> => {
  let retryCount = error.config.retryCount;
  // let retryErrorType = null;

  config = { ...defaultConfig, ...config };

  if (!error.config.retryOnError || retryCount > config.retryLimit) {
    return Promise.reject(error);
  }

  const response = error.response;
  if (!response) {
    if (error.code === 'ECONNABORTED') {
      error.response = {
        ...error.response,
        status: 408,
        statusText: `timeout of ${config.timeout}ms exceeded`,
      };

      return Promise.resolve(error.response);
    } else {
      return Promise.reject(error);
    }
  } else if (response.status == 429 || response.status == 401) {
    retryCount++;
    // retryErrorType = `Error with status: ${response.status}`;

    if (retryCount > config.retryLimit) {
      return Promise.reject(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    error.config.retryCount = retryCount;

    return axios(error.request);
  }

  if (config.retryCondition && config.retryCondition(error)) {
    // retryErrorType = error.response ? `Error with status: ${response.status}` : `Error Code:${error.code}`;
    retryCount++;

    return retry(error, config, retryCount, config.retryDelay);
  }
};

const retry = (error: any, config: any, retryCount: number, retryDelay: number) => {
  let delayTime: number = retryDelay;
  if (retryCount > config.retryLimit) {
    return Promise.reject(error);
  }

  delayTime = config.retryDelay;
  error.config.retryCount = retryCount;

  return new Promise(function (resolve) {
    return setTimeout(function () {
      return resolve(axios(error.request));
    }, delayTime);
  });
};
