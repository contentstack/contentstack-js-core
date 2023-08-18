import { AxiosInstance } from './types';

export async function getData(client: AxiosInstance, url: string, data: { [key: string]: string | number } = {}) {
  try {
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
