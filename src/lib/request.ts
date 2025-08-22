import { AxiosInstance } from './types';

/**
 * Serializes parameters to match Postman format
 * Handles array parameters properly with & separators
 */
function serializeParams(params: any): string {
  if (!params) return '';
  const urlParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (Array.isArray(value)) {
      // Handle array parameters like include[]
      value.forEach(item => {
        urlParams.append(key, item);
      });
    } else {
      // Handle all other parameter types
      urlParams.set(key, value);
    }
  });
  
  return urlParams.toString();
}

/**
 * Builds the full URL with query parameters
 */
function buildFullUrl(baseURL: string | undefined, url: string, queryString: string): string {
  const base = baseURL || '';
  return `${base}${url}?${queryString}`;
}

/**
 * Makes the HTTP request with proper URL handling
 */
async function makeRequest(instance: AxiosInstance, url: string, requestConfig: any, actualFullUrl: string): Promise<any> {
  // If URL is too long, use direct axios request with full URL
  if (actualFullUrl.length > 2000) {
    return await instance.request({
      method: 'get',
      url: actualFullUrl,
      headers: instance.defaults.headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
  } else {
    return await instance.get(url, requestConfig);
  }
}

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
    
    const requestConfig = {
      ...data,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    };
    const queryString = serializeParams(requestConfig.params);
    const actualFullUrl = buildFullUrl(instance.defaults.baseURL, url, queryString);
    const response = await makeRequest(instance, url, requestConfig, actualFullUrl);

    if (response && response.data) {
      return response.data;
    } else {
      throw Error(JSON.stringify(response));
    }
  } catch (err: any) {
    throw new Error(`${err.message || JSON.stringify(err)}`);
  }
}
