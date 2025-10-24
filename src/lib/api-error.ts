/**
 * Custom error class for API errors with optimized error handling
 */
export class APIError extends Error {
  public error_code: number | string;
  public status: number;
  public error_message: string;

  constructor(message: string, error_code: number | string, status: number) {
    super(message);
    this.name = 'APIError';
    this.error_code = error_code;
    this.status = status;
    this.error_message = message;
    
    // Remove the stack trace completely to avoid showing internal error handling
    this.stack = undefined;
  }

  /**
   * Creates an APIError from an Axios error response
   * @param err - The Axios error object
   * @returns Formatted APIError with meaningful information
   */
  static fromAxiosError(err: any): APIError {
    if (err.response?.data) {
      return APIError.fromResponseData(err.response.data, err.response.status);
    } else if (err.message) {
      // For network errors or other non-HTTP errors
      return new APIError(err.message, err.code || 'NETWORK_ERROR', 0);
    } else {
      // Fallback for unknown errors
      return new APIError('Unknown error occurred', 'UNKNOWN_ERROR', 0);
    }
  }

  /**
   * Creates an APIError from response data
   * @param responseData - The response data from the API
   * @param status - The HTTP status code
   * @returns Formatted APIError
   */
  static fromResponseData(responseData: any, status: number): APIError {
    // Extract error message with fallback chain
    const errorMessage = APIError.extractErrorMessage(responseData);
    
    // Extract error code with fallback chain
    const errorCode = APIError.extractErrorCode(responseData, status);
    
    return new APIError(errorMessage, errorCode, status);
  }

  /**
   * Extracts error message from response data with multiple fallback options
   */
  private static extractErrorMessage(responseData: any): string {
    if (responseData.error_message) return responseData.error_message;
    if (responseData.message) return responseData.message;
    if (responseData.error) return responseData.error;
    if (typeof responseData === 'string') return responseData;
    return 'Request failed';
  }

  /**
   * Extracts error code from response data with fallback to status
   */
  private static extractErrorCode(responseData: any, status: number): number | string {
    if (responseData.error_code) return responseData.error_code;
    if (responseData.code) return responseData.code;
    return status;
  }
}
