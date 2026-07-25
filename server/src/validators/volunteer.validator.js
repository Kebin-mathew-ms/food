import { z } from 'zod';
import { PHONE_REGEX } from '../utils/regex.js';

/**
 * Validate Volunteer Profile payload.
 */
export const updateVolunteerProfileSchema = z.object({
  body: z.object({
    vehicle_type: z.enum(['Bike', 'Scooter', 'Car', 'Van', 'Truck', 'Bicycle', 'Walking'], {
      errorMap: () => ({ message: 'Invalid vehicle type specified.' }),
    }),
    vehicle_number: z.string().min(1, 'Vehicle number is required.').optional().nullable(),
    driving_license_number: z.string().min(1, 'Driving license number is required.').optional().nullable(),
    phone: z.string().regex(PHONE_REGEX, 'Phone must match standard formats (e.g. +15550100).').or(z.string().length(0)).optional().nullable(),
    emergency_contact: z.string().regex(PHONE_REGEX, 'Emergency contact must match standard formats.').or(z.string().length(0)).optional().nullable(),
    operating_radius: z.number().gt(0, 'Operating radius must be greater than 0 KM.').optional().nullable(),
    current_address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
  }),
});

/**
 * Validate Online status toggle.
 */
export const updateVolunteerStatusSchema = z.object({
  body: z.object({
    online_status: z.enum(['ONLINE', 'OFFLINE', 'BUSY', 'BREAK'], {
      errorMap: () => ({ message: 'Invalid online status value.' }),
    }),
  }),
});

/**
 * Validate Coordinates update telemetry.
 */
export const updateLocationSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90.'),
    longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180.'),
  }),
});

/**
 * Validate pickup proof details.
 */
export const pickupProofSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    photoUrl: z.string().min(5, 'Pickup proof image is required.'),
    qr_code: z.string().optional().nullable(),
  }),
});

/**
 * Validate delivery completion details.
 */
export const completeDeliverySchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    delivery_notes: z.string().max(500, 'Delivery notes cannot exceed 500 characters.').optional().nullable(),
    photoUrl: z.string().min(5, 'Delivery proof image is required.'),
    signatureUrl: z.string().min(5, 'Recipient signature is required.'),
  }),
});
