import { AxiosInstance } from './types';

export async function getData(instance: AxiosInstance, url: string, data?: any) {
  try {
    const response = await instance.get(url, { params: data });
    if (response.data) {
      return response.data;
    } else {
      throw Error(JSON.stringify(response));
    }
  } catch (err) {
    throw err;
  }
}
