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
});
