import adminRepository from '../repositories/admin.repository.js';
import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { prisma } from '../config/database.js';
import logger from '../utils/logger.js';

class AdminService {
  /**
   * Helper logs administrative audit logs.
   */
  async logAudit(userId, action, table, recordId, oldVal = null, newVal = null) {
    try {
      await prisma.audit_logs.create({
        data: {
          user_id: userId,
          action,
          table_name: table,
          record_id: recordId,
          old_values: oldVal ? JSON.stringify(oldVal) : null,
          new_values: newVal ? JSON.stringify(newVal) : null,
        },
      });
    } catch (err) {
      logger.error('[Audit Logging Error]:', err.message);
    }
  }

  /**
   * Helper logs system notifications details.
   */
  async logNotification(userId, title, message, type = 'SYSTEM') {
    try {
      await prisma.notifications.create({
        data: {
          user_id: userId,
          title,
          message,
          type,
        },
      });
    } catch (err) {
      logger.error('[Notification Dispatch Error]:', err.message);
    }
  }

  /**
   * Fetch system metrics counts.
   */
  async getDashboardStats() {
    return adminRepository.getDashboardStats();
  }

  /**
   * Fetch users pagination.
   */
  async getUsers(params) {
    return adminRepository.findUsers(params);
  }

  /**
   * Get user details with timeline logs.
   */
  async getUserDetails(id) {
    const user = await adminRepository.findUserById(id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found.');
    }
    return user;
  }

  /**
   * Edit profile settings details.
   */
  async updateUserProfile(id, profileData, adminUserId) {
    const original = await prisma.users.findUnique({ where: { id } });
    if (!original) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found.');

    const updated = await adminRepository.updateUser(id, profileData);
    await this.logAudit(adminUserId, 'USER_PROFILE_UPDATED', 'users', id, original, updated);
    return updated;
  }

  /**
   * Suspend/activate/block user status toggle.
   */
  async updateUserStatus(id, status, adminUserId) {
    const original = await prisma.users.findUnique({ where: { id } });
    if (!original) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found.');

    const updated = await adminRepository.updateUserStatus(id, status);
    await this.logAudit(adminUserId, `USER_STATUS_${status}`, 'users', id, { status: original.status }, { status });
    await this.logNotification(id, 'Account Status Updated', `Your account status has been updated to: ${status}.`, 'INFO');
    return updated;
  }

  /**
   * Soft delete user profile.
   */
  async deleteUser(id, adminUserId) {
    const updated = await adminRepository.deleteUser(id);
    await this.logAudit(adminUserId, 'USER_DELETED', 'users', id);
    await this.logNotification(id, 'Account Suspended', 'Your account has been deactivated by administration.', 'WARNING');
    return updated;
  }

  /**
   * Restore user profile.
   */
  async restoreUser(id, adminUserId) {
    const updated = await adminRepository.restoreUser(id);
    await this.logAudit(adminUserId, 'USER_RESTORED', 'users', id);
    await this.logNotification(id, 'Account Restored', 'Your account has been restored successfully.', 'SUCCESS');
    return updated;
  }

  /**
   * Get NGOs list.
   */
  async getNgos(params) {
    return adminRepository.findNgos(params);
  }

