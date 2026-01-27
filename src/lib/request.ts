import { AxiosInstance } from './types';
import { serialize } from './param-serializer';
import { APIError } from './api-error';
import { ERROR_MESSAGES } from './error-messages';

/**
 * Handles array parameters properly with & separators
 * React Native compatible implementation without URLSearchParams.set()
 */
function serializeParams(params: any, useCompactFormat = false): string {
  if (!params) return '';

  return serialize(params, { useCompactFormat } as any);
}

/**
 * Estimates the URL length that would be generated from the given parameters
 * @param baseURL - The base URL
 * @param url - The endpoint URL
 * @param params - The query parameters
 * @param useCompactFormat - Whether to use compact format for estimation
 * @returns Estimated URL length
 */
function estimateUrlLength(baseURL: string | undefined, url: string, params: any, useCompactFormat = false): number {
  if (!params) {
    const base = baseURL || '';

    return (url.startsWith('http://') || url.startsWith('https://') ? url : `${base}${url}`).length;
  }

  const queryString = serializeParams(params, useCompactFormat);
  const base = baseURL || '';
  const fullUrl =
    url.startsWith('http://') || url.startsWith('https://') ? `${url}?${queryString}` : `${base}${url}?${queryString}`;

  return fullUrl.length;
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
 * Makes the HTTP request with proper URL handling
 */
async function makeRequest(
  instance: AxiosInstance,
  url: string,
  requestConfig: any,
  actualFullUrl: string
): Promise<any> {
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
    let isLivePreview = false;
    let livePreviewUrl = url;

    if (!data) {
      data = {};
    }

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
          livePreviewUrl =
            (livePreviewParams.host.startsWith('https://') ? '' : 'https://') + livePreviewParams.host + url;
          isLivePreview = true;
        }
      }
    }

    const requestConfig = {
      ...data,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    } as any;

    // Determine URL length thresholds
    // Use lower threshold for Live Preview (1500) vs regular requests (2000)
    const maxUrlLength = isLivePreview ? 1500 : 2000;
    const baseURLForEstimation = isLivePreview ? undefined : instance.defaults.baseURL;
    const urlForEstimation = isLivePreview ? livePreviewUrl : url;

    // Estimate URL length with standard format
    const estimatedLength = estimateUrlLength(baseURLForEstimation, urlForEstimation, requestConfig.params, false);
    let useCompactFormat = false;

    // If URL would exceed threshold, try compact format
    if (estimatedLength > maxUrlLength) {
      const compactEstimatedLength = estimateUrlLength(
        baseURLForEstimation,
        urlForEstimation,
        requestConfig.params,
        true
      );
      if (compactEstimatedLength <= maxUrlLength) {
        useCompactFormat = true;
      } else {
        // Even with compact format, URL is too long
        throw new Error(ERROR_MESSAGES.REQUEST.URL_TOO_LONG(compactEstimatedLength, maxUrlLength));
      }
    }

    const queryString = serializeParams(requestConfig.params, useCompactFormat);
    const actualFullUrl = buildFullUrl(
      isLivePreview ? undefined : instance.defaults.baseURL,
      isLivePreview ? livePreviewUrl : url,
      queryString
    );
    const response = await makeRequest(instance, isLivePreview ? livePreviewUrl : url, requestConfig, actualFullUrl);

    if (response && response.data) {
      return response.data;
    } else {
      throw response;
    }
  } catch (err: any) {
    throw handleRequestError(err);
  }
}
