/* eslint-disable @typescript-eslint/no-throw-literal */
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { ERROR_MESSAGES } from '../error-messages';

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
          error_message: ERROR_MESSAGES.RETRY.TIMEOUT_EXCEEDED(config.timeout),
          error_code: ERROR_MESSAGES.ERROR_CODES.TIMEOUT,
          errors: null,
        };
        throw customError; // Throw customError object
      } else {
        throw error;
      }
    } else {
      const rateLimitRemaining = response.headers['x-ratelimit-remaining'];

      // Handle rate limit exhaustion with retry logic
      if (rateLimitRemaining !== undefined && parseInt(rateLimitRemaining) <= 0) {
        retryCount++;

        if (retryCount >= config.retryLimit) {
          return Promise.reject(error.response.data);
        }

        error.config.retryCount = retryCount;

        // Calculate delay for rate limit reset
        const rateLimitResetDelay = calculateRateLimitDelay(response.headers);

        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const retryResponse = await axiosInstance(error.config);
              resolve(retryResponse);
            } catch (retryError) {
              reject(retryError);
            }
          }, rateLimitResetDelay);
        });
      }

      if (response.status == 429 || response.status == 401) {
        retryCount++;

        if (retryCount >= config.retryLimit) {
          if (error.response && error.response.data) {
            return Promise.reject(error.response.data);
          }

          return Promise.reject(error);
        }
        error.config.retryCount = retryCount;

        // Apply configured delay for retries
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const retryResponse = await axiosInstance(error.config);
              resolve(retryResponse);
            } catch (retryError) {
              reject(retryError);
            }
          }, config.retryDelay || 300); // Use configured delay with fallback
        });
      }
    }

    if (config.retryCondition && config.retryCondition(error)) {
      retryCount++;

      return retry(error, config, retryCount, config.retryDelay, axiosInstance);
    }

    throw error;
  } catch (err) {
    throw err;
  }
};
const retry = (error: any, config: any, retryCount: number, retryDelay: number, axiosInstance: AxiosInstance) => {
  if (retryCount > config.retryLimit) {
    return Promise.reject(error);
  }

  // Use the passed retryDelay parameter first, then config.retryDelay, then default
  const delayTime = retryDelay || config.retryDelay || 300;
  error.config.retryCount = retryCount;

  return new Promise(function (resolve, reject) {
    return setTimeout(async function () {
      try {
        const retryResponse = await axiosInstance(error.config);
        resolve(retryResponse);
      } catch (retryError) {
        reject(retryError);
      }
    }, delayTime);
  });
};

/**
 * Calculate delay time for rate limit reset based on response headers
 * @param headers - Response headers from the API
 * @returns Delay time in milliseconds
 */
export const calculateRateLimitDelay = (headers: any): number => {
  // Check for retry-after header (in seconds)
  const retryAfter = headers['retry-after'];
  if (retryAfter) {
    return parseInt(retryAfter) * 1000; // Convert to milliseconds
  }

  // Check for x-ratelimit-reset header (Unix timestamp)
  const rateLimitReset = headers['x-ratelimit-reset'];
  if (rateLimitReset) {
    const resetTime = parseInt(rateLimitReset) * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const delay = resetTime - currentTime;

    // Ensure we have a positive delay, add a small buffer
    return Math.max(delay + 1000, 1000); // At least 1 second delay
  }

  // Check for x-ratelimit-reset-time header (ISO string)
  const rateLimitResetTime = headers['x-ratelimit-reset-time'];
  if (rateLimitResetTime) {
    const resetTime = new Date(rateLimitResetTime).getTime();
    const currentTime = Date.now();
    const delay = resetTime - currentTime;

    // Ensure we have a positive delay, add a small buffer
    return Math.max(delay + 1000, 1000); // At least 1 second delay
  }

  // Default fallback delay (1 second) if no rate limit reset info is available
  return 1000;
};
