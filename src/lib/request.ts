import { Axios } from 'axios';

export async function getData(instance: Axios, url: string, data?: any) {
  try {
    const response = await instance.get(url, { params: data });
    if (response && response.data) {
      return response.data;
    } else {
      throw Error(JSON.stringify(response));
    }
  } catch (err) {
    throw Error(JSON.stringify(err));
  }
}
