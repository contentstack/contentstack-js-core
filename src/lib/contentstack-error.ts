/* eslint-disable @cspell/spellchecker */
import { IErrorDetails } from './types';

export function error(errorResponse: {
  [key: string]: any;
  config?: Record<string, any>;
  response?: Record<string, any>;
}) {
  const config = errorResponse.config;
  const response = errorResponse.response;
  if (!config || !response) {
    const errorObj = new Error();
    Object.assign(errorObj, errorResponse);
    errorObj.message = JSON.stringify(errorResponse);
    throw errorObj;
  }
  const data: any = response.data;

  const errorDetails: IErrorDetails = {
    status: response.status,
    statusText: response.statusText,
  };

  if (config.headers && config.headers.authtoken) {
    const token = `...${config.headers.authtoken.substr(-5)}`;
    config.headers.authtoken = token;
  }

  if (config.headers && config.headers.authorization) {
    const token = `...${config.headers.authorization.substr(-5)}`;
    config.headers.authorization = token;
  }

  errorDetails.request = {
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.headers,
  };

  if (data) {
    errorDetails.errorMessage = data.error_message || data.message || '';
    errorDetails.errorCode = data.error_code || 0;
    errorDetails.errors = data.errors || {};
    errorDetails.error = data.error || '';
  }

  const errorObj: Error & IErrorDetails = new Error();
  Object.assign(errorObj, errorDetails);
  errorObj.message = JSON.stringify(errorDetails);

  return errorObj;
}
