import axios, { AxiosHeaders } from 'axios';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  retryRequestHandler,
  retryResponseHandler,
  retryResponseErrorHandler,
} from '../../src/lib/retryPolicy/delivery-sdk-handlers';
import MockAdapter from 'axios-mock-adapter';

describe('retryRequestHandler', () => {
  it('should add retryCount to the request config', () => {
    const requestConfig: InternalAxiosRequestConfig = { headers: {} as AxiosHeaders };
    const updatedConfig = retryRequestHandler(requestConfig);

    expect(updatedConfig.retryCount).toBe(1);
  });
});

describe('retryResponseHandler', () => {
  it('should return the response as-is', () => {
    const response: AxiosResponse = {
      data: 'test data',
      status: 200,
      statusText: '',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    const updatedResponse = retryResponseHandler(response);

    expect(updatedResponse).toEqual(response);
  });
});

describe('retryResponseErrorHandler', () => {
  const mock = new MockAdapter(axios);

  afterEach(() => {
    mock.reset();
  });
  it('should reject the promise if retryOnError is false', async () => {
    const error = { config: { retryOnError: false }, code: 'ECONNABORTED' };
    const config = { retryLimit: 5 };
    const client = axios.create();

    try {
      await retryResponseErrorHandler(error, config, client);
      fail('Expected retryResponseErrorHandler to throw an error');
    } catch (err) {
      expect(err).toEqual(expect.objectContaining({
        code: 'ECONNABORTED',
        config: expect.objectContaining({ retryOnError: false }),
      }));
    }
  });
  it('should reject the promise if retryOnError is true', async () => {
    const error = { config: { retryOnError: true } };
    const config = { retryLimit: 5 };
    const client = axios.create();
  
    try {
      await retryResponseErrorHandler(error, config, client);
      fail('Expected retryResponseErrorHandler to throw an error');
    } catch (err: any) {
      expect(err.config).toEqual(expect.objectContaining({ retryOnError: true }));
      expect(err).toEqual(error);
    }
  });
  it('should resolve the promise to 408 error if retryOnError is true and error code is ECONNABORTED', async () => {
    const error = { config: { retryOnError: true, retryCount: 1 }, code: 'ECONNABORTED' };
    const config = { retryLimit: 5, timeout: 1000 };
    const client = axios.create();
    try {
      await retryResponseErrorHandler(error, config, client);
      fail('Expected retryResponseErrorHandler to throw an error');
    } catch (err) {
      expect(err).toEqual(expect.objectContaining({
        error_code: 408,
        error_message: `Timeout of ${config.timeout}ms exceeded`,
        errors: null
      }));
    }  
  });
  it('should reject the promise if response status is 429 and retryCount exceeds retryLimit', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 5 },
      response: { status: 429, statusText: 'timeout of 1000ms exceeded' },
    };
    const config = { retryLimit: 5, timeout: 1000 };
    const client = axios.create();

    await expect(retryResponseErrorHandler(error, config, client)).rejects.toBe(error);
  });
  it('should reject the promise if response status is 401 and retryCount exceeds retryLimit', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 5 },
      response: { status: 401, statusText: 'timeout of 1000ms exceeded' },
    };
    const config = { retryLimit: 5, timeout: 1000 };
    const client = axios.create();

    await expect(retryResponseErrorHandler(error, config, client)).rejects.toBe(error);
  });
  it('should reject the promise if response status is 429 or 401 and retryCount is within limit', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 4 },
      response: { status: 429, statusText: 'timeout of 1000ms exceeded' },
      request: {
        method: 'post',
        url: '/retryURL',
        data: { key: 'value' },
        headers: { 'Content-Type': 'application/json' },
      },
    };
    const config = { retryLimit: 5, timeout: 1000 };
    const client = axios.create();

    const finalResponseObj = {
      config: { retryOnError: true, retryCount: 4 },
      response: { status: 429, statusText: 'timeout of 1000ms exceeded' },
    };

    mock.onPost('/retryURL').reply(200, finalResponseObj);

    try {
      await retryResponseErrorHandler(error, config, client);
      throw new Error('Expected retryResponseErrorHandler to throw an error');
    } catch (err: any) {
      expect(err.response.status).toBe(429);
      expect(err.response.statusText).toBe(error.response.statusText);
      expect(err.config.retryCount).toBe(error.config.retryCount);
    }

  });
  it('should call the retry function if retryCondition is passed', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 4 },
      response: { status: 200, statusText: 'Success Response but retry needed' },
      request: {
        method: 'post',
        url: '/retryURL',
        data: { key: 'value' },
        headers: { 'Content-Type': 'application/json' },
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const retryCondition = (error: any) => true;
    const config = { retryLimit: 5, timeout: 1000, retryCondition: retryCondition };
    const client = axios.create();

    const finalResponseObj = {
      config: { retryOnError: true, retryCount: 5 },
      response: { status: 429, statusText: 'timeout of 1000ms exceeded' },
    };

    mock.onPost('/retryURL').reply(200, finalResponseObj);

    const finalResponse: any = await retryResponseErrorHandler(error, config, client);

    expect(finalResponse.data).toEqual(finalResponseObj);
  });
  it('should reject to error when retryCondition is passed but retryLimit is exceeded', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 5 },
      response: { status: 200, statusText: 'Success Response but retry needed' },
      request: {
        method: 'post',
        url: '/retryURL',
        data: { key: 'value' },
        headers: { 'Content-Type': 'application/json' },
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const retryCondition = (error: any) => true;
    const config = { retryLimit: 5, timeout: 1000, retryCondition: retryCondition };
    const client = axios.create();

    const finalResponseObj = {
      config: { retryOnError: true, retryCount: 5 },
      response: { status: 429, statusText: 'timeout of 1000ms exceeded' },
    };

    mock.onPost('/retryURL').reply(200, finalResponseObj);

    await expect(retryResponseErrorHandler(error, config, client)).rejects.toBe(error);
  });
});
