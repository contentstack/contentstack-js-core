import { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  retryRequestHandler,
  retryResponseHandler,
  retryResponseErrorHandler,
} from '../../src/lib/retryPolicy/delivery-sdk-handlers'; // Update with your actual module name


jest.mock('axios');

describe('retryRequestHandler', () => {
  it('should add retryCount to the request config', () => {
    const requestConfig: AxiosRequestConfig = {};
    const updatedConfig = retryRequestHandler(requestConfig);

    expect(updatedConfig.retryCount).toBe(0);
  });
});

describe('retryResponseHandler', () => {
  it('should return the response as-is', () => {
    const response:AxiosResponse = { data: 'test data', status:200, statusText: '', headers: {}, config: {} as InternalAxiosRequestConfig };
    const updatedResponse = retryResponseHandler(response);

    expect(updatedResponse).toEqual(response);
  });
});

describe('retryResponseErrorHandler', () => {
  it('should reject the promise if retryOnError is false', async () => {
    const error = { config: { retryOnError: false }, code: 'ECONNABORTED' };
    const config = { retryLimit: 5 };

    await expect(retryResponseErrorHandler(error, config)).rejects.toBe(error);
  });
  it('should reject the promise if retryOnError is true', async () => {
    const error = { config: { retryOnError: true } };
    const config = { retryLimit: 5 };

    await expect(retryResponseErrorHandler(error, config)).rejects.toBe(error);
  });

});
