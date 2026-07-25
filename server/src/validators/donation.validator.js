import { z } from 'zod';
import { PHONE_REGEX } from '../utils/regex.js';

// Base donation inputs validation
const donationBodySchema = z.object({
  food_name: z.string().min(1, 'Food Name is required.'),
  food_category: z.enum([
    'Cooked Food',
    'Raw Food',
    'Packed Food',
    'Bakery',
    'Fruits',
    'Vegetables',
    'Dairy',
    'Beverages',
    'Snacks',
    'Desserts',
    'Other',
  ], {
    errorMap: () => ({ message: 'Invalid food category selection.' }),
  }),
  food_type: z.enum(['VEG', 'NON_VEG', 'VEGAN', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid food type selection.' }),
  }),
  description: z.string().min(1, 'Description is required.'),
  quantity: z.number().gt(0, 'Quantity must be greater than 0.'),
  quantity_unit: z.string().min(1, 'Quantity unit is required.'),
  number_of_people: z.number().int().nonnegative().optional().nullable(),
  prepared_at: z.string().datetime('Prepared time must be a valid ISO Date string.'),
  expiry_time: z.string().datetime('Expiry time must be a valid ISO Date string.'),
  pickup_time: z.string().datetime('Pickup time must be a valid ISO Date string.'),
  pickup_address: z.string().min(3, 'Pickup address is required.'),
  pickup_city: z.string().min(2, 'City is required.').optional().nullable(),
  pickup_state: z.string().min(2, 'State is required.').optional().nullable(),
  pickup_country: z.string().min(2, 'Country is required.').optional().nullable(),
  postal_code: z.string().optional().nullable(),
  pickup_latitude: z.number().min(-90).max(90).optional().nullable(),
  pickup_longitude: z.number().min(-180).max(180).optional().nullable(),
  special_instructions: z.string().optional().nullable(),
  pickup_contact_name: z.string().optional().nullable(),
  pickup_contact_phone: z.string().regex(PHONE_REGEX, 'Invalid phone number format.').optional().nullable(),
  max_pickup_delay: z.number().int().nonnegative().optional().nullable(),
});

/**
 * Validation schema for Creating Food Donations.
 */
export const createDonationSchema = z.object({
  body: donationBodySchema.refine(
    (data) => {
      const prep = new Date(data.prepared_at);
      const exp = new Date(data.expiry_time);
      return exp > prep;
    },
    {
      message: 'Expiry time must be after food prepared time.',
      path: ['expiry_time'],
    }
  ).refine(
    (data) => {
      const pick = new Date(data.pickup_time);
      const exp = new Date(data.expiry_time);
      return pick < exp;
    },
    {
      message: 'Pickup time must be scheduled before food expiry time.',
      path: ['pickup_time'],
    }
  ),
});

/**
 * Validation schema for Updating Food Donations.
 */
export const updateDonationSchema = createDonationSchema;

/**
 * Validation schema for Donation queries (Search/Filtering/Sorting/Pagination).
 */
export const queryDonationSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    selfOnly: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    expiryToday: z.preprocess((val) => val === 'true', z.boolean().optional()),
    expired: z.preprocess((val) => val === 'true', z.boolean().optional()),
    availableOnly: z.preprocess((val) => val === 'true', z.boolean().optional()),
    city: z.string().optional(),
    state: z.string().optional(),
    sort: z.enum(['created_at', 'expiry', 'quantity', 'status']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    page: z.preprocess((val) => Number(val) || 1, z.number().int().positive().optional()),
    limit: z.preprocess((val) => Number(val) || 10, z.number().int().positive().optional()),
  }),
});

export default {
  createDonationSchema,
  updateDonationSchema,
  queryDonationSchema,
};
