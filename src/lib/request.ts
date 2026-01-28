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
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `${url}?${queryString}`;
  }
  const base = baseURL || '';

  return `${base}${url}?${queryString}`;
}

/**
 * Safely checks if a URL points to the preview endpoint by parsing the hostname
 * This prevents substring matching vulnerabilities (e.g., evil.com/rest-preview.contentstack.com)
 */
function isPreviewEndpoint(url: string): boolean {
  try {
    // Ensure URL has a protocol for proper parsing
    let urlToParse = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlToParse = `https://${url}`;
    }
    
    const parsedUrl = new URL(urlToParse);
    // Check hostname exactly, not as substring
    return parsedUrl.hostname === 'rest-preview.contentstack.com';
  } catch {
    // If URL parsing fails, default to false for safety
    return false;
  }
}

/**
 * Makes the HTTP request with proper URL handling
 */
async function makeRequest(
  instance: AxiosInstance,
  url: string,
  requestConfig: any,
  actualFullUrl: string
): Promise<any> {
  // Determine URL length threshold based on whether it's a preview endpoint
  // rest-preview.contentstack.com has stricter limits, so use lower threshold
  const isPreview = isPreviewEndpoint(actualFullUrl);
  const urlLengthThreshold = isPreview ? 1500 : 2000;

  // If URL is too long, use direct axios request with full URL
  if (actualFullUrl.length > urlLengthThreshold) {
    // Remove params from requestConfig since they're already in actualFullUrl
    const { params, ...configWithoutParams } = requestConfig;
    return await instance.request({
      method: 'get',
      url: actualFullUrl,
      headers: instance.defaults.headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      ...configWithoutParams,
    });
  } else {
    // For URLs under threshold, use normal get with params
    // Axios will handle serialization correctly for both absolute and relative URLs
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
    if (instance.stackConfig?.live_preview) {
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
      maxBodyLength: Infinity,
    };
    const queryString = serializeParams(requestConfig.params);
    const actualFullUrl = buildFullUrl(instance.defaults.baseURL, url, queryString);
    const response = await makeRequest(instance, url, requestConfig, actualFullUrl);

    if (response?.data) {
      return response.data;
    } else {
      throw response;
    }
  } catch (err: any) {
    throw handleRequestError(err);
  }
}
