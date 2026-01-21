/**
 * Centralized Error Messages
 * 
 * This file contains all error messages used throughout the contentstack-js-core SDK.
 * Centralizing error messages makes them easier to maintain, review, and localize.
 */

export const ERROR_MESSAGES = {
  // Console Logging Messages
  CONSOLE: {
    ERROR_WITH_TITLE: (title: string) => `Error: ${title}. Review the error details and try again.`,
    LEVEL_WITH_DATA: (level: string, data: any) => `${level}: ${data}. Review the details and try again.`,
  },

  // API Error Messages
  API: {
    NETWORK_ERROR: 'Network error occurred. Please check your internet connection and try again.',
    UNKNOWN_ERROR: 'An unknown error occurred. Please try again or contact support if the issue persists.',
    REQUEST_FAILED: (status?: number) => 
      status 
        ? `Request failed with status ${status}. Please review your request and try again.`
        : 'Request failed. Please review your request and try again.',
  },

  // Request Handler Messages
  REQUEST: {
    HOST_REQUIRED_FOR_LIVE_PREVIEW: 'Host is required for live preview. Please provide a valid host parameter in the live_preview configuration.',
    URL_TOO_LONG: (urlLength: number, maxLength: number) => 
      `Request URL length (${urlLength} characters) exceeds the maximum allowed length (${maxLength} characters). ` +
      'Please reduce the number of includeReference parameters or split your request into multiple smaller requests.',
  },

  // Retry Policy Messages
  RETRY: {
    TIMEOUT_EXCEEDED: (timeout: number) => 
      `Request timeout of ${timeout}ms exceeded. Please try again or increase the timeout value in your configuration.`,
  },

  // Error Codes
  ERROR_CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    TIMEOUT: 408,
  },
} as const;

