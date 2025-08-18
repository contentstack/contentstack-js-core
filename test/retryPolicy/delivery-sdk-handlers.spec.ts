import axios, { AxiosHeaders } from 'axios';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  retryRequestHandler,
  retryResponseHandler,
  retryResponseErrorHandler,
  calculateRateLimitDelay,
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
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
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

  it('should retry with delay when x-ratelimit-remaining is 0 and retry-after header is present', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 429,
        headers: {
          'x-ratelimit-remaining': '0',
          'retry-after': '1', // 1 second for faster testing
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

    // Mock successful response after retry
    mock.onAny().reply(200, { success: true });

    jest.useFakeTimers();

    const responsePromise = retryResponseErrorHandler(error, config, client);

    // Fast-forward time by 1 second
    jest.advanceTimersByTime(1000);

    const response: any = await responsePromise;

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    jest.useRealTimers();
  });

  it('should retry with delay when x-ratelimit-remaining is 0 and x-ratelimit-reset header is present', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 429,
        headers: {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': Math.floor((Date.now() + 2000) / 1000).toString(), // 2 seconds from now
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

    // Mock successful response after retry
    mock.onAny().reply(200, { success: true });

    jest.useFakeTimers();

    const responsePromise = retryResponseErrorHandler(error, config, client);

    // Fast-forward time by 3 seconds (2 + 1 buffer)
    jest.advanceTimersByTime(3000);

    const response: any = await responsePromise;

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    jest.useRealTimers();
  });

  it('should retry with default delay when x-ratelimit-remaining is 0 and no reset headers are present', async () => {
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

    // Mock successful response after retry
    mock.onAny().reply(200, { success: true });

    // Use fake timers to avoid waiting for 60 seconds
    jest.useFakeTimers();

    const responsePromise = retryResponseErrorHandler(error, config, client);

    // Fast-forward time by 60 seconds
    jest.advanceTimersByTime(60000);

    const response: any = await responsePromise;

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    jest.useRealTimers();
  });

  it('should reject with rate limit error when x-ratelimit-remaining is 0 and retry limit is exceeded', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 3 }, // Already at retry limit
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

  it('should successfully retry after rate limit token replenishment using x-ratelimit-reset-time header', async () => {
    const futureResetTime = new Date(Date.now() + 1500); // 1.5 seconds from now
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 429,
        headers: {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset-time': futureResetTime.toISOString(),
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

    // Mock successful response after retry (simulating token replenishment)
    mock.onAny().reply(200, {
      success: true,
      message: 'Request successful after token replenishment',
      data: { id: 123, name: 'test-content' },
    });

    jest.useFakeTimers();

    const responsePromise = retryResponseErrorHandler(error, config, client);

    // Fast-forward time to simulate waiting for token replenishment (1.5s + 1s buffer = 2.5s)
    jest.advanceTimersByTime(2500);

    const response: any = await responsePromise;

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toBe('Request successful after token replenishment');
    expect(response.data.data.id).toBe(123);

    jest.useRealTimers();
  });

  it('should handle token replenishment scenario with increasing delay', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 429,
        headers: {
          'x-ratelimit-remaining': '0',
          'retry-after': '2', // 2 seconds for token replenishment
        },
        data: {
          error_message: 'Rate limit exceeded - tokens exhausted',
          error_code: 429,
          errors: null,
        },
      },
    };
    const config = { retryLimit: 3 };
    const client = axios.create();

    // Mock successful response after token replenishment delay
    mock.onAny().reply(200, {
      success: true,
      message: 'Tokens successfully replenished',
      tokensRemaining: 10,
      timestamp: Date.now(),
    });

    jest.useFakeTimers();

    const responsePromise = retryResponseErrorHandler(error, config, client);

    // Fast-forward time to simulate waiting for token replenishment
    jest.advanceTimersByTime(2000); // 2 seconds as specified in retry-after

    const response: any = await responsePromise;

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toBe('Tokens successfully replenished');
    expect(response.data.tokensRemaining).toBe(10);

    jest.useRealTimers();
  });

  it('should simulate real-world token bucket replenishment after rate limit exhaustion', async () => {
    const currentTime = Date.now();
    const resetTime = currentTime + 3000; // 3 seconds from now

    const error = {
      config: {
        retryOnError: true,
        retryCount: 1,
        url: '/v3/content_types/blog_post/entries',
        method: 'GET',
      },
      response: {
        status: 429,
        headers: {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': Math.floor(resetTime / 1000).toString(), // Unix timestamp
          'x-ratelimit-limit': '100',
        },
        data: {
          error_message: 'API rate limit exceeded. Try again after some time.',
          error_code: 429,
          errors: {
            rate_limit: ['Too Many Requests - Rate limit quota exceeded'],
          },
        },
      },
    };
    const config = { retryLimit: 3 };
    const client = axios.create();

    // Mock successful response after token bucket is replenished
    mock.onGet('/v3/content_types/blog_post/entries').reply(200, {
      entries: [
        { uid: 'entry1', title: 'Blog Post 1', content: 'Content 1' },
        { uid: 'entry2', title: 'Blog Post 2', content: 'Content 2' },
      ],
      total_count: 2,
      rate_limit_info: {
        remaining: 99,
        limit: 100,
        reset_time: Math.floor((currentTime + 60000) / 1000), // Next reset in 1 minute
      },
    });

    jest.useFakeTimers();
    jest.setSystemTime(currentTime);

    const responsePromise = retryResponseErrorHandler(error, config, client);

    // Fast-forward time to simulate waiting for token bucket replenishment (3s + 1s buffer)
    jest.advanceTimersByTime(4000);

    const response: any = await responsePromise;

    expect(response.status).toBe(200);
    expect(response.data.entries).toHaveLength(2);
    expect(response.data.rate_limit_info.remaining).toBe(99);
    expect(response.data.rate_limit_info.limit).toBe(100);
    expect(response.data.total_count).toBe(2);

    jest.useRealTimers();
  });

  it('should handle retry error rejection when rate limited request fails on retry', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 429,
        headers: {
          'x-ratelimit-remaining': '0',
          'retry-after': '1',
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

    // Mock retry to fail with a different error
    mock.onAny().reply(() => {
      throw new Error('Network timeout during retry');
    });

    jest.useFakeTimers();

    const responsePromise = retryResponseErrorHandler(error, config, client);

    // Fast-forward time to trigger the retry
    jest.advanceTimersByTime(1000);

    await expect(responsePromise).rejects.toThrow('Network timeout during retry');

    jest.useRealTimers();
  });

  it('should reject with original error when 429/401 response has no data', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 5 },
      response: {
        status: 429,
        statusText: 'Rate limit exceeded',
        headers: {},
        // No data property
      },
    };
    const config = { retryLimit: 5 };
    const client = axios.create();

    await expect(retryResponseErrorHandler(error, config, client)).rejects.toEqual(error);
  });

  it('should create and throw custom error for non-retryable responses', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        data: {
          error_message: 'Invalid request parameters',
          error_code: 400,
          errors: ['Missing required field: title'],
        },
      },
    };
    const config = { retryLimit: 3 };
    const client = axios.create();

    try {
      await retryResponseErrorHandler(error, config, client);
      fail('Expected retryResponseErrorHandler to throw a custom error');
    } catch (customError: any) {
      expect(customError.status).toBe(400);
      expect(customError.statusText).toBe('Bad Request');
      expect(customError.error_message).toBe('Invalid request parameters');
      expect(customError.error_code).toBe(400);
      expect(customError.errors).toEqual(['Missing required field: title']);
    }
  });

  it('should create custom error for 500 internal server error', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        data: {
          error_message: 'Database connection failed',
          error_code: 500,
          errors: null,
        },
      },
    };
    const config = { retryLimit: 3 };
    const client = axios.create();

    try {
      await retryResponseErrorHandler(error, config, client);
      fail('Expected retryResponseErrorHandler to throw a custom error');
    } catch (customError: any) {
      expect(customError.status).toBe(500);
      expect(customError.statusText).toBe('Internal Server Error');
      expect(customError.error_message).toBe('Database connection failed');
      expect(customError.error_code).toBe(500);
      expect(customError.errors).toBe(null);
    }
  });

  it('should handle custom error for 422 unprocessable entity', async () => {
    const error = {
      config: { retryOnError: true, retryCount: 1 },
      response: {
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: {},
        data: {
          error_message: 'Validation failed',
          error_code: 422,
          errors: {
            title: ['Title is required'],
            content: ['Content cannot be empty'],
          },
        },
      },
    };
    const config = { retryLimit: 3 };
    const client = axios.create();

    try {
      await retryResponseErrorHandler(error, config, client);
      fail('Expected retryResponseErrorHandler to throw a custom error');
    } catch (customError: any) {
      expect(customError.status).toBe(422);
      expect(customError.statusText).toBe('Unprocessable Entity');
      expect(customError.error_message).toBe('Validation failed');
      expect(customError.error_code).toBe(422);
      expect(customError.errors).toEqual({
        title: ['Title is required'],
        content: ['Content cannot be empty'],
      });
    }
  });
});

