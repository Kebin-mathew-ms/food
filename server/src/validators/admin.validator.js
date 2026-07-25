import { z } from 'zod';

/**
 * Validate User status updates.
 */
export const adminUpdateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED'], {
      errorMap: () => ({ message: 'Invalid user status value.' }),
    }),
  }),
});

/**
 * Validate NGO verification approvals.
 */
export const adminUpdateNgoStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED'], {
      errorMap: () => ({ message: 'Invalid NGO status specified.' }),
    }),
    remarks: z.string().max(250, 'Remarks cannot exceed 250 characters.').optional().nullable(),
  }),
});

/**
 * Validate manual volunteer override assignments.
 */
export const adminAssignVolunteerSchema = z.object({
  body: z.object({
    volunteer_id: z.string().uuid('Volunteer ID must be a valid UUID.').nullable().optional(),
  }),
});

/**
 * Validate system configuration updates.
 */
export const adminUpdateSettingsSchema = z.object({
  body: z.object({
    application_name: z.string().min(1).optional(),
    support_email: z.string().email('Invalid support email address.').optional(),
    support_phone: z.string().optional(),
    max_image_size: z.coerce.number().gt(0).optional(),
    donation_expiry_hours: z.coerce.number().gt(0).optional(),
    volunteer_radius: z.coerce.number().gt(0).optional(),
    maintenance_mode: z.boolean().optional(),
    registration_toggle: z.boolean().optional(),
  }),
});

/**
 * Validate admin composed system notifications.
 */
export const adminCreateNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters.').max(100),
    message: z.string().min(5, 'Notification message must be at least 5 characters.').max(500),
    target: z.enum(['ALL', 'DONORS', 'NGOS', 'VOLUNTEERS', 'USER']),
    userId: z.string().uuid().optional().nullable(),
  }),
});

/**
 * Validate reports date ranges queries.
 */
export const adminExportReportSchema = z.object({
  body: z.object({
    type: z.enum(['USERS', 'DONATIONS', 'NGOS', 'VOLUNTEERS', 'DELIVERIES', 'COMPLAINTS', 'FOOD_WASTE', 'ANALYTICS']),
    startDate: z.string().min(10, 'Start date is required.'),
    endDate: z.string().min(10, 'End date is required.'),
  }),
});
