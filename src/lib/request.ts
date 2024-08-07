import { AxiosInstance } from './types';

export async function getData(instance: AxiosInstance, url: string, data?: any) {
  try {
    console.log(instance.defaults.baseURL, instance.stackConfig.live_preview.host);
    if (instance.stackConfig && instance.stackConfig.live_preview) {
      const livePreviewParams = instance.stackConfig.live_preview;

      if (livePreviewParams.enable) {
        data.live_preview = livePreviewParams.live_preview || 'init';
      }

      if (livePreviewParams.enable && livePreviewParams.live_preview && livePreviewParams.live_preview !== 'init') {
        instance.defaults.baseURL = livePreviewParams.host;
      }
    }
    const response = await instance.get(url, { params: data });
    console.log('🚀 ~ getData ~ url, { params: data }:', url, { params: data });

    if (response && response.data) {
      return response.data;
    } else {
      throw Error(JSON.stringify(response));
    }
  } catch (err) {
    throw Error(JSON.stringify(err));
  }
}
