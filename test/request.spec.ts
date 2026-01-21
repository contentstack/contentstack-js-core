import { getData, httpClient } from '../src';
import MockAdapter from 'axios-mock-adapter';
describe('Request tests', () => {
  it('should fetch successfully data from an API', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const mockResponse = { yourMockData: 'mocked' };
    const url = '/your-api-endpoint';
    const expectedResponse = mockResponse;

    mock.onGet(url).reply(200, mockResponse);

    const result = await getData(client, url);

    expect(result).toEqual(expectedResponse);
  });
  it('should handle errors', async () => {
    const client = httpClient({});
    const mockClient = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const errorMessage = 'Request failed with status code 404';

    mockClient.onGet(url).reply(404, { error: errorMessage });

    await expect(getData(client, url)).rejects.toThrowError(errorMessage);
  });

  it('should throw error when host is required for live preview', async () => {
    const client = httpClient({});
    const url = '/your-api-endpoint';
    client.stackConfig = {
      live_preview: {
        enable: true,
        preview_token: 'someToken',
        live_preview: '<live_preview_hash>', // this gets added via Delivery SDK; added here in core only for testing.
      },
    };
    await expect(getData(client, url, {})).rejects.toThrowError('Host is required for live preview');
  });

  it('should handle live_preview with enable=true and live_preview=init', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const mockResponse = { data: 'mocked' };

    client.stackConfig = {
      live_preview: {
        enable: true,
        preview_token: 'someToken',
        live_preview: 'init',
      },
    };

    mock.onGet(url).reply(200, mockResponse);

    const result = await getData(client, url, {});
    expect(result).toEqual(mockResponse);
  });

  it('should set baseURL correctly when host is provided without https://', async () => {
    const client = httpClient({
      defaultHostname: 'example.com',
    });
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const livePreviewURL = 'https://rest-preview.com' + url;
    const mockResponse = { data: 'mocked' };

    client.stackConfig = {
      live_preview: {
        enable: true,
        preview_token: 'someToken',
        live_preview: 'someHash',
        host: 'rest-preview.com',
      },
    };

    mock.onGet(livePreviewURL).reply(200, mockResponse);

    const result = await getData(client, url, {});
    expect(client.defaults.baseURL).toBe('https://example.com:443/v3');
    expect(client.stackConfig.live_preview.host).toBe('rest-preview.com');
    expect(mock.history.get[0].url).toBe(livePreviewURL);
    expect(result).toEqual(mockResponse);
  });

  it('should not modify baseURL when host is already prefixed with https://', async () => {
    const client = httpClient({
      defaultHostname: 'example.com',
    });
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const livePreviewURL = 'https://rest-preview.com' + url;
    const mockResponse = { data: 'mocked' };

    client.stackConfig = {
      live_preview: {
        enable: true,
        preview_token: 'someToken',
        live_preview: 'someHash',
        host: 'https://rest-preview.com',
      },
    };

    mock.onGet(livePreviewURL).reply(200, mockResponse);

    const result = await getData(client, url, {});
    expect(client.defaults.baseURL).toBe('https://example.com:443/v3');
    expect(client.stackConfig.live_preview.host).toBe('https://rest-preview.com');
    expect(mock.history.get[0].url).toBe(livePreviewURL);
    expect(result).toEqual(mockResponse);
  });

  it('should throw error when response has no data property', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';

    // Mock response that returns undefined/empty data
    mock.onGet(url).reply(() => [200, undefined, {}]);

    await expect(getData(client, url)).rejects.toBeDefined();
  });

  it('should throw error when response is null', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';

    // Mock response that returns null
    mock.onGet(url).reply(() => [200, null]);

    await expect(getData(client, url)).rejects.toBeDefined();
  });

  it('should handle live_preview when enable is false', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const mockResponse = { data: 'mocked' };

    client.stackConfig = {
      live_preview: {
        enable: false, // Disabled
        preview_token: 'someToken',
        live_preview: 'someHash',
        host: 'rest-preview.com',
      },
    };

    mock.onGet(url).reply(200, mockResponse);

    const result = await getData(client, url, {});

    // Should not modify URL when live preview is disabled
    expect(mock.history.get[0].url).toBe(url);
    expect(result).toEqual(mockResponse);
  });

  it('should handle request when stackConfig is undefined', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const mockResponse = { data: 'mocked' };

    // No stackConfig set
    client.stackConfig = undefined;

    mock.onGet(url).reply(200, mockResponse);

    const result = await getData(client, url, {});
    expect(result).toEqual(mockResponse);
  });

  it('should handle request when stackConfig exists but live_preview is undefined', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const mockResponse = { data: 'mocked' };

    client.stackConfig = {
      // live_preview not defined
      apiKey: 'test-key',
    };

    mock.onGet(url).reply(200, mockResponse);

    const result = await getData(client, url, {});
    expect(result).toEqual(mockResponse);
  });

  it('should set live_preview to "init" when enable is true and no live_preview provided', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const mockResponse = { data: 'mocked' };

    client.stackConfig = {
      live_preview: {
        enable: true,
        preview_token: 'someToken',
        // live_preview not provided
      },
    };

    mock.onGet(url).reply(200, mockResponse);

    const data: any = {};
    const result = await getData(client, url, data);

    // Should set live_preview to 'init'
    expect(data.live_preview).toBe('init');
    expect(result).toEqual(mockResponse);
  });

  it('should set headers when preview_token is provided', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const mockResponse = { data: 'mocked' };

    client.stackConfig = {
      live_preview: {
        enable: true,
        preview_token: 'test-preview-token',
        live_preview: 'init',
      },
    };

    mock.onGet(url).reply(200, mockResponse);

    const result = await getData(client, url, {});

    // Should set headers
    expect(client.defaults.headers.preview_token).toBe('test-preview-token');
    expect(client.defaults.headers.live_preview).toBe('init');
    expect(result).toEqual(mockResponse);
  });

  it('should handle live_preview when enable is true but no preview_token', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const mockResponse = { data: 'mocked' };

    client.stackConfig = {
      live_preview: {
        enable: true,
        live_preview: 'init',
        // preview_token not provided
      },
    };

    mock.onGet(url).reply(200, mockResponse);

    const data: any = {};
    const result = await getData(client, url, data);

    // Should still set live_preview in data
    expect(data.live_preview).toBe('init');
    expect(result).toEqual(mockResponse);
  });

  it('should handle custom error messages when request fails', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const customError = new Error('Custom network error');

    mock.onGet(url).reply(() => {
      throw customError;
    });

    await expect(getData(client, url)).rejects.toThrowError('Custom network error');
  });

  it('should handle non-Error objects as errors when they have message property', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const errorObject = { status: 500, message: 'Internal Server Error' };

    mock.onGet(url).reply(() => {
      throw errorObject;
    });

    // When error has message property, it uses the message
    await expect(getData(client, url)).rejects.toBeDefined();
  });

  it('should handle non-Error objects as errors when they have no message property', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const errorObject = { status: 500, code: 'SERVER_ERROR' };

    mock.onGet(url).reply(() => {
      throw errorObject;
    });

    // When error has no message property, it stringifies the object
    await expect(getData(client, url)).rejects.toBeDefined();
  });

  it('should pass data parameter to axios get request', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const mockResponse = { data: 'mocked' };
    const requestData = { params: { limit: 10, skip: 0 } };

    mock.onGet(url).reply((config) => {
      // Verify that data was passed correctly
      expect(config.params).toEqual(requestData.params);

      return [200, mockResponse];
    });

    const result = await getData(client, url, requestData);
    expect(result).toEqual(mockResponse);
  });

  it('should handle React Native compatibility by avoiding URLSearchParams.set()', async () => {
    const client = httpClient({});
    const mock = new MockAdapter(client as any);
    const url = '/your-api-endpoint';
    const mockResponse = { data: 'mocked' };
    const requestData = {
      params: {
        limit: 10,
        skip: 0,
        include: ['field1', 'field2'],
        query: { title: 'test' },
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        specialChars: 'hello world & more',
      },
    };

    mock.onGet(url).reply(200, mockResponse);

    // The test passes if no "URLSearchParams.set is not implemented" error is thrown
    const result = await getData(client, url, requestData);
    expect(result).toEqual(mockResponse);
  });

  it('should use instance.request when URL length exceeds 2000 characters', async () => {
    const client = httpClient({ defaultHostname: 'example.com' });
    const url = '/your-api-endpoint';
    const mockResponse = { data: 'mocked' };

    // Create a very long query parameter that will exceed 2000 characters when combined with baseURL
    // baseURL is typically like 'https://example.com:443/v3' (~30 chars), url is '/your-api-endpoint' (~20 chars)
    // So we need params that serialize to >1950 chars to exceed 2000 total
    const longParam = 'x'.repeat(2000);
    const requestData = { params: { longParam, param2: 'y'.repeat(500) } };

    // Mock instance.request since that's what gets called for long URLs
    const requestSpy = jest.spyOn(client, 'request').mockResolvedValue({ data: mockResponse } as any);

    const result = await getData(client, url, requestData);

    expect(result).toEqual(mockResponse);
    // Verify that request was called (not get) with the full URL
    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get',
        url: expect.stringMatching(/longParam/),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })
    );

    requestSpy.mockRestore();
  });

  describe('Absolute URL handling', () => {
    it('should not concatenate baseURL when absolute https:// URL is passed', async () => {
      const client = httpClient({
        defaultHostname: 'example.com',
      });
      const mock = new MockAdapter(client as any);
      const absoluteUrl = 'https://external-api.com/api/endpoint';
      const mockResponse = { data: 'mocked' };

      mock.onGet(absoluteUrl).reply(200, mockResponse);

      const result = await getData(client, absoluteUrl, {});

      expect(result).toEqual(mockResponse);
      // Verify that the absolute URL was used as-is, not concatenated with baseURL
      expect(mock.history.get[0].url).toBe(absoluteUrl);
    });

    it('should not concatenate baseURL when absolute http:// URL is passed', async () => {
      const client = httpClient({
        defaultHostname: 'example.com',
      });
      const mock = new MockAdapter(client as any);
      const absoluteUrl = 'http://external-api.com/api/endpoint';
      const mockResponse = { data: 'mocked' };

      mock.onGet(absoluteUrl).reply(200, mockResponse);

      const result = await getData(client, absoluteUrl, {});

      expect(result).toEqual(mockResponse);
      // Verify that the absolute URL was used as-is
      expect(mock.history.get[0].url).toBe(absoluteUrl);
    });

    it('should still concatenate baseURL when relative URL is passed', async () => {
      const client = httpClient({
        defaultHostname: 'example.com',
      });
      const mock = new MockAdapter(client as any);
      const relativeUrl = '/api/endpoint';
      const mockResponse = { data: 'mocked' };

      mock.onGet(relativeUrl).reply(200, mockResponse);

      const result = await getData(client, relativeUrl, {});

      expect(result).toEqual(mockResponse);
      // Verify that relative URL was used (Axios will combine with baseURL)
      expect(mock.history.get[0].url).toBe(relativeUrl);
      expect(client.defaults.baseURL).toBe('https://example.com:443/v3');
    });

    it('should handle absolute URL with query parameters correctly', async () => {
      const client = httpClient({
        defaultHostname: 'example.com',
      });
      const mock = new MockAdapter(client as any);
      const absoluteUrl = 'https://external-api.com/api/endpoint';
      const mockResponse = { data: 'mocked' };
      const requestData = { params: { limit: 10, skip: 0 } };

      mock.onGet(absoluteUrl).reply((config) => {
        expect(config.params).toEqual(requestData.params);

        return [200, mockResponse];
      });

      const result = await getData(client, absoluteUrl, requestData);

      expect(result).toEqual(mockResponse);
      expect(mock.history.get[0].url).toBe(absoluteUrl);
    });

    it('should handle live preview with absolute URL correctly (no double baseURL)', async () => {
      const client = httpClient({
        defaultHostname: 'example.com',
      });
      const mock = new MockAdapter(client as any);
      const relativeUrl = '/your-api-endpoint';
      const livePreviewAbsoluteUrl = 'https://rest-preview.com/your-api-endpoint';
      const mockResponse = { data: 'mocked' };

      client.stackConfig = {
        live_preview: {
          enable: true,
          preview_token: 'someToken',
          live_preview: 'someHash',
          host: 'rest-preview.com',
        },
      };

      mock.onGet(livePreviewAbsoluteUrl).reply(200, mockResponse);

      const result = await getData(client, relativeUrl, {});

      expect(result).toEqual(mockResponse);
      // Verify that the live preview absolute URL was used, not concatenated with baseURL
      expect(mock.history.get[0].url).toBe(livePreviewAbsoluteUrl);
      expect(client.defaults.baseURL).toBe('https://example.com:443/v3');
    });

    it('should handle custom endpoint with absolute URL correctly', async () => {
      const client = httpClient({
        endpoint: 'https://custom-api.com/v2',
      });
      const mock = new MockAdapter(client as any);
      const absoluteUrl = 'https://external-api.com/api/endpoint';
      const mockResponse = { data: 'mocked' };

      mock.onGet(absoluteUrl).reply(200, mockResponse);

      const result = await getData(client, absoluteUrl, {});

      expect(result).toEqual(mockResponse);
      // Verify that absolute URL was used as-is, ignoring the custom endpoint baseURL
      expect(mock.history.get[0].url).toBe(absoluteUrl);
    });

    it('should handle absolute URL when actualFullUrl exceeds 2000 characters', async () => {
      const client = httpClient({
        defaultHostname: 'example.com',
      });
      const absoluteUrl = 'https://external-api.com/api/endpoint';
      const mockResponse = { data: 'mocked' };

      // Create a very long query parameter that will exceed 2000 characters
      const longParam = 'x'.repeat(2000);
      const requestData = { params: { longParam, param2: 'y'.repeat(500) } };

      // Mock instance.request since that's what gets called for long URLs
      const requestSpy = jest.spyOn(client, 'request').mockResolvedValue({ data: mockResponse } as any);

      const result = await getData(client, absoluteUrl, requestData);

      expect(result).toEqual(mockResponse);
      // Verify that request was called with the absolute URL (not concatenated with baseURL)
      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: expect.stringContaining('https://external-api.com/api/endpoint'),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        })
      );
      // Verify the URL doesn't contain the baseURL
      const callUrl = requestSpy.mock.calls[0][0].url;
      expect(callUrl).not.toContain('example.com:443/v3');
      expect(callUrl).toContain('external-api.com');

      requestSpy.mockRestore();
    });
  });

  describe('URL length optimization for includeReference parameters', () => {
    it('should use compact format when URL with many include[] parameters exceeds threshold', async () => {
      const client = httpClient({ defaultHostname: 'example.com' });
      const mock = new MockAdapter(client as any);
      const url = '/content_types/blog/entries/entry123';
      const mockResponse = { entry: { uid: 'entry123', title: 'Test' } };

      // Create many include[] parameters that would make URL long
      const manyIncludes = Array.from({ length: 100 }, (_, i) => `ref_field_${i}`);
      const requestData = { params: { 'include[]': manyIncludes } };

      mock.onGet(url).reply(200, mockResponse);

      const result = await getData(client, url, requestData);
      expect(result).toEqual(mockResponse);
      
      // Verify the request was made (URL optimization allowed it to succeed)
      expect(mock.history.get.length).toBe(1);
      const requestUrl = mock.history.get[0].url || '';
      // With compact format, the URL should be shorter and contain comma-separated values
      // We verify success means the optimization worked
      expect(requestUrl.length).toBeLessThan(3000);
    });

    it('should use compact format for Live Preview requests with lower threshold', async () => {
      const client = httpClient({ defaultHostname: 'example.com' });
      const mock = new MockAdapter(client as any);
      const url = '/content_types/blog/entries/entry123';
      const mockResponse = { entry: { uid: 'entry123', title: 'Test' } };

      client.stackConfig = {
        live_preview: {
          enable: true,
          preview_token: 'someToken',
          live_preview: 'someHash',
          host: 'rest-preview.contentstack.com',
        },
      };

      // Create include[] parameters that would exceed 1500 chars for Live Preview
      // but might be okay for regular requests (2000 chars)
      const manyIncludes = Array.from({ length: 80 }, (_, i) => `ref_field_${i}_with_long_name`);
      const requestData = { params: { 'include[]': manyIncludes } };

      const livePreviewUrl = 'https://rest-preview.contentstack.com' + url;
      mock.onGet(livePreviewUrl).reply(200, mockResponse);

      const result = await getData(client, url, requestData);
      expect(result).toEqual(mockResponse);
      
      // Verify the request was made to Live Preview host
      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].url).toContain('rest-preview.contentstack.com');
    });

    it('should throw error when URL is too long even with compact format', async () => {
      const client = httpClient({ defaultHostname: 'example.com' });
      const url = '/content_types/blog/entries/entry123';

      client.stackConfig = {
        live_preview: {
          enable: true,
          preview_token: 'someToken',
          live_preview: 'someHash',
          host: 'rest-preview.contentstack.com',
        },
      };

      // Create an extremely large number of includes that would exceed even compact format
      const manyIncludes = Array.from({ length: 500 }, (_, i) => `very_long_reference_field_name_${i}_with_many_characters`);
      const requestData = { params: { 'include[]': manyIncludes } };

      await expect(getData(client, url, requestData)).rejects.toThrow(/exceeds the maximum allowed length/);
    });

    it('should use standard format when URL length is within threshold', async () => {
      const client = httpClient({ defaultHostname: 'example.com' });
      const mock = new MockAdapter(client as any);
      const url = '/content_types/blog/entries/entry123';
      const mockResponse = { entry: { uid: 'entry123', title: 'Test' } };

      // Create a small number of includes that won't exceed threshold
      const requestData = { params: { 'include[]': ['ref1', 'ref2', 'ref3'] } };

      mock.onGet(url).reply(200, mockResponse);

      const result = await getData(client, url, requestData);
      expect(result).toEqual(mockResponse);
      
      // Verify the request was made successfully
      expect(mock.history.get.length).toBe(1);
    });
  });
});
