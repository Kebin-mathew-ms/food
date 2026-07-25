/**
 * Utility functions for sending standard JSON API responses.
 */

/**
 * Send a success API response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message description
 * @param {any} [data=null] - Payload content
 * @param {any} [meta=null] - Pagination or metadata
 */
export const successResponse = (
  res,
  statusCode = 200,
  message = 'Success',
  data = null,
  meta = null
) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Send an error API response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error explanation
 * @param {any} [errors=null] - Detailed validation errors or validation array
 */
export const errorResponse = (res, statusCode = 500, message = 'Error', errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};
