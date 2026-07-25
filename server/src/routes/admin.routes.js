import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';
import analyticsController from '../controllers/analytics.controller.js';
import settingsController from '../controllers/settings.controller.js';
import reportController from '../controllers/report.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate from '../validators/validate.helper.js';
import {
  adminUpdateUserStatusSchema,
  adminUpdateNgoStatusSchema,
  adminAssignVolunteerSchema,
  adminUpdateSettingsSchema,
  adminCreateNotificationSchema,
  adminExportReportSchema,
} from '../validators/admin.validator.js';

const router = Router();

// Secure all admin routes to require active session and ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Dashboard & Analytics
router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', analyticsController.getAnalytics);

// User Profile Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/status', validate(adminUpdateUserStatusSchema), adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/restore', adminController.restoreUser);

// NGO Approvals Verification
router.get('/ngos', adminController.getNgos);
router.patch('/ngos/:id/approve', validate(adminUpdateNgoStatusSchema), adminController.updateNgoStatus);

// Volunteer Managements & Manual overrides
router.get('/volunteers', adminController.getVolunteers);
router.patch('/volunteers/:id/assign', validate(adminAssignVolunteerSchema), adminController.assignVolunteerManually);

// Telemetry Location Live mappings coordinates
router.get('/live-map', adminController.getLiveTrackingPoints);

// Complaints reports resolving
router.get('/complaints', adminController.getComplaints);
router.patch('/complaints/:id', adminController.resolveComplaint);

// Composed announcements
router.post('/notifications', validate(adminCreateNotificationSchema), adminController.dispatchNotification);

// Global settings
router.get('/settings', settingsController.getSettings);
router.put('/settings', validate(adminUpdateSettingsSchema), settingsController.updateSettings);

// Reports summaries & exports logs
router.get('/reports', reportController.getReportsData);
router.post('/reports/export', validate(adminExportReportSchema), reportController.exportReport);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
