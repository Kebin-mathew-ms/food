import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { COMMON_MESSAGES } from '../utils/messages.js';

/**
 * Reusable Zod input validation middleware helper.
 * Validates request body, query, and path parameters.
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 */
export const validate = (schema) => (req, res, next) => {
  try {
    // Validate fields using Zod parse
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace req parameters with validated and typecasted data
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (error) {
    // Format Zod errors for API response
    const validationErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    const apiError = new ApiError(HTTP_STATUS.BAD_REQUEST, COMMON_MESSAGES.VALIDATION_ERROR, true);
    apiError.errors = validationErrors;

    next(apiError);
  }
};

export default validate;
