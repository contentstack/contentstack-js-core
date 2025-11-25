import { AxiosInstance } from './types';
import { serialize } from './param-serializer';
import { APIError } from './api-error';
import { ERROR_MESSAGES } from './error-messages';

/**
 * Handles array parameters properly with & separators
 * React Native compatible implementation without URLSearchParams.set()
 */
function serializeParams(params: any): string {
  if (!params) return '';
  return serialize(params);
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

/**
 * Handles and formats errors from Axios requests
 * @param err - The error object from Axios
 * @returns Formatted error object with meaningful information
 */
function handleRequestError(err: any): Error {
  return APIError.fromAxiosError(err);
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
            throw new Error(ERROR_MESSAGES.REQUEST.HOST_REQUIRED_FOR_LIVE_PREVIEW);
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
      throw response;
    }
  } catch (err: any) {
    throw handleRequestError(err);
  }
}
