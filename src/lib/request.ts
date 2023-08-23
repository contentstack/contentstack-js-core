import { AxiosInstance, IHttpClientParams } from './types';
import { httpClient } from './contentstack-core';

export async function getData(clientConfig: IHttpClientParams, url: string, data?: any) {
  const client: AxiosInstance = httpClient(clientConfig);
  try {
    if (clientConfig.params?.environment) {
      data.environment = clientConfig.params.environment;
    }
    const response = await client.get(url, data);
    if (response.data) {
      return response.data;
    } else {
      throw Error(JSON.stringify(response));
    }
  } catch (err) {
    throw err;
  }
}
