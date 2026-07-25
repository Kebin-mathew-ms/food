/**
 * Standardized application-specific business error and response codes.
 * Useful for frontend application handling custom logic for specific states.
 */
export const RESPONSE_CODES = {
  // Authentication Codes
  AUTH001: 'AUTH_TOKEN_EXPIRED',
  AUTH002: 'AUTH_INVALID_CREDENTIALS',
  AUTH003: 'AUTH_UNAUTHORIZED_ROLE',

  // Validation Codes
  VAL001: 'VALIDATION_FIELD_REQUIRED',
  VAL002: 'VALIDATION_INVALID_FORMAT',

  // Resource/Database Codes
  DB001: 'DB_RECORD_NOT_FOUND',
  DB002: 'DB_RECORD_ALREADY_EXISTS',
  DB003: 'DB_CONNECTION_FAILURE',

  // General System Codes
  SYS001: 'SYSTEM_UNKNOWN_ERROR',
  SYS002: 'SYSTEM_EXTERNAL_API_FAILURE',
};

export default RESPONSE_CODES;
