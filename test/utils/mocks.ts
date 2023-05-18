/* eslint-disable @cspell/spellchecker */
/* eslint-disable prettier/prettier */

const mockErrorResponse = {
  config: {
    url: "https://example.com/api/v1/users",
    method: "POST",
    data: {
      name: "John Doe",
      email: "johndoe@example.com",
      password: "password123",
    },
    headers: {
      authtoken: "dummy-auth-token",
      authorization: "Bearer dummy-auth-token",
    },
  },
  response: {
    status: 400,
    statusText: "Bad Request",
    data: {
      error_code: 1234,
      error_message: "Invalid request",
      errors: {
        name: "Name is required",
        email: "Email is not valid",
      },
    },
  },
};

const mockErrorResponseNoConfigNoResponse = {
  status: 400,
  statusText: "Bad Request",
  data: {
    error_code: 1234,
    error_message: "Invalid request",
    errors: {
      name: "Name is required",
      email: "Email is not valid",
    },
  },
};

const mockErrorResponseNoData = {
  config: {
    url: "https://example.com/api/v1/users",
    method: "POST",
    data: {
      name: "John Doe",
      email: "johndoe@example.com",
      password: "password123",
    },
    headers: {
      authtoken: "dummy-auth-token",
      authorization: "Bearer dummy-auth-token",
    },
  },
  response: {
    status: 400,
    statusText: "Bad Request",
  },
};

export { mockErrorResponse, mockErrorResponseNoData, mockErrorResponseNoConfigNoResponse };