  /**
   * Approve or reject NGO status.
   */
  async updateNgoStatus(id, status, remarks, adminUserId) {
    const ngo = await adminRepository.findNgoById(id);
    if (!ngo) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'NGO profile not found.');
    }

    const verified = status === 'VERIFIED';
    const updated = await adminRepository.updateNgoStatus(id, status, verified);

    // Notify organization
    const title = verified ? 'NGO Verification Approved' : 'NGO Verification Rejected';
    const message = verified
      ? 'Congratulations! Your NGO registration status is verified. You can now browse nearby donations.'
      : `Your NGO registration request was rejected. Remarks: ${remarks || 'None provided.'}`;
    const type = verified ? 'SUCCESS' : 'WARNING';

    await this.logNotification(ngo.user_id, title, message, type);
    await this.logAudit(adminUserId, `NGO_STATUS_${status}`, 'ngos', id, { status: ngo.status }, { status, remarks });

    return updated;
  }

  /**
   * Get volunteers list.
   */
  async getVolunteers() {
    return adminRepository.findVolunteers();
  }

  /**
   * Manually assign active delivery to specific volunteer.
   */
  async assignVolunteerManually(deliveryId, volunteerId, adminUserId) {
    const delivery = await prisma.deliveries.findUnique({
      where: { id: deliveryId },
      include: {
        donation_request: {
          include: {
            donation: true,
            ngo: true,
          },
        },
      },
    });
    if (!delivery) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Delivery not found.');
    }

    const volunteer = await prisma.volunteers.findUnique({
      where: { id: volunteerId },
      include: { user: true },
    });
    if (!volunteer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer not found.');
    }

    // Set volunteer id and mark accepted/assigned
    const updated = await prisma.deliveries.update({
      where: { id: deliveryId },
      data: {
        volunteer_id: volunteerId,
        delivery_status: 'ACCEPTED',
        updated_at: new Date(),
      },
    });

    // Mark volunteer busy status
    await prisma.volunteers.update({
      where: { id: volunteerId },
      data: { online_status: 'BUSY' },
    });

    // Notify volunteer
    await this.logNotification(
      volunteer.user_id,
      'New Delivery Assigned',
      `You have been manually assigned to distribute food listing: ${delivery.donation_request?.donation?.food_name}.`,
      'INFO'
    );

    await this.logAudit(adminUserId, 'DELIVERY_MANUALLY_ASSIGNED', 'deliveries', deliveryId, { volunteerId });

    return updated;
  }

  /**
   * Get complaints reports list.
   */
  async getComplaints(params) {
    return adminRepository.findComplaints(params);
  }

  /**
   * Reply and resolve complaint tickets.
   */
  async resolveComplaint(id, status, responseText, adminUserId) {
    const complaint = await prisma.complaints.findUnique({ where: { id } });
    if (!complaint) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Complaint not found.');
    }

    const updated = await adminRepository.updateComplaint(id, status, responseText);
    await this.logNotification(
      complaint.user_id,
      'Complaint Ticket Response',
      `Your complaint ticket subject: "${complaint.subject}" status is updated to: ${status}. Response: ${responseText}`,
      'INFO'
    );

    await this.logAudit(adminUserId, `COMPLAINT_${status}`, 'complaints', id, { status: complaint.status }, { status, responseText });

    return updated;
  }

  /**
   * Broadcast custom system notification to targeted roles or users.
   */
  async dispatchNotification(data, adminUserId) {
    const { title, message, target, userId } = data;

    let targetUsers = [];
    if (target === 'ALL') {
      targetUsers = await prisma.users.findMany({ where: { deleted_at: null }, select: { id: true } });
    } else if (target === 'DONORS') {
      targetUsers = await prisma.users.findMany({ where: { role: 'DONOR', deleted_at: null }, select: { id: true } });
    } else if (target === 'NGOS') {
      targetUsers = await prisma.users.findMany({ where: { role: 'NGO', deleted_at: null }, select: { id: true } });
    } else if (target === 'VOLUNTEERS') {
      targetUsers = await prisma.users.findMany({ where: { role: 'VOLUNTEER', deleted_at: null }, select: { id: true } });
    } else if (target === 'USER' && userId) {
      targetUsers = [{ id: userId }];
    }

    const promises = targetUsers.map((u) => this.logNotification(u.id, title, message, 'SYSTEM'));
    await Promise.all(promises);

    await this.logAudit(adminUserId, 'NOTIFICATION_DISPATCHED', 'notifications', 'GLOBAL', { target, title });
    return { count: targetUsers.length };
  }

  /**
   * Fetch active audit logs logs.
   */
  async getAuditLogs(params) {
    return adminRepository.findAuditLogs(params);
  }
}

const adminService = new AdminService();
export default adminService;
