import { AxiosInstance } from '../src';
import { httpClient } from '../src/lib/contentstack-core';
import MockAdapter from 'axios-mock-adapter';
describe('contentstackCore', () => {
  it('should return default config when no config is passed', () => {
    httpClient({});
  });

  describe('logHandler', () => {
    it('should log an error message when level is "error" and data is provided', () => {
      const error = {
        name: 'Error',
        message: 'Something went wrong',
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      httpClient({}).defaults.logHandler('error', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error: Error - Something went wrong. Review the error details and try again.'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not log anything when level is "error" and no data is provided', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      httpClient({}).defaults.logHandler('error');
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log a message with the provided level and data', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      httpClient({}).defaults.logHandler('info', 'Some message');

      expect(consoleLogSpy).toHaveBeenCalledWith('info: Some message. Review the details and try again.');

      consoleLogSpy.mockRestore();
    });
  });

  describe('retryCondition', () => {
    it('should return true when error response status is 429', () => {
      const error = {
        response: {
          status: 429,
        },
      };

      const shouldRetry = httpClient({}).defaults.retryCondition(error);

      expect(shouldRetry).toBe(true);
    });

    it('should return false when error response status is not 429', () => {
      const error = {
        response: {
          status: 400,
        },
      };

      const shouldRetry = httpClient({}).defaults.retryCondition(error);

      expect(shouldRetry).toBe(false);
    });

    it('should return false when error response is not present', () => {
      const error = {};

      const shouldRetry = httpClient({}).defaults.retryCondition(error);

      expect(shouldRetry).toBe(false);
    });
  });

  describe('config.headers', () => {
    it('should include apiKey in headers when provided', () => {
      const options = {
        apiKey: 'my-api-key',
        accessToken: 'my-access-token',
        insecure: true,
        defaultHostname: 'example.com',
        port: 443,
        endpoint: 'https://example.com/api',
        basePath: '/v1',
      };

      const instance = httpClient(options);

      expect(instance.defaults.headers).toEqual(
        expect.objectContaining({
          api_key: 'my-api-key',
          access_token: 'my-access-token',
        })
      );
    });

    it('should include accessToken in headers when provided', () => {
      const options = {
        apiKey: 'my-api-key',
        accessToken: 'my-access-token',
        insecure: false,
        defaultHostname: 'example.com',
        port: 443,
        endpoint: 'https://example.com/api',
        basePath: '/v1',
      };

      const instance = httpClient(options);

      expect(instance.defaults.headers).toEqual(
        expect.objectContaining({
          api_key: 'my-api-key',
          access_token: 'my-access-token',
        })
      );
    });

    it('should not include apiKey in headers when not provided', () => {
      const options = {
        insecure: false,
        defaultHostname: 'example.com',
        port: 443,
        endpoint: 'https://example.com/api',
        basePath: '/v1',
      };

      const instance = httpClient(options);

      expect(instance.defaults.headers.api_key).toBeUndefined();
    });

    it('should not include accessToken in headers when not provided', () => {
      const options = {
        insecure: false,
        defaultHostname: 'example.com',
        port: 443,
        endpoint: 'https://example.com/api',
        basePath: '/v1',
      };

      const instance = httpClient(options);

      expect(instance.defaults.headers.access_token).toBeUndefined();
    });
  });

  describe('config.onError', () => {
    it('should call the onError function when an error occurs', async () => {
      // Suppress expected console.error from network error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const onError = jest.fn();
      const options = {
        defaultHostname: 'cdn.contentstack.io',
        onError,
      };

      const instance = httpClient(options);

      try {
        await instance.get('/');
      } catch (error: unknown) {
        expect(onError).toBeCalledWith(error);
      }

      consoleErrorSpy.mockRestore();
    });

    it('should not call the onError function when no error occurs', async () => {
      const HOST_URL = 'cdn.contentstack.io';
      const client: AxiosInstance = httpClient({
        defaultHostname: HOST_URL,
        params: { environment: 'env' },
        onError: jest.fn(),
      });
      const mockClient = new MockAdapter(client);

      mockClient.onGet('/').reply(200, {
        data: 'Hello, World!',
      });

      await client.get('/');

      expect(client.httpClientParams.onError).not.toBeCalled();
    });
  });

  describe('config deep cloning', () => {
    it('should properly handle nested objects in params using cloneDeep', () => {
      const options = {
        defaultHostname: 'example.com',
        params: {
          environment: 'test',
          nested: {
            level1: {
              level2: {
                value: 'deep-nested',
              },
            },
          },
        },
      };

      const instance = httpClient(options);

      // Verify nested structure is properly accessible
      // This test ensures cloneDeep is working correctly (ESM import fix)
      expect(instance.httpClientParams.params?.nested?.level1?.level2?.value).toBe('deep-nested');
      expect(instance.httpClientParams.params?.environment).toBe('test');
    });

    it('should handle complex nested structures in params', () => {
      const complexOptions = {
        defaultHostname: 'example.com',
        params: {
          environment: 'production',
          filters: {
            category: {
              name: 'tech',
              tags: ['javascript', 'typescript'],
            },
          },
        },
      };

      const instance = httpClient(complexOptions);

      // Verify complex nested structure is properly handled
      expect(instance.httpClientParams.params?.filters?.category?.name).toBe('tech');
      expect(instance.httpClientParams.params?.filters?.category?.tags).toEqual(['javascript', 'typescript']);
    });

    it('should work correctly with lodash cloneDeep import (ESM compatibility)', () => {
      // This test verifies that the lodash import works correctly in ESM
      // by ensuring nested object cloning works as expected
      const options = {
        defaultHostname: 'example.com',
        params: {
          query: {
            type: 'entry',
            include: {
              count: true,
              schema: true,
            },
          },
        },
      };

      const instance = httpClient(options);

      // If cloneDeep wasn't working (due to import issues), this would fail
      expect(instance.httpClientParams.params?.query?.type).toBe('entry');
      expect(instance.httpClientParams.params?.query?.include?.count).toBe(true);
      expect(instance.httpClientParams.params?.query?.include?.schema).toBe(true);
    });
  });
});
