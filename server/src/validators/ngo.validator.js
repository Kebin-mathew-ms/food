import { z } from 'zod';
import { PHONE_REGEX } from '../utils/regex.js';

/**
 * Validate NGO profile details schema.
 */
export const upsertProfileSchema = z.object({
  body: z.object({
    organization_name: z
      .string({ required_error: 'Organization Name is required.' })
      .min(1, 'Organization Name is required.'),
    registration_number: z
      .string({ required_error: 'Registration Number is required.' })
      .min(1, 'Registration Number is required.'),
    license_number: z.string().optional().nullable(),
    organization_type: z.enum(
      [
        'NGO',
        'Charity',
        'Food Bank',
        'Shelter',
        'Old Age Home',
        'Orphanage',
        'Religious Organization',
        'Government Organization',
        'Community Kitchen',
        'Disaster Relief',
        'Other',
      ],
      { invalid_type_error: 'Invalid organization type specified.' }
    ).optional().nullable(),
    description: z.string().optional().nullable(),
    website: z.string().url('Website must be a valid URL.').or(z.string().length(0)).optional().nullable(),
    email: z.string().email('Organization email must be valid.').or(z.string().length(0)).optional().nullable(),
    phone: z.string().regex(PHONE_REGEX, 'Phone must match standard formats (e.g. +15550100).').or(z.string().length(0)).optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    operating_radius: z.number().gt(0, 'Operating radius must be greater than 0 KM.').optional().nullable(),
    working_days: z.string().optional().nullable(),
    working_hours: z.string().optional().nullable(),
    emergency_contact: z.string().optional().nullable(),
  }),
});

/**
 * Validate Donation claim request parameters schema.
 */
export const createRequestSchema = z.object({
  body: z.object({
    donation_id: z.string({ required_error: 'Donation ID is required.' }).uuid('Invalid donation ID format.'),
    remarks: z.string().max(500, 'Remarks cannot exceed 500 characters.').optional().nullable(),
    expected_pickup_time: z.string().min(1, 'Expected pickup time is required.').refine((val) => !isNaN(Date.parse(val)), {
      message: 'Expected pickup time must be a valid date/time string.',
    }),
    estimated_arrival_time: z.string().min(1, 'Estimated arrival time is required.').refine((val) => !isNaN(Date.parse(val)), {
      message: 'Estimated arrival time must be a valid date/time string.',
    }),
    special_requirements: z.string().optional().nullable(),
  }).refine(
    (data) => new Date(data.estimated_arrival_time) > new Date(data.expected_pickup_time),
    {
      message: 'Estimated arrival time must be after the expected pickup time.',
      path: ['estimated_arrival_time'],
    }
  ),
});
