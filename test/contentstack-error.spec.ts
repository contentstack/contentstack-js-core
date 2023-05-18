/* eslint-disable prettier/prettier */
import { error } from '../src/lib/contentstack-error';
import { mockErrorResponse, mockErrorResponseNoData, mockErrorResponseNoConfigNoResponse } from './utils/mocks';

describe('Contentstack Error', () => {
  it('should throw an error with proper details', () => {
    expect(() => error(mockErrorResponse)).toThrow(Error);

    try {
      error(mockErrorResponse);
    } catch (e: any) {
      const errorDetails = JSON.parse(e.message);

      expect(errorDetails.status).toBe(400);
      expect(errorDetails.statusText).toBe('Bad Request');
      expect(errorDetails.errorMessage).toBe('Invalid request');
      expect(errorDetails.errorCode).toBe(1234);
      expect(errorDetails.errors).toEqual({
        name: 'Name is required',
        email: 'Email is not valid',
      });
      expect(errorDetails.error).toBe('');
      expect(errorDetails.request).toEqual({
        url: 'https://example.com/api/v1/users',
        method: 'POST',
        data: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password123',
        },
        headers: {
          authtoken: '...token',
          authorization: '...token',
        },
      });
    }
  });

  it('should throw an error with a default message if response or config is not present', () => {
    expect(() => error(mockErrorResponseNoConfigNoResponse)).toThrow(Error);

    try {
      error(mockErrorResponseNoConfigNoResponse);
    } catch (e: any) {
      const errorDetails = JSON.parse(e.message);

      expect(errorDetails.status).toBe(400);
      expect(errorDetails.statusText).toBe('Bad Request');
      expect(errorDetails.errorMessage).toBeUndefined();
      expect(errorDetails.errorCode).toBeUndefined();
      expect(errorDetails.errors).toBeUndefined();
      expect(errorDetails.error).toBeUndefined();
      expect(errorDetails.request).toBeUndefined();
    }
  });

  it('should throw an error with proper details when response.data is not available', () => {
    expect(() => error(mockErrorResponseNoData)).toThrow(Error);

    try {
      error(mockErrorResponseNoData);
    } catch (e: any) {
      const errorDetails = JSON.parse(e.message);

      expect(errorDetails.status).toBe(400);
      expect(errorDetails.statusText).toBe("Bad Request");
      expect(errorDetails.errorMessage).toBeUndefined();
      expect(errorDetails.errorCode).toBeUndefined();
      expect(errorDetails.errors).toBeUndefined();
      expect(errorDetails.error).toBeUndefined();
      expect(errorDetails.request).toEqual({
        url: "https://example.com/api/v1/users",
        method: "POST",
        data: {
          name: "John Doe",
          email: "johndoe@example.com",
          password: "password123",
        },
        headers: {
          authtoken: "...token",
          authorization: "...token",
        },
      });
    }
  });
});
