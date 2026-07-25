import adminService from '../services/admin.service.js';
import adminRepository from '../repositories/admin.repository.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { successResponse } from '../helpers/response.helper.js';

class AdminController {
  /**
   * Get dashboard summary cards stats.
   */
  async getDashboardStats(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      return successResponse(res, HTTP_STATUS.OK, 'Dashboard summary stats retrieved successfully.', stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get paginated users index.
   */
  async getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const status = req.query.status || '';
      const role = req.query.role || '';

      const data = await adminService.getUsers({ page, limit, search, status, role });
      return successResponse(res, HTTP_STATUS.OK, 'Users retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user detail metrics.
   */
  async getUserDetails(req, res, next) {
    try {
      const { id } = req.params;
      const user = await adminService.getUserDetails(id);
      return successResponse(res, HTTP_STATUS.OK, 'User details retrieved.', user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle user account status.
   */
  async updateUserStatus(req, res, next) {
    try {
      const adminUserId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;
      const updated = await adminService.updateUserStatus(id, status, adminUserId);
      return successResponse(res, HTTP_STATUS.OK, `User account status updated to: ${status}`, updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete user profile.
   */
  async deleteUser(req, res, next) {
    try {
      const adminUserId = req.user.id;
      const { id } = req.params;
      const updated = await adminService.deleteUser(id, adminUserId);
      return successResponse(res, HTTP_STATUS.OK, 'User profile soft-deleted.', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore user profile.
   */
  async restoreUser(req, res, next) {
    try {
      const adminUserId = req.user.id;
      const { id } = req.params;
      const updated = await adminService.restoreUser(id, adminUserId);
      return successResponse(res, HTTP_STATUS.OK, 'User profile restored.', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List NGOs by status.
   */
  async getNgos(req, res, next) {
    try {
      const { status } = req.query;
      const list = await adminService.getNgos({ status });
      return successResponse(res, HTTP_STATUS.OK, 'NGO list retrieved.', list);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify/reject NGO credentials.
   */
  async updateNgoStatus(req, res, next) {
    try {
      const adminUserId = req.user.id;
      const { id } = req.params;
      const { status, remarks } = req.body;
      const updated = await adminService.updateNgoStatus(id, status, remarks, adminUserId);
      return successResponse(res, HTTP_STATUS.OK, `NGO status successfully updated to: ${status}`, updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve volunteers list.
   */
  async getVolunteers(req, res, next) {
    try {
      const list = await adminService.getVolunteers();
      return successResponse(res, HTTP_STATUS.OK, 'Volunteers list retrieved.', list);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manually assign active delivery task.
   */
  async assignVolunteerManually(req, res, next) {
    try {
      const adminUserId = req.user.id;
      const { id } = req.params; // deliveryId
      const { volunteer_id } = req.body;

      const updated = await adminService.assignVolunteerManually(id, volunteer_id, adminUserId);
      return successResponse(res, HTTP_STATUS.OK, 'Volunteer manually assigned to delivery.', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch telemetry coords mapping.
   */
  async getLiveTrackingPoints(req, res, next) {
    try {
      const points = await adminRepository.getLiveTrackingPoints();
      return successResponse(res, HTTP_STATUS.OK, 'Live coordinates tracking points retrieved.', points);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complaints reports index.
   */
  async getComplaints(req, res, next) {
    try {
      const { status } = req.query;
      const list = await adminService.getComplaints({ status });
      return successResponse(res, HTTP_STATUS.OK, 'Complaints list retrieved.', list);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resolve complaint ticket.
   */
  async resolveComplaint(req, res, next) {
    try {
      const adminUserId = req.user.id;
      const { id } = req.params;
      const { status, responseText } = req.body;
      const updated = await adminService.resolveComplaint(id, status, responseText, adminUserId);
      return successResponse(res, HTTP_STATUS.OK, `Complaint status updated to: ${status}`, updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dispatch custom composed notifications.
   */
  async dispatchNotification(req, res, next) {
    try {
      const adminUserId = req.user.id;
      const counts = await adminService.dispatchNotification(req.body, adminUserId);
      return successResponse(res, HTTP_STATUS.OK, `Notifications dispatched successfully to ${counts.count} recipients.`, counts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch audit trails entries.
   */
  async getAuditLogs(req, res, next) {
    try {
      const search = req.query.search || '';
      const list = await adminService.getAuditLogs({ search });
      return successResponse(res, HTTP_STATUS.OK, 'Audit logs retrieved.', list);
    } catch (error) {
      next(error);
    }
  }
}

const adminController = new AdminController();
export default adminController;
