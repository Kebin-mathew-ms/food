/**
 * Centralized human-readable feedback messages.
 */

export const AUTH_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  TOKEN_INVALID: 'Access token is invalid or has expired.',
  TOKEN_MISSING: 'Access token is missing from authorization header.',
};

export const COMMON_MESSAGES = {
  SUCCESS: 'Operation completed successfully.',
  SERVER_ERROR: 'An unexpected internal server error occurred.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Input validation failed. Please check parameters.',
  FILE_UPLOAD_SUCCESS: 'File uploaded successfully.',
  FILE_UPLOAD_ERROR: 'Failed to upload file.',
  INVALID_PAYLOAD: 'Payload body is malformed or invalid.',
};

export default {
  AUTH_MESSAGES,
  COMMON_MESSAGES,
};
