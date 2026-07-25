/**
 * Reusable regular expressions for data validation and formatting.
 */

// Basic email validator regex (matches standard email formats)
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password requires at least 8 characters, one uppercase, one lowercase, one number, and one special character
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Standard phone format (supports national and international syntax)
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// Standard MySQL date/time format YYYY-MM-DD
export const DATE_YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  PHONE_REGEX,
  DATE_YYYY_MM_DD_REGEX,
};
