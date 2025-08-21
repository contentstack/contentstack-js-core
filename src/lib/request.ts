import { AxiosInstance } from './types';

export async function getData(instance: AxiosInstance, url: string, data?: any) {
  try {
    if (instance.stackConfig && instance.stackConfig.live_preview) {
      const livePreviewParams = instance.stackConfig.live_preview;

      if (livePreviewParams.enable) {
        data.live_preview = livePreviewParams.live_preview || 'init';
      }

      if (livePreviewParams.preview_token) {
        instance.defaults.headers.preview_token = livePreviewParams.preview_token;
        instance.defaults.headers.live_preview = livePreviewParams.live_preview;
      }
      if (livePreviewParams.enable) {
        // adds protocol so host is replaced and not appended
        if (livePreviewParams.live_preview && livePreviewParams.live_preview !== 'init') {
          if (!livePreviewParams.host) {
            throw new Error('Host is required for live preview');
          }
          url = (livePreviewParams.host.startsWith('https://') ? '' : 'https://') + livePreviewParams.host + url;
        }
      }
    }
    const response = await instance.get(url, data);

    if (response && response.data) {
      return response.data;
    } else {
      throw response;
    }
  } catch (err: any) {
    throw err;
  }
}
