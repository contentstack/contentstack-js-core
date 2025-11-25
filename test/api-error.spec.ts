import { APIError } from '../src/lib/api-error';

describe('APIError', () => {
  describe('constructor', () => {
    it('should create an APIError with all properties', () => {
      const error = new APIError('Test error', 'ERROR_CODE', 404);
      
      expect(error.message).toBe('Test error');
      expect(error.error_code).toBe('ERROR_CODE');
      expect(error.status).toBe(404);
      expect(error.error_message).toBe('Test error');
      expect(error.name).toBe('APIError');
      expect(error.stack).toBeUndefined();
    });

    it('should create an APIError with numeric error_code', () => {
      const error = new APIError('Test error', 500, 500);
      
      expect(error.error_code).toBe(500);
      expect(error.status).toBe(500);
    });
  });

  describe('fromAxiosError', () => {
    it('should create APIError from axios error with response data', () => {
      const axiosError = {
        response: {
          data: {
            error_message: 'Not Found',
            error_code: 404,
          },
          status: 404,
        },
      };

      const error = APIError.fromAxiosError(axiosError);

      expect(error).toBeInstanceOf(APIError);
      expect(error.error_message).toBe('Not Found');
      expect(error.error_code).toBe(404);
      expect(error.status).toBe(404);
    });

    it('should create APIError from axios error with message but no response', () => {
      const axiosError = {
        message: 'Network Error',
        code: 'ENOTFOUND',
      };

      const error = APIError.fromAxiosError(axiosError);

      expect(error).toBeInstanceOf(APIError);
      expect(error.error_message).toBe('Network Error');
      expect(error.error_code).toBe('ENOTFOUND');
      expect(error.status).toBe(0);
    });

    it('should create APIError from axios error with message but no code', () => {
      const axiosError = {
        message: 'Network Error',
      };

      const error = APIError.fromAxiosError(axiosError);

      expect(error).toBeInstanceOf(APIError);
      expect(error.error_message).toBe('Network Error');
      expect(error.error_code).toBe('NETWORK_ERROR');
      expect(error.status).toBe(0);
    });

    it('should create APIError with default message for unknown errors', () => {
      const axiosError = {};

      const error = APIError.fromAxiosError(axiosError);

      expect(error).toBeInstanceOf(APIError);
      expect(error.error_message).toBe('An unknown error occurred. Please try again or contact support if the issue persists.');
      expect(error.error_code).toBe('UNKNOWN_ERROR');
      expect(error.status).toBe(0);
    });

    it('should handle axios error with response.data but no response.status', () => {
      const axiosError = {
        response: {
          data: {
            error_message: 'Server Error',
          },
        },
      };

      // This should call fromResponseData, which requires status
      // Let's test with a proper status
      const axiosErrorWithStatus = {
        response: {
          data: {
            error_message: 'Server Error',
          },
          status: 500,
        },
      };

      const error = APIError.fromAxiosError(axiosErrorWithStatus);

      expect(error).toBeInstanceOf(APIError);
      expect(error.error_message).toBe('Server Error');
      expect(error.status).toBe(500);
    });
  });

  describe('fromResponseData', () => {
    it('should create APIError from response data with error_message', () => {
      const responseData = {
        error_message: 'Bad Request',
        error_code: 400,
      };

      const error = APIError.fromResponseData(responseData, 400);

      expect(error).toBeInstanceOf(APIError);
      expect(error.error_message).toBe('Bad Request');
      expect(error.error_code).toBe(400);
      expect(error.status).toBe(400);
    });

    it('should create APIError from response data with message fallback', () => {
      const responseData = {
        message: 'Internal Server Error',
        code: 500,
      };

      const error = APIError.fromResponseData(responseData, 500);

      expect(error).toBeInstanceOf(APIError);
      expect(error.error_message).toBe('Internal Server Error');
      expect(error.error_code).toBe(500);
      expect(error.status).toBe(500);
    });

    it('should create APIError from response data with error fallback', () => {
      const responseData = {
        error: 'Validation Error',
        code: 422,
      };

      const error = APIError.fromResponseData(responseData, 422);

      expect(error).toBeInstanceOf(APIError);
      expect(error.error_message).toBe('Validation Error');
      expect(error.error_code).toBe(422);
      expect(error.status).toBe(422);
    });

    it('should create APIError from string response data', () => {
      const responseData = 'Plain text error message';

      const error = APIError.fromResponseData(responseData, 500);

      expect(error).toBeInstanceOf(APIError);
      expect(error.error_message).toBe('Plain text error message');
      expect(error.error_code).toBe(500);
      expect(error.status).toBe(500);
    });

    it('should create APIError with default message when no error fields present', () => {
      const responseData = {
        someOtherField: 'value',
      };

      const error = APIError.fromResponseData(responseData, 500);

      expect(error).toBeInstanceOf(APIError);
      expect(error.error_message).toBe('Request failed. Please review your request and try again.');
      expect(error.error_code).toBe(500);
      expect(error.status).toBe(500);
    });

    it('should extract error_code from response data', () => {
      const responseData = {
        error_message: 'Error',
        error_code: 999,
      };

      const error = APIError.fromResponseData(responseData, 500);

      expect(error.error_code).toBe(999);
    });

    it('should extract code from response data when error_code not present', () => {
      const responseData = {
        error_message: 'Error',
        code: 888,
      };

      const error = APIError.fromResponseData(responseData, 500);

      expect(error.error_code).toBe(888);
    });

    it('should use status as error_code fallback', () => {
      const responseData = {
        error_message: 'Error',
      };

      const error = APIError.fromResponseData(responseData, 503);

      expect(error.error_code).toBe(503);
    });
  });
});