describe('calculateRateLimitDelay', () => {
  it('should return delay from retry-after header in milliseconds', () => {
    const headers = { 'retry-after': '5' };
    const delay = calculateRateLimitDelay(headers);
    expect(delay).toBe(5000); // 5 seconds * 1000 = 5000ms
  });

  it('should return delay from x-ratelimit-reset header with Unix timestamp', () => {
    const currentTime = Date.now();
    const resetTime = Math.floor((currentTime + 3000) / 1000); // 3 seconds from now

    jest.spyOn(Date, 'now').mockReturnValue(currentTime);

    const headers = { 'x-ratelimit-reset': resetTime.toString() };
    const delay = calculateRateLimitDelay(headers);

    // Should be approximately 3000ms + 1000ms buffer, allowing for some timing variance
    expect(delay).toBeGreaterThanOrEqual(3000);
    expect(delay).toBeLessThan(5000);

    jest.restoreAllMocks();
  });

  it('should return minimum delay when x-ratelimit-reset is in the past', () => {
    const currentTime = Date.now();
    const pastTime = Math.floor((currentTime - 5000) / 1000); // 5 seconds ago

    jest.spyOn(Date, 'now').mockReturnValue(currentTime);

    const headers = { 'x-ratelimit-reset': pastTime.toString() };
    const delay = calculateRateLimitDelay(headers);

    // Should return minimum delay of 1000ms
    expect(delay).toBe(1000);

    jest.restoreAllMocks();
  });

  it('should return delay from x-ratelimit-reset-time header with ISO string', () => {
    const currentTime = Date.now();
    const futureTime = new Date(currentTime + 2500); // 2.5 seconds from now

    jest.spyOn(Date, 'now').mockReturnValue(currentTime);

    const headers = { 'x-ratelimit-reset-time': futureTime.toISOString() };
    const delay = calculateRateLimitDelay(headers);

    // Should be 2500ms + 1000ms buffer = 3500ms minimum
    expect(delay).toBeGreaterThanOrEqual(3500);
    expect(delay).toBeLessThan(4000);

    jest.restoreAllMocks();
  });

  it('should return minimum delay when x-ratelimit-reset-time is in the past', () => {
    const currentTime = Date.now();
    const pastTime = new Date(currentTime - 3000); // 3 seconds ago

    jest.spyOn(Date, 'now').mockReturnValue(currentTime);

    const headers = { 'x-ratelimit-reset-time': pastTime.toISOString() };
    const delay = calculateRateLimitDelay(headers);

    // Should return minimum delay of 1000ms
    expect(delay).toBe(1000);

    jest.restoreAllMocks();
  });

  it('should return default fallback delay when no rate limit headers are present', () => {
    const headers = {}; // No rate limit headers
    const delay = calculateRateLimitDelay(headers);

    // Should return default fallback of 1 second
    expect(delay).toBe(1000);
  });

  it('should return default fallback delay when headers have other unrelated values', () => {
    const headers = {
      'content-type': 'application/json',
      'x-api-version': '3.0',
      'cache-control': 'no-cache',
    };
    const delay = calculateRateLimitDelay(headers);

    // Should return default fallback of 1 second
    expect(delay).toBe(1000);
  });

  it('should prioritize retry-after over other headers', () => {
    const currentTime = Date.now();
    const futureResetTime = Math.floor((currentTime + 10000) / 1000); // 10 seconds from now

    const headers = {
      'retry-after': '2', // 2 seconds
      'x-ratelimit-reset': futureResetTime.toString(), // 10 seconds
      'x-ratelimit-reset-time': new Date(currentTime + 15000).toISOString(), // 15 seconds
    };

    const delay = calculateRateLimitDelay(headers);

    // Should use retry-after (2 seconds = 2000ms)
    expect(delay).toBe(2000);
  });

  it('should prioritize x-ratelimit-reset over x-ratelimit-reset-time when retry-after is not present', () => {
    const currentTime = Date.now();
    const resetTime = Math.floor((currentTime + 5000) / 1000); // 5 seconds from now

    jest.spyOn(Date, 'now').mockReturnValue(currentTime);

    const headers = {
      'x-ratelimit-reset': resetTime.toString(), // 5 seconds
      'x-ratelimit-reset-time': new Date(currentTime + 8000).toISOString(), // 8 seconds
    };

    const delay = calculateRateLimitDelay(headers);

    // Should use x-ratelimit-reset (approximately 5 seconds + 1 second buffer), allowing for timing variance
    expect(delay).toBeGreaterThanOrEqual(5000);
    expect(delay).toBeLessThan(7000);

    jest.restoreAllMocks();
  });
});
