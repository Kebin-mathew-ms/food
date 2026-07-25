import { z } from 'zod';
import { PASSWORD_REGEX, EMAIL_REGEX, PHONE_REGEX } from '../utils/regex.js';

// Password error message matching policy
const passwordPolicyMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';

/**
 * Validator schema for User Registration.
 */
export const registerSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Full name must contain at least 2 characters.'),
    email: z.string().regex(EMAIL_REGEX, 'Please enter a valid email address.'),
    phone: z.preprocess(
      (val) => (typeof val === 'string' ? val.replace(/[\s-]/g, '') : val),
      z.string().regex(PHONE_REGEX, 'Please enter a valid phone number (E.164 format).')
    ),
    password: z.string().regex(PASSWORD_REGEX, passwordPolicyMessage),
    confirm_password: z.string(),
    role: z.enum(['ADMIN', 'DONOR', 'NGO', 'VOLUNTEER'], {
      errorMap: () => ({ message: 'Invalid role selection.' }),
    }),
    address: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), z.string().min(3, 'Address must contain at least 3 characters.').optional()),
    city: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), z.string().min(2, 'City must contain at least 2 characters.').optional()),
    state: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), z.string().min(2, 'State must contain at least 2 characters.').optional()),
    country: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), z.string().min(2, 'Country must contain at least 2 characters.').optional()),
    latitude: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), z.number().min(-90).max(90).optional()),
    longitude: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), z.number().min(-180).max(180).optional()),
  }).refine((data) => data.password === data.confirm_password, {
    message: 'Password confirmation does not match password.',
    path: ['confirm_password'],
  }),
});

/**
 * Validator schema for User Login.
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().regex(EMAIL_REGEX, 'Please enter a valid email address.'),
    password: z.string().min(1, 'Password is required.'),
  }),
});

/**
 * Validator schema for Forgot Password triggers.
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().regex(EMAIL_REGEX, 'Please enter a valid email address.'),
  }),
});

/**
 * Validator schema for Resetting Passwords with tokens.
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required.'),
    password: z.string().regex(PASSWORD_REGEX, passwordPolicyMessage),
    confirm_password: z.string(),
  }).refine((data) => data.password === data.confirm_password, {
    message: 'Password confirmation does not match password.',
    path: ['confirm_password'],
  }),
});

/**
 * Validator schema for Password Changes.
 */
export const changePasswordSchema = z.object({
  body: z.object({
    current_password: z.string().min(1, 'Current password is required.'),
    new_password: z.string().regex(PASSWORD_REGEX, passwordPolicyMessage),
    confirm_password: z.string(),
  }).refine((data) => data.new_password === data.confirm_password, {
    message: 'Password confirmation does not match new password.',
    path: ['confirm_password'],
  }).refine((data) => data.current_password !== data.new_password, {
    message: 'New password cannot be identical to current password.',
    path: ['new_password'],
  }),
});

/**
 * Validator schema for Profile Updates.
 */
export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Full name must contain at least 2 characters.').optional(),
    phone: z.preprocess(
      (val) => (typeof val === 'string' ? val.replace(/[\s-]/g, '') : val),
      z.string().regex(PHONE_REGEX, 'Please enter a valid phone number.').optional()
    ),
    address: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), z.string().min(3, 'Address must contain at least 3 characters.').optional()),
    city: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), z.string().min(2, 'City must contain at least 2 characters.').optional()),
    state: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), z.string().min(2, 'State must contain at least 2 characters.').optional()),
    country: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), z.string().min(2, 'Country must contain at least 2 characters.').optional()),
    latitude: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), z.number().min(-90).max(90).optional()),
    longitude: z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : Number(val)), z.number().min(-180).max(180).optional()),
  }),
});

export default {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
};
