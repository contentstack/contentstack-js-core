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
});
