/* eslint-disable @typescript-eslint/no-throw-literal */
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';

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
  req.retryCount = req.retryCount || 1;

  return req;
};

export const retryResponseHandler = (response: AxiosResponse) => response;

export const retryResponseErrorHandler = (error: any, config: any, axiosInstance: AxiosInstance) => {
  try {
    let retryCount = error.config.retryCount;
    config = { ...defaultConfig, ...config };

    if (!error.config.retryOnError || retryCount > config.retryLimit) {
      throw error;
    }

    const response = error.response;
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        const customError = {
          error_message: `Timeout of ${config.timeout}ms exceeded`,
          error_code: 408,
          errors: null,
        };
        throw customError; // Throw customError object
      } else {
        throw error;
      }
    } else if (response.status == 429 || response.status == 401) {
      retryCount++;

      if (retryCount >= config.retryLimit) {
        if (error.response && error.response.data) {
          return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
      }
        error.config.retryCount = retryCount;

      return axiosInstance(error.config);
    }

    if (config.retryCondition && config.retryCondition(error)) {
      retryCount++;

      return retry(error, config, retryCount, config.retryDelay, axiosInstance);
    }

    const customError = {
      status: response.status,
      statusText: response.statusText,
      error_message: response.data.error_message,
      error_code: response.data.error_code,
      errors: response.data.errors,
    };

    throw customError;
  } catch (err) {
    throw err;
  }
};
const retry = (error: any, config: any, retryCount: number, retryDelay: number, axiosInstance: AxiosInstance) => {
  let delayTime: number = retryDelay;
  if (retryCount > config.retryLimit) {
    return Promise.reject(error);
  }

  delayTime = config.retryDelay;
  error.config.retryCount = retryCount;

  return new Promise(function (resolve) {
    return setTimeout(function () {
      return resolve(axiosInstance(error.request));
    }, delayTime);
  });
};
