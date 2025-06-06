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
      expect(err).toEqual(
        expect.objectContaining({
          code: 'ECONNABORTED',
          config: expect.objectContaining({ retryOnError: false }),
        })
      );
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
      expect(err).toEqual(
        expect.objectContaining({
          error_code: 408,
          error_message: `Timeout of ${config.timeout}ms exceeded`,
          errors: null,
        })
      );
    }
  });
  it('should reject the promise if response status is 429 and retryCount exceeds retryLimit', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 5 },
      response: {
        status: 429,
        statusText: 'timeout of 1000ms exceeded',
        headers: {},
        data: {
          error_message: 'Rate limit exceeded',
          error_code: 429,
          errors: null,
        },
      },
    };
    const config = { retryLimit: 5, timeout: 1000 };
    const client = axios.create();

    await expect(retryResponseErrorHandler(error, config, client)).rejects.toEqual(error.response.data);
  });
  it('should reject the promise if response status is 401 and retryCount exceeds retryLimit', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 5 },
      response: {
        status: 401,
        statusText: 'timeout of 1000ms exceeded',
        headers: {},
        data: {
          error_message: 'Unauthorized',
          error_code: 401,
          errors: null,
        },
      },
    };
    const config = { retryLimit: 5, timeout: 1000 };
    const client = axios.create();

    await expect(retryResponseErrorHandler(error, config, client)).rejects.toEqual(error.response.data);
  });
  it('should reject the promise if response status is 429 or 401 and retryCount is within limit', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 4 },
      response: {
        status: 429,
        statusText: 'timeout of 1000ms exceeded',
        headers: {},
        data: {
          error_message: 'Rate limit exceeded',
          error_code: 429,
          errors: null,
        },
      },
      request: {
        method: 'post',
        url: '/retryURL',
        data: { key: 'value' },
        headers: { 'Content-Type': 'application/json' },
      },
    };
    const config = { retryLimit: 4, timeout: 1000 };
    const client = axios.create();

    await expect(retryResponseErrorHandler(error, config, client)).rejects.toEqual(error.response.data);
  });
  it('should call the retry function if retryCondition is passed', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 4 },
      response: {
        status: 200,
        statusText: 'Success Response but retry needed',
        headers: {},
        data: {
          error_message: 'Retry needed',
          error_code: 200,
          errors: null,
        },
      },
      request: {
        method: 'post',
        url: '/retryURL',
        data: { key: 'value' },
        headers: { 'Content-Type': 'application/json' },
      },
    };
    const retryCondition = () => true;
    const config = { retryLimit: 5, timeout: 1000, retryCondition };
    const client = axios.create();

    mock.onPost('/retryURL').reply(200, { success: true });

    const response = (await retryResponseErrorHandler(error, config, client)) as AxiosResponse;
    expect(response.status).toBe(200);
  });
  it('should reject to error when retryCondition is passed but retryLimit is exceeded', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 5 },
      response: {
        status: 200,
        statusText: 'Success Response but retry needed',
        headers: {},
        data: {
          error_message: 'Retry needed',
          error_code: 200,
          errors: null,
        },
      },
      request: {
        method: 'post',
        url: '/retryURL',
        data: { key: 'value' },
        headers: { 'Content-Type': 'application/json' },
      },
    };
    const retryCondition = (error: any) => true;
    const config = { retryLimit: 5, timeout: 1000, retryCondition };
    const client = axios.create();

    await expect(retryResponseErrorHandler(error, config, client)).rejects.toEqual(error);
  });

  it('should retry when response status is 429 and retryCount is less than retryLimit', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 429,
        statusText: 'Rate limit exceeded',
        headers: {},
        data: {
          error_message: 'Rate limit exceeded',
          error_code: 429,
          errors: null,
        },
      },
    };
    const config = { retryLimit: 3 };
    const client = axios.create();

    mock.onAny().reply(200, { success: true });

    const response = (await retryResponseErrorHandler(error, config, client)) as AxiosResponse;
    expect(response.status).toBe(200);
  });

  it('should retry when retryCondition is true', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        data: {
          error_message: 'Internal Server Error',
          error_code: 500,
          errors: null,
        },
      },
    };
    const retryCondition = jest.fn().mockReturnValue(true);
    const config = { retryLimit: 3, retryCondition, retryDelay: 100 };
    const client = axios.create();

    mock.onAny().reply(200, { success: true });

    const response = (await retryResponseErrorHandler(error, config, client)) as AxiosResponse;
    expect(response.status).toBe(200);
    expect(retryCondition).toHaveBeenCalledWith(error);
  });

  it('should reject with rate limit error when x-ratelimit-remaining is 0', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 429,
        headers: {
          'x-ratelimit-remaining': '0',
        },
        data: {
          error_message: 'Rate limit exceeded',
          error_code: 429,
          errors: null,
        },
      },
    };
    const config = { retryLimit: 3 };
    const client = axios.create();

    await expect(retryResponseErrorHandler(error, config, client)).rejects.toEqual(error.response.data);
  });

  it('should retry when x-ratelimit-remaining is greater than 0', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 429,
        headers: {
          'x-ratelimit-remaining': '5',
        },
      },
    };
    const config = { retryLimit: 3 };
    const client = axios.create();

    mock.onAny().reply(200);

    const response: any = await retryResponseErrorHandler(error, config, client);
    expect(response.status).toBe(200);
  });

  it('should retry when x-ratelimit-remaining header is not present', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 429,
        headers: {},
      },
    };
    const config = { retryLimit: 3 };
    const client = axios.create();

    mock.onAny().reply(200);

    const response: any = await retryResponseErrorHandler(error, config, client);
    expect(response.status).toBe(200);
  });
});
