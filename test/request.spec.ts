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
        specialChars: 'hello world & more'
      } 
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
});
